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

const VALID_STATUSES = new Set([
  "pending",
  "confirmed",
  "in_transit",
  "delivered",
]);

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const { order_id, fulfillment_status, note } = await req.json();

    if (!order_id || !fulfillment_status) {
      return new Response(JSON.stringify({ error: "order_id and fulfillment_status are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nextStatus = String(fulfillment_status);
    if (!VALID_STATUSES.has(nextStatus)) {
      return new Response(JSON.stringify({ error: "Invalid fulfillment_status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
      .from("orders")
      .select("id, fulfillment_status")
      .eq("id", order_id)
      .maybeSingle();

    if (existingOrderError) {
      throw existingOrderError;
    }

    if (!existingOrder) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        fulfillment_status: nextStatus,
        fulfillment_updated_at: now,
        delivered_at: nextStatus === "delivered" ? now : null,
      })
      .eq("id", order_id)
      .select("id, user_id, amount, currency, kind, status, fulfillment_status, fulfillment_updated_at, delivered_at, tx_ref, item_snapshot, created_at")
      .single();

    if (updateError) {
      throw updateError;
    }

    const { error: historyError } = await supabaseAdmin
      .from("order_status_history")
      .insert({
        order_id,
        previous_status: existingOrder.fulfillment_status,
        next_status: nextStatus,
        changed_by: authData.user.id,
        note: note || null,
        created_at: now,
      });

    if (historyError) {
      throw historyError;
    }

    return new Response(
      JSON.stringify({ order: updatedOrder }),
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
      console.error("admin-update-order-status exception", err);
    }

    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
