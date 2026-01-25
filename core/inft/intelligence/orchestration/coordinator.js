/**
 * Agent Orchestrator
 * Coordinates multiple intelligence agents
 * Extracted from mr-nft-agent
 */

const PersonalityGenerator = require('../personality/generator');
const PersonalityAnalyzer = require('../personality/analyzer');
const EvolutionRules = require('../evolution/rules');
const EvolutionTriggers = require('../evolution/triggers');
const EvolutionHistory = require('../evolution/history');
const MemoryStorage = require('../memory/storage');
const MemoryRecall = require('../memory/recall');
const MemoryContext = require('../memory/context');

class AgentOrchestrator {
  constructor() {
    // Initialize all intelligence components
    this.personalityGenerator = new PersonalityGenerator();
    this.personalityAnalyzer = new PersonalityAnalyzer();
    this.evolutionRules = new EvolutionRules();
    this.evolutionTriggers = new EvolutionTriggers();
    this.evolutionHistory = new EvolutionHistory();
    this.memoryStorage = new MemoryStorage();
    this.memoryRecall = new MemoryRecall(this.memoryStorage);
    this.memoryContext = new MemoryContext();

    // Orchestration state
    this.activeAgents = new Map();
    this.agentTasks = new Map();
    this.coordinationLog = [];
  }

  /**
   * Coordinate iNFT creation
   */
  async coordinateINFTCreation(creationData) {
    const taskId = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logCoordination(taskId, 'Starting iNFT creation coordination');

    try {
      // Step 1: Generate personality
      this.logCoordination(taskId, 'Generating personality');
      const personality = await this.generatePersonality(creationData);

      // Step 2: Analyze personality
      this.logCoordination(taskId, 'Analyzing personality');
      const analysis = this.analyzePersonality(personality);

      // Step 3: Initialize memory system
      this.logCoordination(taskId, 'Initializing memory system');
      const memoryInit = await this.initializeMemorySystem(creationData.inftId, personality);

      // Step 4: Set up evolution triggers
      this.logCoordination(taskId, 'Setting up evolution triggers');
      const triggers = await this.setupEvolutionTriggers(creationData.inftId, personality);

      // Step 5: Build initial context
      this.logCoordination(taskId, 'Building initial context');
      const context = await this.buildInitialContext(creationData.inftId, {
        personality,
        analysis,
        memoryInit,
        triggers
      });

      const result = {
        taskId,
        success: true,
        inftId: creationData.inftId,
        personality,
        analysis,
        memoryInit,
        triggers,
        context
      };

      this.logCoordination(taskId, 'iNFT creation coordination completed successfully');
      return result;

    } catch (error) {
      this.logCoordination(taskId, `iNFT creation coordination failed: ${error.message}`);
      return {
        taskId,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Coordinate iNFT evolution
   */
  async coordinateINFTEvolution(inftId, evolutionData) {
    const taskId = `evolution_${inftId}_${Date.now()}`;

    this.logCoordination(taskId, 'Starting iNFT evolution coordination');

    try {
      // Step 1: Assess current state
      this.logCoordination(taskId, 'Assessing current iNFT state');
      const currentState = await this.assessCurrentState(inftId);

      // Step 2: Calculate evolution
      this.logCoordination(taskId, 'Calculating evolution');
      const evolution = this.calculateEvolution(inftId, evolutionData, currentState);

      // Step 3: Validate evolution
      this.logCoordination(taskId, 'Validating evolution');
      const validation = this.validateEvolution(inftId, evolution, currentState);

      if (!validation.valid) {
        throw new Error(`Evolution validation failed: ${validation.errors.join(', ')}`);
      }

      // Step 4: Apply evolution
      this.logCoordination(taskId, 'Applying evolution');
      const application = await this.applyEvolution(inftId, evolution);

      // Step 5: Update memory and context
      this.logCoordination(taskId, 'Updating memory and context');
      await this.updateMemoryAndContext(inftId, evolution, application);

      // Step 6: Record evolution history
      this.logCoordination(taskId, 'Recording evolution history');
      await this.recordEvolutionHistory(inftId, evolution, application);

      const result = {
        taskId,
        success: true,
        inftId,
        evolution,
        validation,
        application
      };

      this.logCoordination(taskId, 'iNFT evolution coordination completed successfully');
      return result;

    } catch (error) {
      this.logCoordination(taskId, `iNFT evolution coordination failed: ${error.message}`);
      return {
        taskId,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Coordinate memory operations
   */
  async coordinateMemoryOperation(inftId, operation, data) {
    const taskId = `memory_${operation}_${inftId}_${Date.now()}`;

    this.logCoordination(taskId, `Starting memory ${operation} coordination`);

    try {
      let result;

      switch (operation) {
        case 'store':
          result = await this.memoryStorage.storeMemory(inftId, data);
          break;
        case 'recall':
          result = await this.memoryRecall.recallWithContext(inftId, data.query, data.contextOptions);
          break;
        case 'consolidate':
          this.memoryStorage.consolidateMemories(inftId);
          result = { success: true, operation: 'consolidate' };
          break;
        default:
          throw new Error(`Unknown memory operation: ${operation}`);
      }

      this.logCoordination(taskId, `Memory ${operation} coordination completed successfully`);
      return {
        taskId,
        success: true,
        operation,
        result
      };

    } catch (error) {
      this.logCoordination(taskId, `Memory ${operation} coordination failed: ${error.message}`);
      return {
        taskId,
        success: false,
        operation,
        error: error.message
      };
    }
  }

  /**
   * Coordinate interaction response
   */
  async coordinateInteractionResponse(inftId, interactionData) {
    const taskId = `interaction_${inftId}_${Date.now()}`;

    this.logCoordination(taskId, 'Starting interaction response coordination');

    try {
      // Step 1: Analyze interaction
      const interactionAnalysis = this.analyzeInteraction(interactionData);

      // Step 2: Recall relevant memories
      const memoryRecall = await this.memoryRecall.recallWithContext(inftId, {
        type: interactionAnalysis.memoryType,
        minImportance: 0.3,
        limit: 5
      });

      // Step 3: Generate personality-based response
      const personalityResponse = await this.generatePersonalityResponse(inftId, interactionData, memoryRecall);

      // Step 4: Store interaction memory
      const memoryStorage = await this.memoryStorage.storeMemory(inftId, {
        type: 'interaction',
        content: `Interacted with: ${interactionData.interactor}. Response: ${personalityResponse.response}`,
        importance: interactionAnalysis.importance,
        emotional: personalityResponse.emotional,
        tags: ['interaction', interactionData.type],
        context: {
          interactor: interactionData.interactor,
          interactionType: interactionData.type,
          response: personalityResponse.response
        }
      });

      // Step 5: Check for evolution triggers
      const triggers = this.evolutionTriggers.getActiveTriggers(inftId);
      const triggeredEvolutions = [];

      for (const trigger of triggers) {
        if (this.shouldTriggerEvolution(trigger, interactionData)) {
          const evolution = await this.coordinateINFTEvolution(inftId, {
            type: 'interaction_triggered',
            trigger: trigger.id,
            interaction: interactionData
          });
          triggeredEvolutions.push(evolution);
        }
      }

      const result = {
        taskId,
        success: true,
        inftId,
        interactionAnalysis,
        memoryRecall,
        personalityResponse,
        memoryStorage,
        triggeredEvolutions
      };

      this.logCoordination(taskId, 'Interaction response coordination completed successfully');
      return result;

    } catch (error) {
      this.logCoordination(taskId, `Interaction response coordination failed: ${error.message}`);
      return {
        taskId,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate personality
   */
  async generatePersonality(creationData) {
    if (creationData.oracleReading) {
      return this.personalityGenerator.generateFromOracle(creationData.oracleReading, creationData.options);
    } else {
      return this.personalityGenerator.generateRandom(creationData.options);
    }
  }

  /**
   * Analyze personality
   */
  analyzePersonality(personality) {
    return this.personalityAnalyzer.analyzePersonality(personality.traits);
  }

  /**
   * Initialize memory system
   */
  async initializeMemorySystem(inftId, personality) {
    // Store initial personality memory
    const personalityMemory = await this.memoryStorage.storeMemory(inftId, {
      type: 'personality_init',
      content: `Personality initialized: ${personality.archetype} archetype with coherence ${personality.coherence}`,
      importance: 1.0,
      emotional: 0.5,
      tags: ['personality', 'initialization', personality.archetype],
      context: {
        archetype: personality.archetype,
        coherence: personality.coherence,
        traits: personality.traits
      }
    });

    return {
      initialMemory: personalityMemory,
      memoryStats: this.memoryStorage.getMemoryStats(inftId)
    };
  }

  /**
   * Setup evolution triggers
   */
  async setupEvolutionTriggers(inftId, personality) {
    const triggers = [];

    // Time-based trigger
    triggers.push(await this.evolutionTriggers.createTrigger(inftId, {
      type: 'time_based',
      condition: { delay: 7 * 24 * 60 * 60 * 1000 }, // 7 days
      action: { type: 'evolve_personality', experienceType: 'time_passed', intensity: 0.5 },
      metadata: { reason: 'Weekly evolution check' }
    }));

    // Coherence-based trigger
    if (personality.coherence < 0.7) {
      triggers.push(await this.evolutionTriggers.createTrigger(inftId, {
        type: 'coherence_based',
        condition: { threshold: 0.7 },
        action: { type: 'update_coherence', coherenceGain: 0.1 },
        metadata: { reason: 'Coherence improvement trigger' }
      }));
    }

    return triggers;
  }

  /**
   * Build initial context
   */
  async buildInitialContext(inftId, data) {
    return await this.memoryContext.buildINFTContext(inftId, {
      includePersonality: true,
      includeMemories: true,
      includeEvolution: true
    });
  }

  /**
   * Assess current state
   */
  async assessCurrentState(inftId) {
    return {
      personality: await this.getCurrentPersonality(inftId),
      memoryStats: this.memoryStorage.getMemoryStats(inftId),
      evolutionStats: this.evolutionHistory.getEvolutionStats(inftId),
      activeTriggers: this.evolutionTriggers.getActiveTriggers(inftId)
    };
  }

  /**
   * Calculate evolution
   */
  calculateEvolution(inftId, evolutionData, currentState) {
    const experiences = [{
      type: evolutionData.type,
      intensity: evolutionData.intensity || 1.0,
      positivity: evolutionData.positivity || 0.8,
      timestamp: Date.now()
    }];

    return this.evolutionRules.calculateEvolution(currentState.inft || {}, experiences);
  }

  /**
   * Validate evolution
   */
  validateEvolution(inftId, evolution, currentState) {
    return this.evolutionRules.validateEvolution(currentState.inft || {}, evolution);
  }

  /**
   * Apply evolution
   */
  async applyEvolution(inftId, evolution) {
    // This would interact with the smart contract
    // Simplified for now
    return {
      applied: true,
      newCoherence: evolution.finalCoherence,
      traitChanges: evolution.traitChanges
    };
  }

  /**
   * Update memory and context
   */
  async updateMemoryAndContext(inftId, evolution, application) {
    // Store evolution memory
    await this.memoryStorage.storeMemory(inftId, {
      type: 'evolution',
      content: `Evolved: coherence ${application.newCoherence}, traits updated`,
      importance: 0.8,
      emotional: 0.3,
      tags: ['evolution', 'growth'],
      context: {
        evolution,
        application
      }
    });

    // Update context
    await this.memoryContext.updateContext(inftId, 'evolution', {
      lastEvolution: Date.now(),
      evolutionCount: evolution.evolutionCount
    });
  }

  /**
   * Record evolution history
   */
  async recordEvolutionHistory(inftId, evolution, application) {
    return this.evolutionHistory.recordEvolution(inftId, {
      type: 'orchestrated_evolution',
      changes: evolution.traitChanges,
      coherence: application.newCoherence,
      triggers: evolution.validExperiences,
      metadata: { orchestrated: true }
    });
  }

  /**
   * Analyze interaction
   */
  analyzeInteraction(interactionData) {
    return {
      type: interactionData.type,
      importance: this.calculateInteractionImportance(interactionData),
      memoryType: this.mapInteractionToMemoryType(interactionData),
      emotional: this.calculateInteractionEmotional(interactionData)
    };
  }

  /**
   * Generate personality response
   */
  async generatePersonalityResponse(inftId, interactionData, memoryRecall) {
    // Simplified response generation
    const personality = await this.getCurrentPersonality(inftId);
    const response = this.generateResponseBasedOnPersonality(personality, interactionData, memoryRecall);

    return {
      response,
      emotional: this.calculateResponseEmotional(response),
      confidence: 0.8
    };
  }

  /**
   * Helper methods
   */
  calculateInteractionImportance(interaction) {
    // Simplified importance calculation
    const typeWeights = {
      'oracle_reading': 0.9,
      'user_interaction': 0.7,
      'system_event': 0.5,
      'background': 0.3
    };
    return typeWeights[interaction.type] || 0.5;
  }

  mapInteractionToMemoryType(interaction) {
    const typeMapping = {
      'oracle_reading': 'oracle',
      'user_interaction': 'social',
      'system_event': 'system',
      'background': 'general'
    };
    return typeMapping[interaction.type] || 'general';
  }

  calculateInteractionEmotional(interaction) {
    // Simplified emotional calculation
    return Math.random() * 0.4 - 0.2; // -0.2 to 0.2 range
  }

  calculateResponseEmotional(response) {
    // Simplified emotional analysis
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible'];

    const lowerResponse = response.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerResponse.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerResponse.includes(word)).length;

    return (positiveCount - negativeCount) * 0.1; // Scale to reasonable range
  }

  generateResponseBasedOnPersonality(personality, interaction, memoryRecall) {
    // Simplified response generation
    const archetype = personality.archetype;
    const coherence = personality.coherence;

    let response = '';

    switch (archetype) {
      case 'sage':
        response = 'I contemplate the deeper meaning of this interaction...';
        break;
      case 'warrior':
        response = 'I stand ready to face this challenge!';
        break;
      case 'artist':
        response = 'This inspires my creative spirit...';
        break;
      case 'scholar':
        response = 'Let me analyze this logically...';
        break;
      default:
        response = 'I acknowledge this interaction.';
    }

    if (coherence > 0.8) {
      response += ' My coherence allows me to respond with clarity.';
    }

    return response;
  }

  async getCurrentPersonality(inftId) {
    // This would retrieve from storage
    // Simplified for now
    return {
      archetype: 'scholar',
      coherence: 0.7,
      traits: {}
    };
  }

  shouldTriggerEvolution(trigger, interaction) {
    // Simplified trigger logic
    return Math.random() > 0.8; // 20% chance
  }

  /**
   * Log coordination activity
   */
  logCoordination(taskId, message) {
    const logEntry = {
      taskId,
      timestamp: new Date().toISOString(),
      message
    };

    this.coordinationLog.push(logEntry);

    // Keep only last 1000 entries
    if (this.coordinationLog.length > 1000) {
      this.coordinationLog.shift();
    }

    console.log(`[COORDINATION] ${taskId}: ${message}`);
  }

  /**
   * Get coordination statistics
   */
  getCoordinationStats() {
    const stats = {
      totalLogEntries: this.coordinationLog.length,
      activeAgents: this.activeAgents.size,
      pendingTasks: this.agentTasks.size,
      recentActivity: this.coordinationLog.slice(-10)
    };

    return stats;
  }
}

module.exports = AgentOrchestrator;