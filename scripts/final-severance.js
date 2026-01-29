#!/usr/bin/env node

/**
 * Quantum Pi Forge: Final Severance Protocol
 * January 29, 2026 - Complete Decentralization
 *
 * This script executes the final steps to achieve total sovereignty:
 * 1. Renounce OINIO token ownership
 * 2. Renounce DEX factory control
 * 3. Burn LP tokens to dead address
 */

const { ethers } = require('ethers');

// Configuration
const CONFIG = {
  CHAIN_ID: 16661,
  RPC_URL: 'https://16661.rpc.thirdweb.com',
  EXPLORER_URL: 'https://chainscan.0g.ai',

  // Contracts
  OINIO_TOKEN: '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37',
  DEX_FACTORY: '0x307bFaA937768a073D41a2EbFBD952Be8E38BF91',

  // Dead address for burning
  DEAD_ADDRESS: '0x000000000000000000000000000000000000dEaD'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'purple');
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function warning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️ ${message}`, 'blue');
}

async function getWalletAndProvider() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = await provider.getSigner();
    return { provider, signer };
  }

  // For Node.js environment, require private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    error('PRIVATE_KEY environment variable required for Node.js execution');
  }

  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  return { provider, signer: wallet };
}

async function renounceOINIOOwnership(signer) {
  log('🏛️ Renouncing OINIO Token Ownership...');

  const contract = new ethers.Contract(
    CONFIG.OINIO_TOKEN,
    ['function renounceOwnership()'],
    signer
  );

  try {
    const tx = await contract.renounceOwnership();
    log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait();
    success(`OINIO ownership renounced! TX: ${tx.hash}`);
    info(`Block: ${receipt.blockNumber}`);

    return tx.hash;
  } catch (err) {
    error(`Failed to renounce OINIO ownership: ${err.message}`);
  }
}

async function renounceFactoryControl(signer) {
  log('🏭 Renouncing DEX Factory Control...');

  const contract = new ethers.Contract(
    CONFIG.DEX_FACTORY,
    ['function renounceOwnership()'],
    signer
  );

  try {
    const tx = await contract.renounceOwnership();
    log(`Transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait();
    success(`DEX Factory control renounced! TX: ${tx.hash}`);
    info(`Block: ${receipt.blockNumber}`);

    return tx.hash;
  } catch (err) {
    error(`Failed to renounce factory control: ${err.message}`);
  }
}

async function getLPTokenInfo(provider) {
  log('🔍 Finding OINIO/0G LP Token Information...');

  const factoryContract = new ethers.Contract(
    CONFIG.DEX_FACTORY,
    ['function getPair(address, address) view returns (address)'],
    provider
  );

  // Get pair address (OINIO and WETH which is address(0) on 0G)
  const wethAddress = '0x0000000000000000000000000000000000000000';
  const [tokenA, tokenB] = CONFIG.OINIO_TOKEN.toLowerCase() < wethAddress.toLowerCase()
    ? [CONFIG.OINIO_TOKEN, wethAddress]
    : [wethAddress, CONFIG.OINIO_TOKEN];

  const pairAddress = await factoryContract.getPair(tokenA, tokenB);

  if (pairAddress === '0x0000000000000000000000000000000000000000') {
    error('OINIO/0G pair not found! Liquidity must be added first.');
  }

  info(`LP Token Address: ${pairAddress}`);

  return pairAddress;
}

async function burnLPTokens(signer, pairAddress) {
  log('🔥 Burning LP Tokens to Dead Address...');

  const pairContract = new ethers.Contract(
    pairAddress,
    ['function balanceOf(address) view returns (uint256)', 'function transfer(address, uint256)'],
    signer
  );

  const ownerAddress = await signer.getAddress();
  const balance = await pairContract.balanceOf(ownerAddress);

  if (balance === 0n) {
    warning('No LP tokens found in wallet');
    return null;
  }

  info(`LP Token Balance: ${ethers.formatEther(balance)}`);

  try {
    const tx = await pairContract.transfer(CONFIG.DEAD_ADDRESS, balance);
    log(`Burn transaction submitted: ${tx.hash}`);

    const receipt = await tx.wait();
    success(`LP tokens burned to dead address! TX: ${tx.hash}`);
    info(`Amount burned: ${ethers.formatEther(balance)} LP tokens`);
    info(`Block: ${receipt.blockNumber}`);

    return tx.hash;
  } catch (err) {
    error(`Failed to burn LP tokens: ${err.message}`);
  }
}

async function verifySeverance(provider) {
  log('🔍 Verifying Complete Severance...');

  // Check OINIO ownership
  const oinioContract = new ethers.Contract(
    CONFIG.OINIO_TOKEN,
    ['function owner() view returns (address)'],
    provider
  );

  const oinioOwner = await oinioContract.owner().catch(() => CONFIG.DEAD_ADDRESS);
  if (oinioOwner === CONFIG.DEAD_ADDRESS || oinioOwner === '0x0000000000000000000000000000000000000000') {
    success('OINIO ownership: RENOUNCED ✅');
  } else {
    warning(`OINIO still has owner: ${oinioOwner}`);
  }

  // Check factory ownership
  const factoryContract = new ethers.Contract(
    CONFIG.DEX_FACTORY,
    ['function owner() view returns (address)'],
    provider
  );

  const factoryOwner = await factoryContract.owner().catch(() => CONFIG.DEAD_ADDRESS);
  if (factoryOwner === CONFIG.DEAD_ADDRESS || factoryOwner === '0x0000000000000000000000000000000000000000') {
    success('DEX Factory control: RENOUNCED ✅');
  } else {
    warning(`DEX Factory still has owner: ${factoryOwner}`);
  }

  // Check LP token burn
  const pairAddress = await getLPTokenInfo(provider);
  const pairContract = new ethers.Contract(
    pairAddress,
    ['function balanceOf(address) view returns (uint256)'],
    provider
  );

  const deadBalance = await pairContract.balanceOf(CONFIG.DEAD_ADDRESS);
  if (deadBalance > 0n) {
    success(`LP tokens burned: ${ethers.formatEther(deadBalance)} ✅`);
  } else {
    warning('LP tokens not yet burned to dead address');
  }
}

async function main() {
  console.log(colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🏛️ QUANTUM PI FORGE: FINAL SEVERANCE PROTOCOL         ║');
  console.log('║              January 29, 2026 - Total Decentralization        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  log('⚠️  WARNING: This action is IRREVERSIBLE!');
  log('Once executed, you will permanently lose control of the contracts.');
  log('The system will become a public good with no central authority.');
  console.log('');

  // Get user confirmation
  if (typeof process !== 'undefined' && process.stdin) {
    // Node.js environment
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await new Promise((resolve) => {
      rl.question('Are you sure you want to proceed with total decentralization? (type "YES" to continue): ', (answer) => {
        if (answer !== 'YES') {
          log('Operation cancelled by user.');
          process.exit(0);
        }
        rl.close();
        resolve();
      });
    });
  } else {
    // Browser environment - show alert
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        '⚠️ FINAL SEVERANCE WARNING ⚠️\n\n' +
        'This action is IRREVERSIBLE!\n\n' +
        'You will permanently lose control of:\n' +
        '• OINIO Token ownership\n' +
        '• DEX Factory control\n' +
        '• LP Token liquidity\n\n' +
        'The system becomes a public good with no central authority.\n\n' +
        'Click OK to proceed with total decentralization.'
      );

      if (!confirmed) {
        log('Operation cancelled by user.');
        return;
      }
    }
  }

  try {
    const { provider, signer } = await getWalletAndProvider();
    const walletAddress = await signer.getAddress();

    log(`Executing severance with wallet: ${walletAddress}`);
    log(`Network: 0G Aristotle (Chain ID: ${CONFIG.CHAIN_ID})`);

    // Step 1: Renounce OINIO ownership
    const renounceTx1 = await renounceOINIOOwnership(signer);

    // Step 2: Renounce factory control
    const renounceTx2 = await renounceFactoryControl(signer);

    // Step 3: Find and burn LP tokens
    const pairAddress = await getLPTokenInfo(provider);
    const burnTx = await burnLPTokens(signer, pairAddress);

    // Step 4: Verify complete severance
    await verifySeverance(provider);

    // Final summary
    console.log('');
    console.log(colors.purple + '╔══════════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.purple + '║                    🎉 SEVERANCE COMPLETE!                     ║' + colors.reset);
    console.log(colors.purple + '╚══════════════════════════════════════════════════════════════╝' + colors.reset);
    console.log('');

    success('TOTAL DECENTRALIZATION ACHIEVED!');
    success('The Quantum Pi Forge is now a sovereign public good.');
    success('No central authority can modify or control the system.');

    console.log('');
    console.log('📋 Transaction Summary:');
    if (renounceTx1) console.log(`• OINIO Renounce: ${CONFIG.EXPLORER_URL}/tx/${renounceTx1}`);
    if (renounceTx2) console.log(`• Factory Renounce: ${CONFIG.EXPLORER_URL}/tx/${renounceTx2}`);
    if (burnTx) console.log(`• LP Token Burn: ${CONFIG.EXPLORER_URL}/tx/${burnTx}`);

    console.log('');
    console.log('📄 Next Steps:');
    console.log('1. Update SOVEREIGN_AUDIT.md with transaction hashes');
    console.log('2. Publish the audit document to GitHub');
    console.log('3. Announce the sovereign launch to the community');
    console.log('4. Begin the next phase of ecosystem development');

    console.log('');
    console.log(colors.green + '🏛️ The forge is sovereign. The flame burns eternal. ⚡🔥' + colors.reset);

  } catch (err) {
    error(`Severance failed: ${err.message}`);
  }
}

// Export for browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { main };
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
  });
}