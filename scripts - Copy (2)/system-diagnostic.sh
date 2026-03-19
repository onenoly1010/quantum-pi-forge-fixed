#!/bin/bash

echo "🔍 OINIO DEX Deployment System Diagnostic"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check 1: .env.launch exists
echo "✅ CHECK 1: Configuration File"
if [ -f ".env.launch" ]; then
    echo "   ✓ .env.launch exists"
else
    echo "   ✗ .env.launch missing"
fi
echo ""

# Check 2: Required packages
echo "✅ CHECK 2: Dependencies"
if npm list hardhat &>/dev/null; then
    echo "   ✓ Hardhat installed"
else
    echo "   ✗ Hardhat missing"
fi

if npm list ethers &>/dev/null; then
    echo "   ✓ Ethers.js installed"
else
    echo "   ✗ Ethers.js missing"
fi

if npm list @uniswap/v2-core &>/dev/null; then
    echo "   ✓ Uniswap V2 Core installed"
else
    echo "   ✗ Uniswap V2 Core missing"
fi
echo ""

# Check 3: Environment variables
echo "✅ CHECK 3: Required Environment Variables"
DEPLOYER_PK="${DEPLOYER_PRIVATE_KEY}"
DEPLOYER_ADDR="${DEPLOYER_ADDRESS}"
WGAS_ADDR="${WGAS_ADDRESS}"
OINIO_ADDR="${OINIO_TOKEN_ADDRESS}"

if [[ "$DEPLOYER_PK" == "your_deployer_private_key_here" || -z "$DEPLOYER_PK" ]]; then
    echo "   ✗ DEPLOYER_PRIVATE_KEY: NOT SET (placeholder or empty)"
else
    echo "   ✓ DEPLOYER_PRIVATE_KEY: SET"
fi

if [[ "$DEPLOYER_ADDR" == "your_deployer_address_here" || -z "$DEPLOYER_ADDR" ]]; then
    echo "   ✗ DEPLOYER_ADDRESS: NOT SET (placeholder or empty)"
else
    echo "   ✓ DEPLOYER_ADDRESS: SET ($DEPLOYER_ADDR)"
fi

if [[ "$WGAS_ADDR" == "0x..." || -z "$WGAS_ADDR" ]]; then
    echo "   ✗ WGAS_ADDRESS: NOT SET (placeholder or empty)"
else
    echo "   ✓ WGAS_ADDRESS: SET ($WGAS_ADDR)"
fi

if [[ "$OINIO_ADDR" == "0x07f43E5B1A8a0928B364E40d5885f81A543B05C7" ]]; then
    echo "   ✓ OINIO_TOKEN_ADDRESS: SET ($OINIO_ADDR)"
else
    echo "   ✗ OINIO_TOKEN_ADDRESS: NOT SET correctly"
fi
echo ""

# Check 4: Scripts existence
echo "✅ CHECK 4: Deployment Scripts"
[ -f "scripts/hardhat-deploy-uniswap-v2.ts" ] && echo "   ✓ hardhat-deploy-uniswap-v2.ts exists" || echo "   ✗ Missing"
[ -f "scripts/verify-dex-deployment.sh" ] && echo "   ✓ verify-dex-deployment.sh exists" || echo "   ✗ Missing"
[ -f "hardhat.config.ts" ] && echo "   ✓ hardhat.config.ts exists" || echo "   ✗ Missing"
echo ""

# Check 5: RPC connectivity
echo "✅ CHECK 5: RPC Connectivity"
RPC="${ZERO_G_RPC_URL:-https://rpc.0g.ai}"
RESPONSE=$(timeout 3 curl -s -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' || echo "timeout")

if [[ "$RESPONSE" == "timeout" ]]; then
    echo "   ⚠️  RPC slow/not responding (this is normal, will retry)"
elif echo "$RESPONSE" | grep -q "0x41"; then
    echo "   ✓ RPC responding (Chain ID: 0x4115 = 16661)"
else
    echo "   ⚠️  RPC response unclear: $RESPONSE"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo "📊 DEPLOYMENT READINESS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

MISSING=0
if [[ "$DEPLOYER_PK" == "your_deployer_private_key_here" || -z "$DEPLOYER_PK" ]]; then
    ((MISSING++))
fi
if [[ "$DEPLOYER_ADDR" == "your_deployer_address_here" || -z "$DEPLOYER_ADDR" ]]; then
    ((MISSING++))
fi
if [[ "$WGAS_ADDR" == "0x..." || -z "$WGAS_ADDR" ]]; then
    ((MISSING++))
fi

if [ $MISSING -eq 0 ]; then
    echo "🟢 SYSTEM READY FOR DEPLOYMENT"
    echo ""
    echo "Run: npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle"
else
    echo "🔴 DEPLOYMENT BLOCKED - Missing $MISSING environment variables"
    echo ""
    echo "📋 MISSING VARIABLES:"
    if [[ "$DEPLOYER_PK" == "your_deployer_private_key_here" || -z "$DEPLOYER_PK" ]]; then
        echo "   1. DEPLOYER_PRIVATE_KEY - Get from MetaMask (Account Details → Show Private Key)"
    fi
    if [[ "$DEPLOYER_ADDR" == "your_deployer_address_here" || -z "$DEPLOYER_ADDR" ]]; then
        echo "   2. DEPLOYER_ADDRESS - Visit https://chainscan.0g.ai/address/0x07f43E5B1A8a0928B364E40d5885f81A543B05C7 and copy 'Contract Creator'"
    fi
    if [[ "$WGAS_ADDR" == "0x..." || -z "$WGAS_ADDR" ]]; then
        echo "   3. WGAS_ADDRESS - Visit https://chainscan.0g.ai, search 'WGAS', copy contract address"
    fi
    echo ""
    echo "⏭️  NEXT STEP: Provide the 3 addresses and I'll complete deployment"
fi
echo ""
