/**
 * Environment Configuration
 * Environment variable validation and loading utilities
 */

const fs = require("fs");
const path = require("path");

/**
 * Get environment variable with optional default
 */
function getEnvVar(key, defaultValue = null) {
  const value = process.env[key];
  if (value !== undefined && value !== null && value !== "") {
    return value;
  }
  return defaultValue;
}

/**
 * Get required environment variable
 */
function getRequiredEnvVar(key, description = "") {
  const value = getEnvVar(key);
  if (value === null || value === undefined || value === "") {
    throw new Error(
      `Required environment variable ${key} is not set${description ? `: ${description}` : ""}`,
    );
  }
  return value;
}

/**
 * Get environment variable as boolean
 */
function getEnvBool(key, defaultValue = false) {
  const value = getEnvVar(key);
  if (value === null) return defaultValue;

  const lowerValue = value.toLowerCase();
  return ["true", "1", "yes", "on", "enabled"].includes(lowerValue);
}

/**
 * Get environment variable as number
 */
function getEnvNumber(key, defaultValue = 0) {
  const value = getEnvVar(key);
  if (value === null) return defaultValue;

  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} is not a valid number: ${value}`,
    );
  }
  return parsed;
}

/**
 * Get environment variable as integer
 */
function getEnvInt(key, defaultValue = 0) {
  const value = getEnvVar(key);
  if (value === null) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} is not a valid integer: ${value}`,
    );
  }
  return parsed;
}

/**
 * Get environment variable as array (comma-separated)
 */
function getEnvArray(key, defaultValue = []) {
  const value = getEnvVar(key);
  if (value === null) return defaultValue;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Check if running in production
 */
function isProduction() {
  return getEnvVar("NODE_ENV", "development") === "production";
}

/**
 * Check if running in development
 */
function isDevelopment() {
  return getEnvVar("NODE_ENV", "development") === "development";
}

/**
 * Check if running in test environment
 */
function isTest() {
  return getEnvVar("NODE_ENV", "development") === "test";
}

/**
 * Load environment variables from .env file
 */
function loadEnvFile(filePath = ".env") {
  try {
    const envPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(envPath)) {
      return false;
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, "");
        process.env[key.trim()] = cleanValue;
      }
    }

    return true;
  } catch (error) {
    console.warn(`Failed to load environment file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Validate required environment variables
 */
function validateRequiredEnvVars(requiredVars) {
  const missing = [];
  const invalid = [];

  for (const [key, validator] of Object.entries(requiredVars)) {
    const value = getEnvVar(key);

    if (value === null || value === undefined || value === "") {
      missing.push(key);
      continue;
    }

    if (validator && typeof validator === "function") {
      try {
        if (!validator(value)) {
          invalid.push(`${key}: ${value}`);
        }
      } catch (error) {
        invalid.push(`${key}: ${error.message}`);
      }
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

/**
 * Get environment info for debugging
 */
function getEnvInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    nodeEnv: getEnvVar("NODE_ENV", "development"),
    port: getEnvVar("PORT", "3001"),
    host: getEnvVar("HOST", "localhost"),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isTest: isTest(),
  };
}

/**
 * Sanitize environment variable for logging
 */
function sanitizeEnvVar(key, value) {
  const sensitiveKeys = [
    "secret",
    "password",
    "token",
    "key",
    "private",
    "auth",
    "database_url",
    "redis_url",
    "rpc_url",
    "api_key",
  ];

  const lowerKey = key.toLowerCase();
  const isSensitive = sensitiveKeys.some((sensitive) =>
    lowerKey.includes(sensitive),
  );

  if (isSensitive && value && value.length > 0) {
    return `${value.substring(0, 4)}****`;
  }

  return value;
}

module.exports = {
  getEnvVar,
  getRequiredEnvVar,
  getEnvBool,
  getEnvNumber,
  getEnvInt,
  getEnvArray,
  isProduction,
  isDevelopment,
  isTest,
  loadEnvFile,
  validateRequiredEnvVars,
  getEnvInfo,
  sanitizeEnvVar,
};
