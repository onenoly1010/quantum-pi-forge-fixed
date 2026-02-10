import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Quantum Pi Forge to Polygon Mainnet...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "MATIC",
  );

  // Deploy forwarder first
  console.log("🔄 Deploying QuantumForwarder...");
  const QuantumForwarder = await ethers.getContractFactory("QuantumForwarder");
  const forwarder = await QuantumForwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("Forwarder deployed to:", forwarderAddress);

  // Configuration
  const OINIO_ADDRESS = "0x07f43E5B1A8a0928B364E40d5885f81A543B05C7"; // Existing OINIO token
  const TRUSTED_FORWARDER = forwarderAddress;
  const REWARD_RATE_PER_SECOND = ethers.parseEther("0.01"); // 0.01 OINIO per second per staked token
  const MAX_TOTAL_REWARDS = ethers.parseEther("1000000"); // 1M OINIO max rewards

  // Deploy staking contract
  console.log("🔄 Deploying QuantumPiStaking...");
  const QuantumPiStaking = await ethers.getContractFactory("QuantumPiStaking");
  const staking = await QuantumPiStaking.deploy(
    OINIO_ADDRESS,
    TRUSTED_FORWARDER,
    REWARD_RATE_PER_SECOND,
    MAX_TOTAL_REWARDS,
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking contract deployed to:", stakingAddress);

  // Verify contracts on PolygonScan
  console.log("🔍 Verifying contracts on PolygonScan...");
  try {
    await hre.run("verify:verify", {
      address: forwarderAddress,
      contract: "contracts/QuantumForwarder.sol:QuantumForwarder",
    });
    console.log("✅ Forwarder verified");

    await hre.run("verify:verify", {
      address: stakingAddress,
      constructorArguments: [
        OINIO_ADDRESS,
        TRUSTED_FORWARDER,
        REWARD_RATE_PER_SECOND,
        MAX_TOTAL_REWARDS,
      ],
      contract: "contracts/QuantumPiStaking.sol:QuantumPiStaking",
    });
    console.log("✅ Staking contract verified");
  } catch (error) {
    console.log("❌ Verification failed:", error);
  }

  // Output deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("Forwarder:", forwarderAddress);
  console.log("Staking:", stakingAddress);
  console.log("OINIO Token:", OINIO_ADDRESS);
  console.log(
    "Reward Rate:",
    ethers.formatEther(REWARD_RATE_PER_SECOND),
    "OINIO/sec",
  );
  console.log("Max Rewards:", ethers.formatEther(MAX_TOTAL_REWARDS), "OINIO");

  // Save to file
  const fs = require("fs");
  const deploymentInfo = {
    network: "polygon-mainnet",
    forwarder: forwarderAddress,
    staking: stakingAddress,
    oinio: OINIO_ADDRESS,
    rewardRate: REWARD_RATE_PER_SECOND.toString(),
    maxRewards: MAX_TOTAL_REWARDS.toString(),
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    "deployment-mainnet.json",
    JSON.stringify(deploymentInfo, null, 2),
  );
  console.log("💾 Deployment info saved to deployment-mainnet.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
