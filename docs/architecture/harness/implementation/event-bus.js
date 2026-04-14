/**
 * Harness层 - 事件总线
 * 统一事件系统，支持事件发布、订阅和路由
 */

const { EventEmitter } = require('events');

// 事件类型定义
const EventTypes = {
  // 质量事件
  QUALITY_ASSESS_STARTED: 'quality.assess.started',
  QUALITY_ASSESS_COMPLETED: 'quality.assess.completed',
  QUALITY_CHECK_FAILED: 'quality.check.failed',
  
  // 行为事件
  BEHAVIOR_PERMISSION_CHECK: 'behavior.permission.check',
  BEHAVIOR_RISK_ASSESSED: 'behavior.risk.assessed',
  BEHAVIOR_ACTION_BLOCKED: 'behavior.action.blocked',
  
  // 记忆事件
  MEMORY_STORED: 'memory.stored',
  MEMORY_RETRIEVED: 'memory.retrieved',
  MEMORY_CLEANED: 'memory.cleaned',
  
  // 稳定性事件
  STABILITY_EXCEPTION: 'stability.exception',
  STABILITY_RECOVERED: 'stability.recovered',
  STABILITY_ALERT_TRIGGERED: 'stability.alert.triggered',
  STABILITY_METRIC_RECORDED: 'stability.metric.recorded',
  
  // Agent事件
  AGENT_EXECUTION_STARTED: 'agent.execution.started',
  AGENT_EXECUTION_COMPLETED: 'agent.execution.completed',
  AGENT_EXECUTION_FAILED: 'agent.execution.failed'
};

/**
 * 事件总线类
 */
class EventBus extends EventEmitter {
  constructor(options = {}) {
    super();
    this.setMaxListeners(options.maxListeners || 100);
    this.eventHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
  }
  
  publish(eventType, data) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data,
      timestamp: new Date()
    };
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    setImmediate(() => this.emit(eventType, event));
    return event;
  }
  
  async publishSync(eventType, data) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data,
      timestamp: new Date()
    };
    this.eventHistory.push(event);
    const handlers = this.listeners(eventType);
    await Promise.all(handlers.map(handler => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Event handler error:`, error.message);
        return Promise.resolve();
      }
    }));
    return event;
  }
  
  subscribe(eventType, handler, options = {}) {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (options.once) {
      this.once(eventType, handler);
    } else {
      this.on(eventType, handler);
    }
    return subscriptionId;
  }
  
  getHistory(eventType = null, limit = 100) {
    let history = this.eventHistory;
    if (eventType) {
      history = history.filter(e => e.type === eventType);
    }
    return history.slice(-limit);
  }
}

const globalEventBus = new EventBus();

module.exports = {
  EventBus,
  EventTypes,
  globalEventBus
};
