import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!anonKey) throw new Error("SUPABASE_ANON_KEY not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

const MAX_FAILED_ATTEMPTS = 5;
const DEALER_ROLES = new Set(["installer", "retailer"]);
const APPROVED_ROLES = new Set(["admin", "installer", "retailer"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

type LoginProfile = {
  id: string;
  email?: string | null;
  role?: string | null;
  suspended?: boolean | null;
  failed_login_attempts?: number | null;
  metadata?: Record<string, unknown> | null;
};

type DealerVerificationRequest = {
  id: string;
  role_requested: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase().slice(0, 320);
}

function normalizeCaptchaToken(value: unknown) {
  return String(value || "").trim().slice(0, 2048);
}

function isInvalidCredentialsResponse(status: number, body: Record<string, unknown> | null) {
  const message = String(
    body?.error_description || body?.msg || body?.message || body?.error || "",
  ).toLowerCase();

  return status === 400 && message.includes("invalid login credentials");
}

async function getProfileByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, suspended, failed_login_attempts, metadata")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Profile lookup failed during login", error);
    throw new Error("profile_lookup_failed");
  }

  return data;
}

async function getLatestDealerRequest(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("role_verification_requests")
    .select("id, role_requested, status, admin_note")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Dealer verification lookup failed during login", error);
    throw new Error("dealer_verification_lookup_failed");
  }

  return data as DealerVerificationRequest | null;
}

function getRequestedDealerRole(profile: LoginProfile) {
  const roleRequested = String(profile.metadata?.role_requested || "").toLowerCase();
  return DEALER_ROLES.has(roleRequested) ? roleRequested : null;
}

function getMetadataVerificationStatus(profile: LoginProfile) {
  const status = String(profile.metadata?.verification_status || "").toLowerCase();
  return status === "pending" || status === "rejected" || status === "approved" ? status : null;
}

function buildDealerGateResponse(
  status: "pending" | "rejected",
  roleRequested: string,
  adminNote?: string | null,
) {
  const roleLabel = roleRequested === "retailer" ? "retailer" : "installer";

  if (status === "pending") {
    return {
      error: `Your ${roleLabel} account is under pending review. Please wait for admin approval before signing in.`,
      dealer_verification_status: "pending",
      role_requested: roleRequested,
    };
  }

  return {
    error: `Your ${roleLabel} application was rejected. Please contact the admin for support.`,
    dealer_verification_status: "rejected",
    role_requested: roleRequested,
    admin_note: adminNote || null,
  };
}

async function getDealerLoginBlock(profile: LoginProfile) {
  const currentRole = String(profile.role || "").toLowerCase();
  if (APPROVED_ROLES.has(currentRole)) return null;

  const latestRequest = await getLatestDealerRequest(profile.id);
  if (latestRequest && DEALER_ROLES.has(latestRequest.role_requested)) {
    if (latestRequest.status === "pending" || latestRequest.status === "rejected") {
      return {
        status: latestRequest.status === "pending" ? 423 : 403,
        body: buildDealerGateResponse(
          latestRequest.status,
          latestRequest.role_requested,
          latestRequest.admin_note,
        ),
      };
    }

    return null;
  }

  const requestedRole = getRequestedDealerRole(profile);
  const verificationStatus = getMetadataVerificationStatus(profile);

  if (requestedRole && verificationStatus !== "approved") {
    const blockedStatus = verificationStatus === "rejected" ? "rejected" : "pending";
    return {
      status: blockedStatus === "pending" ? 423 : 403,
      body: buildDealerGateResponse(blockedStatus, requestedRole),
    };
  }

  return null;
}

async function recordFailedAttempt(profile: { id: string; failed_login_attempts?: number | null }) {
  const failedAttempts = Number(profile.failed_login_attempts || 0) + 1;
  const suspended = failedAttempts >= MAX_FAILED_ATTEMPTS;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      failed_login_attempts: failedAttempts,
      suspended,
      suspended_at: suspended ? new Date().toISOString() : null,
      suspension_reason: suspended ? "Too many failed login attempts" : null,
    })
    .eq("id", profile.id);

  if (error) {
    console.error("Failed login counter update failed", error);
    throw new Error("failed_attempt_update_failed");
  }

  return {
    failed_login_attempts: failedAttempts,
    attempts_remaining: Math.max(MAX_FAILED_ATTEMPTS - failedAttempts, 0),
    suspended,
  };
}

async function resetFailedAttempts(userId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      failed_login_attempts: 0,
      suspended_at: null,
      suspension_reason: null,
    })
    .eq("id", userId)
    .eq("suspended", false);

  if (error) {
    console.warn("Failed login reset skipped", error);
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
    const {
      email: rawEmail,
      password,
      captcha_token: rawCaptchaToken,
    } = await req.json();
    const email = normalizeEmail(rawEmail);
    const passwordText = String(password || "");
    const captchaToken = normalizeCaptchaToken(rawCaptchaToken);

    if (!email || !passwordText) {
      return jsonResponse({ error: "Email and password are required" }, 400);
    }

    if (!captchaToken) {
      return jsonResponse({ error: "Security check is required." }, 400);
    }

    const profile = await getProfileByEmail(email);

    if (profile?.suspended) {
      return jsonResponse({
        error: "This account is suspended. Please contact an admin.",
        suspended: true,
        failed_login_attempts: Number(profile.failed_login_attempts || MAX_FAILED_ATTEMPTS),
        attempts_remaining: 0,
      }, 423);
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({
        email,
        password: passwordText,
        gotrue_meta_security: { captcha_token: captchaToken },
      }),
    });

    const rawAuthBody = await authResponse.text();
    let authBody: Record<string, unknown> | null = null;

    try {
      authBody = rawAuthBody ? JSON.parse(rawAuthBody) : null;
    } catch {
      authBody = null;
    }

    if (!authResponse.ok) {
      if (profile && isInvalidCredentialsResponse(authResponse.status, authBody)) {
        const attempt = await recordFailedAttempt(profile);
        return jsonResponse({
          error: attempt.suspended
            ? "Too many failed login attempts. This account has been suspended until an admin reviews it."
            : "Invalid credentials.",
          ...attempt,
        }, attempt.suspended ? 423 : 401);
      }

      const message = String(
        authBody?.error_description || authBody?.msg || authBody?.message || "Login failed",
      );

      return jsonResponse({ error: message }, authResponse.status);
    }

    const user = authBody?.user as { id?: string } | undefined;
    if (!user?.id || !authBody?.access_token || !authBody?.refresh_token) {
      return jsonResponse({ error: "Login response was invalid" }, 500);
    }

    const latestProfile = await supabaseAdmin
      .from("profiles")
      .select("id, role, suspended, failed_login_attempts, metadata")
      .eq("id", user.id)
      .maybeSingle();

    if (latestProfile.error) {
      console.error("Post-login profile check failed", latestProfile.error);
      return jsonResponse({ error: "Could not verify account status" }, 500);
    }

    if (latestProfile.data?.suspended) {
      return jsonResponse({
        error: "This account is suspended. Please contact an admin.",
        suspended: true,
        failed_login_attempts: Number(latestProfile.data.failed_login_attempts || MAX_FAILED_ATTEMPTS),
        attempts_remaining: 0,
      }, 423);
    }

    if (latestProfile.data) {
      const dealerBlock = await getDealerLoginBlock(latestProfile.data as LoginProfile);
      if (dealerBlock) {
        return jsonResponse(dealerBlock.body, dealerBlock.status);
      }
    }

    await resetFailedAttempts(user.id);

    return jsonResponse({
      session: authBody,
      failed_login_attempts: 0,
      attempts_remaining: MAX_FAILED_ATTEMPTS,
      suspended: false,
    });
  } catch (err) {
    console.error("password-login exception", err);
    return jsonResponse({ error: "Unexpected login error" }, 500);
  }
});
