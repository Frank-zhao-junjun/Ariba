/**
 * 供应商智能评估引擎
 * v1.3 - Supplier Intelligence Agent
 */

const logger = require('../../utils/logger');

const EVAL_CONFIG = {
  weights: {
    qualification: 0.30,
    financial: 0.25,
    compliance: 0.25,
    esg: 0.20
  },
  gradeThresholds: {
    excellent: 85,
    good: 70,
    normal: 50,
    risk: 30
  }
};

function calculateQualificationScore(qualificationData, aribaStatus) {
  let score = 0;
  if (aribaStatus) {
    if (aribaStatus.status === 'ACTIVE') score += 40;
    else if (aribaStatus.status === 'PENDING') score += 20;
    else score += 5;
    if (aribaStatus.slpCompletion >= 80) score += 25;
    else if (aribaStatus.slpCompletion >= 50) score += 15;
    else score += 5;
  } else {
    score += 10;
  }
  if (qualificationData && qualificationData.certifications && qualificationData.certifications.length > 0) {
    score += Math.min(25, qualificationData.certifications.length * 8);
  }
  if (qualificationData && qualificationData.industryExperience) {
    if (qualificationData.industryExperience >= 10) score += 10;
    else if (qualificationData.industryExperience >= 5) score += 7;
    else score += 3;
  }
  return Math.min(100, Math.max(0, score));
}

function calculateFinancialScore(financialData, moodysData) {
  let score = 0;
  if (moodysData && moodysData.rating) {
    if (moodysData.rating >= 4) score += 40;
    else if (moodysData.rating >= 3) score += 30;
    else if (moodysData.rating >= 2) score += 15;
    else score += 5;
  }
  if (financialData && financialData.transactionHistory && financialData.transactionHistory.length > 0) {
    const overdueRate = financialData.transactionHistory.filter(t => t.paymentStatus === 'OVERDUE').length / financialData.transactionHistory.length;
    if (overdueRate === 0) score += 35;
    else if (overdueRate < 0.05) score += 25;
    else if (overdueRate < 0.15) score += 15;
    else score += 5;
  } else {
    score += 20;
  }
  if (financialData && financialData.businessAge) {
    if (financialData.businessAge >= 10) score += 25;
    else if (financialData.businessAge >= 5) score += 15;
    else score += 5;
  }
  return Math.min(100, Math.max(0, score));
}

function calculateComplianceScore(complianceData, blacklist = []) {
  let score = 100;
  const issues = [];
  if (blacklist && blacklist.length > 0) {
    return { score: 0, issues: [{ type: 'CRITICAL', item: '供应商在禁入名单中', penalty: 100 }] };
  }
  if (complianceData && complianceData.records) {
    const failedRecords = complianceData.records.filter(r => r.status === 'FAIL');
    const totalRecords = complianceData.records.length;
    if (totalRecords > 0) {
      const failRate = failedRecords.length / totalRecords;
      if (failRate > 0.3) { score -= 60; issues.push({ type: 'HIGH', item: '合规失败率>30%', penalty: 60 }); }
      else if (failRate > 0.1) { score -= 30; issues.push({ type: 'MEDIUM', item: '合规失败率>10%', penalty: 30 }); }
      else if (failRate > 0) { score -= 10; issues.push({ type: 'LOW', item: '存在少量合规失败记录', penalty: 10 }); }
    }
  }
  if (complianceData && complianceData.sanctionCheck && !complianceData.sanctionCheck.passed) {
    score = 0;
    issues.push({ type: 'CRITICAL', item: '制裁名单检查未通过', penalty: 100 });
  }
  return { score: Math.max(0, score), issues };
}

function calculateEsgScore(esgData, moodysEsg) {
  let envScore = 50, socialScore = 50, govScore = 50;
  if (esgData && esgData.environmental) {
    if (esgData.environmental.iso14001) envScore += 20;
    if (esgData.environmental.greenCertifications) envScore += Math.min(15, esgData.environmental.greenCertifications.length * 5);
  }
  if (moodysEsg && moodysEsg.environmental) envScore = (envScore + moodysEsg.environmental * 20) / 2;
  if (esgData && esgData.social) {
    if (esgData.social.laborCompliance) socialScore += 20;
    if (esgData.social.healthSafety) socialScore += 15;
  }
  if (moodysEsg && moodysEsg.social) socialScore = (socialScore + moodysEsg.social * 20) / 2;
  if (esgData && esgData.governance) {
    if (esgData.governance.businessEthics) govScore += 25;
    if (esgData.governance.transparency) govScore += 15;
  }
  if (moodysEsg && moodysEsg.governance) govScore = (govScore + moodysEsg.governance * 20) / 2;
  const score = Math.round((envScore + socialScore + govScore) / 3);
  return { score: Math.min(100, Math.max(0, score)), dimensions: [{ name: '环境-E', score: envScore }, { name: '社会-S', score: socialScore }, { name: '治理-G', score: govScore }] };
}

function calculateOverallScore(qualificationScore, financialScore, complianceScore, esgScore) {
  const { weights } = EVAL_CONFIG;
  return Math.round(qualificationScore * weights.qualification + financialScore * weights.financial + complianceScore * weights.compliance + esgScore * weights.esg);
}

function determineGrade(overallScore) {
  const { gradeThresholds } = EVAL_CONFIG;
  if (overallScore >= gradeThresholds.excellent) return 'excellent';
  if (overallScore >= gradeThresholds.good) return 'good';
  if (overallScore >= gradeThresholds.normal) return 'normal';
  if (overallScore >= gradeThresholds.risk) return 'risk';
  return 'high-risk';
}

function generateRecommendation(grade) {
  let action = 'review', conditions = [], nextSteps = [];
  const gradeLabels = { 'excellent': '优秀', 'good': '良好', 'normal': '一般', 'risk': '风险', 'high-risk': '高风险' };
  switch (grade) {
    case 'excellent': action = 'approve'; nextSteps = ['快速通道审批', '简化合同谈判流程', '建立长期战略合作关系']; break;
    case 'good': action = 'conditional'; conditions = ['完成年度复审']; nextSteps = ['标准尽职调查流程', '6个月后复评', '纳入优先供应商名单']; break;
    case 'normal': action = 'review'; conditions = ['补充资质材料', '完成现场审计']; nextSteps = ['要求补充缺失资质', '安排现场考察', '设置 probation 期 12 个月']; break;
    case 'risk': action = 'review'; conditions = ['高管审批', '风险缓解措施']; nextSteps = ['要求提交风险缓解计划', '增加履约保证金', '缩短付款周期', '每季度复评']; break;
    case 'high-risk': action = 'reject'; nextSteps = ['不建议准入', '如业务必须，建议使用替代供应商', '如确需合作，需董事会审批']; break;
  }
  return { action, actionLabel: gradeLabels[grade], conditions, nextSteps };
}

function identifyRisks(scores, complianceIssues, geographicRisk) {
  const risks = [];
  if (scores.financial < 50) risks.push({ category: 'financial', level: scores.financial < 30 ? 'critical' : 'high', title: '财务健康风险', description: '财务评分仅' + scores.financial + '分，可能存在资金流问题', mitigation: '要求提供近期财务报表，考虑缩短付款周期' });
  if (complianceIssues && complianceIssues.length > 0) complianceIssues.forEach(issue => risks.push({ category: 'compliance', level: issue.type.toLowerCase(), title: '合规问题', description: issue.item, mitigation: '要求限期整改' }));
  if (geographicRisk && geographicRisk > 3) risks.push({ category: 'geopolitical', level: geographicRisk > 5 ? 'high' : 'medium', title: '地域风险', description: '供应商所在国家/地区风险评分为' + geographicRisk + '/10', mitigation: '关注地缘政治变化' });
  if (scores.esg < 40) risks.push({ category: 'esg', level: scores.esg < 25 ? 'high' : 'medium', title: 'ESG风险', description: 'ESG评分仅' + scores.esg + '分', mitigation: '要求提交ESG改进计划' });
  return risks;
}

async function evaluateSupplier(input) {
  console.log('开始供应商评估:', input.supplierId);
  const qualificationScore = calculateQualificationScore(input.qualification || {}, input.aribaStatus);
  const financialScore = calculateFinancialScore(input.financial || {}, input.moodysData);
  const complianceResult = calculateComplianceScore(input.compliance || {}, input.blacklist || []);
  const esgResult = calculateEsgScore(input.esg || {}, input.moodysEsg);
  const overallScore = calculateOverallScore(qualificationScore, financialScore, complianceResult.score, esgResult.score);
  const grade = determineGrade(overallScore);
  const risks = identifyRisks({ financial: financialScore, esg: esgResult.score }, complianceResult.issues, input.geographicRisk);
  const recommendation = generateRecommendation(grade);
  return {
    supplierId: input.supplierId,
    supplierName: input.supplierName || '',
    overallScore,
    grade,
    dimensions: {
      qualification: { score: qualificationScore, label: qualificationScore >= 70 ? '良好' : qualificationScore >= 50 ? '一般' : '需改进' },
      financial: { score: financialScore, label: financialScore >= 70 ? '良好' : financialScore >= 50 ? '一般' : '需改进' },
      compliance: { score: complianceResult.score, issues: complianceResult.issues, label: complianceResult.score >= 80 ? '良好' : complianceResult.score >= 60 ? '一般' : '需改进' },
      esg: { score: esgResult.score, dimensions: esgResult.dimensions, label: esgResult.score >= 70 ? '良好' : esgResult.score >= 50 ? '一般' : '需改进' }
    },
    risks,
    recommendation,
    metadata: { evaluatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), confidence: 0.8, dataSources: ['SAP Ariba SLP', 'ERP交易历史'] }
  };
}

async function batchEvaluate(suppliers) {
  console.log('开始批量评估:', suppliers.length, '家供应商');
  const results = [];
  const summary = { total: suppliers.length, excellent: 0, good: 0, normal: 0, risk: 0, highRisk: 0, avgScore: 0, highRiskSuppliers: [] };
  for (const supplier of suppliers) {
    try {
      const result = await evaluateSupplier(supplier);
      results.push(result);
      summary[result.grade.replace('-', '') + 'Score']++;
      if (result.grade === 'high-risk') summary.highRiskSuppliers.push({ supplierId: result.supplierId, supplierName: result.supplierName, score: result.overallScore });
    } catch (error) {
      results.push({ supplierId: supplier.supplierId, supplierName: supplier.supplierName || '', error: error.message, status: 'failed' });
    }
  }
  const successfulResults = results.filter(r => r.status !== 'failed');
  summary.avgScore = successfulResults.length > 0 ? Math.round(successfulResults.reduce((sum, r) => sum + r.overallScore, 0) / successfulResults.length) : 0;
  return { results, summary };
}

module.exports = { evaluateSupplier, batchEvaluate, calculateQualificationScore, calculateFinancialScore, calculateComplianceScore, calculateEsgScore, calculateOverallScore, determineGrade, generateRecommendation, identifyRisks, EVAL_CONFIG };
