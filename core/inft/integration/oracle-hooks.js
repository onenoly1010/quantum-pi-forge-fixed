/**
 * Oracle Integration Hooks
 * Connect iNFT intelligence to Oracle Engine
 * Extracted and adapted for iNFT protocol
 */

class OracleHooks {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Seed iNFT personality from oracle reading
   */
  async seedFromOracle(inftId, oracleReading) {
    try {
      // Generate personality from oracle reading
      const personality =
        await this.orchestrator.personalityGenerator.generateFromOracle(
          oracleReading,
        );

      // Analyze the generated personality
      const analysis = this.orchestrator.personalityAnalyzer.analyzePersonality(
        personality.traits,
      );

      // Store oracle reading as foundational memory
      await this.orchestrator.coordinateMemoryOperation(inftId, "store", {
        type: "oracle_foundation",
        content: `Foundational oracle reading: ${oracleReading.summary}`,
        importance: 1.0, // Maximum importance
        emotional: oracleReading.positivity || 0.8,
        tags: ["oracle", "foundation", "personality", "genesis"],
        context: {
          oracleReading,
          personality: personality.traits,
          archetype: personality.archetype,
        },
      });

      // Set up oracle-based evolution triggers
      await this.setupOracleEvolutionTriggers(inftId, personality);

      return {
        success: true,
        personality,
        analysis,
        triggers: ["oracle_reading", "coherence_threshold", "time_based"],
      };
    } catch (error) {
      console.error("Error seeding iNFT from oracle:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process oracle reading for existing iNFT evolution
   */
  async processOracleReading(inftId, oracleReading) {
    try {
      // Calculate evolution based on oracle reading
      const evolution = await this.orchestrator.coordinateINFTEvolution(
        inftId,
        {
          type: "oracle_reading",
          intensity: oracleReading.intensity || 1.0,
          positivity: oracleReading.positivity || 0.7,
          oracleData: oracleReading,
        },
      );

      // Store oracle reading memory
      await this.orchestrator.coordinateMemoryOperation(inftId, "store", {
        type: "oracle_reading",
        content: `Oracle reading received: ${oracleReading.summary}`,
        importance: 0.8,
        emotional: oracleReading.positivity || 0.5,
        tags: ["oracle", "reading", "evolution"],
        context: {
          oracleReading,
          evolution: evolution.evolution,
        },
      });

      // Update personality based on oracle insights
      if (oracleReading.traits) {
        await this.updatePersonalityFromOracle(inftId, oracleReading.traits);
      }

      return {
        success: true,
        evolution,
        memoryStored: true,
        personalityUpdated: !!oracleReading.traits,
      };
    } catch (error) {
      console.error("Error processing oracle reading:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get oracle-influenced evolution recommendations
   */
  async getOracleEvolutionRecommendations(inftId) {
    try {
      // Get current personality and coherence
      const currentPersonality =
        await this.orchestrator.getCurrentPersonality(inftId);
      const memoryStats =
        this.orchestrator.memoryStorage.getMemoryStats(inftId);

      const recommendations = [];

      // Coherence-based recommendations
      if (currentPersonality.coherence < 0.7) {
        recommendations.push({
          type: "oracle_reading",
          reason: "Low coherence detected - oracle reading recommended",
          priority: "high",
          expectedGain: 0.15,
        });
      }

      // Memory-based recommendations
      if (memoryStats.totalMemories < 10) {
        recommendations.push({
          type: "oracle_guidance",
          reason: "Limited memory database - oracle guidance beneficial",
          priority: "medium",
          expectedGain: 0.1,
        });
      }

      // Archetype-specific recommendations
      const archetypeRecommendations = this.getArchetypeOracleRecommendations(
        currentPersonality.archetype,
      );
      recommendations.push(...archetypeRecommendations);

      return {
        success: true,
        recommendations: recommendations.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
      };
    } catch (error) {
      console.error("Error getting oracle evolution recommendations:", error);
      return {
        success: false,
        error: error.message,
        recommendations: [],
      };
    }
  }

  /**
   * Setup oracle-based evolution triggers
   */
  async setupOracleEvolutionTriggers(inftId, personality) {
    const triggers = [];

    // Oracle coherence trigger
    if (personality.coherence < 0.8) {
      const triggerId = await this.orchestrator.evolutionTriggers.createTrigger(
        inftId,
        {
          type: "oracle_based",
          condition: { coherenceThreshold: 0.8 },
          action: {
            type: "evolve_personality",
            experienceType: "oracle_guidance",
            intensity: 0.8,
          },
          metadata: { reason: "Oracle-guided coherence improvement" },
        },
      );
      triggers.push(triggerId);
    }

    // Oracle wisdom trigger (for sage archetype)
    if (personality.archetype === "sage") {
      const triggerId = await this.orchestrator.evolutionTriggers.createTrigger(
        inftId,
        {
          type: "oracle_based",
          condition: { wisdomAccumulation: true },
          action: {
            type: "update_coherence",
            coherenceGain: 0.1,
          },
          metadata: { reason: "Sage wisdom accumulation" },
        },
      );
      triggers.push(triggerId);
    }

    return triggers;
  }

  /**
   * Update personality from oracle traits
   */
  async updatePersonalityFromOracle(inftId, oracleTraits) {
    try {
      // Evolve personality based on oracle insights
      const evolution = await this.orchestrator.coordinateINFTEvolution(
        inftId,
        {
          type: "oracle_insight",
          intensity: 0.7,
          positivity: 0.8,
          traitUpdates: oracleTraits,
        },
      );

      return {
        success: true,
        evolution,
      };
    } catch (error) {
      console.error("Error updating personality from oracle:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get archetype-specific oracle recommendations
   */
  getArchetypeOracleRecommendations(archetype) {
    const recommendations = {
      sage: [
        {
          type: "oracle_contemplation",
          reason: "Sage benefits from deep oracle contemplation",
          priority: "medium",
          expectedGain: 0.12,
        },
      ],
      warrior: [
        {
          type: "oracle_strategy",
          reason: "Warrior gains tactical insights from oracle",
          priority: "medium",
          expectedGain: 0.1,
        },
      ],
      artist: [
        {
          type: "oracle_inspiration",
          reason: "Artist finds creative inspiration in oracle",
          priority: "high",
          expectedGain: 0.15,
        },
      ],
      scholar: [
        {
          type: "oracle_analysis",
          reason: "Scholar gains analytical insights from oracle",
          priority: "medium",
          expectedGain: 0.11,
        },
      ],
    };

    return recommendations[archetype] || [];
  }

  /**
   * Validate oracle reading for iNFT compatibility
   */
  validateOracleReading(oracleReading) {
    const errors = [];

    if (!oracleReading.summary) {
      errors.push("Oracle reading missing summary");
    }

    if (
      !oracleReading.intensity ||
      oracleReading.intensity < 0 ||
      oracleReading.intensity > 1
    ) {
      errors.push("Invalid oracle reading intensity");
    }

    if (
      oracleReading.positivity !== undefined &&
      (oracleReading.positivity < 0 || oracleReading.positivity > 1)
    ) {
      errors.push("Invalid oracle reading positivity");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get oracle integration statistics
   */
  getOracleIntegrationStats(inftId) {
    // This would track oracle interactions
    // Simplified for now
    return {
      totalOracleReadings: 0,
      averageIntensity: 0,
      coherenceGainFromOracle: 0,
      lastOracleReading: null,
    };
  }
}

module.exports = OracleHooks;
