/**
 * Health Routes
 * System health checks and status endpoints
 */

const express = require("express");
const router = express.Router();
const os = require("os");

// Import services for health checks
const { authService } = require("../../services/auth");
const { dbManager } = require("../../config/database");
const {
  getMetrics,
  updateDatabaseMetrics,
} = require("../../middleware/metrics");

/**
 * GET /health
 * Basic health check
 */
router.get("/", async (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "QuantumPiForge Unified API",
    version: process.env.npm_package_version || "1.0.0",
  });
});

/**
 * GET /health/detailed
 * Detailed health check with component status
 */
router.get("/detailed", async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "QuantumPiForge Unified API",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      components: {},
    };

    // Check authentication service
    try {
      const authStats = authService.getSessionStats();
      health.components.auth = {
        status: "healthy",
        activeSessions: authStats.active,
        totalSessions: authStats.total,
      };
    } catch (error) {
      health.components.auth = {
        status: "unhealthy",
        error: error.message,
      };
      health.status = "degraded";
    }

    // Check database connectivity (placeholder)
    try {
      // TODO: Add actual database health check
      health.components.database = {
        status: "healthy",
        type: "mongodb",
        connected: true,
      };
    } catch (error) {
      health.components.database = {
        status: "unhealthy",
        error: error.message,
      };
      health.status = "degraded";
    }

    // Check blockchain connectivity (placeholder)
    try {
      // TODO: Add actual blockchain health check
      health.components.blockchain = {
        status: "healthy",
        network: "polygon",
        connected: true,
      };
    } catch (error) {
      health.components.blockchain = {
        status: "unhealthy",
        error: error.message,
      };
      health.status = "degraded";
    }

    // Check Pi Network connectivity (placeholder)
    try {
      // TODO: Add actual Pi Network health check
      health.components.piNetwork = {
        status: "healthy",
        connected: true,
      };
    } catch (error) {
      health.components.piNetwork = {
        status: "unhealthy",
        error: error.message,
      };
      health.status = "degraded";
    }

    // System resources
    health.system = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      nodeVersion: process.version,
    };

    // Environment info (safe)
    health.environment = {
      nodeEnv: process.env.NODE_ENV || "development",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    res.status(health.status === "healthy" ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/ready
 * Readiness check for load balancers
 */
router.get("/ready", async (req, res) => {
  try {
    // Check critical dependencies
    const criticalChecks = [
      authService.getSessionStats(), // If this fails, service is not ready
    ];

    await Promise.all(criticalChecks);

    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/live
 * Liveness check for container orchestration
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/metrics
 * Prometheus-style metrics (placeholder)
 */
router.get("/metrics", async (req, res) => {
  try {
    const authStats = authService.getSessionStats();

    const metrics = `# QuantumPiForge Unified API Metrics
# HELP qpforge_sessions_active Number of active sessions
# TYPE qpforge_sessions_active gauge
qpforge_sessions_active ${authStats.active}

# HELP qpforge_sessions_total Total number of sessions
# TYPE qpforge_sessions_total counter
qpforge_sessions_total ${authStats.total}

# HELP qpforge_uptime_seconds Service uptime in seconds
# TYPE qpforge_uptime_seconds counter
qpforge_uptime_seconds ${process.uptime()}

# HELP qpforge_heap_used_bytes JavaScript heap used bytes
# TYPE qpforge_heap_used_bytes gauge
qpforge_heap_used_bytes ${process.memoryUsage().heapUsed}

# HELP qpforge_heap_total_bytes JavaScript heap total bytes
# TYPE qpforge_heap_total_bytes gauge
qpforge_heap_total_bytes ${process.memoryUsage().heapTotal}
`;

    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(metrics);
  } catch (error) {
    res.status(500).send(`# Error generating metrics: ${error.message}`);
  }
});

module.exports = router;
