/**
 * Authentication Service
 * Unified authentication combining Pi Network and OINIO soul verification
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ethers } = require("ethers");
const { dbManager } = require("../config/database");
const { getEnvVar } = require("../config/environment");
const { ApiError } = require("../shared/errors");
const { generateId, hashData, verifySignature } = require("../shared/utils");

class AuthService {
  constructor() {
    this.jwtSecret = getEnvVar("JWT_SECRET", "quantum-forge-secret");
    this.jwtExpiresIn = getEnvVar("JWT_EXPIRES_IN", "24h");
    this.sessionTimeout = parseInt(getEnvVar("SESSION_TIMEOUT", "86400000")); // 24 hours
  }

  /**
   * Generate JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: "quantum-pi-forge",
      audience: "api",
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: "quantum-pi-forge",
        audience: "api",
      });
    } catch (error) {
      throw new ApiError("Invalid or expired token", 401);
    }
  }

  /**
   * Create session
   */
  async createSession(userId, metadata = {}) {
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    const session = {
      sessionId,
      userId,
      createdAt: new Date(),
      expiresAt,
      lastActivity: new Date(),
      metadata: {
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        ...metadata,
      },
    };

    const sessions = dbManager.getCollection("sessions");
    await sessions.insertOne(session);

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    const sessions = dbManager.getCollection("sessions");
    const session = await sessions.findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new ApiError("Session not found or expired", 401);
    }

    // Update last activity
    await sessions.updateOne(
      { sessionId },
      { $set: { lastActivity: new Date() } },
    );

    return session;
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId) {
    const sessions = dbManager.getCollection("sessions");
    await sessions.deleteOne({ sessionId });
  }

  /**
   * Authenticate with Pi Network
   */
  async authenticateWithPi(piToken, userInfo) {
    try {
      // Verify Pi token with Pi Network API
      const piVerification = await this.verifyPiToken(piToken);

      if (!piVerification.verified) {
        throw new ApiError("Invalid Pi Network authentication", 401);
      }

      // Find or create user
      const users = dbManager.getCollection("users");
      let user = await users.findOne({ piAddress: piVerification.piAddress });

      if (!user) {
        // Create new user
        user = {
          userId: generateId(),
          piAddress: piVerification.piAddress,
          piUid: piVerification.piUid,
          username: userInfo.username,
          email: userInfo.email,
          avatar: userInfo.avatar,
          verified: true,
          createdAt: new Date(),
          lastLogin: new Date(),
          authMethods: ["pi"],
          metadata: {
            piAccessToken: piVerification.accessToken,
            piScopes: piVerification.scopes,
          },
        };

        await users.insertOne(user);
      } else {
        // Update existing user
        await users.updateOne(
          { userId: user.userId },
          {
            $set: {
              lastLogin: new Date(),
              username: userInfo.username || user.username,
              email: userInfo.email || user.email,
              avatar: userInfo.avatar || user.avatar,
              "metadata.piAccessToken": piVerification.accessToken,
              "metadata.piScopes": piVerification.scopes,
            },
            $addToSet: { authMethods: "pi" },
          },
        );
      }

      return user;
    } catch (error) {
      console.error("Pi Network authentication error:", error);
      throw new ApiError("Pi Network authentication failed", 401);
    }
  }

  /**
   * Verify Pi Network token
   */
  async verifyPiToken(piToken) {
    // This would integrate with Pi Network's authentication API
    // For now, return mock verification
    // In production, this would make HTTP request to Pi Network auth endpoint

    try {
      // Mock Pi Network verification
      // Replace with actual Pi Network API call
      const mockVerification = {
        verified: true,
        piAddress: "0x" + crypto.randomBytes(20).toString("hex"),
        piUid: "pi_" + generateId(),
        accessToken: piToken,
        scopes: ["payments", "username", "credits"],
      };

      return mockVerification;
    } catch (error) {
      throw new ApiError("Pi Network token verification failed", 401);
    }
  }

  /**
   * Link soul to user account
   */
  async linkSoul(userId, soulId, signature, message) {
    try {
      // Verify soul ownership
      const soulVerified = await this.verifySoulOwnership(
        soulId,
        signature,
        message,
      );

      if (!soulVerified) {
        throw new ApiError("Soul ownership verification failed", 403);
      }

      // Update user with soul ID
      const users = dbManager.getCollection("users");
      const result = await users.updateOne(
        { userId },
        {
          $set: {
            soulId,
            soulLinkedAt: new Date(),
            "metadata.soulSignature": signature,
            "metadata.soulMessage": message,
          },
          $addToSet: { authMethods: "soul" },
        },
      );

      if (result.matchedCount === 0) {
        throw new ApiError("User not found", 404);
      }

      // Update soul with user ID
      const souls = dbManager.getCollection("souls");
      await souls.updateOne(
        { soulId },
        {
          $set: {
            userId,
            linkedAt: new Date(),
          },
        },
      );

      return { success: true, soulId };
    } catch (error) {
      console.error("Soul linking error:", error);
      throw error;
    }
  }

  /**
   * Verify soul ownership via signature
   */
  async verifySoulOwnership(soulId, signature, message) {
    try {
      // Get soul from database
      const souls = dbManager.getCollection("souls");
      const soul = await souls.findOne({ soulId });

      if (!soul) {
        throw new ApiError("Soul not found", 404);
      }

      // Verify signature against soul's owner address
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      return recoveredAddress.toLowerCase() === soul.owner.toLowerCase();
    } catch (error) {
      console.error("Soul ownership verification error:", error);
      return false;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const users = dbManager.getCollection("users");
    const user = await users.findOne({ userId });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  }

  /**
   * Get user by Pi address
   */
  async getUserByPiAddress(piAddress) {
    const users = dbManager.getCollection("users");
    return await users.findOne({ piAddress: piAddress.toLowerCase() });
  }

  /**
   * Get user by soul ID
   */
  async getUserBySoulId(soulId) {
    const users = dbManager.getCollection("users");
    return await users.findOne({ soulId });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    const users = dbManager.getCollection("users");
    const allowedUpdates = ["username", "email", "avatar", "metadata"];

    const updateData = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError("No valid updates provided", 400);
    }

    updateData.updatedAt = new Date();

    const result = await users.updateOne({ userId }, { $set: updateData });

    if (result.matchedCount === 0) {
      throw new ApiError("User not found", 404);
    }

    return await this.getUserById(userId);
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions() {
    const sessions = dbManager.getCollection("sessions");
    const result = await sessions.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    console.log(`Cleaned ${result.deletedCount} expired sessions`);
    return result.deletedCount;
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const users = dbManager.getCollection("users");
    const sessions = dbManager.getCollection("sessions");

    const [totalUsers, activeUsers, piUsers, soulUsers, activeSessions] =
      await Promise.all([
        users.countDocuments(),
        users.countDocuments({
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
        users.countDocuments({ authMethods: "pi" }),
        users.countDocuments({ authMethods: "soul" }),
        sessions.countDocuments({ expiresAt: { $gt: new Date() } }),
      ]);

    return {
      totalUsers,
      activeUsers,
      piUsers,
      soulUsers,
      activeSessions,
      lastUpdated: new Date(),
    };
  }
}

module.exports = {
  AuthService,
  authService: new AuthService(),
};
