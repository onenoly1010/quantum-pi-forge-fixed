-- Creator Payouts System Schema for Supabase

-- Creator Payouts Table
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL, -- References templates(id)
  user_id UUID NOT NULL, -- References users(id)
  creator_id UUID NOT NULL, -- References users(id)
  burn_amount DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(10,2) NOT NULL, -- 10%
  platform_fee DECIMAL(10,2) NOT NULL,  -- 5%
  transaction_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_template ON creator_payouts(template_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON creator_payouts(status);

-- Add creator balance and Stripe fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS creator_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS payout_threshold DECIMAL(10,2) DEFAULT 50;

-- Function to increment creator balance
CREATE OR REPLACE FUNCTION increment_creator_balance(
  creator_id UUID,
  amount DECIMAL
) RETURNS void AS $$
BEGIN
  UPDATE users
  SET creator_balance = COALESCE(creator_balance, 0) + amount
  WHERE id = creator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'template_usage', 'subscription', 'credit_purchase'
  template_id UUID, -- References templates(id)
  user_id UUID, -- References users(id)
  creator_id UUID, -- References users(id)
  amount_usd DECIMAL(10,2) NOT NULL,
  creator_payout DECIMAL(10,2),
  platform_revenue DECIMAL(10,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for revenue events
CREATE INDEX IF NOT EXISTS idx_revenue_events_type ON revenue_events(event_type);
CREATE INDEX IF NOT EXISTS idx_revenue_events_creator ON revenue_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_timestamp ON revenue_events(timestamp);

-- Payout errors table for debugging
CREATE TABLE IF NOT EXISTS payout_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID,
  user_id UUID,
  error TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Executed payouts table
CREATE TABLE IF NOT EXISTS creator_payouts_executed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'completed',
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time dashboard view
CREATE OR REPLACE VIEW creator_dashboard AS
SELECT
  u.id as creator_id,
  u.email,
  COUNT(DISTINCT t.id) as templates_created,
  COUNT(cp.id) as total_uses,
  COALESCE(SUM(cp.creator_share), 0) as total_earnings,
  u.creator_balance as available_balance,
  COALESCE(SUM(cp.platform_fee), 0) as platform_earnings
FROM users u
LEFT JOIN templates t ON u.id = t.creator_id
LEFT JOIN creator_payouts cp ON t.id = cp.template_id
WHERE u.creator_balance > 0 OR t.creator_id IS NOT NULL
GROUP BY u.id, u.email, u.creator_balance;

-- Enable Row Level Security (RLS)
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts_executed ENABLE ROW LEVEL SECURITY;

-- RLS Policies (creators can only see their own data)
CREATE POLICY "Creators can view own payouts" ON creator_payouts
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Creators can view own revenue" ON revenue_events
  FOR SELECT USING (creator_id = auth.uid());

-- Admin policies for payout processing
CREATE POLICY "Service role can manage payouts" ON creator_payouts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage revenue" ON revenue_events
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON creator_payouts TO service_role;
GRANT ALL ON revenue_events TO service_role;
GRANT ALL ON payout_errors TO service_role;
GRANT ALL ON creator_payouts_executed TO service_role;
GRANT SELECT ON creator_dashboard TO authenticated;

-- ==================== STRIPE CONNECT EXTENSIONS ====================

-- Add Stripe onboarding status to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Add premium template fields to templates
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2) DEFAULT 0;

-- Creator referrals table
CREATE TABLE IF NOT EXISTS creator_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL UNIQUE REFERENCES users(id),
    referral_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_creator_referrals_code ON creator_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_creator_referrals_creator ON creator_referrals(creator_id);

-- Enable RLS for referrals
ALTER TABLE creator_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Creators can view own referrals" ON creator_referrals
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Creators can create own referrals" ON creator_referrals
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Grant permissions for referrals
GRANT ALL ON creator_referrals TO authenticated;

-- ==================== UPDATED DASHBOARD VIEW ====================

-- Updated dashboard view with Stripe and premium template info
CREATE OR REPLACE VIEW creator_dashboard AS
SELECT
  u.id as creator_id,
  u.email,
  COUNT(DISTINCT t.id) as templates_created,
  COUNT(DISTINCT CASE WHEN t.is_premium THEN t.id END) as premium_templates,
  COUNT(cp.id) as total_uses,
  COALESCE(SUM(cp.creator_share), 0) as total_earnings,
  u.creator_balance as available_balance,
  COALESCE(SUM(cp.platform_fee), 0) as platform_earnings,
  u.stripe_account_id IS NOT NULL as stripe_connected,
  u.stripe_onboarding_complete,
  cr.referral_code,
  COUNT(DISTINCT ref_creator.id) as referred_creators
FROM users u
LEFT JOIN templates t ON u.id = t.creator_id
LEFT JOIN creator_payouts cp ON t.id = cp.template_id
LEFT JOIN creator_referrals cr ON u.id = cr.creator_id
LEFT JOIN creator_referrals ref_cr ON ref_cr.referral_code = u.referred_by
LEFT JOIN users ref_creator ON ref_cr.creator_id = ref_creator.id
WHERE u.creator_balance > 0 OR t.creator_id IS NOT NULL OR u.stripe_account_id IS NOT NULL
GROUP BY u.id, u.email, u.creator_balance, u.stripe_account_id, u.stripe_onboarding_complete, cr.referral_code;

-- ==================== SAMPLE DATA FOR TESTING ====================

-- Insert sample creator
-- INSERT INTO users (id, email, creator_balance, stripe_account_id, stripe_onboarding_complete)
-- VALUES (gen_random_uuid(), 'creator@test.com', 25.00, 'acct_test123', true)
-- ON CONFLICT (email) DO NOTHING;

-- Insert sample template
-- INSERT INTO templates (id, creator_id, name, is_premium, price_usd)
-- SELECT gen_random_uuid(), u.id, 'Sample Premium Template', true, 9.99
-- FROM users u WHERE u.email = 'creator@test.com'
-- LIMIT 1;

-- Insert sample referral
-- INSERT INTO creator_referrals (creator_id, referral_code)
-- SELECT u.id, 'TESTREF123'
-- FROM users u WHERE u.email = 'creator@test.com'
-- ON CONFLICT (creator_id) DO NOTHING;