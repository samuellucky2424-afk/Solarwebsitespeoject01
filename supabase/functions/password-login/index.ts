import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || "";

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!anonKey) throw new Error("SUPABASE_ANON_KEY not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

const MAX_FAILED_ATTEMPTS = 5;

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
    .select("id, email, role, suspended, failed_login_attempts")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Profile lookup failed during login", error);
    throw new Error("profile_lookup_failed");
  }

  return data;
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
      .select("suspended, failed_login_attempts")
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
