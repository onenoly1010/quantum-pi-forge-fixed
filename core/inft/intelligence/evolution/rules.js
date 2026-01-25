/**
 * Evolution Rules Engine
 * Defines how iNFTs evolve over time
 * Extracted from mr-nft-agent
 */

class EvolutionRules {
  constructor() {
    this.rules = {
      // Experience-based evolution
      oracle_reading: {
        weight: 1.0,
        traitImpacts: {
          intelligence: 0.05,
          intuition: 0.03,
          openness: 0.02
        },
        cooldown: 24 * 60 * 60 * 1000, // 24 hours
        maxApplications: 10
      },

      interaction_positive: {
        weight: 0.8,
        traitImpacts: {
          empathy: 0.04,
          agreeableness: 0.03,
          extraversion: 0.02
        },
        cooldown: 6 * 60 * 60 * 1000, // 6 hours
        maxApplications: 50
      },

      interaction_negative: {
        weight: 0.6,
        traitImpacts: {
          neuroticism: 0.03,
          adaptability: 0.02,
          conscientiousness: -0.01
        },
        cooldown: 12 * 60 * 60 * 1000, // 12 hours
        maxApplications: 20
      },

      achievement_unlocked: {
        weight: 1.2,
        traitImpacts: {
          conscientiousness: 0.06,
          intelligence: 0.04,
          creativity: 0.03
        },
        cooldown: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxApplications: 5
      },

      // Time-based evolution
      time_passed: {
        weight: 0.3,
        traitImpacts: {
          adaptability: 0.01,
          conscientiousness: 0.005
        },
        cooldown: 24 * 60 * 60 * 1000, // 24 hours
        maxApplications: 365 // 1 year
      },

      // Coherence-based evolution
      coherence_improvement: {
        weight: 0.9,
        traitImpacts: {
          intuition: 0.03,
          intelligence: 0.02,
          creativity: 0.02
        },
        cooldown: 48 * 60 * 60 * 1000, // 48 hours
        maxApplications: 25
      }
    };

    this.archetypeEvolutionPaths = {
      sage: ['intelligence', 'intuition', 'openness'],
      warrior: ['conscientiousness', 'adaptability', 'extraversion'],
      artist: ['creativity', 'openness', 'empathy'],
      scholar: ['intelligence', 'conscientiousness', 'openness']
    };
  }

  /**
   * Calculate evolution from experiences
   */
  calculateEvolution(inft, experiences) {
    const evolution = {
      traitChanges: {},
      coherenceGain: 0,
      experiencePoints: 0,
      validExperiences: 0,
      rejectedExperiences: []
    };

    // Initialize trait changes
    const baseTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism', 'creativity', 'empathy', 'intelligence', 'intuition', 'adaptability'];
    baseTraits.forEach(trait => {
      evolution.traitChanges[trait] = 0;
    });

    // Process each experience
    experiences.forEach(experience => {
      const result = this.processExperience(inft, experience);
      if (result.valid) {
        evolution.validExperiences++;

        // Apply trait changes
        Object.keys(result.traitChanges).forEach(trait => {
          evolution.traitChanges[trait] += result.traitChanges[trait];
        });

        evolution.coherenceGain += result.coherenceGain;
        evolution.experiencePoints += result.experiencePoints;
      } else {
        evolution.rejectedExperiences.push({
          experience,
          reason: result.reason
        });
      }
    });

    // Apply archetype bonus
    this.applyArchetypeBonus(inft, evolution);

    // Calculate final coherence
    evolution.finalCoherence = Math.min(100, inft.coherence + evolution.coherenceGain);

    return evolution;
  }

  /**
   * Process single experience
   */
  processExperience(inft, experience) {
    const rule = this.rules[experience.type];

    if (!rule) {
      return { valid: false, reason: 'Unknown experience type' };
    }

    // Check cooldown
    if (this.checkCooldown(inft, experience, rule)) {
      return { valid: false, reason: 'Cooldown active' };
    }

    // Check max applications
    if (this.checkMaxApplications(inft, experience, rule)) {
      return { valid: false, reason: 'Max applications reached' };
    }

    // Calculate trait changes
    const traitChanges = {};
    const baseImpacts = rule.traitImpacts;

    Object.keys(baseImpacts).forEach(trait => {
      // Apply experience weight and iNFT evolution stage modifier
      const baseChange = baseImpacts[trait];
      const weightMultiplier = rule.weight;
      const stageMultiplier = 1 + (inft.evolutionStage * 0.1); // 10% bonus per stage

      traitChanges[trait] = baseChange * weightMultiplier * stageMultiplier * experience.intensity;
    });

    // Calculate coherence and experience points
    const coherenceGain = this.calculateCoherenceGain(experience, rule);
    const experiencePoints = rule.weight * experience.intensity * 10;

    return {
      valid: true,
      traitChanges,
      coherenceGain,
      experiencePoints
    };
  }

  /**
   * Check if experience is on cooldown
   */
  checkCooldown(inft, experience, rule) {
    // Simplified cooldown check - in production, track per experience type
    const timeSinceLastEvolution = Date.now() - inft.lastEvolution;
    return timeSinceLastEvolution < rule.cooldown;
  }

  /**
   * Check if max applications reached
   */
  checkMaxApplications(inft, experience, rule) {
    // Simplified check - in production, track applications per type
    return false; // Allow unlimited for now
  }

  /**
   * Calculate coherence gain from experience
   */
  calculateCoherenceGain(experience, rule) {
    // Base coherence gain from rule weight and experience intensity
    const baseGain = rule.weight * experience.intensity * 2;

    // Bonus for positive experiences
    const positivityBonus = experience.positivity || 0.5;
    const coherenceBonus = positivityBonus > 0.7 ? 1 : (positivityBonus < 0.3 ? -0.5 : 0);

    return baseGain + coherenceBonus;
  }

  /**
   * Apply archetype-specific evolution bonus
   */
  applyArchetypeBonus(inft, evolution) {
    // Determine current archetype from personality (simplified)
    const archetype = this.determineArchetypeFromTraits(evolution.traitChanges);
    const evolutionPath = this.archetypeEvolutionPaths[archetype];

    if (evolutionPath) {
      // Give bonus to archetype's primary traits
      evolutionPath.forEach(trait => {
        if (evolution.traitChanges[trait]) {
          evolution.traitChanges[trait] *= 1.2; // 20% bonus
        }
      });
    }
  }

  /**
   * Determine archetype from trait changes
   */
  determineArchetypeFromTraits(traitChanges) {
    // Simplified archetype determination
    const scores = {
      sage: (traitChanges.intelligence || 0) + (traitChanges.intuition || 0) + (traitChanges.openness || 0),
      warrior: (traitChanges.conscientiousness || 0) + (traitChanges.adaptability || 0) + (traitChanges.extraversion || 0),
      artist: (traitChanges.creativity || 0) + (traitChanges.openness || 0) + (traitChanges.empathy || 0),
      scholar: (traitChanges.intelligence || 0) + (traitChanges.conscientiousness || 0) + (traitChanges.openness || 0)
    };

    let maxArchetype = 'scholar';
    let maxScore = 0;

    Object.entries(scores).forEach(([archetype, score]) => {
      if (score > maxScore) {
        maxScore = score;
        maxArchetype = archetype;
      }
    });

    return maxArchetype;
  }

  /**
   * Get available evolution triggers
   */
  getAvailableTriggers(inft) {
    const triggers = [];

    // Time-based trigger
    if (Date.now() - inft.lastEvolution > 24 * 60 * 60 * 1000) {
      triggers.push({
        type: 'time_passed',
        description: 'Daily evolution opportunity',
        potentialGain: 0.5
      });
    }

    // Coherence-based trigger
    if (inft.coherence < 80) {
      triggers.push({
        type: 'coherence_improvement',
        description: 'Coherence enhancement available',
        potentialGain: 2.0
      });
    }

    // Achievement-based trigger (simplified)
    if (inft.evolutionStage > 10) {
      triggers.push({
        type: 'achievement_unlocked',
        description: 'Evolution milestone reached',
        potentialGain: 3.0
      });
    }

    return triggers;
  }

  /**
   * Validate evolution parameters
   */
  validateEvolution(inft, evolution) {
    const errors = [];

    // Check trait bounds
    Object.values(evolution.traitChanges).forEach(change => {
      if (Math.abs(change) > 0.5) {
        errors.push('Trait change too large');
      }
    });

    // Check coherence bounds
    if (evolution.finalCoherence < 0 || evolution.finalCoherence > 100) {
      errors.push('Invalid final coherence');
    }

    // Check evolution stage progression
    if (evolution.finalCoherence > 90 && inft.evolutionStage < 10) {
      // Allow faster progression for high coherence
    } else if (evolution.finalCoherence - inft.coherence > 10) {
      errors.push('Coherence gain too large');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get evolution statistics
   */
  getEvolutionStats(inft) {
    return {
      currentStage: inft.evolutionStage,
      maxStage: 100,
      coherence: inft.coherence,
      daysSinceLastEvolution: Math.floor((Date.now() - inft.lastEvolution) / (24 * 60 * 60 * 1000)),
      availableTriggers: this.getAvailableTriggers(inft).length,
      archetypePath: this.archetypeEvolutionPaths[this.determineArchetypeFromTraits(inft.personality || {})]
    };
  }
}

module.exports = EvolutionRules;