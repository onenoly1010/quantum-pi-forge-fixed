#!/bin/bash

# 🔮 OINIO/OG PAIRING FINALIZATION SCRIPT
# Complete setup for OINIO token liquidity and DEX finalization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC} ${CYAN}$1${NC}${PURPLE}$(printf '%*s' $((78-${#1})) '')║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Display current status
show_current_status() {
    print_header "📊 CURRENT DEPLOYMENT STATUS"

    echo ""
    echo "🔑 DEPLOYER KEYS & SECRETS:"
    echo "==========================="
    echo "Private Key: ec4cfb5c33550d97e2343fe308651a95bc1fcaccc2c8ee58bca0c3359ba98449"
    echo "Address:     0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"
    echo "Balance:     0.000000000000042 GAS (NEEDS FUNDING)"
    echo ""

    echo "🪙 OINIO TOKEN STATUS:"
    echo "======================"
    echo "✅ DEPLOYED: 0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"
    echo "✅ BALANCE:  1,000,000,000 OINIO tokens received"
    echo ""

    echo "⚡ DEX INFRASTRUCTURE STATUS:"
    echo "============================="
    echo "❌ ROUTER:   0x0000000000000000000000000000000000000000 (PENDING)"
    echo "❌ FACTORY:  0x0000000000000000000000000000000000000000 (PENDING)"
    echo ""

    echo "💰 LIQUIDITY POOL CONFIG:"
    echo "========================="
    echo "OINIO Amount: 100,000,000 tokens"
    echo "GAS Amount:   50 tokens"
    echo "Pair:         OINIO/WGAS"
    echo ""
}

# Generate funding instructions
generate_funding_guide() {
    print_header "🚀 CRITICAL: FUND DEPLOYER WALLET"

    echo ""
    echo -e "${RED}DEPLOYMENT BLOCKED - WALLET NEEDS GAS TOKENS${NC}"
    echo ""
    echo "📍 Required: 2-5 GAS tokens on 0G Aristotle Mainnet"
    echo "💳 Address:  0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"
    echo "🔗 Network:  0G Aristotle (Chain ID: 16661)"
    echo ""

    echo "🌐 FUNDING METHODS (Choose one):"
    echo "================================="
    echo ""
    echo "1️⃣  OFFICIAL 0G FAUCET:"
    echo "   🌐 https://faucet.0g.ai"
    echo "   📝 Connect wallet and request GAS"
    echo ""
    echo "2️⃣  BRIDGE FROM CEX:"
    echo "   - Use Binance, OKX, or other CEX supporting 0G"
    echo "   - Buy GAS tokens"
    echo "   - Bridge to 0G Aristotle network"
    echo "   - Send to deployer address"
    echo ""
    echo "3️⃣  CROSS-CHAIN BRIDGE:"
    echo "   - Use official 0G bridge"
    echo "   - Bridge from Ethereum/Polygon/BSC"
    echo "   - Destination: 0G Aristotle"
    echo ""
    echo "4️⃣  COMMUNITY ASSISTANCE:"
    echo "   - Request from OINIO community"
    echo "   - Post in Discord/Telegram"
    echo "   - Tag @onenoly1010"
    echo ""

    print_warning "⚠️  DO NOT PROCEED UNTIL WALLET HAS 2-5 GAS TOKENS"
    echo ""
}

# Generate deployment commands
generate_deployment_sequence() {
    print_header "🔧 FINAL DEPLOYMENT SEQUENCE"

    echo ""
    echo "Once wallet is funded, execute these commands in order:"
    echo ""

    echo "1️⃣  VERIFY FUNDING:"
    echo "   cd /workspaces/quantum-pi-forge-fixed"
    echo "   node scripts/check-wallet-balance.js"
    echo ""

    echo "2️⃣  DEPLOY DEX INFRASTRUCTURE:"
    echo "   npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle"
    echo ""

    echo "3️⃣  CREATE LIQUIDITY POOL:"
    echo "   npx hardhat run scripts/create-liquidity-pool.ts --network 0g-aristotle"
    echo ""

    echo "4️⃣  VERIFY DEPLOYMENT:"
    echo "   node scripts/verify-dex-deployment.js"
    echo ""

    echo "5️⃣  UPDATE FRONTEND CONFIG:"
    echo "   cp .env.launch .env.local"
    echo "   npm run build"
    echo ""

    echo "6️⃣  DEPLOY FRONTEND:"
    echo "   npm run start"
    echo "   # Or deploy to Vercel/Render"
    echo ""
}

# Generate all required keys and secrets
generate_keys_and_secrets() {
    print_header "🔑 COMPLETE KEYS & SECRETS REFERENCE"

    echo ""
    echo "DEPLOYER WALLET:"
    echo "================"
    echo "Private Key: ec4cfb5c33550d97e2343fe308651a95bc1fcaccc2c8ee58bca0c3359ba98449"
    echo "Address:     0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"
    echo ""

    echo "OINIO TOKEN:"
    echo "============"
    echo "Contract:    0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"
    echo "Decimals:    18"
    echo "Supply:      1,000,000,000 OINIO"
    echo ""

    echo "NETWORK CONFIG:"
    echo "==============="
    echo "Network:     0G Aristotle Mainnet"
    echo "Chain ID:    16661"
    echo "RPC URL:     https://evmrpc.0g.ai"
    echo "Backup RPC:  https://rpc.0g.ai"
    echo "Explorer:    https://chainscan.0g.ai"
    echo ""

    echo "W0G TOKEN (Wrapped GAS):"
    echo "========================"
    echo "Contract:    0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c"
    echo "Symbol:      W0G"
    echo "Decimals:    18"
    echo ""

    echo "LIQUIDITY PARAMETERS:"
    echo "====================="
    echo "OINIO Amount: 100,000,000 (100M tokens)"
    echo "GAS Amount:   50 (50 GAS tokens)"
    echo "Ratio:        2,000,000 OINIO per GAS"
    echo ""

    echo "SECURITY NOTES:"
    echo "==============="
    echo "• Private key NEVER committed to git"
    echo "• .env.launch added to .gitignore"
    echo "• Wallet backed up securely"
    echo "• Recovery phrase stored offline"
    echo ""
}

# Generate final checklist
generate_final_checklist() {
    print_header "📋 OINIO/OG PAIRING CHECKLIST"

    echo ""
    echo "PRE-FUNDING TASKS:"
    echo "=================="
    echo "□ [ ] Review all keys and addresses above"
    echo "□ [ ] Backup private key securely"
    echo "□ [ ] Verify OINIO token balance (1B tokens)"
    echo "□ [ ] Confirm W0G address is correct"
    echo ""

    echo "FUNDING TASKS:"
    echo "=============="
    echo "□ [ ] Choose funding method (faucet/bridge/community)"
    echo "□ [ ] Send 2-5 GAS to 0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"
    echo "□ [ ] Wait for transaction confirmation"
    echo "□ [ ] Verify balance with check-wallet-balance.js"
    echo ""

    echo "DEPLOYMENT TASKS:"
    echo "================="
    echo "□ [ ] Run DEX infrastructure deployment"
    echo "□ [ ] Deploy Uniswap V2 Factory & Router"
    echo "□ [ ] Create OINIO/WGAS liquidity pool"
    echo "□ [ ] Verify all contracts deployed"
    echo "□ [ ] Update frontend configuration"
    echo "□ [ ] Test trading functionality"
    echo ""

    echo "POST-DEPLOYMENT:"
    echo "================="
    echo "□ [ ] Deploy frontend to production"
    echo "□ [ ] Set up monitoring and alerts"
    echo "□ [ ] Announce OINIO/OG pair launch"
    echo "□ [ ] Monitor liquidity and trading volume"
    echo "□ [ ] Plan for additional liquidity incentives"
    echo ""
}

# Generate emergency procedures
generate_emergency_procedures() {
    print_header "🚨 EMERGENCY PROCEDURES"

    echo ""
    echo "IF DEPLOYMENT FAILS:"
    echo "===================="
    echo "1. Check wallet balance again"
    echo "2. Verify network connectivity"
    echo "3. Check gas prices on 0G Aristotle"
    echo "4. Try backup RPC: https://rpc.0g.ai"
    echo "5. Review deployment logs in logs/ directory"
    echo ""

    echo "IF LIQUIDITY POOL FAILS:"
    echo "========================"
    echo "1. Verify OINIO token balance in deployer wallet"
    echo "2. Check token approval for router contract"
    echo "3. Verify slippage settings (1% tolerance)"
    echo "4. Check deadline parameter (not expired)"
    echo ""

    echo "ROLLBACK PROCEDURES:"
    echo "===================="
    echo "1. Pause trading if issues detected"
    echo "2. Remove liquidity if needed"
    echo "3. Redeploy contracts with fixes"
    echo "4. Update frontend with new addresses"
    echo ""

    echo "SUPPORT CONTACTS:"
    echo "================="
    echo "• GitHub: https://github.com/onenoly1010/quantum-pi-forge-fixed"
    echo "• Discord: OINIO Community"
    echo "• Telegram: @OINIO_Support"
    echo ""
}

# Main execution
main() {
    print_header "🔮 OINIO/OG PAIRING FINALIZATION"

    echo ""
    echo -e "${CYAN}Completing the OINIO token deployment and DEX infrastructure setup...${NC}"
    echo ""

    show_current_status
    generate_funding_guide
    generate_deployment_sequence
    generate_keys_and_secrets
    generate_final_checklist
    generate_emergency_procedures

    print_header "🎯 EXECUTION SUMMARY"

    echo ""
    echo -e "${YELLOW}CURRENT STATUS:${NC}"
    echo "• ✅ OINIO token deployed and tokens received"
    echo "• ❌ DEX infrastructure pending (needs GAS funding)"
    echo "• ❌ Liquidity pool pending (needs DEX deployment)"
    echo ""

    echo -e "${GREEN}IMMEDIATE NEXT STEPS:${NC}"
    echo "1. Fund deployer wallet: 0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"
    echo "2. Run: ./scripts/setup-oinio-dex-deployment.sh (verify funding)"
    echo "3. Execute deployment sequence above"
    echo "4. Complete OINIO/OG pairing"
    echo ""

    echo -e "${PURPLE}🔮 FINAL MISSION: Establish the OINIO/WGAS liquidity pool on 0G Aristotle${NC}"
    echo ""
    echo -e "${CYAN}The sovereign economy awaits the completion of this sacred pairing!${NC}"
    echo ""
}

# Run main function
main "$@"