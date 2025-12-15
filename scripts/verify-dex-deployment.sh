#!/bin/bash

################################################################################
# ✅ DEX Deployment Verification Script
#
# Verifies that Factory and Router were successfully deployed to 0G Aristotle
#
# Usage:
#   bash scripts/verify-dex-deployment.sh
#
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ✅ DEX Deployment Verification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Load environment
if [[ ! -f ".env.launch" ]]; then
  echo -e "${RED}Error: .env.launch not found${NC}"
  exit 1
fi

source .env.launch

# Helper to test RPC connectivity with retries
test_rpc() {
  local rpc_url=$1
  local attempts=3
  local timeout=3
  
  for ((i=1; i<=attempts; i++)); do
    response=$(timeout $timeout curl -s -X POST "$rpc_url" \
      -H "Content-Type: application/json" \
      --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null || true)
    
    if echo "$response" | grep -q '"result"'; then
      return 0
    fi
  done
  return 1
}

# RPC URL (use environment variable, with fallback)
RPC_URL="${ZERO_G_RPC_URL}"
BACKUP_RPC="${BACKUP_RPC_URL}"

if [[ -z "$RPC_URL" ]]; then
  RPC_URL="https://rpc.0g.ai"
fi

# Test RPC connectivity
echo "Testing RPC connectivity..."
if ! test_rpc "$RPC_URL"; then
  echo -e "${YELLOW}Primary RPC not responding, trying backup...${NC}"
  if [[ -n "$BACKUP_RPC" ]] && test_rpc "$BACKUP_RPC"; then
    RPC_URL="$BACKUP_RPC"
    echo -e "${GREEN}Using backup RPC${NC}"
  else
    echo -e "${YELLOW}Note: RPC endpoints may be under maintenance${NC}"
    echo -e "${YELLOW}Verification will attempt but may fail temporarily${NC}"
  fi
fi

# Helper function
check_contract() {
  local name=$1
  local address=$2

  if [[ -z "$address" ]]; then
    echo -e "${YELLOW}⚠ $name not set in .env.launch${NC}"
    return 1
  fi

  echo -n "Checking $name ($address)... "

  # Get contract code
  local code=$(curl -s -X POST "$RPC_URL" \
    -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$address\",\"latest\"],\"id\":1}")

  if echo "$code" | grep -q '"result":"0x"'; then
    echo -e "${RED}NOT DEPLOYED${NC}"
    return 1
  elif echo "$code" | grep -q '"result":"0x[0-9a-f]\{1,\}"'; then
    # Extract code length
    local code_length=$(echo "$code" | grep -o '"result":"0x[^"]*"' | wc -c)
    echo -e "${GREEN}✓ Deployed (size: $((($code_length-11)/2)) bytes)${NC}"
    return 0
  else
    echo -e "${RED}ERROR: Could not verify${NC}"
    return 1
  fi
}

# =============================================================================
# VERIFICATION
# =============================================================================

factory_ok=0
router_ok=0

echo "Verifying deployment on 0G Aristotle Mainnet..."
echo "RPC: $RPC_URL"
echo ""

if check_contract "Factory" "$DEX_FACTORY_ADDRESS"; then
  factory_ok=1
fi

if check_contract "Router" "$DEX_ROUTER_ADDRESS"; then
  router_ok=1
fi

echo ""

# =============================================================================
# RESULT
# =============================================================================

if [[ $factory_ok -eq 1 && $router_ok -eq 1 ]]; then
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ DEX DEPLOYMENT VERIFIED${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "${GREEN}Factory:${NC} $DEX_FACTORY_ADDRESS"
  echo -e "${GREEN}Router:${NC}  $DEX_ROUTER_ADDRESS"
  echo ""
  echo "Next step: Create OINIO/WGAS liquidity pool"
  echo "  bash scripts/create-liquidity-pool.sh"
  echo ""
  exit 0
else
  echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}  ❌ DEX DEPLOYMENT NOT COMPLETE${NC}"
  echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Deployment may still be pending. Check logs:"
  echo "  tail -f logs/uniswap-v2-deployment.log"
  echo ""
  exit 1
fi
