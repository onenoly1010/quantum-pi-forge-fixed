/**
 * Pi Network Integration Hooks
 * Connect iNFT protocol to Pi Network payments and identity
 * Extracted and adapted for iNFT protocol
 */

class PiHooks {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Handle Pi payment for iNFT minting
   */
  async handlePiMint(piPayment, soulId, ownerAddress) {
    try {
      // Verify Pi payment
      const paymentVerification = await this.verifyPiPayment(piPayment);
      if (!paymentVerification.valid) {
        return {
          success: false,
          error: paymentVerification.error,
        };
      }

      // Generate personality for new iNFT
      const personality =
        await this.orchestrator.personalityGenerator.generateRandom({
          seedTraits: this.extractTraitsFromPiProfile(piPayment.piProfile),
        });

      // Create iNFT creation data
      const inftId = this.generateINFTId(soulId, piPayment.txId);

      // Coordinate iNFT creation
      const creation = await this.orchestrator.coordinateINFTCreation({
        inftId,
        soulId,
        ownerAddress,
        personality: personality.hash,
        piPayment,
        creationMethod: "pi_mint",
      });

      // Store Pi minting memory
      await this.orchestrator.coordinateMemoryOperation(inftId, "store", {
        type: "pi_minting",
        content: `Minted via Pi Network payment from ${piPayment.piProfile.username}`,
        importance: 0.9,
        emotional: 0.7,
        tags: ["pi", "minting", "payment", "genesis"],
        context: {
          piPayment,
          soulId,
          ownerAddress,
          personality: personality.traits,
        },
      });

      return {
        success: true,
        inftId,
        personality,
        creation,
        piPaymentVerified: true,
      };
    } catch (error) {
      console.error("Error handling Pi mint:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle Pi payment for iNFT evolution
   */
  async handlePiEvolution(inftId, piPayment, evolutionType) {
    try {
      // Verify Pi payment
      const paymentVerification = await this.verifyPiPayment(piPayment);
      if (!paymentVerification.valid) {
        return {
          success: false,
          error: paymentVerification.error,
        };
      }

      // Coordinate evolution based on payment
      const evolution = await this.orchestrator.coordinateINFTEvolution(
        inftId,
        {
          type: "pi_powered_evolution",
          intensity: this.calculateEvolutionIntensity(piPayment.amount),
          positivity: 0.9,
          piPayment,
          evolutionTrigger: evolutionType,
        },
      );

      // Store Pi evolution memory
      await this.orchestrator.coordinateMemoryOperation(inftId, "store", {
        type: "pi_evolution",
        content: `Evolved via Pi Network payment - ${evolutionType}`,
        importance: 0.8,
        emotional: 0.6,
        tags: ["pi", "evolution", "payment", "growth"],
        context: {
          piPayment,
          evolution,
          evolutionType,
        },
      });

      return {
        success: true,
        evolution,
        piPaymentVerified: true,
      };
    } catch (error) {
      console.error("Error handling Pi evolution:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process Pi identity for iNFT personalization
   */
  async processPiIdentity(inftId, piProfile) {
    try {
      // Extract traits from Pi profile
      const piTraits = this.extractTraitsFromPiProfile(piProfile);

      // Update iNFT personality with Pi traits
      const personalityUpdate = await this.orchestrator.coordinateINFTEvolution(
        inftId,
        {
          type: "pi_identity_integration",
          intensity: 0.4,
          positivity: 0.8,
          traitUpdates: piTraits,
        },
      );

      // Store Pi identity memory
      await this.orchestrator.coordinateMemoryOperation(inftId, "store", {
        type: "pi_identity",
        content: `Integrated Pi Network identity: ${piProfile.username}`,
        importance: 0.6,
        emotional: 0.4,
        tags: ["pi", "identity", "integration"],
        context: {
          piProfile,
          traitUpdates: piTraits,
        },
      });

      return {
        success: true,
        personalityUpdate,
        traitsIntegrated: piTraits,
      };
    } catch (error) {
      console.error("Error processing Pi identity:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Pi-powered evolution recommendations
   */
  async getPiEvolutionRecommendations(inftId, piProfile) {
    try {
      const recommendations = [];

      // Account age-based recommendations
      if (piProfile.accountAge > 365) {
        // 1+ years
        recommendations.push({
          type: "pi_loyalty_evolution",
          reason: "Long-term Pi Network user - loyalty evolution available",
          priority: "medium",
          expectedGain: 0.08,
          cost: 0.05, // Pi amount
        });
      }

      // Transaction count-based recommendations
      if (piProfile.transactionCount > 100) {
        recommendations.push({
          type: "pi_experience_evolution",
          reason:
            "Experienced Pi Network user - experience evolution available",
          priority: "medium",
          expectedGain: 0.1,
          cost: 0.08,
        });
      }

      // Verification status recommendations
      if (piProfile.verified) {
        recommendations.push({
          type: "pi_verified_evolution",
          reason: "Verified Pi Network user - premium evolution available",
          priority: "high",
          expectedGain: 0.12,
          cost: 0.1,
        });
      }

      return {
        success: true,
        recommendations,
      };
    } catch (error) {
      console.error("Error getting Pi evolution recommendations:", error);
      return {
        success: false,
        error: error.message,
        recommendations: [],
      };
    }
  }

  /**
   * Verify Pi payment
   */
  async verifyPiPayment(piPayment) {
    try {
      // This would integrate with Pi Network SDK
      // Simplified verification for now
      const requiredFields = ["txId", "amount", "fromAddress", "toAddress"];

      for (const field of requiredFields) {
        if (!piPayment[field]) {
          return {
            valid: false,
            error: `Missing required payment field: ${field}`,
          };
        }
      }

      // Verify amount is sufficient
      if (piPayment.amount < 0.01) {
        return {
          valid: false,
          error: "Payment amount too low",
        };
      }

      return {
        valid: true,
        payment: piPayment,
      };
    } catch (error) {
      console.error("Error verifying Pi payment:", error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract personality traits from Pi profile
   */
  extractTraitsFromPiProfile(piProfile) {
    const traits = {};

    // Account age influences conscientiousness
    if (piProfile.accountAge > 365) {
      traits.conscientiousness = Math.min(
        1.0,
        0.5 + (piProfile.accountAge / 365) * 0.1,
      );
    }

    // Transaction count influences extraversion
    if (piProfile.transactionCount > 50) {
      traits.extraversion = Math.min(
        1.0,
        0.4 + (piProfile.transactionCount / 100) * 0.2,
      );
    }

    // Verification status influences trust/agreeableness
    if (piProfile.verified) {
      traits.agreeableness = 0.7;
    }

    // Username creativity (simple heuristic)
    if (piProfile.username && piProfile.username.length > 10) {
      traits.creativity = 0.6;
    }

    return traits;
  }

  /**
   * Calculate evolution intensity from Pi payment amount
   */
  calculateEvolutionIntensity(piAmount) {
    // Base intensity on payment amount
    const baseIntensity = Math.min(1.0, piAmount / 0.1); // Max at 0.1 Pi
    return Math.max(0.3, baseIntensity); // Minimum 0.3
  }

  /**
   * Generate unique iNFT ID
   */
  generateINFTId(soulId, piTxId) {
    // Create deterministic ID from soul and transaction
    const combined = `${soulId}_${piTxId}_${Date.now()}`;
    // Simple hash for demo - in production use proper crypto
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Setup Pi-based evolution triggers
   */
  async setupPiEvolutionTriggers(inftId, piProfile) {
    const triggers = [];

    // Pi milestone trigger
    if (piProfile.transactionCount > 50) {
      const triggerId = await this.orchestrator.evolutionTriggers.createTrigger(
        inftId,
        {
          type: "pi_based",
          condition: { piMilestone: true },
          action: {
            type: "update_coherence",
            coherenceGain: 0.03,
          },
          metadata: { reason: "Pi Network milestone achievement" },
        },
      );
      triggers.push(triggerId);
    }

    return triggers;
  }

  /**
   * Get Pi integration statistics
   */
  getPiIntegrationStats(inftId) {
    // This would track Pi Network interactions
    // Simplified for now
    return {
      totalPiPayments: 0,
      totalPiAmount: 0,
      identityIntegrations: 0,
      lastPiInteraction: null,
    };
  }

  /**
   * Validate Pi payment data
   */
  validatePiPaymentData(piPayment) {
    const errors = [];

    if (!piPayment.txId) {
      errors.push("Transaction ID is required");
    }

    if (!piPayment.amount || piPayment.amount <= 0) {
      errors.push("Valid payment amount is required");
    }

    if (!piPayment.fromAddress) {
      errors.push("Sender address is required");
    }

    if (!piPayment.piProfile) {
      errors.push("Pi profile data is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = PiHooks;
