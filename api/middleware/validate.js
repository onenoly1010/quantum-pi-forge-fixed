/**
 * Request Validation Middleware
 * Validates API requests using Joi schemas
 */

const Joi = require('joi');
const { ApiError } = require('../shared/errors');

// Validation schemas
const schemas = {
  // Auth schemas
  login: Joi.object({
    piToken: Joi.string().required(),
    soulSignature: Joi.string().optional()
  }),

  // Oracle schemas
  oracleReading: Joi.object({
    soulId: Joi.string().required(),
    readingType: Joi.string().valid('personality', 'evolution', 'general').default('general'),
    context: Joi.object().optional()
  }),

  // iNFT schemas
  mintINFT: Joi.object({
    oracleReadingId: Joi.string().required(),
    paymentTxHash: Joi.string().required(),
    metadata: Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      attributes: Joi.array().items(Joi.object({
        trait_type: Joi.string().required(),
        value: Joi.string().required()
      })).optional()
    }).optional()
  }),

  evolveINFT: Joi.object({
    inftId: Joi.string().required(),
    interactionData: Joi.object({
      type: Joi.string().valid('oracle', 'user', 'time', 'achievement').required(),
      data: Joi.object().required()
    }).required()
  }),

  // Soul schemas
  updateSoul: Joi.object({
    metadata: Joi.object().optional(),
    preferences: Joi.object().optional()
  }),

  // Payment schemas
  createPayment: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('PI', 'USD').default('PI'),
    description: Joi.string().required(),
    metadata: Joi.object().optional()
  })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to validate against
 * @param {string} property - Request property to validate (body, params, query)
 */
function validate(schemaName, property = 'body') {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new ApiError(`Validation schema '${schemaName}' not found`, 500));
    }

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return next(new ApiError('Validation failed', 400, { errors }));
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
}

/**
 * Custom validation functions
 */

// Validate Ethereum address
function validateAddress(address) {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

// Validate Pi Network user ID
function validatePiUserId(userId) {
  // Pi user IDs are typically UUIDs or specific format
  const piUserIdRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return piUserIdRegex.test(userId);
}

// Validate soul ID format
function validateSoulId(soulId) {
  // Soul IDs should be Ethereum addresses
  return validateAddress(soulId);
}

// Validate iNFT ID format
function validateInftId(inftId) {
  // iNFT IDs are token IDs, should be positive integers or addresses
  return !isNaN(inftId) && parseInt(inftId) > 0;
}

// Validate oracle reading ID
function validateOracleReadingId(readingId) {
  // Reading IDs should be UUIDs or hashes
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return uuidRegex.test(readingId);
}

/**
 * Parameter validation middleware
 */
function validateParams(validators) {
  return (req, res, next) => {
    const errors = [];

    for (const [param, validator] of Object.entries(validators)) {
      const value = req.params[param];
      if (!validator(value)) {
        errors.push({
          field: param,
          message: `Invalid ${param} format`,
          value: value
        });
      }
    }

    if (errors.length > 0) {
      return next(new ApiError('Parameter validation failed', 400, { errors }));
    }

    next();
  };
}

/**
 * File upload validation
 */
function validateFileUpload(options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    required = false
  } = options;

  return (req, res, next) => {
    if (!req.file && required) {
      return next(new ApiError('File upload required', 400));
    }

    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        return next(new ApiError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`, 400));
      }

      // Check file type
      if (!allowedTypes.includes(req.file.mimetype)) {
        return next(new ApiError(`File type ${req.file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400));
      }
    }

    next();
  };
}

/**
 * Rate limiting validation
 * Basic implementation - in production, use express-rate-limit
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      requests.set(ip, timestamps.filter(timestamp => timestamp > windowStart));
      if (requests.get(ip).length === 0) {
        requests.delete(ip);
      }
    }

    // Check rate limit
    const userRequests = requests.get(key) || [];
    if (userRequests.length >= maxRequests) {
      return next(new ApiError('Too many requests', 429, {
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      }));
    }

    // Record request
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
}

module.exports = {
  validate,
  validateParams,
  validateFileUpload,
  rateLimit,
  validators: {
    validateAddress,
    validatePiUserId,
    validateSoulId,
    validateInftId,
    validateOracleReadingId
  }
};