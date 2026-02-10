/**
 * iNFT Routes
 * Handles iNFT minting, evolution, and management
 */

const express = require("express");
const router = express.Router();
const { validate, validateParams } = require("../../middleware/validate");
const { inftOwnershipMiddleware } = require("../../middleware/auth");
const { auditLogger, businessLogger } = require("../../middleware/logger");
const { ApiError } = require("../../shared/errors");

// Import iNFT services
const { inftService } = require("../../services/inft");

/**
 * POST /api/inft/mint
 * Mint new iNFT with personality from oracle reading
 */
router.post(
  "/mint",
  validate("mintINFT"),
  auditLogger("inft_mint"),
  businessLogger("inft_mint_initiated"),
  async (req, res, next) => {
    try {
      const { oracleReadingId, paymentTxHash, metadata } = req.body;
      const user = req.user;

      // Verify user permissions
      if (!user.permissions?.canMintINFT) {
        throw new ApiError("Minting permission required", 403);
      }

      const mintResult = await inftService.mintINFT(
        user.soulId || "dummy_soul",
        oracleReadingId,
        metadata || {},
      );

      res.status(201).json({
        success: true,
        inft: {
          id: mintResult.inft.id,
          tokenId: mintResult.inft.tokenId,
          soulId: mintResult.inft.soulId,
          personality: mintResult.inft.personality,
          evolutionLevel: mintResult.inft.evolutionLevel,
          coherence: mintResult.inft.coherence,
          traits: mintResult.inft.traits,
          metadata: mintResult.inft.metadata,
          mintedAt: mintResult.inft.mintedAt,
        },
        transaction: {
          hash: mintResult.transaction.hash,
          blockNumber: mintResult.transaction.blockNumber,
          gasUsed: mintResult.transaction.gasUsed,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/inft/:inftId
 * Get iNFT information
 */
router.get(
  "/:inftId",
  validateParams({
    inftId: require("../../middleware/validate").validators.validateInftId,
  }),
  inftOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { inftId } = req.params;

      const inft = await evolutionService.getINFT(inftId);

      if (!inft) {
        throw new ApiError("iNFT not found", 404);
      }

      res.json({
        success: true,
        inft: {
          id: inft.id,
          tokenId: inft.tokenId,
          soulId: inft.soulId,
          personality: inft.personality,
          evolutionLevel: inft.evolutionLevel,
          coherence: inft.coherence,
          traits: inft.traits,
          memory: inft.memory,
          metadata: inft.metadata,
          mintedAt: inft.mintedAt,
          lastInteraction: inft.lastInteraction,
          evolutionHistory: inft.evolutionHistory,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/inft/:inftId/evolve
 * Trigger iNFT evolution
 */
router.post(
  "/:inftId/evolve",
  validateParams({
    inftId: require("../../middleware/validate").validators.validateInftId,
  }),
  validate("evolveINFT"),
  inftOwnershipMiddleware,
  auditLogger("inft_evolution"),
  businessLogger("inft_evolution_initiated"),
  async (req, res, next) => {
    try {
      const { inftId } = req.params;
      const { interactionData } = req.body;
      const user = req.user;

      // Verify user permissions
      if (!user.permissions?.canEvolveINFT) {
        throw new ApiError("Evolution permission required", 403);
      }

      const evolutionResult = await evolutionService.evolveINFT(inftId, {
        ...interactionData,
        userId: user.id,
        soulId: user.soul?.id,
        requestId: req.requestId,
      });

      res.json({
        success: true,
        evolution: {
          inftId: evolutionResult.inftId,
          previousLevel: evolutionResult.previousLevel,
          newLevel: evolutionResult.newLevel,
          evolvedTraits: evolutionResult.evolvedTraits,
          coherenceChange: evolutionResult.coherenceChange,
          trigger: evolutionResult.trigger,
          evolvedAt: evolutionResult.evolvedAt,
        },
        inft: {
          personality: evolutionResult.inft.personality,
          evolutionLevel: evolutionResult.inft.evolutionLevel,
          coherence: evolutionResult.inft.coherence,
          traits: evolutionResult.inft.traits,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/inft/:inftId/interact
 * Record interaction with iNFT
 */
router.post(
  "/:inftId/interact",
  validateParams({
    inftId: require("../../middleware/validate").validators.validateInftId,
  }),
  inftOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { inftId } = req.params;
      const { interactionType, data } = req.body;
      const user = req.user;

      const interaction = await evolutionService.recordInteraction(inftId, {
        type: interactionType,
        data,
        userId: user.id,
        timestamp: new Date(),
        requestId: req.requestId,
      });

      res.json({
        success: true,
        interaction: {
          id: interaction.id,
          inftId: interaction.inftId,
          type: interaction.type,
          data: interaction.data,
          recordedAt: interaction.recordedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/inft/:inftId/memory
 * Get iNFT memory and interaction history
 */
router.get(
  "/:inftId/memory",
  validateParams({
    inftId: require("../../middleware/validate").validators.validateInftId,
  }),
  inftOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { inftId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const memory = await evolutionService.getINFTMemory(inftId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        memory: {
          inftId: memory.inftId,
          totalInteractions: memory.totalInteractions,
          recentInteractions: memory.recentInteractions,
          memoryPatterns: memory.memoryPatterns,
          coherence: memory.coherence,
        },
        interactions: memory.interactions.map((interaction) => ({
          id: interaction.id,
          type: interaction.type,
          data: interaction.data,
          recordedAt: interaction.recordedAt,
        })),
        pagination: {
          page: memory.page,
          limit: memory.limit,
          total: memory.total,
          pages: Math.ceil(memory.total / memory.limit),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/inft/:inftId/evolution-history
 * Get iNFT evolution history
 */
router.get(
  "/:inftId/evolution-history",
  validateParams({
    inftId: require("../../middleware/validate").validators.validateInftId,
  }),
  inftOwnershipMiddleware,
  async (req, res, next) => {
    try {
      const { inftId } = req.params;

      const history = await evolutionService.getEvolutionHistory(inftId);

      res.json({
        success: true,
        inftId,
        evolutionHistory: history.map((event) => ({
          level: event.level,
          evolvedAt: event.evolvedAt,
          trigger: event.trigger,
          traits: event.traits,
          coherence: event.coherence,
          metadata: event.metadata,
        })),
        totalEvolutions: history.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/inft/marketplace
 * Get marketplace listings (public endpoint)
 */
router.get("/marketplace", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = "recent", archetype } = req.query;

    const listings = await evolutionService.getMarketplaceListings({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      archetype,
    });

    res.json({
      success: true,
      listings: listings.items.map((listing) => ({
        inftId: listing.inftId,
        tokenId: listing.tokenId,
        personality: listing.personality,
        evolutionLevel: listing.evolutionLevel,
        coherence: listing.coherence,
        price: listing.price,
        currency: listing.currency,
        listedAt: listing.listedAt,
      })),
      pagination: {
        page: listings.page,
        limit: listings.limit,
        total: listings.total,
        pages: Math.ceil(listings.total / listings.limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
