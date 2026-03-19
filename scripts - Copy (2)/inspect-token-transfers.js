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
const DEPLOYER = process.argv[3] || loadEnvVar('DEPLOYER_ADDRESS');
const MAX_BLOCK_RANGE = parseInt(process.env.MAX_BLOCK_RANGE || '500000', 10);

if (!TOKEN || !DEPLOYER) {
  console.error('Usage: node scripts/inspect-token-transfers.js [tokenAddress] [deployerAddress]');
  process.exit(1);
}

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latest - MAX_BLOCK_RANGE);
    console.log('RPC:', RPC);
    console.log('Token:', TOKEN);
    console.log('Deployer:', DEPLOYER);
    console.log('Scanning blocks from', fromBlock, 'to', latest, `(${MAX_BLOCK_RANGE} block window)`);

    // If no logs found in recent window, try to find contract creation block and scan around it
    const iface = new ethers.Interface(['event Transfer(address indexed from, address indexed to, uint256 value)']);
    // Compute Transfer event topic (keccak256 of signature)
    const topic = ethers.keccak256(ethers.toUtf8Bytes('Transfer(address,address,uint256)'));

    const filterRecent = {
      address: TOKEN,
      fromBlock,
      toBlock: latest,
      topics: [topic]
    };

    console.log('Fetching logs in recent window...');
    let logs = await provider.getLogs(filterRecent);

    console.log('Logs found in recent window:', logs.length);

    if (logs.length === 0) {
      console.log('No recent logs. Searching for contract creation block (binary search)...');
      // binary search for first block where code exists
      let low = 0;
      let high = latest;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const code = await provider.getCode(TOKEN, mid);
        if (code && code !== '0x') {
          high = mid;
        } else {
          low = mid + 1;
        }
      }
      const creationBlock = low;
      console.log('Creation block approx:', creationBlock);

      const start = Math.max(0, creationBlock - 50);
      const end = creationBlock + 5000; // scan 5k blocks after
      console.log(`Scanning transfers from ${start} to ${end} around creation...`);
      const filterCreation = { address: TOKEN, fromBlock: start, toBlock: end, topics: [topic] };
      logs = await provider.getLogs(filterCreation);
      console.log('Logs found near creation:', logs.length);
    }

    const recipients = new Map();
    let deployerOutCount = 0;
    let deployerOutTotal = 0n;

    for (const log of logs) {
      const parsed = iface.parseLog(log);
      const from = parsed.args.from;
      const to = parsed.args.to;
      const value = BigInt(parsed.args.value.toString());

      const prev = recipients.get(to.toLowerCase()) || 0n;
      recipients.set(to.toLowerCase(), prev + value);

      if (from.toLowerCase() === DEPLOYER.toLowerCase()) {
        deployerOutCount++;
        deployerOutTotal += value;
      }
    }

    // Convert map to array and sort top recipients
    const arr = Array.from(recipients.entries());
    arr.sort((a,b) => (b[1] > a[1] ? 1 : (b[1] < a[1] ? -1 : 0)));

    const tokenDecimals = await (async () => {
      try { const t = new ethers.Contract(TOKEN, ['function decimals() view returns (uint8)'], provider); return await t.decimals(); } catch (e) { return 18; }
    })();

    console.log('\nTop recipients (by received amount) within window:');
    const topN = Math.min(20, arr.length);
    for (let i=0;i<topN;i++) {
      const [addr, val] = arr[i];
      console.log(`${i+1}. ${addr} -> ${ethers.formatUnits(val, tokenDecimals)} tokens`);
    }

    console.log('\nDeployer outgoing transfers count:', deployerOutCount);
    console.log('Deployer outgoing total:', ethers.formatUnits(deployerOutTotal, tokenDecimals));

    // sum of transfers to top recipients equal ~ difference, check approximation
    let sumTop = 0n;
    for (let i=0;i<topN;i++) sumTop += arr[i][1];
    console.log('Sum top recipients:', ethers.formatUnits(sumTop, tokenDecimals));

    console.log('\nIf you want a full CSV of recipients, run with env MAX_BLOCK_RANGE or adjust the window.');

  } catch (err) {
    console.error('Error scanning transfers:', err.message || err);
  }
})();