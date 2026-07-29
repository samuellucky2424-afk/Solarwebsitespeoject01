-- Affiliate Marketing System Schema

-- 1. Affiliate Profiles
CREATE TABLE affiliate_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE, 
  affiliate_code VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'Pending', 
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspension_reason TEXT,
  default_reward_preference VARCHAR(50) DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Affiliate Reward Rules
CREATE TABLE affiliate_reward_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  reward_type VARCHAR(50) NOT NULL, 
  fixed_amount NUMERIC(10, 2) DEFAULT 0,
  percentage_rate NUMERIC(5, 2) DEFAULT 0,
  minimum_order_amount NUMERIC(10, 2) DEFAULT 0,
  maximum_reward NUMERIC(10, 2),
  product_id TEXT, 
  category_id TEXT,
  campaign_id TEXT,
  holding_period_days INTEGER DEFAULT 30,
  priority INTEGER DEFAULT 0,
  new_customers_only BOOLEAN DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Affiliate Clicks
CREATE TABLE affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliate_profiles(id),
  affiliate_code_snapshot VARCHAR(255),
  product_id TEXT,
  anonymous_visitor_id VARCHAR(255),
  landing_url TEXT,
  referrer_url TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attribution_expires_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_id UUID,
  fraud_status VARCHAR(50) DEFAULT 'Clear',
  metadata JSONB
);

-- 4. Affiliate Conversions
CREATE TABLE affiliate_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliate_profiles(id),
  click_id UUID REFERENCES affiliate_clicks(id),
  customer_id UUID,
  order_id TEXT NOT NULL UNIQUE, 
  payment_id TEXT,
  currency VARCHAR(10) DEFAULT 'NGN',
  eligible_order_amount NUMERIC(10, 2) DEFAULT 0,
  conversion_status VARCHAR(50) DEFAULT 'Pending',
  fraud_status VARCHAR(50) DEFAULT 'Clear',
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Affiliate Conversion Items
CREATE TABLE affiliate_conversion_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversion_id UUID REFERENCES affiliate_conversions(id) ON DELETE CASCADE,
  order_item_id TEXT,
  product_id TEXT,
  quantity INTEGER DEFAULT 1,
  product_price NUMERIC(10, 2),
  eligible_amount NUMERIC(10, 2),
  reward_rule_id UUID REFERENCES affiliate_reward_rules(id),
  reward_type VARCHAR(50),
  reward_value_snapshot NUMERIC(10, 2),
  calculated_reward NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Affiliate Rewards
CREATE TABLE affiliate_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliate_profiles(id),
  conversion_id UUID REFERENCES affiliate_conversions(id),
  reward_rule_id UUID REFERENCES affiliate_reward_rules(id),
  reward_type VARCHAR(50) NOT NULL,
  monetary_amount NUMERIC(10, 2) DEFAULT 0,
  coupon_id TEXT,
  salon_entitlement_id UUID,
  store_credit_amount NUMERIC(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(50) DEFAULT 'Pending', 
  available_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  reversed_at TIMESTAMP WITH TIME ZONE,
  reversal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Affiliate Withdrawals
CREATE TABLE affiliate_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliate_profiles(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  status VARCHAR(50) DEFAULT 'Pending', 
  payment_method VARCHAR(100),
  payout_reference TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT
);

-- 8. Salon Reward Entitlements
CREATE TABLE salon_reward_entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliate_profiles(id),
  reward_id UUID REFERENCES affiliate_rewards(id),
  service_id TEXT,
  status VARCHAR(50) DEFAULT 'Available',
  expires_at TIMESTAMP WITH TIME ZONE,
  booking_id TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Affiliate Audit Logs
CREATE TABLE affiliate_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID,
  actor_role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  previous_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)

-- Affiliate Profiles
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_profiles FOR ALL USING (true);

ALTER TABLE affiliate_reward_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_reward_rules FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_reward_rules FOR ALL USING (true);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_clicks FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_clicks FOR ALL USING (true);

ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_conversions FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_conversions FOR ALL USING (true);

ALTER TABLE affiliate_conversion_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_conversion_items FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_conversion_items FOR ALL USING (true);

ALTER TABLE affiliate_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_rewards FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_rewards FOR ALL USING (true);

ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_withdrawals FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_withdrawals FOR ALL USING (true);

ALTER TABLE salon_reward_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON salon_reward_entitlements FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON salon_reward_entitlements FOR ALL USING (true);

ALTER TABLE affiliate_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON affiliate_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON affiliate_audit_logs FOR ALL USING (true);
