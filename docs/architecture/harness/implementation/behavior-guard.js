/**
 * Harness层 - 行为规范器
 */

const { globalEventBus, EventTypes } = require('./event-bus');

const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const DefaultGuardrails = {
  whitelistMode: true,
  ALLOWED: {
    query: true, search: true, list: true, get: true,
    analyze: true, evaluate: true, assess: true,
    generate: true, create_draft: true, recommend: true,
    validate: true, check: true, verify: true,
    submit: true, send: true
  },
  FORBIDDEN: ['delete_production_data', 'bypass_approval', 'modify_security_settings'],
  DANGEROUS: {
    batch_update: { threshold: 10, confirmationMessage: '批量更新操作' },
    bulk_delete: { threshold: 1, confirmationMessage: '删除操作' },
    export_sensitive: { threshold: 1, confirmationMessage: '敏感数据导出' }
  }
};

const RiskFactorWeights = {
  dataSensitivity: 0.30,
  operationScope: 0.25,
  reversibility: 0.20,
  operationFrequency: 0.15,
  historicalRecord: 0.10
};

class BehaviorGuard {
  constructor(options = {}) {
    this.roles = new Map();
    this.guardrails = { ...DefaultGuardrails, ...options.guardrails };
    this.eventBus = options.eventBus || globalEventBus;
    this.auditLog = [];
    this._registerBuiltInRoles();
  }
  
  async checkPermission(context) {
    if (this.guardrails.FORBIDDEN.includes(context.action)) {
      const result = { allowed: false, reason: `操作 ${context.action} 被禁止` };
      this._audit('permission.denied', context, result);
      return result;
    }
    
    if (this.guardrails.whitelistMode && !this.guardrails.ALLOWED[context.action]) {
      const result = { allowed: false, reason: `操作 ${context.action} 不在允许列表` };
      this._audit('permission.denied', context, result);
      return result;
    }
    
    const result = { allowed: true };
    this._audit('permission.check', context, result);
    return result;
  }
  
  async assessRisk(action) {
    const factors = [];
    let totalScore = 0;
    
    const dataSensitivity = this._assessDataSensitivity(action);
    factors.push(dataSensitivity);
    totalScore += dataSensitivity.value * RiskFactorWeights.dataSensitivity;
    
    const operationScope = this._assessOperationScope(action);
    factors.push(operationScope);
    totalScore += operationScope.value * RiskFactorWeights.operationScope;
    
    const reversibility = this._assessReversibility(action);
    factors.push(reversibility);
    totalScore += reversibility.value * RiskFactorWeights.reversibility;
    
    let level;
    if (totalScore <= 25) level = RiskLevel.LOW;
    else if (totalScore <= 50) level = RiskLevel.MEDIUM;
    else if (totalScore <= 75) level = RiskLevel.HIGH;
    else level = RiskLevel.CRITICAL;
    
    return { level, score: Math.round(totalScore), factors };
  }
  
  async interceptDangerous(action) {
    const dangerousConfig = this.guardrails.DANGEROUS[action.type];
    if (!dangerousConfig) return { blocked: false };
    
    const affectedCount = action.parameters?.recordCount || 1;
    if (affectedCount >= dangerousConfig.threshold) {
      return {
        blocked: true,
        reason: dangerousConfig.confirmationMessage,
        confirmationRequired: true
      };
    }
    return { blocked: false };
  }
  
  registerRole(role) {
    if (!role.id || !role.name) throw new Error('Invalid role');
    this.roles.set(role.id, role);
  }
  
  _registerBuiltInRoles() {
    this.registerRole({
      id: 'ariba-data-agent',
      name: 'Ariba数据Agent',
      permissions: [
        { action: 'query', targetPattern: 'pr:*|po:*|contract:*' },
        { action: 'analyze', targetPattern: '*' }
      ],
      restrictions: [
        { action: 'delete', reason: '无权删除数据', severity: 'error' }
      ]
    });
  }
  
  _assessDataSensitivity(action) {
    const sensitivePatterns = ['password', 'secret', 'token', 'ssn'];
    const targetLower = (action.target || '').toLowerCase();
    let level = 'public';
    if (sensitivePatterns.some(p => targetLower.includes(p))) level = 'restricted';
    const values = { public: 0, internal: 20, confidential: 50, restricted: 80 };
    return { name: 'dataSensitivity', weight: 0.30, level, value: values[level] };
  }
  
  _assessOperationScope(action) {
    const affectedCount = action.parameters?.recordCount || 1;
    let level = affectedCount === 1 ? 'single' :
                affectedCount <= 10 ? 'few' :
                affectedCount <= 100 ? 'many' : 'bulk';
    const values = { single: 10, few: 30, many: 60, bulk: 90 };
    return { name: 'operationScope', weight: 0.25, level, value: values[level] };
  }
  
  _assessReversibility(action) {
    const reversibleActions = ['query', 'analyze', 'generate'];
    let level = reversibleActions.includes(action.type) ? 'reversible' :
                action.type.includes('delete') ? 'irreversible' : 'difficult';
    const values = { reversible: 0, complex: 40, difficult: 70, irreversible: 100 };
    return { name: 'reversibility', weight: 0.20, level, value: values[level] };
  }
  
  _audit(eventType, context, result) {
    this.auditLog.push({ eventType, timestamp: new Date(), agentId: context.agentId, 
      action: context.action, result });
    if (this.auditLog.length > 10000) this.auditLog.shift();
  }
}

module.exports = {
  BehaviorGuard,
  RiskLevel,
  DefaultGuardrails
};
