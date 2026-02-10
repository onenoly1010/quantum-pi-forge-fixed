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
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/check-txs-0g.js <txHash> [txHash2 ...]');
  process.exit(1);
}

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const chainId = await provider.getNetwork().then(n=>n.chainId).catch(()=>null);
    console.log('RPC:', RPC, 'ChainId:', chainId);

    const currentBlock = await provider.getBlockNumber();
    console.log('Current block:', currentBlock);

    for (const txHash of args) {
      console.log('\n---');
      console.log('Checking:', txHash);
      try {
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!tx && !receipt) {
          console.log('Result: NOT FOUND on RPC (no tx or receipt).');
          continue;
        }
        if (tx) {
          console.log('From:', tx.from);
          console.log('To:  ', tx.to);
          console.log('Value:', tx.value ? ethers.formatEther(tx.value) : '0');
          console.log('Nonce:', tx.nonce);
        }
        if (!receipt) {
          console.log('Receipt: PENDING (not yet mined)');
          continue;
        }
        console.log('BlockNumber:', receipt.blockNumber);
        console.log('Status:', receipt.status === 1 ? 'SUCCESS' : receipt.status === 0 ? 'FAILED' : receipt.status);
        console.log('GasUsed:', receipt.gasUsed ? receipt.gasUsed.toString() : 'N/A');
        console.log('CumulativeGasUsed:', receipt.cumulativeGasUsed ? receipt.cumulativeGasUsed.toString() : 'N/A');
        console.log('Logs:', receipt.logs.length);
        const confirmations = currentBlock && receipt.blockNumber ? currentBlock - receipt.blockNumber + 1 : 'N/A';
        console.log('Confirmations (approx):', confirmations);
      } catch (err) {
        console.error('Error querying tx:', err.message || err);
      }
    }
  } catch (err) {
    console.error('RPC Error:', err.message || err);
  }
})();
