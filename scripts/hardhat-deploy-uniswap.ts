/**
 * 🚀 OINIO Sovereign Uniswap V2 Deployment Script
 * 
 * Deploys complete DEX infrastructure to 0G Aristotle Mainnet:
 * 1. UniswapV2Factory (pair management)
 * 2. UniswapV2Router02 (trading & liquidity)
 * 3. OINIO/WGAS Liquidity Pool (initial market)
 * 
 * Usage: npx hardhat run scripts/hardhat-deploy-uniswap.ts --network 0g-aristotle
 * 
 * Environment Variables Required (.env.launch):
 *   DEPLOYER_PRIVATE_KEY  - Account with gas funding
 *   DEPLOYER_ADDRESS      - Same account (for verification)
 *   WGAS_ADDRESS          - Wrapped 0G token address
 *   OINIO_TOKEN_ADDRESS   - OINIO ERC-20 token address (optional, for auto pool)
 *   OINIO_INITIAL_LIQUIDITY - Amount to seed (optional, default: 100000)
 *   WGAS_INITIAL_LIQUIDITY  - Amount to seed (optional, default: 10)
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
const envPath = path.join(__dirname, "../.env.launch");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const WGAS_ADDRESS = process.env.WGAS_ADDRESS;
const OINIO_ADDRESS = process.env.OINIO_TOKEN_ADDRESS;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const ENV_FILE = ".env.launch";
const LOG_DIR = "logs";
const LOG_FILE = path.join(LOG_DIR, "uniswap-hardhat-deployment.log");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ============================================================================
// ABIs
// ============================================================================

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint)",
  "function approve(address spender, uint amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint)",
  "function decimals() external view returns (uint8)",
];

const ROUTER_ABI = [
  "function factory() external view returns (address)",
  "function WETH() external view returns (address)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(message: string, level: "INFO" | "SUCCESS" | "ERROR" | "WARN" = "INFO") {
  const timestamp = new Date().toISOString();
  const icon = {
    INFO: "ℹ️",
    SUCCESS: "✅",
    ERROR: "❌",
    WARN: "⚠️",
  }[level];
  const logMessage = `[${timestamp}] ${icon} ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, `${logMessage}\n`);
}

function success(message: string) {
  const timestamp = new Date().toISOString();
  const successMessage = `[${timestamp}] ✅ ${message}`;
  console.log(successMessage);
  fs.appendFileSync(LOG_FILE, successMessage + "\n");
}

function updateEnvLaunch(key: string, value: string) {
  let envContent = fs.readFileSync(ENV_FILE, "utf8");

  if (envContent.includes(`${key}=`)) {
    envContent = envContent.replace(
      new RegExp(`${key}=.*`, "g"),
      `${key}=${value}`
    );
  } else {
    envContent += `\n${key}=${value}`;
  }

  fs.writeFileSync(ENV_FILE, envContent);
}

// ============================================================================
// DEPLOYMENT LOGIC
// ============================================================================

async function deploy() {
  log("🚀 Uniswap V2 Deployment on 0G Aristotle (Hardhat)");
  log("═════════════════════════════════════════════════════════════════");
  log("");

  // Validate environment
  if (!WGAS_ADDRESS || !OINIO_ADDRESS || !FEETO_SETTER) {
    throw new Error(
      "Missing required environment variables. Check .env.launch"
    );
  }

  // Get signer
  const [deployer] = await ethers.getSigners();
  log(`Deployer: ${deployer.address}`);

  const balance = await deployer.getBalance();
  log(`Balance: ${ethers.formatEther(balance)} 0G tokens`);

  if (balance < ethers.parseEther("0.5")) {
    throw new Error("Insufficient balance for deployment");
  }

  success("Pre-deployment checks passed");
  log("");

  // ========================================================================
  // STEP 1: Deploy Uniswap V2 Factory
  // ========================================================================

  log("📦 Step 1: Deploying Uniswap V2 Factory...");

  try {
    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const factory = await UniswapV2Factory.deploy(FEETO_SETTER);

    const factoryAddress = await factory.getAddress();
    log(`   Tx: ${factory.deploymentTransaction()?.hash}`);
    log(`   Waiting for confirmation...`);

    await factory.waitForDeployment();

    success(`Factory deployed at: ${factoryAddress}`);
    updateEnvLaunch("DEX_FACTORY_ADDRESS", factoryAddress);

    log("");

    // ====================================================================
    // STEP 2: Deploy Uniswap V2 Router02
    // ====================================================================

    log("📦 Step 2: Deploying Uniswap V2 Router02...");

    const UniswapV2Router02 = await ethers.getContractFactory(
      "UniswapV2Router02"
    );
    const router = await UniswapV2Router02.deploy(factoryAddress, WGAS_ADDRESS);

    const routerAddress = await router.getAddress();
    log(`   Tx: ${router.deploymentTransaction()?.hash}`);
    log(`   Waiting for confirmation...`);

    await router.waitForDeployment();

    success(`Router02 deployed at: ${routerAddress}`);
    updateEnvLaunch("DEX_ROUTER_ADDRESS", routerAddress);

    log("");

    // ====================================================================
    // STEP 3: Verify Deployment
    // ====================================================================

    log("✅ Verifying deployment...");

    const factoryOwner = await factory.feeToSetter();
    log(`   Factory FeeToSetter: ${factoryOwner}`);

    const routerFactory = await router.factory();
    log(`   Router Factory: ${routerFactory}`);

    const routerWeth = await router.WETH();
    log(`   Router WETH (W0G): ${routerWeth}`);

    success("Deployment verification complete");

    log("");

    // ====================================================================
    // STEP 4: Create OINIO/WGAS Pool
    // ====================================================================

    log("💧 Step 3: Creating OINIO/WGAS Liquidity Pool...");
    log(
      "   Note: This requires tokens in deployer wallet and proper approvals"
    );

    try {
      const ERC20_ABI = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function balanceOf(address account) public view returns (uint256)",
      ];

      const oinio = new ethers.Contract(
        OINIO_ADDRESS!,
        ERC20_ABI,
        deployer
      );
      const wgas = new ethers.Contract(WGAS_ADDRESS!, ERC20_ABI, deployer);

      const oinioBalance = await oinio.balanceOf(deployer.address);
      const wgasBalance = await wgas.balanceOf(deployer.address);

      log(`   OINIO Balance: ${ethers.formatEther(oinioBalance)}`);
      log(`   WGAS Balance: ${ethers.formatEther(wgasBalance)}`);

      if (oinioBalance > 0n && wgasBalance > 0n) {
        log("   Approving tokens...");

        const oinioApproval = await oinio.approve(routerAddress, oinioBalance);
        await oinioApproval.wait();
        log("     ✓ OINIO approved");

        const wgasApproval = await wgas.approve(routerAddress, wgasBalance);
        await wgasApproval.wait();
        log("     ✓ WGAS approved");

        log("   Creating liquidity...");

        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const tx = await router.addLiquidity(
          OINIO_ADDRESS,
          WGAS_ADDRESS,
          oinioBalance,
          wgasBalance,
          0,
          0,
          deployer.address,
          deadline
        );

        const receipt = await tx.wait();
        success(`Liquidity created! Tx: ${receipt?.hash}`);

        updateEnvLaunch("POOL_CREATED_AT", new Date().toISOString());
      } else {
        log("   ⚠️  Skipping liquidity creation: insufficient token balance");
      }
    } catch (err) {
      log(
        `   ⚠️  Liquidity creation skipped (may need manual creation): ${err}`
      );
    }

    log("");

    // ====================================================================
    // STEP 5: Summary
    // ====================================================================

    log("═════════════════════════════════════════════════════════════════");
    log("✅ DEPLOYMENT COMPLETE");
    log("═════════════════════════════════════════════════════════════════");
    log("");
    log("Deployed Addresses:");
    log(`  Factory: ${factoryAddress}`);
    log(`  Router:  ${routerAddress}`);
    log(`  WGAS:    ${WGAS_ADDRESS}`);
    log(`  OINIO:   ${OINIO_ADDRESS}`);
    log("");

    log("📌 .env.launch has been updated with:");
    log(`  DEX_FACTORY_ADDRESS=${factoryAddress}`);
    log(`  DEX_ROUTER_ADDRESS=${routerAddress}`);
    log("");

    log("🎯 Next Steps:");
    log("  1. Verify contracts on explorer (if supported)");
    log("  2. Test swaps with small amounts");
    log("  3. Deploy OINIO token if not already done");
    log("  4. Bootstrap liquidity if needed");
    log("  5. Ready for mainnet launch!");
    log("");

    success("Uniswap V2 deployment ready for OINIO");
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

deploy().catch((err) => {
  console.error(err);
  process.exit(1);
});
