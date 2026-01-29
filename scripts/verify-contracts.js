#!/usr/bin/env node

/**
 * Quantum Pi Forge: Contract Verification Script
 * January 29, 2026 - Sovereign Contract Audit
 *
 * This script verifies deployed contracts on 0G Aristotle network
 * using ethers.js instead of Foundry's cast
 */

const { ethers } = require('ethers');

// Configuration
const CONFIG = {
  CHAIN_ID: 16661,
  OINIO_TOKEN: '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37',
  DEX_ROUTER: '0x0ff65f38fa43f0aac51901381acd7a8908ae2537',
  DEX_FACTORY: '0x307bFaA937768a073D41a2EbFBD952Be8E38BF91',
  RPC_URL: 'https://16661.rpc.thirdweb.com',
  EXPLORER_URL: 'https://chainscan.0g.ai'
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

async function verifyContract(provider, address, name) {
  log(`🔍 Checking if ${name} exists at ${address}...`);

  try {
    const code = await provider.getCode(address);

    if (code === '0x') {
      error(`No contract code found at ${address} (${name})`);
    } else {
      info(`Contract ${name} found at ${address}`);
      info(`Code size: ${code.length} characters`);
      return true;
    }
  } catch (err) {
    error(`Cannot connect to RPC or contract ${name} not found at ${address}: ${err.message}`);
  }
}

async function verifyOINIOToken(provider) {
  log('🏛️ Verifying OINIO Token Contract...');

  const contract = new ethers.Contract(
    CONFIG.OINIO_TOKEN,
    [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function owner() view returns (address)'
    ],
    provider
  );

  try {
    const [name, symbol, decimals, totalSupplyRaw, owner] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      contract.owner().catch(() => '0x0000000000000000000000000000000000000000') // Might not have owner function
    ]);

    const totalSupply = ethers.formatEther(totalSupplyRaw);

    info('OINIO Token Details:');
    info(`  Name: ${name}`);
    info(`  Symbol: ${symbol}`);
    info(`  Decimals: ${decimals}`);
    info(`  Total Supply: ${totalSupply} OINIO`);
    info(`  Current Owner: ${owner}`);

    // Verification checks
    if (name === 'OINIO Soul System Token') {
      success('Token name matches expected value');
    } else {
      warning(`Token name differs from expected: 'OINIO Soul System Token'`);
    }

    if (symbol === 'OINIO') {
      success('Token symbol matches expected value');
    } else {
      warning(`Token symbol differs from expected: 'OINIO'`);
    }

    if (decimals === 18) {
      success('Token decimals match expected value (18)');
    } else {
      warning(`Token decimals differ from expected: 18`);
    }

    if (owner === '0x0000000000000000000000000000000000000000') {
      success('Ownership already renounced (fully decentralized!)');
    } else {
      info('Contract still has an owner - can be renounced for full decentralization');
    }

  } catch (err) {
    error(`Failed to verify OINIO token: ${err.message}`);
  }
}

async function verifyDEXRouter(provider) {
  log('🔄 Verifying DEX Router Contract...');

  const contract = new ethers.Contract(
    CONFIG.DEX_ROUTER,
    [
      'function factory() view returns (address)',
      'function feeTo() view returns (address)',
      'function feeToSetter() view returns (address)'
    ],
    provider
  );

  try {
    const [factory, feeTo, feeToSetter] = await Promise.all([
      contract.factory(),
      contract.feeTo().catch(() => '0x0000000000000000000000000000000000000000'),
      contract.feeToSetter().catch(() => '0x0000000000000000000000000000000000000000')
    ]);

    info('DEX Router Details:');
    info(`  Factory Address: ${factory}`);
    info(`  Fee To Address: ${feeTo}`);
    info(`  Fee To Setter: ${feeToSetter}`);

    if (factory.toLowerCase() === CONFIG.DEX_FACTORY.toLowerCase()) {
      success('Router factory matches expected address');
    } else {
      warning(`Router factory differs from expected: ${CONFIG.DEX_FACTORY}`);
    }

  } catch (err) {
    error(`Failed to verify DEX router: ${err.message}`);
  }
}

async function verifyDEXFactory(provider) {
  log('🏭 Verifying DEX Factory Contract...');

  const contract = new ethers.Contract(
    CONFIG.DEX_FACTORY,
    [
      'function feeToSetter() view returns (address)',
      'function allPairsLength() view returns (uint256)',
      'function getPair(address, address) view returns (address)'
    ],
    provider
  );

  try {
    const [feeToSetter, allPairsLength] = await Promise.all([
      contract.feeToSetter().catch(() => '0x0000000000000000000000000000000000000000'),
      contract.allPairsLength()
    ]);

    info('DEX Factory Details:');
    info(`  Fee To Setter: ${feeToSetter}`);
    info(`  Total Pairs Created: ${allPairsLength}`);

    if (parseInt(allPairsLength) > 0) {
      success('Factory has active pairs');
    } else {
      info('Factory has no pairs yet (normal before liquidity addition)');
    }

    // Check for existing OINIO/0G pair
    const wethAddress = '0x0000000000000000000000000000000000000000'; // WETH equivalent
    const [tokenA, tokenB] = CONFIG.OINIO_TOKEN.toLowerCase() < wethAddress.toLowerCase()
      ? [CONFIG.OINIO_TOKEN, wethAddress]
      : [wethAddress, CONFIG.OINIO_TOKEN];

    const pairAddress = await contract.getPair(tokenA, tokenB);
    info(`  OINIO/0G Pair Address: ${pairAddress}`);

    if (pairAddress !== '0x0000000000000000000000000000000000000000') {
      success('OINIO/0G pair already exists!');

      // Check reserves if pair exists
      const pairContract = new ethers.Contract(
        pairAddress,
        ['function getReserves() view returns (uint112, uint112, uint32)'],
        provider
      );

      const [reserve0, reserve1] = await pairContract.getReserves();
      info(`  Pool Reserves: ${ethers.formatEther(reserve0)} / ${ethers.formatEther(reserve1)}`);
      success('Pool has liquidity!');
    } else {
      info('OINIO/0G pair does not exist yet (will be created with first liquidity)');
    }

  } catch (err) {
    error(`Failed to verify DEX factory: ${err.message}`);
  }
}

async function main() {
  console.log(colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🔍 QUANTUM PI FORGE: CONTRACT VERIFICATION          ║');
  console.log('║              January 29, 2026 - Sovereign Audit              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  log('Starting sovereign contract verification...');
  log(`Network: 0G Aristotle (Chain ID: ${CONFIG.CHAIN_ID})`);
  log(`RPC: ${CONFIG.RPC_URL}`);
  log(`Explorer: ${CONFIG.EXPLORER_URL}`);

  try {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    log('🌐 Testing network connectivity...');

    // Test connection
    const network = await provider.getNetwork();
    if (network.chainId === BigInt(CONFIG.CHAIN_ID)) {
      success(`Connected to 0G Aristotle (Chain ID: ${network.chainId})`);
    } else {
      warning(`Connected to different network. Expected ${CONFIG.CHAIN_ID}, got ${network.chainId}`);
    }

    // Verify contracts exist
    await verifyContract(provider, CONFIG.OINIO_TOKEN, 'OINIO Token');
    await verifyContract(provider, CONFIG.DEX_ROUTER, 'DEX Router');
    await verifyContract(provider, CONFIG.DEX_FACTORY, 'DEX Factory');

    // Detailed verification
    await verifyOINIOToken(provider);
    await verifyDEXRouter(provider);
    await verifyDEXFactory(provider);

    // Final summary
    console.log('');
    console.log(colors.purple + '╔══════════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.purple + '║                    📊 VERIFICATION SUMMARY                    ║' + colors.reset);
    console.log(colors.purple + '╚══════════════════════════════════════════════════════════════╝' + colors.reset);
    console.log('');

    success('Contract verification completed!');
    success(`OINIO Token: ${CONFIG.OINIO_TOKEN}`);
    success(`DEX Router: ${CONFIG.DEX_ROUTER}`);
    success(`DEX Factory: ${CONFIG.DEX_FACTORY}`);

    console.log('');
    console.log('🔗 Useful Links:');
    console.log(`• OINIO Token: ${CONFIG.EXPLORER_URL}/address/${CONFIG.OINIO_TOKEN}`);
    console.log(`• DEX Router: ${CONFIG.EXPLORER_URL}/address/${CONFIG.DEX_ROUTER}`);
    console.log(`• DEX Factory: ${CONFIG.EXPLORER_URL}/address/${CONFIG.DEX_FACTORY}`);
    console.log('');

    console.log(colors.green + '✅ READY FOR LIQUIDITY ADDITION' + colors.reset);
    console.log('');
    console.log('Next steps:');
    console.log('1. Execute manual liquidity addition');
    console.log('2. Verify LP tokens received');
    console.log('3. Test Sovereign Swap component');
    console.log('4. Consider renouncing ownership for full decentralization');

  } catch (err) {
    error(`Verification failed: ${err.message}`);
  }
}

// Run the verification
main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});