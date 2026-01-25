/**
 * Identity System Environment Configuration
 * Environment variables and settings for identity services
 */

const identityConfig = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/oinio-identity',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000
  },

  // Blockchain
  blockchain: {
    polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    mumbaiRpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    gasLimit: parseInt(process.env.GAS_LIMIT) || 2000000,
    gasPrice: process.env.GAS_PRICE || 'auto'
  },

  // Contracts
  contracts: {
    soulRegistry: process.env.SOUL_REGISTRY_ADDRESS,
    ogToken: process.env.OG_TOKEN_ADDRESS,
    verification: process.env.VERIFICATION_ADDRESS
  },

  // Services
  services: {
    resolution: {
      cacheTimeout: parseInt(process.env.RESOLUTION_CACHE_TIMEOUT) || 300000, // 5 minutes
      maxRetries: parseInt(process.env.RESOLUTION_MAX_RETRIES) || 3
    },
    verification: {
      signatureTimeout: parseInt(process.env.SIGNATURE_TIMEOUT) || 30000, // 30 seconds
      maxClaimSize: parseInt(process.env.MAX_CLAIM_SIZE) || 10000 // bytes
    },
    profiles: {
      maxTraitsHistory: parseInt(process.env.MAX_TRAITS_HISTORY) || 100,
      maxReadingHistory: parseInt(process.env.MAX_READING_HISTORY) || 50
    }
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // External APIs
  apis: {
    pi: {
      baseUrl: process.env.PI_API_BASE_URL || 'https://api.pi.network',
      timeout: parseInt(process.env.PI_API_TIMEOUT) || 10000
    }
  },

  // Feature flags
  features: {
    enableOGRewards: process.env.ENABLE_OG_REWARDS !== 'false',
    enableClaimVerification: process.env.ENABLE_CLAIM_VERIFICATION !== 'false',
    enableProfileUpdates: process.env.ENABLE_PROFILE_UPDATES !== 'false'
  }
};

/**
 * Validate identity configuration
 */
function validateIdentityConfig() {
  const required = [
    'contracts.soulRegistry',
    'contracts.ogToken',
    'contracts.verification'
  ];

  const missing = required.filter(key => {
    const keys = key.split('.');
    let value = identityConfig;
    for (const k of keys) {
      value = value[k];
    }
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required identity configuration: ${missing.join(', ')}`);
  }

  return { valid: true };
}

module.exports = {
  identityConfig,
  validateIdentityConfig
};