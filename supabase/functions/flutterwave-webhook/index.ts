import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, verif-hash",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

type FunctionConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  flutterwaveSecret: string;
  webhookHash: string;
};

type VerifiedPayment = {
  id: string | number;
  amount: number | string;
  currency?: string | null;
  status?: string | null;
  tx_ref?: string | null;
};

function textResponse(body: string, status = 200) {
  return new Response(body, { status, headers: corsHeaders });
}

function getFunctionConfig(): FunctionConfig {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
    "";
  const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY")?.trim() ||
    "";
  const webhookHash = Deno.env.get("FLUTTERWAVE_WEBHOOK_SECRET_HASH")
    ?.trim() || "";

  const missing = [
    !supabaseUrl ? "SUPABASE_URL" : "",
    !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "",
    !flutterwaveSecret ? "FLUTTERWAVE_SECRET_KEY" : "",
    !webhookHash ? "FLUTTERWAVE_WEBHOOK_SECRET_HASH" : "",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing required edge function secret(s): ${missing.join(", ")}`,
    );
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    flutterwaveSecret,
    webhookHash,
  };
}

function isMissingTableError(error: unknown) {
  const code = String((error as { code?: string })?.code || "");
  const message = String((error as { message?: string })?.message || "");
  return code === "PGRST205" || message.includes("Could not find the table");
}

async function verifyFlutterwaveTransaction(
  transactionId: string,
  flutterwaveSecret: string,
) {
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

  const rawBody = await res.text();
  let body: Record<string, unknown> | null = null;

  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    console.error("Flutterwave verify HTTP error:", res.status, rawBody);
    const remoteMessage = String(
      body?.message || body?.error || rawBody || "Unknown Flutterwave error",
    ).trim();

    if (remoteMessage.includes("No transaction was found for this id")) {
      throw new Error(
        "Flutterwave could not find that transaction ID. This usually means the Supabase FLUTTERWAVE_SECRET_KEY is from a different Flutterwave mode or account than the public key used for checkout.",
      );
    }

    throw new Error(
      `Flutterwave verification failed (${res.status}): ${remoteMessage}`,
    );
  }

  return body;
}

async function persistPaymentIfPossible(
  supabase: ReturnType<typeof createClient>,
  payment: {
    order_id: string;
    user_id: string | null;
    flutterwave_transaction_id: string;
    tx_ref: string;
    amount: number;
    currency: string;
    raw: VerifiedPayment;
  },
) {
  const existingPayment = await supabase
    .from("payments")
    .select("id")
    .eq("flutterwave_transaction_id", payment.flutterwave_transaction_id)
    .maybeSingle();

  if (existingPayment.error) {
    if (isMissingTableError(existingPayment.error)) {
      console.warn("payments table missing; skipping payment log write");
      return;
    }

    console.warn("Could not check existing payment log", existingPayment.error);
    return;
  }

  if (existingPayment.data) {
    return;
  }

  const insertResult = await supabase.from("payments").insert({
    order_id: payment.order_id,
    user_id: payment.user_id,
    provider: "flutterwave",
    flutterwave_transaction_id: payment.flutterwave_transaction_id,
    tx_ref: payment.tx_ref,
    amount: payment.amount,
    currency: payment.currency,
    status: "successful",
    raw: payment.raw,
    verified_at: new Date().toISOString(),
  });

  if (insertResult.error) {
    if (isMissingTableError(insertResult.error)) {
      console.warn("payments table missing; skipping payment log insert");
      return;
    }

    console.warn("Could not insert payment log", insertResult.error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return textResponse("ok");
  }

  if (req.method !== "POST") {
    return textResponse("Method not allowed", 405);
  }

  try {
    const config = getFunctionConfig();
    const signature = req.headers.get("verif-hash");

    if (config.webhookHash && signature !== config.webhookHash) {
      console.warn("Invalid webhook signature");
      return textResponse("Invalid signature", 401);
    }

    const payload = await req.json();
    const data = payload?.data;

    if (!data || !data.id || !data.tx_ref) {
      return textResponse("Bad payload", 400);
    }

    const supabase = createClient(config.supabaseUrl, config.serviceRoleKey);
    const verify = await verifyFlutterwaveTransaction(
      String(data.id),
      config.flutterwaveSecret,
    );
    const verified = verify?.data as VerifiedPayment | undefined;

    if (
      !verified || verified.status !== "successful" ||
      verified.tx_ref !== data.tx_ref
    ) {
      console.warn("Verification failed or mismatch", verified);
      return textResponse("Ignored", 400);
    }

    const tx_ref = String(verified.tx_ref);
    const amountPaid = Number(verified.amount);
    const paidCurrency = String(verified.currency || "NGN").toUpperCase();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, user_id, amount, currency")
      .eq("tx_ref", tx_ref)
      .maybeSingle();

    if (orderErr) {
      console.error("Order lookup failed for webhook tx_ref", tx_ref, orderErr);
      throw new Error("Order lookup failed");
    }

    if (!order) {
      return textResponse("Order not found", 404);
    }

    const expectedAmount = Number(order.amount);
    const expectedCurrency = String(order.currency || "NGN").toUpperCase();

    if (
      !Number.isFinite(amountPaid) || !Number.isFinite(expectedAmount) ||
      Math.abs(amountPaid - expectedAmount) > 0.01
    ) {
      console.warn("Webhook amount mismatch", {
        tx_ref,
        amountPaid,
        expectedAmount,
      });
      return textResponse("Amount mismatch", 400);
    }

    if (paidCurrency !== expectedCurrency) {
      console.warn("Webhook currency mismatch", {
        tx_ref,
        paidCurrency,
        expectedCurrency,
      });
      return textResponse("Currency mismatch", 400);
    }

    const orderUpdate = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    if (orderUpdate.error) {
      console.error("Order update failed for webhook tx_ref", tx_ref, orderUpdate.error);
      throw new Error("Could not mark order as paid");
    }

    await persistPaymentIfPossible(supabase, {
      order_id: order.id,
      user_id: order.user_id,
      flutterwave_transaction_id: String(verified.id),
      tx_ref,
      amount: amountPaid,
      currency: paidCurrency,
      raw: verified,
    });

    return textResponse("OK");
  } catch (err) {
    console.error("flutterwave-webhook error", err);
    return textResponse("Error", 500);
  }
});
