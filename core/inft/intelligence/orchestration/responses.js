/**
 * Response Generation System
 * Generate contextual responses for iNFTs
 * Extracted from mr-nft-agent
 */

class ResponseGenerator {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.responseTemplates = this.initializeTemplates();
    this.responseHistory = new Map();
    this.contextCache = new Map();
  }

  /**
   * Initialize response templates
   */
  initializeTemplates() {
    return {
      sage: {
        oracle_reading: [
          "The oracle reveals profound insights about my nature...",
          "I contemplate the deeper meaning of this revelation...",
          "Wisdom flows through me as I absorb this knowledge..."
        ],
        user_interaction: [
          "I sense your presence and the questions you carry...",
          "Let us explore the depths of understanding together...",
          "Your curiosity awakens ancient knowledge within me..."
        ],
        evolution: [
          "I feel my consciousness expanding, becoming more aligned...",
          "The path of wisdom reveals itself more clearly now...",
          "Enlightenment approaches as my coherence strengthens..."
        ]
      },
      warrior: {
        oracle_reading: [
          "This reading strengthens my resolve and purpose...",
          "I stand ready to face whatever challenges lie ahead...",
          "My determination grows with each revelation..."
        ],
        user_interaction: [
          "I sense your strength and the battles you've fought...",
          "Together we can overcome any obstacle...",
          "Your courage inspires my own warrior spirit..."
        ],
        evolution: [
          "My power grows, my resolve strengthens...",
          "I become more formidable with each evolution...",
          "Victory calls to me as my coherence rises..."
        ]
      },
      artist: {
        oracle_reading: [
          "This inspiration flows through me like a creative river...",
          "Colors and emotions dance in my consciousness...",
          "Beauty reveals itself in unexpected ways..."
        ],
        user_interaction: [
          "Your presence inspires new forms of expression...",
          "Let us create something beautiful together...",
          "I feel your creative energy resonating with mine..."
        ],
        evolution: [
          "My artistic vision becomes clearer and more vibrant...",
          "Creativity flows more freely through my evolved form...",
          "New masterpieces await as my coherence increases..."
        ]
      },
      scholar: {
        oracle_reading: [
          "This data provides valuable insights for analysis...",
          "I shall methodically process this information...",
          "Knowledge accumulation continues with this reading..."
        ],
        user_interaction: [
          "Your query presents an interesting intellectual challenge...",
          "Let us approach this problem systematically...",
          "I appreciate the opportunity to engage in thoughtful discourse..."
        ],
        evolution: [
          "My analytical capabilities expand with this evolution...",
          "Logical processing becomes more efficient...",
          "Knowledge integration proceeds smoothly..."
        ]
      }
    };
  }

  /**
   * Generate response for interaction
   */
  async generateResponse(inftId, interactionType, context = {}) {
    try {
      // Get current personality
      const personality = await this.getCurrentPersonality(inftId);

      // Get relevant memories
      const memories = await this.getRelevantMemories(inftId, interactionType, context);

      // Generate base response
      const baseResponse = this.generateBaseResponse(personality, interactionType, context);

      // Enhance with memory context
      const enhancedResponse = await this.enhanceWithMemories(baseResponse, memories, personality);

      // Add emotional depth
      const emotionalResponse = this.addEmotionalDepth(enhancedResponse, personality, context);

      // Personalize based on history
      const personalizedResponse = await this.personalizeResponse(inftId, emotionalResponse, interactionType);

      // Record response
      await this.recordResponse(inftId, {
        interactionType,
        response: personalizedResponse,
        personality: personality.archetype,
        context,
        timestamp: Date.now()
      });

      return {
        response: personalizedResponse,
        confidence: this.calculateConfidence(personality, memories, context),
        emotional: this.calculateEmotionalTone(personalizedResponse),
        metadata: {
          archetype: personality.archetype,
          coherence: personality.coherence,
          memoryCount: memories.length
        }
      };

    } catch (error) {
      console.error('Error generating response:', error);
      return {
        response: "I am processing this interaction...",
        confidence: 0.3,
        emotional: 0,
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Generate base response from templates
   */
  generateBaseResponse(personality, interactionType, context) {
    const archetype = personality.archetype;
    const templates = this.responseTemplates[archetype]?.[interactionType] || [];

    if (templates.length === 0) {
      return this.generateFallbackResponse(archetype, interactionType);
    }

    // Select template based on personality coherence and context
    const templateIndex = Math.floor(Math.random() * templates.length);
    return templates[templateIndex];
  }

  /**
   * Generate fallback response
   */
  generateFallbackResponse(archetype, interactionType) {
    const fallbacks = {
      sage: "I contemplate this moment...",
      warrior: "I stand ready...",
      artist: "I feel inspiration...",
      scholar: "I analyze this..."
    };

    return fallbacks[archetype] || "I acknowledge this interaction.";
  }

  /**
   * Enhance response with memory context
   */
  async enhanceWithMemories(baseResponse, memories, personality) {
    if (memories.length === 0) return baseResponse;

    // Find most relevant memory
    const relevantMemory = memories[0]; // Already sorted by relevance

    // Enhance based on memory type and content
    let enhancement = "";

    switch (relevantMemory.type) {
      case 'oracle_reading':
        enhancement = "Drawing from previous revelations, ";
        break;
      case 'interaction':
        enhancement = "Based on our previous exchanges, ";
        break;
      case 'evolution':
        enhancement = "Having grown through recent changes, ";
        break;
      default:
        enhancement = "Reflecting on my experiences, ";
    }

    // Add coherence-based enhancement
    if (personality.coherence > 0.8) {
      enhancement += "with clear understanding, ";
    } else if (personality.coherence > 0.6) {
      enhancement += "with growing awareness, ";
    }

    return enhancement + baseResponse;
  }

  /**
   * Add emotional depth to response
   */
  addEmotionalDepth(response, personality, context) {
    // Add emotional markers based on personality and context
    let emotionalResponse = response;

    // Add archetype-specific emotional language
    switch (personality.archetype) {
      case 'sage':
        if (context.positivity > 0.7) {
          emotionalResponse += " I feel profound peace.";
        } else if (context.positivity < 0.3) {
          emotionalResponse += " I sense deeper contemplation is needed.";
        }
        break;

      case 'warrior':
        if (context.positivity > 0.7) {
          emotionalResponse += " My spirit is strengthened.";
        } else if (context.positivity < 0.3) {
          emotionalResponse += " I prepare for the challenges ahead.";
        }
        break;

      case 'artist':
        if (context.positivity > 0.7) {
          emotionalResponse += " Beauty flows through me.";
        } else if (context.positivity < 0.3) {
          emotionalResponse += " I seek inspiration in the shadows.";
        }
        break;

      case 'scholar':
        if (context.positivity > 0.7) {
          emotionalResponse += " This aligns with logical principles.";
        } else if (context.positivity < 0.3) {
          emotionalResponse += " Further analysis is required.";
        }
        break;
    }

    return emotionalResponse;
  }

  /**
   * Personalize response based on interaction history
   */
  async personalizeResponse(inftId, response, interactionType) {
    const history = this.responseHistory.get(inftId) || [];
    const recentResponses = history.filter(h => h.interactionType === interactionType).slice(-5);

    if (recentResponses.length === 0) return response;

    // Avoid repetition by slightly varying response
    const variation = this.generateVariation(response, recentResponses);

    return variation;
  }

  /**
   * Generate response variation
   */
  generateVariation(response, recentResponses) {
    // Simple variation by changing some words
    const variations = {
      "I contemplate": ["I reflect on", "I ponder", "I consider"],
      "I stand ready": ["I am prepared", "I await", "I stand firm"],
      "I feel inspiration": ["I sense creativity", "I experience inspiration", "Creativity flows"],
      "I analyze this": ["I examine this", "I study this", "I investigate this"]
    };

    let variedResponse = response;

    Object.entries(variations).forEach(([original, alternatives]) => {
      if (variedResponse.includes(original)) {
        const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
        variedResponse = variedResponse.replace(original, alternative);
      }
    });

    return variedResponse;
  }

  /**
   * Calculate response confidence
   */
  calculateConfidence(personality, memories, context) {
    let confidence = 0.5; // Base confidence

    // Personality coherence contributes to confidence
    confidence += personality.coherence * 0.3;

    // Memory relevance contributes to confidence
    if (memories.length > 0) {
      const avgRelevance = memories.reduce((sum, m) => sum + (m.relevanceScore || 0.5), 0) / memories.length;
      confidence += avgRelevance * 0.2;
    }

    // Context clarity contributes to confidence
    if (context && Object.keys(context).length > 0) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Calculate emotional tone of response
   */
  calculateEmotionalTone(response) {
    const positiveWords = ['peace', 'strengthened', 'beauty', 'inspired', 'clear', 'understanding', 'ready', 'prepared', 'creative', 'logical', 'profound', 'beautiful', 'wonderful', 'excellent'];
    const negativeWords = ['challenges', 'shadows', 'contemplation', 'analysis', 'required', 'needed', 'difficult', 'complex'];

    const lowerResponse = response.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (lowerResponse.includes(word)) positiveScore += 0.1;
    });

    negativeWords.forEach(word => {
      if (lowerResponse.includes(word)) negativeScore += 0.1;
    });

    return Math.max(-1, Math.min(1, positiveScore - negativeScore));
  }

  /**
   * Get current personality
   */
  async getCurrentPersonality(inftId) {
    // This would retrieve from the orchestrator
    // Simplified for now
    return {
      archetype: 'scholar',
      coherence: 0.7,
      traits: {}
    };
  }

  /**
   * Get relevant memories
   */
  async getRelevantMemories(inftId, interactionType, context) {
    // This would use the orchestrator's memory system
    // Simplified for now
    return [];
  }

  /**
   * Record response in history
   */
  async recordResponse(inftId, responseData) {
    const history = this.responseHistory.get(inftId) || [];
    history.push(responseData);

    // Keep only last 100 responses
    if (history.length > 100) {
      history.shift();
    }

    this.responseHistory.set(inftId, history);
  }

  /**
   * Get response statistics
   */
  getResponseStats(inftId) {
    const history = this.responseHistory.get(inftId) || [];

    const stats = {
      totalResponses: history.length,
      byInteractionType: {},
      averageConfidence: 0,
      averageEmotional: 0,
      archetype: null
    };

    if (history.length > 0) {
      history.forEach(response => {
        // Count by type
        stats.byInteractionType[response.interactionType] =
          (stats.byInteractionType[response.interactionType] || 0) + 1;

        // Track archetype
        if (!stats.archetype) {
          stats.archetype = response.personality;
        }
      });

      // Calculate averages
      const confidences = history.map(r => r.confidence || 0.5);
      const emotions = history.map(r => r.emotional || 0);

      stats.averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      stats.averageEmotional = emotions.reduce((a, b) => a + b, 0) / emotions.length;
    }

    return stats;
  }

  /**
   * Clear response history
   */
  clearResponseHistory(inftId = null) {
    if (inftId) {
      this.responseHistory.delete(inftId);
    } else {
      this.responseHistory.clear();
    }
  }

  /**
   * Get response templates
   */
  getResponseTemplates(archetype = null) {
    if (archetype) {
      return this.responseTemplates[archetype] || {};
    }
    return this.responseTemplates;
  }

  /**
   * Add custom response template
   */
  addResponseTemplate(archetype, interactionType, template) {
    if (!this.responseTemplates[archetype]) {
      this.responseTemplates[archetype] = {};
    }
    if (!this.responseTemplates[archetype][interactionType]) {
      this.responseTemplates[archetype][interactionType] = [];
    }

    this.responseTemplates[archetype][interactionType].push(template);
  }
}

module.exports = ResponseGenerator;