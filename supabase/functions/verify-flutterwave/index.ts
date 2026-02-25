import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY")!;

if (!supabaseUrl) throw new Error("SUPABASE_URL not set");
if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
if (!flutterwaveSecret) throw new Error("FLUTTERWAVE_SECRET_KEY not set");

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

async function verifyFlutterwaveTransaction(transactionId: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${flutterwaveSecret}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Flutterwave verify HTTP error:", errText);
    throw new Error(
      `Flutterwave API error: ${res.status} ${errText}`,
    );
  }

  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id || !tx_ref) {
      return new Response(
        JSON.stringify({
          error: "transaction_id and tx_ref are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const verify = await verifyFlutterwaveTransaction(
      String(transaction_id),
    );

    const data = verify.data;

    if (
      !data ||
      data.status !== "successful" ||
      data.tx_ref !== tx_ref
    ) {
      return new Response(
        JSON.stringify({ status: "invalid" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Find order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("tx_ref", tx_ref)
      .single();

    if (orderErr || !order) {
      console.error("Order not found for tx_ref:", tx_ref, orderErr);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const amount = Number(data.amount);
    const currency = data.currency || "NGN";

    // Update order status
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    // Save payment record
    await supabase.from("payments").insert({
      order_id: order.id,
      user_id: order.user_id,
      provider: "flutterwave",
      flutterwave_transaction_id: String(data.id),
      tx_ref,
      amount,
      currency,
      status: "successful",
      raw: data,
      verified_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ status: "success" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    console.error("verify-flutterwave error:", err);

    return new Response(
      JSON.stringify({
        error: err.message || "Unexpected error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});