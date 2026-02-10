/**
 * iNFT Service
 * Manages intelligent NFT creation, evolution, and memory systems
 */

const { ethers } = require("ethers");
const { dbManager } = require("../config/database");
const { ApiError } = require("../shared/errors");
const { generateId, hashData, retry } = require("../shared/utils");
const { getEnvVar } = require("../config/environment");

class INFTService {
  constructor() {
    this.maxEvolutionLevel = parseInt(
      getEnvVar("INFT_MAX_EVOLUTION_LEVEL", "10"),
    );
    this.evolutionCooldown = parseInt(
      getEnvVar("INFT_EVOLUTION_COOLDOWN", "86400000"),
    ); // 24 hours
    this.metadataCacheTimeout = parseInt(
      getEnvVar("INFT_METADATA_CACHE_TIMEOUT", "3600000"),
    ); // 1 hour
    this.ipfsGateway = getEnvVar(
      "IPFS_GATEWAY",
      "https://gateway.pinata.cloud/ipfs/",
    );
  }

  /**
   * Mint a new iNFT
   */
  async mintINFT(soulId, oracleReadingId, metadata = {}) {
    try {
      // Validate inputs
      const soul = await this.getSoulForMinting(soulId);
      const oracleReading =
        await this.getOracleReadingForMinting(oracleReadingId);

      // Check if soul owns the oracle reading
      if (oracleReading.soulId !== soulId) {
        throw new ApiError("Oracle reading does not belong to this soul", 403);
      }

      // Generate iNFT data
      const inftData = await this.generateINFTData(
        soul,
        oracleReading,
        metadata,
      );

      // Save to database
      const infts = dbManager.getCollection("infts");
      await infts.insertOne(inftData);

      // Update soul activity
      await this.updateSoulActivity(soulId, "INFTCreation", {
        inftId: inftData.tokenId,
      });

      return inftData;
    } catch (error) {
      console.error("iNFT minting error:", error);
      throw error;
    }
  }

  /**
   * Get iNFT by token ID
   */
  async getINFTById(tokenId) {
    const infts = dbManager.getCollection("infts");
    const inft = await infts.findOne({ tokenId });

    if (!inft) {
      throw new ApiError("iNFT not found", 404);
    }

    return inft;
  }

  /**
   * Get iNFTs by soul ID
   */
  async getINFTsBySoul(soulId, page = 1, limit = 20) {
    const infts = dbManager.getCollection("infts");
    const skip = (page - 1) * limit;

    const [total, inftsList] = await Promise.all([
      infts.countDocuments({ soulId }),
      infts
        .find({ soulId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return {
      infts: inftsList,
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
   * Get iNFTs by owner
   */
  async getINFTsByOwner(ownerAddress, page = 1, limit = 20) {
    const infts = dbManager.getCollection("infts");
    const skip = (page - 1) * limit;

    const [total, inftsList] = await Promise.all([
      infts.countDocuments({ owner: ownerAddress.toLowerCase() }),
      infts
        .find({ owner: ownerAddress.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return {
      infts: inftsList,
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
   * Evolve iNFT
   */
  async evolveINFT(tokenId, evolutionData, signature, message) {
    try {
      // Get iNFT
      const inft = await this.getINFTById(tokenId);

      // Verify ownership
      const isOwner = await this.verifyINFTOwnership(
        tokenId,
        signature,
        message,
      );
      if (!isOwner) {
        throw new ApiError("Unauthorized: Not the iNFT owner", 403);
      }

      // Check evolution requirements
      const canEvolve = await this.checkEvolutionRequirements(inft);
      if (!canEvolve.canEvolve) {
        throw new ApiError(
          `Evolution requirements not met: ${canEvolve.reason}`,
          400,
        );
      }

      // Check cooldown
      if (inft.lastEvolutionAt) {
        const timeSinceLastEvolution =
          Date.now() - inft.lastEvolutionAt.getTime();
        if (timeSinceLastEvolution < this.evolutionCooldown) {
          const remainingTime = Math.ceil(
            (this.evolutionCooldown - timeSinceLastEvolution) /
              (1000 * 60 * 60),
          );
          throw new ApiError(
            `Evolution cooldown active. Try again in ${remainingTime} hours.`,
            429,
          );
        }
      }

      // Perform evolution
      const evolvedINFT = await this.performEvolution(inft, evolutionData);

      // Update database
      const infts = dbManager.getCollection("infts");
      await infts.updateOne(
        { tokenId },
        {
          $set: {
            ...evolvedINFT,
            evolvedAt: new Date(),
            lastEvolutionAt: new Date(),
          },
          $inc: { evolutionLevel: 1 },
          $push: {
            evolutionHistory: {
              level: evolvedINFT.evolutionLevel,
              timestamp: new Date(),
              changes: evolutionData.changes,
              oracleReadingId: evolutionData.oracleReadingId,
            },
          },
        },
      );

      // Update soul activity
      await this.updateSoulActivity(inft.soulId, "Evolution", {
        inftId: tokenId,
      });

      return await this.getINFTById(tokenId);
    } catch (error) {
      console.error("iNFT evolution error:", error);
      throw error;
    }
  }

  /**
   * Get iNFT memory
   */
  async getINFTMemory(tokenId) {
    const inft = await this.getINFTById(tokenId);

    return {
      tokenId: inft.tokenId,
      memory: inft.memory || [],
      evolutionHistory: inft.evolutionHistory || [],
      stats: {
        totalMemories: inft.memory?.length || 0,
        evolutionLevel: inft.evolutionLevel,
        lastActivity: inft.lastActivity,
      },
    };
  }

  /**
   * Add memory to iNFT
   */
  async addINFTMemory(tokenId, memoryData, signature, message) {
    try {
      // Verify ownership
      const isOwner = await this.verifyINFTOwnership(
        tokenId,
        signature,
        message,
      );
      if (!isOwner) {
        throw new ApiError("Unauthorized: Not the iNFT owner", 403);
      }

      const memoryEntry = {
        id: generateId(),
        type: memoryData.type || "experience",
        content: memoryData.content,
        timestamp: new Date(),
        metadata: memoryData.metadata || {},
        signature,
      };

      const infts = dbManager.getCollection("infts");
      await infts.updateOne(
        { tokenId },
        {
          $push: { memory: memoryEntry },
          $set: { lastActivity: new Date() },
        },
      );

      return memoryEntry;
    } catch (error) {
      console.error("iNFT memory addition error:", error);
      throw error;
    }
  }

  /**
   * Transfer iNFT
   */
  async transferINFT(tokenId, newOwner, signature, message) {
    try {
      // Verify current ownership
      const isOwner = await this.verifyINFTOwnership(
        tokenId,
        signature,
        message,
      );
      if (!isOwner) {
        throw new ApiError("Unauthorized: Not the iNFT owner", 403);
      }

      // Validate new owner address
      if (!ethers.isAddress(newOwner)) {
        throw new ApiError("Invalid new owner address", 400);
      }

      const infts = dbManager.getCollection("infts");
      const result = await infts.updateOne(
        { tokenId },
        {
          $set: {
            owner: newOwner.toLowerCase(),
            transferredAt: new Date(),
            previousOwner: (await this.getINFTById(tokenId)).owner,
          },
        },
      );

      if (result.matchedCount === 0) {
        throw new ApiError("iNFT not found", 404);
      }

      return await this.getINFTById(tokenId);
    } catch (error) {
      console.error("iNFT transfer error:", error);
      throw error;
    }
  }

  /**
   * Generate iNFT data
   */
  async generateINFTData(soul, oracleReading, metadata) {
    const tokenId = generateId();
    const entropy = await this.generateINFTEntropy(soul, oracleReading);

    // Generate attributes based on soul and oracle data
    const attributes = await this.generateAttributes(
      soul,
      oracleReading,
      entropy,
    );

    // Generate personality traits
    const personality = await this.generatePersonality(soul, oracleReading);

    // Generate visual traits
    const visualTraits = await this.generateVisualTraits(entropy, attributes);

    const inftData = {
      tokenId,
      soulId: soul.soulId,
      owner: soul.owner,
      createdAt: new Date(),
      lastActivity: new Date(),
      evolutionLevel: 1,
      attributes,
      personality,
      visualTraits,
      metadata: {
        name: metadata.name || `iNFT ${tokenId.slice(-8)}`,
        description:
          metadata.description ||
          `An intelligent NFT born from soul ${soul.soulId}`,
        oracleReadingId: oracleReading.readingId,
        entropy: entropy.toString("hex"),
        ...metadata,
      },
      memory: [],
      evolutionHistory: [],
      stats: {
        totalInteractions: 0,
        totalMemories: 0,
        totalEvolutions: 0,
      },
      blockchain: {
        minted: false,
        contractAddress: null,
        transactionHash: null,
        tokenId: null,
      },
    };

    return inftData;
  }

  /**
   * Generate iNFT entropy
   */
  async generateINFTEntropy(soul, oracleReading) {
    const sources = [
      soul.soulId,
      soul.owner,
      oracleReading.readingId,
      JSON.stringify(oracleReading.content),
      Date.now().toString(),
    ];

    const combined = sources.join("|");
    return require("crypto").createHash("sha256").update(combined).digest();
  }

  /**
   * Generate attributes
   */
  async generateAttributes(soul, oracleReading, entropy) {
    const entropyValue = parseInt(entropy.toString("hex").slice(0, 8), 16);

    return {
      wisdom: (entropyValue % 100) + soul.level * 2,
      empathy: ((entropyValue >> 8) % 100) + soul.stats.totalReadings,
      creativity: ((entropyValue >> 16) % 100) + soul.stats.totalINFTs * 5,
      resilience: ((entropyValue >> 24) % 100) + soul.experience / 10,
      intuition: (entropyValue % 50) + 50, // Base intuition
      harmony: Math.min(100, soul.level * 10 + (entropyValue % 20)),
    };
  }

  /**
   * Generate personality
   */
  async generatePersonality(soul, oracleReading) {
    const traits = [
      "curious",
      "wise",
      "creative",
      "compassionate",
      "intuitive",
      "harmonious",
    ];
    const selectedTraits = [];

    // Select 3 traits based on soul data
    const soulHash = require("crypto")
      .createHash("md5")
      .update(soul.soulId)
      .digest("hex");
    for (let i = 0; i < 3; i++) {
      const index =
        parseInt(soulHash.slice(i * 2, i * 2 + 2), 16) % traits.length;
      selectedTraits.push(traits[index]);
      traits.splice(index, 1);
    }

    return {
      traits: selectedTraits,
      temperament: selectedTraits.includes("intuitive")
        ? "mystical"
        : "balanced",
      growth: "evolving",
    };
  }

  /**
   * Generate visual traits
   */
  async generateVisualTraits(entropy, attributes) {
    const colors = [
      "cosmic_blue",
      "ethereal_gold",
      "quantum_purple",
      "soul_green",
      "harmony_pink",
    ];
    const patterns = [
      "flowing",
      "geometric",
      "organic",
      "crystalline",
      "ethereal",
    ];

    const entropyValue = parseInt(entropy.toString("hex").slice(0, 4), 16);

    return {
      primaryColor: colors[entropyValue % colors.length],
      secondaryColor: colors[(entropyValue >> 4) % colors.length],
      pattern: patterns[entropyValue % patterns.length],
      intensity: Math.min(100, 50 + attributes.intuition / 2),
      rarity: this.calculateRarity(attributes),
    };
  }

  /**
   * Calculate rarity
   */
  calculateRarity(attributes) {
    const totalScore = Object.values(attributes).reduce(
      (sum, attr) => sum + attr,
      0,
    );
    const averageScore = totalScore / Object.keys(attributes).length;

    if (averageScore >= 90) return "legendary";
    if (averageScore >= 75) return "epic";
    if (averageScore >= 60) return "rare";
    if (averageScore >= 45) return "uncommon";
    return "common";
  }

  /**
   * Check evolution requirements
   */
  async checkEvolutionRequirements(inft) {
    const requirements = this.getEvolutionRequirements(inft.evolutionLevel);

    // Check if max level reached
    if (inft.evolutionLevel >= this.maxEvolutionLevel) {
      return { canEvolve: false, reason: "Maximum evolution level reached" };
    }

    // Check memory requirements
    if (inft.memory.length < requirements.memoryCount) {
      return {
        canEvolve: false,
        reason: `Need ${requirements.memoryCount} memories, have ${inft.memory.length}`,
      };
    }

    // Check time requirements
    const timeSinceCreation = Date.now() - inft.createdAt.getTime();
    if (timeSinceCreation < requirements.minAge) {
      const remainingDays = Math.ceil(
        (requirements.minAge - timeSinceCreation) / (1000 * 60 * 60 * 24),
      );
      return {
        canEvolve: false,
        reason: `iNFT needs to be ${remainingDays} days old to evolve`,
      };
    }

    return { canEvolve: true };
  }

  /**
   * Get evolution requirements
   */
  getEvolutionRequirements(currentLevel) {
    return {
      memoryCount: currentLevel * 3,
      minAge: currentLevel * 7 * 24 * 60 * 60 * 1000, // days in milliseconds
      requiredInteractions: currentLevel * 10,
    };
  }

  /**
   * Perform evolution
   */
  async performEvolution(inft, evolutionData) {
    // Enhance attributes
    const attributeBoost = Math.floor(inft.evolutionLevel / 2) + 1;

    const evolvedAttributes = {};
    for (const [key, value] of Object.entries(inft.attributes)) {
      evolvedAttributes[key] = Math.min(100, value + attributeBoost);
    }

    // Evolve personality
    const evolvedPersonality = {
      ...inft.personality,
      traits: [...inft.personality.traits, evolutionData.newTrait || "evolved"],
      growth: "advanced",
    };

    // Update visual traits
    const evolvedVisualTraits = {
      ...inft.visualTraits,
      intensity: Math.min(100, inft.visualTraits.intensity + 10),
      rarity: this.calculateRarity(evolvedAttributes),
    };

    return {
      attributes: evolvedAttributes,
      personality: evolvedPersonality,
      visualTraits: evolvedVisualTraits,
      evolutionLevel: inft.evolutionLevel + 1,
    };
  }

  /**
   * Verify iNFT ownership
   */
  async verifyINFTOwnership(tokenId, signature, message) {
    try {
      const inft = await this.getINFTById(tokenId);
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      return recoveredAddress.toLowerCase() === inft.owner.toLowerCase();
    } catch (error) {
      console.error("iNFT ownership verification error:", error);
      return false;
    }
  }

  /**
   * Get soul for minting
   */
  async getSoulForMinting(soulId) {
    const souls = dbManager.getCollection("souls");
    const soul = await souls.findOne({ soulId, status: "active" });

    if (!soul) {
      throw new ApiError("Soul not found or inactive", 404);
    }

    return soul;
  }

  /**
   * Get oracle reading for minting
   */
  async getOracleReadingForMinting(readingId) {
    const oracleReadings = dbManager.getCollection("oracle_readings");
    const reading = await oracleReadings.findOne({ readingId });

    if (!reading) {
      throw new ApiError("Oracle reading not found", 404);
    }

    return reading;
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
        $inc: { "stats.totalINFTs": 1 },
      },
    );
  }

  /**
   * Get iNFT statistics
   */
  async getINFTStats() {
    const infts = dbManager.getCollection("infts");

    const [totalINFTs, inftsByRarity, averageLevel, totalEvolutions] =
      await Promise.all([
        infts.countDocuments(),
        infts
          .aggregate([
            { $group: { _id: "$visualTraits.rarity", count: { $sum: 1 } } },
          ])
          .toArray(),
        infts
          .aggregate([
            { $group: { _id: null, avgLevel: { $avg: "$evolutionLevel" } } },
          ])
          .next(),
        infts
          .aggregate([
            {
              $group: { _id: null, total: { $sum: "$stats.totalEvolutions" } },
            },
          ])
          .next(),
      ]);

    return {
      totalINFTs,
      inftsByRarity: inftsByRarity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageEvolutionLevel: averageLevel?.avgLevel || 1,
      totalEvolutions: totalEvolutions?.total || 0,
      lastUpdated: new Date(),
    };
  }
}

module.exports = {
  INFTService,
  inftService: new INFTService(),
};
