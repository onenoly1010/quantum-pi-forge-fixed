/**
 * Evolution Parameters Configuration
 * Parameters controlling iNFT evolution mechanics
 */

const evolutionParams = {
  // Base evolution rates
  baseRates: {
    oracleReading: 0.08, // 8% coherence gain per oracle reading
    positiveInteraction: 0.05, // 5% coherence gain per positive interaction
    negativeInteraction: -0.03, // 3% coherence loss per negative interaction
    achievement: 0.1, // 10% coherence gain per achievement
    timeBased: 0.02, // 2% coherence gain per time-based evolution
  },

  // Evolution stage thresholds
  stageThresholds: {
    0: { name: "Initiate", minCoherence: 0, maxCoherence: 20 },
    1: { name: "Seeker", minCoherence: 20, maxCoherence: 35 },
    2: { name: "Apprentice", minCoherence: 35, maxCoherence: 50 },
    3: { name: "Adept", minCoherence: 50, maxCoherence: 65 },
    4: { name: "Guardian", minCoherence: 65, maxCoherence: 75 },
    5: { name: "Elder", minCoherence: 75, maxCoherence: 85 },
    6: { name: "Master", minCoherence: 85, maxCoherence: 92 },
    7: { name: "Transcendent", minCoherence: 92, maxCoherence: 100 },
  },

  // Archetype evolution modifiers
  archetypeModifiers: {
    sage: {
      oracleMultiplier: 1.3, // 30% bonus for oracle readings
      interactionMultiplier: 1.1, // 10% bonus for interactions
      timeMultiplier: 1.2, // 20% bonus for time-based evolution
    },
    warrior: {
      oracleMultiplier: 1.0,
      interactionMultiplier: 1.4, // 40% bonus for interactions
      timeMultiplier: 1.1,
    },
    artist: {
      oracleMultiplier: 1.2, // 20% bonus for oracle readings
      interactionMultiplier: 1.2, // 20% bonus for interactions
      timeMultiplier: 0.9, // 10% penalty for time-based
    },
    scholar: {
      oracleMultiplier: 1.4, // 40% bonus for oracle readings
      interactionMultiplier: 0.9, // 10% penalty for interactions
      timeMultiplier: 1.3, // 30% bonus for time-based
    },
  },

  // Cooldown periods (in milliseconds)
  cooldowns: {
    oracleReading: 24 * 60 * 60 * 1000, // 24 hours
    positiveInteraction: 6 * 60 * 60 * 1000, // 6 hours
    negativeInteraction: 12 * 60 * 60 * 1000, // 12 hours
    achievement: 7 * 24 * 60 * 60 * 1000, // 7 days
    timeBased: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Evolution triggers
  triggers: {
    coherenceThresholds: [25, 50, 75, 90],
    timeIntervals: [
      7 * 24 * 60 * 60 * 1000, // 1 week
      30 * 24 * 60 * 60 * 1000, // 1 month
      90 * 24 * 60 * 60 * 1000, // 3 months
      365 * 24 * 60 * 60 * 1000, // 1 year
    ],
    interactionCounts: [10, 25, 50, 100],
  },

  // Memory consolidation
  memory: {
    maxMemoriesPerINFT: 1000,
    consolidationThreshold: 100,
    consolidationRatio: 0.8, // Keep 80% of memories
    importanceRetention: 0.9, // 90% importance for consolidated memories
  },

  // Trait evolution limits
  traitLimits: {
    maxChangePerEvolution: 0.2, // Max 20% change per evolution
    minChangePerEvolution: 0.01, // Min 1% change per evolution
    maxTraitValue: 1.0,
    minTraitValue: 0.0,
  },

  // Special evolution events
  specialEvents: {
    coherenceMilestone: {
      thresholds: [50, 75, 90, 95, 99],
      bonusMultiplier: 1.5,
    },
    archetypeShift: {
      probability: 0.1, // 10% chance when coherence > 80
      minCoherence: 80,
    },
    breakthrough: {
      probability: 0.05, // 5% chance for exceptional evolution
      bonusRange: [0.1, 0.3],
    },
  },
};

/**
 * Get evolution parameters for specific archetype
 */
function getArchetypeParams(archetype) {
  const baseParams = { ...evolutionParams };
  const modifiers = evolutionParams.archetypeModifiers[archetype];

  if (modifiers) {
    // Apply archetype modifiers to base rates
    Object.keys(baseParams.baseRates).forEach((rateType) => {
      const modifierKey = rateType.toLowerCase() + "Multiplier";
      if (modifiers[modifierKey]) {
        baseParams.baseRates[rateType] *= modifiers[modifierKey];
      }
    });
  }

  return baseParams;
}

/**
 * Get stage info for coherence level
 */
function getStageForCoherence(coherence) {
  const stages = Object.entries(evolutionParams.stageThresholds).sort(
    ([, a], [, b]) => a.minCoherence - b.minCoherence,
  );

  for (const [stage, info] of stages) {
    if (coherence >= info.minCoherence && coherence <= info.maxCoherence) {
      return { stage: parseInt(stage), ...info };
    }
  }

  // Default to highest stage if coherence > max
  const lastStage = stages[stages.length - 1];
  return { stage: parseInt(lastStage[0]), ...lastStage[1] };
}

/**
 * Calculate evolution cooldown
 */
function getEvolutionCooldown(evolutionType, archetype = null) {
  let cooldown = evolutionParams.cooldowns[evolutionType];

  if (!cooldown) {
    cooldown = evolutionParams.cooldowns.timeBased; // Default
  }

  // Apply archetype modifiers if applicable
  if (archetype) {
    const modifiers = evolutionParams.archetypeModifiers[archetype];
    if (modifiers) {
      // Archetypes might have different cooldown preferences
      switch (archetype) {
        case "warrior":
          cooldown *= 0.9; // 10% faster for warriors
          break;
        case "scholar":
          cooldown *= 1.1; // 10% slower for scholars
          break;
      }
    }
  }

  return cooldown;
}

/**
 * Check if evolution is allowed
 */
function canEvolve(evolutionType, lastEvolution, currentCoherence, archetype) {
  const now = Date.now();
  const cooldown = getEvolutionCooldown(evolutionType, archetype);

  // Check cooldown
  if (now - lastEvolution < cooldown) {
    return {
      allowed: false,
      reason: "cooldown_active",
      waitTime: cooldown - (now - lastEvolution),
    };
  }

  // Check coherence requirements
  const minCoherence = evolutionParams.triggers.coherenceThresholds[0] || 0;
  if (currentCoherence < minCoherence) {
    return {
      allowed: false,
      reason: "insufficient_coherence",
      required: minCoherence,
    };
  }

  return { allowed: true };
}

module.exports = {
  evolutionParams,
  getArchetypeParams,
  getStageForCoherence,
  getEvolutionCooldown,
  canEvolve,
};
