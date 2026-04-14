/**
 * Harness层 - 记忆治理器
 */

const { v4: uuidv4 } = require('uuid');
const { globalEventBus, EventTypes } = require('./event-bus');

const MemoryCategory = {
  FACTUAL: 'factual',
  EXPERIENTIAL: 'experiential',
  CONTEXTUAL: 'contextual',
  META: 'meta'
};

const StorageStrategy = {
  [MemoryCategory.FACTUAL]: { storage: 'persistent', ttl: null },
  [MemoryCategory.EXPERIENTIAL]: { storage: 'persistent', ttl: 365 * 24 * 60 * 60 * 1000 },
  [MemoryCategory.CONTEXTUAL]: { storage: 'ephemeral', ttl: 24 * 60 * 60 * 1000 },
  [MemoryCategory.META]: { storage: 'persistent', ttl: null }
};

class MemoryGovernor {
  constructor(options = {}) {
    this.store = new Map();
    this.indexes = { keyword: new Map(), category: new Map() };
    this.eventBus = options.eventBus || globalEventBus;
    this.stats = { totalMemories: 0, byCategory: {} };
  }
  
  async remember(key, value, metadata = {}) {
    const id = uuidv4();
    const now = new Date();
    const category = metadata.category || MemoryCategory.FACTUAL;
    const strategy = StorageStrategy[category];
    
    const memory = {
      key, id, value,
      metadata: {
        id, source: metadata.source || 'system',
        confidence: metadata.confidence || 0.5,
        tags: metadata.tags || [],
        category, createdAt: now, updatedAt: now,
        accessedAt: null, accessCount: 0,
        expiresAt: strategy.ttl ? new Date(now.getTime() + strategy.ttl) : null,
        version: 1, ...metadata
      }
    };
    
    this.store.set(key, memory);
    this._updateIndexes(memory);
    this._updateStats('add', category);
    
    this.eventBus.publish(EventTypes.MEMORY_STORED, { key, metadata: memory.metadata });
  }
  
  async recall(query) {
    const results = [];
    const seen = new Set();
    
    if (query.keywords && query.keywords.length > 0) {
      const keywordResults = this._searchByKeywords(query.keywords);
      keywordResults.forEach(r => {
        if (!seen.has(r.key)) {
          results.push({ ...r, matchType: 'keyword' });
          seen.add(r.key);
        }
      });
    }
    
    if (query.category) {
      const categoryResults = this._searchByCategory(query.category);
      categoryResults.forEach(r => {
        if (!seen.has(r.key)) {
          results.push({ ...r, matchType: 'category' });
          seen.add(r.key);
        }
      });
    }
    
    const filtered = results.filter(r => {
      const m = r.memory;
      if (m.metadata.expiresAt && new Date() > m.metadata.expiresAt) return false;
      if (query.confidence) {
        if (query.confidence.min && m.metadata.confidence < query.confidence.min) return false;
      }
      return true;
    });
    
    const sorted = filtered.sort((a, b) => b.score - a.score);
    const limit = query.limit || 10;
    
    for (const result of sorted.slice(0, limit)) {
      this._updateAccessStats(result.memory.key);
    }
    
    return sorted.slice(0, limit);
  }
  
  async get(key) {
    const memory = this.store.get(key);
    if (!memory) return null;
    if (memory.metadata.expiresAt && new Date() > memory.metadata.expiresAt) {
      await this.forget(key);
      return null;
    }
    this._updateAccessStats(key);
    return { memory, score: 1, highlights: [] };
  }
  
  async forget(key) {
    const memory = this.store.get(key);
    if (!memory) return false;
    this._removeFromIndexes(memory);
    this.store.delete(key);
    this._updateStats('remove', memory.metadata.category);
    return true;
  }
  
  async extractExperience(projectId) {
    const experiences = [];
    const memories = await this.recall({ tags: [projectId], limit: 100 });
    
    const successMemories = memories.filter(r => r.memory.value?.success === true);
    const failureMemories = memories.filter(r => r.memory.value?.success === false);
    
    if (successMemories.length > 0) {
      experiences.push({
        id: uuidv4(), projectId, type: 'success',
        title: `成功完成项目 ${projectId}`,
        description: `从 ${successMemories.length} 个成功案例中总结`,
        insights: ['建议参考此经验进行类似任务']
      });
    }
    
    if (failureMemories.length > 0) {
      experiences.push({
        id: uuidv4(), projectId, type: 'failure',
        title: `项目 ${projectId} 中的教训`,
        description: `从 ${failureMemories.length} 个失败案例中总结`,
        insights: ['避免类似错误']
      });
    }
    
    return experiences;
  }
  
  async cleanup() {
    const report = { deletedCount: 0, updatedCount: 0, errors: [] };
    const now = new Date();
    
    for (const [key, memory] of this.store.entries()) {
      if (memory.metadata.expiresAt && now > memory.metadata.expiresAt) {
        await this.forget(key);
        report.deletedCount++;
      }
    }
    
    this.eventBus.publish(EventTypes.MEMORY_CLEANED, report);
    return report;
  }
  
  async getStats() {
    return {
      ...this.stats,
      memorySize: Array.from(this.store.values()).reduce(
        (sum, m) => sum + JSON.stringify(m).length, 0
      )
    };
  }
  
  _updateIndexes(memory) {
    const words = this._extractKeywords(memory);
    words.forEach(word => {
      if (!this.indexes.keyword.has(word)) {
        this.indexes.keyword.set(word, new Set());
      }
      this.indexes.keyword.get(word).add(memory.key);
    });
    
    const category = memory.metadata.category;
    if (!this.indexes.category[category]) {
      this.indexes.category[category] = new Set();
    }
    this.indexes.category[category].add(memory.key);
  }
  
  _extractKeywords(memory) {
    const text = `${memory.key} ${JSON.stringify(memory.value)}`;
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can']);
    return [...new Set(words.filter(w => !stopWords.has(w)))];
  }
  
  _searchByKeywords(keywords) {
    const results = [];
    const matchedKeys = new Set();
    
    keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      this.indexes.keyword.forEach((keys, word) => {
        if (word.includes(lowerKeyword)) {
          keys.forEach(key => {
            if (!matchedKeys.has(key)) {
              matchedKeys.add(key);
              results.push({ memory: this.store.get(key), score: 1 });
            }
          });
        }
      });
    });
    
    return results.filter(r => r.memory);
  }
  
  _searchByCategory(category) {
    const keys = this.indexes.category[category] || new Set();
    return Array.from(keys).map(key => ({
      memory: this.store.get(key), score: 1
    })).filter(r => r.memory);
  }
  
  _removeFromIndexes(memory) {
    const words = this._extractKeywords(memory);
    words.forEach(word => {
      const set = this.indexes.keyword.get(word);
      if (set) set.delete(memory.key);
    });
    const category = memory.metadata.category;
    if (this.indexes.category[category]) {
      this.indexes.category[category].delete(memory.key);
    }
  }
  
  _updateAccessStats(key) {
    const memory = this.store.get(key);
    if (memory) {
      memory.metadata.accessedAt = new Date();
      memory.metadata.accessCount++;
      this.stats.totalAccess++;
    }
  }
  
  _updateStats(operation, category) {
    if (operation === 'add') {
      this.stats.totalMemories++;
      this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
    } else if (operation === 'remove') {
      this.stats.totalMemories--;
      this.stats.byCategory[category] = Math.max(0, (this.stats.byCategory[category] || 1) - 1);
    }
  }
}

module.exports = {
  MemoryGovernor,
  MemoryCategory,
  StorageStrategy
};
