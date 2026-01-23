/**
 * Authentication Routes
 * Handles unified Pi + OINIO authentication
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/auth/session');
const { validate } = require('../middleware/validate');
const { auditLogger } = require('../middleware/logger');
const { ApiError } = require('../shared/errors');

/**
 * POST /api/auth/login
 * Unified login endpoint supporting Pi Network and OINIO soul auth
 */
router.post('/login', validate('login'), auditLogger('user_login'), async (req, res, next) => {
  try {
    const { piToken, soulSignature } = req.body;

    let authResult;

    if (piToken) {
      // Pi Network authentication
      authResult = await authService.authenticateWithPi(piToken, soulSignature);
    } else if (soulSignature) {
      // Direct soul authentication
      authResult = await authService.authenticateWithSoul(soulSignature);
    } else {
      throw new ApiError('Either piToken or soulSignature required', 400);
    }

    // Create session
    const session = await authService.createSession(authResult);
    const permissions = authService.getUserPermissions(authResult);

    res.json({
      success: true,
      session: {
        id: session.id,
        expiresAt: session.expiresAt
      },
      user: {
        authMethod: authResult.authMethod,
        permissions,
        piUser: authResult.piUser ? {
          uid: authResult.piUser.uid,
          username: authResult.piUser.username
        } : null,
        soul: authResult.soul ? {
          id: authResult.soul.id,
          level: authResult.soul.level,
          coherence: authResult.soul.coherence
        } : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/link-soul
 * Link Pi Network user to existing OINIO soul
 */
router.post('/link-soul', validate('login'), auditLogger('soul_link'), async (req, res, next) => {
  try {
    const { piToken, soulSignature } = req.body;

    if (!piToken || !soulSignature) {
      throw new ApiError('Both piToken and soulSignature required for linking', 400);
    }

    // First authenticate with Pi
    const piAuth = await authService.authenticateWithPi(piToken);
    if (!piAuth.piUser) {
      throw new ApiError('Pi Network authentication failed', 401);
    }

    // Link to soul
    const linkResult = await authService.linkPiToSoul(piAuth.piUser.uid, soulSignature);

    res.json({
      success: true,
      linked: true,
      soul: {
        id: linkResult.soul.id,
        level: linkResult.soul.level,
        coherence: linkResult.soul.coherence
      },
      linkedAt: linkResult.linkedAt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh authentication session
 */
router.post('/refresh', async (req, res, next) => {
  try {
    // Session validation is handled by auth middleware
    const user = req.user;
    const permissions = authService.getUserPermissions(user);

    res.json({
      success: true,
      user: {
        authMethod: user.authMethod,
        permissions,
        piUser: user.piUser ? {
          uid: user.piUser.uid,
          username: user.piUser.username
        } : null,
        soul: user.soul ? {
          id: user.soul.id,
          level: user.soul.level,
          coherence: user.soul.coherence
        } : null
      },
      refreshedAt: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Destroy authentication session
 */
router.post('/logout', auditLogger('user_logout'), async (req, res, next) => {
  try {
    if (req.user && req.user.sessionId) {
      await authService.destroySession(req.user.sessionId);
    }

    res.json({
      success: true,
      loggedOut: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', async (req, res, next) => {
  try {
    const user = req.user;
    const permissions = authService.getUserPermissions(user);

    res.json({
      success: true,
      user: {
        authMethod: user.authMethod,
        permissions,
        piUser: user.piUser ? {
          uid: user.piUser.uid,
          username: user.piUser.username,
          accessToken: user.piUser.accessToken ? '[REDACTED]' : undefined
        } : null,
        soul: user.soul ? {
          id: user.soul.id,
          level: user.soul.level,
          coherence: user.soul.coherence,
          traits: user.soul.traits,
          createdAt: user.soul.createdAt
        } : null
      },
      session: {
        id: user.sessionId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/stats
 * Get authentication statistics (admin only)
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Check admin permission
    const permissions = authService.getUserPermissions(req.user);
    if (!permissions.isAdmin) {
      throw new ApiError('Admin access required', 403);
    }

    const stats = authService.getSessionStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;