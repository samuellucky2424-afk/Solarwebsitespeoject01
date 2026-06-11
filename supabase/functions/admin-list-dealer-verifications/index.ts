import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!anonKey) throw new Error("SUPABASE_ANON_KEY not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

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

function cleanText(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
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
}

function buildApplicantSnapshot(request: any, profile: any, authUser: any) {
  const authMeta = authUser?.raw_user_meta_data || {};
  const requestMeta = request?.applicant_metadata || {};
  const profileMeta = profile?.metadata || {};

  const fullName = cleanText(request?.applicant_full_name)
    || cleanText(requestMeta.full_name)
    || cleanText(profile?.full_name)
    || cleanText(profileMeta.full_name)
    || cleanText(authMeta.full_name)
    || cleanText(authUser?.user_metadata?.full_name);

  const email = cleanText(request?.applicant_email)
    || cleanText(requestMeta.email)
    || cleanText(profile?.email)
    || cleanText(profileMeta.email)
    || cleanText(authUser?.email)
    || cleanText(authMeta.email);

  const phone = cleanText(request?.applicant_phone)
    || cleanText(requestMeta.phone)
    || cleanText(profile?.phone)
    || cleanText(profileMeta.phone)
    || cleanText(authMeta.phone);

  const address = cleanText(request?.applicant_address)
    || cleanText(requestMeta.address)
    || cleanText(profile?.address)
    || cleanText(profileMeta.address)
    || cleanText(authMeta.address);

  return {
    full_name: fullName,
    email,
    phone,
    address,
    metadata: {
      ...profileMeta,
      ...authMeta,
      ...requestMeta,
      full_name: fullName,
      email,
      phone,
      address,
    },
  };
}

async function backfillApplicantDetails(request: any, profile: any, applicant: any) {
  const requestPatch: Record<string, unknown> = {};

  if (!request.applicant_full_name && applicant.full_name) requestPatch.applicant_full_name = applicant.full_name;
  if (!request.applicant_email && applicant.email) requestPatch.applicant_email = applicant.email;
  if (!request.applicant_phone && applicant.phone) requestPatch.applicant_phone = applicant.phone;
  if (!request.applicant_address && applicant.address) requestPatch.applicant_address = applicant.address;

  requestPatch.applicant_metadata = {
    ...(request.applicant_metadata || {}),
    ...applicant.metadata,
  };

  if (Object.keys(requestPatch).length > 1) {
    await supabaseAdmin
      .from("role_verification_requests")
      .update(requestPatch)
      .eq("id", request.id);
  }

  if (profile?.id) {
    const profilePatch: Record<string, unknown> = {};
    if (!profile.full_name && applicant.full_name) profilePatch.full_name = applicant.full_name;
    if (!profile.email && applicant.email) profilePatch.email = applicant.email;
    if (!profile.phone && applicant.phone) profilePatch.phone = applicant.phone;
    if (!profile.address && applicant.address) profilePatch.address = applicant.address;

    if (Object.keys(profilePatch).length > 0) {
      profilePatch.metadata = {
        ...(profile.metadata || {}),
        ...applicant.metadata,
      };

      await supabaseAdmin
        .from("profiles")
        .update(profilePatch)
        .eq("id", profile.id);
    }
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    await requireAdmin(req.headers.get("Authorization"));

    const { data: requests, error: requestsError } = await supabaseAdmin
      .from("role_verification_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestsError) throw requestsError;

    const userIds = Array.from(new Set((requests || []).map((request: any) => request.user_id).filter(Boolean)));
    const { data: profiles, error: profilesError } = userIds.length > 0
      ? await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone, address, role, created_at, metadata, suspended, failed_login_attempts, suspended_at, suspension_reason")
        .in("id", userIds)
      : { data: [], error: null };

    if (profilesError) throw profilesError;

    const profilesById = new Map((profiles || []).map((profile: any) => [profile.id, profile]));

    const enriched = await Promise.all((requests || []).map(async (request: any) => {
      const profile = profilesById.get(request.user_id) || null;
      const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(request.user_id);
      const authUser = authUserData?.user || null;
      const applicant = buildApplicantSnapshot(request, profile, authUser);

      await backfillApplicantDetails(request, profile, applicant);

      return {
        ...request,
        applicant_full_name: applicant.full_name,
        applicant_email: applicant.email,
        applicant_phone: applicant.phone,
        applicant_address: applicant.address,
        applicant_metadata: applicant.metadata,
        profile: profile
          ? {
            ...profile,
            full_name: profile.full_name || applicant.full_name,
            email: profile.email || applicant.email,
            phone: profile.phone || applicant.phone,
            address: profile.address || applicant.address,
            metadata: { ...(profile.metadata || {}), ...applicant.metadata },
          }
          : null,
      };
    }));

    return jsonResponse({ requests: enriched });
  } catch (err) {
    const msg = String((err as any)?.message || err);
    let status = 500;

    if (msg === "missing_auth" || msg === "unauthorized") {
      status = 401;
    } else if (msg === "forbidden") {
      status = 403;
    }

    if (status === 500) {
      console.error("admin-list-dealer-verifications exception", err);
    }

    return jsonResponse({ error: msg }, status);
  }
});
