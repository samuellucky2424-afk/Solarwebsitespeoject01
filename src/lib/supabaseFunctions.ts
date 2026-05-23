import { getSupabase, loadConfig } from '../../config/supabaseClient';
import { type FulfillmentStatus, normalizeFulfillmentStatus } from './orderTracking';

export interface OrderSnapshotItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  img?: string;
  image_url?: string;
}

export interface OrderSnapshotCustomer {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface AdminOrderRecord {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  kind: string;
  status: string;
  fulfillment_status: FulfillmentStatus;
  fulfillment_updated_at?: string | null;
  delivered_at?: string | null;
  tx_ref: string;
  created_at: string;
  item_snapshot?: {
    customer?: OrderSnapshotCustomer;
    items?: OrderSnapshotItem[];
    [key: string]: any;
  } | null;
}

async function getAdminClientAndToken() {
  await loadConfig();

  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("No active admin session. Please log in as admin.");
  }

  return { supabase, accessToken };
}

function throwFunctionError(functionName: string, error: any): never {
  const message = String(error?.message || error || '');
  const isNetworkFailure = error?.name === 'FunctionsFetchError'
    || message.includes('Failed to send a request to the Edge Function');

  if (isNetworkFailure) {
    throw new Error(`The Supabase Edge Function "${functionName}" is not reachable. Deploy this function in Supabase, then refresh the admin dashboard.`);
  }

  throw error;
}

export async function adminListUsers() {
  const { supabase, accessToken } = await getAdminClientAndToken();
  const { data, error } = await supabase.functions.invoke('admin-list-users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throwFunctionError('admin-list-users', error);
  return (data as any)?.users || [];
}

export async function adminUserDetails(userId: string) {
  const { supabase, accessToken } = await getAdminClientAndToken();
  const { data, error } = await supabase.functions.invoke('admin-user-details', {
    method: 'POST',
    body: { user_id: userId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throwFunctionError('admin-user-details', error);
  return data as any;
}

export async function adminListOrders(): Promise<AdminOrderRecord[]> {
  const { supabase, accessToken } = await getAdminClientAndToken();
  const { data, error } = await supabase.functions.invoke('admin-list-orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throwFunctionError('admin-list-orders', error);

  const orders = (data as any)?.orders || [];
  return orders.map((order: any) => ({
    ...order,
    fulfillment_status: normalizeFulfillmentStatus(order?.fulfillment_status),
  }));
}

export async function adminUpdateOrderFulfillmentStatus(
  orderId: string,
  fulfillmentStatus: FulfillmentStatus,
  note?: string
): Promise<AdminOrderRecord> {
  const { supabase, accessToken } = await getAdminClientAndToken();
  const { data, error } = await supabase.functions.invoke('admin-update-order-status', {
    method: 'POST',
    body: {
      order_id: orderId,
      fulfillment_status: fulfillmentStatus,
      note: note || null,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throwFunctionError('admin-update-order-status', error);

  const order = (data as any)?.order;
  return {
    ...order,
    fulfillment_status: normalizeFulfillmentStatus(order?.fulfillment_status),
  };
}
