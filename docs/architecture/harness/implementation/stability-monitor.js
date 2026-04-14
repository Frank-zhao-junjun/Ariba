/**
 * Harness层 - 稳定保障器
 */

const { v4: uuidv4 } = require('uuid');
const { globalEventBus, EventTypes } = require('./event-bus');

const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

const ErrorClassification = {
  RETRYABLE: ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE', 'RATE_LIMIT'],
  NON_RETRYABLE: ['INVALID_INPUT', 'PERMISSION_DENIED', 'VALIDATION_ERROR'],
  DANGEROUS: ['DATA_CORRUPTION', 'SECURITY_BREACH', 'AUTHENTICATION_BYPASS']
};

const DefaultRetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoff: 'exponential',
  jitter: true
};

const DefaultAlertConditions = [
  { id: 'alert-001', name: '响应时间过长', metric: 'response_time', operator: '>', threshold: 5000, severity: AlertSeverity.WARNING },
  { id: 'alert-002', name: '错误率过高', metric: 'error_rate', operator: '>', threshold: 5, severity: AlertSeverity.ERROR },
  { id: 'alert-005', name: '服务不可用', metric: 'health_check', operator: '==', threshold: 0, severity: AlertSeverity.CRITICAL }
];

class StabilityMonitor {
  constructor(options = {}) {
    this.eventBus = options.eventBus || globalEventBus;
    this.metrics = new Map();
    this.metricBuffer = [];
    this.alertConditions = new Map();
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.errorStats = { total: 0, byType: {}, byAgent: {} };
    this._initAlertConditions();
  }
  
  async captureException(error, context) {
    const errorId = uuidv4();
    const errorType = this._classifyError(error);
    
    const errorContext = {
      errorId, errorType,
      message: error.message,
      stack: error.stack,
      agentId: context.agentId || 'unknown',
      taskId: context.taskId || 'unknown',
      phase: context.phase || 'unknown',
      timestamp: new Date()
    };
    
    this._updateErrorStats(errorType, context.agentId);
    this.eventBus.publish(EventTypes.STABILITY_EXCEPTION, errorContext);
    
    if (ErrorClassification.DANGEROUS.includes(errorType)) {
      await this._triggerAlert({
        id: `dangerous-error-${errorId}`,
        condition: { name: '危险错误', severity: AlertSeverity.CRITICAL },
        currentValue: 1,
        triggeredAt: new Date()
      });
    }
    
    return errorContext;
  }
  
  async recover(error, strategy, operation) {
    if (strategy.type === 'retry') {
      return await this._executeWithRetry(operation, strategy.config);
    }
    throw error;
  }
  
  async _executeWithRetry(operation, config) {
    config = { ...DefaultRetryConfig, ...config };
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation();
        return { recovered: true, strategy: 'retry', attempts: attempt + 1, result };
      } catch (error) {
        lastError = error;
        if (attempt < config.maxRetries) {
          const delay = this._calculateBackoff(attempt, config);
          await this._sleep(delay);
        }
      }
    }
    
    return { recovered: false, strategy: 'retry', attempts: config.maxRetries + 1, error: lastError?.message };
  }
  
  _calculateBackoff(attempt, config) {
    let delay = config.initialDelay * Math.pow(2, attempt);
    if (config.jitter) delay = delay * (0.5 + Math.random() * 0.5);
    return Math.min(delay, config.maxDelay);
  }
  
  async recordMetric(metric) {
    const normalizedMetric = {
      name: metric.name,
      value: metric.value,
      unit: metric.unit || 'count',
      timestamp: metric.timestamp || new Date(),
      tags: metric.tags || {}
    };
    
    this.metricBuffer.push(normalizedMetric);
    this._updateMetricAggregations(normalizedMetric);
    this.eventBus.publish(EventTypes.STABILITY_METRIC_RECORDED, normalizedMetric);
    await this._checkAlertConditions();
  }
  
  async checkAlert(conditions) {
    const triggeredAlerts = [];
    for (const condition of conditions) {
      const currentValue = await this._getMetricValue(condition.metric);
      if (currentValue !== null && this._evaluateCondition(currentValue, condition)) {
        const alert = await this._triggerAlert({
          id: `alert-${condition.id}-${Date.now()}`,
          condition,
          currentValue,
          triggeredAt: new Date()
        });
        triggeredAlerts.push(alert);
      }
    }
    return triggeredAlerts;
  }
  
  async getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      checks: [],
      version: '1.0.0'
    };
  }
  
  getErrorStats() {
    return { ...this.errorStats };
  }
  
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }
  
  _initAlertConditions() {
    DefaultAlertConditions.forEach(condition => {
      this.alertConditions.set(condition.id, condition);
    });
  }
  
  _classifyError(error) {
    const message = (error.message || '').toLowerCase();
    for (const type of ErrorClassification.RETRYABLE) {
      if (message.includes(type.toLowerCase().replace('_', ' '))) return type;
    }
    for (const type of ErrorClassification.NON_RETRYABLE) {
      if (message.includes(type.toLowerCase().replace('_', ' '))) return type;
    }
    return error.constructor.name.toUpperCase();
  }
  
  _updateErrorStats(errorType, agentId) {
    this.errorStats.total++;
    this.errorStats.byType[errorType] = (this.errorStats.byType[errorType] || 0) + 1;
    if (agentId) {
      if (!this.errorStats.byAgent[agentId]) this.errorStats.byAgent[agentId] = { total: 0 };
      this.errorStats.byAgent[agentId].total++;
    }
  }
  
  _updateMetricAggregations(metric) {
    const key = metric.name;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, { values: [], lastUpdated: null });
    }
    const agg = this.metrics.get(key);
    agg.values.push({ value: metric.value, timestamp: metric.timestamp });
    agg.lastUpdated = metric.timestamp;
    if (agg.values.length > 1000) agg.values.shift();
  }
  
  async _getMetricValue(metricName) {
    const agg = this.metrics.get(metricName);
    if (!agg || agg.values.length === 0) return null;
    const recent = agg.values.slice(-10);
    return recent.reduce((sum, v) => sum + v.value, 0) / recent.length;
  }
  
  _evaluateCondition(value, condition) {
    switch (condition.operator) {
      case '>': return value > condition.threshold;
      case '<': return value < condition.threshold;
      case '>=': return value >= condition.threshold;
      case '<=': return value <= condition.threshold;
      case '==': return value === condition.threshold;
      case '!=': return value !== condition.threshold;
      default: return false;
    }
  }
  
  async _triggerAlert(alert) {
    const existingAlert = this.activeAlerts.get(alert.condition.id);
    if (existingAlert && !existingAlert.resolvedAt) return existingAlert;
    
    this.activeAlerts.set(alert.condition.id, alert);
    this.alertHistory.push(alert);
    if (this.alertHistory.length > 1000) this.alertHistory.shift();
    
    this.eventBus.publish(EventTypes.STABILITY_ALERT_TRIGGERED, alert);
    
    if (alert.condition.severity === AlertSeverity.CRITICAL) {
      console.error('[CRITICAL ALERT]', alert);
    }
    
    return alert;
  }
  
  async _checkAlertConditions() {
    for (const [id, condition] of this.alertConditions.entries()) {
      const currentValue = await this._getMetricValue(condition.metric);
      if (currentValue !== null && this._evaluateCondition(currentValue, condition)) {
        await this._triggerAlert({
          id: `alert-${id}-${Date.now()}`,
          condition,
          currentValue,
          triggeredAt: new Date()
        });
      }
    }
  }
  
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = {
  StabilityMonitor,
  AlertSeverity,
  ErrorClassification,
  DefaultAlertConditions,
  DefaultRetryConfig
};
