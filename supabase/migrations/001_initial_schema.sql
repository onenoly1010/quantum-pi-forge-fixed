-- Quantum Pi Forge Database Schema
-- Supabase PostgreSQL Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for storing wallet information and staking stats
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL, -- Ethereum address format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_staked DECIMAL(36,18) DEFAULT 0, -- OINIO token amount
    staking_count INTEGER DEFAULT 0,
    last_stake_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Transactions table for recording all staking activities
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL, -- Ethereum tx hash
    amount DECIMAL(36,18) NOT NULL, -- OINIO token amount
    type VARCHAR(20) NOT NULL CHECK (type IN ('stake', 'unstake', 'reward')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    block_number BIGINT,
    gas_used BIGINT,
    gas_price DECIMAL(36,18),
    network VARCHAR(20) DEFAULT 'polygon', -- blockchain network
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staking pools/rewards table (for future expansion)
CREATE TABLE IF NOT EXISTS staking_pools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_staked DECIMAL(36,18) DEFAULT 0,
    reward_rate DECIMAL(10,4) DEFAULT 0, -- Annual percentage yield
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User staking positions (for advanced staking features)
CREATE TABLE IF NOT EXISTS staking_positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    pool_id UUID REFERENCES staking_pools(id),
    amount DECIMAL(36,18) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_address ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_staking_positions_user ON staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_positions_wallet ON staking_positions(wallet_address);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.jwt() ->> 'sub' = id::text OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.jwt() ->> 'sub' = id::text OR wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Transactions are readable by the wallet owner
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Public read access for staking pools
CREATE POLICY "Public can view staking pools" ON staking_pools
    FOR SELECT USING (true);

-- Users can view their own staking positions
CREATE POLICY "Users can view own positions" ON staking_positions
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staking_pools_updated_at BEFORE UPDATE ON staking_pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default staking pool
INSERT INTO staking_pools (name, description, reward_rate) VALUES
('OINIO Main Pool', 'Primary staking pool for OINIO tokens with gasless transactions', 12.5)
ON CONFLICT DO NOTHING;