const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.launch' });

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL || 'https://evmrpc.0g.ai');
  const address = process.env.DEPLOYER_ADDRESS || '0x353663cd664bB3e034Dc0f308D8896C0a242e4cd';

  try {
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    console.log('🔍 Sovereign Address:', address);
    console.log('💰 0G Balance:', balanceInEth, '0G');
    console.log('📊 Raw Balance:', balance.toString(), 'wei');

    // Check if balance is sufficient for deployment (estimate ~0.01 0G for safety)
    const minBalance = ethers.parseEther('0.01');
    if (balance >= minBalance) {
      console.log('✅ Sufficient balance for deployment');
    } else {
      console.log('❌ Insufficient balance - need at least 0.01 0G');
    }
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
  }
}

checkBalance();