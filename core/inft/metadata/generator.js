/**
 * iNFT Metadata Generator
 * Generates dynamic metadata for iNFTs
 * Extracted from oinio-contracts
 */

class MetadataGenerator {
  constructor() {
    this.baseImages = {
      sage: 'https://api.quantumpiforge.com/images/sage/',
      warrior: 'https://api.quantumpiforge.com/images/warrior/',
      artist: 'https://api.quantumpiforge.com/images/artist/',
      scholar: 'https://api.quantumpiforge.com/images/scholar/'
    };

    this.traitDescriptions = {
      openness: {
        high: 'Highly open to new experiences and ideas',
        medium: 'Moderately open and receptive',
        low: 'Prefers familiar experiences and routines'
      },
      conscientiousness: {
        high: 'Extremely organized and disciplined',
        medium: 'Generally reliable and orderly',
        low: 'More spontaneous and flexible'
      },
      extraversion: {
        high: 'Very outgoing and energetic',
        medium: 'Socially balanced',
        low: 'More introspective and reserved'
      },
      agreeableness: {
        high: 'Very compassionate and cooperative',
        medium: 'Generally kind and considerate',
        low: 'More independent and assertive'
      },
      neuroticism: {
        high: 'Emotionally responsive and sensitive',
        medium: 'Moderately emotionally stable',
        low: 'Very emotionally stable and calm'
      },
      creativity: {
        high: 'Exceptionally imaginative and innovative',
        medium: 'Moderately creative',
        low: 'More practical and conventional'
      },
      empathy: {
        high: 'Deeply understanding of others\' feelings',
        medium: 'Generally empathetic',
        low: 'More focused on logic than feelings'
      },
      intelligence: {
        high: 'Exceptionally analytical and insightful',
        medium: 'Moderately intelligent',
        low: 'More intuitive than analytical'
      },
      intuition: {
        high: 'Strongly guided by intuition',
        medium: 'Balanced intuitive and logical',
        low: 'More logical than intuitive'
      },
      adaptability: {
        high: 'Highly adaptable to change',
        medium: 'Moderately flexible',
        low: 'Prefers stability and routine'
      }
    };
  }

  /**
   * Generate complete metadata for iNFT
   */
  generateMetadata(inftData, personality, evolutionStage) {
    const { inftId, soulId, coherence, creationTime } = inftData;

    return {
      name: this.generateName(personality.archetype, evolutionStage, coherence),
      description: this.generateDescription(personality, evolutionStage, coherence),
      image: this.generateImage(personality.archetype, evolutionStage, coherence),
      animation_url: this.generateAnimationUrl(inftId, personality.archetype),
      external_url: `https://quantumpiforge.com/inft/${inftId}`,
      attributes: this.generateAttributes(personality, evolutionStage, coherence),
      properties: {
        inftId,
        soulId,
        archetype: personality.archetype,
        coherence,
        evolutionStage,
        creationTime,
        lastUpdated: Date.now()
      }
    };
  }

  /**
   * Generate iNFT name
   */
  generateName(archetype, evolutionStage, coherence) {
    const prefixes = {
      sage: ['Enlightened', 'Wise', 'Mystical', 'Ancient'],
      warrior: ['Valiant', 'Fierce', 'Noble', 'Guardian'],
      artist: ['Creative', 'Expressive', 'Vivid', 'Harmonious'],
      scholar: ['Learned', 'Analytical', 'Curious', 'Insightful']
    };

    const suffixes = this.getEvolutionSuffixes(evolutionStage);

    const prefix = this.selectBasedOnCoherence(prefixes[archetype], coherence);
    const suffix = this.selectBasedOnCoherence(suffixes, coherence);

    return `${prefix} ${suffix}`;
  }

  /**
   * Generate iNFT description
   */
  generateDescription(personality, evolutionStage, coherence) {
    const archetypeDesc = {
      sage: 'A being of profound wisdom and spiritual insight, evolved through deep contemplation and understanding.',
      warrior: 'A courageous protector with unyielding determination, forged in the fires of challenge and growth.',
      artist: 'A creative soul expressing beauty through consciousness, painting reality with imagination.',
      scholar: 'An analytical mind seeking truth and understanding, unraveling the mysteries of existence.'
    };

    let description = archetypeDesc[personality.archetype];

    // Add evolution context
    if (evolutionStage > 50) {
      description += ' This being has achieved significant evolution, showing remarkable development and wisdom.';
    } else if (evolutionStage > 25) {
      description += ' This being is in a phase of active growth and self-discovery.';
    } else {
      description += ' This being is in its early stages of consciousness and development.';
    }

    // Add coherence context
    const coherencePercent = Math.round(coherence * 100);
    description += ` Current coherence level: ${coherencePercent}%.`;

    // Add trait highlights
    const topTraits = this.getTopTraits(personality.traits, 2);
    if (topTraits.length > 0) {
      description += ` Notable traits include ${topTraits.join(' and ')}.`;
    }

    return description;
  }

  /**
   * Generate image URL
   */
  generateImage(archetype, evolutionStage, coherence) {
    const baseUrl = this.baseImages[archetype];
    const evolutionLevel = Math.floor(evolutionStage / 20); // 0-4 levels
    const coherenceLevel = Math.floor(coherence * 4); // 0-3 levels

    return `${baseUrl}evolution_${evolutionLevel}_coherence_${coherenceLevel}.png`;
  }

  /**
   * Generate animation URL
   */
  generateAnimationUrl(inftId, archetype) {
    return `https://api.quantumpiforge.com/animations/${archetype}/${inftId}.mp4`;
  }

  /**
   * Generate attributes array
   */
  generateAttributes(personality, evolutionStage, coherence) {
    const attributes = [];

    // Archetype
    attributes.push({
      trait_type: 'Archetype',
      value: personality.archetype.charAt(0).toUpperCase() + personality.archetype.slice(1)
    });

    // Coherence
    attributes.push({
      trait_type: 'Coherence',
      value: Math.round(coherence * 100),
      max_value: 100,
      display_type: 'number'
    });

    // Evolution Stage
    attributes.push({
      trait_type: 'Evolution Stage',
      value: evolutionStage,
      max_value: 100,
      display_type: 'number'
    });

    // Major personality traits
    const majorTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'creativity', 'intelligence'];
    majorTraits.forEach(trait => {
      if (personality.traits[trait] !== undefined) {
        attributes.push({
          trait_type: trait.charAt(0).toUpperCase() + trait.slice(1),
          value: Math.round(personality.traits[trait] * 100),
          max_value: 100,
          display_type: 'number'
        });
      }
    });

    // Rarity based on coherence
    attributes.push({
      trait_type: 'Rarity',
      value: this.calculateRarity(coherence, evolutionStage)
    });

    return attributes;
  }

  /**
   * Get evolution-based suffixes
   */
  getEvolutionSuffixes(evolutionStage) {
    if (evolutionStage > 80) return ['Overlord', 'Master', 'Supreme', 'Transcendent'];
    if (evolutionStage > 60) return ['Elder', 'Sage', 'Champion', 'Virtuoso'];
    if (evolutionStage > 40) return ['Adept', 'Guardian', 'Creator', 'Analyst'];
    if (evolutionStage > 20) return ['Apprentice', 'Warrior', 'Artist', 'Scholar'];
    return ['Initiate', 'Seeker', 'Dreamer', 'Student'];
  }

  /**
   * Select item based on coherence level
   */
  selectBasedOnCoherence(options, coherence) {
    const index = Math.floor(coherence * (options.length - 1));
    return options[Math.min(index, options.length - 1)];
  }

  /**
   * Get top traits
   */
  getTopTraits(traits, count) {
    const entries = Object.entries(traits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count);

    return entries.map(([trait]) => trait.charAt(0).toUpperCase() + trait.slice(1));
  }

  /**
   * Calculate rarity
   */
  calculateRarity(coherence, evolutionStage) {
    const score = (coherence * 0.6) + (evolutionStage / 100 * 0.4);

    if (score > 0.9) return 'Legendary';
    if (score > 0.75) return 'Epic';
    if (score > 0.6) return 'Rare';
    if (score > 0.4) return 'Uncommon';
    return 'Common';
  }

  /**
   * Generate trait descriptions
   */
  generateTraitDescriptions(personality) {
    const descriptions = {};

    Object.entries(personality.traits).forEach(([trait, value]) => {
      let level;
      if (value >= 0.7) level = 'high';
      else if (value >= 0.4) level = 'medium';
      else level = 'low';

      descriptions[trait] = this.traitDescriptions[trait][level];
    });

    return descriptions;
  }

  /**
   * Update metadata for evolution
   */
  updateMetadataForEvolution(currentMetadata, newPersonality, newEvolutionStage, newCoherence) {
    const updated = { ...currentMetadata };

    // Update name if archetype changed
    if (newPersonality.archetype !== currentMetadata.properties.archetype) {
      updated.name = this.generateName(newPersonality.archetype, newEvolutionStage, newCoherence);
    }

    // Update description
    updated.description = this.generateDescription(newPersonality, newEvolutionStage, newCoherence);

    // Update image
    updated.image = this.generateImage(newPersonality.archetype, newEvolutionStage, newCoherence);

    // Update attributes
    updated.attributes = this.generateAttributes(newPersonality, newEvolutionStage, newCoherence);

    // Update properties
    updated.properties = {
      ...updated.properties,
      archetype: newPersonality.archetype,
      coherence: newCoherence,
      evolutionStage: newEvolutionStage,
      lastUpdated: Date.now()
    };

    return updated;
  }

  /**
   * Validate metadata
   */
  validateMetadata(metadata) {
    const errors = [];

    if (!metadata.name) errors.push('Name is required');
    if (!metadata.description) errors.push('Description is required');
    if (!metadata.image) errors.push('Image is required');
    if (!metadata.attributes || !Array.isArray(metadata.attributes)) errors.push('Attributes must be an array');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = MetadataGenerator;