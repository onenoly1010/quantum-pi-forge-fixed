/**
 * CORS Configuration
 * Cross-Origin Resource Sharing settings for the unified API
 */

const { getEnvVar, isProduction } = require('../shared/utils');

function getCorsConfig() {
  const config = {
    // Basic CORS settings
    origin: isProduction()
      ? getEnvVar('CORS_ORIGIN', 'https://quantumpiforge.com').split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Session-Token',
      'X-Pi-Token',
      'X-Soul-Signature',
      'X-API-Key',
      'X-Client-Version',
      'Accept',
      'Accept-Encoding',
      'Accept-Language',
      'Cache-Control',
      'Connection',
      'Host',
      'Origin',
      'Referer',
      'User-Agent'
    ],

    exposedHeaders: [
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
      'X-Session-Expires',
      'X-Request-ID'
    ],

    // Security options
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false,
    strictPreflight: true
  };

  // Additional production security
  if (isProduction()) {
    config.maxAge = 86400; // 24 hours
  }

  return config;
}

/**
 * Validate CORS origin
 */
function isValidOrigin(origin, allowedOrigins) {
  if (!origin) return false;

  // Check exact matches
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns (e.g., *.quantumpiforge.com)
  for (const allowed of allowedOrigins) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      if (origin.endsWith(domain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get CORS headers for preflight response
 */
function getCorsHeaders(requestOrigin, config = null) {
  if (!config) config = getCorsConfig();

  const headers = {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Credentials': config.credentials.toString(),
    'Access-Control-Allow-Methods': config.methods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': config.exposedHeaders.join(', ')
  };

  if (config.maxAge) {
    headers['Access-Control-Max-Age'] = config.maxAge.toString();
  }

  return headers;
}

module.exports = {
  getCorsConfig,
  isValidOrigin,
  getCorsHeaders
};