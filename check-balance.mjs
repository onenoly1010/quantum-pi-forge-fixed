#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config({ path: '.env.launch' });

async function main() {
  const rpcUrl = process.env.ZERO_G_RPC_URL || 'https://evmrpc.0g.ai';
  const address = process.env.DEPLOYER_ADDRESS;

  if (!address) {
    console.error('❌ DEPLOYER_ADDRESS not found in .env.launch');
    process.exit(1);
  }

  console.log('\n🔍 Checking wallet balance...');
  console.log(`📍 Network: 0G Aristotle (Chain ID 16661)`);
  console.log(`🌐 RPC: ${rpcUrl}`);
  console.log(`💳 Address: ${address}\n`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(`💰 Balance: ${balanceInEth} GAS\n`);
    
    if (parseFloat(balanceInEth) >= 2.0) {
      console.log('✅ READY: Sufficient balance for DEX deployment');
      console.log('💡 Next: Run `bash scripts/deploy-dex.sh`');
      process.exit(0);
    } else if (parseFloat(balanceInEth) > 0) {
      console.log('⚠️  WARNING: Low balance');
      console.log('📊 Current:', balanceInEth, 'GAS');
      console.log('📊 Required: 2-5 GAS');
      console.log('💡 Add more funds before deployment');
      process.exit(1);
    } else {
      console.log('❌ BLOCKED: Zero balance - wallet needs funding\n');
      console.log('📝 FUNDING REQUIRED:');
      console.log('   1. Visit 0G Aristotle faucet');
      console.log('   2. Request 2-5 GAS tokens for:');
      console.log(`      ${address}`);
      console.log('   3. Wait for confirmation (usually 1-5 minutes)');
      console.log('   4. Re-run: node check-balance.mjs\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('💡 Check RPC connectivity:', rpcUrl);
    process.exit(1);
  }
}

main();
