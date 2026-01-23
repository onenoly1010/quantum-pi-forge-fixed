/**
 * Souls Routes
 * Manages OINIO soul operations
 */

const express = require('express');
const router = express.Router();
const { validate, validateParams } = require('../middleware/validate');
const { soulOwnershipMiddleware } = require('../middleware/auth');
const { auditLogger, businessLogger } = require('../middleware/logger');
const { ApiError } = require('../shared/errors');

// Import soul services (these will be created)
const soulService = require('../services/souls');

/**
 * GET /api/souls/:soulId
 * Get soul information
 */
router.get('/:soulId',
  validateParams({ soulId: require('../middleware/validate').validators.validateSoulId }),
  soulOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { soulId } = req.params;
      const soul = await soulService.getSoul(soulId);

      if (!soul) {
        throw new ApiError('Soul not found', 404);
      }

      res.json({
        success: true,
        soul: {
          id: soul.id,
          level: soul.level,
          coherence: soul.coherence,
          traits: soul.traits,
          metadata: soul.metadata,
          createdAt: soul.createdAt,
          lastActivity: soul.lastActivity
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/souls/:soulId
 * Update soul metadata
 */
router.put('/:soulId',
  validateParams({ soulId: require('../middleware/validate').validators.validateSoulId }),
  validate('updateSoul'),
  soulOwnershipMiddleware,
  auditLogger('soul_update'),
  async (req, res, next) => {
    try {
      const { soulId } = req.params;
      const { metadata, preferences } = req.body;

      const updatedSoul = await soulService.updateSoul(soulId, {
        metadata,
        preferences,
        lastActivity: new Date()
      });

      res.json({
        success: true,
        soul: updatedSoul,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/souls/:soulId/infts
 * Get all iNFTs owned by a soul
 */
router.get('/:soulId/infts',
  validateParams({ soulId: require('../middleware/validate').validators.validateSoulId }),
  soulOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { soulId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const infts = await soulService.getSoulINFTs(soulId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        infts: infts.items.map(inft => ({
          id: inft.id,
          tokenId: inft.tokenId,
          personality: inft.personality,
          evolutionLevel: inft.evolutionLevel,
          coherence: inft.coherence,
          traits: inft.traits,
          mintedAt: inft.mintedAt,
          lastInteraction: inft.lastInteraction
        })),
        pagination: {
          page: infts.page,
          limit: infts.limit,
          total: infts.total,
          pages: Math.ceil(infts.total / infts.limit)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/souls/:soulId/oracle-readings
 * Get oracle readings for a soul
 */
router.get('/:soulId/oracle-readings',
  validateParams({ soulId: require('../middleware/validate').validators.validateSoulId }),
  soulOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { soulId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const readings = await soulService.getSoulOracleReadings(soulId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        readings: readings.items.map(reading => ({
          id: reading.id,
          type: reading.type,
          traits: reading.traits,
          coherence: reading.coherence,
          signature: reading.signature,
          createdAt: reading.createdAt
        })),
        pagination: {
          page: readings.page,
          limit: readings.limit,
          total: readings.total,
          pages: Math.ceil(readings.total / readings.limit)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/souls/:soulId/stats
 * Get soul statistics
 */
router.get('/:soulId/stats',
  validateParams({ soulId: require('../middleware/validate').validators.validateSoulId }),
  soulOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { soulId } = req.params;
      const stats = await soulService.getSoulStats(soulId);

      res.json({
        success: true,
        stats: {
          totalINFTs: stats.totalINFTs,
          totalOracleReadings: stats.totalOracleReadings,
          averageCoherence: stats.averageCoherence,
          evolutionEvents: stats.evolutionEvents,
          lastActivity: stats.lastActivity,
          createdAt: stats.createdAt
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/souls/:soulId/verify
 * Verify soul ownership
 */
router.post('/:soulId/verify',
  validateParams({ soulId: require('../middleware/validate').validators.validateSoulId }),
  async (req, res, next) => {
    try {
      const { soulId } = req.params;
      const { signature, message } = req.body;

      const verification = await soulService.verifySoulOwnership(soulId, signature, message);

      res.json({
        success: true,
        verified: verification.verified,
        soulId: verification.soulId,
        verifiedAt: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;