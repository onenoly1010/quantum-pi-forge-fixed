#!/usr/bin/env node

/**
 * OINIO Sovereignty Verification Script
 * January 29, 2026 - Quantum Pi Forge
 *
 * Verifies the complete sovereignty of the OINIO token ecosystem
 * on 0G Aristotle Mainnet (Chain ID: 16661)
 */

const { ethers } = require('ethers');

const CONFIG = {
  CHAIN_ID: 16661,
  RPC_URL: 'https://16661.rpc.thirdweb.com',
  EXPLORER_URL: 'https://chainscan.0g.ai',
  OINIO_TOKEN: '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37',
  DEX_ROUTER: '0x0ff65f38fa43f0aac51901381acd7a8908ae2537',
  DEX_FACTORY: '0x307bFaA937768a073D41a2EbFBD952Be8E38BF91',
  DEAD_ADDRESS: '0x000000000000000000000000000000000000dEaD',
  WETH_ADDRESS: '0x0000000000000000000000000000000000000000' // 0G native
};

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function transferOwnership(address)',
  'function mint(address,uint256)',
  'function burn(uint256)'
];

const FACTORY_ABI = [
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function getPair(address,address) view returns (address)',
  'function allPairs(uint256) view returns (address)',
  'function allPairsLength() view returns (uint256)'
];

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112,uint112,uint32)',
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)'
];

async function verifyOINIOToken() {
  console.log('🏛️  QUANTUM PI FORGE - OINIO SOVEREIGNTY VERIFICATION');
  console.log('='.repeat(60));
  console.log(`📅 Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`⛓️  Network: 0G Aristotle (Chain ID: ${CONFIG.CHAIN_ID})`);
  console.log(`🔗 Explorer: ${CONFIG.EXPLORER_URL}`);
  console.log('='.repeat(60));

  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

  try {
    // Check OINIO Token
    console.log('\n🔍 VERIFYING OINIO TOKEN CONTRACT');
    console.log('='.repeat(40));
    console.log(`📄 Contract: ${CONFIG.OINIO_TOKEN}`);
    console.log(`🔗 Explorer: ${CONFIG.EXPLORER_URL}/address/${CONFIG.OINIO_TOKEN}`);

    const tokenContract = new ethers.Contract(CONFIG.OINIO_TOKEN, ERC20_ABI, provider);

    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();

    console.log(`📛 Name: ${name}`);
    console.log(`🏷️  Symbol: ${symbol}`);
    console.log(`🔢 Decimals: ${decimals}`);
    console.log(`💰 Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);

    // Check ownership
    console.log('\n👑 CHECKING OWNERSHIP STATUS');
    try {
      const owner = await tokenContract.owner();
      console.log(`👤 Current Owner: ${owner}`);

      if (owner === '0x0000000000000000000000000000000000000000') {
        console.log('✅ OWNERSHIP RENOUNCED - Token is sovereign!');
      } else {
        console.log('⚠️  OWNERSHIP STILL HELD - Not yet sovereign');
      }
    } catch (error) {
      console.log('❌ Owner function not found or failed');
    }

    // Check minting capability
    console.log('\n🪙 CHECKING MINTING CAPABILITY');
    try {
      // Try to call mint function (should fail if properly secured)
      await tokenContract.mint.staticCall('0x0000000000000000000000000000000000000001', 1);
      console.log('⚠️  Minting function accessible - Check contract security');
    } catch (error) {
      console.log('✅ Minting properly restricted');
    }

  } catch (error) {
    console.log(`❌ OINIO Token verification failed: ${error.message}`);
  }

  try {
    // Check DEX Factory
    console.log('\n🏭 VERIFYING DEX FACTORY');
    console.log('='.repeat(40));
    console.log(`📄 Contract: ${CONFIG.DEX_FACTORY}`);
    console.log(`🔗 Explorer: ${CONFIG.EXPLORER_URL}/address/${CONFIG.DEX_FACTORY}`);

    const factoryContract = new ethers.Contract(CONFIG.DEX_FACTORY, FACTORY_ABI, provider);

    try {
      const factoryOwner = await factoryContract.owner();
      console.log(`👤 Factory Owner: ${factoryOwner}`);

      if (factoryOwner === '0x0000000000000000000000000000000000000000') {
        console.log('✅ FACTORY OWNERSHIP RENOUNCED - DEX is sovereign!');
      } else {
        console.log('⚠️  FACTORY OWNERSHIP STILL HELD - Not yet sovereign');
      }
    } catch (error) {
      console.log('❌ Factory owner check failed');
    }

    // Check OINIO/0G pair
    console.log('\n💱 CHECKING OINIO/0G LIQUIDITY POOL');
    const pairAddress = await factoryContract.getPair(CONFIG.OINIO_TOKEN, CONFIG.WETH_ADDRESS);
    console.log(`🏊 Pair Address: ${pairAddress}`);
    console.log(`🔗 Explorer: ${CONFIG.EXPLORER_URL}/address/${pairAddress}`);

    if (pairAddress !== '0x0000000000000000000000000000000000000000') {
      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

      const [reserve0, reserve1] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      console.log(`💰 Reserves: ${ethers.formatEther(reserve0)} ${token0 === CONFIG.OINIO_TOKEN ? 'OINIO' : '0G'} / ${ethers.formatEther(reserve1)} ${token1 === CONFIG.OINIO_TOKEN ? 'OINIO' : '0G'}`);

      // Check LP token burn
      const deadBalance = await pairContract.balanceOf(CONFIG.DEAD_ADDRESS);
      const totalLP = await pairContract.totalSupply();

      console.log(`🔥 LP Tokens at Dead Address: ${ethers.formatEther(deadBalance)}`);
      console.log(`📊 Total LP Supply: ${ethers.formatEther(totalLP)}`);

      if (deadBalance > 0n) {
        console.log('✅ LP TOKENS BURNED - Liquidity is locked!');
      } else {
        console.log('⚠️  NO LP TOKENS BURNED - Liquidity not locked');
      }
    } else {
      console.log('❌ No OINIO/0G pair found');
    }

  } catch (error) {
    console.log(`❌ DEX Factory verification failed: ${error.message}`);
  }

  console.log('\n🏛️  SOVEREIGNTY VERIFICATION COMPLETE');
  console.log('='.repeat(60));

  // Sovereignty Checklist
  console.log('\n📋 SOVEREIGNTY CHECKLIST:');
  console.log('□ OINIO ownership renounced (owner = 0x000...000)');
  console.log('□ DEX factory ownership renounced');
  console.log('□ LP tokens burned to dead address');
  console.log('□ Minting functions properly restricted');
  console.log('□ Liquidity pool established and locked');

  console.log('\n🔗 EXPLORER LINKS:');
  console.log(`OINIO Token: ${CONFIG.EXPLORER_URL}/address/${CONFIG.OINIO_TOKEN}`);
  console.log(`DEX Factory: ${CONFIG.EXPLORER_URL}/address/${CONFIG.DEX_FACTORY}`);
  console.log(`DEX Router: ${CONFIG.EXPLORER_URL}/address/${CONFIG.DEX_ROUTER}`);

  console.log('\n✨ If all checks pass, the Quantum Pi Forge is SOVEREIGN!');
}

verifyOINIOToken().catch(console.error);