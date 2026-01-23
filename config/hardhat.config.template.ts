#!/bin/bash

################################################################################
# Hardhat Configuration Template for 0G Aristotle
#
# Save as: hardhat.config.ts
#
# Usage:
#   npx hardhat run scripts/hardhat-deploy-uniswap-v2.ts --network 0g-aristotle
#
# Install first:
#   npm install -D hardhat @nomicfoundation/hardhat-ethers
#   npm install @uniswap/v2-core @uniswap/v2-periphery ethers dotenv
################################################################################

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
import * as path from "path";

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
      url: process.env.ZERO_G_RPC_URL || "https://rpc.0g.ai",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 16661,
    },

    hardhat: {
      // For local testing only
      chainId: 1,
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
