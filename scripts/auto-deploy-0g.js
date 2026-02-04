#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.launch') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { ethers } = require('ethers');

const RPC = process.env.OG_RPC_URL || 'https://rpc.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PK;
const THRESHOLD = process.env.DEPLOY_MIN_BALANCE || '0.01'; // ETH equivalent

function error(msg) { console.error('\n✖ ' + msg + '\n'); process.exit(1); }

if (!PRIVATE_KEY) {
  error('No PRIVATE_KEY or DEPLOYER_PRIVATE_KEY found. Please add your deploy key to .env.launch or set env var PRIVATE_KEY');
}

if (!/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
  console.warn('⚠️  PRIVATE_KEY does not look like a hex private key with 0x prefix. Proceeding, but double-check it.');
}

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const addr = await wallet.getAddress();

    console.log(`Address: ${addr}`);
    const bal = await provider.getBalance(addr);
    console.log(`Balance on 0G RPC (${RPC}): ${ethers.formatEther(bal)} ETH`);

    if (bal.lt(ethers.parseEther(THRESHOLD))) {
      error(`Balance below threshold (${THRESHOLD} ETH). Fund the address and retry.`);
    }

    // Check for forge
    try {
      const v = execSync('forge --version', { stdio: 'pipe' }).toString().trim();
      console.log('Foundry detected:', v);
    } catch (e) {
      error('Foundry (forge) not detected. Install Foundry (https://github.com/foundry-rs/foundry#installation) or run manually.');
    }

    // Run forge deploy
    const args = [
      'script', 'script/DeployOINIO_0G.s.sol',
      '--rpc-url', RPC,
      '--broadcast',
      '--verify',
      '--verifier', '0g_aristotle'
    ];

    console.log('Spawning: forge', args.join(' '));

    const child = spawn('forge', args, { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Deployment script finished successfully.');
      } else {
        console.error(`\n✖ forge exited with code ${code}`);
      }
    });

  } catch (err) {
    error(err.message || String(err));
  }
})();
