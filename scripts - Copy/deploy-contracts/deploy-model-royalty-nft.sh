#!/bin/bash
#═══════════════════════════════════════════════════════════════════
# 🎭 ModelRoyaltyNFT Deployment Script
# Target: 0G Mainnet (Chain ID: 16661)
# Contract: pi-mr-nft-contracts/contracts/ModelRoyaltyNFT.sol
#═══════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎭 MODELROYALTYNFT DEPLOYMENT TO 0G MAINNET${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Configuration
ZERO_G_RPC="https://evmrpc.0g.ai"
CHAIN_ID=16661
DEPLOYER_ADDRESS="0x353663cd664bB3e034Dc0f308D8896C0a242e4cd"

# Check environment variables
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: DEPLOYER_PRIVATE_KEY not set${NC}"
    echo "Export your private key:"
    echo "  export DEPLOYER_PRIVATE_KEY='your-private-key'"
    exit 1
fi

# Check balance
echo "📊 Checking deployer balance..."
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $ZERO_G_RPC 2>/dev/null || echo "0")
echo "   Deployer: $DEPLOYER_ADDRESS"
echo "   Balance: $BALANCE wei"

if [ "$BALANCE" = "0" ]; then
    echo -e "${YELLOW}⚠️  Warning: Balance is 0. Deployment will fail.${NC}"
    echo "   Fund your wallet first, then re-run this script."
    exit 1
fi

echo ""
echo "🔧 Deployment Configuration:"
echo "   RPC URL: $ZERO_G_RPC"
echo "   Chain ID: $CHAIN_ID"
echo "   CatalystPool: $DEPLOYER_ADDRESS (temporary, update later)"
echo ""

# Confirm deployment
read -p "Proceed with deployment? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🚀 Deploying ModelRoyaltyNFT..."

# Deploy using Foundry
forge create \
    --rpc-url $ZERO_G_RPC \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --constructor-args $DEPLOYER_ADDRESS \
    --legacy \
    contracts/ModelRoyaltyNFT.sol:ModelRoyaltyNFT

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Save the contract address from output above"
echo "   2. Update CatalystPool to dedicated contract when ready"
echo "   3. Verify on 0G Explorer: https://chainscan.0g.ai"
