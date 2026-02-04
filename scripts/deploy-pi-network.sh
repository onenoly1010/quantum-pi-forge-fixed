#!/bin/bash
set -e

#####################################################################
# Quantum Pi Forge - Pi Network Soroban Contract Deployment Script
# Deploys the Quantum Pi Forge contract to Pi Network Testnet/Mainnet
#####################################################################

echo "🌌 Quantum Pi Forge - Soroban Deployment Script"
echo "================================================"

# Load environment variables
if [ -f "pi-network/.soroban-env" ]; then
    echo "✅ Loading environment variables from .soroban-env"
    export $(cat pi-network/.soroban-env | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: .soroban-env not found. Using default/environment variables."
fi

# Check required environment variables
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ Error: Required environment variable $1 is not set"
        exit 1
    fi
}

check_env_var "PI_NETWORK_RPC_URL"
check_env_var "PI_NETWORK_PASSPHRASE"
check_env_var "PI_DEPLOYER_SECRET_KEY"

# Determine network
NETWORK_MODE=${PI_NETWORK_MODE:-testnet}
echo "📡 Deploying to Pi Network $NETWORK_MODE"

# Navigate to pi-network directory
cd "$(dirname "$0")/../pi-network"

echo ""
echo "Step 1: Building Soroban contract..."
echo "======================================"
cargo build --target wasm32-unknown-unknown --release
echo "✅ Contract built successfully"

echo ""
echo "Step 2: Optimizing WASM..."
echo "======================================"
# Optimize the WASM file for production deployment
if command -v wasm-opt &> /dev/null; then
    wasm-opt -Oz --strip-debug \
        target/wasm32-unknown-unknown/release/quantum_pi_forge.wasm \
        -o target/wasm32-unknown-unknown/release/quantum_pi_forge_optimized.wasm
    echo "✅ WASM optimized successfully"
    WASM_FILE="target/wasm32-unknown-unknown/release/quantum_pi_forge_optimized.wasm"
else
    echo "⚠️  wasm-opt not found, using unoptimized WASM"
    WASM_FILE="target/wasm32-unknown-unknown/release/quantum_pi_forge.wasm"
fi

# Display WASM file size
WASM_SIZE=$(wc -c < "$WASM_FILE")
echo "📦 Contract size: $((WASM_SIZE / 1024)) KB"

echo ""
echo "Step 3: Deploying to Pi Network..."
echo "======================================"

# Install or deploy the contract
if [ -z "$PI_FORGE_CONTRACT_ID" ]; then
    echo "🆕 Installing new contract..."
    
    # Deploy new contract
    DEPLOYMENT_RESULT=$(soroban contract install \
        --wasm "$WASM_FILE" \
        --rpc-url "$PI_NETWORK_RPC_URL" \
        --network-passphrase "$PI_NETWORK_PASSPHRASE" \
        --source-account "$PI_DEPLOYER_SECRET_KEY" 2>&1)
    
    if [ $? -eq 0 ]; then
        CONTRACT_ID=$(echo "$DEPLOYMENT_RESULT" | tail -n 1)
        echo "✅ Contract installed successfully!"
        echo "📝 Contract ID: $CONTRACT_ID"
        echo ""
        echo "⚠️  IMPORTANT: Save this Contract ID!"
        echo "Add to your .soroban-env file:"
        echo "PI_FORGE_CONTRACT_ID=$CONTRACT_ID"
    else
        echo "❌ Deployment failed:"
        echo "$DEPLOYMENT_RESULT"
        exit 1
    fi
else
    echo "🔄 Upgrading existing contract..."
    echo "   Contract ID: $PI_FORGE_CONTRACT_ID"
    
    # Upgrade existing contract
    DEPLOYMENT_RESULT=$(soroban contract deploy \
        --wasm "$WASM_FILE" \
        --contract-id "$PI_FORGE_CONTRACT_ID" \
        --rpc-url "$PI_NETWORK_RPC_URL" \
        --network-passphrase "$PI_NETWORK_PASSPHRASE" \
        --source-account "$PI_DEPLOYER_SECRET_KEY" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "✅ Contract upgraded successfully!"
        CONTRACT_ID="$PI_FORGE_CONTRACT_ID"
    else
        echo "❌ Upgrade failed:"
        echo "$DEPLOYMENT_RESULT"
        exit 1
    fi
fi

echo ""
echo "Step 4: Initializing contract..."
echo "======================================"

# Initialize the contract with factory and router addresses
# These would be set as environment variables or passed as parameters
if [ -n "$PI_FACTORY_ADDRESS" ] && [ -n "$PI_ROUTER_ADDRESS" ]; then
    echo "Initializing with Factory: $PI_FACTORY_ADDRESS"
    echo "                  Router: $PI_ROUTER_ADDRESS"
    
    INIT_RESULT=$(soroban contract invoke \
        --id "$CONTRACT_ID" \
        --rpc-url "$PI_NETWORK_RPC_URL" \
        --network-passphrase "$PI_NETWORK_PASSPHRASE" \
        --source-account "$PI_DEPLOYER_SECRET_KEY" \
        -- \
        initialize \
        --factory "$PI_FACTORY_ADDRESS" \
        --router "$PI_ROUTER_ADDRESS" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo "✅ Contract initialized successfully"
    else
        echo "⚠️  Initialization warning (may already be initialized):"
        echo "$INIT_RESULT"
    fi
else
    echo "⚠️  Skipping initialization (PI_FACTORY_ADDRESS and PI_ROUTER_ADDRESS not set)"
    echo "   You'll need to call initialize() manually"
fi

echo ""
echo "Step 5: Verification..."
echo "======================================"

# Query contract to verify deployment
TOTAL_STAKED=$(soroban contract invoke \
    --id "$CONTRACT_ID" \
    --rpc-url "$PI_NETWORK_RPC_URL" \
    --network-passphrase "$PI_NETWORK_PASSPHRASE" \
    --source-account "$PI_DEPLOYER_SECRET_KEY" \
    -- \
    get_total_staked 2>&1 || echo "0")

echo "✅ Contract is live and responding"
echo "   Total Staked: $TOTAL_STAKED"

echo ""
echo "🎉 Deployment Complete!"
echo "======================================"
echo "Network:     Pi Network $NETWORK_MODE"
echo "Contract ID: $CONTRACT_ID"
echo "RPC URL:     $PI_NETWORK_RPC_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Save the Contract ID in your .soroban-env file"
echo "2. Update frontend configuration with the new Contract ID"
echo "3. Test contract functions using soroban-cli"
echo "4. Monitor contract events and performance"
echo ""
echo "📚 Documentation:"
echo "   - Contract Explorer: https://testnet.stellarchain.io/contracts/$CONTRACT_ID"
echo "   - RPC Endpoint: $PI_NETWORK_RPC_URL"
echo ""
