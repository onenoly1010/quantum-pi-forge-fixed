#!/usr/bin/env node

/**
 * QuantumPiForge Unified API Server
 * The nervous system connecting all four pillars
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');

// Import middleware
const { authMiddleware } = require('./middleware/auth');
const { validationMiddleware } = require('./middleware/validate');
const { loggerMiddleware } = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth');
const soulsRoutes = require('./routes/souls');
const oracleRoutes = require('./routes/oracle');
const inftRoutes = require('./routes/inft');
const paymentsRoutes = require('./routes/payments');
const healthRoutes = require('./routes/health');

// Import shared utilities
const { errorHandler } = require('./shared/errors');
const { loadConfig } = require('./config/server');

class UnifiedAPIServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.config = loadConfig();
  }

  async initialize() {
    console.log('🔮 Initializing QuantumPiForge Unified API...');

    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors(require('./config/cors')));

    // Logging
    this.app.use(loggerMiddleware);
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Health check (no auth required)
    this.app.use('/health', healthRoutes);

    // Authentication middleware for protected routes
    this.app.use('/api', authMiddleware);

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/souls', soulsRoutes);
    this.app.use('/api/oracle', oracleRoutes);
    this.app.use('/api/inft', inftRoutes);
    this.app.use('/api/payments', paymentsRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use(errorHandler);

    console.log('✅ Unified API initialized');
  }

  async start() {
    const { port, host } = this.config;

    this.server = createServer(this.app);

    return new Promise((resolve, reject) => {
      this.server.listen(port, host, (err) => {
        if (err) {
          console.error('❌ Failed to start server:', err);
          reject(err);
          return;
        }

        console.log(`🚀 QuantumPiForge Unified API running on http://${host}:${port}`);
        console.log(`📊 Health check: http://${host}:${port}/health`);
        console.log(`🔗 API endpoints: http://${host}:${port}/api/*`);

        resolve(this.server);
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🛑 Unified API server stopped');
          resolve();
        });
      });
    }
  }

  getApp() {
    return this.app;
  }
}

// Export for testing
module.exports = UnifiedAPIServer;

// Start server if run directly
if (require.main === module) {
  const server = new UnifiedAPIServer();

  server.initialize()
    .then(() => server.start())
    .catch((error) => {
      console.error('❌ Failed to start Unified API:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', () => server.stop());
  process.on('SIGINT', () => server.stop());
}