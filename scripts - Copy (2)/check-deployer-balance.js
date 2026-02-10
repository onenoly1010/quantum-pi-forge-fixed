#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const envPaths = [
  path.resolve(process.cwd(), '.env.launch'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
];

let content = '';
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    content += fs.readFileSync(p, 'utf8') + '\n';
  }
}

function parseVar(name) {
  const re = new RegExp('^\s*' + name + '\s*=\s*(.*)$', 'mi');
  const m = content.match(re);
  if (m) return m[1].trim().replace(/^"|"$/g, '');
  return undefined;
}

const pkRaw = parseVar('DEPLOYER_PRIVATE_KEY') || parseVar('PRIVATE_KEY') || parseVar('DEPLOYER_PK') || parseVar('DEPLOYER_PRIVATE_KEY_HEX');
const addrFromEnv = parseVar('DEPLOYER_ADDRESS') || parseVar('DEPLOYER_ADDR') || parseVar('DEPLOYER');
const rpc = parseVar('ZERO_G_RPC_URL') || parseVar('BACKUP_RPC_URL') || 'https://rpc.0g.ai';

if (!pkRaw) {
  console.error('ERROR: No deployer private key found in local env files (.env.launch/.env/.env.local)');
  process.exit(1);
}

const pk = pkRaw.startsWith('0x') ? pkRaw : '0x' + pkRaw;

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pk, provider);
    const address = await wallet.getAddress();
    const balance = await provider.getBalance(address);
    console.log('Deployer address:', address);
    if (addrFromEnv && addrFromEnv.toLowerCase() !== address.toLowerCase()) {
      console.log('Warning: DEPLOYER_ADDRESS in env does not match derived address from private key.');
    }
    console.log('RPC used:', rpc);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    // ethers v6 returns a bigint from getBalance(); compare as BigInt
    if (balance === 0n) {
      console.log('\nStatus: Balance is ZERO. Fund this address with 0G tokens before attempting deploy.');
      process.exit(2);
    }
    console.log('\nStatus: Deployer has sufficient balance. Ready to deploy if >= threshold.');
  } catch (err) {
    console.error('Error checking balance:', err.message || err);
    process.exit(1);
  }
})();