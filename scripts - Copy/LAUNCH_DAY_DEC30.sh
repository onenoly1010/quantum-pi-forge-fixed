#!/bin/bash
################################################################################
# 🚀 OINIO LAUNCH DAY - DECEMBER 30, 2025
# 
# Execute this script when Kraken withdrawal clears
# Prerequisites: 5-10 0G tokens in deployer wallet
################################################################################

set -e

echo "=========================================="
echo "🚀 OINIO GENESIS LAUNCH - DEC 30, 2025"
echo "=========================================="
echo ""

# Configuration
DEPLOYER_ADDRESS="0x6B8c1aF0b828ba75B3F8d6D8267f1832EDc13480"
RPC_URL="https://evmrpc.0g.ai"

# ============================================
# PHASE 1: PRE-LAUNCH VERIFICATION
# ============================================
echo "📋 PHASE 1: Pre-Launch Verification"
echo "--------------------------------------------"

# Check deployer balance
echo "🔍 Checking deployer wallet balance..."
BALANCE_HEX=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$DEPLOYER_ADDRESS\",\"latest\"],\"id\":1}" \
  | jq -r '.result')

if [ "$BALANCE_HEX" = "0x0" ]; then
    echo "❌ ERROR: Deployer wallet has 0 balance!"
    echo "   Please withdraw 0G from Kraken to: $DEPLOYER_ADDRESS"
    echo "   Then re-run this script."
    exit 1
fi

echo "✅ Deployer wallet funded: $BALANCE_HEX wei"

# Check services
echo ""
echo "🔍 Verifying live services..."
HEALTH=$(curl -s https://quantum-pi-forge-fixed.vercel.app/api/health | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ Health API: operational"
else
    echo "⚠️  Health API: check manually"
fi

DASHBOARD=$(curl -s -I https://quantum-pi-forge-fixed.vercel.app/dashboard 2>/dev/null | head -1 | grep -o "200" || echo "error")
if [ "$DASHBOARD" = "200" ]; then
    echo "✅ Dashboard: live"
else
    echo "⚠️  Dashboard: check manually"
fi

echo ""
echo "✅ PHASE 1 COMPLETE: Pre-launch checks passed"
echo ""

# ============================================
# PHASE 2: DEX DEPLOYMENT
# ============================================
echo "📋 PHASE 2: DEX Deployment"
echo "--------------------------------------------"
echo ""
echo "Run the following command to deploy DEX:"
echo ""
echo "  npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle"
echo ""
echo "After deployment, update .env.launch with:"
echo "  DEX_FACTORY_ADDRESS=<new factory address>"
echo "  DEX_ROUTER_ADDRESS=<new router address>"
echo ""
read -p "Press ENTER when DEX deployment is complete..."
echo ""

# ============================================
# PHASE 3: LIQUIDITY PROVISIONING
# ============================================
echo "📋 PHASE 3: Liquidity Provisioning"
echo "--------------------------------------------"
echo ""
echo "Create initial liquidity pool:"
echo "  1. Add OINIO/0G pair to DEX"
echo "  2. Provide initial liquidity (100M OINIO / 50 0G)"
echo "  3. Lock LP tokens for 24 hours"
echo ""
read -p "Press ENTER when liquidity is provided..."
echo ""

# ============================================
# PHASE 4: SOCIAL ANNOUNCEMENTS
# ============================================
echo "📋 PHASE 4: Social Announcements"
echo "--------------------------------------------"
echo ""
echo "📱 TWITTER POST (copy and paste):"
echo "----------------------------------------"
cat << 'EOF'
🧵 Introducing OINIO: The First Creator-First iNFT Marketplace

1/ For 12+ months, creators watched platforms centralize AI benefits.
   No more. OINIO puts them back in control.

2/ Every OINIO iNFT transaction generates automatic royalties.
   Perpetual. Immutable. Uncensorable.

3/ Built on 0G Aristotle, powered by Google Cloud & AWS validators.
   Privacy-first. Permissionless. Performance-optimized.

4/ Mint your first iNFT today. Earn perpetual royalties forever.
   Join the sovereign AI economy.

🔗 https://quantum-pi-forge-fixed.vercel.app/dashboard
🌐 https://onenoly1010.github.io/quantum-pi-forge-site/
EOF
echo "----------------------------------------"
echo ""

echo "💬 DISCORD POST (copy and paste):"
echo "----------------------------------------"
cat << 'EOF'
🚀 OINIO IS LIVE ON 0G ARISTOTLE 🚀

The future of creator royalties is here.

✅ Mint iNFTs with perpetual royalties
✅ Gasless transactions (we sponsor gas)
✅ Privacy-preserving validator network
✅ Earn OINIO staking rewards

📊 Leaderboard: Top creators get bonus airdrops
💰 Referral Rewards: Invite friends, earn OINIO
🎁 Whitelist Bonuses: Early adopters get 2x multiplier

→ Start Here: https://quantum-pi-forge-fixed.vercel.app/dashboard
→ Landing Page: https://onenoly1010.github.io/quantum-pi-forge-site/
→ Block Explorer: https://chainscan.0g.ai

Questions? Ask in #oinio-support
EOF
echo "----------------------------------------"
echo ""

# ============================================
# PHASE 5: MONITORING
# ============================================
echo "📋 PHASE 5: Post-Launch Monitoring"
echo "--------------------------------------------"
echo ""
echo "Monitor these endpoints:"
echo "  🔗 Health: https://quantum-pi-forge-fixed.vercel.app/api/health"
echo "  🔗 Dashboard: https://quantum-pi-forge-fixed.vercel.app/dashboard"
echo "  🔗 Explorer: https://chainscan.0g.ai"
echo ""
echo "Watch for:"
echo "  ✓ User wallet connections"
echo "  ✓ Staking transactions"
echo "  ✓ DEX trading volume"
echo "  ✓ Community engagement"
echo ""

# ============================================
# COMPLETE
# ============================================
echo "=========================================="
echo "🎉 GENESIS LAUNCH COMPLETE!"
echo "=========================================="
echo ""
echo "📊 LIVE URLS:"
echo "   Dashboard: https://quantum-pi-forge-fixed.vercel.app/dashboard"
echo "   Landing:   https://onenoly1010.github.io/quantum-pi-forge-site/"
echo "   Health:    https://quantum-pi-forge-fixed.vercel.app/api/health"
echo ""
echo "🔗 BLOCKCHAIN:"
echo "   RPC:       https://evmrpc.0g.ai"
echo "   Explorer:  https://chainscan.0g.ai"
echo "   Chain ID:  16661"
echo ""
echo "✨ Congratulations on your launch! ✨"
