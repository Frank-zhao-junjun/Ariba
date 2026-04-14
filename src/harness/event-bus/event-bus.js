/**
 * EventBus - 统一事件总线
 * 用于Harness层各模块间的通信
 */

class EventBus {
  constructor(options = {}) {
    this.subscribers = new Map();
    this.history = [];
    this.maxHistorySize = options.maxHistorySize || 100;
  }

  on(eventName, handler) {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    this.subscribers.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const handlers = this.subscribers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscribers.delete(eventName);
      }
    }
  }

  emit(eventName, data) {
    const handlers = this.subscribers.get(eventName);
    let processedCount = 0;

    if (handlers && handlers.size > 0) {
      const eventRecord = {
        name: eventName,
        data: data,
        timestamp: new Date().toISOString(),
        handlerCount: handlers.size
      };

      handlers.forEach(handler => {
        try {
          handler(data);
          processedCount++;
        } catch (error) {
          console.error('[EventBus] Handler error for "' + eventName + '":', error.message);
        }
      });

      eventRecord.processedCount = processedCount;
      this.history.push(eventRecord);

      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    }

    return processedCount;
  }

  once(eventName, handler) {
    const wrapper = (data) => {
      this.off(eventName, wrapper);
      handler(data);
    };
    this.on(eventName, wrapper);
  }

  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  clearHistory() {
    this.history = [];
  }

  getStats() {
    const stats = {
      totalEvents: this.subscribers.size,
      eventTypes: []
    };

    this.subscribers.forEach((handlers, eventName) => {
      stats.eventTypes.push({
        name: eventName,
        handlerCount: handlers.size
      });
    });

    return stats;
  }
}

const eventBus = new EventBus();

module.exports = {
  EventBus,
  eventBus
};
