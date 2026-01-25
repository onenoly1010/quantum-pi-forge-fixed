/**
 * Shared Utilities
 * Common functions used across the unified API
 */

const crypto = require('crypto');
const { ethers } = require('ethers');

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Hash data using SHA-256
 */
function hashData(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Sign data with Ethereum private key
 */
function signData(data, privateKey) {
  const message = JSON.stringify(data);
  const messageHash = ethers.hashMessage(message);
  const wallet = new ethers.Wallet(privateKey);
  return wallet.signMessage(message);
}

/**
 * Verify Ethereum signature
 */
function verifySignature(message, signature, address) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = () => true
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Safe JSON parse
 */
function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safe JSON stringify
 */
function safeJsonStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format currency amount
 */
function formatCurrency(amount, currency = 'PI') {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Calculate percentage
 */
function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Check if date is within range
 */
function isDateInRange(date, startDate, endDate) {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return checkDate >= start && checkDate <= end;
}

/**
 * Paginate array
 */
function paginateArray(array, page = 1, limit = 20) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    items: array.slice(startIndex, endIndex),
    total: array.length,
    page,
    limit,
    pages: Math.ceil(array.length / limit)
  };
}

/**
 * Sanitize string for logging
 */
function sanitizeString(str, maxLength = 100) {
  if (typeof str !== 'string') return String(str);

  // Remove sensitive patterns
  const sanitized = str
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD_NUMBER]') // Credit cards
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Emails
    .replace(/\b\d{10,15}\b/g, '[PHONE]') // Phone numbers
    .replace(/\b[A-Fa-f0-9]{64}\b/g, '[PRIVATE_KEY]'); // Private keys

  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) + '...' : sanitized;
}

/**
 * Get environment variable with default
 */
function getEnvVar(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

/**
 * Check if running in production
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Get service base URL
 */
function getServiceUrl(service, defaultPort = null) {
  const envKey = `${service.toUpperCase()}_URL`;
  const url = process.env[envKey];

  if (url) return url;

  if (defaultPort) {
    return `http://localhost:${defaultPort}`;
  }

  return null;
}

module.exports = {
  generateId,
  generateUUID,
  hashData,
  signData,
  verifySignature,
  sleep,
  retry,
  deepClone,
  safeJsonParse,
  safeJsonStringify,
  isValidEmail,
  isValidUrl,
  formatCurrency,
  calculatePercentage,
  getCurrentTimestamp,
  isDateInRange,
  paginateArray,
  sanitizeString,
  getEnvVar,
  isProduction,
  isDevelopment,
  getServiceUrl
};