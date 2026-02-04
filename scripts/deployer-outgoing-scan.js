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

const RPC = process.env.ZERO_G_RPC_URL || loadEnvVar('ZERO_G_RPC_URL') || 'https://evmrpc.0g.ai';
const TOKEN = process.argv[2] || loadEnvVar('OINIO_TOKEN_ADDRESS');
const DEPLOYER = process.argv[3] || loadEnvVar('DEPLOYER_ADDRESS');
const CHUNK = parseInt(process.env.SCAN_CHUNK || '5000', 10);

if (!TOKEN || !DEPLOYER) {
  console.error('Usage: node scripts/deployer-outgoing-scan.js <tokenAddress?> <deployerAddress?>');
  process.exit(1);
}

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    console.log('RPC:', RPC);
    console.log('Token:', TOKEN);
    console.log('Deployer:', DEPLOYER);

    const latest = await provider.getBlockNumber();
    console.log('Latest block:', latest);

    // Find contract creation block: linear step search + binary refinement to avoid nodes that can't access deep state
    const step = 500000; // blocks
    let foundAt = -1;
    for (let b = latest; b >= 0; b -= step) {
      try {
        const code = await provider.getCode(TOKEN, b);
        if (code && code !== '0x') {
          foundAt = b;
          break;
        }
      } catch (e) {
        // Node may not have state for that block; skip and continue stepping back
        // console.error('getCode error at block', b, e.message || e);
      }
    }
    if (foundAt === -1) {
      // try smaller recent window first
      const recentStart = Math.max(0, latest - 1000000);
      let found = false;
      for (let b = recentStart; b <= latest; b += 10000) {
        try {
          const code = await provider.getCode(TOKEN, b);
          if (code && code !== '0x') { foundAt = b; found = true; break; }
        } catch (e) {}
      }
      if (!found) {
        console.log('Could not find a block with contract code via step search; will start scanning from block 0 (may be heavy)');
        foundAt = 0;
      }
    }

    // Now binary refine between block range [startRefine, foundAt]
    let startRefine = Math.max(0, foundAt - step);
    let low = startRefine;
    let high = foundAt;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      try {
        const code = await provider.getCode(TOKEN, mid);
        if (code && code !== '0x') {
          high = mid;
        } else {
          low = mid + 1;
        }
      } catch (e) {
        // on error, move low up to avoid this block
        low = mid + 1;
      }
    }
    const creationBlock = low;
    console.log('Creation block (approx):', creationBlock);
    const iface = new ethers.Interface(['event Transfer(address indexed from, address indexed to, uint256 value)']);
    const topicTransfer = ethers.keccak256(ethers.toUtf8Bytes('Transfer(address,address,uint256)'));
    const deployerTopic = ethers.hexZeroPad(ethers.getAddress(DEPLOYER), 32);

    const recipients = new Map();
    let totalOutgoing = 0n;
    let totalLogCount = 0;

    // Scan from creationBlock to latest in chunks
    for (let start = creationBlock; start <= latest; start += CHUNK) {
      const end = Math.min(latest, start + CHUNK - 1);
      console.log(`Scanning blocks ${start}..${end} ...`);
      // We'll retry each chunk up to 3 times to handle transient RPC failures
      let attempts = 0;
      let logs = [];
      while (attempts < 3) {
        try {
          const filter = { address: TOKEN, fromBlock: start, toBlock: end, topics: [topicTransfer, deployerTopic] };
          logs = await provider.getLogs(filter);
          break;
        } catch (e) {
          attempts++;
          console.error(`Chunk fetch error (attempt ${attempts}) for ${start}-${end}:`, e.message || e);
          await new Promise(r => setTimeout(r, 1200 * attempts));
        }
      }
      console.log('Found logs in chunk:', logs.length);
      totalLogCount += logs.length;
      for (const log of logs) {
        try {
          const parsed = iface.parseLog(log);
          const from = parsed.args.from;
          const to = parsed.args.to;
          const value = BigInt(parsed.args.value.toString());

          const prev = recipients.get(to.toLowerCase()) || 0n;
          recipients.set(to.toLowerCase(), prev + value);
          totalOutgoing += value;
        } catch (e) {
          // ignore individual parse errors
        }
      }
    }

    console.log('Total outgoing log count:', totalLogCount);
    console.log('Total outgoing (raw):', totalOutgoing.toString());

    // determine decimals
    let decimals = 18;
    try { const token = new ethers.Contract(TOKEN, ['function decimals() view returns (uint8)'], provider); decimals = await token.decimals(); } catch(e) {}

    // Create an array of recipients sorted by amount
    const arr = Array.from(recipients.entries()).map(([addr, val]) => ({addr, val}));
    arr.sort((a,b) => (a.val > b.val ? -1 : (a.val < b.val ? 1 : 0)));

    const outDir = path.resolve(process.cwd(), 'artifacts');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});
    const csvPath = path.join(outDir, 'deployer_outgoing_recipients.csv');
    const header = 'rank,address,amount_decimal,amount_raw\n';
    let csv = header;
    for (let i=0;i<arr.length;i++) {
      const {addr, val} = arr[i];
      const human = ethers.formatUnits(val, decimals);
      csv += `${i+1},${addr},${human},${val.toString()}\n`;
    }
    fs.writeFileSync(csvPath, csv);

    console.log('Wrote CSV to', csvPath);
    console.log('Top recipients:');
    for (let i=0;i<Math.min(10, arr.length); i++) {
      const r = arr[i];
      console.log(`${i+1}. ${r.addr} -> ${ethers.formatUnits(r.val, decimals)}`);
    }

    // Update deployments.json with summary
    const deploymentsPath = path.resolve(process.cwd(), 'deployments.json');
    if (fs.existsSync(deploymentsPath)) {
      const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
      deployments.scan_summary = { created_at: (new Date()).toISOString(), totalOutgoing: totalOutgoing.toString(), recipientsCount: arr.length };
      fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
      console.log('Updated deployments.json with scan_summary');
    }

  } catch (err) {
    console.error('Fatal error scanning:', err.message || err);
    process.exit(1);
  }
})();