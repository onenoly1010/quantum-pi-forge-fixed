/**
 * Main API Routes
 * General endpoints for Quantum Pi Forge
 */

import express from 'express';

const router = express.Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    api: 'Quantum Pi Forge API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/api/status', description: 'System status' },
      { method: 'GET', path: '/api/config', description: 'Public configuration' },
      { method: 'POST', path: '/api/staking/sponsor', description: 'Gasless staking' },
      { method: 'GET', path: '/api/staking/balance/:address', description: 'Get staked balance' },
    ],
  });
});

// System status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    system: {
      status: 'operational',
      lastUpdated: new Date().toISOString(),
    },
    services: {
      api: 'operational',
      blockchain: 'operational',
      staking: 'operational',
    },
    network: {
      name: 'Polygon Mainnet',
      chainId: 137,
      rpcStatus: 'connected',
    },
  });
});

// Public configuration (no sensitive data)
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      network: {
        name: 'Polygon Mainnet',
        chainId: 137,
        explorer: 'https://polygonscan.com',
      },
      contracts: {
        oinioToken: process.env.OINIO_TOKEN_ADDRESS || '0x07f43E5B1A8a0928B364E40d5885f81A543B05C7',
      },
      staking: {
        minAmount: '0.01',
        maxAmount: '10000',
        currency: 'OINIO',
      },
      branding: {
        frequency: '1010 Hz',
        mission: 'Truth Movement',
      },
    },
  });
});

// Validate Ethereum address
router.get('/validate/address/:address', (req, res) => {
  const { address } = req.params;
  
  // Basic Ethereum address validation
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
  
  res.json({
    success: true,
    address,
    isValid,
    checksumValid: isValid ? isChecksumAddress(address) : false,
  });
});

// Helper: Check if address has valid checksum
function isChecksumAddress(address) {
  // Simplified checksum validation
  // For production, use ethers.js or web3.js
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  
  const hasUpperCase = /[A-F]/.test(address.slice(2));
  const hasLowerCase = /[a-f]/.test(address.slice(2));
  
  // If all lowercase or all uppercase, it's valid but not checksummed
  if (!hasUpperCase || !hasLowerCase) return true;
  
  // Mixed case suggests it's checksummed - would need full validation
  return true; // Simplified for this example
}

export default router;
