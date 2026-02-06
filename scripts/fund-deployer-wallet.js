#!/usr/bin/env node

/**
 * 🚀 OINIO Deployer Wallet Funding Script
 *
 * Programmatically funds the deployer wallet using available APIs
 * Supports multiple funding sources: faucets, exchanges, programmatic transfers
 *
 * Usage: node scripts/fund-deployer-wallet.js
 */

import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment
dotenv.config({ path: '.env.launch' });

const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const ZERO_G_RPC_URL = process.env.ZERO_G_RPC_URL || 'https://evmrpc.0g.ai';
const REQUIRED_AMOUNT = ethers.parseEther('5'); // 5 GAS

if (!DEPLOYER_ADDRESS) {
  console.error('❌ DEPLOYER_ADDRESS not found in .env.launch');
  process.exit(1);
}

console.log('🚀 OINIO Deployer Wallet Funding Script');
console.log('═'.repeat(50));
console.log(`Target Address: ${DEPLOYER_ADDRESS}`);
console.log(`Required Amount: ${ethers.formatEther(REQUIRED_AMOUNT)} GAS`);
console.log(`RPC URL: ${ZERO_G_RPC_URL}`);
console.log('');

/**
 * Check current balance
 */
async function checkBalance() {
  console.log('📊 Checking current balance...');

  try {
    const provider = new ethers.JsonRpcProvider(ZERO_G_RPC_URL);
    const balance = await provider.getBalance(DEPLOYER_ADDRESS);
    const balanceEth = ethers.formatEther(balance);

    console.log(`💰 Current Balance: ${balanceEth} GAS`);

    if (balance >= REQUIRED_AMOUNT) {
      console.log('✅ Sufficient balance for deployment!');
      return true;
    } else {
      const shortfall = REQUIRED_AMOUNT - balance;
      console.log(`❌ Insufficient balance. Need additional: ${ethers.formatEther(shortfall)} GAS`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    return false;
  }
}

/**
 * Attempt to fund via 0G Faucet API
 */
async function fundViaFaucet() {
  console.log('\n🏦 Attempting 0G Faucet funding...');

  try {
    // Try multiple faucet endpoints
    const faucets = [
      'https://faucet.0g.ai/api/faucet',
      'https://faucet.0g.ai/claim',
      'https://rpc.0g.ai/faucet'
    ];

    for (const faucetUrl of faucets) {
      try {
        console.log(`Trying faucet: ${faucetUrl}`);

        const response = await fetch(faucetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: DEPLOYER_ADDRESS,
            amount: '5000000000000000000' // 5 GAS in wei
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Faucet request successful:', result);
          return true;
        } else {
          console.log(`❌ Faucet ${faucetUrl} failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Faucet ${faucetUrl} error:`, error.message);
      }
    }

    console.log('❌ All faucet attempts failed');
    return false;
  } catch (error) {
    console.error('❌ Faucet funding failed:', error.message);
    return false;
  }
}

/**
 * Attempt to fund via programmatic transfer (if API key available)
 */
async function fundViaProgrammaticTransfer() {
  console.log('\n🔄 Attempting programmatic transfer via Gnosis Safe...');

  // Check for Gnosis Safe API configuration
  const safeApiUrl = process.env.SAFE_API_URL || 'https://safe-transaction-mainnet.safe.global/api/v1';
  const safeAddress = process.env.SAFE_ADDRESS;
  const safeApiKey = process.env.SAFE_API_KEY;

  if (!safeAddress || !safeApiKey) {
    console.log('❌ Safe API not configured (SAFE_ADDRESS and SAFE_API_KEY required)');
    console.log('💡 Configure in .env.launch: SAFE_ADDRESS=your_safe_address, SAFE_API_KEY=your_api_key');
    return false;
  }

  try {
    // Check Safe balance first
    const balanceResponse = await fetch(`${safeApiUrl}/safes/${safeAddress}/balances/`, {
      headers: {
        'Authorization': `Bearer ${safeApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!balanceResponse.ok) {
      console.log(`❌ Failed to check Safe balance: ${balanceResponse.status}`);
      return false;
    }

    const balances = await balanceResponse.json();
    const gasBalance = balances.find(b => b.tokenAddress === null || b.tokenAddress === '0x0000000000000000000000000000000000000000');

    if (!gasBalance || parseFloat(gasBalance.balance) / 1e18 < 5.0) {
      console.log('❌ Insufficient GAS balance in Safe wallet');
      return false;
    }

    console.log(`💰 Safe has ${parseFloat(gasBalance.balance) / 1e18} GAS available`);

    // Create transaction proposal
    const transactionData = {
      to: DEPLOYER_ADDRESS,
      value: ethers.parseEther('5.0').toString(),
      data: '0x',
      gasLimit: '21000'
    };

    const proposalResponse = await fetch(`${safeApiUrl}/safes/${safeAddress}/transactions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${safeApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: transactionData.to,
        value: transactionData.value,
        data: transactionData.data,
        gasLimit: transactionData.gasLimit,
        safeTxGas: '0',
        baseGas: '0',
        gasPrice: '0',
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 0 // Will be set by Safe
      })
    });

    if (!proposalResponse.ok) {
      console.log(`❌ Failed to create transaction proposal: ${proposalResponse.status}`);
      return false;
    }

    const proposal = await proposalResponse.json();
    console.log(`✅ Transaction proposal created: ${proposal.safeTxHash}`);

    // Note: In a real implementation, you'd need to collect signatures from multisig owners
    // For now, we'll assume the transaction is ready for execution
    console.log('📝 Transaction ready for multisig approval and execution');
    console.log(`🔗 Safe Transaction: ${proposal.safeTxHash}`);

    return false; // Return false since we can't auto-execute multisig transactions

  } catch (error) {
    console.log(`❌ Safe API error: ${error.message}`);
    return false;
  }

  // Fallback to other APIs if Safe fails
  const apiKeys = {
    guild: process.env.GUILD_API_KEY,
    pi: process.env.PI_NETWORK_API_KEY,
    exchange: process.env.EXCHANGE_API_KEY,
  };

  // Try 0G Guild API transfer
  if (apiKeys.guild) {
    console.log('Using 0G Guild API for transfer...');

    try {
      const response = await fetch('https://guild.0g.ai/api/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.guild}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: DEPLOYER_ADDRESS,
          amount: '5000000000000000000', // 5 GAS
          network: 'aristotle'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Guild API transfer successful:', result);
        return true;
      } else {
        console.log('❌ Guild API transfer failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Guild API error:', error.message);
    }
  }

  // Try Pi Network API (if applicable)
  if (apiKeys.pi) {
    console.log('Checking Pi Network API for GAS access...');

    try {
      const response = await fetch('https://api.minepi.com/v2/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKeys.pi}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5,
          memo: 'OINIO DEX Deployment Funding',
          to_address: DEPLOYER_ADDRESS
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pi Network transfer initiated:', result);
        return true;
      } else {
        console.log('❌ Pi Network transfer failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Pi Network API error:', error.message);
    }
  }

  console.log('❌ No programmatic transfer methods available');
  return false;
}

/**
 * Attempt to fund via exchange withdrawal (if API available)
 */
async function fundViaExchangeWithdrawal() {
  console.log('\n🏪 Attempting exchange withdrawal...');

  // This would require exchange API keys and specific exchange integration
  // For now, provide instructions

  console.log('💡 To fund via exchange:');
  console.log('1. Go to a CEX that supports 0G (Binance, OKX, etc.)');
  console.log('2. Buy GAS tokens');
  console.log('3. Withdraw to:', DEPLOYER_ADDRESS);
  console.log('4. Network: 0G Aristotle (Chain ID: 16661)');

  return false; // Manual process
}

/**
 * Main funding function
 */
async function fundWallet() {
  // First check current balance
  const hasBalance = await checkBalance();
  if (hasBalance) {
    console.log('\n🎉 Wallet already funded! Ready for deployment.');
    return true;
  }

  console.log('\n🔄 Attempting automatic funding methods...');

  // Try different funding methods
  const fundingMethods = [
    fundViaFaucet,
    fundViaProgrammaticTransfer,
    fundViaExchangeWithdrawal
  ];

  for (const method of fundingMethods) {
    try {
      const success = await method();
      if (success) {
        console.log('\n⏳ Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

        const finalCheck = await checkBalance();
        if (finalCheck) {
          console.log('\n🎉 Funding successful! Ready for deployment.');
          return true;
        }
      }
    } catch (error) {
      console.log(`❌ Funding method failed:`, error.message);
    }
  }

  console.log('\n❌ All automatic funding methods failed.');
  console.log('\n📝 MANUAL FUNDING REQUIRED:');
  console.log(`Send at least ${ethers.formatEther(REQUIRED_AMOUNT)} GAS to:`);
  console.log(DEPLOYER_ADDRESS);
  console.log('\nNetwork: 0G Aristotle Mainnet (Chain ID: 16661)');
  console.log('RPC: https://evmrpc.0g.ai');

  return false;
}

// Execute
fundWallet()
  .then((success) => {
    if (success) {
      console.log('\n✅ DEPLOYMENT READY: Run deployment scripts now!');
      process.exit(0);
    } else {
      console.log('\n❌ FUNDING REQUIRED: Complete manual funding and run this script again.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  });