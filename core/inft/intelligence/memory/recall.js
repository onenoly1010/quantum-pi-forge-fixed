/**
 * Memory Recall System
 * Intelligent memory retrieval and context building
 * Extracted from mr-nft-agent
 */

const MemoryStorage = require("./storage");

class MemoryRecall {
  constructor(memoryStorage) {
    this.memoryStorage = memoryStorage || new MemoryStorage();
    this.contextCache = new Map();
    this.recallStats = new Map();
  }

  /**
   * Recall memories with context
   */
  async recallWithContext(inftId, query = {}, contextOptions = {}) {
    const recallResult = this.memoryStorage.recallMemories(inftId, query);

    if (recallResult.memories.length === 0) {
      return {
        ...recallResult,
        context: null,
        insights: [],
      };
    }

    // Build context from recalled memories
    const context = await this.buildContext(
      inftId,
      recallResult.memories,
      contextOptions,
    );

    // Generate insights from memory patterns
    const insights = this.generateInsights(recallResult.memories, query);

    // Update recall statistics
    this.updateRecallStats(inftId, recallResult.memories.length, query);

    return {
      ...recallResult,
      context,
      insights,
    };
  }

  /**
   * Build context from memories
   */
  async buildContext(inftId, memories, options = {}) {
    const context = {
      summary: "",
      keyThemes: [],
      emotionalTone: 0,
      temporalSpan: { start: null, end: null },
      relationships: [],
      patterns: [],
    };

    if (memories.length === 0) return context;

    // Calculate temporal span
    const timestamps = memories.map((m) => m.createdAt).sort();
    context.temporalSpan.start = new Date(timestamps[0]).toISOString();
    context.temporalSpan.end = new Date(
      timestamps[timestamps.length - 1],
    ).toISOString();

    // Calculate emotional tone
    const emotions = memories
      .map((m) => m.emotional)
      .filter((e) => e !== undefined);
    context.emotionalTone =
      emotions.length > 0
        ? emotions.reduce((a, b) => a + b, 0) / emotions.length
        : 0;

    // Extract key themes from tags
    const allTags = memories.flatMap((m) => m.tags);
    const tagFrequency = {};
    allTags.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    context.keyThemes = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, frequency: count }));

    // Generate summary
    context.summary = this.generateContextSummary(memories, context);

    // Find relationships between memories
    context.relationships = this.findMemoryRelationships(memories);

    // Identify patterns
    context.patterns = this.identifyMemoryPatterns(memories);

    // Cache context for future use
    const cacheKey = `${inftId}_${JSON.stringify(options)}_${memories.length}`;
    this.contextCache.set(cacheKey, {
      context,
      timestamp: Date.now(),
      memoryCount: memories.length,
    });

    return context;
  }

  /**
   * Generate context summary
   */
  generateContextSummary(memories, context) {
    const memoryCount = memories.length;
    const timeSpan = this.calculateTimeSpan(context.temporalSpan);
    const avgImportance =
      memories.reduce((sum, m) => sum + m.importance, 0) / memoryCount;

    let summary = `This context spans ${memoryCount} memories over ${timeSpan}. `;

    if (context.keyThemes.length > 0) {
      const topThemes = context.keyThemes
        .slice(0, 3)
        .map((t) => t.tag)
        .join(", ");
      summary += `Key themes include: ${topThemes}. `;
    }

    const emotionalDesc =
      context.emotionalTone > 0.2
        ? "positive"
        : context.emotionalTone < -0.2
          ? "negative"
          : "neutral";
    summary += `Overall emotional tone is ${emotionalDesc}. `;

    if (avgImportance > 0.7) {
      summary += "These are highly significant memories.";
    } else if (avgImportance > 0.4) {
      summary += "These are moderately important memories.";
    } else {
      summary += "These are less significant memories.";
    }

    return summary;
  }

  /**
   * Calculate human-readable time span
   */
  calculateTimeSpan(temporalSpan) {
    if (!temporalSpan.start || !temporalSpan.end) return "unknown period";

    const start = new Date(temporalSpan.start);
    const end = new Date(temporalSpan.end);
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "less than a day";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;

    return `${Math.floor(diffDays / 365)} years`;
  }

  /**
   * Find relationships between memories
   */
  findMemoryRelationships(memories) {
    const relationships = [];

    // Group memories by type
    const byType = {};
    memories.forEach((memory) => {
      if (!byType[memory.type]) byType[memory.type] = [];
      byType[memory.type].push(memory);
    });

    // Find type clusters
    Object.entries(byType).forEach(([type, typeMemories]) => {
      if (typeMemories.length >= 3) {
        relationships.push({
          type: "type_cluster",
          description: `${typeMemories.length} ${type} memories clustered together`,
          memories: typeMemories.map((m) => m.id),
        });
      }
    });

    // Find temporal clusters (memories close in time)
    const sortedByTime = memories.sort((a, b) => a.createdAt - b.createdAt);
    const clusters = [];
    let currentCluster = [sortedByTime[0]];

    for (let i = 1; i < sortedByTime.length; i++) {
      const timeDiff =
        sortedByTime[i].createdAt - sortedByTime[i - 1].createdAt;
      if (timeDiff < 24 * 60 * 60 * 1000) {
        // Within 24 hours
        currentCluster.push(sortedByTime[i]);
      } else {
        if (currentCluster.length >= 2) {
          clusters.push(currentCluster);
        }
        currentCluster = [sortedByTime[i]];
      }
    }

    if (currentCluster.length >= 2) {
      clusters.push(currentCluster);
    }

    clusters.forEach((cluster) => {
      relationships.push({
        type: "temporal_cluster",
        description: `${cluster.length} memories from the same time period`,
        memories: cluster.map((m) => m.id),
      });
    });

    return relationships;
  }

  /**
   * Identify memory patterns
   */
  identifyMemoryPatterns(memories) {
    const patterns = [];

    // Emotional pattern
    const emotions = memories
      .map((m) => m.emotional)
      .filter((e) => e !== undefined);
    if (emotions.length >= 3) {
      const trend = this.calculateTrend(emotions);
      if (Math.abs(trend) > 0.1) {
        patterns.push({
          type: "emotional_trend",
          description: `Emotional state ${trend > 0 ? "improving" : "declining"} over time`,
          strength: Math.abs(trend),
        });
      }
    }

    // Importance pattern
    const importances = memories.map((m) => m.importance);
    if (importances.length >= 3) {
      const avgImportance =
        importances.reduce((a, b) => a + b, 0) / importances.length;
      if (avgImportance > 0.8) {
        patterns.push({
          type: "high_importance",
          description: "Consistently high-importance memories",
          average: avgImportance,
        });
      }
    }

    // Frequency pattern
    if (memories.length >= 5) {
      const timeDiffs = [];
      const sorted = memories.sort((a, b) => a.createdAt - b.createdAt);

      for (let i = 1; i < sorted.length; i++) {
        timeDiffs.push(sorted[i].createdAt - sorted[i - 1].createdAt);
      }

      const avgInterval =
        timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      const regularity = this.calculateRegularity(timeDiffs, avgInterval);

      if (regularity > 0.7) {
        patterns.push({
          type: "regular_frequency",
          description: "Memories created at regular intervals",
          regularity: regularity,
        });
      }
    }

    return patterns;
  }

  /**
   * Calculate trend in values
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;

    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((acc, val, idx) => acc + val * values[idx], 0);
    const sumXX = indices.reduce((acc, val) => acc + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = n * sumXX - sumX * sumX;

    return denominator !== 0 ? numerator / denominator : 0;
  }

  /**
   * Calculate regularity of intervals
   */
  calculateRegularity(intervals, average) {
    if (intervals.length < 2) return 0;

    const variances = intervals.map((interval) =>
      Math.pow((interval - average) / average, 2),
    );
    const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;

    // Return regularity score (1 = perfectly regular, 0 = completely irregular)
    return Math.max(0, 1 - avgVariance);
  }

  /**
   * Generate insights from memories
   */
  generateInsights(memories, query) {
    const insights = [];

    if (memories.length === 0) {
      return ["No memories found matching the query"];
    }

    // Query effectiveness insight
    const queryEffectiveness = memories.length / (query.limit || 10);
    if (queryEffectiveness < 0.5) {
      insights.push(
        "Query returned fewer results than requested - consider broadening search criteria",
      );
    }

    // Memory age insight
    const now = Date.now();
    const avgAge =
      memories.reduce((sum, m) => sum + (now - m.createdAt), 0) /
      memories.length;
    const avgAgeDays = avgAge / (1000 * 60 * 60 * 24);

    if (avgAgeDays < 1) {
      insights.push("These are very recent memories");
    } else if (avgAgeDays < 7) {
      insights.push("These memories are from the past week");
    } else if (avgAgeDays < 30) {
      insights.push("These memories are from the past month");
    } else {
      insights.push(
        `These memories average ${Math.round(avgAgeDays)} days old`,
      );
    }

    // Emotional insight
    const avgEmotion =
      memories.reduce((sum, m) => sum + (m.emotional || 0), 0) /
      memories.length;
    if (Math.abs(avgEmotion) > 0.3) {
      const tone = avgEmotion > 0 ? "positive" : "negative";
      insights.push(`Overall emotional tone of these memories is ${tone}`);
    }

    // Pattern insights
    const typeCounts = {};
    memories.forEach((m) => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });

    const dominantType = Object.entries(typeCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];
    if (dominantType && dominantType[1] > memories.length * 0.5) {
      insights.push(`Most of these memories are of type: ${dominantType[0]}`);
    }

    return insights;
  }

  /**
   * Update recall statistics
   */
  updateRecallStats(inftId, returnedCount, query) {
    const stats = this.recallStats.get(inftId) || {
      totalRecalls: 0,
      totalMemoriesReturned: 0,
      queryTypes: {},
      averageRecallSize: 0,
    };

    stats.totalRecalls++;
    stats.totalMemoriesReturned += returnedCount;

    if (query.type) {
      stats.queryTypes[query.type] = (stats.queryTypes[query.type] || 0) + 1;
    }

    stats.averageRecallSize = stats.totalMemoriesReturned / stats.totalRecalls;

    this.recallStats.set(inftId, stats);
  }

  /**
   * Get recall statistics
   */
  getRecallStats(inftId) {
    return (
      this.recallStats.get(inftId) || {
        totalRecalls: 0,
        totalMemoriesReturned: 0,
        queryTypes: {},
        averageRecallSize: 0,
      }
    );
  }

  /**
   * Clear context cache
   */
  clearContextCache() {
    this.contextCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      contextCacheSize: this.contextCache.size,
      recallStatsSize: this.recallStats.size,
    };
  }
}

module.exports = MemoryRecall;
