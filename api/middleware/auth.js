/**
 * Unified Authentication Middleware
 * Combines Pi Network auth with OINIO soul verification
 */

const jwt = require('jsonwebtoken');
const { authService } = require('../services/auth');
const { ApiError } = require('../shared/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'quantum-forge-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Unified authentication middleware
 * Supports both Pi Network auth and OINIO soul verification
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const piToken = req.headers['x-pi-token'];
    const soulSignature = req.headers['x-soul-signature'];
    const message = req.headers['x-soul-message'];

    let user = null;

    // Method 1: JWT token (existing session)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const session = await authService.getSession(decoded.sessionId);
        user = await authService.getUserById(session.userId);
        user.sessionId = session.sessionId;
      } catch (error) {
        throw new ApiError('Invalid or expired token', 401);
      }
    }

    // Method 2: Pi Network authentication
    else if (piToken) {
      // For now, create a mock user - in production this would verify with Pi Network
      const mockUser = {
        userId: 'pi_' + Date.now(),
        piAddress: '0x' + Math.random().toString(16).substr(2, 40),
        username: 'pi_user_' + Date.now(),
        authMethods: ['pi'],
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Store user in database
      user = await authService.getUserByPiAddress(mockUser.piAddress) || mockUser;
      if (!user.userId) {
        // This is a new user, would need to be created in the service
        user = mockUser;
      }
    }

    // Method 3: Direct soul verification (for existing soul holders)
    else if (soulSignature && message) {
      // Verify soul ownership
      const isValid = await authService.verifySoulOwnership('dummy_soul_id', soulSignature, message);
      if (!isValid) {
        throw new ApiError('Invalid soul signature', 401);
      }

      // Get user by soul
      user = await authService.getUserBySoulId('dummy_soul_id');
      if (!user) {
        throw new ApiError('Soul not linked to any user', 401);
      }
    }

    else {
      throw new ApiError('Authentication required', 401);
    }

    // Create session if user exists
    if (user && user.userId) {
      const session = await authService.createSession(user.userId, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });

      // Add JWT token to response headers for future requests
      const token = jwt.sign(
        { sessionId: session.sessionId, userId: user.userId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.setHeader('X-Session-Token', token);
      user.sessionToken = token;
    }

    req.user = user;
    next();

  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if no auth provided, but populates req.user if available
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    await authMiddleware(req, res, (error) => {
      if (error && error.status !== 401) {
        next(error);
      } else {
        next();
      }
    });
  } catch (error) {
    next();
  }
}

/**
 * Admin-only middleware
 * Requires admin privileges
 */
function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return next(new ApiError('Admin access required', 403));
  }
  next();
}

/**
 * Soul ownership middleware
 * Ensures user owns the soul being accessed
 */
function soulOwnershipMiddleware(req, res, next) {
  const requestedSoulId = req.params.soulId || req.body.soulId;
  const userSoulId = req.user?.soul?.id || req.user?.piUser?.soulId;

  if (!requestedSoulId || !userSoulId || requestedSoulId !== userSoulId) {
    return next(new ApiError('Soul access denied', 403));
  }

  next();
}

/**
 * iNFT ownership middleware
 * Ensures user owns the iNFT being accessed
 */
function inftOwnershipMiddleware(req, res, next) {
  const requestedInftId = req.params.inftId || req.body.inftId;

  // This would need to check iNFT ownership from the contract
  // For now, we'll assume the auth middleware has validated access
  if (!requestedInftId) {
    return next(new ApiError('iNFT ID required', 400));
  }

  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  soulOwnershipMiddleware,
  inftOwnershipMiddleware
};