import { supabase } from '../../config/supabaseClient';
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

async function getAdminAccessToken() {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("No active admin session. Please log in as admin.");
  }

  return accessToken;
}

export async function adminListUsers() {
  const accessToken = await getAdminAccessToken();
  const { data, error } = await supabase.functions.invoke('admin-list-users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  return (data as any)?.users || [];
}

export async function adminUserDetails(userId: string) {
  const accessToken = await getAdminAccessToken();
  const { data, error } = await supabase.functions.invoke('admin-user-details', {
    method: 'POST',
    body: { user_id: userId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  return data as any;
}

export async function adminListOrders(): Promise<AdminOrderRecord[]> {
  const accessToken = await getAdminAccessToken();
  const { data, error } = await supabase.functions.invoke('admin-list-orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;

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
  const accessToken = await getAdminAccessToken();
  const { data, error } = await supabase.functions.invoke('admin-update-order-status', {
    method: 'POST',
    body: {
      order_id: orderId,
      fulfillment_status: fulfillmentStatus,
      note: note || null,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;

  const order = (data as any)?.order;
  return {
    ...order,
    fulfillment_status: normalizeFulfillmentStatus(order?.fulfillment_status),
  };
}
