// scripts/ping-central-awareness.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const awareness = await ethers.getContractAt(
    "CentralAwareness",
    "0x84bbc67b11881fdaffb4f0ca10a3a07300a151a6",
  );

  console.log("🔍 Checking CentralAwareness contract accessibility...");

  try {
    // Try to read contract data (no gas cost)
    const name = await awareness.name();
    console.log("✅ Contract accessible. Name:", name);

    const symbol = await awareness.symbol();
    console.log("✅ Symbol:", symbol);

    // Try a write transaction to force indexing
    console.log("📝 Attempting to trigger indexing with a test transaction...");
    const tx = await awareness.forgeAgent(
      deployer.address,
      "ipfs://QmTestIndexTrigger", // Test pointer to trigger indexing
    );
    console.log("🚀 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    await tx.wait();
    console.log("✅ Transaction confirmed - indexing should be triggered!");
    console.log("🔄 Check explorer in 2-5 minutes for Contract tab");
  } catch (error: any) {
    console.log("⚠️ Contract interaction failed:", error.message);
    if (error.message.includes("contract not deployed")) {
      console.log("❌ Contract not yet indexed by explorer");
    } else {
      console.log("🔍 Error details:", error);
    }
  }
}

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
