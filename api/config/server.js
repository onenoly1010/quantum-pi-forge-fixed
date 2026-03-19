/**
 * Server Configuration
 * Environment-based configuration for the unified API
 */

const { getEnvVar, isProduction, isDevelopment } = require("../shared/utils");

function loadConfig() {
  return {
    // Server configuration
    port: parseInt(getEnvVar("PORT", "3001")),
    host: getEnvVar("HOST", "localhost"),
    nodeEnv: getEnvVar("NODE_ENV", "development"),

    // Security
    jwtSecret: getEnvVar("JWT_SECRET", "quantum-forge-secret"),
    jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "24h"),

    // Database
    database: {
      url: getEnvVar(
        "DATABASE_URL",
        "mongodb://localhost:27017/quantumpiforge",
      ),
      name: getEnvVar("DATABASE_NAME", "quantumpiforge"),
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },

    // Blockchain
    blockchain: {
      polygon: {
        rpcUrl: getEnvVar("POLYGON_RPC_URL", "https://polygon-rpc.com/"),
        chainId: 137,
        contracts: {
          soulRegistry: getEnvVar("SOUL_REGISTRY_ADDRESS"),
          hybridNFT: getEnvVar("HYBRID_NFT_ADDRESS"),
          evolutionManager: getEnvVar("EVOLUTION_MANAGER_ADDRESS"),
          metadataRegistry: getEnvVar("METADATA_REGISTRY_ADDRESS"),
        },
      },
      piTestnet: {
        rpcUrl: getEnvVar("PI_TESTNET_RPC_URL"),
        chainId: 31415,
        contracts: {
          // Pi Network testnet contracts
        },
      },
    },

    // Pi Network
    piNetwork: {
      apiKey: getEnvVar("PI_API_KEY"),
      appId: getEnvVar("PI_APP_ID"),
      sandbox: getEnvVar("PI_SANDBOX", "true") === "true",
      webhookSecret: getEnvVar("PI_WEBHOOK_SECRET"),
    },

    // Oracle
    oracle: {
      enabled: getEnvVar("ORACLE_ENABLED", "true") === "true",
      cacheTimeout: parseInt(getEnvVar("ORACLE_CACHE_TIMEOUT", "300000")), // 5 minutes
      maxReadingsPerHour: parseInt(
        getEnvVar("ORACLE_MAX_READINGS_PER_HOUR", "100"),
      ),
    },

    // iNFT
    inft: {
      maxEvolutionLevel: parseInt(getEnvVar("INFT_MAX_EVOLUTION_LEVEL", "10")),
      evolutionCooldown: parseInt(
        getEnvVar("INFT_EVOLUTION_COOLDOWN", "86400000"),
      ), // 24 hours
      metadataCacheTimeout: parseInt(
        getEnvVar("INFT_METADATA_CACHE_TIMEOUT", "3600000"),
      ), // 1 hour
      ipfsGateway: getEnvVar(
        "IPFS_GATEWAY",
        "https://gateway.pinata.cloud/ipfs/",
      ),
    },

    // External services
    services: {
      ipfs: {
        apiKey: getEnvVar("IPFS_API_KEY"),
        secretKey: getEnvVar("IPFS_SECRET_KEY"),
        gateway: getEnvVar("IPFS_GATEWAY", "https://api.pinata.cloud/"),
      },
      redis: {
        url: getEnvVar("REDIS_URL", "redis://localhost:6379"),
        ttl: parseInt(getEnvVar("REDIS_TTL", "86400")), // 24 hours
      },
    },

    // Logging
    logging: {
      level: getEnvVar("LOG_LEVEL", isProduction() ? "info" : "debug"),
      enableConsole: getEnvVar("LOG_CONSOLE", "true") === "true",
      enableFile: getEnvVar("LOG_FILE", "false") === "true",
      logDirectory: getEnvVar("LOG_DIR", "./logs"),
      maxFileSize: parseInt(getEnvVar("LOG_MAX_SIZE", "10485760")), // 10MB
      maxFiles: parseInt(getEnvVar("LOG_MAX_FILES", "5")),
    },

    // Rate limiting
    rateLimit: {
      windowMs: parseInt(getEnvVar("RATE_LIMIT_WINDOW", "900000")), // 15 minutes
      maxRequests: parseInt(getEnvVar("RATE_LIMIT_MAX", "100")),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },

    // CORS
    cors: {
      origin: isProduction()
        ? getEnvVar("CORS_ORIGIN", "https://quantumpiforge.com").split(",")
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Session-Token",
        "X-Pi-Token",
        "X-Soul-Signature",
      ],
    },

    // Feature flags
    features: {
      enableEvolution: getEnvVar("ENABLE_EVOLUTION", "true") === "true",
      enableMinting: getEnvVar("ENABLE_MINTING", "true") === "true",
      enableMarketplace: getEnvVar("ENABLE_MARKETPLACE", "false") === "true",
      enableAnalytics: getEnvVar("ENABLE_ANALYTICS", "true") === "true",
    },

    // Monitoring
    monitoring: {
      enabled: getEnvVar("MONITORING_ENABLED", "true") === "true",
      metricsPort: parseInt(getEnvVar("METRICS_PORT", "9090")),
      healthCheckInterval: parseInt(
        getEnvVar("HEALTH_CHECK_INTERVAL", "30000"),
      ), // 30 seconds
    },
  };
}

/**
 * Validate configuration
 */
function validateConfig(config = null) {
  if (!config) config = loadConfig();

  const errors = [];
  const warnings = [];

  // Required configurations
  if (!config.jwtSecret || config.jwtSecret === "quantum-forge-secret") {
    if (isProduction()) {
      errors.push("JWT_SECRET must be set in production");
    } else {
      warnings.push("Using default JWT secret - not secure for production");
    }
  }

  if (!config.database.url) {
    errors.push("DATABASE_URL is required");
  }

  if (!config.piNetwork.apiKey) {
    warnings.push("PI_API_KEY not set - Pi Network features will be limited");
  }

  if (!config.blockchain.polygon.contracts.soulRegistry) {
    warnings.push(
      "SOUL_REGISTRY_ADDRESS not set - soul verification may not work",
    );
  }

  if (!config.blockchain.polygon.contracts.hybridNFT) {
    warnings.push("HYBRID_NFT_ADDRESS not set - iNFT minting may not work");
  }

  // Validate URLs
  const urlFields = ["blockchain.polygon.rpcUrl"];
  urlFields.forEach((field) => {
    const keys = field.split(".");
    let value = config;
    for (const key of keys) {
      value = value[key];
    }
    if (value && !value.match(/^https?:\/\//)) {
      errors.push(`${field} must be a valid HTTP/HTTPS URL`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  loadConfig,
  validateConfig,
};
