/**
 * Quantum Pi Forge Backend Server
 * Express API for OINIO Soul System
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import healthRoutes from './routes/health.js';
import apiRoutes from './routes/api.js';
import stakingRoutes from './routes/staking.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ===================
// Security Middleware
// ===================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for staking endpoints
const stakingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Staking rate limit exceeded. Please wait before trying again.',
  },
});
app.use('/api/staking/', stakingLimiter);

// ===================
// General Middleware
// ===================

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://quantum-pi-forge.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ===================
// Routes
// ===================

// Health check routes
app.use('/health', healthRoutes);

// API routes
app.use('/api', apiRoutes);

// Staking routes
app.use('/api/staking', stakingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Quantum Pi Forge Backend',
    version: '1.0.0',
    status: 'operational',
    frequency: '1010 Hz',
    message: 'Truth resonates at the frequency of light',
    endpoints: {
      health: '/health',
      api: '/api',
      staking: '/api/staking',
    },
  });
});

// ===================
// Error Handling
// ===================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ===================
// Server Startup
// ===================

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     ⚛️  QUANTUM PI FORGE BACKEND - OPERATIONAL ⚛️         ║
╠══════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
║  Frequency: 1010 Hz                                      ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
