/**
 * Evolution Triggers System
 * Manages when and how evolution occurs
 * Extracted from mr-nft-agent
 */

const EvolutionRules = require("./rules");

class EvolutionTriggers {
  constructor() {
    this.triggers = new Map();
    this.activeTriggers = new Map();
    this.triggerHistory = new Map();
    this.evolutionRules = new EvolutionRules();
  }

  /**
   * Create evolution trigger
   */
  createTrigger(inftId, triggerConfig) {
    const triggerId = `trigger_${inftId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const trigger = {
      id: triggerId,
      inftId,
      type: triggerConfig.type,
      condition: triggerConfig.condition,
      action: triggerConfig.action,
      createdAt: Date.now(),
      activatedAt: null,
      executedAt: null,
      status: "pending",
      metadata: triggerConfig.metadata || {},
    };

    this.triggers.set(triggerId, trigger);

    // Check if trigger should be activated immediately
    if (this.shouldActivate(trigger)) {
      this.activateTrigger(triggerId);
    }

    return triggerId;
  }

  /**
   * Activate trigger
   */
  activateTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger || trigger.status !== "pending") return;

    trigger.status = "active";
    trigger.activatedAt = Date.now();

    this.activeTriggers.set(triggerId, trigger);

    // Set up monitoring for time-based triggers
    if (trigger.type === "time_based") {
      this.scheduleTimeBasedTrigger(triggerId);
    }
  }

  /**
   * Execute trigger
   */
  async executeTrigger(triggerId, context = {}) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger || trigger.status !== "active") return null;

    try {
      // Execute the trigger action
      const result = await this.executeTriggerAction(trigger, context);

      // Update trigger status
      trigger.status = "executed";
      trigger.executedAt = Date.now();

      // Remove from active triggers
      this.activeTriggers.delete(triggerId);

      // Record in history
      this.recordTriggerExecution(trigger, result);

      return result;
    } catch (error) {
      console.error(`Trigger execution failed for ${triggerId}:`, error);

      // Mark as failed
      trigger.status = "failed";
      trigger.error = error.message;

      return { success: false, error: error.message };
    }
  }

  /**
   * Check if trigger should activate
   */
  shouldActivate(trigger) {
    switch (trigger.type) {
      case "immediate":
        return true;

      case "time_based":
        return this.checkTimeCondition(trigger.condition);

      case "coherence_based":
        return this.checkCoherenceCondition(trigger.condition);

      case "interaction_based":
        return this.checkInteractionCondition(trigger.condition);

      case "oracle_based":
        return this.checkOracleCondition(trigger.condition);

      default:
        return false;
    }
  }

  /**
   * Execute trigger action
   */
  async executeTriggerAction(trigger, context) {
    switch (trigger.action.type) {
      case "evolve_personality":
        return await this.executePersonalityEvolution(trigger, context);

      case "update_coherence":
        return await this.executeCoherenceUpdate(trigger, context);

      case "unlock_achievement":
        return await this.executeAchievementUnlock(trigger, context);

      case "trigger_memory":
        return await this.executeMemoryTrigger(trigger, context);

      default:
        throw new Error(`Unknown action type: ${trigger.action.type}`);
    }
  }

  /**
   * Execute personality evolution
   */
  async executePersonalityEvolution(trigger, context) {
    const experiences = [
      {
        type: trigger.action.experienceType,
        intensity: trigger.action.intensity || 1.0,
        positivity: trigger.action.positivity || 0.8,
        timestamp: Date.now(),
      },
    ];

    const evolution = this.evolutionRules.calculateEvolution(
      context.inft,
      experiences,
    );

    return {
      success: true,
      type: "personality_evolution",
      evolution,
      trigger: trigger.id,
    };
  }

  /**
   * Execute coherence update
   */
  async executeCoherenceUpdate(trigger, context) {
    const coherenceGain = trigger.action.coherenceGain || 1.0;

    return {
      success: true,
      type: "coherence_update",
      coherenceGain,
      trigger: trigger.id,
    };
  }

  /**
   * Execute achievement unlock
   */
  async executeAchievementUnlock(trigger, context) {
    const achievement = {
      id: trigger.action.achievementId,
      name: trigger.action.achievementName,
      description: trigger.action.achievementDescription,
      unlockedAt: Date.now(),
    };

    return {
      success: true,
      type: "achievement_unlock",
      achievement,
      trigger: trigger.id,
    };
  }

  /**
   * Execute memory trigger
   */
  async executeMemoryTrigger(trigger, context) {
    const memory = {
      type: "triggered_memory",
      content: trigger.action.memoryContent,
      importance: trigger.action.memoryImportance || 0.5,
      createdAt: Date.now(),
    };

    return {
      success: true,
      type: "memory_creation",
      memory,
      trigger: trigger.id,
    };
  }

  /**
   * Check time-based condition
   */
  checkTimeCondition(condition) {
    const now = Date.now();
    const triggerTime =
      condition.timestamp || Date.now() + (condition.delay || 0);

    return now >= triggerTime;
  }

  /**
   * Check coherence-based condition
   */
  checkCoherenceCondition(condition) {
    // This would check against current iNFT coherence
    // Simplified for now
    return Math.random() > 0.7; // 30% chance
  }

  /**
   * Check interaction-based condition
   */
  checkInteractionCondition(condition) {
    // This would check interaction history
    // Simplified for now
    return Math.random() > 0.8; // 20% chance
  }

  /**
   * Check oracle-based condition
   */
  checkOracleCondition(condition) {
    // This would check recent oracle readings
    // Simplified for now
    return Math.random() > 0.6; // 40% chance
  }

  /**
   * Schedule time-based trigger
   */
  scheduleTimeBasedTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return;

    const delay = trigger.condition.delay || 0;

    setTimeout(async () => {
      if (trigger.status === "active") {
        await this.executeTrigger(triggerId);
      }
    }, delay);
  }

  /**
   * Get active triggers for iNFT
   */
  getActiveTriggers(inftId) {
    const active = [];

    for (const [triggerId, trigger] of this.activeTriggers.entries()) {
      if (trigger.inftId === inftId) {
        active.push(trigger);
      }
    }

    return active;
  }

  /**
   * Get trigger history for iNFT
   */
  getTriggerHistory(inftId) {
    return this.triggerHistory.get(inftId) || [];
  }

  /**
   * Record trigger execution in history
   */
  recordTriggerExecution(trigger, result) {
    const history = this.triggerHistory.get(trigger.inftId) || [];
    history.push({
      triggerId: trigger.id,
      type: trigger.type,
      action: trigger.action.type,
      executedAt: trigger.executedAt,
      result,
    });

    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }

    this.triggerHistory.set(trigger.inftId, history);
  }

  /**
   * Clean up expired triggers
   */
  cleanupExpiredTriggers() {
    const now = Date.now();
    const toRemove = [];

    for (const [triggerId, trigger] of this.triggers.entries()) {
      // Remove triggers older than 30 days that are not executed
      if (
        trigger.status !== "executed" &&
        now - trigger.createdAt > 30 * 24 * 60 * 60 * 1000
      ) {
        toRemove.push(triggerId);
      }
    }

    toRemove.forEach((triggerId) => {
      this.triggers.delete(triggerId);
      this.activeTriggers.delete(triggerId);
    });

    return toRemove.length;
  }

  /**
   * Get trigger statistics
   */
  getTriggerStats() {
    const stats = {
      total: this.triggers.size,
      active: this.activeTriggers.size,
      executed: 0,
      failed: 0,
      byType: {},
    };

    for (const trigger of this.triggers.values()) {
      if (!stats.byType[trigger.type]) {
        stats.byType[trigger.type] = 0;
      }
      stats.byType[trigger.type]++;

      if (trigger.status === "executed") stats.executed++;
      if (trigger.status === "failed") stats.failed++;
    }

    return stats;
  }
}

module.exports = EvolutionTriggers;
