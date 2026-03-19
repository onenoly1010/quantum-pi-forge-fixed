/**
 * Oracle Routes
 * Handles oracle reading requests and operations
 */

const express = require("express");
const router = express.Router();
const { validate, validateParams } = require("../../middleware/validate");
const { auditLogger, businessLogger } = require("../../middleware/logger");
const { ApiError } = require("../../shared/errors");

// Import oracle service
const { oracleService } = require("../../services/oracle");

/**
 * POST /api/oracle/reading
 * Generate oracle reading for authenticated user
 */
router.post(
  "/reading",
  validate("oracleReading"),
  auditLogger("oracle_reading"),
  businessLogger("oracle_reading_requested"),
  async (req, res, next) => {
    try {
      const { soulId, readingType, context } = req.body;
      const user = req.user;

      // Verify user has access to this soul
      if (user.soul?.id !== soulId && !user.permissions?.canAccessOracle) {
        throw new ApiError("Unauthorized to access this soul", 403);
      }

      const reading = await oracleService.generateReading(soulId, readingType, {
        ...context,
        userId: user.id,
        authMethod: user.authMethod,
      });

      res.json({
        success: true,
        reading: {
          id: reading.id,
          soulId: reading.soulId,
          type: reading.type,
          traits: reading.traits,
          coherence: reading.coherence,
          signature: reading.signature,
          context: reading.context,
          generatedAt: reading.generatedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/oracle/reading/:readingId
 * Get specific oracle reading
 */
router.get(
  "/reading/:readingId",
  validateParams({
    readingId: require("../../middleware/validate").validators
      .validateOracleReadingId,
  }),
  async (req, res, next) => {
    try {
      const { readingId } = req.params;
      const user = req.user;

      const reading = await oracleService.getReading(readingId);

      if (!reading) {
        throw new ApiError("Oracle reading not found", 404);
      }

      // Check ownership
      if (reading.soulId !== user.soul?.id && !user.permissions?.isAdmin) {
        throw new ApiError("Unauthorized to access this reading", 403);
      }

      res.json({
        success: true,
        reading: {
          id: reading.id,
          soulId: reading.soulId,
          type: reading.type,
          traits: reading.traits,
          coherence: reading.coherence,
          signature: reading.signature,
          context: reading.context,
          generatedAt: reading.generatedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/oracle/readings
 * Get user's oracle readings with pagination
 */
router.get("/readings", async (req, res, next) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, type } = req.query;

    if (!user.soul?.id) {
      throw new ApiError("Soul required for oracle readings", 400);
    }

    const readings = await oracleService.getUserReadings(user.soul.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type: type,
    });

    res.json({
      success: true,
      readings: readings.items.map((reading) => ({
        id: reading.id,
        type: reading.type,
        traits: reading.traits,
        coherence: reading.coherence,
        generatedAt: reading.generatedAt,
      })),
      pagination: {
        page: readings.page,
        limit: readings.limit,
        total: readings.total,
        pages: Math.ceil(readings.total / readings.limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/oracle/verify
 * Verify oracle reading signature
 */
router.post("/verify", async (req, res, next) => {
  try {
    const { readingId, signature } = req.body;

    const verification = await oracleService.verifyReading(
      readingId,
      signature,
    );

    res.json({
      success: true,
      verified: verification.verified,
      readingId: verification.readingId,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/oracle/stats
 * Get oracle statistics
 */
router.get("/stats", async (req, res, next) => {
  try {
    const user = req.user;

    // Only allow users with souls to see their stats
    if (!user.soul?.id) {
      throw new ApiError("Soul required for oracle stats", 400);
    }

    const stats = await oracleService.getUserStats(user.soul.id);

    res.json({
      success: true,
      stats: {
        totalReadings: stats.totalReadings,
        averageCoherence: stats.averageCoherence,
        readingTypes: stats.readingTypes,
        lastReading: stats.lastReading,
        coherenceTrend: stats.coherenceTrend,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/oracle/evolution-reading
 * Generate evolution-specific oracle reading
 */
router.post(
  "/evolution-reading",
  validate("oracleReading"),
  auditLogger("evolution_oracle_reading"),
  businessLogger("evolution_reading_requested"),
  async (req, res, next) => {
    try {
      const { soulId, context } = req.body;
      const user = req.user;

      // Verify user has access to this soul
      if (user.soul?.id !== soulId && !user.permissions?.canEvolveINFT) {
        throw new ApiError("Unauthorized to request evolution reading", 403);
      }

      const reading = await oracleService.generateEvolutionReading(soulId, {
        ...context,
        userId: user.id,
        inftId: context?.inftId,
        currentLevel: context?.currentLevel,
      });

      res.json({
        success: true,
        reading: {
          id: reading.id,
          soulId: reading.soulId,
          type: "evolution",
          evolutionPotential: reading.evolutionPotential,
          recommendedTraits: reading.recommendedTraits,
          coherence: reading.coherence,
          signature: reading.signature,
          context: reading.context,
          generatedAt: reading.generatedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
