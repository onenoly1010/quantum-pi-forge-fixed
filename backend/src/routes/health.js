/**
 * Health Check Routes
 * Monitor service availability and status
 */

import express from 'express';

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    },
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req, res) => {
  res.status(200).send('OK');
});

// Readiness probe
router.get('/ready', (req, res) => {
  // Add checks for database connections, external services, etc.
  const isReady = true; // Placeholder - add real checks
  
  if (isReady) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('NOT READY');
  }
});

export default router;
