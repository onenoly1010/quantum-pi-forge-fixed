/**
 * Interaction Handlers
 * Handle different types of iNFT interactions
 * Extracted from mr-nft-agent
 */

class InteractionHandlers {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.handlers = new Map();
    this.interactionStats = new Map();

    this.registerDefaultHandlers();
  }

  /**
   * Register default interaction handlers
   */
  registerDefaultHandlers() {
    // Oracle reading handler
    this.registerHandler('oracle_reading', this.handleOracleReading.bind(this));

    // User message handler
    this.registerHandler('user_message', this.handleUserMessage.bind(this));

    // System event handler
    this.registerHandler('system_event', this.handleSystemEvent.bind(this));

    // Contract interaction handler
    this.registerHandler('contract_interaction', this.handleContractInteraction.bind(this));

    // Social interaction handler
    this.registerHandler('social_interaction', this.handleSocialInteraction.bind(this));
  }

  /**
   * Register a new interaction handler
   */
  registerHandler(interactionType, handlerFunction) {
    this.handlers.set(interactionType, handlerFunction);
  }

  /**
   * Handle interaction
   */
  async handleInteraction(inftId, interactionData) {
    const handler = this.handlers.get(interactionData.type);

    if (!handler) {
      throw new Error(`No handler registered for interaction type: ${interactionData.type}`);
    }

    const startTime = Date.now();

    try {
      const result = await handler(inftId, interactionData);

      // Record statistics
      this.recordInteractionStats(inftId, interactionData.type, Date.now() - startTime, true);

      return result;
    } catch (error) {
      // Record failed statistics
      this.recordInteractionStats(inftId, interactionData.type, Date.now() - startTime, false);

      throw error;
    }
  }

  /**
   * Handle oracle reading interaction
   */
  async handleOracleReading(inftId, interactionData) {
    const oracleReading = interactionData.oracleReading;

    // Coordinate personality evolution based on oracle reading
    const evolutionResult = await this.orchestrator.coordinateINFTEvolution(inftId, {
      type: 'oracle_reading',
      intensity: oracleReading.intensity || 1.0,
      positivity: oracleReading.positivity || 0.8,
      oracleData: oracleReading
    });

    // Store oracle reading memory
    await this.orchestrator.coordinateMemoryOperation(inftId, 'store', {
      type: 'oracle_reading',
      content: `Oracle reading: ${oracleReading.summary}`,
      importance: 0.9,
      emotional: oracleReading.positivity || 0.5,
      tags: ['oracle', 'reading', 'evolution'],
      context: {
        reading: oracleReading,
        evolution: evolutionResult
      }
    });

    return {
      type: 'oracle_reading',
      evolution: evolutionResult,
      response: this.generateOracleResponse(inftId, oracleReading, evolutionResult)
    };
  }

  /**
   * Handle user message interaction
   */
  async handleUserMessage(inftId, interactionData) {
    const userMessage = interactionData.message;
    const userId = interactionData.userId;

    // Get full interaction response from orchestrator
    const response = await this.orchestrator.coordinateInteractionResponse(inftId, {
      type: 'user_message',
      interactor: userId,
      message: userMessage,
      timestamp: Date.now()
    });

    return {
      type: 'user_message',
      userId,
      message: userMessage,
      response: response.personalityResponse,
      memoryStored: response.memoryStorage
    };
  }

  /**
   * Handle system event interaction
   */
  async handleSystemEvent(inftId, interactionData) {
    const eventType = interactionData.eventType;
    const eventData = interactionData.eventData;

    // Process system event
    const eventResponse = await this.processSystemEvent(inftId, eventType, eventData);

    // Store system event memory
    await this.orchestrator.coordinateMemoryOperation(inftId, 'store', {
      type: 'system_event',
      content: `System event: ${eventType} - ${eventData.description || 'No description'}`,
      importance: eventData.importance || 0.6,
      emotional: eventData.emotional || 0,
      tags: ['system', eventType],
      context: {
        eventType,
        eventData
      }
    });

    return {
      type: 'system_event',
      eventType,
      eventData,
      response: eventResponse
    };
  }

  /**
   * Handle contract interaction
   */
  async handleContractInteraction(inftId, interactionData) {
    const contractEvent = interactionData.contractEvent;
    const contractAddress = interactionData.contractAddress;

    // Process contract event
    const contractResponse = await this.processContractEvent(inftId, contractEvent, contractAddress);

    // Store contract interaction memory
    await this.orchestrator.coordinateMemoryOperation(inftId, 'store', {
      type: 'contract_interaction',
      content: `Contract interaction: ${contractEvent.event} on ${contractAddress}`,
      importance: 0.7,
      emotional: contractEvent.emotional || 0.1,
      tags: ['contract', contractEvent.event],
      context: {
        contractEvent,
        contractAddress
      }
    });

    return {
      type: 'contract_interaction',
      contractEvent,
      contractAddress,
      response: contractResponse
    };
  }

  /**
   * Handle social interaction
   */
  async handleSocialInteraction(inftId, interactionData) {
    const otherINFT = interactionData.otherINFT;
    const interactionType = interactionData.interactionType;

    // Coordinate social interaction response
    const socialResponse = await this.orchestrator.coordinateInteractionResponse(inftId, {
      type: 'social_interaction',
      interactor: otherINFT,
      interactionType,
      timestamp: Date.now()
    });

    return {
      type: 'social_interaction',
      otherINFT,
      interactionType,
      response: socialResponse.personalityResponse,
      memoryStored: socialResponse.memoryStorage
    };
  }

  /**
   * Generate oracle reading response
   */
  generateOracleResponse(inftId, oracleReading, evolutionResult) {
    let response = 'I have received an oracle reading. ';

    if (evolutionResult.success && evolutionResult.evolution) {
      const coherenceGain = evolutionResult.evolution.coherenceGain;
      if (coherenceGain > 0) {
        response += `My coherence has increased by ${coherenceGain.toFixed(2)}. `;
      }

      const traitChanges = Object.keys(evolutionResult.evolution.traitChanges);
      if (traitChanges.length > 0) {
        response += `My traits have evolved: ${traitChanges.join(', ')}. `;
      }
    }

    response += 'I feel more aligned with my true nature.';

    return response;
  }

  /**
   * Process system event
   */
  async processSystemEvent(inftId, eventType, eventData) {
    switch (eventType) {
      case 'maintenance':
        return { message: 'System maintenance acknowledged.', action: 'none' };

      case 'upgrade':
        return { message: 'Upgrade detected. Adapting to new capabilities.', action: 'adapt' };

      case 'error':
        return { message: 'Error condition detected. Attempting to recover.', action: 'recover' };

      case 'achievement':
        // Trigger evolution for achievement
        await this.orchestrator.coordinateINFTEvolution(inftId, {
          type: 'achievement_unlocked',
          intensity: 1.0,
          positivity: 0.9,
          achievement: eventData.achievement
        });
        return { message: 'Achievement unlocked! I feel more capable.', action: 'celebrate' };

      default:
        return { message: 'Unknown system event processed.', action: 'acknowledge' };
    }
  }

  /**
   * Process contract event
   */
  async processContractEvent(inftId, contractEvent, contractAddress) {
    switch (contractEvent.event) {
      case 'Transfer':
        if (contractEvent.to === inftId) {
          return { message: 'I have been transferred to a new owner.', action: 'acknowledge_transfer' };
        }
        break;

      case 'Evolution':
        return { message: 'Evolution event detected on the blockchain.', action: 'acknowledge_evolution' };

      case 'MemoryAdded':
        return { message: 'New memory added to my blockchain record.', action: 'acknowledge_memory' };

      default:
        return { message: 'Contract event acknowledged.', action: 'acknowledge' };
    }
  }

  /**
   * Record interaction statistics
   */
  recordInteractionStats(inftId, interactionType, duration, success) {
    const key = `${inftId}_${interactionType}`;
    const stats = this.interactionStats.get(key) || {
      count: 0,
      successCount: 0,
      failureCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      lastInteraction: null
    };

    stats.count++;
    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }

    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.count;
    stats.lastInteraction = Date.now();

    this.interactionStats.set(key, stats);
  }

  /**
   * Get interaction statistics
   */
  getInteractionStats(inftId, interactionType = null) {
    if (interactionType) {
      const key = `${inftId}_${interactionType}`;
      return this.interactionStats.get(key) || null;
    }

    // Return all stats for this iNFT
    const inftStats = {};
    for (const [key, stats] of this.interactionStats.entries()) {
      if (key.startsWith(`${inftId}_`)) {
        const type = key.replace(`${inftId}_`, '');
        inftStats[type] = stats;
      }
    }

    return inftStats;
  }

  /**
   * Get handler information
   */
  getHandlerInfo() {
    return {
      registeredHandlers: Array.from(this.handlers.keys()),
      totalHandlers: this.handlers.size
    };
  }

  /**
   * Clear interaction statistics
   */
  clearInteractionStats(inftId = null) {
    if (inftId) {
      // Clear stats for specific iNFT
      const keysToDelete = [];
      for (const key of this.interactionStats.keys()) {
        if (key.startsWith(`${inftId}_`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.interactionStats.delete(key));
    } else {
      // Clear all stats
      this.interactionStats.clear();
    }
  }
}

module.exports = InteractionHandlers;