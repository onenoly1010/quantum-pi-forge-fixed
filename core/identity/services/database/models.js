/**
 * Identity Database Models
 * Database schemas and models for identity storage
 * Extracted from oinio-backend repository
 */

// In production, this would use a real database like MongoDB or PostgreSQL
// For now, using in-memory storage with persistence simulation

class IdentityDatabase {
  constructor() {
    this.models = {
      souls: new Map(),
      claims: new Map(),
      profiles: new Map(),
      readings: new Map()
    };
  }

  // Soul model operations
  async createSoul(soulData) {
    const soulId = soulData.soulId;
    this.models.souls.set(soulId, {
      ...soulData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return soulId;
  }

  async getSoul(soulId) {
    return this.models.souls.get(soulId) || null;
  }

  async updateSoul(soulId, updates) {
    const soul = this.models.souls.get(soulId);
    if (soul) {
      this.models.souls.set(soulId, {
        ...soul,
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  async getSoulsByOwner(ownerAddress) {
    const souls = [];
    for (const [soulId, soul] of this.models.souls.entries()) {
      if (soul.owner === ownerAddress) {
        souls.push(soul);
      }
    }
    return souls;
  }

  // Claim model operations
  async createClaim(claimData) {
    const claimId = claimData.claimId;
    this.models.claims.set(claimId, {
      ...claimData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return claimId;
  }

  async getClaim(claimId) {
    return this.models.claims.get(claimId) || null;
  }

  async updateClaim(claimId, updates) {
    const claim = this.models.claims.get(claimId);
    if (claim) {
      this.models.claims.set(claimId, {
        ...claim,
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // Profile model operations
  async createProfile(soulId, profileData) {
    this.models.profiles.set(soulId, {
      soulId,
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return soulId;
  }

  async getProfile(soulId) {
    return this.models.profiles.get(soulId) || null;
  }

  async updateProfile(soulId, updates) {
    const profile = this.models.profiles.get(soulId);
    if (profile) {
      this.models.profiles.set(soulId, {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // Reading model operations
  async createReading(readingData) {
    const readingId = `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.models.readings.set(readingId, {
      readingId,
      ...readingData,
      createdAt: new Date().toISOString()
    });
    return readingId;
  }

  async getReading(readingId) {
    return this.models.readings.get(readingId) || null;
  }

  async getReadingsBySoul(soulId, limit = 50) {
    const readings = [];
    for (const [readingId, reading] of this.models.readings.entries()) {
      if (reading.soulId === soulId) {
        readings.push(reading);
      }
    }
    return readings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Utility methods
  async getStats() {
    return {
      souls: this.models.souls.size,
      claims: this.models.claims.size,
      profiles: this.models.profiles.size,
      readings: this.models.readings.size
    };
  }

  async clearAll() {
    for (const model of Object.values(this.models)) {
      model.clear();
    }
  }
}

module.exports = IdentityDatabase;