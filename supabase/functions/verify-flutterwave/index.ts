import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id || !tx_ref) {
      return new Response(
        JSON.stringify({ error: "transaction_id and tx_ref are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const verify = await verifyFlutterwaveTransaction(String(transaction_id));
    const data = verify.data;

    if (!data || data.status !== "successful" || data.tx_ref !== tx_ref) {
      return new Response(
        JSON.stringify({ status: "invalid" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("tx_ref", tx_ref)
      .single();

    if (orderErr || !order) {
      console.error("Order not found for tx_ref", tx_ref, orderErr);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const amount = Number(data.amount);
    const currency = data.currency || "NGN";

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

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
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("verify-flutterwave error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

