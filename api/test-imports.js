#!/usr/bin/env node

/**
 * Test script to check if all imports work and database connects
 */

console.log('Testing imports and database connection...');

try {
  // Test config imports
  const { loadConfig } = require('./config/server');
  console.log('✅ Config loaded');

  // Test database connection
  const { dbManager } = require('./config/database');
  console.log('✅ Database manager loaded');

  // Test middleware imports
  const { authMiddleware } = require('./middleware/auth');
  console.log('✅ Auth middleware loaded');

  const { validate } = require('./middleware/validate');
  console.log('✅ Validation middleware loaded');

  const { requestLogger } = require('./middleware/logger');
  console.log('✅ Logger middleware loaded');

  // Test route imports
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');

  const soulsRoutes = require('./routes/souls');
  console.log('✅ Souls routes loaded');

  const oracleRoutes = require('./routes/oracle');
  console.log('✅ Oracle routes loaded');

  const inftRoutes = require('./routes/inft');
  console.log('✅ iNFT routes loaded');

  const paymentsRoutes = require('./routes/payments');
  console.log('✅ Payments routes loaded');

  const healthRoutes = require('./routes/health');
  console.log('✅ Health routes loaded');

  // Test shared utilities
  const { errorHandler } = require('./shared/errors');
  console.log('✅ Error handler loaded');

  console.log('🎉 All imports successful!');

  // Try to connect to database (but don't wait for it)
  console.log('🔄 Attempting database connection...');
  dbManager.connect().then(() => {
    console.log('✅ Database connected successfully!');
    process.exit(0);
  }).catch((err) => {
    console.log('⚠️ Database connection failed (expected if MongoDB not running):', err.message);
    process.exit(0);
  });

} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error(error.stack);
  process.exit(1);
}