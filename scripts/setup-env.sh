#!/bin/bash

echo "🚀 OINIO DEX Environment Setup"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "This script will help you configure .env.launch"
echo ""
echo "You need 3 values:"
echo "  1. DEPLOYER_ADDRESS (your 0G wallet address)"
echo "  2. WGAS_ADDRESS (Wrapped 0G token address)"
echo "  3. DEPLOYER_PRIVATE_KEY (your private key)"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

read -p "Enter DEPLOYER_ADDRESS (0x...): " DEPLOYER_ADDR
read -p "Enter WGAS_ADDRESS (0x...): " WGAS_ADDR
read -sp "Enter DEPLOYER_PRIVATE_KEY (0x...): " DEPLOYER_KEY
echo ""

# Validate addresses
if [[ ! $DEPLOYER_ADDR =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "❌ Invalid DEPLOYER_ADDRESS format"
    exit 1
fi

if [[ ! $WGAS_ADDR =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "❌ Invalid WGAS_ADDRESS format"
    exit 1
fi

if [[ ! $DEPLOYER_KEY =~ ^0x[a-fA-F0-9]{64}$ ]]; then
    echo "❌ Invalid DEPLOYER_PRIVATE_KEY format (should be 0x + 64 hex chars)"
    exit 1
fi

# Update .env.launch
sed -i "s|DEPLOYER_PRIVATE_KEY=.*|DEPLOYER_PRIVATE_KEY=$DEPLOYER_KEY|g" .env.launch
sed -i "s|DEPLOYER_ADDRESS=.*|DEPLOYER_ADDRESS=$DEPLOYER_ADDR|g" .env.launch
sed -i "s|WGAS_ADDRESS=.*|WGAS_ADDRESS=$WGAS_ADDR|g" .env.launch

echo ""
echo "✅ Configuration saved!"
echo ""
echo "Verifying..."
bash scripts/system-diagnostic.sh
