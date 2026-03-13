#!/bin/bash
# Verify DEX deployment on 0G Aristotle
# Usage: bash scripts/verify-dex-deployment.sh

RPC="https://evmrpc.0g.ai"
FACTORY="${DEX_FACTORY_ADDRESS}"
ROUTER="${DEX_ROUTER_ADDRESS}"

echo "🔍 Verifying DEX Deployment..."
echo ""
echo "Factory: $FACTORY"
echo "Router: $ROUTER"
echo ""

# Check Factory
FACTORY_CODE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$FACTORY\",\"latest\"],\"id\":1}" \
  $RPC | jq -r '.result')

if [ "$FACTORY_CODE" = "0x" ]; then
  echo "❌ Factory not deployed at $FACTORY"
else
  echo "✅ Factory deployed at $FACTORY"
fi

# Check Router
ROUTER_CODE=$(curl -s -X POST -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$ROUTER\",\"latest\"],\"id\":1}" \
  $RPC | jq -r '.result')

if [ "$ROUTER_CODE" = "0x" ]; then
  echo "❌ Router not deployed at $ROUTER"
else
  echo "✅ Router deployed at $ROUTER"
fi

echo ""
echo "Next: bash scripts/create-liquidity-pool.sh"
