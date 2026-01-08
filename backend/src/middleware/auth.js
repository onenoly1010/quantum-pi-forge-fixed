/**
 * Authentication Middleware
 * Handles API key validation and request authentication
 */

/**
 * Validate API key from headers
 */
export function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Skip validation if no API key is configured (development mode)
  if (!process.env.API_KEY) {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
    });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
    });
  }
  
  next();
}

/**
 * Validate Ethereum signature for authenticated requests
 * @param {string} message - The message that was signed
 * @param {string} signature - The signature to verify
 * @param {string} address - The expected signer address
 */
export function validateSignature(message, signature, address) {
  // TODO: Implement signature verification with ethers.js
  // import { ethers } from 'ethers';
  // const recoveredAddress = ethers.verifyMessage(message, signature);
  // return recoveredAddress.toLowerCase() === address.toLowerCase();
  
  // Placeholder - always returns true in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

/**
 * Rate limit by wallet address
 */
const addressRateLimits = new Map();
const ADDRESS_RATE_LIMIT = 10; // requests
const ADDRESS_RATE_WINDOW = 60 * 1000; // 1 minute

export function rateLimitByAddress(req, res, next) {
  const address = req.body?.userAddress || req.params?.address;
  
  if (!address) {
    return next();
  }
  
  const now = Date.now();
  const key = address.toLowerCase();
  
  if (!addressRateLimits.has(key)) {
    addressRateLimits.set(key, { count: 1, resetTime: now + ADDRESS_RATE_WINDOW });
    return next();
  }
  
  const limit = addressRateLimits.get(key);
  
  // Reset if window has passed
  if (now > limit.resetTime) {
    addressRateLimits.set(key, { count: 1, resetTime: now + ADDRESS_RATE_WINDOW });
    return next();
  }
  
  // Check if over limit
  if (limit.count >= ADDRESS_RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded for this address',
      retryAfter: Math.ceil((limit.resetTime - now) / 1000),
    });
  }
  
  // Increment count
  limit.count++;
  next();
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of addressRateLimits.entries()) {
    if (now > value.resetTime) {
      addressRateLimits.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

export default {
  validateApiKey,
  validateSignature,
  rateLimitByAddress,
};
