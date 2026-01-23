/**
 * Soul Service
 * Manages OINIO soul entities and their lifecycle
 */

const { ethers } = require('ethers');
const { dbManager } = require('../config/database');
const { ApiError } = require('../shared/errors');
const { generateId, hashData, verifySignature } = require('../shared/utils');

class SoulService {
  constructor() {
    this.maxSoulsPerUser = 5; // Limit souls per user
    this.soulContractAddress = process.env.SOUL_REGISTRY_ADDRESS;
  }

  /**
   * Create a new soul
   */
  async createSoul(ownerAddress, metadata = {}) {
    try {
      // Validate owner address
      if (!ethers.isAddress(ownerAddress)) {
        throw new ApiError('Invalid owner address', 400);
      }

      // Check soul limit per user
      const existingSouls = await this.getSoulsByOwner(ownerAddress);
      if (existingSouls.length >= this.maxSoulsPerUser) {
        throw new ApiError(`Maximum ${this.maxSoulsPerUser} souls allowed per user`, 400);
      }

      const soulId = generateId();
      const soul = {
        soulId,
        owner: ownerAddress.toLowerCase(),
        createdAt: new Date(),
        lastActivity: new Date(),
        status: 'active',
        level: 1,
        experience: 0,
        metadata: {
          name: metadata.name || `Soul ${soulId.slice(-8)}`,
          description: metadata.description || 'A quantum soul in the Pi Forge',
          traits: metadata.traits || [],
          attributes: metadata.attributes || {},
          ...metadata
        },
        stats: {
          totalReadings: 0,
          totalINFTs: 0,
          totalEvolution: 0,
          lastReadingAt: null,
          createdINFTs: []
        },
        blockchain: {
          registered: false,
          transactionHash: null,
          blockNumber: null
        }
      };

      const souls = dbManager.getCollection('souls');
      await souls.insertOne(soul);

      return soul;
    } catch (error) {
      console.error('Soul creation error:', error);
      throw error;
    }
  }

  /**
   * Get soul by ID
   */
  async getSoulById(soulId) {
    const souls = dbManager.getCollection('souls');
    const soul = await souls.findOne({ soulId });

    if (!soul) {
      throw new ApiError('Soul not found', 404);
    }

    return soul;
  }

  /**
   * Get souls by owner
   */
  async getSoulsByOwner(ownerAddress) {
    const souls = dbManager.getCollection('souls');
    return await souls.find({
      owner: ownerAddress.toLowerCase(),
      status: 'active'
    }).sort({ createdAt: -1 }).toArray();
  }

  /**
   * Update soul metadata
   */
  async updateSoulMetadata(soulId, updates, signature, message) {
    try {
      // Verify ownership
      const isOwner = await this.verifySoulOwnership(soulId, signature, message);
      if (!isOwner) {
        throw new ApiError('Unauthorized: Not the soul owner', 403);
      }

      const souls = dbManager.getCollection('souls');
      const allowedUpdates = ['name', 'description', 'traits', 'attributes'];

      const updateData = {};
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          updateData[`metadata.${key}`] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new ApiError('No valid metadata updates provided', 400);
      }

      updateData.updatedAt = new Date();

      const result = await souls.updateOne(
        { soulId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new ApiError('Soul not found', 404);
      }

      return await this.getSoulById(soulId);
    } catch (error) {
      console.error('Soul metadata update error:', error);
      throw error;
    }
  }

  /**
   * Update soul activity
   */
  async updateSoulActivity(soulId, activityType, metadata = {}) {
    const souls = dbManager.getCollection('souls');

    const updateData = {
      lastActivity: new Date(),
      [`stats.last${activityType}At`]: new Date()
    };

    // Update specific stats based on activity type
    switch (activityType) {
      case 'Reading':
        updateData.$inc = { 'stats.totalReadings': 1 };
        break;
      case 'INFTCreation':
        updateData.$inc = { 'stats.totalINFTs': 1 };
        updateData.$push = { 'stats.createdINFTs': metadata.inftId };
        break;
      case 'Evolution':
        updateData.$inc = { 'stats.totalEvolution': 1, level: 1 };
        break;
    }

    await souls.updateOne({ soulId }, updateData);
  }

  /**
   * Verify soul ownership
   */
  async verifySoulOwnership(soulId, signature, message) {
    try {
      const soul = await this.getSoulById(soulId);
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      return recoveredAddress.toLowerCase() === soul.owner.toLowerCase();
    } catch (error) {
      console.error('Soul ownership verification error:', error);
      return false;
    }
  }

  /**
   * Transfer soul ownership
   */
  async transferSoul(soulId, newOwner, signature, message) {
    try {
      // Verify current ownership
      const isOwner = await this.verifySoulOwnership(soulId, signature, message);
      if (!isOwner) {
        throw new ApiError('Unauthorized: Not the soul owner', 403);
      }

      // Validate new owner address
      if (!ethers.isAddress(newOwner)) {
        throw new ApiError('Invalid new owner address', 400);
      }

      // Check soul limit for new owner
      const existingSouls = await this.getSoulsByOwner(newOwner);
      if (existingSouls.length >= this.maxSoulsPerUser) {
        throw new ApiError(`New owner already has maximum ${this.maxSoulsPerUser} souls`, 400);
      }

      const souls = dbManager.getCollection('souls');
      const result = await souls.updateOne(
        { soulId },
        {
          $set: {
            owner: newOwner.toLowerCase(),
            transferredAt: new Date(),
            previousOwner: (await this.getSoulById(soulId)).owner
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new ApiError('Soul not found', 404);
      }

      return await this.getSoulById(soulId);
    } catch (error) {
      console.error('Soul transfer error:', error);
      throw error;
    }
  }

  /**
   * Deactivate soul
   */
  async deactivateSoul(soulId, signature, message) {
    try {
      // Verify ownership
      const isOwner = await this.verifySoulOwnership(soulId, signature, message);
      if (!isOwner) {
        throw new ApiError('Unauthorized: Not the soul owner', 403);
      }

      const souls = dbManager.getCollection('souls');
      const result = await souls.updateOne(
        { soulId },
        {
          $set: {
            status: 'inactive',
            deactivatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new ApiError('Soul not found', 404);
      }

      return { success: true, soulId };
    } catch (error) {
      console.error('Soul deactivation error:', error);
      throw error;
    }
  }

  /**
   * Get soul statistics
   */
  async getSoulStats(soulId) {
    const soul = await this.getSoulById(soulId);
    return soul.stats;
  }

  /**
   * Get soul evolution requirements
   */
  getEvolutionRequirements(currentLevel) {
    const baseExperience = 100;
    const experienceMultiplier = 1.5;

    const requiredExperience = Math.floor(baseExperience * Math.pow(experienceMultiplier, currentLevel - 1));

    return {
      currentLevel,
      nextLevel: currentLevel + 1,
      requiredExperience,
      requirements: [
        `Complete ${requiredExperience} total activities`,
        'Maintain active status for 30 days',
        'Generate at least 10 oracle readings',
        'Create 5 iNFTs'
      ]
    };
  }

  /**
   * Check if soul can evolve
   */
  async canSoulEvolve(soulId) {
    const soul = await this.getSoulById(soulId);
    const requirements = this.getEvolutionRequirements(soul.level);

    const canEvolve =
      soul.stats.totalReadings >= 10 &&
      soul.stats.totalINFTs >= 5 &&
      soul.experience >= requirements.requiredExperience &&
      soul.status === 'active';

    return {
      canEvolve,
      currentLevel: soul.level,
      requirements: requirements,
      progress: {
        experience: soul.experience,
        readings: soul.stats.totalReadings,
        infts: soul.stats.totalINFTs
      }
    };
  }

  /**
   * Get souls with pagination
   */
  async getSoulsPaginated(page = 1, limit = 20, filters = {}) {
    const souls = dbManager.getCollection('souls');

    const query = { status: 'active', ...filters };
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      souls.countDocuments(query),
      souls.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Search souls by metadata
   */
  async searchSouls(searchTerm, filters = {}) {
    const souls = dbManager.getCollection('souls');

    const query = {
      status: 'active',
      ...filters,
      $or: [
        { 'metadata.name': { $regex: searchTerm, $options: 'i' } },
        { 'metadata.description': { $regex: searchTerm, $options: 'i' } },
        { soulId: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    return await souls.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
  }
}

module.exports = {
  SoulService,
  soulService: new SoulService()
};