import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const VALID_ORDER_KINDS = new Set(["product", "package"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { amount, currency = "NGN", kind, item_id, item_snapshot } = await req.json();

    if (!amount || !kind) {
      return new Response(
        JSON.stringify({ error: "amount and kind are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!VALID_ORDER_KINDS.has(String(kind))) {
      return new Response(
        JSON.stringify({ error: "Invalid order kind" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let authenticatedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");

    if (authHeader && anonKey) {
      const supabaseUserClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: authData } = await supabaseUserClient.auth.getUser();
      authenticatedUserId = authData?.user?.id || null;
    }

    if (!authenticatedUserId) {
      return new Response(
        JSON.stringify({ error: "Authentication required to create an order" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tx_ref = `GL-${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        amount: numericAmount,
        currency,
        kind,
        item_id: item_id || null,
        item_snapshot: item_snapshot || null,
        status: "pending",
        fulfillment_status: "pending",
        fulfillment_updated_at: new Date().toISOString(),
        tx_ref,
        user_id: authenticatedUserId,
      })
      .select("id, tx_ref")
      .single();

    if (error || !data) {
      console.error("create-order error", error);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ order_id: data.id, tx_ref: data.tx_ref }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-order exception", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

