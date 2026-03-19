/**
 * Pi Network Identity - User Resolution
 * Resolves Pi users and retrieves profile information
 */

class PiUserResolver {
  constructor() {
    this.apiBaseUrl = process.env.PI_API_BASE_URL || "https://api.pi.network";
    this.cache = new Map(); // Simple in-memory cache
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Resolve Pi user by username
   */
  async resolveUser(username) {
    if (!username) {
      throw new Error("Username is required");
    }

    // Check cache first
    const cached = this.getCachedUser(username);
    if (cached) {
      return cached;
    }

    // In demo mode, return mock data
    if (username === "demo_user") {
      const demoUser = {
        username: "demo_user",
        uid: "demo_uid_123",
        profile: {
          displayName: "Demo User",
          avatar: null,
          verified: false,
        },
        stats: {
          accountAge: 365, // days
          transactionCount: 10,
        },
      };

      this.setCachedUser(username, demoUser);
      return demoUser;
    }

    try {
      // Fetch user data from Pi Platform API
      const response = await fetch(`${this.apiBaseUrl}/v1/user/${username}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pi user not found");
        }
        throw new Error(`Failed to resolve user: ${response.status}`);
      }

      const userData = await response.json();

      // Cache the result
      this.setCachedUser(username, userData);

      return userData;
    } catch (error) {
      console.error("Error resolving Pi user:", error);
      throw error;
    }
  }

  /**
   * Get cached user data
   */
  getCachedUser(username) {
    const cached = this.cache.get(username);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Remove expired cache entry
    if (cached) {
      this.cache.delete(username);
    }

    return null;
  }

  /**
   * Set cached user data
   */
  setCachedUser(username, userData) {
    this.cache.set(username, {
      data: userData,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear user cache
   */
  clearCache(username = null) {
    if (username) {
      this.cache.delete(username);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Validate Pi username format
   */
  validateUsername(username) {
    if (!username) return false;

    // Pi usernames are typically alphanumeric with underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Get user profile with additional metadata
   */
  async getUserProfile(username) {
    const user = await this.resolveUser(username);

    // Add computed metadata
    const profile = {
      ...user,
      metadata: {
        isNewUser: this.isNewUser(user),
        trustScore: this.calculateTrustScore(user),
        lastActive: user.lastActive || new Date().toISOString(),
      },
    };

    return profile;
  }

  /**
   * Check if user is new (less than 30 days old)
   */
  isNewUser(user) {
    if (!user.stats || !user.stats.accountAge) return true;

    return user.stats.accountAge < 30;
  }

  /**
   * Calculate trust score based on user data
   */
  calculateTrustScore(user) {
    let score = 0.5; // Base score

    // Account age bonus
    if (user.stats && user.stats.accountAge) {
      score += Math.min(user.stats.accountAge / 365, 0.3); // Max 0.3 for 1+ year
    }

    // Transaction count bonus
    if (user.stats && user.stats.transactionCount) {
      score += Math.min(user.stats.transactionCount / 100, 0.2); // Max 0.2 for 100+ tx
    }

    // Verification bonus
    if (user.profile && user.profile.verified) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }
}

export default PiUserResolver;
