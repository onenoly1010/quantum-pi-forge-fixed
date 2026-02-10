/**
 * Custom Error Classes
 * Standardized error handling for the unified API
 */

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        status: this.status,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

class AuthenticationError extends ApiError {
  constructor(message = "Authentication required", details = null) {
    super(message, 401, details);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends ApiError {
  constructor(message = "Access denied", details = null) {
    super(message, 403, details);
    this.name = "AuthorizationError";
  }
}

class NotFoundError extends ApiError {
  constructor(resource = "Resource", details = null) {
    super(`${resource} not found`, 404, details);
    this.name = "NotFoundError";
  }
}

class ConflictError extends ApiError {
  constructor(message = "Resource conflict", details = null) {
    super(message, 409, details);
    this.name = "ConflictError";
  }
}

class RateLimitError extends ApiError {
  constructor(message = "Too many requests", retryAfter = null) {
    super(message, 429, { retryAfter });
    this.name = "RateLimitError";
  }
}

class ExternalServiceError extends ApiError {
  constructor(service, message, status = 502) {
    super(`External service error: ${service} - ${message}`, status, {
      service,
    });
    this.name = "ExternalServiceError";
  }
}

class BlockchainError extends ExternalServiceError {
  constructor(message, details = null) {
    super("blockchain", message, 502);
    this.name = "BlockchainError";
    this.details = details;
  }
}

class PiNetworkError extends ExternalServiceError {
  constructor(message, details = null) {
    super("pi-network", message, 502);
    this.name = "PiNetworkError";
    this.details = details;
  }
}

class OracleError extends ExternalServiceError {
  constructor(message, details = null) {
    super("oracle", message, 502);
    this.name = "OracleError";
    this.details = details;
  }
}

/**
 * Error handler middleware
 */
function errorHandler(error, req, res, next) {
  // Log error
  console.error("API Error:", {
    name: error.name,
    message: error.message,
    status: error.status,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    requestId: req.requestId,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  const response = {
    success: false,
    error: {
      message: error.message,
      status: error.status || 500,
      timestamp: new Date().toISOString(),
    },
  };

  // Add error details in development
  if (isDevelopment) {
    response.error.name = error.name;
    response.error.stack = error.stack;
    response.error.details = error.details;
  }

  // Add retry-after for rate limiting
  if (error.name === "RateLimitError" && error.details?.retryAfter) {
    res.set("Retry-After", error.details.retryAfter);
  }

  res.status(error.status || 500).json(response);
}

/**
 * Async error wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  BlockchainError,
  PiNetworkError,
  OracleError,
  errorHandler,
  asyncHandler,
};
