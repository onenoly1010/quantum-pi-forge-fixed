#!/bin/bash
# Deploy Smart Contracts to specified network

set -e

NETWORK=${1:-"0g-testnet"}

echo "🔐 Starting Smart Contract Deployment to $NETWORK..."

# Check environment variables
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ DEPLOYER_PRIVATE_KEY not set"
    exit 1
fi

# Deploy based on network
case $NETWORK in
    "polygon")
        echo "🔷 Deploying to Polygon Mainnet..."
        npx hardhat run scripts/deploy-token.ts --network polygon
        ;;
    "pi-mainnet")
        echo "🪙 Deploying to Pi Network Mainnet..."
        npx hardhat run scripts/deploy-pi-contracts.ts --network pi-mainnet
        ;;
    "0g-testnet")
        echo "🔄 Deploying DEX to 0G Aristotle Testnet..."
        bash scripts/deploy-dex.sh
        ;;
    *)
        echo "❌ Unknown network: $NETWORK"
        echo "Valid options: polygon, pi-mainnet, 0g-testnet"
        exit 1
        ;;
esac

echo "✅ Smart contract deployment completed"
