/**
 * Structured Logging Middleware
 * Provides consistent logging across the unified API
 */

const winston = require('winston');
const { format, transports } = winston;

// Custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    });
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      )
    }),

    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      }),
      new transports.File({
        filename: 'logs/combined.log',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
      })
    ] : [])
  ]
});

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = generateRequestId();

  // Add request ID to request object
  req.requestId = requestId;

  // Log incoming request
  logger.info('Request received', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;

    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Error logging middleware
 */
function errorLogger(error, req, res, next) {
  const requestId = req.requestId || 'unknown';

  logger.error('Request error', {
    requestId,
    error: {
      message: error.message,
      stack: error.stack,
      status: error.status || 500,
      code: error.code
    },
    method: req.method,
    url: req.url,
    ip: req.ip,
    user: req.user ? { id: req.user.id, authMethod: req.user.authMethod } : null
  });

  next(error);
}

/**
 * Performance logging middleware
 */
function performanceLogger(threshold = 1000) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds

      if (duration > threshold) {
        logger.warn('Slow request detected', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${threshold}ms`
        });
      }
    });

    next();
  };
}

/**
 * Audit logging for sensitive operations
 */
function auditLogger(action) {
  return (req, res, next) => {
    logger.info('Audit event', {
      requestId: req.requestId,
      action,
      user: req.user ? {
        id: req.user.id,
        authMethod: req.user.authMethod,
        soulId: req.user.soul?.id
      } : null,
      ip: req.ip,
      method: req.method,
      url: req.url,
      body: sanitizeBody(req.body, true), // More aggressive sanitization for audit
      timestamp: new Date().toISOString()
    });

    next();
  };
}

/**
 * Business event logging
 */
function businessLogger(event, data = {}) {
  return (req, res, next) => {
    logger.info('Business event', {
      requestId: req.requestId,
      event,
      user: req.user ? { id: req.user.id, soulId: req.user.soul?.id } : null,
      data: sanitizeData(data),
      timestamp: new Date().toISOString()
    });

    next();
  };
}

// Utility functions

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize request body for logging
 */
function sanitizeBody(body, aggressive = false) {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };

  // Always sanitize sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'privateKey', 'signature'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Aggressive sanitization removes all non-essential data
  if (aggressive) {
    const allowedFields = ['id', 'type', 'amount', 'currency'];
    Object.keys(sanitized).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete sanitized[key];
      }
    });
  }

  return sanitized;
}

/**
 * Sanitize business data for logging
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };

  // Remove sensitive business data
  const sensitiveBusinessFields = ['paymentDetails', 'walletKey', 'privateData'];
  sensitiveBusinessFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Create child logger for specific modules
 */
function createChildLogger(moduleName) {
  return logger.child({ module: moduleName });
}

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  performanceLogger,
  auditLogger,
  businessLogger,
  createChildLogger
};