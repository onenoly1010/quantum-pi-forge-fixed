#!/bin/bash

echo "🔍 Searching for OINIO token and WGAS addresses on 0G Aristotle..."
echo ""

# OINIO token address (we already know this)
OINIO="0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"

# Try to get contract info from 0G block explorer API
echo "📡 Querying 0G Block Explorer API..."
echo ""

# Try standard Etherscan-like API endpoint
RPC_URL="https://rpc.0g.ai"

echo "Checking OINIO token ($OINIO)..."
curl -s -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$OINIO\",\"latest\"],\"id\":1}" | head -c 100
echo ""
echo ""

echo "🌐 To find the exact addresses, visit these in your browser:"
echo ""
echo "1️⃣  DEPLOYER ADDRESS:"
echo "   https://chainscan.0g.ai/address/0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"
echo "   ➜ Look for 'Contract Creator' field"
echo ""
echo "2️⃣  WGAS ADDRESS (Wrapped 0G):"
echo "   https://chainscan.0g.ai"
echo "   ➜ Search: 'WGAS' or 'Wrapped'"
echo "   ➜ Or search: 'W0G'"
echo ""
echo "3️⃣  Common WGAS addresses on 0G (try these if you find them):"
echo "   - 0x... (check docs.0g.ai)"
echo ""
echo "📋 Once you have them, provide in format:"
echo "   DEPLOYER_ADDRESS=0x..."
echo "   WGAS_ADDRESS=0x..."
echo "   DEPLOYER_PRIVATE_KEY=0x..."
echo ""
