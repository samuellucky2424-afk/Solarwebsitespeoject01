import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendDealerVerificationEmail } from "../_shared/dealer-verification-email.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!anonKey) throw new Error("SUPABASE_ANON_KEY not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

const VALID_REVIEW_STATUSES = new Set(["approved", "rejected"]);
const VALID_DEALER_ROLES = new Set(["installer", "retailer"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanText(value: unknown, maxLength = 1000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const text = cleanText(value, 500);
    if (text) return text;
  }
  return "";
}

async function requireAdmin(authHeader: string | null) {
  if (!authHeader) throw new Error("missing_auth");

  const supabaseUserClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: authData, error: authErr } = await supabaseUserClient.auth.getUser();
  if (authErr || !authData?.user) throw new Error("unauthorized");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, suspended")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.suspended) {
    throw new Error("forbidden");
  }

  return authData.user.id;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const reviewerId = await requireAdmin(req.headers.get("Authorization"));
    const body = await req.json();
    const requestId = cleanText(body?.request_id || body?.id, 80);
    const nextStatus = cleanText(body?.status, 20) as "approved" | "rejected";
    const adminNote = cleanText(body?.admin_note, 2000) || null;

    if (!requestId) {
      return jsonResponse({ error: "request_id is required" }, 400);
    }

    if (!VALID_REVIEW_STATUSES.has(nextStatus)) {
      return jsonResponse({ error: "status must be approved or rejected" }, 400);
    }

    const { data: request, error: requestLookupError } = await supabaseAdmin
      .from("role_verification_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (requestLookupError) throw requestLookupError;
    if (!request) return jsonResponse({ error: "Verification request not found" }, 404);
    if (!VALID_DEALER_ROLES.has(request.role_requested)) {
      return jsonResponse({ error: "Invalid requested dealer role" }, 400);
    }

    const [
      profileRes,
      authUserRes,
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone, address, role, metadata")
        .eq("id", request.user_id)
        .maybeSingle(),
      supabaseAdmin.auth.admin.getUserById(request.user_id),
    ]);

    if (profileRes.error) throw profileRes.error;

    const profile = profileRes.data || {};
    const authUser = authUserRes.data?.user || null;
    const authMeta = authUser?.user_metadata || {};
    const requestMeta = request.applicant_metadata || {};
    const profileMeta = profile.metadata || {};

    const applicantName = firstNonEmpty(
      request.applicant_full_name,
      requestMeta.full_name,
      profile.full_name,
      profileMeta.full_name,
      authMeta.full_name,
    );
    const applicantEmail = firstNonEmpty(
      request.applicant_email,
      requestMeta.email,
      profile.email,
      profileMeta.email,
      authUser?.email,
      authMeta.email,
    );
    const applicantPhone = firstNonEmpty(request.applicant_phone, requestMeta.phone, profile.phone, profileMeta.phone, authMeta.phone);
    const applicantAddress = firstNonEmpty(request.applicant_address, requestMeta.address, profile.address, profileMeta.address, authMeta.address);
    const nextMetadata = {
      ...profileMeta,
      ...requestMeta,
      full_name: applicantName || profile.full_name,
      email: applicantEmail || profile.email,
      phone: applicantPhone || profile.phone,
      address: applicantAddress || profile.address,
      business_name: request.business_name,
      business_address: request.business_address,
      role_requested: request.role_requested,
      verification_status: nextStatus,
      dealer_verification_request_id: request.id,
    };

    const { data: updatedRequest, error: requestUpdateError } = await supabaseAdmin
      .from("role_verification_requests")
      .update({
        status: nextStatus,
        admin_note: adminNote,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        applicant_full_name: applicantName || request.applicant_full_name,
        applicant_email: applicantEmail || request.applicant_email,
        applicant_phone: applicantPhone || request.applicant_phone,
        applicant_address: applicantAddress || request.applicant_address,
        applicant_metadata: nextMetadata,
      })
      .eq("id", request.id)
      .select("*")
      .single();

    if (requestUpdateError) throw requestUpdateError;

    const profilePatch: Record<string, unknown> = {
      role: nextStatus === "approved" ? request.role_requested : (profile.role || "user"),
      metadata: nextMetadata,
    };
    if (applicantName) profilePatch.full_name = applicantName;
    if (applicantEmail) profilePatch.email = applicantEmail;
    if (applicantPhone) profilePatch.phone = applicantPhone;
    if (applicantAddress) profilePatch.address = applicantAddress;

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(profilePatch)
      .eq("id", request.user_id);

    if (profileUpdateError) throw profileUpdateError;

    const emailResult = await sendDealerVerificationEmail({
      to: applicantEmail,
      applicantName,
      roleRequested: request.role_requested,
      businessName: request.business_name,
      status: nextStatus,
      adminNote,
    });

    return jsonResponse({
      ok: true,
      request: updatedRequest,
      email: emailResult,
    });
  } catch (err) {
    const msg = String((err as any)?.message || err);
    let status = 500;

    if (msg === "missing_auth" || msg === "unauthorized") {
      status = 401;
    } else if (msg === "forbidden") {
      status = 403;
    }

    if (status === 500) {
      console.error("admin-review-dealer-verification exception", err);
    }

    return jsonResponse({ error: msg }, status);
  }
});
