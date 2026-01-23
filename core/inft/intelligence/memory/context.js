/**
 * Memory Context Builder
 * Builds contextual understanding from memory patterns
 * Extracted from mr-nft-agent
 */

class MemoryContext {
  constructor() {
    this.contexts = new Map();
    this.contextRelationships = new Map();
  }

  /**
   * Build comprehensive context for iNFT
   */
  async buildINFTContext(inftId, options = {}) {
    const context = {
      inftId,
      builtAt: new Date().toISOString(),
      personality: {},
      memories: {},
      evolution: {},
      relationships: {},
      insights: []
    };

    // Build personality context
    context.personality = await this.buildPersonalityContext(inftId);

    // Build memory context
    context.memories = await this.buildMemoryContext(inftId, options);

    // Build evolution context
    context.evolution = await this.buildEvolutionContext(inftId);

    // Build relationship context
    context.relationships = await this.buildRelationshipContext(inftId);

    // Generate insights
    context.insights = this.generateContextInsights(context);

    // Cache context
    this.contexts.set(inftId, context);

    return context;
  }

  /**
   * Build personality context
   */
  async buildPersonalityContext(inftId) {
    // This would integrate with personality system
    // Simplified for now
    return {
      archetype: 'unknown',
      coherence: 0.5,
      dominantTraits: [],
      evolutionStage: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Build memory context
   */
  async buildMemoryContext(inftId, options) {
    // This would integrate with memory system
    // Simplified for now
    return {
      totalMemories: 0,
      recentMemories: [],
      importantMemories: [],
      memoryTypes: {},
      emotionalProfile: {
        average: 0,
        range: { min: 0, max: 0 },
        dominant: 'neutral'
      },
      temporalDistribution: {}
    };
  }

  /**
   * Build evolution context
   */
  async buildEvolutionContext(inftId) {
    // This would integrate with evolution system
    // Simplified for now
    return {
      currentStage: 0,
      totalEvolutions: 0,
      recentEvolutions: [],
      evolutionPatterns: [],
      coherenceHistory: [],
      traitDevelopment: {}
    };
  }

  /**
   * Build relationship context
   */
  async buildRelationshipContext(inftId) {
    // This would analyze relationships with other iNFTs, users, etc.
    // Simplified for now
    return {
      connectedINFTs: [],
      ownerRelationship: {},
      communityConnections: [],
      interactionPatterns: {}
    };
  }

  /**
   * Generate context insights
   */
  generateContextInsights(context) {
    const insights = [];

    // Personality insights
    if (context.personality.coherence > 0.8) {
      insights.push('Exceptionally coherent personality structure');
    } else if (context.personality.coherence < 0.3) {
      insights.push('Personality structure needs development');
    }

    // Memory insights
    if (context.memories.totalMemories > 100) {
      insights.push('Rich memory database indicates extensive experience');
    } else if (context.memories.totalMemories < 10) {
      insights.push('Limited memory database suggests early development stage');
    }

    // Evolution insights
    if (context.evolution.totalEvolutions > 50) {
      insights.push('Highly evolved with significant development history');
    }

    // Emotional insights
    const emotionalProfile = context.memories.emotionalProfile;
    if (emotionalProfile.average > 0.3) {
      insights.push('Generally positive emotional disposition');
    } else if (emotionalProfile.average < -0.3) {
      insights.push('Generally negative emotional disposition');
    }

    return insights;
  }

  /**
   * Get context for iNFT
   */
  getContext(inftId) {
    return this.contexts.get(inftId) || null;
  }

  /**
   * Update context incrementally
   */
  async updateContext(inftId, updateType, updateData) {
    const existingContext = this.contexts.get(inftId);

    if (!existingContext) {
      return await this.buildINFTContext(inftId);
    }

    // Update specific part of context
    switch (updateType) {
      case 'personality':
        existingContext.personality = { ...existingContext.personality, ...updateData };
        break;
      case 'memory':
        existingContext.memories = { ...existingContext.memories, ...updateData };
        break;
      case 'evolution':
        existingContext.evolution = { ...existingContext.evolution, ...updateData };
        break;
      case 'relationship':
        existingContext.relationships = { ...existingContext.relationships, ...updateData };
        break;
    }

    existingContext.builtAt = new Date().toISOString();
    existingContext.insights = this.generateContextInsights(existingContext);

    return existingContext;
  }

  /**
   * Compare contexts
   */
  compareContexts(context1, context2) {
    return {
      personalityDiff: this.comparePersonalityContexts(context1.personality, context2.personality),
      memoryDiff: this.compareMemoryContexts(context1.memories, context2.memories),
      evolutionDiff: this.compareEvolutionContexts(context1.evolution, context2.evolution),
      overallSimilarity: this.calculateOverallSimilarity(context1, context2)
    };
  }

  /**
   * Compare personality contexts
   */
  comparePersonalityContexts(p1, p2) {
    return {
      coherenceDiff: p2.coherence - p1.coherence,
      archetypeChanged: p1.archetype !== p2.archetype,
      stageProgression: p2.evolutionStage - p1.evolutionStage
    };
  }

  /**
   * Compare memory contexts
   */
  compareMemoryContexts(m1, m2) {
    return {
      memoryGrowth: m2.totalMemories - m1.totalMemories,
      emotionalShift: m2.emotionalProfile.average - m1.emotionalProfile.average
    };
  }

  /**
   * Compare evolution contexts
   */
  compareEvolutionContexts(e1, e2) {
    return {
      evolutionProgress: e2.totalEvolutions - e1.totalEvolutions,
      stageProgression: e2.currentStage - e1.currentStage
    };
  }

  /**
   * Calculate overall similarity
   */
  calculateOverallSimilarity(context1, context2) {
    // Simplified similarity calculation
    let similarity = 0;
    let factors = 0;

    // Personality similarity
    if (context1.personality.archetype === context2.personality.archetype) {
      similarity += 0.3;
    }
    factors += 0.3;

    // Coherence similarity
    const coherenceDiff = Math.abs(context1.personality.coherence - context2.personality.coherence);
    similarity += (1 - coherenceDiff) * 0.3;
    factors += 0.3;

    // Memory similarity
    const memoryRatio = Math.min(context1.memories.totalMemories, context2.memories.totalMemories) /
                       Math.max(context1.memories.totalMemories, context2.memories.totalMemories);
    similarity += memoryRatio * 0.2;
    factors += 0.2;

    // Evolution similarity
    const evolutionRatio = Math.min(context1.evolution.totalEvolutions, context2.evolution.totalEvolutions) /
                          Math.max(context1.evolution.totalEvolutions, context2.evolution.totalEvolutions);
    similarity += evolutionRatio * 0.2;
    factors += 0.2;

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Build context relationships
   */
  buildContextRelationships(inftIds) {
    const relationships = {};

    for (let i = 0; i < inftIds.length; i++) {
      for (let j = i + 1; j < inftIds.length; j++) {
        const context1 = this.contexts.get(inftIds[i]);
        const context2 = this.contexts.get(inftIds[j]);

        if (context1 && context2) {
          const comparison = this.compareContexts(context1, context2);
          const key = `${inftIds[i]}_${inftIds[j]}`;

          relationships[key] = {
            inft1: inftIds[i],
            inft2: inftIds[j],
            similarity: comparison.overallSimilarity,
            comparison
          };
        }
      }
    }

    this.contextRelationships.set(Date.now(), relationships);
    return relationships;
  }

  /**
   * Find similar iNFTs
   */
  findSimilarINFTs(inftId, threshold = 0.7) {
    const targetContext = this.contexts.get(inftId);
    if (!targetContext) return [];

    const similar = [];

    for (const [otherId, otherContext] of this.contexts.entries()) {
      if (otherId === inftId) continue;

      const similarity = this.calculateOverallSimilarity(targetContext, otherContext);
      if (similarity >= threshold) {
        similar.push({
          inftId: otherId,
          similarity,
          comparison: this.compareContexts(targetContext, otherContext)
        });
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Clear context cache
   */
  clearContexts() {
    this.contexts.clear();
    this.contextRelationships.clear();
  }

  /**
   * Get context statistics
   */
  getContextStats() {
    return {
      totalContexts: this.contexts.size,
      totalRelationships: this.contextRelationships.size,
      contextKeys: Array.from(this.contexts.keys()),
      relationshipKeys: Array.from(this.contextRelationships.keys())
    };
  }
}

module.exports = MemoryContext;