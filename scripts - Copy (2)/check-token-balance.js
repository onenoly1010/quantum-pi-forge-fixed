#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

function loadEnvVar(name) {
  const files = ['.env.launch', '.env', '.env.local'];
  for (const f of files) {
    const p = path.resolve(process.cwd(), f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const re = new RegExp('^\s*' + name + '\s*=\s*(.*)$', 'mi');
      const m = content.match(re);
      if (m) return m[1].trim().replace(/^"|"$/g, '');
    }
  }
  return undefined;
}

const RPC = loadEnvVar('ZERO_G_RPC_URL') || loadEnvVar('BACKUP_RPC_URL') || 'https://rpc.0g.ai';
const TOKEN = process.argv[2] || loadEnvVar('OINIO_TOKEN_ADDRESS');
const TARGET = process.argv[3] || loadEnvVar('DEPLOYER_ADDRESS') || loadEnvVar('DEPLOYER') || undefined;

if (!TOKEN) {
  console.error('ERROR: No token address provided. Usage: node scripts/check-token-balance.js <tokenAddress> [ownerAddress]');
  process.exit(1);
}

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    console.log('RPC:', RPC);
    console.log('Token:', TOKEN);

    const abi = [
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function name() view returns (string)',
      'function symbol() view returns (string)'
    ];

    const token = new ethers.Contract(TOKEN, abi, provider);

    let symbol = 'TOKEN';
    let name = '';
    let decimals = 18;
    try { name = await token.name(); } catch(e) {}
    try { symbol = await token.symbol(); } catch(e) {}
    try { decimals = await token.decimals(); } catch(e) {}

    if (TARGET) {
      const bal = await token.balanceOf(TARGET);
      console.log(`Address: ${TARGET}`);
      console.log(`Balance: ${ethers.formatUnits(bal, decimals)} ${symbol} (raw: ${bal.toString()})`);
    } else {
      console.log('No target address provided; listing top holders is not supported by RPC. Provide an address to check.');
    }

    try {
      const total = await token.totalSupply();
      console.log(`TotalSupply: ${ethers.formatUnits(total, decimals)} ${symbol}`);
    } catch(e) {}

  } catch (err) {
    console.error('Error:', err.message || err);
  }
})();