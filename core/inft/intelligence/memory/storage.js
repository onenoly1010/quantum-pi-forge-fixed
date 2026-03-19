/**
 * Memory Storage System
 * Manages iNFT memories and recall
 * Extracted from mr-nft-agent
 */

class MemoryStorage {
  constructor() {
    this.memories = new Map(); // inftId -> memories array
    this.memoryIndex = new Map(); // inftId -> memory index
    this.maxMemoriesPerINFT = 1000;
    this.consolidationThreshold = 100; // Consolidate when reaching this
  }

  /**
   * Store memory for iNFT
   */
  storeMemory(inftId, memoryData) {
    const memoryId = `memory_${inftId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const memory = {
      id: memoryId,
      inftId,
      type: memoryData.type || "general",
      content: memoryData.content,
      importance: memoryData.importance || 0.5,
      emotional: memoryData.emotional || 0,
      tags: memoryData.tags || [],
      context: memoryData.context || {},
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      consolidated: false,
    };

    // Get or create memories array
    const memories = this.memories.get(inftId) || [];
    memories.push(memory);

    // Maintain max memories limit
    if (memories.length > this.maxMemoriesPerINFT) {
      this.consolidateMemories(inftId);
    }

    this.memories.set(inftId, memories);

    // Update index
    this.updateMemoryIndex(inftId, memory);

    return memoryId;
  }

  /**
   * Recall memories based on query
   */
  recallMemories(inftId, query = {}) {
    const memories = this.memories.get(inftId) || [];

    let filtered = [...memories];

    // Filter by type
    if (query.type) {
      filtered = filtered.filter((m) => m.type === query.type);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter((m) =>
        query.tags.some((tag) => m.tags.includes(tag)),
      );
    }

    // Filter by importance
    if (query.minImportance !== undefined) {
      filtered = filtered.filter((m) => m.importance >= query.minImportance);
    }

    // Filter by time range
    if (query.since) {
      filtered = filtered.filter((m) => m.createdAt >= query.since);
    }

    if (query.until) {
      filtered = filtered.filter((m) => m.createdAt <= query.until);
    }

    // Filter by emotional range
    if (query.emotionalRange) {
      const { min, max } = query.emotionalRange;
      filtered = filtered.filter(
        (m) => m.emotional >= min && m.emotional <= max,
      );
    }

    // Sort by relevance (importance + recency + access frequency)
    filtered.forEach((memory) => {
      const recencyScore = Math.max(
        0,
        1 - (Date.now() - memory.lastAccessed) / (30 * 24 * 60 * 60 * 1000),
      ); // 30 days
      const accessScore = Math.min(1, memory.accessCount / 10); // Max score at 10 accesses
      memory.relevanceScore =
        memory.importance * 0.5 + recencyScore * 0.3 + accessScore * 0.2;
    });

    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Update access stats for returned memories
    const limit = query.limit || 10;
    const results = filtered.slice(0, limit);

    results.forEach((memory) => {
      memory.lastAccessed = Date.now();
      memory.accessCount++;
    });

    return {
      query,
      total: filtered.length,
      returned: results.length,
      memories: results,
    };
  }

  /**
   * Get memory by ID
   */
  getMemory(inftId, memoryId) {
    const memories = this.memories.get(inftId) || [];
    const memory = memories.find((m) => m.id === memoryId);

    if (memory) {
      memory.lastAccessed = Date.now();
      memory.accessCount++;
      return memory;
    }

    return null;
  }

  /**
   * Update memory
   */
  updateMemory(inftId, memoryId, updates) {
    const memories = this.memories.get(inftId) || [];
    const index = memories.findIndex((m) => m.id === memoryId);

    if (index !== -1) {
      memories[index] = {
        ...memories[index],
        ...updates,
        lastModified: Date.now(),
      };

      // Update index if tags changed
      if (updates.tags) {
        this.updateMemoryIndex(inftId, memories[index]);
      }

      return true;
    }

    return false;
  }

  /**
   * Delete memory
   */
  deleteMemory(inftId, memoryId) {
    const memories = this.memories.get(inftId) || [];
    const filtered = memories.filter((m) => m.id !== memoryId);

    if (filtered.length < memories.length) {
      this.memories.set(inftId, filtered);
      this.removeFromIndex(inftId, memoryId);
      return true;
    }

    return false;
  }

  /**
   * Consolidate memories when limit reached
   */
  consolidateMemories(inftId) {
    const memories = this.memories.get(inftId) || [];

    // Sort by importance and recency
    memories.forEach((memory) => {
      const age = Date.now() - memory.createdAt;
      const ageScore = Math.max(0, 1 - age / (365 * 24 * 60 * 60 * 1000)); // 1 year
      memory.consolidationScore = memory.importance * 0.6 + ageScore * 0.4;
    });

    memories.sort((a, b) => b.consolidationScore - a.consolidationScore);

    // Keep top 80%, consolidate bottom 20%
    const keepCount = Math.floor(memories.length * 0.8);
    const toConsolidate = memories.slice(keepCount);

    // Create consolidated memory from low-importance ones
    if (toConsolidate.length > 1) {
      const consolidated = {
        id: `consolidated_${inftId}_${Date.now()}`,
        inftId,
        type: "consolidated",
        content: `Consolidated ${toConsolidate.length} memories from ${new Date(toConsolidate[0].createdAt).toISOString().split("T")[0]} to ${new Date(toConsolidate[toConsolidate.length - 1].createdAt).toISOString().split("T")[0]}`,
        importance:
          toConsolidate.reduce((sum, m) => sum + m.importance, 0) /
          toConsolidate.length,
        emotional:
          toConsolidate.reduce((sum, m) => sum + m.emotional, 0) /
          toConsolidate.length,
        tags: [...new Set(toConsolidate.flatMap((m) => m.tags))],
        context: { consolidatedCount: toConsolidate.length },
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0,
        consolidated: true,
      };

      // Replace consolidated memories with single consolidated memory
      memories.splice(keepCount, toConsolidate.length, consolidated);

      // Update index
      this.updateMemoryIndex(inftId, consolidated);
    }

    this.memories.set(inftId, memories);
  }

  /**
   * Update memory index for searching
   */
  updateMemoryIndex(inftId, memory) {
    const index = this.memoryIndex.get(inftId) || {
      byType: {},
      byTag: {},
      byImportance: { high: [], medium: [], low: [] },
    };

    // Index by type
    if (!index.byType[memory.type]) {
      index.byType[memory.type] = [];
    }
    index.byType[memory.type].push(memory.id);

    // Index by tags
    memory.tags.forEach((tag) => {
      if (!index.byTag[tag]) {
        index.byTag[tag] = [];
      }
      index.byTag[tag].push(memory.id);
    });

    // Index by importance
    let importanceLevel;
    if (memory.importance >= 0.7) importanceLevel = "high";
    else if (memory.importance >= 0.4) importanceLevel = "medium";
    else importanceLevel = "low";

    index.byImportance[importanceLevel].push(memory.id);

    this.memoryIndex.set(inftId, index);
  }

  /**
   * Remove memory from index
   */
  removeFromIndex(inftId, memoryId) {
    const index = this.memoryIndex.get(inftId);
    if (!index) return;

    // Remove from all index categories
    Object.keys(index.byType).forEach((type) => {
      index.byType[type] = index.byType[type].filter((id) => id !== memoryId);
    });

    Object.keys(index.byTag).forEach((tag) => {
      index.byTag[tag] = index.byTag[tag].filter((id) => id !== memoryId);
    });

    Object.keys(index.byImportance).forEach((level) => {
      index.byImportance[level] = index.byImportance[level].filter(
        (id) => id !== memoryId,
      );
    });
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(inftId) {
    const memories = this.memories.get(inftId) || [];
    const index = this.memoryIndex.get(inftId) || {
      byType: {},
      byTag: {},
      byImportance: {},
    };

    const stats = {
      totalMemories: memories.length,
      byType: Object.keys(index.byType).reduce((acc, type) => {
        acc[type] = index.byType[type].length;
        return acc;
      }, {}),
      byImportance: Object.keys(index.byImportance).reduce((acc, level) => {
        acc[level] = index.byImportance[level].length;
        return acc;
      }, {}),
      totalTags: Object.keys(index.byTag).length,
      averageImportance:
        memories.length > 0
          ? memories.reduce((sum, m) => sum + m.importance, 0) / memories.length
          : 0,
      oldestMemory:
        memories.length > 0
          ? new Date(
              Math.min(...memories.map((m) => m.createdAt)),
            ).toISOString()
          : null,
      newestMemory:
        memories.length > 0
          ? new Date(
              Math.max(...memories.map((m) => m.createdAt)),
            ).toISOString()
          : null,
    };

    return stats;
  }

  /**
   * Search memories across iNFTs (admin function)
   */
  searchAllMemories(query = {}) {
    const results = [];

    for (const [inftId, memories] of this.memories.entries()) {
      const recallResult = this.recallMemories(inftId, query);
      if (recallResult.memories.length > 0) {
        results.push({
          inftId,
          memories: recallResult.memories,
        });
      }
    }

    return results;
  }

  /**
   * Clear all memories for iNFT
   */
  clearMemories(inftId) {
    this.memories.delete(inftId);
    this.memoryIndex.delete(inftId);
    return true;
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    const stats = {
      totalINFTs: this.memories.size,
      totalMemories: 0,
      averageMemoriesPerINFT: 0,
      memoryTypes: {},
      totalTags: 0,
    };

    for (const memories of this.memories.values()) {
      stats.totalMemories += memories.length;

      memories.forEach((memory) => {
        if (!stats.memoryTypes[memory.type]) {
          stats.memoryTypes[memory.type] = 0;
        }
        stats.memoryTypes[memory.type]++;
      });
    }

    if (stats.totalINFTs > 0) {
      stats.averageMemoriesPerINFT = stats.totalMemories / stats.totalINFTs;
    }

    // Count unique tags across all iNFTs
    const allTags = new Set();
    for (const index of this.memoryIndex.values()) {
      Object.keys(index.byTag).forEach((tag) => allTags.add(tag));
    }
    stats.totalTags = allTags.size;

    return stats;
  }
}

module.exports = MemoryStorage;
