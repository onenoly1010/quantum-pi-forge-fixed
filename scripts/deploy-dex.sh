#!/bin/bash
################################################################################
# OINIO DEX Router Deployment Script
# Deploys Uniswap V2 Router to 0G Aristotle Mainnet
#
# Usage:
#   chmod +x scripts/deploy-dex.sh
#   source .env.launch
#   bash scripts/deploy-dex.sh
#
# Prerequisites:
#   - DEPLOYER_PRIVATE_KEY in .env.launch
#   - ZERO_G_RPC_URL configured
#   - jq installed (for JSON parsing)
#   - Sufficient gas tokens
#
# Output:
#   - Updated .env.launch with DEX_ROUTER_ADDRESS
#   - Deployment logs
################################################################################

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

RPC_URL="${ZERO_G_RPC_URL:-https://evmrpc.0g.ai}"
CHAIN_ID="${ZERO_G_CHAIN_ID:-16661}"
DEPLOYER_PRIVATE_KEY="$DEPLOYER_PRIVATE_KEY"
WGAS_ADDRESS="${WGAS_ADDRESS:-}"

# Standard Uniswap V2 Router02 (if deployed on 0G Aristotle)
STANDARD_ROUTER="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
STANDARD_FACTORY="0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

ENV_FILE=".env.launch"
LOG_FILE="logs/dex-deployment.log"

# ============================================================================
# FUNCTIONS
# ============================================================================

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] $1" | tee -a "$LOG_FILE"
}

error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ❌ $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] ✅ $1" | tee -a "$LOG_FILE"
}

check_prerequisites() {
    log "🔍 Checking prerequisites..."

    # Check for jq
    if ! command -v jq &> /dev/null; then
        error "jq is required but not installed. Install with: apt-get install jq"
    fi

    # Check environment
    if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
        error "DEPLOYER_PRIVATE_KEY not set in .env.launch"
    fi

    if [ ! -f "$ENV_FILE" ]; then
        error "$ENV_FILE not found"
    fi

    # Create logs directory
    mkdir -p logs

    success "Prerequisites check passed"
}

check_rpc_connection() {
    log "📡 Checking RPC connectivity..."

    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        "$RPC_URL")

    local chain_id=$(echo "$response" | jq -r '.result' 2>/dev/null || echo "")

    if [ -z "$chain_id" ] || [ "$chain_id" = "null" ]; then
        error "RPC endpoint not responding at $RPC_URL"
    fi

    # Convert hex to decimal
    local chain_id_decimal=$((16#${chain_id:2}))

    if [ "$chain_id_decimal" != "$CHAIN_ID" ]; then
        error "Chain ID mismatch. Expected: $CHAIN_ID, Got: $chain_id_decimal"
    fi

    success "RPC connectivity verified (Chain ID: $chain_id_decimal)"
}

check_router_exists() {
    log "🔎 Checking for existing Uniswap V2 Router..."

    # Try to get code at standard router address
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$STANDARD_ROUTER\",\"latest\"],\"id\":1}" \
        "$RPC_URL")

    local code=$(echo "$response" | jq -r '.result' 2>/dev/null || echo "0x")

    if [ "$code" != "0x" ]; then
        success "✨ Found existing Uniswap V2 Router!"
        echo "   Address: $STANDARD_ROUTER"
        echo "   Status: Ready to use"
        echo ""
        echo "   This is a standard Uniswap V2 deployment."
        echo "   No additional deployment needed."
        
        update_env_with_router "$STANDARD_ROUTER" "standard"
        return 0
    fi

    return 1
}

update_env_with_router() {
    local router_address="$1"
    local router_type="$2"

    log "📝 Updating $ENV_FILE with router address..."

    # Check if DEX_ROUTER_ADDRESS exists
    if grep -q "^DEX_ROUTER_ADDRESS=" "$ENV_FILE"; then
        # Update existing entry
        sed -i "s/^DEX_ROUTER_ADDRESS=.*/DEX_ROUTER_ADDRESS=$router_address/" "$ENV_FILE"
    else
        # Add new entry
        echo "DEX_ROUTER_ADDRESS=$router_address" >> "$ENV_FILE"
    fi

    # Also add factory address if standard
    if [ "$router_type" = "standard" ]; then
        if ! grep -q "^DEX_FACTORY_ADDRESS=" "$ENV_FILE"; then
            echo "DEX_FACTORY_ADDRESS=$STANDARD_FACTORY" >> "$ENV_FILE"
        fi
    fi

    success "Updated .env.launch:"
    success "  DEX_ROUTER_ADDRESS=$router_address"
    success "  DEX_FACTORY_ADDRESS=${STANDARD_FACTORY:-<deployment_required>}"
}

deployment_guide() {
    log "📋 DEX Router Deployment Guide"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "🔍 Uniswap V2 not found on 0G Aristotle"
    echo ""
    echo "OPTION 1: Deploy Uniswap V2 (Recommended)"
    echo "───────────────────────────────────────"
    echo ""
    echo "Step 1: Clone Uniswap repositories"
    echo "  git clone https://github.com/Uniswap/v2-core.git"
    echo "  git clone https://github.com/Uniswap/v2-periphery.git"
    echo ""
    echo "Step 2: Deploy Uniswap V2 Factory"
    echo "  cd v2-core"
    echo "  npm install"
    echo "  npx hardhat run scripts/deploy.js --network 0g-aristotle"
    echo "  # Get FACTORY_ADDRESS from output"
    echo ""
    echo "Step 3: Deploy Uniswap V2 Router02"
    echo "  cd ../v2-periphery"
    echo "  npm install"
    echo "  # Update config with FACTORY_ADDRESS from step 2"
    echo "  npx hardhat run scripts/deploy.js --network 0g-aristotle"
    echo "  # Get ROUTER_ADDRESS from output"
    echo ""
    echo "Step 4: Update this script with ROUTER_ADDRESS"
    echo "  Edit scripts/deploy-dex.sh, line ~28:"
    echo "  DEPLOYED_ROUTER='0x<router_address_here>'"
    echo ""
    echo "───────────────────────────────────────"
    echo ""
    echo "OPTION 2: Ask 0G Discord Community"
    echo "───────────────────────────────────────"
    echo "Join: https://discord.gg/0g-labs"
    echo "Ask: '#developer-support - Is there an official DEX router for 0G Aristotle?'"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "⏸️  Pausing deployment. Update router address and re-run."
    echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

log "🚀 OINIO DEX Router Deployment"
log "═════════════════════════════════════════════════════════════════"
log ""
log "RPC: $RPC_URL"
log "Chain ID: $CHAIN_ID"
log "Environment: $ENV_FILE"
log ""

# Step 1: Check prerequisites
check_prerequisites

# Step 2: Check RPC
check_rpc_connection

# Step 3: Check if router already exists
if check_router_exists; then
    log ""
    success "DEX Router deployment complete!"
    log ""
    log "📌 Next steps:"
    log "  1. Update .env.launch variables for token deployment"
    log "  2. Run: bash scripts/deploy.sh"
    log "  3. Monitor: bash scripts/monitor-grant.sh"
    log ""
    exit 0
fi

# Step 4: If router doesn't exist, show deployment guide
echo ""
log "⚠️  Standard Uniswap V2 Router not found on 0G Aristotle"
deployment_guide

log ""
log "Deployment guide written. Waiting for manual deployment..."
log ""

# Step 5: Wait for user to provide router address
echo ""
echo "Once you've deployed the router, add its address to .env.launch:"
echo ""
echo "  DEX_ROUTER_ADDRESS=0x<your_router_address_here>"
echo ""
echo "Then re-run:"
echo "  bash scripts/deploy-dex.sh"
echo ""

exit 1
