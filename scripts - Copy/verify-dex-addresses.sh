#!/bin/bash

# DEX Address Verification Script for 0G Aristotle Post-Fork
# Verifies if the Router (0x0ff6...2537) and Factory (0x307b...BF91) addresses are still active

RPC_URL="https://rpc.0g.ai"

echo "🔍 Verifying DEX addresses on 0G Aristotle Mainnet..."
echo "RPC: $RPC_URL"
echo ""

# Function to check if contract exists at address
check_contract() {
  local name=$1
  local address=$2

  echo -n "Checking $name ($address)... "

  # Get contract code
  local response=$(curl -s -X POST "$RPC_URL" \
    -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$address\",\"latest\"],\"id\":1}")

  if echo "$response" | grep -q '"result":"0x"'; then
    echo "❌ NOT DEPLOYED (empty code)"
    return 1
  elif echo "$response" | grep -q '"result":"0x[0-9a-f]\{1,\}"'; then
    # Extract code length (rough estimate)
    local code=$(echo "$response" | grep -o '"result":"0x[^"]*"')
    local code_length=$((${#code} - 11)) # Remove 'result':'0x' and quotes
    echo "✅ DEPLOYED (${code_length} bytes)"
    return 0
  else
    echo "❓ ERROR: Could not verify"
    return 1
  fi
}

# Check the addresses mentioned by user
ROUTER_ADDRESS="0x0ff65f38fa43f0aac51901381acd7a8908ae2537"  # DEX Router
FACTORY_ADDRESS="0x307bFaA937768a073D41a2EbFBD952Be8E38BF91" # DEX Factory

echo "⚠️  Note: Using placeholder addresses. Update with actual addresses from your deployment logs."
echo ""

check_contract "Router" "$ROUTER_ADDRESS"
check_contract "Factory" "$FACTORY_ADDRESS"

echo ""
echo "If addresses are not deployed, run:"
echo "  npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle"