import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Configuring CentralAwarenessV2 ecosystem...");

  // Get contract address from file
  const fs = require("fs");
  const path = require("path");

  const contractAddressPath = path.join(
    __dirname,
    "..",
    "..",
    ".contract_address",
  );
  const ipfsHashPath = path.join(__dirname, "..", "..", ".ipfs_hash");
  const radicleRepoPath = path.join(__dirname, "..", "..", ".radicle_repo_id");

  if (!fs.existsSync(contractAddressPath)) {
    throw new Error("Contract address not found. Run deployment first.");
  }

  const contractAddress = fs.readFileSync(contractAddressPath, "utf8").trim();
  const ipfsHash = fs.existsSync(ipfsHashPath)
    ? fs.readFileSync(ipfsHashPath, "utf8").trim()
    : "";
  const radicleRepoId = fs.existsSync(radicleRepoPath)
    ? fs.readFileSync(radicleRepoPath, "utf8").trim()
    : "";

  console.log("📋 Configuration:");
  console.log("Contract:", contractAddress);
  console.log("IPFS Hash:", ipfsHash);
  console.log("Radicle Repo:", radicleRepoId);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Configuring from:", deployer.address);

  // Attach to deployed contract
  const CentralAwarenessV2 =
    await ethers.getContractFactory("CentralAwarenessV2");
  const centralAwareness = CentralAwarenessV2.attach(contractAddress);

  // Update ecosystem configuration
  console.log("⚙️ Updating ecosystem configuration...");

  const tx = await centralAwareness.updateEcosystem(
    `ipfs://${ipfsHash}`, // Landing page URI
    radicleRepoId, // Radicle repository ID
    ethers.ZeroAddress, // Staking contract (to be set later)
    ethers.ZeroAddress, // Forwarder contract (to be set later)
  );

  console.log("⏳ Waiting for transaction confirmation...");
  await tx.wait();

  console.log("✅ Ecosystem configuration updated!");
  console.log("🔗 Transaction hash:", tx.hash);

  // Verify configuration
  const config = await centralAwareness.getEcosystemConfig();
  console.log("🔍 Verification:");
  console.log("Landing Page URI:", config[0]);
  console.log("Radicle Repo ID:", config[1]);
  console.log("Last Update:", new Date(Number(config[4]) * 1000).toISOString());

  const isReady = await centralAwareness.isSovereignReady();
  console.log("🔮 Sovereign Ready:", isReady);

  if (isReady) {
    console.log("🎉 The Quantum Pi Forge is now truly sovereign!");
    console.log("🏛️ Landing page will read instructions from the blockchain");
    console.log("📚 Code is mirrored on Radicle Network");
    console.log(
      "⚡ The 1010 Hz resonance flows through decentralized channels",
    );
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Configuration failed:", error);
  process.exitCode = 1;
});
