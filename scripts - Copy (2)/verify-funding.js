#!/usr/bin/env node
/**
 * 🚀 Quick Balance Verification Script
 * Verifies deployer wallet has sufficient A0G for DEX deployment
 *
 * Features:
 * - Multi-RPC fallback for resilience
 * - Gas price intelligence
 * - Automatic retry with exponential backoff
 * - Precise decimal handling
 *
 * Usage: node scripts/verify-funding.js
 */

// Load environment variables in order of precedence (CI writes .env.production)
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envCandidates = [".env.production", ".env.launch", ".env.local", ".env"];
let loadedEnv = null;
for (const candidate of envCandidates) {
  const p = path.resolve(process.cwd(), candidate);
  if (fs.existsSync(p)) {
    console.log(`🔐 Loading environment from ${candidate}`);
    dotenv.config({ path: p });
    loadedEnv = candidate;
    break;
  }
}
if (!loadedEnv) {
  console.warn(
    "⚠️ No env file found; relying on process environment variables.",
  );
}

const { ethers } = require("ethers");

// RPC endpoints (allow overrides from env)
const RPC_FALLBACKS = [];
if (process.env.ZERO_G_RPC_URL) RPC_FALLBACKS.push(process.env.ZERO_G_RPC_URL);
if (process.env.ZERO_G_RPC_FALLBACKS) {
  RPC_FALLBACKS.push(
    ...process.env.ZERO_G_RPC_FALLBACKS.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}
// Default backends
RPC_FALLBACKS.push(
  "https://evmrpc.0g.ai", // Primary
  "https://rpc.0g.ai", // Secondary
  "https://rpc-backup.0g.ai", // Tertiary
);

async function testRpcHealth(rpcUrl) {
  try {
    const startTime = Date.now();
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      timeout: 10000, // 10 second timeout for health checks
    });

    // Test both network connectivity and block sync
    const [network, blockNumber] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
    ]);

    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latency,
      blockNumber,
      chainId: network.chainId,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Infinity,
      error: error.message,
    };
  }
}

async function selectBestRpc() {
  console.log("🏁 Testing RPC endpoints for speed and health...");

  const rpcTests = await Promise.all(
    RPC_FALLBACKS.map(async (rpcUrl) => ({
      url: rpcUrl,
      ...(await testRpcHealth(rpcUrl)),
    })),
  );

  // Filter healthy RPCs and sort by latency
  const healthyRpcs = rpcTests
    .filter((rpc) => rpc.healthy)
    .sort((a, b) => a.latency - b.latency);

  if (healthyRpcs.length === 0) {
    throw new Error("No healthy RPC endpoints found");
  }

  const bestRpc = healthyRpcs[0];
  console.log(
    `✅ Selected fastest RPC: ${bestRpc.url} (${bestRpc.latency}ms latency)`,
  );
  console.log(`📊 Block: ${bestRpc.blockNumber}, Chain ID: ${bestRpc.chainId}`);

  // Show all healthy options for transparency
  if (healthyRpcs.length > 1) {
    console.log("📋 Healthy RPCs (sorted by speed):");
    healthyRpcs.forEach((rpc, index) => {
      console.log(`   ${index + 1}. ${rpc.url} (${rpc.latency}ms)`);
    });
  }

  return bestRpc.url;
}

// New helper: try a preferred RPC first, then fall back to configured RPCs
async function checkBalanceWithPreferredRpc(
  address,
  preferredRpc = null,
  maxRetries = 3,
) {
  let lastError;
  const rpcList = preferredRpc
    ? [preferredRpc, ...RPC_FALLBACKS.filter((r) => r !== preferredRpc)]
    : RPC_FALLBACKS;

  for (const rpcUrl of rpcList) {
    console.log(`🌐 Trying RPC for balance: ${rpcUrl}`);
    const isHealthy = await testRpcHealth(rpcUrl);
    if (!isHealthy) {
      console.log(`⚠️  Skipping unhealthy RPC: ${rpcUrl}`);
      continue;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Balance attempt ${attempt}/${maxRetries} on ${rpcUrl}`);
        const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          timeout: 10000,
        });
        const balance = await provider.getBalance(address);
        console.log(`✅ Balance retrieved from ${rpcUrl}`);
        return { balance, rpcUrl };
      } catch (err) {
        lastError = err;
        console.log(
          `⚠️  Attempt ${attempt} failed on ${rpcUrl}: ${err.message}`,
        );
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error("All RPC endpoints failed");
}
async function checkGasPrice(rpcUrl) {
  try {
    console.log("⛽ Analyzing gas market conditions...");

    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      timeout: 10000,
    });

    // Get current fee data and block info
    const [feeData, block] = await Promise.all([
      provider.getFeeData(),
      provider.getBlock("latest"),
    ]);

    const baseFee = feeData.gasPrice || ethers.parseUnits("1", "gwei");
    const maxFeePerGas = (baseFee * 120n) / 100n; // 20% buffer over base fee
    const maxPriorityFeePerGas = ethers.parseUnits("2", "gwei"); // Conservative priority fee

    // Estimate deployment gas cost (Uniswap V2 style deployment)
    const estimatedGas = 5000000n;
    const estimatedCost = estimatedGas * maxFeePerGas;
    const estimatedCostA0G = ethers.formatUnits(estimatedCost, 18);

    console.log(`📈 Base Fee: ${ethers.formatUnits(baseFee, "gwei")} gwei`);
    console.log(
      `🎯 Recommended Max Fee: ${ethers.formatUnits(maxFeePerGas, "gwei")} gwei`,
    );
    console.log(
      `⭐ Priority Fee: ${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} gwei`,
    );
    console.log(`💰 Estimated Deployment Cost: ${estimatedCostA0G} A0G`);

    // Check if gas prices are reasonable
    const maxReasonableFee = ethers.parseUnits("50", "gwei"); // 50 gwei threshold
    const isGasReasonable = maxFeePerGas <= maxReasonableFee;

    if (!isGasReasonable) {
      console.log(
        "⚠️  Gas prices are elevated. Consider waiting for market stabilization.",
      );
      console.log(
        `   Current fee (${ethers.formatUnits(maxFeePerGas, "gwei")} gwei) exceeds reasonable threshold.`,
      );
    }

    return {
      baseFee,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimatedCost: estimatedCostA0G,
      isReasonable: isGasReasonable,
      blockNumber: block.number,
      gasPriceGwei: parseFloat(ethers.formatUnits(baseFee, "gwei")),
    };
  } catch (error) {
    console.log(`⚠️  Gas price analysis failed: ${error.message}`);
    // Return conservative defaults
    return {
      baseFee: ethers.parseUnits("1", "gwei"),
      maxFeePerGas: ethers.parseUnits("5", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
      estimatedCost: "0.025",
      isReasonable: true,
      blockNumber: 0,
      gasPriceGwei: 1.0,
    };
  }
}

async function main() {
  let deployerAddress = process.env.DEPLOYER_ADDRESS;
  const deployerPrivateKey =
    process.env.DEPLOYER_PRIVATE_KEY || process.env.SPONSOR_PRIVATE_KEY;

  // Derive address from private key when DEPLOYER_ADDRESS is not explicitly provided
  if (!deployerAddress) {
    if (deployerPrivateKey) {
      try {
        const wallet = new ethers.Wallet(deployerPrivateKey);
        deployerAddress = wallet.address;
        console.log(
          `🔐 Derived deployer address from private key: ${deployerAddress}`,
        );
      } catch (err) {
        console.error(
          "❌ Failed to derive deployer address from private key:",
          err.message,
        );
      }
    }
  }

  if (!deployerAddress) {
    console.error(
      "❌ DEPLOYER_ADDRESS not found and could not be derived from private key",
    );
    console.log(
      "💡 Make sure .env.launch or .env.production exists and contains DEPLOYER_ADDRESS or DEPLOYER_PRIVATE_KEY",
    );
    process.exit(1);
  }

  console.log("🔍 Verifying deployer wallet balance...");
  console.log(`💳 Address: ${deployerAddress}`);
  console.log("");

  try {
    // Select the fastest healthy RPC
    const bestRpcUrl = await selectBestRpc();
    console.log("");

    // Check balance with the best RPC (attempt preferred RPC first)
    const { balance, rpcUrl } = await checkBalanceWithPreferredRpc(
      deployerAddress,
      bestRpcUrl,
    );
    const balanceInEth = parseFloat(ethers.formatEther(balance));

    console.log(`💰 Current Balance: ${balanceInEth.toFixed(4)} A0G`);
    console.log(`🌐 Retrieved via: ${rpcUrl}`);
    console.log("");

    // Get comprehensive gas intelligence
    const gasData = await checkGasPrice(bestRpcUrl);
    console.log("");

    // Enhanced balance validation with gas awareness
    const minRequired = ethers.parseUnits("5.0", 18); // 5 A0G minimum
    const recommended = ethers.parseUnits("8.0", 18); // 8 A0G recommended
    const estimatedCostWei = ethers.parseUnits(gasData.estimatedCost, 18);

    // Check if balance covers deployment + reasonable gas buffer
    const safeBalance = balance >= estimatedCostWei + minRequired;

    if (balance >= recommended && safeBalance) {
      console.log("✅ SUCCESS: Excellent balance for DEX deployment!");
      console.log("💡 You have enough for deployment + gas buffer");
      console.log(
        `🛡️  Gas protection: ${gasData.isReasonable ? "✅ Reasonable fees" : "⚠️  Elevated fees"}`,
      );
      console.log("");
      console.log("🚀 Ready to deploy:");
      console.log(
        "   npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle",
      );
      process.exit(0);
    } else if (balance >= minRequired && safeBalance) {
      console.log("✅ SUCCESS: Sufficient balance for DEX deployment!");
      console.log("⚠️  Balance meets minimum requirements");
      console.log(
        `🛡️  Gas protection: ${gasData.isReasonable ? "✅ Reasonable fees" : "⚠️  Elevated fees - monitor closely"}`,
      );
      console.log("");
      console.log("🚀 Ready to deploy:");
      console.log(
        "   npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle",
      );
      process.exit(0);
    } else {
      const shortfall = parseFloat(
        ethers.formatEther(minRequired + estimatedCostWei - balance),
      );
      console.log(`❌ INSUFFICIENT: Need ${shortfall.toFixed(4)} more A0G`);
      console.log(
        `   Required: ${ethers.formatEther(minRequired + estimatedCostWei)} A0G (min + gas)`,
      );
      console.log(`   Current: ${balanceInEth.toFixed(4)} A0G`);
      console.log("");
      console.log("💡 Funding options:");
      console.log("   • 0G Discord faucet (#faucet channel)");
      console.log("   • 0G Ecosystem grants");
      console.log("   • Exchange purchase");
      console.log(`   • Send to: ${deployerAddress}`);
      console.log("");
      console.log("🔄 After funding, run: npm run verify-funding");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("   • Check internet connectivity");
    console.log("   • All RPC endpoints may be temporarily down");
    console.log("   • Verify address format:", deployerAddress);
    console.log("   • Check .env.launch configuration");
    console.log("");
    console.log("⏳ The script tried all fallback RPCs automatically");
    process.exit(1);
  }
}

main();
