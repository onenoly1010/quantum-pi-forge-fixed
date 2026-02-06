#!/bin/bash

# 🔮 OINIO/OG DEX Deployment Setup Script
# Complete setup for OINIO token deployment, DEX infrastructure, and liquidity provision

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC} ${BLUE}$1${NC}${PURPLE}$(printf '%*s' $((78-${#1})) '')║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."

    local missing_deps=()

    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi

    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi

    if ! command -v npx &> /dev/null; then
        missing_deps+=("npx")
    fi

    if ! command -v forge &> /dev/null && ! npx hardhat --version &> /dev/null; then
        missing_deps+=("hardhat or foundry")
    fi

    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install missing dependencies and try again."
        exit 1
    fi

    print_success "Dependencies check passed"
}

# Check wallet balance
check_wallet_balance() {
    print_step "Checking deployer wallet balance..."

    if [[ ! -f ".env.launch" ]]; then
        print_error ".env.launch file not found"
        return 1
    fi

    # Run balance check
    if node scripts/check-wallet-balance.js; then
        print_success "Wallet has sufficient balance"
        return 0
    else
        print_warning "Wallet needs funding"
        return 1
    fi
}

# Generate deployer keys and addresses
generate_deployer_keys() {
    print_step "Setting up deployer keys..."

    # Check if keys already exist
    if grep -q "DEPLOYER_PRIVATE_KEY=ec4cfb5c33550d97e2343fe308651a95bc1fcaccc2c8ee58bca0c3359ba98449" .env.launch 2>/dev/null; then
        print_info "Deployer keys already configured"
        return 0
    fi

    # Generate new keys if needed (for now, use existing)
    print_info "Using existing deployer keys from .env.launch"

    # Verify keys are valid
    local private_key=$(grep "DEPLOYER_PRIVATE_KEY=" .env.launch | cut -d'=' -f2)
    local address=$(grep "DEPLOYER_ADDRESS=" .env.launch | cut -d'=' -f2)

    if [[ -z "$private_key" || -z "$address" ]]; then
        print_error "Deployer keys not properly configured in .env.launch"
        return 1
    fi

    print_success "Deployer keys configured"
    print_info "Address: $address"
}

# Setup OINIO token configuration
setup_oinio_config() {
    print_step "Configuring OINIO token settings..."

    # Check if OINIO is already deployed
    local oinio_address=$(grep "OINIO_TOKEN_ADDRESS=" .env.launch | cut -d'=' -f2)

    if [[ "$oinio_address" == "0x07f43E5B1A8a0928B364E40d5885f81A543B05C7" ]]; then
        print_success "OINIO token already deployed at: $oinio_address"
        return 0
    fi

    print_warning "OINIO token address not found or different"
    print_info "Expected: 0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"
    print_info "Current: $oinio_address"
}

# Setup DEX router configuration
setup_dex_config() {
    print_step "Configuring DEX router settings..."

    local router_address=$(grep "DEX_ROUTER_ADDRESS=" .env.launch | cut -d'=' -f2)
    local factory_address=$(grep "DEX_FACTORY_ADDRESS=" .env.launch | cut -d'=' -f2)

    if [[ "$router_address" == "0x0000000000000000000000000000000000000000" || -z "$router_address" ]]; then
        print_warning "DEX Router not deployed yet - needs funding first"
        return 1
    fi

    if [[ "$factory_address" == "0x0000000000000000000000000000000000000000" || -z "$factory_address" ]]; then
        print_warning "DEX Factory not deployed yet - needs funding first"
        return 1
    fi

    print_success "DEX infrastructure deployed"
    print_info "Router: $router_address"
    print_info "Factory: $factory_address"
}

# Setup liquidity pool configuration
setup_liquidity_config() {
    print_step "Configuring liquidity pool settings..."

    local oinio_amount=$(grep "INITIAL_LIQUIDITY_OINIO=" .env.launch | cut -d'=' -f2)
    local gas_amount=$(grep "INITIAL_LIQUIDITY_GAS=" .env.launch | cut -d'=' -f2)

    if [[ -z "$oinio_amount" || -z "$gas_amount" ]]; then
        print_warning "Liquidity amounts not configured"
        return 1
    fi

    print_success "Liquidity configuration set"
    print_info "OINIO: $oinio_amount tokens"
    print_info "GAS: $gas_amount tokens"
}

# Generate funding instructions
generate_funding_instructions() {
    print_header "🚀 DEPLOYER WALLET FUNDING REQUIRED"

    local deployer_address=$(grep "DEPLOYER_ADDRESS=" .env.launch | cut -d'=' -f2)

    echo ""
    echo "📍 Network: 0G Aristotle Mainnet (Chain ID: 16661)"
    echo "💳 Deployer Address: $deployer_address"
    echo "💰 Required Balance: 2-5 GAS tokens"
    echo "🔗 RPC URL: https://evmrpc.0g.ai"
    echo ""

    echo "🌐 FUNDING OPTIONS:"
    echo "=================="
    echo ""
    echo "1. 🏦 0G Aristotle Faucet:"
    echo "   - Visit: https://faucet.0g.ai"
    echo "   - Connect wallet: $deployer_address"
    echo "   - Request GAS tokens"
    echo ""

    echo "2. 💱 DEX/CEX Bridge:"
    echo "   - Use a CEX that supports 0G (Binance, etc.)"
    echo "   - Bridge GAS tokens to 0G Aristotle"
    echo "   - Send to: $deployer_address"
    echo ""

    echo "3. 🔄 Cross-chain Bridge:"
    echo "   - Use official 0G bridge"
    echo "   - Bridge from Ethereum/Polygon to 0G Aristotle"
    echo "   - Destination: $deployer_address"
    echo ""

    echo "4. 🤝 Community Support:"
    echo "   - Request from OINIO community"
    echo "   - Post in Discord/Telegram groups"
    echo ""

    print_warning "⚠️  DEPLOYMENT BLOCKED UNTIL WALLET IS FUNDED"
    echo ""
}

# Generate deployment commands
generate_deployment_commands() {
    print_header "🔧 DEPLOYMENT COMMANDS"

    echo ""
    echo "Once wallet is funded, run these commands in order:"
    echo ""

    echo "1. 📦 Install dependencies:"
    echo "   npm install"
    echo ""

    echo "2. 🔍 Verify balance:"
    echo "   node scripts/check-wallet-balance.js"
    echo ""

    echo "3. 🚀 Deploy DEX Infrastructure:"
    echo "   npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle"
    echo ""

    echo "4. 💰 Add Liquidity (OINIO/GAS pool):"
    echo "   npx hardhat run scripts/create-liquidity-pool.ts --network 0g-aristotle"
    echo ""

    echo "5. ✅ Verify deployment:"
    echo "   node scripts/verify-dex-deployment.js"
    echo ""

    echo "6. 🔄 Update frontend configuration:"
    echo "   # Copy DEX addresses to .env.local"
    echo "   cp .env.launch .env.local"
    echo ""

    echo "7. 🌐 Deploy frontend:"
    echo "   npm run build && npm run start"
    echo ""
}

# Generate security checklist
generate_security_checklist() {
    print_header "🔒 SECURITY CHECKLIST"

    echo ""
    echo "CRITICAL SECURITY ITEMS:"
    echo "========================"
    echo ""
    echo "□ [ ] Private keys NEVER committed to git"
    echo "□ [ ] .env.launch added to .gitignore"
    echo "□ [ ] Deployer wallet backed up securely"
    echo "□ [ ] Recovery phrases stored offline"
    echo "□ [ ] Multi-sig setup for large amounts"
    echo "□ [ ] Contract ownership transfer planned"
    echo "□ [ ] Emergency pause functions tested"
    echo "□ [ ] Audit completed before mainnet launch"
    echo ""

    echo "MONITORING & ALERTS:"
    echo "====================="
    echo ""
    echo "□ [ ] Transaction monitoring enabled"
    echo "□ [ ] Balance alerts configured"
    echo "□ [ ] Error logging set up"
    echo "□ [ ] Discord/Twitter alerts configured"
    echo "□ [ ] Backup funding wallet ready"
    echo ""
}

# Generate final status report
generate_status_report() {
    print_header "📊 DEPLOYMENT STATUS REPORT"

    echo ""
    echo "OINIO TOKEN STATUS:"
    echo "==================="
    local oinio_address=$(grep "OINIO_TOKEN_ADDRESS=" .env.launch | cut -d'=' -f2)
    if [[ "$oinio_address" == "0x07f43E5B1A8a0928B364E40d5885f81A543B05C7" ]]; then
        echo -e "${GREEN}✅ DEPLOYED${NC} - Address: $oinio_address"
    else
        echo -e "${RED}❌ NOT DEPLOYED${NC} - Address: $oinio_address"
    fi
    echo ""

    echo "DEX INFRASTRUCTURE STATUS:"
    echo "=========================="
    local router_address=$(grep "DEX_ROUTER_ADDRESS=" .env.launch | cut -d'=' -f2)
    local factory_address=$(grep "DEX_FACTORY_ADDRESS=" .env.launch | cut -d'=' -f2)

    if [[ "$router_address" != "0x0000000000000000000000000000000000000000" && -n "$router_address" ]]; then
        echo -e "${GREEN}✅ ROUTER DEPLOYED${NC} - Address: $router_address"
    else
        echo -e "${RED}❌ ROUTER NOT DEPLOYED${NC} - Needs funding"
    fi

    if [[ "$factory_address" != "0x0000000000000000000000000000000000000000" && -n "$factory_address" ]]; then
        echo -e "${GREEN}✅ FACTORY DEPLOYED${NC} - Address: $factory_address"
    else
        echo -e "${RED}❌ FACTORY NOT DEPLOYED${NC} - Needs funding"
    fi
    echo ""

    echo "WALLET STATUS:"
    echo "=============="
    if check_wallet_balance 2>/dev/null; then
        echo -e "${GREEN}✅ SUFFICIENT BALANCE${NC} - Ready for deployment"
    else
        echo -e "${RED}❌ INSUFFICIENT BALANCE${NC} - Needs funding"
    fi
    echo ""

    echo "LIQUIDITY STATUS:"
    echo "================="
    local oinio_amount=$(grep "INITIAL_LIQUIDITY_OINIO=" .env.launch | cut -d'=' -f2)
    local gas_amount=$(grep "INITIAL_LIQUIDITY_GAS=" .env.launch | cut -d'=' -f2)

    if [[ -n "$oinio_amount" && -n "$gas_amount" ]]; then
        echo -e "${GREEN}✅ CONFIGURED${NC} - OINIO: $oinio_amount, GAS: $gas_amount"
    else
        echo -e "${YELLOW}⚠️  PARTIALLY CONFIGURED${NC} - Needs completion"
    fi
    echo ""
}

# Main execution
main() {
    print_header "🔮 OINIO/OG DEX DEPLOYMENT SETUP"

    echo ""
    echo "Setting up complete OINIO token deployment and DEX infrastructure..."
    echo ""

    check_dependencies
    echo ""

    generate_deployer_keys
    echo ""

    setup_oinio_config
    echo ""

    setup_dex_config
    echo ""

    setup_liquidity_config
    echo ""

    generate_status_report
    echo ""

    if ! check_wallet_balance 2>/dev/null; then
        generate_funding_instructions
        echo ""
    fi

    generate_deployment_commands
    echo ""

    generate_security_checklist
    echo ""

    print_header "🎯 NEXT STEPS"

    if check_wallet_balance 2>/dev/null; then
        echo ""
        echo -e "${GREEN}🚀 READY FOR DEPLOYMENT!${NC}"
        echo ""
        echo "Run the deployment commands above to complete the OINIO/OG pairing."
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⏳ FUNDING REQUIRED${NC}"
        echo ""
        echo "1. Fund the deployer wallet with 2-5 GAS tokens"
        echo "2. Run this script again to verify balance"
        echo "3. Execute deployment commands"
        echo ""
    fi

    echo -e "${CYAN}🔮 May the OINIO/OG pairing bring prosperity to the sovereign economy!${NC}"
    echo ""
}

# Run main function
main "$@"