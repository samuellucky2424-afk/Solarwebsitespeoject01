import { supabase } from '../../config/supabaseClient';

export async function adminListUsers() {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("No active admin session. Please log in as admin.");
  }
  const { data, error } = await supabase.functions.invoke('admin-list-users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  return (data as any)?.users || [];
}

export async function adminUserDetails(userId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("No active admin session. Please log in as admin.");
  }
  const { data, error } = await supabase.functions.invoke('admin-user-details', {
    method: 'POST',
    body: { user_id: userId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  return data as any;
}
