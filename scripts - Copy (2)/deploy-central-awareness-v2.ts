import { ethers } from "hardhat";

async function main() {
  console.log("🔮 Deploying CentralAwarenessV2 to 0G Aristotle...");
  console.log("📅 January 2026 - The Sovereign Era Begins");
  console.log("");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying from:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH");

  // Deploy CentralAwarenessV2
  console.log("⚡ Deploying CentralAwarenessV2 contract...");
  const CentralAwarenessV2 =
    await ethers.getContractFactory("CentralAwarenessV2");

  // Deploy with deployer as initial owner
  const centralAwareness = await CentralAwarenessV2.deploy(deployer.address);
  await centralAwareness.waitForDeployment();

  const contractAddress = await centralAwareness.getAddress();
  console.log("✅ CentralAwarenessV2 deployed to:", contractAddress);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const owner = await centralAwareness.owner();
  console.log("👑 Contract owner:", owner);

  const isReady = await centralAwareness.isSovereignReady();
  console.log("🔮 Sovereign ready:", isReady);

  // Forge the first sovereign agent (the deployer)
  console.log("🏛️ Forging the first Sovereign Agent...");
  const tx = await centralAwareness.forgeAgent(
    deployer.address,
    "ipfs://QmSovereignAwarenessV2", // Placeholder - will be updated with actual IPFS hash
  );
  await tx.wait();

  const totalSupply = await centralAwareness.totalSupply();
  console.log("🎯 Total agents forged:", totalSupply.toString());

  console.log("");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("🌐 Network: 0G Aristotle (Chain ID: 16661)");
  console.log("⚡ EVM Version: Cancun-compatible");
  console.log("");
  console.log("📝 Next Steps:");
  console.log("1. Update ecosystem config with IPFS landing page");
  console.log("2. Set Radicle repository ID");
  console.log("3. Configure staking and forwarder contracts");
  console.log("4. Run the full migration script");
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
