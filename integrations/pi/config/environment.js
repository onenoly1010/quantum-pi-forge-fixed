/**
 * Pi Network Environment Configuration
 * Environment variables and configuration for Pi integration
 */

export const PI_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.PI_API_BASE_URL || "https://api.pi.network",
  API_KEY: process.env.PI_API_KEY,
  APP_ID: process.env.PI_APP_ID,
  WEBHOOK_SECRET: process.env.PI_WEBHOOK_SECRET,

  // SDK Configuration
  SDK_VERSION: process.env.PI_SDK_VERSION || "2.0",
  SANDBOX_MODE: process.env.PI_SANDBOX === "true",

  // App Configuration
  APP_NAME: process.env.PI_APP_NAME || "Quantum Pi Forge",
  APP_DESCRIPTION:
    process.env.PI_APP_DESCRIPTION || "OINIO Soul System on Pi Network",

  // Payment Limits
  MIN_PAYMENT: 0.01,
  MAX_PAYMENT: 10000,

  // Timeouts
  API_TIMEOUT: parseInt(process.env.PI_API_TIMEOUT) || 10000,
  AUTH_TIMEOUT: parseInt(process.env.PI_AUTH_TIMEOUT) || 30000,

  // Cache Settings
  CACHE_TIMEOUT: parseInt(process.env.PI_CACHE_TIMEOUT) || 300000, // 5 minutes
};

/**
 * Validate required environment variables
 */
export function validateEnvironment() {
  const required = ["PI_API_KEY", "PI_APP_ID"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Pi environment variables: ${missing.join(", ")}`,
    );
  }

  const warnings = [];

  if (!process.env.PI_WEBHOOK_SECRET) {
    warnings.push("PI_WEBHOOK_SECRET not set - webhook verification disabled");
  }

  if (process.env.PI_SANDBOX !== "true") {
    warnings.push("Not running in sandbox mode - using production Pi Network");
  }

  return {
    valid: true,
    warnings,
  };
}

/**
 * Get configuration for current environment
 */
export function getEnvironmentConfig() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isSandbox = PI_CONFIG.SANDBOX_MODE;

  return {
    ...PI_CONFIG,
    isDevelopment,
    isSandbox,
    isProduction: !isDevelopment && !isSandbox,
  };
}

/**
 * Setup environment for Pi integration
 */
export function setupPiEnvironment() {
  // Validate environment
  const validation = validateEnvironment();

  if (validation.warnings.length > 0) {
    console.warn("Pi Environment Warnings:");
    validation.warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  // Set global Pi configuration if in browser
  if (typeof window !== "undefined") {
    window.PI_CONFIG = PI_CONFIG;
  }

  console.log("Pi Network environment configured:", {
    app: PI_CONFIG.APP_NAME,
    sandbox: PI_CONFIG.SANDBOX_MODE,
    api: PI_CONFIG.API_BASE_URL,
  });

  return PI_CONFIG;
}
