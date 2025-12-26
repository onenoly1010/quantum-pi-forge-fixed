import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ShadowAnchor...");

  const ShadowAnchor = await ethers.getContractFactory("ShadowAnchor");
  const shadowAnchor = await ShadowAnchor.deploy();

  await shadowAnchor.waitForDeployment();

  const address = await shadowAnchor.getAddress();
  console.log(`ShadowAnchor deployed to: ${address}`);
  
  console.log("Update this address in:");
  console.log("1. components/WallOfWhispers.tsx");
  console.log("2. scribe_daemon.py");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
