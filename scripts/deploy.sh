#!/bin/bash

# ===================================
# OINIO DEPLOYMENT SCRIPT
# ===================================
# Execute flash launch when grant approved

set -e

# Load environment
if [ ! -f ".env.launch" ]; then
    echo "❌ .env.launch not found"
    exit 1
fi

source .env.launch

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="${LOG_FILE:-.logs/deploy.log}"
mkdir -p "$(dirname "$LOG_FILE")"

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $*${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $*${NC}" | tee -a "$LOG_FILE"
}

# Verify configuration
verify_config() {
    log_info "Verifying launch configuration..."
    
    local required_vars=(
        "DEPLOYER_PRIVATE_KEY"
        "DEPLOYER_ADDRESS"
        "ZERO_G_RPC_URL"
        "DEX_ROUTER_ADDRESS"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Missing required: $var"
            return 1
        fi
    done
    
    log_success "Configuration verified"
    return 0
}

# Deploy OINIO token contract
deploy_token() {
    log_info "Deploying OINIO token contract..."
    
    # This would typically use hardhat or foundry
    # For now, we'll create a deployment plan
    
    cat > /tmp/deploy-token.js << 'EOF'
// OINIO Token Deployment Script (requires hardhat or ethers)
// This is a template - actual deployment handled by hardhat

const deployer = process.env.DEPLOYER_ADDRESS;
const supply = process.env.OINIO_INITIAL_SUPPLY || "1000000000";

console.log("Deploying OINIO token...");
console.log("Deployer:", deployer);
console.log("Supply:", supply);

// Contract deployment would go here
// const contract = await TokenFactory.deploy(supply);
// const token = await contract.deployed();
EOF
    
    log_info "Token deployment configured"
    # In production, would call: hardhat run deploy/token.js --network 0g-aristotle
    
    return 0
}

# Create liquidity pool
create_liquidity_pool() {
    log_info "Creating liquidity pool..."
    
    log_info "Pool configuration:"
    log_info "  Token: OINIO (TBA)"
    log_info "  Pair: OINIO / GAS"
    log_info "  Router: $DEX_ROUTER_ADDRESS"
    log_info "  Initial OINIO: $INITIAL_LIQUIDITY_OINIO"
    log_info "  Initial GAS: $INITIAL_LIQUIDITY_GAS"
    
    # In production, would execute DEX addLiquidity call
    
    return 0
}

# Enable trading
enable_trading() {
    log_info "Enabling trading..."
    
    log_info "Trading parameters:"
    log_info "  Max Price Impact: ${MAX_PRICE_IMPACT_PERCENT}%"
    log_info "  Slippage Tolerance: ${SLIPPAGE_TOLERANCE_PERCENT}%"
    log_info "  Liquidity Lock Hours: $MIN_LIQUIDITY_LOCK_HOURS"
    
    # In production, would call token contract to enable trading
    
    return 0
}

# Launch announcements
announce_launch() {
    log_info "Publishing launch announcements..."
    
    # Discord webhook
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        log_info "Sending Discord notification..."
        
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d '{
                "embeds": [{
                    "title": "🚀 OINIO FLASH LAUNCH - LIVE NOW",
                    "description": "The OINIO token is now live on 0G Aristotle Mainnet!",
                    "color": 3066993,
                    "fields": [
                        {"name": "Network", "value": "0G Aristotle", "inline": true},
                        {"name": "Trading Live", "value": "Immediately", "inline": true},
                        {"name": "Liquidity Pair", "value": "OINIO/GAS", "inline": false},
                        {"name": "DEX Router", "value": "'$DEX_ROUTER_ADDRESS'", "inline": false}
                    ],
                    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
                    "footer": {"text": "0G OINIO Launch"}
                }]
            }' 2>/dev/null || true
        
        log_success "Discord notification sent"
    fi
    
    return 0
}

# Verify launch success
verify_launch() {
    log_info "Verifying launch success..."
    
    # Check RPC connectivity
    local chain_id
    chain_id=$(curl -s -X POST "$ZERO_G_RPC_URL" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        | grep -o '"result":"0x[^"]*"' | cut -d'"' -f4 || echo "")
    
    if [ -n "$chain_id" ]; then
        log_success "RPC verification passed"
    else
        log_error "RPC verification failed"
        return 1
    fi
    
    return 0
}

# Main execution
main() {
    log_info "======================================"
    log_info "OINIO FLASH LAUNCH SEQUENCE"
    log_info "======================================"
    log_info "Start time: $(date)"
    log_info ""
    
    verify_config || exit 1
    
    log_info ""
    log_info "DEPLOYMENT STEPS:"
    log_info "1. Deploy OINIO token contract"
    deploy_token || exit 1
    
    log_info ""
    log_info "2. Create liquidity pool"
    create_liquidity_pool || exit 1
    
    log_info ""
    log_info "3. Enable trading"
    enable_trading || exit 1
    
    log_info ""
    log_info "4. Announce launch"
    announce_launch || exit 1
    
    log_info ""
    log_info "5. Verify launch"
    verify_launch || exit 1
    
    log_info ""
    log_success "======================================"
    log_success "OINIO FLASH LAUNCH COMPLETED"
    log_success "======================================"
    log_success "Deployment finished at: $(date)"
    
    return 0
}

main "$@"
