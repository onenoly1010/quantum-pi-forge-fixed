#!/usr/bin/env node

// Check OINIO Token Holders Script
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.launch' });

async function checkOINIOHolders() {
  const rpcUrl = process.env.ZERO_G_RPC_URL || 'https://rpc.0g.ai';
  const oinioAddress = '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37';

  console.log('🔍 Checking OINIO Token Holders...');
  console.log(`📍 Network: ${rpcUrl}`);
  console.log(`📄 Contract: ${oinioAddress}`);
  console.log('');

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Check if contract exists
    const code = await provider.getCode(oinioAddress);
    if (code === '0x') {
      console.log('❌ Contract not deployed at this address');
      return;
    }

    console.log('✅ Contract found on network');

    // Get contract instance
    const abi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function owner() view returns (address)"
    ];

    const contract = new ethers.Contract(oinioAddress, abi, provider);

    // Get basic info
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();

    console.log(`📍 Name: ${name}`);
    console.log(`🏷️  Symbol: ${symbol}`);
    console.log(`💰 Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
    console.log(`👑 Owner: ${owner}`);
    console.log('');

    // Check owner's balance
    const ownerBalance = await contract.balanceOf(owner);
    console.log(`👑 Owner Balance: ${ethers.formatEther(ownerBalance)} ${symbol}`);

    // Check deployer balance (if different from owner)
    const deployerAddress = process.env.DEPLOYER_ADDRESS;
    if (deployerAddress && deployerAddress.toLowerCase() !== owner.toLowerCase()) {
      const deployerBalance = await contract.balanceOf(deployerAddress);
      console.log(`🚀 Deployer Balance: ${ethers.formatEther(deployerBalance)} ${symbol}`);
    }

    // Check if total supply matches owner's balance
    if (totalSupply === ownerBalance) {
      console.log('✅ All tokens are held by the owner address');
    } else {
      console.log('⚠️  Token distribution: Not all tokens held by owner');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOINIOHolders();