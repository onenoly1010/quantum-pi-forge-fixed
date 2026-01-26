import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying OINIO Token to Polygon Mainnet...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");

  // Deploy OINIO token
  console.log("🔄 Deploying OINIO...");
  const OINIO = await ethers.getContractFactory("OINIO");
  const oinio = await OINIO.deploy();
  await oinio.waitForDeployment();
  const oinioAddress = await oinio.getAddress();

  console.log("✅ OINIO deployed to:", oinioAddress);
  console.log("Total supply:", ethers.formatEther(await oinio.totalSupply()), "OINIO");
  console.log("Deployer balance:", ethers.formatEther(await oinio.balanceOf(deployer.address)), "OINIO");

  // Verify on PolygonScan
  console.log("🔍 Verifying contract on PolygonScan...");
  try {
    await hre.run("verify:verify", {
      address: oinioAddress,
      contract: "contracts/OINIO.sol:OINIO"
    });
    console.log("✅ Contract verified");
  } catch (error) {
    console.log("❌ Verification failed:", error);
  }

  console.log("\n📋 Deployment Summary:");
  console.log("OINIO Contract:", oinioAddress);
  console.log("Total Supply: 1,000,000,000 OINIO");
  console.log("Decimals: 18");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });