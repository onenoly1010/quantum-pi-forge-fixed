/**
 * Authentication Service
 * Manages unified sessions for Pi + OINIO authentication
 */

const crypto = require('crypto');
const { verifyPiAuth } = require('../../integrations/pi/auth');
const { verifySoul } = require('../../core/identity/services/verification');

class AuthService {
  constructor() {
    this.sessions = new Map(); // In production, use Redis or database
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Create unified session from authentication data
   */
  async createSession(authData) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      user: authData,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTimeout)
    };

    this.sessions.set(sessionId, session);

    // Clean up expired sessions periodically
    this.cleanupExpiredSessions();

    return session;
  }

  /**
   * Validate existing session
   */
  async validateSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      throw new Error('Session expired');
    }

    // Update last activity
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.sessionTimeout);

    return session.user;
  }

  /**
   * Authenticate user with Pi Network
   */
  async authenticateWithPi(piToken, soulSignature = null) {
    // Verify Pi Network authentication
    const piAuth = await verifyPiAuth(piToken);
    if (!piAuth.valid) {
      throw new Error('Invalid Pi Network authentication');
    }

    let soulData = null;

    // If soul signature provided, verify OINIO soul
    if (soulSignature) {
      try {
        const soulVerification = await verifySoul(piAuth.user.uid, soulSignature);
        if (soulVerification.verified) {
          soulData = soulVerification.soul;
        }
      } catch (error) {
        console.warn('Soul verification failed:', error.message);
        // Continue without soul - it's optional
      }
    }

    return {
      piUser: piAuth.user,
      soul: soulData,
      authMethod: 'pi',
      authenticatedAt: new Date()
    };
  }

  /**
   * Authenticate user with soul signature only
   */
  async authenticateWithSoul(soulSignature) {
    const soulVerification = await verifySoul(null, soulSignature);
    if (!soulVerification.verified) {
      throw new Error('Invalid soul signature');
    }

    return {
      soul: soulVerification.soul,
      authMethod: 'soul',
      authenticatedAt: new Date()
    };
  }

  /**
   * Link Pi user to existing soul
   */
  async linkPiToSoul(piUserId, soulSignature) {
    const soulVerification = await verifySoul(piUserId, soulSignature);
    if (!soulVerification.verified) {
      throw new Error('Soul linking failed');
    }

    return {
      piUserId,
      soul: soulVerification.soul,
      linkedAt: new Date()
    };
  }

  /**
   * Get user permissions based on auth data
   */
  getUserPermissions(user) {
    const permissions = {
      canReadOwnData: true,
      canMintINFT: false,
      canEvolveINFT: false,
      canAccessOracle: false,
      isAdmin: false
    };

    // Pi Network users get basic permissions
    if (user.piUser) {
      permissions.canMintINFT = true;
      permissions.canAccessOracle = true;
    }

    // Soul holders get evolution permissions
    if (user.soul) {
      permissions.canEvolveINFT = true;
    }

    // Admin check (could be based on soul properties or whitelist)
    if (user.soul?.isAdmin || user.piUser?.isAdmin) {
      permissions.isAdmin = true;
    }

    return permissions;
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const now = new Date();
    let activeSessions = 0;
    let expiredSessions = 0;

    for (const session of this.sessions.values()) {
      if (now <= session.expiresAt) {
        activeSessions++;
      } else {
        expiredSessions++;
      }
    }

    return {
      total: this.sessions.size,
      active: activeSessions,
      expired: expiredSessions,
      lastCleanup: new Date()
    };
  }
}

// Singleton instance
const authService = new AuthService();

module.exports = authService;