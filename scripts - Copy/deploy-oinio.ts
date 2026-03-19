import { ethers } from "hardhat";

async function deployWithRetry(
  factory: any,
  name: string,
  args: any[] = [],
  maxRetries = 3,
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🚀 Attempt ${i + 1}: Deploying ${name}...`);
      const contract = await factory.deploy(...args);
      return await contract.waitForDeployment();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const waitTime = Math.pow(2, i) * 1000;
      console.warn(`⚠️ Deployment failed. Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

async function main() {
  console.log("🚀 Deploying OINIO Token...");

  // Provider Health Check
  const provider = ethers.provider;
  try {
    const network = await provider.getNetwork();
    console.log(
      `📡 Connected to ${network.name} (ChainID: ${network.chainId})`,
    );
  } catch (error) {
    throw new Error(
      "❌ Failed to connect to RPC provider. Check your network configuration.",
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH",
  );

  // Deploy with retry
  const OinioFactory = await ethers.getContractFactory("Oinio");
  const oinio = await deployWithRetry(OinioFactory, "OINIO Token");
  const oinioAddress = await oinio.getAddress();

  console.log("✅ OINIO deployed to:", oinioAddress);
  console.log(
    "Total supply:",
    ethers.formatEther(await oinio.totalSupply()),
    "OINIO",
  );
  console.log(
    "Deployer balance:",
    ethers.formatEther(await oinio.balanceOf(deployer.address)),
    "OINIO",
  );

  // Wait for block confirmations before verification
  console.log("⏳ Waiting for block confirmations...");
  const deploymentTx = oinio.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(5); // Wait 5 blocks
  }
  console.log("✅ Confirmations received. Starting verification...");

  // Verify contract
  try {
    await hre.run("verify:verify", {
      address: oinioAddress,
      contract: "contracts/Oinio.sol:Oinio",
    });
    console.log("✅ Contract verified");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
    // Continue - verification can be done manually later
  }

  console.log("\n📋 Deployment Summary:");
  console.log("OINIO Contract:", oinioAddress);
  console.log("Total Supply: 1,000,000,000 OINIO");
  console.log("Network:", (await provider.getNetwork()).name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
