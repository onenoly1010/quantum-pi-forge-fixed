#!/bin/bash
# Quantum Pi Forge - Sponsor Wallet Verification Script
# Purpose: Verify sponsor wallet has sufficient MATIC and OINIO for gasless transactions

set -e

echo "💰 Quantum Pi Forge - Sponsor Wallet Verification"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
POLYGON_RPC_URL="${POLYGON_RPC_URL:-https://polygon-rpc.com}"
OINIO_TOKEN_ADDRESS="${OINIO_TOKEN_ADDRESS:-0x07f43E5B1A8a0928B364E40d5885f81A543B05C7}"

# Minimum requirements
MIN_MATIC="5"
RECOMMENDED_MATIC="10"
MIN_OINIO="10000"
RECOMMENDED_OINIO="50000"

# Check if sponsor private key is set
if [ -z "$SPONSOR_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ ERROR: SPONSOR_PRIVATE_KEY environment variable not set${NC}"
    echo ""
    echo "Please set the sponsor wallet private key:"
    echo "  export SPONSOR_PRIVATE_KEY='your_private_key_here'"
    echo ""
    echo "⚠️  SECURITY WARNING: Never commit private keys to git!"
    exit 1
fi

echo "📍 Network: Polygon Mainnet (Chain ID: 137)"
echo "📍 RPC URL: ${POLYGON_RPC_URL}"
echo "📍 OINIO Token: ${OINIO_TOKEN_ADDRESS}"
echo ""

# Check if Node.js script exists for balance checking
BALANCE_CHECK_SCRIPT="/home/runner/work/quantum-pi-forge-fixed/quantum-pi-forge-fixed/check-balance.mjs"

if [ ! -f "$BALANCE_CHECK_SCRIPT" ]; then
    echo -e "${YELLOW}⚠️  Balance check script not found at: ${BALANCE_CHECK_SCRIPT}${NC}"
    echo "Creating balance check script..."
    
    cat > "$BALANCE_CHECK_SCRIPT" << 'EOF'
import { ethers } from 'ethers';

async function checkBalances() {
    try {
        const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
        const privateKey = process.env.SPONSOR_PRIVATE_KEY;
        const tokenAddress = process.env.OINIO_TOKEN_ADDRESS || '0x07f43E5B1A8a0928B364E40d5885f81A543B05C7';
        
        if (!privateKey) {
            console.error('ERROR: SPONSOR_PRIVATE_KEY not set');
            process.exit(1);
        }
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const walletAddress = wallet.address;
        
        console.log(`Wallet Address: ${walletAddress}`);
        
        // Check MATIC balance
        const maticBalance = await provider.getBalance(walletAddress);
        const maticFormatted = ethers.formatEther(maticBalance);
        
        console.log(`MATIC Balance: ${maticFormatted} MATIC`);
        
        // Check OINIO token balance
        const tokenABI = [
            'function balanceOf(address owner) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)'
        ];
        
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
        const tokenBalance = await tokenContract.balanceOf(walletAddress);
        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        
        const tokenFormatted = ethers.formatUnits(tokenBalance, decimals);
        
        console.log(`${symbol} Balance: ${tokenFormatted} ${symbol}`);
        
        // Return as JSON for script parsing
        console.log('---JSON---');
        console.log(JSON.stringify({
            address: walletAddress,
            matic: maticFormatted,
            oinio: tokenFormatted,
            success: true
        }));
        
    } catch (error) {
        console.error('Error checking balances:', error.message);
        process.exit(1);
    }
}

checkBalances();
EOF
    echo -e "${GREEN}✅ Balance check script created${NC}"
    echo ""
fi

# Run the balance check
echo "🔍 Checking wallet balances..."
echo ""

# Execute Node.js script and capture output
output=$(cd /home/runner/work/quantum-pi-forge-fixed/quantum-pi-forge-fixed && node "$BALANCE_CHECK_SCRIPT" 2>&1)

echo "$output"
echo ""

# Parse JSON output if available
if echo "$output" | grep -q "---JSON---"; then
    json_output=$(echo "$output" | sed -n '/---JSON---/,$ p' | tail -n +2)
    
    # Extract values using grep and sed
    wallet_address=$(echo "$json_output" | grep -o '"address":"[^"]*"' | cut -d'"' -f4)
    matic_balance=$(echo "$json_output" | grep -o '"matic":"[^"]*"' | cut -d'"' -f4)
    oinio_balance=$(echo "$json_output" | grep -o '"oinio":"[^"]*"' | cut -d'"' -f4)
    
    echo "=================================================="
    echo "📊 Balance Summary"
    echo "=================================================="
    echo "Wallet: ${wallet_address}"
    echo ""
    
    # Check MATIC balance
    echo -n "MATIC Balance: ${matic_balance} MATIC - "
    matic_check=$(echo "$matic_balance >= $MIN_MATIC" | bc -l 2>/dev/null || echo "0")
    if [ "$matic_check" = "1" ]; then
        echo -e "${GREEN}✅ SUFFICIENT${NC}"
        if (( $(echo "$matic_balance >= $RECOMMENDED_MATIC" | bc -l) )); then
            echo "   (Above recommended minimum of ${RECOMMENDED_MATIC} MATIC)"
        else
            echo -e "   ${YELLOW}⚠️  Below recommended ${RECOMMENDED_MATIC} MATIC${NC}"
        fi
    else
        echo -e "${RED}❌ INSUFFICIENT${NC}"
        echo -e "   ${RED}Need at least ${MIN_MATIC} MATIC (recommended: ${RECOMMENDED_MATIC})${NC}"
    fi
    echo ""
    
    # Check OINIO balance
    echo -n "OINIO Balance: ${oinio_balance} OINIO - "
    oinio_check=$(echo "$oinio_balance >= $MIN_OINIO" | bc -l 2>/dev/null || echo "0")
    if [ "$oinio_check" = "1" ]; then
        echo -e "${GREEN}✅ SUFFICIENT${NC}"
        if (( $(echo "$oinio_balance >= $RECOMMENDED_OINIO" | bc -l) )); then
            echo "   (Above recommended minimum of ${RECOMMENDED_OINIO} OINIO)"
        else
            echo -e "   ${YELLOW}⚠️  Below recommended ${RECOMMENDED_OINIO} OINIO${NC}"
        fi
    else
        echo -e "${RED}❌ INSUFFICIENT${NC}"
        echo -e "   ${RED}Need at least ${MIN_OINIO} OINIO (recommended: ${RECOMMENDED_OINIO})${NC}"
    fi
    echo ""
    
    # Overall status
    if [ "$matic_check" = "1" ] && [ "$oinio_check" = "1" ]; then
        echo -e "${GREEN}✅ Sponsor wallet is properly funded!${NC}"
        echo ""
        echo "🎉 Ready for gasless transaction sponsorship!"
        exit 0
    else
        echo -e "${RED}❌ Sponsor wallet needs funding${NC}"
        echo ""
        echo "🔧 Funding Instructions:"
        echo ""
        echo "1. Send MATIC to: ${wallet_address}"
        echo "   - Minimum: ${MIN_MATIC} MATIC"
        echo "   - Recommended: ${RECOMMENDED_MATIC}+ MATIC"
        echo "   - Use: https://wallet.polygon.technology/"
        echo ""
        echo "2. Send OINIO tokens to: ${wallet_address}"
        echo "   - Minimum: ${MIN_OINIO} OINIO"
        echo "   - Recommended: ${RECOMMENDED_OINIO}+ OINIO"
        echo "   - Token: ${OINIO_TOKEN_ADDRESS}"
        echo ""
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Could not parse balance check output${NC}"
    echo "Manual verification required:"
    echo "  https://polygonscan.com/address/YOUR_WALLET_ADDRESS"
    exit 1
fi
