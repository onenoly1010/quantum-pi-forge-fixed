// scripts/smoke-test.ts
import { ethers } from "hardhat";

async function main() {
  const oinioAddress =
    process.env.OINIO_TOKEN_ADDRESS || "YOUR_DEPLOYED_OINIO_ADDRESS"; // Replace after deploy
  const OINIO = await ethers.getContractAt("OINIO", oinioAddress);

  console.log("🔍 Running Smoke Test on OINIO...");

  const name = await OINIO.name();
  const supply = await OINIO.totalSupply();
  const owner = await OINIO.owner();

  console.log(`📍 Name: ${name}`);
  console.log(`💰 Total Supply: ${ethers.formatEther(supply)} OINIO`);
  console.log(`👑 Owner: ${owner}`);

  if (supply > 0n) {
    console.log("✅ OINIO is alive and minting.");
  } else {
    console.log("❌ OINIO supply is zero - check deployment");
  }
}

main().catch(console.error);
