/**
 * 寻源场景推荐服务 v1.8.0
 * 基于AI的寻源策略推荐引擎
 */

const templates = require('../data/scenarioTemplates.json');
const logger = require('../utils/logger');

class SourcingScenarioService {
  
  /**
   * 推荐寻源场景
   * @param {Object} params - 采购需求参数
   * @returns {Object} 推荐的寻源场景配置
   */
  recommendScenario(params) {
    const { category, amount, deliveryDate, urgency, requirements } = params;
    
    logger.info('生成寻源场景', { category, amount, urgency });
    
    // 1. 确定场景类型
    const scenarioType = this.determineScenarioType(amount, urgency);
    
    // 2. 获取品类评分规则
    const categoryRules = this.getCategoryRules(category);
    
    // 3. 计算时间线
    const timeline = this.calculateTimeline(scenarioType, urgency);
    
    // 4. 推荐供应商
    const recommendedSuppliers = this.recommendSuppliers(category, amount);
    
    // 5. 生成评分规则
    const scoringRules = this.generateScoringRules(categoryRules, scenarioType);
    
    // 6. 生成寻源建议
    const suggestions = this.generateSuggestions(params, scenarioType);
    
    // 7. 计算置信度
    const confidence = this.calculateConfidence(params, scenarioType);
    
    return {
      success: true,
      data: {
        scenarioType,
        timeline,
        scoringRules,
        recommendedSuppliers,
        suggestions,
        confidence,
        metadata: {
          category,
          amount,
          urgency,
          generatedAt: new Date().toISOString(),
          version: '1.8.0'
        }
      }
    };
  }
  
  /**
   * 确定场景类型
   */
  determineScenarioType(amount, urgency) {
    // 紧急程度会影响阈值判断
    const urgencyMultiplier = templates.urgencyMultiplier[urgency] || templates.urgencyMultiplier.normal;
    const effectiveAmount = amount * urgencyMultiplier.delivery;
    
    // 匹配场景类型
    for (const scenario of templates.scenarioTypes) {
      if (effectiveAmount >= scenario.threshold.min && effectiveAmount < scenario.threshold.max) {
        return {
          type: scenario.type,
          code: scenario.code,
          description: scenario.description,
          baseWeight: scenario.weight,
      timeline: scenario.timeline,
          reason: this.getScenarioReason(scenario.type, effectiveAmount, urgency)
        };
      }
    }
    
    // 默认返回竞价采购
    return templates.scenarioTypes.find(s => s.code === 'BIDDING');
  }
  
  /**
   * 获取品类评分规则
   */
  getCategoryRules(category) {
    const defaultRules = {
      weight: { price: 40, quality: 30, delivery: 15, service: 15 },
      required: [],
      preferred: []
    };
    
    return templates.categoryRules[category] || defaultRules;
  }
  
  /**
   * 计算时间线
   */
  calculateTimeline(scenarioType, urgency) {
    const urgencyMultiplier = templates.urgencyMultiplier[urgency] || templates.urgencyMultiplier.normal;
    
    return {
      invitationDays: Math.ceil(scenarioType.timeline.invitation * urgencyMultiplier.timeline),
      responseDays: Math.ceil(scenarioType.timeline.response * urgencyMultiplier.timeline),
      evaluationDays: scenarioType.timeline.evaluation,
      totalDays: Math.ceil(scenarioType.timeline.total * urgencyMultiplier.timeline),
      milestones: this.generateMilestones(scenarioType.timeline, urgencyMultiplier)
    };
  }
  
  /**
   * 生成里程碑
   */
  generateMilestones(timeline, urgencyMultiplier) {
    let currentDay = 0;
    return [
      { name: '发布邀请', day: currentDay, description: '发送询价/招标邀请' },
      { name: '供应商响应', day: currentDay += Math.ceil(timeline.invitation * urgencyMultiplier.timeline), description: '收集供应商报价' },
      { name: '评审报价', day: currentDay += Math.ceil(timeline.response * urgencyMultiplier.timeline), description: '技术/商务评审' },
      { name: '确定结果', day: currentDay += timeline.evaluation, description: '发布结果通知' }
    ];
  }
  
  /**
   * 推荐供应商
   */
  recommendSuppliers(category, amount) {
    // 从供应商池中筛选匹配品类
    const matchingSuppliers = templates.supplierPool.filter(s => s.category === category);
    
    if (matchingSuppliers.length === 0) {
      // 如果没有匹配品类，返回所有供应商
      return templates.supplierPool.slice(0, 5);
    }
    
    // 按评分排序，取前5个
    const sorted = matchingSuppliers.sort((a, b) => b.rating - a.rating);
    const count = Math.min(amount > 100000 ? 5 : 3, sorted.length);
    
    return sorted.slice(0, count).map(s => ({
      name: s.name,
      rating: s.rating,
      location: s.location,
      advantages: s.advantages,
      matchScore: Math.round(s.rating * 20),
      recommended: s.rating >= 4.5 ? '⭐强烈推荐' : s.rating >= 4.0 ? '✓推荐' : '考虑'
    }));
  }
  
  /**
   * 生成评分规则
   */
  generateScoringRules(categoryRules, scenarioType) {
    // 基础权重
    const baseWeight = scenarioType.baseWeight;
    const categoryWeight = categoryRules.weight;
    
    // 综合权重：品类规则占60%，场景类型占40%
    const finalWeight = {
      price: Math.round(baseWeight.price * 0.4 + categoryWeight.price * 0.6),
      quality: Math.round(baseWeight.quality * 0.4 + categoryWeight.quality * 0.6),
      delivery: Math.round(baseWeight.delivery * 0.4 + categoryWeight.delivery * 0.6),
      service: Math.round(baseWeight.service * 0.4 + categoryWeight.service * 0.6)
    };
    
    return {
      dimensions: [
        { name: '价格', weight: finalWeight.price, description: '总价、付款条件、价格竞争力' },
        { name: '质量', weight: finalWeight.quality, description: '质量认证、检测报告、样品评估' },
        { name: '交期', weight: finalWeight.delivery, description: '承诺交期、准时率、物流能力' },
        { name: '服务', weight: finalWeight.service, description: '响应速度、技术支持、售后保障' }
      ],
      total: 100,
      specialRequirements: categoryRules.required,
      preferredCriteria: categoryRules.preferred
    };
  }
  
  /**
   * 生成寻源建议
   */
  generateSuggestions(params, scenarioType) {
    const suggestions = [];
    
    // 紧急程度建议
    if (params.urgency === 'urgent') {
      suggestions.push({
        type: 'warning',
        message: '紧急采购，建议选择本地供应商以缩短交期'
      });
    }
    
    // 金额建议
    if (params.amount > 500000) {
      suggestions.push({
        type: 'info',
        message: '大额采购，建议进行现场考察或要求供应商提供担保'
      });
    }
    
    // 品类建议
    if (params.category === 'IT设备' && params.amount > 100000) {
      suggestions.push({
        type: 'info',
        message: 'IT大额采购，建议要求原厂授权和质保承诺'
      });
    }
    
    // 场景特定建议
    if (scenarioType.code === 'TENDER') {
      suggestions.push({
        type: 'important',
        message: '招标采购需严格按照规范流程，建议法务介入审核招标文件'
      });
    } else if (scenarioType.code === 'BLANKET') {
      suggestions.push({
        type: 'info',
        message: '框架协议需设定价格调整机制和年度考核标准'
      });
    }
    
    // 供应商数量建议
    const minSuppliers = scenarioType.code === 'TENDER' ? 5 : 3;
    suggestions.push({
      type: 'tip',
      message: `建议邀请至少${minSuppliers}家供应商参与以确保竞争性`
    });
    
    return suggestions;
  }
  
  /**
   * 计算置信度
   */
  calculateConfidence(params, scenarioType) {
    let score = 0.7; // 基础分
    
    // 品类信息完整度
    if (params.category) score += 0.1;
    
    // 金额信息完整度
    if (params.amount) score += 0.1;
    
    // 有特殊需求
    if (params.requirements && params.requirements.length > 0) score += 0.05;
    
    // 紧急程度
    if (params.urgency === 'normal') score += 0.05;
    
    return Math.min(score, 0.98);
  }
  
  /**
   * 获取场景选择原因
   */
  getScenarioReason(type, amount, urgency) {
    const reasons = {
      '询价采购': `金额${amount < 50000 ? '较小' : '适中'}，适合快速询价流程`,
      '竞价采购': `金额${amount > 100000 ? '较大' : '中等'}，竞价可获取最优价格`,
      '招标采购': `涉及关键采购，需要规范化流程确保公平透明`,
      '框架协议': `建议建立长期合作关系，简化后续采购流程`
    };
    
    if (urgency === 'urgent') {
      return '紧急需求，' + (reasons[type] || '选择最快速的寻源方式');
    }
    
    return reasons[type] || '基于采购需求自动推荐';
  }
  
  /**
   * 保存自定义模板
   */
  saveTemplate(template) {
    logger.info('保存寻源模板', { name: template.name });
    
    return {
      success: true,
      data: {
        id: `tmpl_${Date.now()}`,
        ...template,
        createdAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * 获取推荐问题
   */
  getSuggestedQuestions() {
    return {
      success: true,
      data: [
        '根据采购金额推荐合适的寻源方式',
        'IT设备采购应该选择哪些供应商',
        '如何设置竞价采购的评分规则',
        '紧急采购应该如何缩短周期'
      ]
    };
  }
}

module.exports = new SourcingScenarioService();
