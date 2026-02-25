import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY")!;
const webhookHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET_HASH");

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

async function verifyFlutterwaveTransaction(transactionId: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${flutterwaveSecret}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    console.error("Flutterwave verify HTTP error", await res.text());
    throw new Error("Failed to verify transaction");
  }

  const body = await res.json();
  return body;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const signature = req.headers.get("verif-hash");
  if (webhookHash && signature !== webhookHash) {
    console.warn("Invalid webhook signature");
    return new Response("Invalid signature", { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const data = payload?.data;

    if (!data || !data.id || !data.tx_ref) {
      return new Response("Bad payload", { status: 400, headers: corsHeaders });
    }

    const verify = await verifyFlutterwaveTransaction(String(data.id));
    const v = verify.data;

    if (!v || v.status !== "successful" || v.tx_ref !== data.tx_ref) {
      console.warn("Verification failed or mismatch", v);
      return new Response("Ignored", { status: 400, headers: corsHeaders });
    }

    const tx_ref = v.tx_ref;
    const amount = Number(v.amount);
    const currency = v.currency || "NGN";

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("tx_ref", tx_ref)
      .single();

    if (orderErr || !order) {
      console.error("Order not found for webhook tx_ref", tx_ref, orderErr);
      return new Response("Order not found", { status: 404, headers: corsHeaders });
    }

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    await supabase.from("payments").insert({
      order_id: order.id,
      user_id: order.user_id,
      provider: "flutterwave",
      flutterwave_transaction_id: String(v.id),
      tx_ref,
      amount,
      currency,
      status: "successful",
      raw: v,
      verified_at: new Date().toISOString(),
    });

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("flutterwave-webhook error", err);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});

