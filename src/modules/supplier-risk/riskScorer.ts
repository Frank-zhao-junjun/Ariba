/**
 * 供应商风险评分引擎
 * v1.5
 */

const logger = require('../../utils/logger');

interface RiskScoringConfig {
  weights: {
    financial: number;
    delivery: number;
    compliance: number;
    certification: number;
    market: number;
  };
  thresholds: {
    high: number;
    medium: number;
  };
}

const DEFAULT_CONFIG: RiskScoringConfig = {
  weights: {
    financial: 0.30,
    delivery: 0.25,
    compliance: 0.20,
    certification: 0.15,
    market: 0.10
  },
  thresholds: {
    high: 70,
    medium: 40
  }
};

/**
 * 计算财务风险评分
 */
function calculateFinancialScore(transactions: any[], businessAge?: number): number {
  if (!transactions || transactions.length === 0) {
    return 50; // 无数据返回中等风险
  }

  let score = 0;
  let factors = [];

  // 分析付款记录
  const delayedCount = transactions.filter(t => t.paymentStatus === 'DELAYED').length;
  const overdueCount = transactions.filter(t => t.paymentStatus === 'OVERDUE').length;
  const totalCount = transactions.length;

  const delayedRate = delayedCount / totalCount;
  const overdueRate = overdueCount / totalCount;

  // 付款风险 (最高40分)
  let paymentRisk = 0;
  if (overdueRate > 0.2) {
    paymentRisk = 40;
    factors.push(`逾期付款率过高: ${(overdueRate * 100).toFixed(1)}%`);
  } else if (overdueRate > 0.1) {
    paymentRisk = 25;
    factors.push(`存在逾期付款: ${(overdueRate * 100).toFixed(1)}%`);
  } else if (delayedRate > 0.3) {
    paymentRisk = 15;
    factors.push(`延迟付款较多: ${(delayedRate * 100).toFixed(1)}%`);
  } else {
    paymentRisk = 5;
    factors.push('付款记录良好');
  }
  score += paymentRisk * 0.4;

  // 平均逾期天数 (最高30分)
  const overdueTransactions = transactions.filter(t => t.daysOverdue && t.daysOverdue > 0);
  if (overdueTransactions.length > 0) {
    const avgDays = overdueTransactions.reduce((sum, t) => sum + (t.daysOverdue || 0), 0) / overdueTransactions.length;
    if (avgDays > 90) {
      score += 30;
      factors.push(`平均逾期天数过长: ${avgDays.toFixed(0)}天`);
    } else if (avgDays > 60) {
      score += 20;
      factors.push(`存在逾期风险: ${avgDays.toFixed(0)}天`);
    } else if (avgDays > 30) {
      score += 10;
      factors.push(`轻微逾期: ${avgDays.toFixed(0)}天`);
    }
  }

  // 经营年限 (最高30分)
  if (businessAge !== undefined) {
    if (businessAge < 1) {
      score += 30;
      factors.push(`新成立企业: 经营${businessAge.toFixed(1)}年`);
    } else if (businessAge < 3) {
      score += 20;
      factors.push(`经营时间较短: ${businessAge.toFixed(1)}年`);
    } else if (businessAge < 5) {
      score += 10;
      factors.push(`中等经营年限: ${businessAge.toFixed(1)}年`);
    } else {
      score += 0;
      factors.push(`稳定经营: ${businessAge.toFixed(1)}年`);
    }
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * 计算交付风险评分
 */
function calculateDeliveryScore(deliveries: any[]): number {
  if (!deliveries || deliveries.length === 0) {
    return 50;
  }

  let score = 0;

  // 准时交付率
  const onTimeCount = deliveries.filter(d => d.onTime).length;
  const onTimeRate = onTimeCount / deliveries.length;

  if (onTimeRate < 0.7) {
    score = 100; // 高风险
  } else if (onTimeRate < 0.85) {
    score = 60;  // 中等风险
  } else if (onTimeRate < 0.95) {
    score = 30;  // 低风险
  } else {
    score = 10;  // 优秀
  }

  // 质量评分影响
  const avgQuality = deliveries.reduce((sum, d) => sum + (d.qualityScore || 80), 0) / deliveries.length;
  if (avgQuality < 70) {
    score = Math.min(100, score + 20);
  } else if (avgQuality < 85) {
    score = Math.min(100, score + 10);
  }

  return score;
}

/**
 * 计算合规风险评分
 */
function calculateComplianceScore(complianceRecords: any[]): number {
  if (!complianceRecords || complianceRecords.length === 0) {
    return 30; // 无记录默认低风险
  }

  let score = 0;

  const failCount = complianceRecords.filter(r => r.status === 'FAIL').length;
  const warningCount = complianceRecords.filter(r => r.status === 'WARNING').length;
  const totalCount = complianceRecords.length;

  // 失败记录
  const failRate = failCount / totalCount;
  if (failRate > 0.3) {
    score = 100;
  } else if (failRate > 0.1) {
    score = 70;
  } else if (failRate > 0) {
    score = 40;
  }

  // 警告记录
  if (warningCount / totalCount > 0.5) {
    score = Math.min(100, score + 20);
  }

  return score;
}

/**
 * 计算资质风险评分
 */
function calculateCertificationScore(certifications?: string[], businessAge?: number): number {
  let score = 30; // 基础分

  // 资质证书检查
  const requiredCerts = ['ISO9001', 'ISO14001', '营业执照'];
  const validCerts = certifications || [];
  
  const missingCerts = requiredCerts.filter(c => 
    !validCerts.some(vc => vc.toLowerCase().includes(c.toLowerCase()))
  );

  if (missingCerts.length > 1) {
    score = 80;
  } else if (missingCerts.length > 0) {
    score = 50;
  }

  // 无资质证书
  if (!certifications || certifications.length === 0) {
    score = Math.max(score, 60);
  }

  return score;
}

/**
 * 计算市场风险评分
 */
function calculateMarketScore(marketData?: any): number {
  if (!marketData) {
    return 30; // 无数据默认低风险
  }

  let score = 0;

  // 行业风险
  if (marketData.industryRisk === 'HIGH') {
    score += 35;
  } else if (marketData.industryRisk === 'MEDIUM') {
    score += 20;
  }

  // 地缘政治风险
  if (marketData.geopoliticalRisk === 'HIGH') {
    score += 35;
  } else if (marketData.geopoliticalRisk === 'MEDIUM') {
    score += 20;
  }

  // 新闻舆情
  if (marketData.newsSentiment < -50) {
    score += 30;
  } else if (marketData.newsSentiment < -20) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * 主评分函数
 */
function calculateOverallScore(
  financialScore: number,
  deliveryScore: number,
  complianceScore: number,
  certificationScore: number,
  marketScore: number,
  config: RiskScoringConfig = DEFAULT_CONFIG
): number {
  const { weights } = config;

  const overallScore = 
    financialScore * weights.financial +
    deliveryScore * weights.delivery +
    complianceScore * weights.compliance +
    certificationScore * weights.certification +
    marketScore * weights.market;

  return Math.round(overallScore);
}

/**
 * 确定风险等级
 */
function determineRiskLevel(score: number, config: RiskScoringConfig = DEFAULT_CONFIG): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= config.thresholds.high) {
    return 'HIGH';
  } else if (score >= config.thresholds.medium) {
    return 'MEDIUM';
  }
  return 'LOW';
}

/**
 * 生成风险因素列表
 */
function generateRiskFactors(
  financialScore: number,
  deliveryScore: number,
  complianceScore: number,
  certificationScore: number,
  marketScore: number,
  config: RiskScoringConfig
): any[] {
  const factors = [];

  if (financialScore >= 70) {
    factors.push({
      category: '财务风险',
      description: '供应商财务状况存在较高风险',
      score: financialScore,
      weight: config.weights.financial * 100,
      evidence: ['付款记录异常', '存在逾期账款']
    });
  }

  if (deliveryScore >= 70) {
    factors.push({
      category: '交付风险',
      description: '供应商交付表现不稳定',
      score: deliveryScore,
      weight: config.weights.delivery * 100,
      evidence: ['准时交付率低于70%', '可能影响生产计划']
    });
  }

  if (complianceScore >= 70) {
    factors.push({
      category: '合规风险',
      description: '存在合规违规记录',
      score: complianceScore,
      weight: config.weights.compliance * 100,
      evidence: ['合规检查不合格', '需加强监管']
    });
  }

  if (certificationScore >= 60) {
    factors.push({
      category: '资质风险',
      description: '资质证书不完整或过期',
      score: certificationScore,
      weight: config.weights.certification * 100,
      evidence: ['缺少必要资质证书']
    });
  }

  if (marketScore >= 60) {
    factors.push({
      category: '市场风险',
      description: '外部市场环境存在不确定性',
      score: marketScore,
      weight: config.weights.market * 100,
      evidence: ['行业风险较高', '舆情偏负面']
    });
  }

  return factors;
}

/**
 * 生成风险建议
 */
function generateRecommendations(
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW',
  riskFactors: any[]
): any[] {
  const recommendations = [];

  if (riskLevel === 'HIGH') {
    recommendations.push({
      priority: 'URGENT',
      action: '立即冻结供应商',
      reason: '风险评分超过70分，存在重大风险',
      approvalRequired: true
    });
    recommendations.push({
      priority: 'HIGH',
      action: '启动风险审计流程',
      reason: '需要全面评估供应商风险状况',
      approvalRequired: true
    });
    recommendations.push({
      priority: 'HIGH',
      action: '寻找替代供应商',
      reason: '降低供应链中断风险',
      approvalRequired: false
    });
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push({
      priority: 'HIGH',
      action: '加强监控频率',
      reason: '风险评分中等，需要密切关注',
      approvalRequired: false
    });
    recommendations.push({
      priority: 'MEDIUM',
      action: '要求供应商提交整改计划',
      reason: '针对具体风险因素进行改进',
      approvalRequired: true
    });
    recommendations.push({
      priority: 'LOW',
      action: '在下次合同谈判中纳入风险条款',
      reason: '从源头控制风险',
      approvalRequired: false
    });
  } else {
    recommendations.push({
      priority: 'LOW',
      action: '保持正常监控',
      reason: '风险评分良好',
      approvalRequired: false
    });
    recommendations.push({
      priority: 'LOW',
      action: '可纳入优选供应商名单',
      reason: '符合供应商准入标准',
      approvalRequired: false
    });
  }

  return recommendations;
}

/**
 * 生成风险报告
 */
function generateReport(
  supplierName: string,
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW',
  financialScore: number,
  deliveryScore: number,
  complianceScore: number,
  riskFactors: any[]
): any {
  const keyFindings = [];
  
  if (financialScore >= 70) {
    keyFindings.push(`${supplierName}的财务风险评分较高(${financialScore}分)，建议审查付款历史`);
  }
  if (deliveryScore >= 70) {
    keyFindings.push(`${supplierName}的交付风险评分较高(${deliveryScore}分)，需关注交期表现`);
  }
  if (complianceScore >= 70) {
    keyFindings.push(`${supplierName}存在合规违规记录(${complianceScore}分)，需加强合规管理`);
  }

  return {
    summary: `${supplierName}的综合风险评估结果为${riskLevel}级别，主要风险因素包括${riskFactors.map(f => f.category).join('、')}。`,
    keyFindings,
    riskDistribution: {
      financial: financialScore,
      delivery: deliveryScore,
      compliance: complianceScore,
      certification: 0,
      market: 0
    },
    trendAnalysis: riskLevel === 'HIGH' 
      ? '风险呈上升趋势，建议立即采取行动' 
      : riskLevel === 'MEDIUM'
        ? '风险保持稳定，需持续监控'
        : '风险处于可控范围，继续保持',
    complianceScore: 100 - complianceScore,
    deliveryScore: 100 - deliveryScore
  };
}

module.exports = {
  calculateFinancialScore,
  calculateDeliveryScore,
  calculateComplianceScore,
  calculateCertificationScore,
  calculateMarketScore,
  calculateOverallScore,
  determineRiskLevel,
  generateRiskFactors,
  generateRecommendations,
  generateReport,
  DEFAULT_CONFIG
};
