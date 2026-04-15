import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

type FunctionConfig = {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  flutterwaveSecret: string;
};

type VerifiedPayment = {
  id: string | number;
  amount: number | string;
  currency?: string | null;
  status?: string | null;
  tx_ref?: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getFunctionConfig(): FunctionConfig {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
    "";
  const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY")?.trim() ||
    "";

  const missing = [
    !supabaseUrl ? "SUPABASE_URL" : "",
    !anonKey ? "SUPABASE_ANON_KEY" : "",
    !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "",
    !flutterwaveSecret ? "FLUTTERWAVE_SECRET_KEY" : "",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing required edge function secret(s): ${missing.join(", ")}`,
    );
  }

  return {
    supabaseUrl,
    anonKey,
    serviceRoleKey,
    flutterwaveSecret,
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
      return "payments_table_missing";
    }

    console.warn("Could not check existing payment log", existingPayment.error);
    return "payment_lookup_failed";
  }

  if (existingPayment.data) {
    return null;
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
      return "payments_table_missing";
    }

    console.warn("Could not insert payment log", insertResult.error);
    return "payment_insert_failed";
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { transaction_id, tx_ref } = await req.json();

    if (!transaction_id || !tx_ref) {
      return jsonResponse(
        { error: "transaction_id and tx_ref are required" },
        400,
      );
    }

    const config = getFunctionConfig();
    const supabase = createClient(config.supabaseUrl, config.serviceRoleKey);
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const supabaseUserClient = createClient(config.supabaseUrl, config.anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authErr } = await supabaseUserClient.auth.getUser();

    if (authErr || !authData?.user) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const verify = await verifyFlutterwaveTransaction(
      String(transaction_id),
      config.flutterwaveSecret,
    );

    const data = verify?.data as VerifiedPayment | undefined;

    if (!data || data.status !== "successful" || data.tx_ref !== tx_ref) {
      return jsonResponse(
        {
          status: "invalid",
          error: "Flutterwave transaction status or reference did not match",
        },
        400,
      );
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, user_id, amount, currency, status")
      .eq("tx_ref", tx_ref)
      .maybeSingle();

    if (orderErr) {
      console.error("Order lookup failed for tx_ref:", tx_ref, orderErr);
      throw new Error("Order lookup failed");
    }

    if (!order) {
      return jsonResponse({ error: "Order not found" }, 404);
    }

    if (order.user_id !== authData.user.id) {
      return jsonResponse({ error: "You do not have permission to verify this order" }, 403);
    }

    const amountPaid = Number(data.amount);
    const expectedAmount = Number(order.amount);
    const paidCurrency = String(data.currency || "NGN").toUpperCase();
    const expectedCurrency = String(order.currency || "NGN").toUpperCase();

    if (
      !Number.isFinite(amountPaid) || !Number.isFinite(expectedAmount) ||
      Math.abs(amountPaid - expectedAmount) > 0.01
    ) {
      console.warn("Flutterwave amount mismatch", {
        tx_ref,
        amountPaid,
        expectedAmount,
      });
      return jsonResponse(
        { error: "Verified amount does not match the order total" },
        400,
      );
    }

    if (paidCurrency !== expectedCurrency) {
      console.warn("Flutterwave currency mismatch", {
        tx_ref,
        paidCurrency,
        expectedCurrency,
      });
      return jsonResponse(
        { error: "Verified currency does not match the order currency" },
        400,
      );
    }

    const orderUpdate = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    if (orderUpdate.error) {
      console.error("Order update failed for tx_ref:", tx_ref, orderUpdate.error);
      throw new Error("Could not mark order as paid");
    }

    const warning = await persistPaymentIfPossible(supabase, {
      order_id: order.id,
      user_id: order.user_id,
      flutterwave_transaction_id: String(data.id),
      tx_ref,
      amount: amountPaid,
      currency: paidCurrency,
      raw: data,
    });

    return jsonResponse({
      status: "success",
      order_status: "paid",
      ...(warning ? { warning } : {}),
    });
  } catch (err: unknown) {
    console.error("verify-flutterwave error:", err);

    return jsonResponse(
      {
        error: (err as { message?: string })?.message || "Unexpected error",
      },
      500,
    );
  }
});
