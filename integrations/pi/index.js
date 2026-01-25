// Pi Network Integration - Unified Exports

const PiAuth = require('./auth/connect');
const PiSession = require('./auth/session');
const PiTokenVerifier = require('./auth/verify');

const PiPaymentCreator = require('./payments/create-payment');
const PiPaymentVerifier = require('./payments/verify-payment');
const PiWebhooks = require('./payments/webhooks');

const PiProfileMapper = require('./identity/map-profile');
const PiUserResolver = require('./identity/resolve-user');

const PiApiClient = require('./api/client');
const { PI_ENDPOINTS, PI_SCOPES, PI_PAYMENT_STATUSES, PI_WEBHOOK_EVENTS } = require('./api/endpoints');

const piSDK = require('./config/sdk-setup');
const { PI_CONFIG, validateEnvironment, getEnvironmentConfig, setupPiEnvironment } = require('./config/environment');

module.exports = {
  // Authentication
  auth: {
    connect: PiAuth,
    session: PiSession,
    verify: PiTokenVerifier
  },

  // Payments
  payments: {
    createPayment: PiPaymentCreator,
    verifyPayment: PiPaymentVerifier,
    webhooks: PiWebhooks
  },

  // Identity
  identity: {
    mapProfile: PiProfileMapper,
    resolveUser: PiUserResolver
  },

  // API
  api: {
    client: PiApiClient,
    endpoints: {
      PI_ENDPOINTS,
      PI_SCOPES,
      PI_PAYMENT_STATUSES,
      PI_WEBHOOK_EVENTS
    }
  },

  // Configuration
  config: {
    initSDK: piSDK,
    environment: {
      PI_CONFIG,
      validateEnvironment,
      getEnvironmentConfig,
      setupPiEnvironment
    }
  }
};