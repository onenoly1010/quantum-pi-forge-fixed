// scripts/deployOINIO.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying OINIO Quantum System...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy OINIO Token
  console.log("📝 Deploying OINIO Token...");
  const OINIOToken = await ethers.getContractFactory("OINIOToken");
  const forgeAddress = deployer.address; // Use deployer as forge initially
  const oinioToken = await OINIOToken.deploy(forgeAddress);
  await oinioToken.waitForDeployment();

  const tokenAddress = await oinioToken.getAddress();
  console.log("✅ OINIO Token deployed to:", tokenAddress);

  // Deploy Truth Engine
  console.log("🧠 Deploying Truth Engine...");
  const TruthEngine = await ethers.getContractFactory("TruthEngine");
  const truthEngine = await TruthEngine.deploy();
  await truthEngine.waitForDeployment();

  const truthAddress = await truthEngine.getAddress();
  console.log("✅ Truth Engine deployed to:", truthAddress);

  // Initialize system
  console.log("🔮 Initializing quantum system...");
  const totalSupply = await oinioToken.totalSupply();
  console.log("OINIO Total Supply:", ethers.formatEther(totalSupply));

  console.log("\n🎯 Deployment Complete!");
  console.log("OINIO Token:", tokenAddress);
  console.log("Truth Engine:", truthAddress);
  console.log("Forge Address:", forgeAddress);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    oinioToken: tokenAddress,
    truthEngine: truthAddress,
    forgeAddress: forgeAddress,
    deployedAt: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
