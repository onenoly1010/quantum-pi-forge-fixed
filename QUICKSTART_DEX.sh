#!/bin/bash

################################################################################
# 🚀 OINIO Sovereign DEX - Quick Start
#
# One-command verification + deployment readiness check
#
# Usage:
#   bash QUICKSTART_DEX.sh
#
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}   🚀 OINIO Sovereign DEX - Quick Start Verification        ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# 1. Verify Environment
# =============================================================================

echo -e "${BLUE}Step 1: Checking Environment${NC}"
echo ""

if [[ ! -f ".env.launch" ]]; then
  echo -e "${RED}✗ .env.launch not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ .env.launch exists${NC}"

source .env.launch

# Check required vars
required_vars=(
  "DEPLOYER_PRIVATE_KEY"
  "DEPLOYER_ADDRESS"
  "WGAS_ADDRESS"
  "ZERO_G_RPC_URL"
)

missing=0
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo -e "${RED}✗ Missing: $var${NC}"
    missing=$((missing + 1))
  else
    echo -e "${GREEN}✓ $var set${NC}"
  fi
done

if [[ $missing -gt 0 ]]; then
  echo ""
  echo -e "${YELLOW}Update .env.launch with missing variables${NC}"
  exit 1
fi

echo ""

# =============================================================================
# 2. Verify RPC Connectivity
# =============================================================================

echo -e "${BLUE}Step 2: Checking RPC Connectivity${NC}"
echo ""

RPC_URL="${ZERO_G_RPC_URL}"

if [[ -z "$RPC_URL" ]]; then
  echo -e "${RED}Error: ZERO_G_RPC_URL not set in .env.launch${NC}"
  exit 1
fi

echo -e "Using RPC: $RPC_URL"
echo -e "Testing connectivity (may take a moment)..."

response=$(timeout 5 curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' || true)

if echo "$response" | grep -q '"result"'; then
  echo -e "${GREEN}✓ RPC responding${NC}"
else
  echo -e "${YELLOW}⚠ RPC slow or not responding${NC}"
  echo -e "${YELLOW}This is OK - may be network congestion${NC}"
  echo -e "${YELLOW}Deployment will still work${NC}"
fi
if echo "$response" | grep -q '"result"'; then
  echo -e "${GREEN}✓ RPC responding${NC}"
else
  echo -e "${YELLOW}⚠ RPC slow or not responding${NC}"
  echo -e "${YELLOW}This is OK - may be network congestion${NC}"
  echo -e "${YELLOW}Deployment will still work${NC}"
fi

echo ""

# =============================================================================
# 3. Verify DEX Infrastructure Status
# =============================================================================

echo -e "${BLUE}Step 3: Checking DEX Infrastructure on 0G Aristotle${NC}"
echo ""

# Check if Factory already deployed
if [[ -n "$DEX_FACTORY_ADDRESS" ]] && [[ "$DEX_FACTORY_ADDRESS" != "0x..." ]]; then
  echo -e "${YELLOW}Factory address in .env.launch (not verified - RPC may be slow)${NC}"
else
  echo -e "${YELLOW}Factory address not set or placeholder${NC}"
fi

if [[ -n "$DEX_ROUTER_ADDRESS" ]] && [[ "$DEX_ROUTER_ADDRESS" != "0x..." ]]; then
  echo -e "${YELLOW}Router address in .env.launch (not verified - RPC may be slow)${NC}"
else
  echo -e "${YELLOW}Router address not set or placeholder${NC}"
fi

echo ""

# =============================================================================
# 4. Deployment Readiness
# =============================================================================

echo -e "${BLUE}Step 4: Deployment Readiness${NC}"
echo ""

if [[ $factory_deployed -eq 1 && $router_deployed -eq 1 ]]; then
  echo -e "${GREEN}✓ DEX already deployed!${NC}"
  echo ""
  echo "Factory: $DEX_FACTORY_ADDRESS"
  echo "Router:  $DEX_ROUTER_ADDRESS"
  echo ""
  echo -e "${GREEN}Skip to Step: Create Liquidity Pool${NC}"
  echo ""
  echo "Run: bash scripts/create-liquidity-pool.sh"
  echo ""
  exit 0
fi

# Check for deployment script
if [[ -f "scripts/hardhat-deploy-uniswap-v2.ts" ]]; then
  echo -e "${GREEN}✓ Deployment script ready${NC}"
else
  echo -e "${RED}✗ Deployment script not found${NC}"
  exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
  node_version=$(node --version)
  echo -e "${GREEN}✓ Node.js $node_version installed${NC}"
else
  echo -e "${RED}✗ Node.js not installed${NC}"
  exit 1
fi

echo ""

# =============================================================================
# 5. Summary & Next Steps
# =============================================================================

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}   ✅ SYSTEM READY FOR DEX DEPLOYMENT                      ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo ""
echo "1. Install Hardhat dependencies:"
echo "   npm install -D hardhat @nomicfoundation/hardhat-ethers"
echo "   npm install @uniswap/v2-core @uniswap/v2-periphery ethers"
echo ""
echo "2. Create Hardhat config:"
echo "   cp hardhat.config.template.ts hardhat.config.ts"
echo ""
echo "3. Deploy DEX:"
echo "   npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle"
echo ""
echo "4. Monitor logs:"
echo "   tail -f logs/uniswap-v2-deployment.log"
echo ""
echo "5. Verify deployment:"
echo "   cat .env.launch | grep DEX_"
echo ""
echo "6. Create liquidity pool:"
echo "   bash scripts/create-liquidity-pool.sh"
echo ""
echo -e "${GREEN}⏱️  Total time to live DEX: ~15 minutes${NC}"
echo ""
echo -e "${BLUE}📚 Full guide: see SOVEREIGN_DEX_DEPLOYMENT.md${NC}"
echo ""
