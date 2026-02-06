/**
 * 🚀 OINIO/WGAS Liquidity Pool Creation Script
 *
 * Creates the initial liquidity pool for OINIO/GAS trading pair on 0G Aristotle
 *
 * Usage: npx hardhat run scripts/create-liquidity-pool.ts --network 0g-aristotle
 *
 * Prerequisites:
 *   - DEX Router and Factory deployed
 *   - OINIO tokens in deployer wallet
 *   - WGAS tokens in deployer wallet
 *   - Sufficient GAS for transaction fees
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
const LOG_FILE = path.join(LOG_DIR, "liquidity-pool-creation.log");

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
 * ERC20 ABI for token interactions
 */
const ERC20_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function approve(address, uint256) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
];

/**
 * Uniswap V2 Router ABI (key functions for liquidity)
 */
const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function factory() external view returns (address)",
];

/**
 * Main liquidity pool creation function
 */
async function createLiquidityPool() {
  log("🚀 OINIO/WGAS Liquidity Pool Creation", "INFO");
  log("═".repeat(70), "INFO");

  // Configuration from environment
  const routerAddress = process.env.DEX_ROUTER_ADDRESS;
  const oinioAddress = process.env.OINIO_TOKEN_ADDRESS;
  const wgasAddress = process.env.WGAS_ADDRESS;
  const deployerAddress = process.env.DEPLOYER_ADDRESS;

  // Liquidity amounts
  const oinioAmount = ethers.parseUnits(process.env.INITIAL_LIQUIDITY_OINIO || "100000000", 18); // 100M OINIO
  const gasAmount = ethers.parseUnits(process.env.INITIAL_LIQUIDITY_GAS || "50", 18); // 50 GAS

  // Slippage and deadline
  const slippageTolerance = 100; // 1% (100 = 1%)
  const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes

  // Validation
  if (!routerAddress || routerAddress === "0x0000000000000000000000000000000000000000") {
    log("ERROR: DEX_ROUTER_ADDRESS not set or invalid", "ERROR");
    process.exit(1);
  }

  if (!oinioAddress) {
    log("ERROR: OINIO_TOKEN_ADDRESS not set", "ERROR");
    process.exit(1);
  }

  if (!wgasAddress) {
    log("ERROR: WGAS_ADDRESS not set", "ERROR");
    process.exit(1);
  }

  log(`Router: ${routerAddress}`, "INFO");
  log(`OINIO: ${oinioAddress}`, "INFO");
  log(`WGAS: ${wgasAddress}`, "INFO");
  log(`Liquidity: ${ethers.formatUnits(oinioAmount, 18)} OINIO / ${ethers.formatUnits(gasAmount, 18)} GAS`, "INFO");

  // Get signer
  const [deployer] = await ethers.getSigners();
  log(`Deployer: ${deployer.address}`, "INFO");

  // Check balances
  log("\nChecking token balances...", "INFO");

  const oinioContract = new ethers.Contract(oinioAddress, ERC20_ABI, deployer);
  const wgasContract = new ethers.Contract(wgasAddress, ERC20_ABI, deployer);

  const oinioBalance = await oinioContract.balanceOf(deployer.address);
  const wgasBalance = await wgasContract.balanceOf(deployer.address);

  log(`OINIO Balance: ${ethers.formatUnits(oinioBalance, 18)}`, "INFO");
  log(`WGAS Balance: ${ethers.formatUnits(wgasBalance, 18)}`, "INFO");

  // Verify sufficient balances
  if (oinioBalance < oinioAmount) {
    log(`ERROR: Insufficient OINIO balance. Need ${ethers.formatUnits(oinioAmount, 18)}, have ${ethers.formatUnits(oinioBalance, 18)}`, "ERROR");
    process.exit(1);
  }

  if (wgasBalance < gasAmount) {
    log(`ERROR: Insufficient WGAS balance. Need ${ethers.formatUnits(gasAmount, 18)}, have ${ethers.formatUnits(wgasBalance, 18)}`, "ERROR");
    process.exit(1);
  }

  log("✅ Sufficient balances confirmed", "SUCCESS");

  // Calculate minimum amounts with slippage
  const oinioMin = (oinioAmount * BigInt(10000 - slippageTolerance)) / BigInt(10000);
  const gasMin = (gasAmount * BigInt(10000 - slippageTolerance)) / BigInt(10000);

  log(`Slippage Tolerance: ${slippageTolerance/100}%`, "INFO");
  log(`OINIO Min: ${ethers.formatUnits(oinioMin, 18)}`, "INFO");
  log(`GAS Min: ${ethers.formatUnits(gasMin, 18)}`, "INFO");

  // Connect to router
  const router = new ethers.Contract(routerAddress, ROUTER_ABI, deployer);

  // Approve tokens for router
  log("\nApproving tokens for router...", "INFO");

  log("Approving OINIO...", "INFO");
  const oinioApproval = await oinioContract.approve(routerAddress, oinioAmount);
  await oinioApproval.wait();
  log("✅ OINIO approved", "SUCCESS");

  log("Approving WGAS...", "INFO");
  const wgasApproval = await wgasContract.approve(routerAddress, gasAmount);
  await wgasApproval.wait();
  log("✅ WGAS approved", "SUCCESS");

  // Create liquidity pool
  log("\n🚀 Creating OINIO/WGAS liquidity pool...", "INFO");

  try {
    const tx = await router.addLiquidity(
      oinioAddress,
      wgasAddress,
      oinioAmount,
      gasAmount,
      oinioMin,
      gasMin,
      deployer.address,
      deadline
    );

    log(`Transaction sent: ${tx.hash}`, "INFO");
    const receipt = await tx.wait();

    if (receipt?.status === 1) {
      log("✅ Liquidity pool created successfully!", "SUCCESS");
      log(`Block: ${receipt.blockNumber}`, "INFO");
      log(`Gas used: ${receipt.gasUsed}`, "INFO");

      // Get pool address
      const factoryAddress = await router.factory();
      const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress);
      const poolAddress = await factory.getPair(oinioAddress, wgasAddress);

      log(`🎉 Pool Address: ${poolAddress}`, "SUCCESS");

      // Log final amounts
      const events = receipt.logs.filter((log: any) =>
        log.address === poolAddress && log.topics[0] === ethers.id("Mint(address,uint256,uint256)")
      );

      if (events.length > 0) {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256", "uint256"],
          events[0].data
        );
        log(`OINIO Added: ${ethers.formatUnits(decoded[0], 18)}`, "INFO");
        log(`GAS Added: ${ethers.formatUnits(decoded[1], 18)}`, "INFO");
      }

      // Update environment
      updateEnvFile({
        LIQUIDITY_POOL_ADDRESS: poolAddress,
        LIQUIDITY_CREATED_AT: new Date().toISOString(),
        LIQUIDITY_OINIO_AMOUNT: ethers.formatUnits(oinioAmount, 18),
        LIQUIDITY_GAS_AMOUNT: ethers.formatUnits(gasAmount, 18),
      });

      log("\n🎊 OINIO/OG PAIRING COMPLETE!", "SUCCESS");
      log("The sovereign economy is now live! 🔮", "SUCCESS");

    } else {
      log("❌ Transaction failed", "ERROR");
      process.exit(1);
    }

  } catch (error: any) {
    log(`❌ Liquidity pool creation failed: ${error.message}`, "ERROR");

    if (error.message.includes("INSUFFICIENT_LIQUIDITY")) {
      log("Suggestion: Check if this is the first pool for these tokens", "WARN");
    } else if (error.message.includes("EXPIRED")) {
      log("Suggestion: Increase deadline or retry transaction", "WARN");
    } else if (error.message.includes("INSUFFICIENT_AMOUNT")) {
      log("Suggestion: Reduce slippage tolerance or check token amounts", "WARN");
    }

    process.exit(1);
  }
}

/**
 * Update .env.launch with liquidity pool information
 */
function updateEnvFile(updates: Record<string, string>) {
  let content = fs.existsSync(".env.launch") ? fs.readFileSync(".env.launch", "utf-8") : "";

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    content = regex.test(content) ? content.replace(regex, `${key}=${value}`) : content + `\n${key}=${value}`;
  }

  fs.writeFileSync(".env.launch", content);
  log("Updated .env.launch with liquidity pool information", "SUCCESS");
}

// Execute
createLiquidityPool()
  .then(() => {
    log("Liquidity pool creation completed successfully! 🎉", "SUCCESS");
    process.exit(0);
  })
  .catch((err) => {
    log(`FATAL ERROR: ${err.message}`, "ERROR");
    process.exit(1);
  });