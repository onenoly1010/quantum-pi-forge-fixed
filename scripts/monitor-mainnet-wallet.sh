#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Mainnet Wallet Balance Monitor
# Monitors the deployer wallet for incoming gas funding
# ═══════════════════════════════════════════════════════════════════════════

DEPLOYER="0x3e81132dcA223a7d8D58ea769F6c91d4B64B73d7"
RPC_URL="https://evmrpc.0g.ai"
CHECK_INTERVAL="${1:-30}"  # Default: check every 30 seconds
TARGET_BALANCE="${2:-5}"   # Default: alert when >= 5 A0G

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║          MAINNET WALLET BALANCE MONITOR - 0G Aristotle              ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  Deployer: $DEPLOYER"
echo "  Network:  0G Aristotle Mainnet (Chain ID: 16661)"
echo "  RPC:      $RPC_URL"
echo "  Interval: Every ${CHECK_INTERVAL}s"
echo "  Target:   ${TARGET_BALANCE} A0G"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  Press Ctrl+C to stop monitoring"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

get_balance_full() {
    local result=$(curl -s -X POST "$RPC_URL" \
        -H "Content-Type: application/json" \
        --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$DEPLOYER\",\"latest\"],\"id\":1}" \
        2>/dev/null)
    
    local hex_balance=$(echo "$result" | jq -r '.result // "0x0"')
    
    if [ "$hex_balance" = "null" ] || [ -z "$hex_balance" ]; then
        echo "0.000000"
        return
    fi
    
    node -e "console.log((Number(BigInt('$hex_balance')) / 1e18).toFixed(6))" 2>/dev/null || echo "0.000000"
}

check_count=0

while true; do
    check_count=$((check_count + 1))
    timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    balance=$(get_balance_full)
    balance_int=$(echo "$balance" | cut -d'.' -f1)
    
    if [ "$balance_int" -ge "$TARGET_BALANCE" ] 2>/dev/null; then
        echo ""
        echo "╔══════════════════════════════════════════════════════════════════════╗"
        echo "║  🎉 FUNDING DETECTED! WALLET IS READY FOR DEPLOYMENT!               ║"
        echo "╚══════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "  [$timestamp] ✅ Balance: $balance A0G"
        echo ""
        echo "  Deployment can now proceed!"
        echo "  Run: cd contracts/0g-uniswap-v2 && forge build"
        echo ""
        break
    else
        if [ "$balance" = "0.000000" ] || [ "$balance" = "0" ]; then
            echo "  [#$check_count] [$timestamp] ⏳ Balance: $balance A0G - Awaiting funding..."
        else
            echo "  [#$check_count] [$timestamp] 💰 Balance: $balance A0G - Partially funded"
        fi
    fi
    
    sleep "$CHECK_INTERVAL"
done

echo "Monitor completed."
