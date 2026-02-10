/**
 * Oracle Service
 * Generates and manages quantum oracle readings for soul guidance
 */

const crypto = require("crypto");
const { dbManager } = require("../config/database");
const { ApiError } = require("../shared/errors");
const { generateId, hashData } = require("../shared/utils");
const { getEnvVar } = require("../config/environment");

class OracleService {
  constructor() {
    this.maxReadingsPerHour = parseInt(
      getEnvVar("ORACLE_MAX_READINGS_PER_HOUR", "100"),
    );
    this.cacheTimeout = parseInt(getEnvVar("ORACLE_CACHE_TIMEOUT", "300000")); // 5 minutes
    this.enabled = getEnvVar("ORACLE_ENABLED", "true") === "true";
  }

  /**
   * Generate oracle reading for a soul
   */
  async generateReading(soulId, readingType = "general", options = {}) {
    try {
      if (!this.enabled) {
        throw new ApiError("Oracle service is currently disabled", 503);
      }

      // Check rate limit
      await this.checkRateLimit(soulId);

      // Get soul data for context
      const soul = await this.getSoulForReading(soulId);

      // Generate quantum reading
      const reading = await this.createQuantumReading(
        soul,
        readingType,
        options,
      );

      // Save reading to database
      const oracleReadings = dbManager.getCollection("oracle_readings");
      await oracleReadings.insertOne(reading);

      // Update soul activity
      await this.updateSoulActivity(soulId, "Reading", {
        readingId: reading.readingId,
      });

      return reading;
    } catch (error) {
      console.error("Oracle reading generation error:", error);
      throw error;
    }
  }

  /**
   * Get reading by ID
   */
  async getReadingById(readingId) {
    const oracleReadings = dbManager.getCollection("oracle_readings");
    const reading = await oracleReadings.findOne({ readingId });

    if (!reading) {
      throw new ApiError("Oracle reading not found", 404);
    }

    return reading;
  }

  /**
   * Get readings for a soul
   */
  async getReadingsForSoul(soulId, page = 1, limit = 20) {
    const oracleReadings = dbManager.getCollection("oracle_readings");
    const skip = (page - 1) * limit;

    const [total, readings] = await Promise.all([
      oracleReadings.countDocuments({ soulId }),
      oracleReadings
        .find({ soulId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return {
      readings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Verify reading authenticity
   */
  async verifyReading(readingId, signature, message) {
    try {
      const reading = await this.getReadingById(readingId);

      // Verify the signature matches the reading data
      const readingHash = hashData(
        JSON.stringify({
          readingId: reading.readingId,
          soulId: reading.soulId,
          type: reading.type,
          content: reading.content,
          timestamp: reading.timestamp,
        }),
      );

      const expectedMessage = `Verify Oracle Reading: ${readingHash}`;
      const isValid = await this.verifySignature(
        signature,
        expectedMessage,
        reading.soulId,
      );

      if (isValid) {
        // Mark as verified
        const oracleReadings = dbManager.getCollection("oracle_readings");
        await oracleReadings.updateOne(
          { readingId },
          {
            $set: {
              verified: true,
              verifiedAt: new Date(),
              verificationSignature: signature,
            },
          },
        );
      }

      return { verified: isValid };
    } catch (error) {
      console.error("Reading verification error:", error);
      throw error;
    }
  }

  /**
   * Create quantum reading
   */
  async createQuantumReading(soul, readingType, options) {
    const readingId = generateId();
    const timestamp = Date.now();

    // Generate quantum entropy
    const entropy = await this.generateQuantumEntropy(soul, timestamp);

    // Determine reading type and parameters
    const readingConfig = this.getReadingConfig(readingType);

    // Generate reading content based on type
    const content = await this.generateReadingContent(
      soul,
      entropy,
      readingConfig,
      options,
    );

    // Calculate intensity and resonance
    const intensity = this.calculateIntensity(entropy, soul.level);
    const resonance = this.calculateResonance(soul, content);

    const reading = {
      readingId,
      soulId: soul.soulId,
      type: readingType,
      timestamp,
      createdAt: new Date(),
      content,
      metadata: {
        intensity,
        resonance,
        entropy: entropy.toString("hex"),
        config: readingConfig,
        options,
      },
      verified: false,
      blockchain: {
        recorded: false,
        transactionHash: null,
      },
    };

    return reading;
  }

  /**
   * Generate quantum entropy
   */
  async generateQuantumEntropy(soul, timestamp) {
    // Create entropy from multiple sources
    const sources = [
      soul.soulId,
      soul.owner,
      timestamp.toString(),
      JSON.stringify(soul.metadata),
      crypto.randomBytes(32).toString("hex"),
    ];

    const combined = sources.join("|");
    return crypto.createHash("sha256").update(combined).digest();
  }

  /**
   * Get reading configuration
   */
  getReadingConfig(readingType) {
    const configs = {
      general: {
        aspects: ["past", "present", "future"],
        depth: "medium",
        focus: "holistic",
      },
      love: {
        aspects: ["heart", "connection", "harmony"],
        depth: "deep",
        focus: "relationships",
      },
      career: {
        aspects: ["purpose", "growth", "success"],
        depth: "deep",
        focus: "professional",
      },
      spiritual: {
        aspects: ["soul", "consciousness", "enlightenment"],
        depth: "profound",
        focus: "spiritual",
      },
      health: {
        aspects: ["body", "mind", "spirit"],
        depth: "medium",
        focus: "wellness",
      },
    };

    return configs[readingType] || configs.general;
  }

  /**
   * Generate reading content
   */
  async generateReadingContent(soul, entropy, config, options) {
    // This would integrate with actual quantum/oracle logic
    // For now, generate structured content based on entropy and soul data

    const entropyValue = parseInt(entropy.toString("hex").slice(0, 8), 16);
    const aspects = config.aspects;

    const content = {
      overview: this.generateOverview(entropyValue, soul.level),
      aspects: {},
      guidance: this.generateGuidance(entropyValue, config.focus),
      resonance: this.calculateResonance(soul, { entropy: entropyValue }),
      timestamp: Date.now(),
    };

    // Generate content for each aspect
    for (const aspect of aspects) {
      content.aspects[aspect] = this.generateAspectContent(
        aspect,
        entropyValue,
        soul,
      );
    }

    return content;
  }

  /**
   * Generate overview
   */
  generateOverview(entropy, soulLevel) {
    const patterns = [
      "The quantum field shows strong alignment with your soul's purpose.",
      "Energy patterns indicate a period of significant transformation.",
      "Your soul resonates with ancient wisdom and modern challenges.",
      "The oracle reveals hidden connections between your past and future.",
      "Cosmic energies are aligning to support your highest path.",
    ];

    return patterns[entropy % patterns.length];
  }

  /**
   * Generate aspect content
   */
  generateAspectContent(aspect, entropy, soul) {
    const aspectPatterns = {
      past: [
        "Ancient memories surface, offering wisdom from previous incarnations.",
        "Past experiences have forged the strength you now possess.",
        "Lessons learned create the foundation for your current path.",
      ],
      present: [
        "Current energies support your authentic expression.",
        "You are exactly where you need to be in this moment.",
        "Present circumstances are perfect for your soul's growth.",
      ],
      future: [
        "New possibilities emerge as you align with your true purpose.",
        "The path ahead holds gifts beyond your current imagination.",
        "Future potentials are activated through your present choices.",
      ],
      heart: [
        "Love flows freely when you open your heart completely.",
        "Your capacity for love is infinite and ever-expanding.",
        "Heart connections deepen as you embrace vulnerability.",
      ],
      purpose: [
        "Your unique gifts are needed in the world right now.",
        "Success comes from aligning passion with service.",
        "Your purpose becomes clear through consistent action.",
      ],
    };

    const patterns = aspectPatterns[aspect] || aspectPatterns.present;
    return patterns[entropy % patterns.length];
  }

  /**
   * Generate guidance
   */
  generateGuidance(entropy, focus) {
    const guidancePatterns = {
      holistic: [
        "Trust the unfolding of your soul's journey.",
        "Listen to the whispers of your inner wisdom.",
        "Embrace change as the natural flow of life.",
      ],
      relationships: [
        "Authentic connections begin with self-love.",
        "Communication flows when hearts are open.",
        "Shared experiences create lasting bonds.",
      ],
      professional: [
        "Your skills are perfectly matched to current opportunities.",
        "Leadership emerges from serving others.",
        "Innovation comes from combining old wisdom with new ideas.",
      ],
    };

    const patterns = guidancePatterns[focus] || guidancePatterns.holistic;
    return patterns[entropy % patterns.length];
  }

  /**
   * Calculate intensity
   */
  calculateIntensity(entropy, soulLevel) {
    const entropyValue = parseInt(entropy.toString("hex").slice(0, 4), 16);
    const baseIntensity = (entropyValue / 65535) * 100; // 0-100 scale
    const levelBonus = soulLevel * 2;

    return Math.min(100, Math.max(10, baseIntensity + levelBonus));
  }

  /**
   * Calculate resonance
   */
  calculateResonance(soul, content) {
    // Calculate based on soul traits and reading content
    const traits = soul.metadata.traits || [];
    const traitBonus = traits.length * 5;

    const entropy = content.entropy || 0;
    const entropyResonance = entropy % 100;

    return Math.min(100, Math.max(20, entropyResonance + traitBonus));
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(soulId) {
    const oracleReadings = dbManager.getCollection("oracle_readings");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentReadings = await oracleReadings.countDocuments({
      soulId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentReadings >= this.maxReadingsPerHour) {
      throw new ApiError(
        `Rate limit exceeded: ${this.maxReadingsPerHour} readings per hour`,
        429,
      );
    }
  }

  /**
   * Get soul for reading
   */
  async getSoulForReading(soulId) {
    const souls = dbManager.getCollection("souls");
    const soul = await souls.findOne({ soulId, status: "active" });

    if (!soul) {
      throw new ApiError("Soul not found or inactive", 404);
    }

    return soul;
  }

  /**
   * Update soul activity
   */
  async updateSoulActivity(soulId, activityType, metadata = {}) {
    const souls = dbManager.getCollection("souls");
    await souls.updateOne(
      { soulId },
      {
        $set: { lastActivity: new Date() },
        $inc: { "stats.totalReadings": 1 },
      },
    );
  }

  /**
   * Verify signature (placeholder - would integrate with actual signature verification)
   */
  async verifySignature(signature, message, soulId) {
    // This would verify against the soul's owner address
    // For now, return true for development
    return true;
  }

  /**
   * Get oracle statistics
   */
  async getOracleStats() {
    const oracleReadings = dbManager.getCollection("oracle_readings");

    const [totalReadings, verifiedReadings, readingsLast24h, readingsByType] =
      await Promise.all([
        oracleReadings.countDocuments(),
        oracleReadings.countDocuments({ verified: true }),
        oracleReadings.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        oracleReadings
          .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])
          .toArray(),
      ]);

    return {
      totalReadings,
      verifiedReadings,
      readingsLast24h,
      readingsByType: readingsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      lastUpdated: new Date(),
    };
  }
}

module.exports = {
  OracleService,
  oracleService: new OracleService(),
};
