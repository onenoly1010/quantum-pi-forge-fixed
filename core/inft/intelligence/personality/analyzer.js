/**
 * Personality Analyzer
 * Analyzes and compares personalities
 * Extracted from mr-nft-agent
 */

const {
  analyzeCompatibility,
  calculatePersonalityCoherence,
  determineArchetype,
} = require("./traits");

class PersonalityAnalyzer {
  constructor() {
    this.analysisCache = new Map();
  }

  /**
   * Analyze single personality
   */
  analyzePersonality(personality) {
    const cacheKey = `single_${JSON.stringify(personality.traits)}`;

    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const analysis = {
      archetype: determineArchetype(personality.traits),
      coherence: calculatePersonalityCoherence(personality.traits),
      strengths: this.identifyStrengths(personality.traits),
      weaknesses: this.identifyWeaknesses(personality.traits),
      balance: this.calculateBalance(personality.traits),
      potential: this.assessPotential(personality.traits),
      traits: this.categorizeTraits(personality.traits),
    };

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  /**
   * Compare two personalities
   */
  comparePersonalities(personality1, personality2) {
    const cacheKey = `compare_${JSON.stringify(personality1.traits)}_${JSON.stringify(personality2.traits)}`;

    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const comparison = {
      compatibility: analyzeCompatibility(personality1, personality2),
      similarities: this.findSimilarities(
        personality1.traits,
        personality2.traits,
      ),
      differences: this.findDifferences(
        personality1.traits,
        personality2.traits,
      ),
      complementary: this.findComplementaryTraits(
        personality1.traits,
        personality2.traits,
      ),
      archetypeRelationship: this.analyzeArchetypeRelationship(
        determineArchetype(personality1.traits),
        determineArchetype(personality2.traits),
      ),
    };

    this.analysisCache.set(cacheKey, comparison);
    return comparison;
  }

  /**
   * Analyze personality evolution potential
   */
  analyzeEvolutionPotential(currentPersonality, targetTraits) {
    const analysis = {
      currentCoherence: calculatePersonalityCoherence(
        currentPersonality.traits,
      ),
      targetCoherence: calculatePersonalityCoherence(targetTraits),
      improvementAreas: this.findImprovementAreas(
        currentPersonality.traits,
        targetTraits,
      ),
      evolutionPath: this.suggestEvolutionPath(
        currentPersonality.traits,
        targetTraits,
      ),
      estimatedSteps: this.estimateEvolutionSteps(
        currentPersonality.traits,
        targetTraits,
      ),
    };

    return analysis;
  }

  /**
   * Identify personality strengths
   */
  identifyStrengths(traits) {
    const strengths = [];
    const thresholds = {
      exceptional: 0.8,
      strong: 0.6,
    };

    Object.entries(traits).forEach(([trait, value]) => {
      if (value >= thresholds.exceptional) {
        strengths.push({ trait, level: "exceptional", value });
      } else if (value >= thresholds.strong) {
        strengths.push({ trait, level: "strong", value });
      }
    });

    return strengths.sort((a, b) => b.value - a.value);
  }

  /**
   * Identify personality weaknesses
   */
  identifyWeaknesses(traits) {
    const weaknesses = [];
    const threshold = 0.3;

    Object.entries(traits).forEach(([trait, value]) => {
      if (value <= threshold) {
        weaknesses.push({ trait, value });
      }
    });

    return weaknesses.sort((a, b) => a.value - b.value);
  }

  /**
   * Calculate personality balance
   */
  calculateBalance(traits) {
    const traitValues = Object.values(traits);
    const mean = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
    const variance =
      traitValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      traitValues.length;

    // Return balance score (0-1, higher is more balanced)
    return Math.max(0, 1 - variance * 4);
  }

  /**
   * Assess evolution potential
   */
  assessPotential(traits) {
    const coherence = calculatePersonalityCoherence(traits);
    const balance = this.calculateBalance(traits);
    const adaptability = traits.adaptability || 0.5;

    // Potential based on current coherence, balance, and adaptability
    return coherence * 0.4 + balance * 0.3 + adaptability * 0.3;
  }

  /**
   * Categorize traits
   */
  categorizeTraits(traits) {
    const categories = {
      emotional: ["extraversion", "agreeableness", "neuroticism"],
      cognitive: ["openness", "intelligence", "creativity"],
      social: ["empathy", "adaptability"],
      executive: ["conscientiousness", "intuition"],
    };

    const categorized = {};

    Object.entries(categories).forEach(([category, traitList]) => {
      categorized[category] = {};
      traitList.forEach((trait) => {
        if (traits[trait] !== undefined) {
          categorized[category][trait] = traits[trait];
        }
      });
    });

    return categorized;
  }

  /**
   * Find similarities between personalities
   */
  findSimilarities(traits1, traits2) {
    const similarities = [];
    const threshold = 0.1; // Within 10%

    Object.keys(traits1).forEach((trait) => {
      if (traits2[trait] !== undefined) {
        const diff = Math.abs(traits1[trait] - traits2[trait]);
        if (diff <= threshold) {
          similarities.push({
            trait,
            value1: traits1[trait],
            value2: traits2[trait],
            difference: diff,
          });
        }
      }
    });

    return similarities.sort((a, b) => a.difference - b.difference);
  }

  /**
   * Find differences between personalities
   */
  findDifferences(traits1, traits2) {
    const differences = [];

    Object.keys(traits1).forEach((trait) => {
      if (traits2[trait] !== undefined) {
        const diff = Math.abs(traits1[trait] - traits2[trait]);
        differences.push({
          trait,
          value1: traits1[trait],
          value2: traits2[trait],
          difference: diff,
        });
      }
    });

    return differences.sort((a, b) => b.difference - a.difference);
  }

  /**
   * Find complementary traits
   */
  findComplementaryTraits(traits1, traits2) {
    const complementary = [];

    Object.keys(traits1).forEach((trait) => {
      if (traits2[trait] !== undefined) {
        const avg = (traits1[trait] + traits2[trait]) / 2;
        // Complementary when one is high and one is low, averaging to moderate
        if (
          avg >= 0.4 &&
          avg <= 0.6 &&
          Math.abs(traits1[trait] - traits2[trait]) >= 0.3
        ) {
          complementary.push({
            trait,
            value1: traits1[trait],
            value2: traits2[trait],
            average: avg,
          });
        }
      }
    });

    return complementary;
  }

  /**
   * Analyze archetype relationship
   */
  analyzeArchetypeRelationship(archetype1, archetype2) {
    const relationships = {
      "sage-warrior": "Dynamic tension between wisdom and action",
      "sage-artist": "Harmonious blend of insight and expression",
      "sage-scholar": "Intellectual synergy",
      "warrior-artist": "Creative action and bold expression",
      "warrior-scholar": "Strategic thinking and decisive action",
      "artist-scholar": "Imaginative analysis and creative insight",
    };

    if (archetype1 === archetype2) {
      return "Perfect harmony - same archetype";
    }

    const key = [archetype1, archetype2].sort().join("-");
    return relationships[key] || "Unique combination with growth potential";
  }

  /**
   * Find areas for improvement
   */
  findImprovementAreas(currentTraits, targetTraits) {
    const improvements = [];

    Object.keys(currentTraits).forEach((trait) => {
      if (targetTraits[trait] !== undefined) {
        const current = currentTraits[trait];
        const target = targetTraits[trait];
        const diff = target - current;

        if (diff > 0.1) {
          // Significant improvement needed
          improvements.push({
            trait,
            current,
            target,
            improvement: diff,
            priority: diff > 0.3 ? "high" : "medium",
          });
        }
      }
    });

    return improvements.sort((a, b) => b.improvement - a.improvement);
  }

  /**
   * Suggest evolution path
   */
  suggestEvolutionPath(currentTraits, targetTraits) {
    const improvements = this.findImprovementAreas(currentTraits, targetTraits);

    // Group by priority and suggest phased approach
    const highPriority = improvements.filter((i) => i.priority === "high");
    const mediumPriority = improvements.filter((i) => i.priority === "medium");

    return {
      phases: [
        {
          name: "Foundation",
          traits: highPriority.slice(0, 2),
          duration: "2-3 weeks",
        },
        {
          name: "Development",
          traits: [...highPriority.slice(2), ...mediumPriority.slice(0, 2)],
          duration: "4-6 weeks",
        },
        {
          name: "Refinement",
          traits: mediumPriority.slice(2),
          duration: "Ongoing",
        },
      ],
      totalEstimatedTime: this.estimateEvolutionTime(improvements),
    };
  }

  /**
   * Estimate evolution steps
   */
  estimateEvolutionSteps(currentTraits, targetTraits) {
    const totalDiff = Object.keys(currentTraits).reduce((sum, trait) => {
      if (targetTraits[trait] !== undefined) {
        return sum + Math.abs(targetTraits[trait] - currentTraits[trait]);
      }
      return sum;
    }, 0);

    // Rough estimate: 0.1 trait change per step
    return Math.ceil(totalDiff / 0.1);
  }

  /**
   * Estimate evolution time
   */
  estimateEvolutionTime(improvements) {
    const totalImprovement = improvements.reduce(
      (sum, i) => sum + i.improvement,
      0,
    );
    // Rough estimate: 1 week per 0.2 improvement
    const weeks = Math.ceil(totalImprovement / 0.2);
    return `${weeks} weeks`;
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.analysisCache.size,
      keys: Array.from(this.analysisCache.keys()).slice(0, 5), // Sample keys
    };
  }
}

module.exports = PersonalityAnalyzer;
