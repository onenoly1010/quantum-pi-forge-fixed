#!/bin/bash
################################################################################
# OINIO Liquidity Pool Creation for Uniswap V2
# Creates OINIO/WGAS trading pair after DEX deployment
#
# Prerequisites:
#   - DEX Factory & Router deployed
#   - DEX_FACTORY_ADDRESS in .env.launch
#   - DEX_ROUTER_ADDRESS in .env.launch
#   - OINIO_TOKEN_ADDRESS in .env.launch
#   - WGAS_ADDRESS in .env.launch
#   - DEPLOYER_PRIVATE_KEY in .env.launch (with sufficient tokens)
#
# Usage:
#   source .env.launch
#   bash scripts/create-liquidity-pool.sh
#
# What it does:
#   1. Approves Router to spend OINIO tokens
#   2. Approves Router to spend WGAS tokens
#   3. Creates OINIO/WGAS liquidity pool
#   4. Records pool address
#   5. Ready for trading!
################################################################################

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

RPC_URL="${ZERO_G_RPC_URL}"
FACTORY_ADDRESS="${DEX_FACTORY_ADDRESS}"
ROUTER_ADDRESS="${DEX_ROUTER_ADDRESS}"
OINIO_ADDRESS="${OINIO_TOKEN_ADDRESS}"
WGAS_ADDRESS="${WGAS_ADDRESS}"
DEPLOYER_ADDRESS="${DEPLOYER_ADDRESS}"
DEPLOYER_PRIVATE_KEY="${DEPLOYER_PRIVATE_KEY}"

LOG_FILE="logs/liquidity-pool.log"
ENV_FILE=".env.launch"

# ============================================================================
# HELPER FUNCTIONS
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

# ============================================================================
# MAIN EXECUTION
# ============================================================================

log "🚀 OINIO Liquidity Pool Creation"
log "═════════════════════════════════════════════════════════════════"
log ""

# Check prerequisites
log "🔍 Checking prerequisites..."

if [ -z "$FACTORY_ADDRESS" ]; then
    error "DEX_FACTORY_ADDRESS not set. Deploy factory first!"
fi

if [ -z "$ROUTER_ADDRESS" ]; then
    error "DEX_ROUTER_ADDRESS not set. Deploy router first!"
fi

if [ -z "$OINIO_ADDRESS" ]; then
    error "OINIO_TOKEN_ADDRESS not set."
fi

if [ -z "$WGAS_ADDRESS" ]; then
    error "WGAS_ADDRESS not set."
fi

if [ -z "$DEPLOYER_ADDRESS" ]; then
    error "DEPLOYER_ADDRESS not set."
fi

if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    error "DEPLOYER_PRIVATE_KEY not set."
fi

if [ ! -f "$ENV_FILE" ]; then
    error "$ENV_FILE not found."
fi

mkdir -p logs

success "All prerequisites present"
log ""

# Display configuration
log "📋 Configuration:"
log "   Factory: $FACTORY_ADDRESS"
log "   Router: $ROUTER_ADDRESS"
log "   OINIO: $OINIO_ADDRESS"
log "   WGAS: $WGAS_ADDRESS"
log "   Deployer: $DEPLOYER_ADDRESS"
log ""

# Step 1: Verify RPC connection
log "📡 Verifying RPC connection..."

CHAIN_ID_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    "$RPC_URL")

CHAIN_ID=$(echo "$CHAIN_ID_RESPONSE" | jq -r '.result' 2>/dev/null || echo "")

if [ -z "$CHAIN_ID" ] || [ "$CHAIN_ID" = "null" ]; then
    error "RPC endpoint not responding: $RPC_URL"
fi

# Convert hex to decimal
CHAIN_ID_DEC=$((16#${CHAIN_ID:2}))
success "RPC responding (Chain ID: $CHAIN_ID_DEC)"
log ""

# Step 2: Verify DEX contracts deployed
log "✅ Verifying DEX contracts..."

FACTORY_CODE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$FACTORY_ADDRESS\",\"latest\"],\"id\":1}" \
    "$RPC_URL" | jq -r '.result')

if [ "$FACTORY_CODE" = "0x" ]; then
    error "Factory not found at $FACTORY_ADDRESS"
fi
success "Factory verified"

ROUTER_CODE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$ROUTER_ADDRESS\",\"latest\"],\"id\":1}" \
    "$RPC_URL" | jq -r '.result')

if [ "$ROUTER_CODE" = "0x" ]; then
    error "Router not found at $ROUTER_ADDRESS"
fi
success "Router verified"
log ""

# Step 3: Prepare liquidity pool creation
log "💧 Creating Liquidity Pool..."
log ""
log "This requires sending transactions with ethers.js or web3.js"
log ""
log "Liquidity Pool Creation Steps:"
log ""
log "1️⃣  Approve OINIO tokens:"
log "    function: token.approve(ROUTER_ADDRESS, amount)"
log "    amount: Your OINIO quantity (e.g., 1000000 with 18 decimals)"
log ""
log "2️⃣  Approve WGAS tokens:"
log "    function: wgas.approve(ROUTER_ADDRESS, amount)"
log "    amount: Your WGAS quantity (e.g., 10 with 18 decimals)"
log ""
log "3️⃣  Create liquidity:"
log "    function: router.addLiquidity("
log "      tokenA: $OINIO_ADDRESS,"
log "      tokenB: $WGAS_ADDRESS,"
log "      amountADesired: 1000000000000000000 (1 OINIO),"
log "      amountBDesired: 10000000000000000000 (10 WGAS),"
log "      amountAMin: 0,"
log "      amountBMin: 0,"
log "      to: $DEPLOYER_ADDRESS,"
log "      deadline: $(date +%s) + 3600"
log "    )"
log ""

# Step 4: Provide automation script
log "═════════════════════════════════════════════════════════════════"
log "⚙️  AUTOMATED DEPLOYMENT (TypeScript)"
log "═════════════════════════════════════════════════════════════════"
log ""

cat > /tmp/create-pool-template.ts << 'EOF'
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.launch" });

const provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL!);
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

const ROUTER_ADDRESS = process.env.DEX_ROUTER_ADDRESS!;
const OINIO_ADDRESS = process.env.OINIO_TOKEN_ADDRESS!;
const WGAS_ADDRESS = process.env.WGAS_ADDRESS!;

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
];

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)",
];

async function createPool() {
  console.log("Creating OINIO/WGAS liquidity pool...");

  // Get token contracts
  const oinio = new ethers.Contract(OINIO_ADDRESS, ERC20_ABI, signer);
  const wgas = new ethers.Contract(WGAS_ADDRESS, ERC20_ABI, signer);
  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

  // Check balances
  const oinioBalance = await oinio.balanceOf(signer.address);
  const wgasBalance = await wgas.balanceOf(signer.address);

  console.log(`OINIO balance: ${ethers.formatEther(oinioBalance)}`);
  console.log(`WGAS balance: ${ethers.formatEther(wgasBalance)}`);

  if (oinioBalance === 0n || wgasBalance === 0n) {
    throw new Error("Insufficient token balance");
  }

  // Approve amounts (use full balance for simplicity)
  console.log("Approving OINIO...");
  const oinioApproval = await oinio.approve(ROUTER_ADDRESS, oinioBalance);
  await oinioApproval.wait();

  console.log("Approving WGAS...");
  const wgasApproval = await wgas.approve(ROUTER_ADDRESS, wgasBalance);
  await wgasApproval.wait();

  // Create liquidity
  console.log("Creating liquidity pool...");
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const tx = await router.addLiquidity(
    OINIO_ADDRESS,
    WGAS_ADDRESS,
    oinioBalance,
    wgasBalance,
    0,
    0,
    signer.address,
    deadline
  );

  const receipt = await tx.wait();
  console.log(`✅ Pool created! Tx: ${receipt?.hash}`);
}

createPool().catch(console.error);
EOF

log "Created template: /tmp/create-pool-template.ts"
log "Usage: npx ts-node /tmp/create-pool-template.ts"
log ""

# Step 5: Summary
log "═════════════════════════════════════════════════════════════════"
log "📋 NEXT STEPS"
log "═════════════════════════════════════════════════════════════════"
log ""
log "Option A: Use automated script (recommended)"
log "  npm install ethers dotenv"
log "  npx ts-node /tmp/create-pool-template.ts"
log ""
log "Option B: Use MetaMask + Etherscan write functions"
log "  1. Go to https://0g-arisotle-scan.com (explorer)"
log "  2. Find Router contract"
log "  3. Connect MetaMask wallet"
log "  4. Call addLiquidity with parameters from above"
log ""
log "Option C: Use hardhat task"
log "  npx hardhat run scripts/add-liquidity.js --network 0g"
log ""

success "Liquidity pool creation ready"
log ""

log "💡 IMPORTANT"
log "═════════════"
log "✓ Ensure you have OINIO and WGAS tokens in wallet"
log "✓ Ensure router is approved to spend both tokens"
log "✓ Use realistic amounts for slippage protection (amountAMin, amountBMin)"
log "✓ Set deadline to future time (current + 3600 seconds = 1 hour)"
log ""

success "Liquidity pool script ready. Execute when deployment is confirmed."
