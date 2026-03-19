#!/usr/bin/env node
/**
 * Quick balance check for deployment wallet
 * Usage: node scripts/check-wallet-balance.js
 */

require("dotenv").config({ path: ".env.launch" });
const { ethers } = require("ethers");

async function main() {
  const rpcUrl = process.env.ZERO_G_RPC_URL || "https://evmrpc.0g.ai";
  const address = process.env.DEPLOYER_ADDRESS;

  if (!address) {
    console.error("❌ DEPLOYER_ADDRESS not found in .env.launch");
    process.exit(1);
  }

  console.log("\n🔍 Checking wallet balance...");
  console.log(`📍 Network: ${rpcUrl}`);
  console.log(`💳 Address: ${address}\n`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(`💰 Balance: ${balanceInEth} GAS`);

    if (parseFloat(balanceInEth) >= 2.0) {
      console.log("✅ Sufficient balance for DEX deployment");
      process.exit(0);
    } else if (parseFloat(balanceInEth) > 0) {
      console.log("⚠️  Low balance - recommend 2-5 GAS for deployment");
      process.exit(1);
    } else {
      console.log("❌ Zero balance - wallet needs funding");
      console.log("\n📝 Funding Instructions:");
      console.log("   1. Visit 0G Aristotle faucet");
      console.log("   2. Request GAS tokens for:", address);
      console.log("   3. Wait for transaction confirmation");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
    process.exit(1);
  }
}

main();
