import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const VALID_ORDER_KINDS = new Set(["product", "package"]);
const SUPPORTED_CURRENCY = "NGN";
const MAX_LINE_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 99;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeText(value: unknown, maxLength: number) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeCustomerSnapshot(value: unknown) {
  const input =
    value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};

  return {
    name: normalizeText(input.name, 120),
    email: normalizeText(input.email, 160),
    phone: normalizeText(input.phone, 40),
    address: normalizeText(input.address, 400),
    city: normalizeText(input.city, 80),
    state: normalizeText(input.state, 80),
    notes: normalizeText(input.notes, 1000),
  };
}

function getSnapshotObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function parseLineItems(itemSnapshot: unknown) {
  const snapshot = getSnapshotObject(itemSnapshot);
  const rawItems = Array.isArray(snapshot.items) ? snapshot.items : [];

  if (rawItems.length === 0 || rawItems.length > MAX_LINE_ITEMS) {
    throw new Error("invalid_cart");
  }

  const quantities = new Map<string, number>();

  for (const rawItem of rawItems) {
    const item = getSnapshotObject(rawItem);
    const id = normalizeText(item.id, 80);
    const quantity = Number(item.quantity);

    if (!UUID_REGEX.test(id)) {
      throw new Error("invalid_cart_item");
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_ITEM
    ) {
      throw new Error("invalid_cart_quantity");
    }

    const nextQuantity = (quantities.get(id) || 0) + quantity;
    if (nextQuantity > MAX_QUANTITY_PER_ITEM) {
      throw new Error("invalid_cart_quantity");
    }

    quantities.set(id, nextQuantity);
  }

  return quantities;
}

async function buildAuthoritativeProductOrder(itemSnapshot: unknown) {
  const snapshot = getSnapshotObject(itemSnapshot);
  const quantities = parseLineItems(itemSnapshot);
  const ids = Array.from(quantities.keys());

  const { data, error } = await supabase
    .from("greenlife_hub")
    .select("id, name, title, price, image_url, category, status, metadata")
    .eq("type", "product")
    .in("id", ids);

  if (error) {
    console.error("Product lookup failed", error);
    throw new Error("product_lookup_failed");
  }

  if (!data || data.length !== ids.length) {
    throw new Error("cart_item_not_found");
  }

  const rowsById = new Map(data.map((row) => [String(row.id), row]));
  let amount = 0;

  const items = ids.map((id) => {
    const row = rowsById.get(id);
    if (!row) {
      throw new Error("cart_item_not_found");
    }

    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("invalid_catalog_price");
    }

    const status = normalizeText(row.status, 80).toLowerCase();
    if (status === "out of stock" || status === "inactive") {
      throw new Error("cart_item_unavailable");
    }

    const quantity = quantities.get(id) || 0;
    amount += price * quantity;

    return {
      id,
      name: normalizeText(row.name || row.title || "Solar product", 180),
      quantity,
      price,
      img: normalizeText(row.image_url, 1000),
      category: normalizeText(row.category, 120),
    };
  });

  return {
    amount,
    itemId: null,
    snapshot: {
      customer: normalizeCustomerSnapshot(snapshot.customer),
      items,
    },
  };
}

async function buildAuthoritativePackageOrder(itemId: unknown, itemSnapshot: unknown) {
  const id = normalizeText(itemId, 80);
  if (!UUID_REGEX.test(id)) {
    throw new Error("invalid_package_id");
  }

  const { data, error } = await supabase
    .from("greenlife_hub")
    .select("id, name, title, price, image_url, category, status, description, metadata")
    .eq("type", "package")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Package lookup failed", error);
    throw new Error("package_lookup_failed");
  }

  if (!data) {
    throw new Error("package_not_found");
  }

  const price = Number(data.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("invalid_catalog_price");
  }

  const status = normalizeText(data.status, 80).toLowerCase();
  if (status === "out of stock" || status === "inactive") {
    throw new Error("package_unavailable");
  }

  const snapshot = getSnapshotObject(itemSnapshot);

  return {
    amount: price,
    itemId: id,
    snapshot: {
      customer: normalizeCustomerSnapshot(snapshot.customer),
      package: {
        id,
        name: normalizeText(data.name || data.title || "Solar package", 180),
        price,
        img: normalizeText(data.image_url, 1000),
        category: normalizeText(data.category, 120),
        description: normalizeText(data.description, 1000),
      },
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { amount, currency = "NGN", kind, item_id, item_snapshot } = await req.json();

    if (!kind) {
      return jsonResponse({ error: "kind is required" }, 400);
    }

    if (!VALID_ORDER_KINDS.has(String(kind))) {
      return jsonResponse({ error: "Invalid order kind" }, 400);
    }

    const normalizedCurrency = String(currency || SUPPORTED_CURRENCY).toUpperCase();
    if (normalizedCurrency !== SUPPORTED_CURRENCY) {
      return jsonResponse({ error: "Unsupported currency" }, 400);
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
      return jsonResponse({ error: "Authentication required to create an order" }, 401);
    }

    let authoritativeOrder;
    try {
      authoritativeOrder = String(kind) === "package"
        ? await buildAuthoritativePackageOrder(item_id, item_snapshot)
        : await buildAuthoritativeProductOrder(item_snapshot);
    } catch (error) {
      const message = String((error as Error)?.message || error);
      const publicMessages: Record<string, string> = {
        invalid_cart: "Cart is empty or too large",
        invalid_cart_item: "Cart contains an invalid product",
        invalid_cart_quantity: "Cart contains an invalid quantity",
        cart_item_not_found: "One or more cart items are no longer available",
        cart_item_unavailable: "One or more cart items are not available",
        invalid_package_id: "Invalid package selection",
        package_not_found: "Package is no longer available",
        package_unavailable: "Package is not available",
        invalid_catalog_price: "Catalog pricing is not available for one or more items",
      };

      return jsonResponse(
        { error: publicMessages[message] || "Could not validate order items" },
        400,
      );
    }

    const numericAmount = Number(authoritativeOrder.amount.toFixed(2));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return jsonResponse({ error: "Invalid order amount" }, 400);
    }

    const clientAmount = Number(amount);
    if (Number.isFinite(clientAmount) && Math.abs(clientAmount - numericAmount) > 0.01) {
      console.warn("Client amount mismatch during order creation", {
        user_id: authenticatedUserId,
        clientAmount,
        authoritativeAmount: numericAmount,
      });
    }

    const tx_ref = `GL-${kind}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        amount: numericAmount,
        currency: SUPPORTED_CURRENCY,
        kind,
        item_id: authoritativeOrder.itemId,
        item_snapshot: authoritativeOrder.snapshot,
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
      return jsonResponse({ error: "Failed to create order" }, 500);
    }

    return jsonResponse({
      order_id: data.id,
      tx_ref: data.tx_ref,
      amount: numericAmount,
      currency: SUPPORTED_CURRENCY,
      items: authoritativeOrder.snapshot,
    });
  } catch (err) {
    console.error("create-order exception", err);
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
});

