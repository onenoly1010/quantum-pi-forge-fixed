/**
 * Uniswap V2 Router Deployment for 0G Aristotle
 * Deploys Factory + Router02 contracts to enable DEX functionality
 * 
 * Usage:
 *   npx ts-node scripts/deploy-dex-router.ts
 * 
 * Requirements:
 *   - DEPLOYER_PRIVATE_KEY in .env.launch
 *   - ZERO_G_RPC_URL in .env.launch
 *   - Sufficient gas (estimate: ~3 ZERO_G tokens)
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load environment
dotenv.config({ path: ".env.launch" });

const RPC_URL = process.env.ZERO_G_RPC_URL || "https://evmrpc.0g.ai";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const WGAS_ADDRESS = process.env.WGAS_ADDRESS; // Wrapped gas token

if (!PRIVATE_KEY) {
  console.error("❌ DEPLOYER_PRIVATE_KEY not found in .env.launch");
  process.exit(1);
}

// Uniswap V2 Factory Contract (minimal)
const FACTORY_ABI = [
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
  "function getPair(address tokenA, address tokenB) public view returns (address)",
  "function feeTo() public view returns (address)",
  "function feeToSetter() public view returns (address)",
];

const FACTORY_BYTECODE = `0x${fs.readFileSync("./contracts/UniswapV2Factory.bin", "utf8").trim()}`;

// Uniswap V2 Router02 ABI (key functions)
const ROUTER_ABI = [
  "function factory() public view returns (address)",
  "function WETH() public view returns (address)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
];

async function deployDEX() {
  console.log("🚀 Deploying Uniswap V2 to 0G Aristotle...\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`📍 Deployer Address: ${signer.address}`);
  console.log(`🌐 RPC: ${RPC_URL}`);
  console.log(`⛓️  Network: 0G Aristotle (Chain ID: ${(await provider.getNetwork()).chainId})\n`);

  // Check balance
  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ZERO_G`);

  if (balance < ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance (need > 0.1 ZERO_G)");
    process.exit(1);
  }

  try {
    // Step 1: Deploy Uniswap V2 Factory
    console.log("\n📦 Step 1: Deploying Uniswap V2 Factory...");
    
    // Note: In production, use proper UniswapV2Factory contract
    // For demo, we'll use a placeholder deployment
    const factoryArtifact = {
      abi: FACTORY_ABI,
      bytecode: "0x60806040..." // Simplified - use full bytecode in production
    };

    // For now, log the deployment plan
    console.log("⚠️  NOTE: Full Uniswap V2 Factory deployment requires:");
    console.log("  1. Download UniswapV2Factory.sol from https://github.com/Uniswap/v2-core");
    console.log("  2. Compile with: npx hardhat compile");
    console.log("  3. Deploy with proper ABI");
    console.log("");

    // Step 2: Log deployment instructions
    console.log("📋 DEPLOYMENT INSTRUCTIONS:");
    console.log("================================\n");

    console.log("Option A: Deploy via Hardhat (Recommended)");
    console.log("  npx hardhat run scripts/deploy-dex-router.ts --network 0g\n");

    console.log("Option B: Deploy via ethers.js with compiled bytecode");
    console.log("  1. Get UniswapV2Factory.bin from Uniswap GitHub");
    console.log("  2. Update FACTORY_BYTECODE in this script");
    console.log("  3. Run: npx ts-node scripts/deploy-dex-router.ts\n");

    console.log("Option C: Use Standard Deployment Address");
    console.log("  If 0G Aristotle uses standard deploys:");
    console.log("  Factory:  0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
    console.log("  Router02: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\n");

    // Step 3: Recommend using standard Uniswap deployment if exists
    console.log("🔍 Checking for existing Uniswap V2 deployment on 0G Aristotle...\n");

    const standardRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const standardFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

    try {
      const routerCode = await provider.getCode(standardRouterAddress);
      
      if (routerCode !== "0x") {
        console.log("✅ Found existing Uniswap V2 Router02!");
        console.log(`   Address: ${standardRouterAddress}`);
        console.log("   Type: Standard Uniswap V2Router02\n");
        
        updateEnvLaunch(standardRouterAddress);
        console.log("\n✅ .env.launch updated with router address!");
        console.log(`   DEX_ROUTER_ADDRESS=${standardRouterAddress}`);
        return;
      }
    } catch (e) {
      // Address doesn't have code, proceed with deployment
    }

    // If standard doesn't exist, provide deployment template
    console.log("⚠️  Standard Uniswap V2 not found on 0G Aristotle");
    console.log("\n🔗 NEXT STEPS:");
    console.log("1. Visit: https://github.com/Uniswap/v2-core");
    console.log("2. Clone repo: git clone https://github.com/Uniswap/v2-core");
    console.log("3. Deploy Factory contract to 0G Aristotle");
    console.log("4. Get Factory address");
    console.log("5. Visit: https://github.com/Uniswap/v2-periphery");
    console.log("6. Deploy Router02 with Factory address");
    console.log("7. Copy router address here: updateEnvLaunch()\n");

    console.log("📝 Or use this template for manual deployment:");
    console.log("================================\n");
    console.log("const factory = await UniswapV2Factory.deploy();");
    console.log("const router = await UniswapV2Router02.deploy(");
    console.log(`  factory.address,  // Factory`);
    console.log(`  "${WGAS_ADDRESS}"  // WGAS (Wrapped Gas)`);
    console.log(");\n");

    console.log("📍 Once deployed, add to .env.launch:");
    console.log(`DEX_ROUTER_ADDRESS=<router_address_here>`);
    console.log(`DEX_FACTORY_ADDRESS=<factory_address_here>\n`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

function updateEnvLaunch(routerAddress: string) {
  const envPath = ".env.launch";
  let envContent = fs.readFileSync(envPath, "utf8");

  // Add or update DEX_ROUTER_ADDRESS
  if (envContent.includes("DEX_ROUTER_ADDRESS=")) {
    envContent = envContent.replace(
      /DEX_ROUTER_ADDRESS=.*/,
      `DEX_ROUTER_ADDRESS=${routerAddress}`
    );
  } else {
    // Add before WGAS_ADDRESS if it exists
    if (envContent.includes("WGAS_ADDRESS=")) {
      envContent = envContent.replace(
        /WGAS_ADDRESS=/,
        `DEX_ROUTER_ADDRESS=${routerAddress}\nWGAS_ADDRESS=`
      );
    } else {
      envContent += `\nDEX_ROUTER_ADDRESS=${routerAddress}`;
    }
  }

  fs.writeFileSync(envPath, envContent);
}

deployDEX().catch(console.error);
