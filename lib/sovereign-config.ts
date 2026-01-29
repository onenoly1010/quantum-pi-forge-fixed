/**
 * Sovereign Configuration for Quantum Pi Forge
 * January 2026 - True Sovereign Architecture
 *
 * This configuration replaces static config files and will eventually
 * be managed by the CentralAwarenessV2 contract on 0G Aristotle.
 */

// ============================================================================
// MAINNET ADDRESSES (0G Aristotle - Chain ID: 16661)
// ============================================================================

export const SOVEREIGN_CONFIG = {
  // Network Configuration
  NETWORK: {
    CHAIN_ID: 16661,
    NAME: '0G Aristotle',
    RPC_URL: 'https://16661.rpc.thirdweb.com',
    EXPLORER_URL: 'https://chainscan.0g.ai',
    NATIVE_CURRENCY: {
      NAME: '0G',
      SYMBOL: '0G',
      DECIMALS: 18,
    },
  },

  // Core Contracts (Verified on Mainnet)
  CONTRACTS: {
    OINIO_TOKEN: '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37',
    DEX_ROUTER: '0x0ff65f38fa43f0aac51901381acd7a8908ae2537',
    CENTRAL_AWARENESS_V2: '', // To be set after deployment
    QUANTUM_STAKING: '', // To be set after deployment
    GASLESS_FORWARDER: '', // To be set after deployment
  },

  // Liquidity Pool Configuration
  LIQUIDITY: {
    INITIAL_SEED: {
      OINIO_AMOUNT: '1000000000000000000000', // 1,000 OINIO (18 decimals)
      ETH_AMOUNT: '10000000000000000000',   // 10 0G (18 decimals)
      MIN_OINIO: '0', // No slippage for initial seed
      MIN_ETH: '0',   // No slippage for initial seed
    },
    RECOMMENDED_SEED: {
      OINIO_AMOUNT: '10000000000000000000000', // 10,000 OINIO
      ETH_AMOUNT: '50000000000000000000',     // 50 0G (recommended minimum)
    },
  },

  // DEX Configuration (Uniswap V2 Fork)
  DEX: {
    FACTORY_ADDRESS: '', // To be determined from router
    ROUTER_ABI: [
      'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint amountToken, uint amountETH, uint liquidity)',
      'function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) returns (uint amountToken, uint amountETH)',
      'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)',
      'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
      'function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)',
      'function getAmountsIn(uint amountOut, address[] calldata path) view returns (uint[] memory amounts)',
    ],
  },

  // Token Configuration
  TOKENS: {
    OINIO: {
      ADDRESS: '0xbEbC1A40A18632CeE19D220647E7aD296A1A5F37',
      SYMBOL: 'OINIO',
      DECIMALS: 18,
      NAME: 'OINIO Soul System Token',
    },
    WETH: {
      // Wrapped 0G address (to be determined)
      ADDRESS: '',
      SYMBOL: 'W0G',
      DECIMALS: 18,
      NAME: 'Wrapped 0G',
    },
  },

  // API Endpoints
  API: {
    HEALTH_CHECK: '/api/health',
    SPONSOR_TRANSACTION: '/api/sponsor-transaction',
    AI_COMPLETE: '/api/ai/complete',
    AI_GROK: '/api/ai/grok',
    CHAT: '/api/chat',
  },

  // Feature Flags
  FEATURES: {
    GASLESS_STAKING: true,
    AI_ASSISTANCE: true,
    SOVEREIGN_MODE: true, // When true, reads from CentralAwarenessV2
    LIQUIDITY_POOL: false, // Set to true after LP creation
  },

  // Resonance Configuration (1010 Hz)
  RESONANCE: {
    BASE_FREQUENCY: 1010,
    HARMONICS: [2020, 3030, 4040],
    PHASES: ['foundation', 'growth', 'harmony', 'transcendence'],
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get contract address by name
 */
export function getContractAddress(name: keyof typeof SOVEREIGN_CONFIG.CONTRACTS): string {
  return SOVEREIGN_CONFIG.CONTRACTS[name];
}

/**
 * Check if we're in sovereign mode (reading from contract)
 */
export function isSovereignMode(): boolean {
  return SOVEREIGN_CONFIG.FEATURES.SOVEREIGN_MODE;
}

/**
 * Get liquidity pool configuration
 */
export function getLiquidityConfig(): typeof SOVEREIGN_CONFIG.LIQUIDITY {
  return SOVEREIGN_CONFIG.LIQUIDITY;
}

/**
 * Get network configuration
 */
export function getNetworkConfig(): typeof SOVEREIGN_CONFIG.NETWORK {
  return SOVEREIGN_CONFIG.NETWORK;
}

/**
 * Get token configuration
 */
export function getTokenConfig(symbol: 'OINIO' | 'WETH'): typeof SOVEREIGN_CONFIG.TOKENS.OINIO {
  return SOVEREIGN_CONFIG.TOKENS[symbol];
}

// ============================================================================
// LEGACY COMPATIBILITY (will be removed after sovereign transition)
// ============================================================================

// Environment variable fallbacks for backward compatibility
export const OINIO_TOKEN_ADDRESS = process.env.OINIO_TOKEN_ADDRESS || SOVEREIGN_CONFIG.CONTRACTS.OINIO_TOKEN;
export const DEX_ROUTER_ADDRESS = SOVEREIGN_CONFIG.CONTRACTS.DEX_ROUTER;
export const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || SOVEREIGN_CONFIG.NETWORK.RPC_URL;

// Export for backward compatibility
export default SOVEREIGN_CONFIG;