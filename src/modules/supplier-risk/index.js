/**
 * 供应商风险分析助手 - 主模块
 * v1.5
 */

const riskScorer = require('./riskScorer');
const logger = require('../../utils/logger');

async function analyzeSupplierRisk(supplierData) {
  logger.info('开始分析供应商风险', { supplierId: supplierData.supplierId });

  try {
    const financialScore = riskScorer.calculateFinancialScore(
      supplierData.transactionHistory,
      supplierData.businessAge
    );

    const deliveryScore = riskScorer.calculateDeliveryScore(
      supplierData.deliveryRecords
    );

    const complianceScore = riskScorer.calculateComplianceScore(
      supplierData.complianceHistory
    );

    const overallScore = riskScorer.calculateOverallScore(
      financialScore,
      deliveryScore,
      complianceScore
    );

    const riskLevel = riskScorer.determineRiskLevel(overallScore);

    const riskFactors = riskScorer.generateRiskFactors(
      financialScore,
      deliveryScore,
      complianceScore
    );

    const recommendations = riskScorer.generateRecommendations(riskLevel);

    const report = riskScorer.generateReport(
      supplierData.supplierName,
      riskLevel,
      financialScore,
      deliveryScore,
      complianceScore,
      riskFactors
    );

    logger.info('供应商风险分析完成', { supplierId: supplierData.supplierId, overallScore, riskLevel });

    return {
      supplierId: supplierData.supplierId,
      supplierName: supplierData.supplierName,
      overallRiskScore: overallScore,
      riskLevel,
      riskFactors,
      recommendations,
      report,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('供应商风险分析失败', { supplierId: supplierData.supplierId, error: error.message });
    throw error;
  }
}

async function analyzeBatchSuppliers(suppliersData) {
  logger.info('开始批量分析供应商风险', { count: suppliersData.length });

  const results = [];
  let highRisk = 0, mediumRisk = 0, lowRisk = 0;

  for (const supplier of suppliersData) {
    try {
      const result = await analyzeSupplierRisk(supplier);
      results.push(result);

      if (result.riskLevel === 'HIGH') highRisk++;
      else if (result.riskLevel === 'MEDIUM') mediumRisk++;
      else lowRisk++;
    } catch (error) {
      logger.error('批量分析中单个供应商失败', { supplierId: supplier.supplierId, error: error.message });
    }
  }

  const summary = `共分析${suppliersData.length}家供应商，高风险${highRisk}家，中风险${mediumRisk}家，低风险${lowRisk}家。`;

  return {
    total: suppliersData.length,
    highRisk,
    mediumRisk,
    lowRisk,
    suppliers: results,
    summary
  };
}

function generateRiskSummary(result) {
  const emoji = result.riskLevel === 'HIGH' ? '🔴' : result.riskLevel === 'MEDIUM' ? '🟡' : '🟢';

  let report = `# 供应商风险分析报告\n\n`;
  report += `${emoji} **${result.supplierName}** - 风险等级: ${result.riskLevel}\n\n`;
  report += `**综合风险评分**: ${result.overallRiskScore}/100\n\n`;
  report += `## 风险因素\n\n`;
  for (const factor of result.riskFactors) {
    report += `- **${factor.category}**: ${factor.description} (${factor.score}分)\n`;
  }
  report += `\n## 处置建议\n\n`;
  for (const rec of result.recommendations) {
    report += `- [${rec.priority}] ${rec.action}\n`;
    report += `  - 原因: ${rec.reason}\n`;
  }
  report += `\n---\n生成时间: ${result.timestamp}\n`;

  return report;
}

module.exports = {
  analyzeSupplierRisk,
  analyzeBatchSuppliers,
  generateRiskSummary
};
