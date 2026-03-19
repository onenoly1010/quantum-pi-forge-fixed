# 🚀 OINIO Launch Setup & Configuration Guide

## Overview

This document guides you through the complete setup process for OINIO launch monitoring and deployment. The system monitors the 0G Guild for grant approval and automatically executes the flash launch when approved.

## 📋 Prerequisites

Before starting, ensure you have:

1. **0G Guild Account** - https://guild.0g.ai
2. **API Key from Guild** - For grant status monitoring
3. **Deployer Wallet** - With sufficient GAS tokens for deployment
4. **Discord Webhook** (optional) - For launch notifications
5. **Access to 0G Documentation** - https://docs.0g.ai

## 🔧 Configuration Steps

### Step 1: Get Your Guild API Key

1. Visit https://guild.0g.ai
2. Log in with your account
3. Navigate to **Settings → API Keys**
4. Create a new API key (or copy existing)
5. Copy the key to your clipboard

### Step 2: Get Your Grant ID

1. Go to **Grants** section in Guild dashboard
2. Find your OINIO grant
3. Copy the Grant ID (format: `grant_XXXXXX`)

### Step 3: Set Up Deployer Wallet

1. **Private Key**: Export from MetaMask or hardware wallet
   - MetaMask: Account Details → Export Private Key
   - **NEVER share this key publicly**

2. **Deployer Address**: Your wallet address (0x...)

3. **Funding**: Ensure your wallet has sufficient GAS tokens
   - For deployment: ~1-5 GAS
   - For liquidity: as configured in `.env.launch`

### Step 4: Configure Environment

```bash
# 1. Edit the launch configuration
cd /workspaces/quantum-pi-forge-fixed
nano .env.launch

# 2. Fill in the following fields:
```

**Required Fields:**

```dotenv
# Your Guild API key
GUILD_API_KEY=your_guild_api_key_here

# Your grant ID from Guild
0G_GRANT_ID=grant_XXXXXX

# Your deployer wallet
DEPLOYER_PRIVATE_KEY=0x...
DEPLOYER_ADDRESS=0x...

# 0G RPC endpoints (from docs.0g.ai)
0G_RPC_URL=https://rpc.0g.ai
BACKUP_RPC_URL=https://rpc-backup.0g.ai
```

**DEX Router Configuration:**

1. Visit https://docs.0g.ai
2. Look for **DEX Router Address** or **Uniswap V2 Compatible Router**
3. Fill in:

```dotenv
DEX_ROUTER_ADDRESS=0x...
DEX_FACTORY_ADDRESS=0x...
WGAS_ADDRESS=0x...
```

**Optional - Discord Notifications:**

```dotenv
# Create Discord webhook (Server Settings → Webhooks)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK
DISCORD_ALERTS_ENABLED=true
```

### Step 5: Verify Configuration

```bash
# Check that all required values are set
cat .env.launch | grep -E "^[A-Z]" | grep -v "^#"

# Should show your configured values (minus sensitive data)
```

## 🎯 Usage Guide

### Option A: Automated Grant Monitoring (Recommended)

This will continuously monitor the grant and auto-launch when approved:

```bash
# 1. Start the monitoring in the background
cd /workspaces/quantum-pi-forge-fixed
source .env.launch
bash scripts/monitor-grant.sh &

# 2. In another terminal, view the live dashboard
bash scripts/launch-dashboard.sh

# 3. Monitor will automatically trigger deployment when grant approved
```

### Option B: Manual Monitoring with Dashboard

If you prefer to manually control the launch:

```bash
# Terminal 1: View the dashboard
bash scripts/launch-dashboard.sh

# Terminal 2: Manually check grant status
curl -H "Authorization: Bearer $GUILD_API_KEY" \
  "https://api.guild.0g.ai/grants/$0G_GRANT_ID"

# Terminal 3: When approved, manually deploy
bash scripts/deploy.sh
```

### Option C: One-Time Manual Deployment

If you know the grant is already approved:

```bash
cd /workspaces/quantum-pi-forge-fixed
source .env.launch
bash scripts/deploy.sh
```

## 📊 Understanding the Dashboard

The launch dashboard shows real-time status:

```
╔════════════════════════════════════════════════╗
║  📊 SYSTEM STATUS                              ║
├────────────────────────────────────────────────┤
│ ✅ Backend API - Connected                     │
│ ✅ 0G RPC - Connected                          │
│ ✅ Disk Space - 50GB Available                 │
│                                                │
│ 🎖️  GRANT STATUS                              │
│ Grant ID: grant_XXXXXX                         │
│ ⏳ Status: PENDING (Waiting for approval)      │
│                                                │
│ ⚙️  CONFIGURATION                              │
│ ✅ All required configurations present         │
│                                                │
│ 🎯 DEPLOYMENT READINESS                        │
│ ✅ Deploy script exists                        │
│ ✅ Launch environment configured               │
│ ✅ SYSTEM READY FOR LAUNCH                     │
└────────────────────────────────────────────────┘
```

## 🚀 Deployment Flow

When grant is approved and deployment starts:

```
1. Verify Configuration
   └─ Check all required env vars are set

2. Deploy OINIO Token Contract
   └─ Contract deployed to 0G Aristotle Mainnet
   └─ Token contract initialized with supply

3. Create Liquidity Pool
   └─ OINIO/GAS pair created on DEX
   └─ Initial liquidity provided
   └─ Pool locked for configured duration

4. Enable Trading
   └─ Trading activated on token
   └─ Price impact limits enforced
   └─ Slippage settings applied

5. Announce Launch
   └─ Discord notifications sent
   └─ Twitter announcement (if configured)
   └─ Launch log recorded

6. Verify Success
   └─ RPC connectivity verified
   └─ Token deployment confirmed
   └─ Trading status confirmed
```

## 📝 Log Files

Logs are automatically created in the `logs/` directory:

```bash
# View deployment logs
tail -f logs/deploy.log

# View grant monitoring logs
tail -f logs/monitor-grant.log

# View all logs
cat logs/*.log
```

## ✅ Pre-Launch Checklist

Before going live, verify:

- [ ] GUILD_API_KEY is valid and has permissions
- [ ] 0G_GRANT_ID is correct (from your grant)
- [ ] DEPLOYER_PRIVATE_KEY is set and secure
- [ ] DEPLOYER_ADDRESS has sufficient GAS tokens (test on testnet first)
- [ ] DEX_ROUTER_ADDRESS is correct for 0G Aristotle
- [ ] 0G_RPC_URL is accessible and responding
- [ ] DISCORD_WEBHOOK_URL works (if using notifications)
- [ ] All scripts are executable: `ls -la scripts/*.sh`
- [ ] Build passes: `npm run build`

## 🧪 Testing Without Grant Approval

To test the system without actually waiting for grant approval:

```bash
# 1. Test monitoring script (will timeout but shows connection works)
timeout 10 bash scripts/monitor-grant.sh || true

# 2. Check RPC connectivity
curl -X POST "$0G_RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# 3. Check Guild API connectivity
curl -H "Authorization: Bearer $GUILD_API_KEY" \
  "https://api.guild.0g.ai/grants/$0G_GRANT_ID"

# 4. Test deployment script (dry-run)
bash scripts/deploy.sh  # Will show deployment plan without executing
```

## 🔒 Security Best Practices

1. **Private Keys**: Never commit `.env.launch` to git

   ```bash
   # Add to .gitignore if not already present
   echo ".env.launch" >> .gitignore
   git rm --cached .env.launch
   ```

2. **API Keys**: Use environment variables, not hardcoded

   ```bash
   # Load from file, don't echo values
   source .env.launch
   echo $GUILD_API_KEY  # Never do this in production
   ```

3. **Monitor Security**: Run monitor script in background on trusted server

   ```bash
   # Start in background with nohup
   nohup bash scripts/monitor-grant.sh > logs/monitor.log 2>&1 &
   ```

4. **Wallet Security**: Use hardware wallet or secure key management
   ```bash
   # Never export private key to terminal history
   unset DEPLOYER_PRIVATE_KEY  # Clear from memory after use
   ```

## 🆘 Troubleshooting

### Grant Status Check Fails

```bash
# Test Guild API connectivity
curl -I https://api.guild.0g.ai

# Verify API key format
echo "API Key length: ${#GUILD_API_KEY}"  # Should be >32 chars

# Check grant ID format
echo "Grant ID: $0G_GRANT_ID"  # Should start with "grant_"
```

### RPC Connection Fails

```bash
# Test RPC endpoint
curl -X POST "$0G_RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  -v

# Try backup RPC
curl -X POST "$BACKUP_RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Discord Notifications Not Sending

```bash
# Test webhook URL
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'

# Check webhook is enabled
echo "DISCORD_ALERTS_ENABLED=$DISCORD_ALERTS_ENABLED"
```

### Insufficient GAS for Deployment

```bash
# Check wallet balance on 0G Aristotle
# Visit: https://explorer.0g.ai
# Search for your DEPLOYER_ADDRESS

# Need to acquire more GAS:
# 1. Bridge from Ethereum via 0G bridge
# 2. Get testnet GAS from 0G faucet
# 3. Contact Guild support
```

## 📚 Additional Resources

- **0G Documentation**: https://docs.0g.ai
- **Guild Dashboard**: https://guild.0g.ai
- **0G Explorer**: https://explorer.0g.ai
- **0G Discord**: https://discord.gg/0g-xyz
- **Uniswap V2 Docs**: https://docs.uniswap.org/contracts/v2

## 🎯 Next Steps

1. ✅ Configure `.env.launch` with your values
2. ✅ Run pre-launch checklist
3. ✅ Test system connectivity
4. ✅ Start monitoring script: `bash scripts/monitor-grant.sh &`
5. ✅ View dashboard: `bash scripts/launch-dashboard.sh`
6. ✅ Await grant approval
7. ✅ Monitor will auto-deploy on approval

**Your OINIO launch system is ready!** 🚀
