import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!anonKey) throw new Error("SUPABASE_ANON_KEY not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("missing_auth");
    }

    const supabaseUserClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authErr } = await supabaseUserClient.auth.getUser();

    if (authErr || !authData?.user) {
      throw new Error("unauthorized");
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("forbidden");
    }

    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = String(user_id);

    const [
      profileRes,
      systemsRes,
      bookingsRes,
      hubRequestsRes,
      ordersRes,
      paymentsRes
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone, address, role, created_at, avatar_url, metadata")
        .eq("id", userId)
        .maybeSingle(),
      supabaseAdmin.from("user_systems").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabaseAdmin.from("service_bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabaseAdmin.from("greenlife_hub").select("*").eq("type", "request").eq("user_id", userId).order("created_at", { ascending: false }),
      supabaseAdmin
        .from("orders")
        .select("id, amount, currency, kind, status, tx_ref, item_snapshot, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    if (profileRes.error) throw profileRes.error;

    // payments table may not exist yet; treat missing table as empty list
    const paymentsErrCode = (paymentsRes.error as any)?.code;
    const paymentsErrMsg = (paymentsRes.error as any)?.message || "";
    const paymentsMissing = paymentsErrCode === "PGRST205" || paymentsErrMsg.includes("Could not find the table");

    if (systemsRes.error) throw systemsRes.error;
    if (bookingsRes.error) throw bookingsRes.error;
    if (hubRequestsRes.error) throw hubRequestsRes.error;
    if (ordersRes.error) throw ordersRes.error;
    if (paymentsRes.error && !paymentsMissing) throw paymentsRes.error;

    return new Response(
      JSON.stringify({
        profile: profileRes.data,
        systems: systemsRes.data || [],
        service_bookings: bookingsRes.data || [],
        requests: hubRequestsRes.data || [],
        orders: ordersRes.data || [],
        payments: paymentsMissing ? [] : (paymentsRes.data || []),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = String((err as any)?.message || err);

    let status = 500;
    if (msg === "missing_auth" || msg === "unauthorized") {
      status = 401;
    } else if (msg === "forbidden") {
      status = 403;
    }

    if (status === 500) {
      console.error("admin-user-details exception", err);
    }

    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
