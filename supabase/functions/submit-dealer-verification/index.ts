import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

const VERIFICATION_BUCKET = "greenlife-verifications";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const VALID_ROLES = new Set(["installer", "retailer"]);

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

function normalizeText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeStorageName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
}

function getRequiredFiles(roleRequested: string) {
  return roleRequested === "installer"
    ? ["cacDocument", "workPhoto", "workVideo"]
    : ["idDocument", "storePhoto", "storeVideo"];
}

function getFile(formData: FormData, field: string) {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

function parseMetadata(value: FormDataEntryValue | null, roleRequested: string) {
  const fallback = {
    plan: "Standard Plan",
    role_requested: roleRequested,
    verification_status: "pending",
  };

  try {
    const parsed = JSON.parse(String(value || "{}"));

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }

    return {
      ...parsed,
      role_requested: roleRequested,
      verification_status: "pending",
    };
  } catch {
    return fallback;
  }
}

async function uploadVerificationFile(userId: string, field: string, file: File | null) {
  if (!file) return null;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`${field} is too large. Maximum size is 50MB.`);
  }

  const safeName = sanitizeStorageName(file.name || `${field}.bin`);
  const filePath = `${userId}/dealer-verifications/${crypto.randomUUID()}-${field}-${safeName}`;

  const { error } = await supabaseAdmin.storage
    .from(VERIFICATION_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("Dealer verification file upload failed", { field, error });
    throw new Error(`Could not upload ${field}.`);
  }

  return filePath;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const formData = await req.formData();
    const userId = normalizeText(formData.get("userId"), 80);
    const email = normalizeText(formData.get("email"), 320).toLowerCase();
    const roleRequested = normalizeText(formData.get("roleRequested"), 20);
    const fullName = normalizeText(formData.get("fullName"), 160);
    const phone = normalizeText(formData.get("phone"), 60);
    const address = normalizeText(formData.get("address"), 400);
    const businessName = normalizeText(formData.get("businessName"), 180);
    const businessAddress = normalizeText(formData.get("businessAddress"), 500);

    if (!userId || !email) {
      return jsonResponse({ error: "Missing signup user details." }, 400);
    }

    if (!VALID_ROLES.has(roleRequested)) {
      return jsonResponse({ error: "Invalid dealer role requested." }, 400);
    }

    if (!businessName || !businessAddress) {
      return jsonResponse({ error: "Business name and address are required." }, 400);
    }

    for (const field of getRequiredFiles(roleRequested)) {
      if (!getFile(formData, field)) {
        return jsonResponse({ error: `Missing required file: ${field}.` }, 400);
      }
    }

    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    const authEmail = authUser?.user?.email?.toLowerCase() || "";

    if (authUserError || !authUser?.user || authEmail !== email) {
      console.warn("Dealer verification rejected because auth user did not match", {
        userId,
        email,
        authEmail,
        authUserError,
      });
      return jsonResponse({ error: "Could not verify the newly created account." }, 403);
    }

    const metadata = parseMetadata(formData.get("metadata"), roleRequested);

    const profilePayload = {
      full_name: fullName,
      email,
      phone,
      address,
      metadata,
    };

    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileError) {
      console.error("Dealer signup profile lookup failed", existingProfileError);
      return jsonResponse({ error: "Could not verify account profile." }, 500);
    }

    const profileResult = existingProfile
      ? await supabaseAdmin
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId)
      : await supabaseAdmin
        .from("profiles")
        .insert({
          ...profilePayload,
          id: userId,
          role: "user",
        });

    if (profileResult.error) {
      console.error("Dealer signup profile save failed", profileResult.error);
      return jsonResponse({ error: "Could not save account profile." }, 500);
    }

    const [
      cacDocumentUrl,
      idDocumentUrl,
      storePhotoUrl,
      storeVideoUrl,
      workPhotoUrl,
      workVideoUrl,
    ] = await Promise.all([
      uploadVerificationFile(userId, "cacDocument", getFile(formData, "cacDocument")),
      uploadVerificationFile(userId, "idDocument", getFile(formData, "idDocument")),
      uploadVerificationFile(userId, "storePhoto", getFile(formData, "storePhoto")),
      uploadVerificationFile(userId, "storeVideo", getFile(formData, "storeVideo")),
      uploadVerificationFile(userId, "workPhoto", getFile(formData, "workPhoto")),
      uploadVerificationFile(userId, "workVideo", getFile(formData, "workVideo")),
    ]);

    await supabaseAdmin
      .from("role_verification_requests")
      .delete()
      .eq("user_id", userId)
      .eq("status", "pending");

    const { data: request, error: requestError } = await supabaseAdmin
      .from("role_verification_requests")
      .insert({
        user_id: userId,
        role_requested: roleRequested,
        business_name: businessName,
        business_address: businessAddress,
        cac_document_url: cacDocumentUrl,
        id_document_url: idDocumentUrl,
        store_photo_url: storePhotoUrl,
        store_video_url: storeVideoUrl,
        work_photo_url: workPhotoUrl,
        work_video_url: workVideoUrl,
        status: "pending",
      })
      .select("id")
      .single();

    if (requestError) {
      console.error("Dealer verification request insert failed", requestError);
      return jsonResponse({ error: "Could not save dealer verification request." }, 500);
    }

    return jsonResponse({
      ok: true,
      request_id: request?.id,
    });
  } catch (err) {
    const message = String((err as any)?.message || err || "Unexpected verification error");
    console.error("submit-dealer-verification exception", err);
    return jsonResponse({ error: message }, 500);
  }
});
