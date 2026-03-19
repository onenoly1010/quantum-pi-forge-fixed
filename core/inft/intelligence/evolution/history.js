/**
 * Evolution History Tracker
 * Tracks personality evolution over time
 * Extracted from mr-nft-agent
 */

class EvolutionHistory {
  constructor() {
    this.histories = new Map();
    this.maxHistorySize = 1000; // Max entries per iNFT
  }

  /**
   * Record evolution event
   */
  recordEvolution(inftId, evolutionEvent) {
    const history = this.histories.get(inftId) || [];

    const record = {
      id: `evolution_${inftId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: evolutionEvent.type,
      changes: evolutionEvent.changes,
      triggers: evolutionEvent.triggers || [],
      coherence: evolutionEvent.coherence,
      stage: evolutionEvent.stage,
      metadata: evolutionEvent.metadata || {},
    };

    history.push(record);

    // Maintain max history size
    if (history.length > this.maxHistorySize) {
      history.shift(); // Remove oldest
    }

    this.histories.set(inftId, history);

    return record.id;
  }

  /**
   * Get evolution history for iNFT
   */
  getEvolutionHistory(inftId, options = {}) {
    const history = this.histories.get(inftId) || [];

    let filtered = [...history];

    // Apply filters
    if (options.type) {
      filtered = filtered.filter((h) => h.type === options.type);
    }

    if (options.since) {
      filtered = filtered.filter((h) => h.timestamp >= options.since);
    }

    if (options.until) {
      filtered = filtered.filter((h) => h.timestamp <= options.until);
    }

    // Apply sorting (default: newest first)
    const sortOrder = options.sortOrder || "desc";
    filtered.sort((a, b) => {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });

    // Apply pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    return {
      inftId,
      total: history.length,
      filtered: filtered.length,
      records: filtered.slice(offset, offset + limit),
      hasMore: offset + limit < filtered.length,
    };
  }

  /**
   * Get evolution statistics
   */
  getEvolutionStats(inftId) {
    const history = this.histories.get(inftId) || [];

    if (history.length === 0) {
      return {
        totalEvolutions: 0,
        averageTimeBetweenEvolutions: 0,
        evolutionTypes: {},
        coherenceProgression: [],
        stageProgression: [],
      };
    }

    const stats = {
      totalEvolutions: history.length,
      evolutionTypes: {},
      coherenceProgression: [],
      stageProgression: [],
      firstEvolution: history[0].timestamp,
      lastEvolution: history[history.length - 1].timestamp,
    };

    // Calculate time between evolutions
    let totalTimeDiff = 0;
    for (let i = 1; i < history.length; i++) {
      totalTimeDiff += history[i].timestamp - history[i - 1].timestamp;
    }
    stats.averageTimeBetweenEvolutions =
      history.length > 1 ? totalTimeDiff / (history.length - 1) : 0;

    // Count evolution types
    history.forEach((record) => {
      stats.evolutionTypes[record.type] =
        (stats.evolutionTypes[record.type] || 0) + 1;

      // Track progression
      if (record.coherence !== undefined) {
        stats.coherenceProgression.push({
          timestamp: record.timestamp,
          coherence: record.coherence,
        });
      }

      if (record.stage !== undefined) {
        stats.stageProgression.push({
          timestamp: record.timestamp,
          stage: record.stage,
        });
      }
    });

    return stats;
  }

  /**
   * Analyze evolution patterns
   */
  analyzeEvolutionPatterns(inftId) {
    const history = this.histories.get(inftId) || [];

    if (history.length < 3) {
      return {
        patterns: [],
        insights: ["Insufficient evolution history for pattern analysis"],
      };
    }

    const patterns = [];
    const insights = [];

    // Analyze coherence trends
    const coherenceValues = history
      .map((h) => h.coherence)
      .filter((c) => c !== undefined);
    if (coherenceValues.length >= 3) {
      const trend = this.calculateTrend(coherenceValues);
      if (Math.abs(trend) > 0.1) {
        patterns.push({
          type: "coherence_trend",
          direction: trend > 0 ? "increasing" : "decreasing",
          strength: Math.abs(trend),
          description: `Coherence is ${trend > 0 ? "improving" : "declining"} over time`,
        });
      }
    }

    // Analyze evolution frequency
    const timeDiffs = [];
    for (let i = 1; i < history.length; i++) {
      timeDiffs.push(history[i].timestamp - history[i - 1].timestamp);
    }

    if (timeDiffs.length > 0) {
      const avgTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      const variance =
        timeDiffs.reduce((acc, val) => acc + Math.pow(val - avgTime, 2), 0) /
        timeDiffs.length;

      if (variance < avgTime * 0.5) {
        patterns.push({
          type: "consistent_evolution",
          description: "Evolution occurs at regular intervals",
        });
      } else {
        patterns.push({
          type: "irregular_evolution",
          description: "Evolution timing is irregular",
        });
      }
    }

    // Analyze trigger effectiveness
    const triggerEffectiveness = {};
    history.forEach((record) => {
      if (record.triggers && record.triggers.length > 0) {
        record.triggers.forEach((trigger) => {
          if (!triggerEffectiveness[trigger]) {
            triggerEffectiveness[trigger] = { count: 0, coherenceGains: [] };
          }
          triggerEffectiveness[trigger].count++;
          if (record.changes && record.changes.coherenceGain) {
            triggerEffectiveness[trigger].coherenceGains.push(
              record.changes.coherenceGain,
            );
          }
        });
      }
    });

    Object.entries(triggerEffectiveness).forEach(([trigger, data]) => {
      if (data.coherenceGains.length > 0) {
        const avgGain =
          data.coherenceGains.reduce((a, b) => a + b, 0) /
          data.coherenceGains.length;
        if (avgGain > 1.0) {
          patterns.push({
            type: "effective_trigger",
            trigger,
            averageGain: avgGain,
            description: `${trigger} triggers are highly effective`,
          });
        }
      }
    });

    // Generate insights
    if (patterns.length === 0) {
      insights.push("No significant evolution patterns detected");
    } else {
      insights.push(`Found ${patterns.length} evolution patterns`);
      if (
        patterns.some(
          (p) => p.type === "coherence_trend" && p.direction === "increasing",
        )
      ) {
        insights.push("Positive coherence development trend");
      }
    }

    return { patterns, insights };
  }

  /**
   * Calculate trend in values
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((acc, val, idx) => acc + val * idx, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return slope;
  }

  /**
   * Export evolution data
   */
  exportEvolutionData(inftId, format = "json") {
    const history = this.histories.get(inftId) || [];
    const stats = this.getEvolutionStats(inftId);
    const patterns = this.analyzeEvolutionPatterns(inftId);

    const data = {
      inftId,
      exportDate: new Date().toISOString(),
      history,
      stats,
      patterns,
    };

    if (format === "csv") {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const headers = ["timestamp", "type", "coherence", "stage", "triggers"];
    const rows = data.history.map((record) => [
      new Date(record.timestamp).toISOString(),
      record.type,
      record.coherence || "",
      record.stage || "",
      record.triggers ? record.triggers.join(";") : "",
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  /**
   * Clear history for iNFT
   */
  clearHistory(inftId) {
    this.histories.delete(inftId);
    return true;
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    const stats = {
      totalINFTs: this.histories.size,
      totalRecords: 0,
      averageRecordsPerINFT: 0,
      largestHistory: 0,
      smallestHistory: Infinity,
    };

    for (const history of this.histories.values()) {
      stats.totalRecords += history.length;

      if (history.length > stats.largestHistory) {
        stats.largestHistory = history.length;
      }

      if (history.length < stats.smallestHistory) {
        stats.smallestHistory = history.length;
      }
    }

    if (stats.totalINFTs > 0) {
      stats.averageRecordsPerINFT = stats.totalRecords / stats.totalINFTs;
    }

    if (stats.smallestHistory === Infinity) {
      stats.smallestHistory = 0;
    }

    return stats;
  }
}

module.exports = EvolutionHistory;
