/**
 * 供应商风险评分引擎
 * v1.5
 */

const logger = require('../../utils/logger');

const DEFAULT_CONFIG = {
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

function calculateFinancialScore(transactions, businessAge) {
  if (!transactions || transactions.length === 0) return 50;

  let score = 0;
  const delayedCount = transactions.filter(t => t.paymentStatus === 'DELAYED').length;
  const overdueCount = transactions.filter(t => t.paymentStatus === 'OVERDUE').length;
  const totalCount = transactions.length;
  const overdueRate = overdueCount / totalCount;

  if (overdueRate > 0.2) score += 40;
  else if (overdueRate > 0.1) score += 25;
  else if (delayedCount / totalCount > 0.3) score += 15;
  else score += 5;

  const overdueTransactions = transactions.filter(t => t.daysOverdue && t.daysOverdue > 0);
  if (overdueTransactions.length > 0) {
    const avgDays = overdueTransactions.reduce((sum, t) => sum + (t.daysOverdue || 0), 0) / overdueTransactions.length;
    if (avgDays > 90) score += 30;
    else if (avgDays > 60) score += 20;
    else if (avgDays > 30) score += 10;
  }

  if (businessAge !== undefined) {
    if (businessAge < 1) score += 30;
    else if (businessAge < 3) score += 20;
    else if (businessAge < 5) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

function calculateDeliveryScore(deliveries) {
  if (!deliveries || deliveries.length === 0) return 50;

  const onTimeCount = deliveries.filter(d => d.onTime).length;
  const onTimeRate = onTimeCount / deliveries.length;

  let score = onTimeRate < 0.7 ? 100 : onTimeRate < 0.85 ? 60 : onTimeRate < 0.95 ? 30 : 10;

  const avgQuality = deliveries.reduce((sum, d) => sum + (d.qualityScore || 80), 0) / deliveries.length;
  if (avgQuality < 70) score = Math.min(100, score + 20);
  else if (avgQuality < 85) score = Math.min(100, score + 10);

  return score;
}

function calculateComplianceScore(complianceRecords) {
  if (!complianceRecords || complianceRecords.length === 0) return 30;

  let score = 0;
  const failCount = complianceRecords.filter(r => r.status === 'FAIL').length;
  const totalCount = complianceRecords.length;
  const failRate = failCount / totalCount;

  if (failRate > 0.3) score = 100;
  else if (failRate > 0.1) score = 70;
  else if (failRate > 0) score = 40;

  const warningCount = complianceRecords.filter(r => r.status === 'WARNING').length;
  if (warningCount / totalCount > 0.5) score = Math.min(100, score + 20);

  return score;
}

function calculateOverallScore(financialScore, deliveryScore, complianceScore) {
  const { weights } = DEFAULT_CONFIG;
  return Math.round(
    financialScore * weights.financial +
    deliveryScore * weights.delivery +
    complianceScore * weights.compliance +
    30 * weights.certification +
    30 * weights.market
  );
}

function determineRiskLevel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function generateRiskFactors(financialScore, deliveryScore, complianceScore) {
  const factors = [];
  if (financialScore >= 70) factors.push({ category: '财务风险', description: '付款记录存在异常', score: financialScore, weight: 30, evidence: ['逾期付款率较高'] });
  if (deliveryScore >= 70) factors.push({ category: '交付风险', description: '交付表现不稳定', score: deliveryScore, weight: 25, evidence: ['准时交付率低于70%'] });
  if (complianceScore >= 70) factors.push({ category: '合规风险', description: '存在合规违规记录', score: complianceScore, weight: 20, evidence: ['合规检查不合格'] });
  return factors;
}

function generateRecommendations(riskLevel) {
  const recommendations = [];
  if (riskLevel === 'HIGH') {
    recommendations.push({ priority: 'URGENT', action: '立即冻结供应商', reason: '风险评分超过70分', approvalRequired: true });
    recommendations.push({ priority: 'HIGH', action: '启动风险审计', reason: '全面评估风险状况', approvalRequired: true });
  } else if (riskLevel === 'MEDIUM') {
    recommendations.push({ priority: 'HIGH', action: '加强监控频率', reason: '风险评分中等', approvalRequired: false });
    recommendations.push({ priority: 'MEDIUM', action: '要求整改计划', reason: '针对具体风险改进', approvalRequired: true });
  } else {
    recommendations.push({ priority: 'LOW', action: '保持正常监控', reason: '风险评分良好', approvalRequired: false });
  }
  return recommendations;
}

function generateReport(supplierName, riskLevel, financialScore, deliveryScore, complianceScore, riskFactors) {
  return {
    summary: `${supplierName}的综合风险评估结果为${riskLevel}级别。`,
    keyFindings: riskFactors.map(f => `${f.category}评分较高(${f.score}分)`),
    riskDistribution: { financial: financialScore, delivery: deliveryScore, compliance: complianceScore, certification: 0, market: 0 },
    trendAnalysis: riskLevel === 'HIGH' ? '风险呈上升趋势' : riskLevel === 'MEDIUM' ? '风险保持稳定' : '风险处于可控范围',
    complianceScore: 100 - complianceScore,
    deliveryScore: 100 - deliveryScore
  };
}

module.exports = {
  calculateFinancialScore,
  calculateDeliveryScore,
  calculateComplianceScore,
  calculateOverallScore,
  determineRiskLevel,
  generateRiskFactors,
  generateRecommendations,
  generateReport,
  DEFAULT_CONFIG
};
