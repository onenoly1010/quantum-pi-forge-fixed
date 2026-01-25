#!/usr/bin/env node

/**
 * QuantumPiForge Unified API Server
 * The nervous system connecting all four pillars
 */

console.log('🚀 Starting QuantumPiForge API server...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');

// Import middleware
const { authMiddleware } = require('./middleware/auth');
const { requestLogger } = require('./middleware/logger');

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
const { dbManager } = require('./config/database');

class UnifiedAPIServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.config = loadConfig();
  }

  async initialize() {
    console.log('🔮 Initializing QuantumPiForge Unified API...');

    console.log('⚙️ Loading configuration...');
    this.config = loadConfig();
    console.log('✅ Config loaded:', { port: this.config.port, host: this.config.host });

    // Security middleware
    console.log('🛡️ Setting up security middleware...');
    this.app.use(helmet());
    console.log('✅ Security middleware configured');

    // CORS configuration
    console.log('🌐 Setting up CORS...');
    this.app.use(cors(require('./config/cors').getCorsConfig()));
    console.log('✅ CORS configured');

    // Logging
    console.log('📝 Setting up logging...');
    this.app.use(requestLogger);
    this.app.use(morgan('combined'));
    console.log('✅ Logging configured');

    // Body parsing
    console.log('📦 Setting up body parsing...');
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    console.log('✅ Body parsing configured');

    // Health check (no auth required)
    console.log('🏥 Setting up health check...');
    this.app.use('/health', healthRoutes);
    console.log('✅ Health check configured');

    // Authentication middleware for protected routes
    console.log('🔐 Setting up auth middleware...');
    this.app.use('/api', authMiddleware);
    console.log('✅ Auth middleware configured');

    // API routes
    console.log('🛣️ Setting up API routes...');
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/souls', soulsRoutes);
    this.app.use('/api/oracle', oracleRoutes);
    this.app.use('/api/inft', inftRoutes);
    this.app.use('/api/payments', paymentsRoutes);
    console.log('✅ API routes configured');

    // 404 handler
    console.log('❓ Setting up 404 handler...');
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
      });
    });
    console.log('✅ 404 handler configured');

    // Global error handler
    console.log('🚨 Setting up error handler...');
    this.app.use(errorHandler);
    console.log('✅ Error handler configured');

    // Initialize database connection (don't wait for it)
    console.log('📊 Initializing database connection...');
    dbManager.connect().catch((error) => {
      console.warn('⚠️ Database connection failed, continuing without database:', error.message);
    });

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
        this.server.close(async () => {
          console.log('🛑 Unified API server stopped');
          
          // Disconnect from database
          await dbManager.disconnect();
          console.log('📊 Database disconnected');
          
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
  console.log('🚀 Starting QuantumPiForge Unified API...');
  const server = new UnifiedAPIServer();

  console.log('📋 Initializing server...');
  server.initialize()
    .then(() => {
      console.log('✅ Server initialized, starting...');
      return server.start();
    })
    .then(() => {
      console.log('🎉 Server started successfully! Press Ctrl+C to stop.');
      // Keep the process running
      process.stdin.resume();
    })
    .catch((error) => {
      console.error('❌ Failed to start Unified API:', error);
      process.exit(1);
    });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('⏹️ Shutting down server...');
    await server.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}