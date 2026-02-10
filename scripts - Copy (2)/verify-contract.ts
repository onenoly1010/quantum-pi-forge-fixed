import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying CentralAwarenessV2 deployment...");

  // Get contract address from file
  const fs = require("fs");
  const path = require("path");

  const contractAddressPath = path.join(
    __dirname,
    "..",
    "..",
    ".contract_address",
  );

  if (!fs.existsSync(contractAddressPath)) {
    throw new Error("Contract address not found. Run deployment first.");
  }

  const contractAddress = fs.readFileSync(contractAddressPath, "utf8").trim();
  console.log("📋 Contract Address:", contractAddress);

  // Attach to deployed contract
  const CentralAwarenessV2 =
    await ethers.getContractFactory("CentralAwarenessV2");
  const centralAwareness = CentralAwarenessV2.attach(contractAddress);

  // Verify basic functionality
  console.log("🏛️ Verifying contract ownership...");
  const owner = await centralAwareness.owner();
  console.log("👑 Owner:", owner);

  console.log("🎯 Checking total supply...");
  const totalSupply = await centralAwareness.totalSupply();
  console.log("📊 Total Agents:", totalSupply.toString());

  console.log("🔮 Checking sovereign readiness...");
  const isReady = await centralAwareness.isSovereignReady();
  console.log("✨ Sovereign Ready:", isReady);

  if (isReady) {
    console.log("🌟 Ecosystem configuration:");
    const config = await centralAwareness.getEcosystemConfig();
    console.log("  📄 Landing Page URI:", config[0]);
    console.log("  📚 Radicle Repo ID:", config[1]);
    console.log("  🏦 Staking Contract:", config[2]);
    console.log("  ⚡ Forwarder Contract:", config[3]);
    console.log(
      "  📅 Last Update:",
      new Date(Number(config[4]) * 1000).toISOString(),
    );
  }

  // Test agent forging (if none exist)
  if (totalSupply === 0n) {
    console.log("🏗️ Testing agent forging...");
    const [tester] = await ethers.getSigners();

    const tx = await centralAwareness.forgeAgent(
      tester.address,
      "ipfs://QmTestAgentMemory",
    );
    await tx.wait();
    console.log("✅ Test agent forged successfully");
  }

  // Verify agent details
  const newTotalSupply = await centralAwareness.totalSupply();
  if (newTotalSupply > 0n) {
    console.log("🔍 Verifying agent details...");
    const tokenId = newTotalSupply - 1n;
    const details = await centralAwareness.getAgentDetails(tokenId);
    console.log(`  🤖 Agent ${tokenId}:`);
    console.log(`    👤 Controller: ${details[0]}`);
    console.log(`    📄 Memory URI: ${details[1]}`);
    console.log(`    📊 Resonance: ${details[2]} Hz`);
  }

  console.log("");
  console.log("✅ VERIFICATION COMPLETE!");
  console.log("🎉 CentralAwarenessV2 is properly deployed and configured");
  console.log("⚡ Ready for sovereign operations on 0G Aristotle");
}

// Handle errors
main().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exitCode = 1;
});
