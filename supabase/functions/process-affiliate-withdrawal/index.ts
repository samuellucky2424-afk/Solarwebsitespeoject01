import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Get request body
    const body = await req.json();
    const { amount, paymentMethod } = body;

    if (!amount || amount < 1000) {
      throw new Error('Minimum withdrawal amount is ₦1,000');
    }

    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }

    // Get Affiliate Profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Affiliate profile not found');
    }

    const affiliateId = profile.id;

    // Securely calculate available balance
    
    // 1. Get all cash rewards that are Available, Approved, or Paid
    const { data: rewards, error: rewardsError } = await supabaseClient
      .from('affiliate_rewards')
      .select('monetary_amount, status')
      .eq('affiliate_id', affiliateId)
      .eq('reward_type', 'cash')
      .in('status', ['Available', 'Approved', 'Paid']);

    if (rewardsError) throw rewardsError;

    let totalEarnings = 0;
    rewards?.forEach(r => {
      totalEarnings += Number(r.monetary_amount);
    });

    // 2. Get all withdrawals (Pending, Paid) to subtract from earnings
    const { data: withdrawals, error: withdrawalsError } = await supabaseClient
      .from('affiliate_withdrawals')
      .select('amount, status')
      .eq('affiliate_id', affiliateId)
      .in('status', ['Pending', 'Paid']);

    if (withdrawalsError) throw withdrawalsError;

    let totalWithdrawn = 0;
    withdrawals?.forEach(w => {
      totalWithdrawn += Number(w.amount);
    });

    const availableBalance = totalEarnings - totalWithdrawn;

    if (amount > availableBalance) {
      throw new Error(`Insufficient available balance. You requested ₦${amount} but only have ₦${availableBalance} available.`);
    }

    // Insert Withdrawal Request
    const { data: withdrawalRequest, error: insertError } = await supabaseClient
      .from('affiliate_withdrawals')
      .insert([
        {
          affiliate_id: affiliateId,
          amount,
          payment_method: paymentMethod,
          status: 'Pending'
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, data: withdrawalRequest }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing withdrawal:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
