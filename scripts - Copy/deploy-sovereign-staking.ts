import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Quantum Pi Forge to 0G Aristotle...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy Oinio Token
  console.log("📝 Deploying Oinio Token...");
  const Oinio = await ethers.getContractFactory("Oinio");
  const oinio = await Oinio.deploy(deployer.address);
  await oinio.waitForDeployment();
  const oinioAddress = await oinio.getAddress();
  console.log("OINIO deployed to:", oinioAddress);

  // Mint initial supply to deployer
  const initialSupply = ethers.parseEther("1000000"); // 1M OINIO
  await oinio.mint(deployer.address, initialSupply);
  console.log(
    "Minted",
    ethers.formatEther(initialSupply),
    "OINIO to",
    deployer.address,
  );

  // Deploy QuantumPiSovereignStaking
  console.log("🏛️ Deploying QuantumPiSovereignStaking...");
  const QuantumPiSovereignStaking = await ethers.getContractFactory(
    "QuantumPiSovereignStaking",
  );
  // Note: For EIP-2771, you need a trusted forwarder. Using a placeholder for now.
  const trustedForwarder = "0x0000000000000000000000000000000000000000"; // Replace with actual forwarder
  const staking = await QuantumPiSovereignStaking.deploy(
    oinioAddress,
    trustedForwarder,
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking contract deployed to:", stakingAddress);

  console.log("✅ Deployment complete!");
  console.log("OINIO Token:", oinioAddress);
  console.log("Staking Contract:", stakingAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
