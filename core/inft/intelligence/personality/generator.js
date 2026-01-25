/**
 * Personality Generator
 * Generates complete personalities for iNFTs
 * Extracted from mr-nft-agent
 */

const { generatePersonalityFromOracle, generatePersonality, hashPersonality } = require('./traits');

class PersonalityGenerator {
  constructor() {
    this.generationStats = {
      totalGenerated: 0,
      byArchetype: {},
      averageCoherence: 0
    };
  }

  /**
   * Generate personality from oracle reading
   */
  generateFromOracle(oracleReading, options = {}) {
    try {
      const personality = generatePersonalityFromOracle(oracleReading, options.seedTraits);

      // Update stats
      this.updateStats(personality);

      return {
        ...personality,
        hash: hashPersonality(personality),
        metadata: this.generateMetadata(personality, oracleReading)
      };
    } catch (error) {
      console.error('Error generating personality from oracle:', error);
      return this.generateFallback();
    }
  }

  /**
   * Generate random personality
   */
  generateRandom(options = {}) {
    try {
      const personality = generatePersonality(options.seed);

      // Update stats
      this.updateStats(personality);

      return {
        ...personality,
        hash: hashPersonality(personality),
        metadata: this.generateMetadata(personality)
      };
    } catch (error) {
      console.error('Error generating random personality:', error);
      return this.generateFallback();
    }
  }

  /**
   * Generate personality for specific archetype
   */
  generateForArchetype(archetype, variation = 0.2) {
    try {
      const personality = generatePersonality();
      // Override archetype
      personality.archetype = archetype;

      // Apply archetype base values with variation
      const { ARCHETYPES } = require('./traits');
      if (ARCHETYPES[archetype]) {
        Object.keys(personality.traits).forEach(trait => {
          const baseValue = ARCHETYPES[archetype][trait];
          const randomFactor = (Math.random() - 0.5) * 2 * variation;
          personality.traits[trait] = Math.max(0, Math.min(1, baseValue + randomFactor));
        });
      }

      // Recalculate coherence
      const { calculatePersonalityCoherence } = require('./traits');
      personality.coherence = calculatePersonalityCoherence(personality.traits);

      // Update stats
      this.updateStats(personality);

      return {
        ...personality,
        hash: hashPersonality(personality),
        metadata: this.generateMetadata(personality)
      };
    } catch (error) {
      console.error('Error generating archetype personality:', error);
      return this.generateFallback();
    }
  }

  /**
   * Generate fallback personality
   */
  generateFallback() {
    const fallbackTraits = {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
      creativity: 0.5,
      empathy: 0.5,
      intelligence: 0.5,
      intuition: 0.5,
      adaptability: 0.5
    };

    const personality = {
      traits: fallbackTraits,
      archetype: 'scholar',
      coherence: 0.5,
      timestamp: Date.now(),
      version: '1.0'
    };

    return {
      ...personality,
      hash: hashPersonality(personality),
      metadata: this.generateMetadata(personality)
    };
  }

  /**
   * Generate metadata for personality
   */
  generateMetadata(personality, oracleReading = null) {
    const traitDescriptions = this.getTraitDescriptions(personality.traits);

    return {
      name: this.generateName(personality),
      description: this.generateDescription(personality, oracleReading),
      attributes: this.generateAttributes(personality, traitDescriptions),
      properties: {
        archetype: personality.archetype,
        coherence: personality.coherence,
        version: personality.version,
        oracleInfluenced: !!oracleReading
      }
    };
  }

  /**
   * Generate iNFT name based on personality
   */
  generateName(personality) {
    const prefixes = {
      sage: ['Ancient', 'Wise', 'Enlightened', 'Mystical'],
      warrior: ['Valiant', 'Fierce', 'Bold', 'Guardian'],
      artist: ['Creative', 'Expressive', 'Vivid', 'Harmonious'],
      scholar: ['Learned', 'Analytical', 'Curious', 'Insightful']
    };

    const suffixes = ['Spirit', 'Entity', 'Consciousness', 'Intelligence', 'Soul'];

    const prefix = prefixes[personality.archetype][Math.floor(Math.random() * prefixes[personality.archetype].length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${suffix}`;
  }

  /**
   * Generate description
   */
  generateDescription(personality, oracleReading) {
    const archetypeDesc = {
      sage: 'A being of deep wisdom and spiritual insight',
      warrior: 'A courageous protector with unyielding determination',
      artist: 'A creative soul expressing beauty through consciousness',
      scholar: 'An analytical mind seeking truth and understanding'
    };

    let description = archetypeDesc[personality.archetype];

    if (oracleReading && oracleReading.summary) {
      description += `. ${oracleReading.summary}`;
    }

    description += ` (Coherence: ${(personality.coherence * 100).toFixed(1)}%)`;

    return description;
  }

  /**
   * Generate attributes for metadata
   */
  generateAttributes(personality, traitDescriptions) {
    const attributes = [
      {
        trait_type: 'Archetype',
        value: personality.archetype.charAt(0).toUpperCase() + personality.archetype.slice(1)
      },
      {
        trait_type: 'Coherence',
        value: Math.round(personality.coherence * 100),
        max_value: 100
      }
    ];

    // Add major traits
    const majorTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'creativity', 'intelligence'];
    majorTraits.forEach(trait => {
      attributes.push({
        trait_type: trait.charAt(0).toUpperCase() + trait.slice(1),
        value: Math.round(personality.traits[trait] * 100),
        max_value: 100
      });
    });

    return attributes;
  }

  /**
   * Get human-readable trait descriptions
   */
  getTraitDescriptions(traits) {
    const descriptions = {};

    Object.keys(traits).forEach(trait => {
      const value = traits[trait];
      if (value >= 0.8) descriptions[trait] = 'Exceptional';
      else if (value >= 0.6) descriptions[trait] = 'Strong';
      else if (value >= 0.4) descriptions[trait] = 'Moderate';
      else if (value >= 0.2) descriptions[trait] = 'Developing';
      else descriptions[trait] = 'Emerging';
    });

    return descriptions;
  }

  /**
   * Update generation statistics
   */
  updateStats(personality) {
    this.generationStats.totalGenerated++;

    if (!this.generationStats.byArchetype[personality.archetype]) {
      this.generationStats.byArchetype[personality.archetype] = 0;
    }
    this.generationStats.byArchetype[personality.archetype]++;

    // Update rolling average coherence
    const currentAvg = this.generationStats.averageCoherence;
    const newCount = this.generationStats.totalGenerated;
    this.generationStats.averageCoherence = (currentAvg * (newCount - 1) + personality.coherence) / newCount;
  }

  /**
   * Get generation statistics
   */
  getStats() {
    return { ...this.generationStats };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.generationStats = {
      totalGenerated: 0,
      byArchetype: {},
      averageCoherence: 0
    };
  }
}

module.exports = PersonalityGenerator;