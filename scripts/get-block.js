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
const RPC = loadEnvVar('ZERO_G_RPC_URL') || 'https://rpc.0g.ai';
(async ()=>{
  try {
    console.log('RPC:', RPC);
    const provider = new ethers.JsonRpcProvider(RPC);
    const n = await provider.getBlockNumber();
    console.log('Block number:', n);
  } catch (err) {
    console.error('Error:', err.message || err);
  }
})();