/**
 * Soul Profile Management Service
 * Manages soul metadata, traits, and profile data
 * Extracted from oinio-backend repository
 */

const SoulResolutionService = require('./resolution/soul-resolution');

class SoulProfileService {
  constructor() {
    this.resolutionService = new SoulResolutionService();
    // In production, this would connect to a database
    this.profileStore = new Map(); // Temporary in-memory store
  }

  /**
   * Get complete soul profile
   */
  async getSoulProfile(soulId) {
    try {
      // Get basic soul data from contract
      const soulData = await this.resolutionService.getSoulDetails(soulId);

      if (!soulData.found) {
        return { found: false, error: soulData.error };
      }

      // Get extended profile data from store
      const extendedProfile = this.profileStore.get(soulId) || {};

      // Combine contract data with profile data
      const profile = {
        ...soulData,
        ...extendedProfile,
        // Ensure we have all required fields
        traits: extendedProfile.traits || this.getDefaultTraits(),
        metadata: extendedProfile.metadata || {},
        achievements: extendedProfile.achievements || [],
        preferences: extendedProfile.preferences || {}
      };

      return { found: true, profile };
    } catch (error) {
      console.error('Error getting soul profile:', error);
      return { found: false, error: error.message };
    }
  }

  /**
   * Update soul profile
   */
  async updateSoulProfile(soulId, updates, ownerAddress) {
    try {
      // Verify ownership
      const soulData = await this.resolutionService.getSoulDetails(soulId);
      if (!soulData.found || soulData.owner !== ownerAddress) {
        return { success: false, error: 'Unauthorized or soul not found' };
      }

      // Get current profile
      const currentProfile = this.profileStore.get(soulId) || {};

      // Update profile
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // Store updated profile
      this.profileStore.set(soulId, updatedProfile);

      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Error updating soul profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update soul traits (oracle function)
   */
  async updateSoulTraits(soulId, traits) {
    try {
      const currentProfile = this.profileStore.get(soulId) || {};

      const updatedProfile = {
        ...currentProfile,
        traits: { ...currentProfile.traits, ...traits },
        lastTraitUpdate: new Date().toISOString()
      };

      this.profileStore.set(soulId, updatedProfile);

      return { success: true, traits: updatedProfile.traits };
    } catch (error) {
      console.error('Error updating soul traits:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get soul reading history
   */
  async getSoulReadingHistory(soulId, limit = 10) {
    try {
      const profile = this.profileStore.get(soulId);

      if (!profile || !profile.readingHistory) {
        return { history: [] };
      }

      // Return most recent readings
      const history = profile.readingHistory
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      return { history };
    } catch (error) {
      console.error('Error getting soul reading history:', error);
      return { history: [], error: error.message };
    }
  }

  /**
   * Add reading to history
   */
  async addReadingToHistory(soulId, readingData) {
    try {
      const profile = this.profileStore.get(soulId) || {};
      const readingHistory = profile.readingHistory || [];

      const newReading = {
        ...readingData,
        timestamp: new Date().toISOString(),
        readingId: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      readingHistory.unshift(newReading); // Add to beginning

      // Keep only last 100 readings
      if (readingHistory.length > 100) {
        readingHistory.splice(100);
      }

      profile.readingHistory = readingHistory;
      this.profileStore.set(soulId, profile);

      return { success: true, reading: newReading };
    } catch (error) {
      console.error('Error adding reading to history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get default traits for new souls
   */
  getDefaultTraits() {
    return {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
      creativity: 0.5,
      empathy: 0.5,
      intelligence: 0.5
    };
  }

  /**
   * Search souls by traits
   */
  async searchSoulsByTraits(traitFilters, limit = 20) {
    try {
      const results = [];

      for (const [soulId, profile] of this.profileStore.entries()) {
        if (results.length >= limit) break;

        const traits = profile.traits || {};
        let matches = true;

        // Check if soul matches all trait filters
        for (const [trait, range] of Object.entries(traitFilters)) {
          const value = traits[trait];
          if (value === undefined ||
              value < range.min ||
              value > range.max) {
            matches = false;
            break;
          }
        }

        if (matches) {
          results.push({
            soulId,
            traits,
            coherence: profile.coherence || 0.5
          });
        }
      }

      return { results };
    } catch (error) {
      console.error('Error searching souls by traits:', error);
      return { results: [], error: error.message };
    }
  }
}

module.exports = SoulProfileService;