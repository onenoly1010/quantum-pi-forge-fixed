/**
 * Prometheus Metrics Middleware
 * Provides application metrics for monitoring
 */

const promClient = require("prom-client");

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: "quantumpiforge-api",
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

const databaseConnections = new promClient.Gauge({
  name: "database_connections_active",
  help: "Number of active database connections",
});

const circuitBreakerState = new promClient.Gauge({
  name: "circuit_breaker_state",
  help: "Circuit breaker state (0=closed, 1=open, 2=half_open)",
  labelNames: ["service"],
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseConnections);
register.registerMetric(circuitBreakerState);

/**
 * Metrics middleware for Express
 */
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  // Track active connections
  activeConnections.inc();

  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode;

    // Record metrics
    httpRequestDuration
      .labels(req.method, route, statusCode.toString())
      .observe(duration);

    httpRequestsTotal.labels(req.method, route, statusCode.toString()).inc();

    // Decrease active connections
    activeConnections.dec();

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Get metrics for Prometheus
 */
function getMetrics() {
  return register.metrics();
}

/**
 * Update database connection metrics
 */
function updateDatabaseMetrics(activeCount) {
  databaseConnections.set(activeCount);
}

/**
 * Update circuit breaker metrics
 */
function updateCircuitBreakerMetrics(service, state) {
  const stateValue = state === "CLOSED" ? 0 : state === "OPEN" ? 1 : 2;
  circuitBreakerState.labels(service).set(stateValue);
}

module.exports = {
  metricsMiddleware,
  getMetrics,
  updateDatabaseMetrics,
  updateCircuitBreakerMetrics,
  register,
};
