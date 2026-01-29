#!/usr/bin/env node

const { ethers } = require('ethers');

const CONFIG = {
  RPC_URL: 'https://16661.rpc.thirdweb.com',
  OINIO_TOKEN: '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37',
  DEX_FACTORY: '0x307bFaA937768a073D41a2EbFBD952Be8E38BF91',
  WETH_ADDRESS: '0x0000000000000000000000000000000000000000' // 0G native
};

const FACTORY_ABI = [
  'function getPair(address,address) view returns (address)'
];

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112,uint112,uint32)',
  'function totalSupply() view returns (uint256)'
];

async function getPairInfo() {
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const factory = new ethers.Contract(CONFIG.DEX_FACTORY, FACTORY_ABI, provider);

  console.log('🔍 Checking OINIO/0G pair on 0G Aristotle...');

  try {
    const pairAddress = await factory.getPair(CONFIG.OINIO_TOKEN, CONFIG.WETH_ADDRESS);
    console.log(`🏊 Pair Address: ${pairAddress}`);

    if (pairAddress !== '0x0000000000000000000000000000000000000000') {
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);

      const token0 = await pair.token0();
      const token1 = await pair.token1();
      const [reserve0, reserve1] = await pair.getReserves();
      const totalSupply = await pair.totalSupply();

      console.log(`📊 Token0: ${token0} (${token0 === CONFIG.OINIO_TOKEN ? 'OINIO' : '0G'})`);
      console.log(`📊 Token1: ${token1} (${token1 === CONFIG.OINIO_TOKEN ? 'OINIO' : '0G'})`);
      console.log(`💰 Reserves: ${ethers.formatEther(reserve0)} / ${ethers.formatEther(reserve1)}`);
      console.log(`🏷️  Total LP Supply: ${ethers.formatEther(totalSupply)}`);

      return pairAddress;
    } else {
      console.log('❌ No pair found yet - liquidity not added');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking pair:', error.message);
    return null;
  }
}

getPairInfo();