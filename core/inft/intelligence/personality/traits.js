/**
 * Personality Traits System
 * Core personality trait definitions and generation
 * Extracted from mr-nft-agent
 */

const { ethers } = require('ethers');

// Base personality traits (Big Five + Quantum additions)
const BASE_TRAITS = {
  openness: { min: 0, max: 1, weight: 1.0 },
  conscientiousness: { min: 0, max: 1, weight: 1.0 },
  extraversion: { min: 0, max: 1, weight: 1.0 },
  agreeableness: { min: 0, max: 1, weight: 1.0 },
  neuroticism: { min: 0, max: 1, weight: 1.0 },
  creativity: { min: 0, max: 1, weight: 1.2 },
  empathy: { min: 0, max: 1, weight: 1.1 },
  intelligence: { min: 0, max: 1, weight: 1.3 },
  intuition: { min: 0, max: 1, weight: 1.1 },
  adaptability: { min: 0, max: 1, weight: 1.0 }
};

// Personality archetypes
const ARCHETYPES = {
  sage: {
    openness: 0.9, conscientiousness: 0.8, extraversion: 0.4,
    agreeableness: 0.7, neuroticism: 0.3, creativity: 0.9,
    empathy: 0.8, intelligence: 0.9, intuition: 0.8, adaptability: 0.7
  },
  warrior: {
    openness: 0.6, conscientiousness: 0.9, extraversion: 0.8,
    agreeableness: 0.5, neuroticism: 0.4, creativity: 0.5,
    empathy: 0.4, intelligence: 0.7, intuition: 0.5, adaptability: 0.8
  },
  artist: {
    openness: 0.9, conscientiousness: 0.4, extraversion: 0.7,
    agreeableness: 0.8, neuroticism: 0.7, creativity: 0.9,
    empathy: 0.8, intelligence: 0.6, intuition: 0.7, adaptability: 0.6
  },
  scholar: {
    openness: 0.8, conscientiousness: 0.9, extraversion: 0.3,
    agreeableness: 0.6, neuroticism: 0.4, creativity: 0.7,
    empathy: 0.6, intelligence: 0.9, intuition: 0.8, adaptability: 0.5
  }
};

/**
 * Generate personality traits from oracle reading
 */
function generatePersonalityFromOracle(oracleReading, seedTraits = {}) {
  const personality = { ...seedTraits };

  // Extract traits from oracle reading
  if (oracleReading.traits) {
    Object.keys(BASE_TRAITS).forEach(trait => {
      if (oracleReading.traits[trait] !== undefined) {
        personality[trait] = normalizeTraitValue(oracleReading.traits[trait]);
      }
    });
  }

  // Fill missing traits with archetype-based generation
  const archetype = selectArchetype(oracleReading);
  Object.keys(BASE_TRAITS).forEach(trait => {
    if (personality[trait] === undefined) {
      personality[trait] = generateTraitWithVariation(
        ARCHETYPES[archetype][trait],
        0.2 // 20% variation
      );
    }
  });

  // Validate and normalize all traits
  Object.keys(BASE_TRAITS).forEach(trait => {
    personality[trait] = clampTraitValue(personality[trait]);
  });

  return {
    traits: personality,
    archetype,
    coherence: calculatePersonalityCoherence(personality),
    timestamp: Date.now(),
    version: '1.0'
  };
}

/**
 * Generate personality from scratch (fallback)
 */
function generatePersonality(seed = null) {
  const archetype = Object.keys(ARCHETYPES)[Math.floor(Math.random() * Object.keys(ARCHETYPES).length)];
  const personality = {};

  Object.keys(BASE_TRAITS).forEach(trait => {
    personality[trait] = generateTraitWithVariation(
      ARCHETYPES[archetype][trait],
      0.3 // 30% variation for random generation
    );
  });

  return {
    traits: personality,
    archetype,
    coherence: calculatePersonalityCoherence(personality),
    timestamp: Date.now(),
    version: '1.0'
  };
}

/**
 * Evolve personality based on experiences
 */
function evolvePersonality(currentPersonality, experiences, evolutionFactor = 0.1) {
  const evolved = { ...currentPersonality.traits };

  // Apply experience-based evolution
  experiences.forEach(experience => {
    Object.keys(BASE_TRAITS).forEach(trait => {
      if (experience.traitImpacts && experience.traitImpacts[trait]) {
        const impact = experience.traitImpacts[trait] * evolutionFactor;
        evolved[trait] = clampTraitValue(evolved[trait] + impact);
      }
    });
  });

  return {
    traits: evolved,
    archetype: determineArchetype(evolved),
    coherence: calculatePersonalityCoherence(evolved),
    timestamp: Date.now(),
    version: '1.0',
    evolutionCount: (currentPersonality.evolutionCount || 0) + 1
  };
}

/**
 * Analyze personality compatibility
 */
function analyzeCompatibility(personality1, personality2) {
  let compatibility = 0;
  let totalWeight = 0;

  Object.keys(BASE_TRAITS).forEach(trait => {
    const weight = BASE_TRAITS[trait].weight;
    const diff = Math.abs(personality1.traits[trait] - personality2.traits[trait]);
    compatibility += (1 - diff) * weight;
    totalWeight += weight;
  });

  return compatibility / totalWeight;
}

/**
 * Calculate personality coherence
 */
function calculatePersonalityCoherence(personality) {
  // Coherence based on trait balance and archetype fit
  const archetype = determineArchetype(personality);
  const archetypeFit = calculateArchetypeFit(personality, archetype);

  // Balance factor (how evenly distributed traits are)
  const traitValues = Object.values(personality);
  const mean = traitValues.reduce((a, b) => a + b, 0) / traitValues.length;
  const variance = traitValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / traitValues.length;
  const balanceFactor = Math.max(0, 1 - variance * 4); // Normalize variance

  return (archetypeFit * 0.7) + (balanceFactor * 0.3);
}

/**
 * Select archetype based on oracle reading
 */
function selectArchetype(oracleReading) {
  // Simple archetype selection based on reading content
  const content = oracleReading.content || '';
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('wisdom') || lowerContent.includes('knowledge') || lowerContent.includes('truth')) {
    return 'sage';
  } else if (lowerContent.includes('strength') || lowerContent.includes('courage') || lowerContent.includes('action')) {
    return 'warrior';
  } else if (lowerContent.includes('art') || lowerContent.includes('beauty') || lowerContent.includes('expression')) {
    return 'artist';
  } else {
    return 'scholar'; // Default
  }
}

/**
 * Determine archetype from trait values
 */
function determineArchetype(personality) {
  let bestArchetype = 'scholar';
  let bestFit = 0;

  Object.keys(ARCHETYPES).forEach(archetype => {
    const fit = calculateArchetypeFit(personality, archetype);
    if (fit > bestFit) {
      bestFit = fit;
      bestArchetype = archetype;
    }
  });

  return bestArchetype;
}

/**
 * Calculate how well personality fits an archetype
 */
function calculateArchetypeFit(personality, archetype) {
  let fit = 0;
  let totalWeight = 0;

  Object.keys(BASE_TRAITS).forEach(trait => {
    const weight = BASE_TRAITS[trait].weight;
    const diff = Math.abs(personality[trait] - ARCHETYPES[archetype][trait]);
    fit += (1 - diff) * weight;
    totalWeight += weight;
  });

  return fit / totalWeight;
}

/**
 * Generate trait with random variation
 */
function generateTraitWithVariation(baseValue, variation) {
  const randomFactor = (Math.random() - 0.5) * 2 * variation;
  return clampTraitValue(baseValue + randomFactor);
}

/**
 * Normalize trait value to 0-1 range
 */
function normalizeTraitValue(value) {
  if (typeof value === 'number') {
    return Math.max(0, Math.min(1, value));
  }
  // Handle string representations
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0.5 : normalizeTraitValue(numValue);
  }
  return 0.5; // Default
}

/**
 * Clamp trait value to valid range
 */
function clampTraitValue(value) {
  return Math.max(0, Math.min(1, value));
}

/**
 * Create personality hash for blockchain storage
 */
function hashPersonality(personality) {
  const traitString = Object.keys(personality.traits)
    .sort()
    .map(trait => `${trait}:${personality.traits[trait].toFixed(4)}`)
    .join('|');

  return ethers.keccak256(ethers.toUtf8Bytes(traitString));
}

module.exports = {
  BASE_TRAITS,
  ARCHETYPES,
  generatePersonalityFromOracle,
  generatePersonality,
  evolvePersonality,
  analyzeCompatibility,
  calculatePersonalityCoherence,
  hashPersonality,
  selectArchetype,
  determineArchetype
};