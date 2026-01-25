/**
 * Pi Network API Endpoints
 * Constants and utilities for Pi Platform API endpoints
 */

export const PI_ENDPOINTS = {
  // Authentication
  AUTH_VERIFY: '/v1/auth/verify',
  AUTH_REFRESH: '/v1/auth/refresh',

  // Users
  USER_INFO: '/v1/user',
  USER_PROFILE: '/v1/user/profile',
  USER_TRANSACTIONS: '/v1/user/transactions',

  // Payments
  PAYMENTS_CREATE: '/v1/payments',
  PAYMENTS_VERIFY: '/v1/payments/verify',
  PAYMENTS_STATUS: '/v1/payments/status',

  // Apps
  APP_INFO: '/v1/app',
  APP_CONFIG: '/v1/app/config',

  // Webhooks
  WEBHOOKS_REGISTER: '/v1/webhooks',
  WEBHOOKS_LIST: '/v1/webhooks',

  // Health
  HEALTH: '/health'
};

export const PI_SCOPES = {
  USERNAME: 'username',
  PAYMENTS: 'payments',
  PROFILE: 'profile',
  TRANSACTIONS: 'transactions'
};

export const PI_PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};

export const PI_WEBHOOK_EVENTS = {
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_CANCELLED: 'payment.cancelled',
  USER_AUTHORIZED: 'user.authorized'
};

/**
 * Build API URL
 */
export function buildApiUrl(endpoint, params = {}) {
  const baseUrl = process.env.PI_API_BASE_URL || 'https://api.pi.network';
  let url = `${baseUrl}${endpoint}`;

  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  return url;
}

/**
 * Validate Pi username
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;

  // Pi usernames: 3-20 characters, alphanumeric + underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount) {
  if (typeof amount !== 'number' || amount <= 0) return false;

  // Pi payments: minimum 0.01, maximum 10000
  return amount >= 0.01 && amount <= 10000;
}

/**
 * Format payment amount for display
 */
export function formatPaymentAmount(amount) {
  return `${amount.toFixed(2)} π`;
}