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
router.get('/ready', async (req, res) => {
  // Check critical dependencies
  const checks = {
    blockchain: await checkBlockchainConnection(),
    sponsorWallet: await checkSponsorWallet(),
  };
  
  const isReady = Object.values(checks).every(check => check === true);
  
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      checks,
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      checks,
    });
  }
});

// Production monitoring endpoint
router.get('/monitoring', async (req, res) => {
  const sponsorBalances = await getSponsorWalletBalances();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    sponsorWallet: sponsorBalances,
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || '900000',
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    },
    features: {
      gaslessStaking: true,
      apiVersion: process.env.API_VERSION || 'v1',
    },
  });
});

// Helper functions
async function checkBlockchainConnection() {
  try {
    const rpcUrl = process.env.POLYGON_RPC_URL;
    if (!rpcUrl) return false;
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });
    
    const data = await response.json();
    return !!data.result;
  } catch (error) {
    console.error('Blockchain connection check failed:', error);
    return false;
  }
}

async function checkSponsorWallet() {
  try {
    const privateKey = process.env.SPONSOR_PRIVATE_KEY;
    return !!privateKey && privateKey.length > 0;
  } catch (error) {
    return false;
  }
}

async function getSponsorWalletBalances() {
  try {
    // This would require ethers.js to get actual balances
    // For now, return status only
    return {
      status: 'configured',
      note: 'Use separate balance check script for detailed info',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}

export default router;
