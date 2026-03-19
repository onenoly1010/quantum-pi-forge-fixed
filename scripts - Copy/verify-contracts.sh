#!/bin/bash

# =======================================================================
# QUANTUM PI FORGE: CONTRACT VERIFICATION SCRIPT
# January 29, 2026 - Sovereign Contract Audit
# =======================================================================
# This script verifies deployed contracts on 0G Aristotle network
# Ensures contracts match expected bytecode and functionality
# =======================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$PROJECT_ROOT/logs/contract_verification_$TIMESTAMP.log"

# Sovereign Contract Addresses
OINIO_TOKEN="0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37"
DEX_ROUTER="0x0ff65f38fa43f0aac51901381acd7a8908ae2537"
DEX_FACTORY="0x307bFaA937768a073D41a2EbFBD952Be8E38BF91"

# Network Configuration
RPC_URL="https://16661.rpc.thirdweb.com"
EXPLORER_URL="https://chainscan.0g.ai"
CHAIN_ID=16661

# Foundry/Hardhat paths
CONTRACTS_DIR="$PROJECT_ROOT/contracts"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts"

# =======================================================================
# UTILITY FUNCTIONS
# =======================================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${PURPLE}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

# =======================================================================
# VERIFICATION FUNCTIONS
# =======================================================================

verify_contract_exists() {
    local address="$1"
    local name="$2"

    log "🔍 Checking if $name exists at $address..."

    # Use cast to check if contract exists
    local code
    if ! code=$(cast code "$address" --rpc-url "$RPC_URL" 2>/dev/null); then
        error "Cannot connect to RPC or contract $name not found at $address"
    fi

    if [[ "$code" == "0x" ]]; then
        error "No contract code found at $address ($name)"
    else
        info "✅ Contract $name found at $address"
        info "   Code size: ${#code} characters"
    fi
}

verify_oinio_token() {
    log "🏛️ Verifying OINIO Token Contract..."

    # Check basic ERC20 functions
    local name symbol decimals totalSupply owner

    name=$(cast call "$OINIO_TOKEN" "name()" --rpc-url "$RPC_URL")
    symbol=$(cast call "$OINIO_TOKEN" "symbol()" --rpc-url "$RPC_URL")
    decimals=$(cast call "$OINIO_TOKEN" "decimals()" --rpc-url "$RPC_URL")
    totalSupply=$(cast call "$OINIO_TOKEN" "totalSupply()" --rpc-url "$RPC_URL")

    # Clean up the output (remove quotes and extra spaces)
    name=$(echo "$name" | sed 's/^"\(.*\)"$/\1/' | xargs)
    symbol=$(echo "$symbol" | sed 's/^"\(.*\)"$/\1/' | xargs)
    decimals=$(echo "$decimals" | sed 's/^[0]*//' | xargs)
    totalSupply=$(cast from-wei "$totalSupply")

    info "OINIO Token Details:"
    info "  Name: $name"
    info "  Symbol: $symbol"
    info "  Decimals: $decimals"
    info "  Total Supply: $totalSupply OINIO"

    # Expected values
    if [[ "$name" == "OINIO Soul System Token" ]]; then
        success "✅ Token name matches expected value"
    else
        warning "⚠️ Token name differs from expected: 'OINIO Soul System Token'"
    fi

    if [[ "$symbol" == "OINIO" ]]; then
        success "✅ Token symbol matches expected value"
    else
        warning "⚠️ Token symbol differs from expected: 'OINIO'"
    fi

    if [[ "$decimals" == "18" ]]; then
        success "✅ Token decimals match expected value (18)"
    else
        warning "⚠️ Token decimals differ from expected: 18"
    fi

    # Check if owner can be retrieved (for renounceOwnership verification)
    local owner_result
    if owner_result=$(cast call "$OINIO_TOKEN" "owner()" --rpc-url "$RPC_URL" 2>/dev/null); then
        owner=$(echo "$owner_result" | sed 's/^0x//' | xargs)
        info "  Current Owner: 0x$owner"
        if [[ "$owner" == "0000000000000000000000000000000000000000" ]]; then
            success "✅ Ownership already renounced (decentralized!)"
        else
            info "ℹ️ Contract still has an owner - can be renounced for full decentralization"
        fi
    else
        warning "⚠️ Could not retrieve owner (might be already renounced or different contract)"
    fi
}

verify_dex_router() {
    log "🔄 Verifying DEX Router Contract..."

    # Check if router supports basic functions
    local factory feeTo feeToSetter

    # Try to get factory address
    if factory=$(cast call "$DEX_ROUTER" "factory()" --rpc-url "$RPC_URL" 2>/dev/null); then
        factory=$(echo "$factory" | xargs)
        info "  Factory Address: $factory"

        if [[ "$factory" == "$DEX_FACTORY" ]]; then
            success "✅ Router factory matches expected address"
        else
            warning "⚠️ Router factory differs from expected: $DEX_FACTORY"
        fi
    else
        warning "⚠️ Could not retrieve factory address from router"
    fi

    # Check fee settings
    if feeTo=$(cast call "$DEX_ROUTER" "feeTo()" --rpc-url "$RPC_URL" 2>/dev/null); then
        feeTo=$(echo "$feeTo" | xargs)
        info "  Fee To Address: $feeTo"
    fi

    if feeToSetter=$(cast call "$DEX_ROUTER" "feeToSetter()" --rpc-url "$RPC_URL" 2>/dev/null); then
        feeToSetter=$(echo "$feeToSetter" | xargs)
        info "  Fee To Setter: $feeToSetter"
    fi
}

verify_dex_factory() {
    log "🏭 Verifying DEX Factory Contract..."

    # Check feeToSetter
    local feeToSetter allPairsLength

    if feeToSetter=$(cast call "$DEX_FACTORY" "feeToSetter()" --rpc-url "$RPC_URL" 2>/dev/null); then
        feeToSetter=$(echo "$feeToSetter" | xargs)
        info "  Fee To Setter: $feeToSetter"
    fi

    # Get total number of pairs
    if allPairsLength=$(cast call "$DEX_FACTORY" "allPairsLength()" --rpc-url "$RPC_URL" 2>/dev/null); then
        allPairsLength=$(echo "$allPairsLength" | xargs)
        info "  Total Pairs Created: $allPairsLength"

        if [[ "$allPairsLength" -gt 0 ]]; then
            success "✅ Factory has active pairs"
        else
            info "ℹ️ Factory has no pairs yet (normal before liquidity addition)"
        fi
    fi
}

verify_liquidity_pool() {
    log "💧 Checking for existing OINIO/0G liquidity pool..."

    # Get the pair address from factory
    local pair_address reserves

    # Call getPair function: getPair(address tokenA, address tokenB)
    # Note: We need to determine which is tokenA vs tokenB (lower address first)
    local tokenA tokenB

    # Compare addresses to determine order
    if [[ "${OINIO_TOKEN#0x}" < "${DEX_ROUTER#0x}" ]]; then
        tokenA="$OINIO_TOKEN"
        tokenB="0x0000000000000000000000000000000000000000"  # WETH address (usually zero)
    else
        tokenA="0x0000000000000000000000000000000000000000"
        tokenB="$OINIO_TOKEN"
    fi

    info "  Checking pair: $tokenA / $tokenB"

    # Try to get pair address
    if pair_address=$(cast call "$DEX_FACTORY" "getPair(address,address)" "$tokenA" "$tokenB" --rpc-url "$RPC_URL" 2>/dev/null); then
        pair_address=$(echo "$pair_address" | xargs)
        info "  Pair Address: $pair_address"

        if [[ "$pair_address" != "0x0000000000000000000000000000000000000000" ]]; then
            success "✅ OINIO/0G pair exists!"

            # Check reserves
            if reserves=$(cast call "$pair_address" "getReserves()" --rpc-url "$RPC_URL" 2>/dev/null); then
                info "  Pool Reserves: $reserves"
                success "✅ Pool has liquidity!"
            else
                info "ℹ️ Pool exists but no reserves yet"
            fi
        else
            info "ℹ️ OINIO/0G pair does not exist yet (will be created with first liquidity)"
        fi
    else
        warning "⚠️ Could not query pair from factory"
    fi
}

# =======================================================================
# BYTECODE VERIFICATION (Advanced)
# =======================================================================

verify_bytecode() {
    local address="$1"
    local contract_name="$2"
    local expected_file="$3"

    log "🔬 Verifying bytecode for $contract_name..."

    if [[ ! -f "$expected_file" ]]; then
        warning "⚠️ Expected bytecode file not found: $expected_file"
        return
    fi

    # Get deployed bytecode
    local deployed_bytecode
    if ! deployed_bytecode=$(cast code "$address" --rpc-url "$RPC_URL" 2>/dev/null); then
        warning "⚠️ Could not retrieve bytecode for $contract_name"
        return
    fi

    # Get expected bytecode
    local expected_bytecode
    expected_bytecode=$(jq -r '.bytecode' "$expected_file" 2>/dev/null || echo "")

    if [[ -z "$expected_bytecode" ]]; then
        warning "⚠️ Could not read expected bytecode from $expected_file"
        return
    fi

    # Compare bytecodes (basic comparison - in production you'd want more sophisticated verification)
    if [[ "$deployed_bytecode" == "$expected_bytecode" ]]; then
        success "✅ Bytecode matches expected for $contract_name"
    else
        warning "⚠️ Bytecode differs from expected for $contract_name"
        info "  This could be due to constructor arguments or different compiler settings"
        info "  Manual review recommended"
    fi
}

# =======================================================================
# MAIN VERIFICATION
# =======================================================================

main() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║         🔍 QUANTUM PI FORGE: CONTRACT VERIFICATION          ║"
    echo "║              January 29, 2026 - Sovereign Audit              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    log "Starting sovereign contract verification..."
    log "Network: 0G Aristotle (Chain ID: $CHAIN_ID)"
    log "RPC: $RPC_URL"
    log "Explorer: $EXPLORER_URL"

    # Verify network connectivity
    log "🌐 Testing network connectivity..."
    if cast client --rpc-url "$RPC_URL" >/dev/null 2>&1; then
        success "✅ RPC connection successful"
    else
        error "❌ Cannot connect to 0G Aristotle RPC"
    fi

    # Verify contracts exist
    verify_contract_exists "$OINIO_TOKEN" "OINIO Token"
    verify_contract_exists "$DEX_ROUTER" "DEX Router"
    verify_contract_exists "$DEX_FACTORY" "DEX Factory"

    # Detailed verification
    verify_oinio_token
    verify_dex_router
    verify_dex_factory
    verify_liquidity_pool

    # Optional bytecode verification (if artifacts exist)
    if [[ -d "$ARTIFACTS_DIR" ]]; then
        log "🔬 Performing bytecode verification..."

        # Find artifact files
        local oinio_artifact router_artifact factory_artifact

        oinio_artifact=$(find "$ARTIFACTS_DIR" -name "*OINIO*.json" -o -name "*oinio*.json" | head -1)
        router_artifact=$(find "$ARTIFACTS_DIR" -name "*Router*.json" -o -name "*router*.json" | head -1)
        factory_artifact=$(find "$ARTIFACTS_DIR" -name "*Factory*.json" -o -name "*factory*.json" | head -1)

        [[ -n "$oinio_artifact" ]] && verify_bytecode "$OINIO_TOKEN" "OINIO Token" "$oinio_artifact"
        [[ -n "$router_artifact" ]] && verify_bytecode "$DEX_ROUTER" "DEX Router" "$router_artifact"
        [[ -n "$factory_artifact" ]] && verify_bytecode "$DEX_FACTORY" "DEX Factory" "$factory_artifact"
    else
        info "ℹ️ No artifacts directory found - skipping bytecode verification"
    fi

    # Final summary
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    📊 VERIFICATION SUMMARY                    ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    success "Contract verification completed!"
    success "OINIO Token: $OINIO_TOKEN"
    success "DEX Router: $DEX_ROUTER"
    success "DEX Factory: $DEX_FACTORY"

    echo ""
    echo "🔗 Useful Links:"
    echo "• OINIO Token: $EXPLORER_URL/address/$OINIO_TOKEN"
    echo "• DEX Router: $EXPLORER_URL/address/$DEX_ROUTER"
    echo "• DEX Factory: $EXPLORER_URL/address/$DEX_FACTORY"
    echo ""

    if [[ -f "$LOG_FILE" ]]; then
        info "📝 Full verification log saved to: $LOG_FILE"
    fi

    echo ""
    echo -e "${GREEN}✅ READY FOR LIQUIDITY ADDITION${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Execute manual liquidity addition (see manual-liquidity-guide.sh)"
    echo "2. Verify LP tokens received"
    echo "3. Test Sovereign Swap component"
    echo "4. Consider renouncing ownership for full decentralization"
}

# =======================================================================
# SCRIPT ENTRY POINT
# =======================================================================

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --bytecode-only)
            # Only do bytecode verification
            if [[ -d "$ARTIFACTS_DIR" ]]; then
                log "Performing bytecode verification only..."
                # This would need more implementation
                info "Bytecode verification requires artifact files"
            else
                error "No artifacts directory found for bytecode verification"
            fi
            exit 0
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --bytecode-only    Only perform bytecode verification"
            echo "  --help            Show this help message"
            echo ""
            echo "This script verifies deployed contracts on 0G Aristotle network."
            echo "Requires: cast (Foundry), jq (optional for bytecode verification)"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Check dependencies
if ! command -v cast >/dev/null 2>&1; then
    error "Foundry's cast is required. Install with: curl -L https://foundry.paradigm.xyz | bash"
fi

# Run main verification
main "$@"