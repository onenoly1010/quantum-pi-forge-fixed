#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
const envPath = path.join(__dirname, "../.env.launch");
dotenv.config({ path: envPath });

const LOG_DIR = "logs";
const LOG_FILE = path.join(LOG_DIR, "uniswap-v2-deployment.log");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  const icon = { INFO: "ℹ️", SUCCESS: "✅", ERROR: "❌", WARN: "⚠️" }[level];
  const msg = `[${timestamp}] ${icon} ${message}`;
  console.log(msg);
  fs.appendFileSync(LOG_FILE, `${msg}\n`);
}

async function deploy() {
  try {
    log("🚀 OINIO Sovereign Uniswap V2 Direct Deployment", "INFO");
    log("═".repeat(70), "INFO");

    // Validate environment
    const rpcUrl = process.env.ZERO_G_RPC_URL || "https://rpc.0g.ai";
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wgasAddress = process.env.WGAS_ADDRESS;
    const oinioAddress = process.env.OINIO_TOKEN_ADDRESS;

    if (!privateKey || privateKey === "your_deployer_private_key_here") {
      log("ERROR: DEPLOYER_PRIVATE_KEY not set in .env.launch", "ERROR");
      process.exit(1);
    }

    if (!wgasAddress || wgasAddress === "your_wgas_address_here") {
      log("ERROR: WGAS_ADDRESS not set in .env.launch", "ERROR");
      process.exit(1);
    }

    // Connect to RPC
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    
    log(`RPC: ${rpcUrl}`, "INFO");
    log(`Deployer: ${signer.address}`, "INFO");

    // Check balance
    const balance = await provider.getBalance(signer.address);
    const balanceEth = ethers.formatEther(balance);
    log(`Balance: ${balanceEth} 0G`, "INFO");

    if (balance < ethers.parseEther("0.5")) {
      log("ERROR: Insufficient balance for deployment (need 0.5 0G)", "ERROR");
      process.exit(1);
    }

    log("Pre-checks passed ✓", "SUCCESS");
    log("", "INFO");
    log("Configuration validated successfully!", "SUCCESS");
    log("Ready for contract deployment with Hardhat.", "INFO");
    
    process.exit(0);
  } catch (error) {
    log(`ERROR: ${error.message}`, "ERROR");
    process.exit(1);
  }
}

deploy();
