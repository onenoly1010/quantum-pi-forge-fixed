import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
const envPath = path.join(__dirname, ".env.launch");
dotenv.config({ path: envPath });

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.16", // Uniswap V2 Factory
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.6.6", // Uniswap V2 Router02
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
  },

  networks: {
    "0g-aristotle": {
      type: "http",
      url: process.env.ZERO_G_RPC_URL || "https://rpc.0g.ai",
      accounts: process.env.DEPLOYER_PRIVATE_KEY && process.env.DEPLOYER_PRIVATE_KEY !== "your_deployer_private_key_here" 
        ? [process.env.DEPLOYER_PRIVATE_KEY] 
        : [],
      chainId: 16661,
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
