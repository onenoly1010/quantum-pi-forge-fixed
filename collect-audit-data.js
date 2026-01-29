#!/usr/bin/env node

/**
 * Sovereign Audit Data Collector
 * January 29, 2026 - Quantum Pi Forge
 *
 * Collects all necessary data for the SOVEREIGN_AUDIT.md file
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
  WETH_ADDRESS: '0x0000000000000000000000000000000000000000'
};

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function owner() view returns (address)'
];

const FACTORY_ABI = [
  'function owner() view returns (address)',
  'function getPair(address,address) view returns (address)',
  'function allPairsLength() view returns (uint256)'
];

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112,uint112,uint32)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)'
];

async function collectAuditData() {
  console.log('🏛️  QUANTUM PI FORGE - SOVEREIGN AUDIT DATA COLLECTION');
  console.log('='.repeat(60));

  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const auditData = {};

  try {
    // Get OINIO token data
    console.log('📄 Checking OINIO Token...');
    const tokenContract = new ethers.Contract(CONFIG.OINIO_TOKEN, ERC20_ABI, provider);

    auditData.tokenName = await tokenContract.name();
    auditData.tokenSymbol = await tokenContract.symbol();
    auditData.tokenDecimals = await tokenContract.decimals();
    auditData.totalSupply = await tokenContract.totalSupply();
    auditData.tokenOwner = await tokenContract.owner();

    console.log(`✅ Token: ${auditData.tokenName} (${auditData.tokenSymbol})`);
    console.log(`✅ Supply: ${ethers.formatEther(auditData.totalSupply)}`);
    console.log(`✅ Owner: ${auditData.tokenOwner}`);

  } catch (error) {
    console.log(`❌ Token check failed: ${error.message}`);
  }

  try {
    // Get factory data
    console.log('🏭 Checking DEX Factory...');
    const factoryContract = new ethers.Contract(CONFIG.DEX_FACTORY, FACTORY_ABI, provider);

    auditData.factoryOwner = await factoryContract.owner();
    auditData.pairAddress = await factoryContract.getPair(CONFIG.OINIO_TOKEN, CONFIG.WETH_ADDRESS);
    auditData.totalPairs = await factoryContract.allPairsLength();

    console.log(`✅ Factory Owner: ${auditData.factoryOwner}`);
    console.log(`✅ OINIO/0G Pair: ${auditData.pairAddress}`);
    console.log(`✅ Total Pairs: ${auditData.totalPairs}`);

  } catch (error) {
    console.log(`❌ Factory check failed: ${error.message}`);
  }

  if (auditData.pairAddress && auditData.pairAddress !== '0x0000000000000000000000000000000000000000') {
    try {
      // Get pair data
      console.log('🏊 Checking Liquidity Pool...');
      const pairContract = new ethers.Contract(auditData.pairAddress, PAIR_ABI, provider);

      const [reserve0, reserve1] = await pairContract.getReserves();
      auditData.totalLPSupply = await pairContract.totalSupply();
      auditData.deadLPBalance = await pairContract.balanceOf(CONFIG.DEAD_ADDRESS);

      auditData.reserve0 = reserve0;
      auditData.reserve1 = reserve1;

      console.log(`✅ LP Supply: ${ethers.formatEther(auditData.totalLPSupply)}`);
      console.log(`✅ Dead Address LP: ${ethers.formatEther(auditData.deadLPBalance)}`);
      console.log(`✅ Reserves: ${ethers.formatEther(reserve0)} / ${ethers.formatEther(reserve1)}`);

    } catch (error) {
      console.log(`❌ Pair check failed: ${error.message}`);
    }
  }

  // Generate audit template with real data
  console.log('\n📋 SOVEREIGN AUDIT TEMPLATE DATA:');
  console.log('='.repeat(40));

  console.log(`OINIO_TOKEN_ADDRESS=${CONFIG.OINIO_TOKEN}`);
  console.log(`DEX_ROUTER_ADDRESS=${CONFIG.DEX_ROUTER}`);
  console.log(`DEX_FACTORY_ADDRESS=${CONFIG.DEX_FACTORY}`);
  console.log(`PAIR_ADDRESS=${auditData.pairAddress || '[INSERT_PAIR_ADDRESS]'}`);
  console.log(`TOKEN_OWNER=${auditData.tokenOwner || '[INSERT_TOKEN_OWNER]'}`);
  console.log(`FACTORY_OWNER=${auditData.factoryOwner || '[INSERT_FACTORY_OWNER]'}`);
  console.log(`TOTAL_SUPPLY=${auditData.totalSupply ? ethers.formatEther(auditData.totalSupply) : '[INSERT_TOTAL_SUPPLY]'}`);
  console.log(`LP_TOTAL_SUPPLY=${auditData.totalLPSupply ? ethers.formatEther(auditData.totalLPSupply) : '[INSERT_LP_TOTAL_SUPPLY]'}`);
  console.log(`DEAD_LP_BALANCE=${auditData.deadLPBalance ? ethers.formatEther(auditData.deadLPBalance) : '[INSERT_DEAD_LP_BALANCE]'}`);

  console.log('\n🔗 VERIFICATION LINKS:');
  console.log(`Token Owner Check: ${CONFIG.EXPLORER_URL}/address/${CONFIG.OINIO_TOKEN}#readContract`);
  console.log(`Factory Owner Check: ${CONFIG.EXPLORER_URL}/address/${CONFIG.DEX_FACTORY}#readContract`);
  if (auditData.pairAddress) {
    console.log(`LP Burn Check: ${CONFIG.EXPLORER_URL}/address/${auditData.pairAddress}#readContract`);
  }

  console.log('\n📝 PLACEHOLDERS TO REPLACE IN SOVEREIGN_AUDIT.md:');
  console.log('[INSERT_LIQUIDITY_TX_HASH] - Add liquidity transaction');
  console.log('[INSERT_RENOUNCE_TX_HASH] - Token renounce transaction');
  console.log('[INSERT_FACTORY_RENOUNCE_TX_HASH] - Factory renounce transaction');
  console.log('[INSERT_BURN_TX_HASH] - LP token burn transaction');
  console.log('[INSERT_BLOCK_NUMBER] - Block numbers for each transaction');
  console.log('[INSERT_DOCUMENT_HASH] - Hash of this audit document');

  console.log('\n✅ Audit data collection complete!');
}

collectAuditData().catch(console.error);