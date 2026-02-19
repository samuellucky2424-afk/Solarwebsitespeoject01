import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { amount, currency = "NGN", kind, item_id, item_snapshot, user_id } = await req.json();

    if (!amount || !kind) {
      return new Response(
        JSON.stringify({ error: "amount and kind are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const tx_ref = `GL-${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        amount,
        currency,
        kind,
        item_id: item_id || null,
        item_snapshot: item_snapshot || null,
        status: "pending",
        tx_ref,
        user_id: user_id || null,
      })
      .select("id, tx_ref")
      .single();

    if (error || !data) {
      console.error("create-order error", error);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ order_id: data.id, tx_ref: data.tx_ref }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-order exception", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

