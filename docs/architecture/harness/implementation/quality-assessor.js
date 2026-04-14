/**
 * Harness层 - 质量评估器
 */

const { v4: uuidv4 } = require('uuid');
const { globalEventBus, EventTypes } = require('./event-bus');

const QualityLevel = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

const Severity = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor'
};

const SeverityWeights = {
  [Severity.CRITICAL]: 30,
  [Severity.MAJOR]: 10,
  [Severity.MINOR]: 3
};

class QualityAssessor {
  constructor(options = {}) {
    this.rules = new Map();
    this.eventBus = options.eventBus || globalEventBus;
    this._registerBuiltInRules();
  }
  
  async assessQuality(context) {
    const assessmentId = uuidv4();
    const findings = [];
    const applicableRules = this._getApplicableRules(context);
    
    for (const rule of applicableRules) {
      try {
        const result = await rule.check(context);
        if (!result.passed) {
          result.findings.forEach(finding => {
            findings.push({
              id: uuidv4(),
              ruleId: rule.id,
              severity: rule.severity,
              category: rule.category,
              title: finding.title || rule.name,
              description: finding.message,
              location: finding.field || 'unknown'
            });
          });
        }
      } catch (error) {
        console.error(`Rule ${rule.id} failed:`, error.message);
      }
    }
    
    const score = Math.max(0, 100 - findings.reduce((sum, f) => 
      sum + (SeverityWeights[f.severity] || 10), 0));
    
    const level = score >= 90 ? QualityLevel.EXCELLENT :
                  score >= 70 ? QualityLevel.GOOD :
                  score >= 50 ? QualityLevel.WARNING : QualityLevel.CRITICAL;
    
    return {
      id: assessmentId,
      timestamp: new Date(),
      context,
      score,
      level,
      findings,
      recommendations: this._generateRecommendations(findings)
    };
  }
  
  async validateConfig(config) {
    const errors = [];
    const requiredFields = ['name', 'type'];
    for (const field of requiredFields) {
      if (!config[field]) {
        errors.push({ field, message: `字段 ${field} 为必填项`, code: 'REQUIRED_FIELD' });
      }
    }
    return { valid: errors.length === 0, errors, warnings: [] };
  }
  
  registerRule(rule) {
    if (!rule.id || !rule.name || !rule.check) {
      throw new Error('Invalid rule: must have id, name, and check function');
    }
    rule.severity = rule.severity || Severity.MAJOR;
    rule.category = rule.category || 'general';
    rule.enabled = rule.enabled !== false;
    this.rules.set(rule.id, rule);
  }
  
  getRules() {
    return Array.from(this.rules.values());
  }
  
  _registerBuiltInRules() {
    this.registerRule({
      id: 'CFG-001',
      name: '必填字段检查',
      description: '验证必填字段是否已配置',
      category: 'configuration',
      severity: Severity.CRITICAL,
      check: async (context) => {
        const findings = [];
        const requiredFields = this._getRequiredFields(context.taskType);
        for (const field of requiredFields) {
          if (!context.inputs[field]) {
            findings.push({ field, message: `字段 ${field} 为必填项` });
          }
        }
        return { passed: findings.length === 0, findings };
      }
    });
    
    this.registerRule({
      id: 'CFG-004',
      name: '审批阈值检查',
      description: '验证审批阈值是否符合公司政策',
      category: 'configuration',
      severity: Severity.CRITICAL,
      check: async (context) => {
        const findings = [];
        const thresholds = context.inputs.approvalThresholds || [];
        for (const threshold of thresholds) {
          if (threshold.maxAmount > 500000) {
            findings.push({ field: 'approvalThresholds', 
              message: `审批金额 ${threshold.maxAmount} 超过上限` });
          }
        }
        return { passed: findings.length === 0, findings };
      }
    });
  }
  
  _getApplicableRules(context) {
    return Array.from(this.rules.values()).filter(rule => {
      if (!rule.enabled) return false;
      if (rule.taskTypes && rule.taskTypes.length > 0) {
        if (!rule.taskTypes.includes(context.taskType)) return false;
      }
      return true;
    });
  }
  
  _getRequiredFields(taskType) {
    const commonFields = ['businessUnit', 'category'];
    const typeFields = {
      sourcing: ['department', 'quantity', 'requiredDate'],
      contract: ['supplierId', 'contractValue'],
      order: ['requisitionId', 'supplierId'],
      payment: ['invoiceId', 'amount']
    };
    return [...commonFields, ...(typeFields[taskType] || [])];
  }
  
  _generateRecommendations(findings) {
    const recommendations = [];
    const criticalCount = findings.filter(f => f.severity === Severity.CRITICAL).length;
    if (criticalCount > 0) {
      recommendations.push({
        priority: 1,
        title: '修复严重问题',
        description: `发现 ${criticalCount} 个严重问题，必须立即修复`
      });
    }
    return recommendations;
  }
}

module.exports = {
  QualityAssessor,
  QualityLevel,
  Severity
};
