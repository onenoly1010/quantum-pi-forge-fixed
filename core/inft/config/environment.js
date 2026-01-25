/**
 * iNFT Environment Configuration
 * Environment variables and settings for iNFT protocol
 */

const inftConfig = {
  // Smart contracts
  contracts: {
    hybridNFT: process.env.HYBRID_NFT_ADDRESS,
    evolutionManager: process.env.EVOLUTION_MANAGER_ADDRESS,
    metadataRegistry: process.env.METADATA_REGISTRY_ADDRESS
  },

  // AI/ML configuration
  ai: {
    defaultModel: process.env.INFT_AI_MODEL || 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: parseFloat(process.env.INFT_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.INFT_MAX_TOKENS) || 1500,
    timeout: parseInt(process.env.INFT_AI_TIMEOUT) || 30000
  },

  // Personality generation
  personality: {
    defaultArchetype: process.env.DEFAULT_ARCHETYPE || 'scholar',
    minCoherence: parseFloat(process.env.MIN_COHERENCE) || 0.3,
    maxCoherence: parseFloat(process.env.MAX_COHERENCE) || 1.0,
    traitCount: parseInt(process.env.TRAIT_COUNT) || 10
  },

  // Evolution settings
  evolution: {
    maxStage: parseInt(process.env.MAX_EVOLUTION_STAGE) || 100,
    cooldownHours: parseInt(process.env.EVOLUTION_COOLDOWN_HOURS) || 24,
    maxTraitsChange: parseFloat(process.env.MAX_TRAITS_CHANGE) || 0.2,
    enableSpecialEvents: process.env.ENABLE_SPECIAL_EVENTS !== 'false'
  },

  // Memory system
  memory: {
    maxMemories: parseInt(process.env.MAX_MEMORIES) || 1000,
    consolidationThreshold: parseInt(process.env.CONSOLIDATION_THRESHOLD) || 100,
    retentionRatio: parseFloat(process.env.MEMORY_RETENTION_RATIO) || 0.8,
    importanceThreshold: parseFloat(process.env.MEMORY_IMPORTANCE_THRESHOLD) || 0.3
  },

  // Integration settings
  integration: {
    oracleEnabled: process.env.ORACLE_INTEGRATION !== 'false',
    identityEnabled: process.env.IDENTITY_INTEGRATION !== 'false',
    piEnabled: process.env.PI_INTEGRATION !== 'false',
    webhookTimeout: parseInt(process.env.WEBHOOK_TIMEOUT) || 10000
  },

  // Minting parameters
  minting: {
    basePrice: process.env.MINT_BASE_PRICE || '0.01',
    priceCurrency: 'PI', // Pi Network tokens
    maxMintsPerWallet: parseInt(process.env.MAX_MINTS_PER_WALLET) || 10,
    cooldownMinutes: parseInt(process.env.MINT_COOLDOWN_MINUTES) || 5
  },

  // Metadata settings
  metadata: {
    baseURI: process.env.METADATA_BASE_URI || 'https://api.quantumpiforge.com/metadata/',
    animationBaseURI: process.env.ANIMATION_BASE_URI || 'https://api.quantumpiforge.com/animations/',
    updateCooldownHours: parseInt(process.env.METADATA_UPDATE_COOLDOWN) || 1
  },

  // Caching
  cache: {
    contextTTL: parseInt(process.env.CONTEXT_CACHE_TTL) || 3600000, // 1 hour
    personalityTTL: parseInt(process.env.PERSONALITY_CACHE_TTL) || 86400000, // 24 hours
    memoryTTL: parseInt(process.env.MEMORY_CACHE_TTL) || 1800000 // 30 minutes
  },

  // Monitoring and analytics
  monitoring: {
    enableStats: process.env.ENABLE_STATS !== 'false',
    statsInterval: parseInt(process.env.STATS_INTERVAL) || 3600000, // 1 hour
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Feature flags
  features: {
    dynamicEvolution: process.env.DYNAMIC_EVOLUTION !== 'false',
    memoryConsolidation: process.env.MEMORY_CONSOLIDATION !== 'false',
    personalityAnalysis: process.env.PERSONALITY_ANALYSIS !== 'false',
    crossINFTInteractions: process.env.CROSS_INFT_INTERACTIONS !== 'false',
    oraclePredictions: process.env.ORACLE_PREDICTIONS !== 'false'
  }
};

/**
 * Validate iNFT configuration
 */
function validateINFTConfig() {
  const errors = [];

  // Check required AI settings
  if (!inftConfig.ai.apiKey && inftConfig.ai.defaultModel !== 'local') {
    errors.push('AI API key required for non-local models');
  }

  // Check contract addresses
  if (inftConfig.contracts.hybridNFT && !inftConfig.contracts.hybridNFT.startsWith('0x')) {
    errors.push('Invalid HybridNFT contract address');
  }

  // Check numeric ranges
  if (inftConfig.personality.minCoherence >= inftConfig.personality.maxCoherence) {
    errors.push('Min coherence must be less than max coherence');
  }

  if (inftConfig.evolution.maxTraitsChange <= 0 || inftConfig.evolution.maxTraitsChange > 1) {
    errors.push('Max traits change must be between 0 and 1');
  }

  // Check URLs
  try {
    new URL(inftConfig.metadata.baseURI);
  } catch {
    errors.push('Invalid metadata base URI');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration for specific environment
 */
function getEnvironmentConfig(environment = process.env.NODE_ENV || 'development') {
  const envConfigs = {
    development: {
      ai: { defaultModel: 'local' },
      monitoring: { logLevel: 'debug' },
      cache: { contextTTL: 300000 } // 5 minutes for development
    },
    staging: {
      ai: { defaultModel: 'gpt-3.5-turbo' },
      monitoring: { logLevel: 'info' }
    },
    production: {
      ai: { defaultModel: 'gpt-4' },
      monitoring: { logLevel: 'warn' },
      cache: { contextTTL: 7200000 } // 2 hours for production
    }
  };

  return {
    ...inftConfig,
    ...envConfigs[environment]
  };
}

module.exports = {
  inftConfig,
  validateINFTConfig,
  getEnvironmentConfig
};