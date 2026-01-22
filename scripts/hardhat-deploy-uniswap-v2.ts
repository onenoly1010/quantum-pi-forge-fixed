/**
 * 🚀 OINIO Sovereign Uniswap V2 Deployment Script (Production)
 * 
 * Deploys complete DEX infrastructure to 0G Aristotle Mainnet:
 * 1. UniswapV2Factory (pair management)
 * 2. UniswapV2Router02 (trading & liquidity)
 * 3. OINIO/WGAS Liquidity Pool (initial market)
 * 
 * Usage: npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle
 * 
 * Prerequisites:
 *   npm install -D hardhat @nomicfoundation/hardhat-ethers
 *   npm install @uniswap/v2-core @uniswap/v2-periphery ethers dotenv
 * 
 * Environment Variables Required (.env.launch):
 *   DEPLOYER_PRIVATE_KEY      - Account with gas funding
 *   DEPLOYER_ADDRESS          - Same account (for verification)
 *   WGAS_ADDRESS              - Wrapped 0G token address
 *   OINIO_TOKEN_ADDRESS       - OINIO ERC-20 token (optional, for auto pool)
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
const envPath = path.join(__dirname, "../.env.launch");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const LOG_DIR = "logs";
const LOG_FILE = path.join(LOG_DIR, "uniswap-v2-deployment.log");

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log helper with icons and timestamps
 */
function log(message: string, level: "INFO" | "SUCCESS" | "ERROR" | "WARN" = "INFO") {
  const timestamp = new Date().toISOString();
  const icon = { INFO: "ℹ️", SUCCESS: "✅", ERROR: "❌", WARN: "⚠️" }[level];
  const msg = `[${timestamp}] ${icon} ${message}`;
  console.log(msg);
  fs.appendFileSync(LOG_FILE, `${msg}\n`);
}

/**
 * Update .env.launch with addresses
 */
function updateEnv(updates: Record<string, string>) {
  let content = fs.existsSync(".env.launch") ? fs.readFileSync(".env.launch", "utf-8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    content = regex.test(content) ? content.replace(regex, `${key}=${value}`) : content + `\n${key}=${value}`;
  }
  fs.writeFileSync(".env.launch", content);
  log(`Updated .env.launch`, "SUCCESS");
}

/**
 * Main deployment
 */
async function deploy() {
  log("🚀 OINIO Sovereign Uniswap V2 Deployment", "INFO");
  log("═".repeat(70), "INFO");

  // Validate environment
  const wgasAddress = process.env.WGAS_ADDRESS;
  const oinioAddress = process.env.OINIO_TOKEN_ADDRESS;
  const deployerAddress = process.env.DEPLOYER_ADDRESS;

  if (!wgasAddress) {
    log("ERROR: WGAS_ADDRESS not set in .env.launch", "ERROR");
    process.exit(1);
  }

  if (!deployerAddress) {
    log("ERROR: DEPLOYER_ADDRESS not set in .env.launch", "ERROR");
    process.exit(1);
  }

  // Get signer
  const [deployer] = await ethers.getSigners();
  log(`Deployer: ${deployer.address}`, "INFO");

  const balance = await deployer.provider!.getBalance(deployer.address);
  const balanceEth = ethers.formatEther(balance);
  log(`Balance: ${balanceEth} 0G`, "INFO");

  if (balance < ethers.parseEther("0.5")) {
    log("Insufficient balance for deployment", "ERROR");
    process.exit(1);
  }

  log("Pre-checks passed ✓", "SUCCESS");
  log("", "INFO");

  // ============================================================================
  // STEP 1: Deploy Factory
  // ============================================================================
  
  log("Step 1/3: Deploying UniswapV2Factory...", "INFO");
  
  const factory = await ethers.deployContract("UniswapV2Factory", [deployerAddress]);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  
  log(`Factory: ${factoryAddr}`, "SUCCESS");
  const feeToSetter = await factory.feeToSetter();
  log(`FeeToSetter: ${feeToSetter}`, "INFO");

  // ============================================================================
  // STEP 2: Deploy Router
  // ============================================================================
  
  log("", "INFO");
  log("Step 2/3: Deploying UniswapV2Router02...", "INFO");
  
  const router = await ethers.deployContract("UniswapV2Router02", [factoryAddr, wgasAddress]);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  
  log(`Router: ${routerAddr}`, "SUCCESS");
  const routerFactory = await router.factory();
  const routerWeth = await router.WETH();
  log(`Router.factory: ${routerFactory}`, "INFO");
  log(`Router.WETH: ${routerWeth}`, "INFO");

  // ============================================================================
  // STEP 3: Create Liquidity Pool (if OINIO provided)
  // ============================================================================
  
  log("", "INFO");
  
  if (!oinioAddress) {
    log("Step 3/3: Skipping pool creation (OINIO_TOKEN_ADDRESS not provided)", "WARN");
  } else {
    log("Step 3/3: Creating OINIO/WGAS liquidity pool...", "INFO");

    try {
      const ERC20_ABI = [
        "function balanceOf(address) external view returns (uint)",
        "function approve(address, uint) external returns (bool)",
        "function decimals() external view returns (uint8)",
      ];

      const oinio = new ethers.Contract(oinioAddress, ERC20_ABI, deployer);
      const wgas = new ethers.Contract(wgasAddress, ERC20_ABI, deployer);

      const oinioBalance = await oinio.balanceOf(deployer.address);
      const wgasBalance = await wgas.balanceOf(deployer.address);
      const oinioDecimals = await oinio.decimals();
      const wgasDecimals = await wgas.decimals();

      log(`OINIO balance: ${ethers.formatUnits(oinioBalance, oinioDecimals)}`, "INFO");
      log(`WGAS balance: ${ethers.formatUnits(wgasBalance, wgasDecimals)}`, "INFO");

      if (oinioBalance > 0n && wgasBalance > 0n) {
        // Approve tokens
        log("Approving OINIO...", "INFO");
        await (await oinio.approve(routerAddr, oinioBalance)).wait();
        log("Approved OINIO ✓", "SUCCESS");

        log("Approving WGAS...", "INFO");
        await (await wgas.approve(routerAddr, wgasBalance)).wait();
        log("Approved WGAS ✓", "SUCCESS");

        // Add liquidity
        log("Creating liquidity...", "INFO");
        const deadline = Math.floor(Date.now() / 1000) + 600;
        const tx = await router.addLiquidity(
          oinioAddress,
          wgasAddress,
          oinioBalance,
          wgasBalance,
          0,
          0,
          deployer.address,
          deadline
        );
        const receipt = await tx.wait();
        log(`Pool created (block: ${receipt?.blockNumber})`, "SUCCESS");

        // Verify pair
        const pairAddr = await factory.getPair(oinioAddress, wgasAddress);
        log(`OINIO/WGAS pair: ${pairAddr}`, "INFO");

      } else {
        log("Insufficient token balance for liquidity", "WARN");
      }
    } catch (err) {
      log(`Pool creation failed: ${(err as Error).message}`, "WARN");
    }
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  
  log("", "INFO");
  log("═".repeat(70), "INFO");
  log("✅ DEPLOYMENT COMPLETE", "SUCCESS");
  log("═".repeat(70), "INFO");
  log("", "INFO");

  console.log(`
  Factory:   ${factoryAddr}
  Router:    ${routerAddr}
  WGAS:      ${wgasAddress}
  OINIO:     ${oinioAddress || "Not provided"}
  Network:   0G Aristotle Mainnet (Chain ID: 16661)
  Deployer:  ${deployer.address}
  `);

  // Update .env.launch
  updateEnv({
    DEX_FACTORY_ADDRESS: factoryAddr,
    DEX_ROUTER_ADDRESS: routerAddr,
  });

  log("Ready for trading! 🎉", "SUCCESS");
  log("", "INFO");
}

deploy()
  .then(() => process.exit(0))
  .catch((err) => {
    log(`FATAL: ${err.message}`, "ERROR");
    process.exit(1);
  });
