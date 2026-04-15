/**
 * Ariba需求分析报告生成服务
 * 生成15个模块的完整需求分析报告
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// 报告生成主函数
// ============================================================================

/**
 * 生成完整的需求分析报告
 * @param {Object} interviewData - 访谈数据
 * @returns {Object} 完整报告
 */
async function generateReport(interviewData) {
  const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  try {
    // 加载Ariba能力库
    const capabilities = await loadAribaCapabilities();
    
    // 执行各项分析
    const enterpriseProfile = analyzeEnterprise(interviewData);
    const capabilityMatch = matchAriba(enterpriseProfile.requirements, capabilities);
    const gaps = analyzeGaps(capabilityMatch);
    const prioritizedGaps = prioritizeGaps(gaps, enterpriseProfile.requirements);
    const roi = calculateROI(enterpriseProfile, capabilityMatch);
    const risks = assessRisks(prioritizedGaps, enterpriseProfile);
    const recommendations = generateRecommendations({
      enterpriseProfile,
      capabilityMatch,
      gaps: prioritizedGaps,
      roi,
      risks
    });
    
    // 组装完整报告
    const report = {
      id: reportId,
      timestamp,
      metadata: {
        generatedBy: 'Ariba实施助手',
        version: '1.0.0',
        reportType: '需求分析报告'
      },
      // 模块1: 执行摘要
      executiveSummary: generateExecutiveSummary({
        enterpriseProfile,
        capabilityMatch,
        gaps: prioritizedGaps,
        roi,
        recommendations
      }),
      // 模块2: 企业需求画像
      enterpriseProfile,
      // 模块3: Ariba能力匹配度
      capabilityMatch,
      // 模块4: Gap分析
      gapAnalysis: {
        gaps: prioritizedGaps,
        summary: {
          totalGaps: gaps.length,
          critical: gaps.filter(g => g.severity === 'critical').length,
          high: gaps.filter(g => g.severity === 'high').length,
          medium: gaps.filter(g => g.severity === 'medium').length,
          low: gaps.filter(g => g.severity === 'low').length
        }
      },
      // 模块5: ROI分析
      roiAnalysis: roi,
      // 模块6: 组织变革管理
      changeManagement: assessOCM(enterpriseProfile),
      // 模块7: 数据迁移策略
      dataMigration: planDataMigration(enterpriseProfile),
      // 模块8: 技术架构分析
      technicalArchitecture: analyzeTechnicalArchitecture(enterpriseProfile, capabilityMatch),
      // 模块9: 合规性分析
      complianceAnalysis: analyzeCompliance(enterpriseProfile),
      // 模块10: 竞品对比分析
      competitorAnalysis: analyzeCompetitors(enterpriseProfile),
      // 模块11: 风险评估与应对
      riskAssessment: risks,
      // 模块12: 项目治理
      projectGovernance: planProjectGovernance(enterpriseProfile),
      // 模块13: 试点方案
      pilotPlan: designPilotPlan(prioritizedGaps, enterpriseProfile),
      // 模块14: 成功案例参考
      successCases: findSuccessCases(enterpriseProfile),
      // 模块15: 实施建议
      implementationRoadmap: recommendations
    };
    
    // 保存报告
    await saveReport(reportId, report);
    
    return report;
  } catch (error) {
    console.error('报告生成失败:', error);
    throw error;
  }
}

// ============================================================================
// 模块1: 企业需求画像分析
// ============================================================================

function analyzeEnterprise(interviewData) {
  const {
    industry = '通用',
    companySize = '中型企业',
    currentProcesses = {},
    painPoints = [],
    requirements = []
  } = interviewData;
  
  // 提取关键业务指标
  const metrics = extractBusinessMetrics(interviewData);
  
  // 识别核心痛点
  const corePainPoints = painPoints.length > 0 ? painPoints : inferPainPoints(requirements);
  
  // 确定业务优先级
  const businessPriorities = prioritizeBusinessAreas(requirements);
  
  return {
    basicInfo: {
      industry,
      companySize,
      employeeCount: interviewData.employeeCount || '未知',
      annualSpend: interviewData.annualSpend || '未知',
      supplierCount: interviewData.supplierCount || '未知',
      transactionVolume: interviewData.transactionVolume || '未知',
      location: interviewData.location || '未知'
    },
    currentState: {
      erpSystem: interviewData.erpSystem || '未确定',
      currentProcessMaturity: interviewData.processMaturity || 3,
      manualProcesses: interviewData.manualProcesses || [],
      approvalWorkflow: interviewData.approvalWorkflow || '传统审批',
      spendVisibility: interviewData.spendVisibility || '有限'
    },
    painPoints: corePainPoints,
    requirements: requirements.map(r => ({
      id: r.id || `REQ-${Math.random().toString(36).substr(2, 6)}`,
      title: r.title || r.name,
      description: r.description || '',
      priority: r.priority || 'medium',
      category: r.category || inferCategory(r),
      estimatedImpact: r.impact || 'medium'
    })),
    businessPriorities,
    metrics,
    criticalSuccessFactors: identifyCriticalSuccessFactors(corePainPoints, businessPriorities)
  };
}

/**
 * 从访谈数据提取业务指标
 */
function extractBusinessMetrics(data) {
  return {
    currentProcurementCycle: data.procurementCycle || '2-4周',
    manualProcessingTime: data.manualProcessingTime || '40%',
    supplierOnboardingTime: data.supplierOnboardingTime || '2-4周',
    invoiceErrorRate: data.invoiceErrorRate || '5-10%',
    contractComplianceRate: data.contractComplianceRate || '60%',
    maverickSpendRate: data.maverickSpendRate || '30%',
    preferredSupplierRate: data.preferredSupplierRate || '50%'
  };
}

/**
 * 从需求推断痛点
 */
function inferPainPoints(requirements) {
  const painPointMap = {
    approval_slow: '审批流程繁琐，周期过长',
    spend_opacity: '支出不透明，难以控制',
    supplier_risk: '供应商管理不完善，存在风险',
    contract_compliance: '合同合规性差，支出分散',
    manual_workload: '大量手工操作，效率低下',
    data_accuracy: '数据准确性差，报表不及时',
    process_standardization: '流程不标准，执行不一致',
    integration_issues: '系统集成不足，信息孤岛'
  };
  
  return requirements
    .filter(r => r.tags && r.tags.some(t => painPointMap[t]))
    .map(r => ({
      tag: r.tags.find(t => painPointMap[t]),
      description: painPointMap[r.tags.find(t => painPointMap[t])],
      requirement: r.title
    }));
}

/**
 * 推断需求类别
 */
function inferCategory(requirement) {
  const text = (requirement.title + ' ' + (requirement.description || '')).toLowerCase();
  
  if (text.includes('审批') || text.includes('请购') || text.includes('订单')) {
    return 'buying';
  }
  if (text.includes('寻源') || text.includes('招标') || text.includes('竞价')) {
    return 'sourcing';
  }
  if (text.includes('合同') || text.includes('协议')) {
    return 'contract';
  }
  if (text.includes('供应商') || text.includes('绩效') || text.includes('评估')) {
    return 'supplier_management';
  }
  if (text.includes('发票') || text.includes('付款') || text.includes('财务')) {
    return 'invoicing';
  }
  if (text.includes('目录') || text.includes('目录') || text.includes('商品')) {
    return 'catalog';
  }
  if (text.includes('协同') || text.includes('供应链') || text.includes('VMI')) {
    return 'scc';
  }
  return 'other';
}

/**
 * 识别关键成功因素
 */
function identifyCriticalSuccessFactors(painPoints, priorities) {
  const factors = [];
  
  if (painPoints.some(p => p.tag === 'approval_slow')) {
    factors.push('流程自动化与审批效率提升');
  }
  if (painPoints.some(p => p.tag === 'spend_opacity')) {
    factors.push('支出可视化与数据驱动决策');
  }
  if (painPoints.some(p => p.tag === 'supplier_risk')) {
    factors.push('供应商风险管理与绩效监控');
  }
  if (painPoints.some(p => p.tag === 'contract_compliance')) {
    factors.push('合同全生命周期管理');
  }
  if (painPoints.some(p => p.tag === 'integration_issues')) {
    factors.push('系统集成与数据互通');
  }
  
  if (factors.length === 0) {
    factors.push('采购流程标准化');
    factors.push('成本优化与效率提升');
  }
  
  return factors;
}

// ============================================================================
// 模块2: Ariba能力匹配
// ============================================================================

/**
 * 匹配Ariba能力与需求
 */
function matchAriba(requirements, capabilities) {
  const moduleScores = {};
  const matchedRequirements = [];
  const unmatchedRequirements = [];
  
  // 计算每个模块的匹配度
  Object.keys(capabilities.modules).forEach(moduleId => {
    const module = capabilities.modules[moduleId];
    const moduleRequirements = requirements.filter(r => r.category === moduleId);
    
    if (moduleRequirements.length > 0) {
      const score = calculateModuleScore(moduleRequirements, module);
      moduleScores[moduleId] = {
        ...score,
        moduleName: module.name,
        requirementCount: moduleRequirements.length
      };
      
      moduleRequirements.forEach(req => {
        const matchResult = matchRequirementToCapabilities(req, module);
        matchedRequirements.push({
          requirement: req,
          module: moduleId,
          matchScore: matchResult.score,
          matchedFeatures: matchResult.matchedFeatures,
          gaps: matchResult.gaps
        });
      });
    }
  });
  
  // 计算整体匹配度
  const overallScore = calculateOverallScore(moduleScores);
  
  return {
    overallScore,
    moduleScores,
    matchedRequirements,
    unmatchedRequirements,
    recommendations: generateCapabilityRecommendations(moduleScores, capabilities)
  };
}

/**
 * 计算模块匹配度评分
 */
function calculateModuleScore(moduleRequirements, aribaModule) {
  const scores = {
    coverage: 0,      // 功能覆盖率（40%）
    fit: 0,          // 流程匹配度（30%）
    integration: 0,   // 集成可行性（20%）
    customization: 0, // 定制需求（10%，反向）
    total: 0
  };
  
  // 获取模块所有功能点
  const allFeatures = [];
  Object.values(aribaModule.capabilities).forEach(cap => {
    allFeatures.push(...cap.features);
  });
  
  // 计算功能覆盖率
  let matchedFeatures = 0;
  moduleRequirements.forEach(req => {
    const reqText = (req.title + ' ' + req.description).toLowerCase();
    allFeatures.forEach(feature => {
      if (reqText.includes(feature.toLowerCase()) || 
          feature.toLowerCase().includes(reqText.substring(0, Math.min(reqText.length, 10)))) {
        matchedFeatures++;
      }
    });
    // 每个需求至少匹配一个功能
    if (allFeatures.length > 0) {
      matchedFeatures += 1; // 基础分
    }
  });
  
  scores.coverage = Math.min(100, (matchedFeatures / Math.max(moduleRequirements.length, 1)) * 25);
  
  // 计算流程匹配度
  let processMatches = 0;
  const totalProcesses = Object.values(aribaModule.capabilities).reduce(
    (sum, cap) => sum + (cap.standardProcesses?.length || 0), 
    0
  );
  
  moduleRequirements.forEach(req => {
    if (req.processRelated) {
      processMatches++;
    }
  });
  
  scores.fit = totalProcesses > 0 ? (processMatches / Math.max(moduleRequirements.length, 1)) * 100 : 70;
  
  // 集成可行性（基于行业解决方案）
  scores.integration = 85; // 基础分，Ariba在主流ERP集成方面表现良好
  
  // 定制需求评估
  scores.customization = 100 - (moduleRequirements.length * 5); // 需求越多，定制越多
  
  // 综合评分
  scores.total = 
    scores.coverage * 0.4 +
    scores.fit * 0.3 +
    scores.integration * 0.2 +
    scores.customization * 0.1;
  
  return {
    coverage: Math.round(scores.coverage),
    fit: Math.round(scores.fit),
    integration: Math.round(scores.integration),
    customization: Math.round(Math.max(0, scores.customization)),
    total: Math.round(scores.total)
  };
}

/**
 * 匹配单个需求到Ariba能力
 */
function matchRequirementToCapabilities(requirement, aribaModule) {
  const matchedFeatures = [];
  const gaps = [];
  
  Object.entries(aribaModule.capabilities).forEach(([capId, cap]) => {
    const reqText = (requirement.title + ' ' + requirement.description).toLowerCase();
    
    cap.features.forEach(feature => {
      const featureLower = feature.toLowerCase();
      if (reqText.includes(featureLower) || featureMatch(reqText, featureLower)) {
        matchedFeatures.push({
          feature,
          capability: capId
        });
      }
    });
  });
  
  // 识别Gap
  if (matchedFeatures.length === 0) {
    gaps.push({
      type: 'function_gap',
      description: `需求"${requirement.title}"与标准功能存在差异`,
      suggestion: '考虑定制开发或调整业务流程'
    });
  }
  
  return {
    score: matchedFeatures.length > 0 ? 100 : 60,
    matchedFeatures,
    gaps
  };
}

/**
 * 功能文本匹配
 */
function featureMatch(text1, text2) {
  // 简化的语义匹配
  const keywords1 = text1.split(/[\s,\.;，。；]/).filter(w => w.length > 2);
  const keywords2 = text2.split(/[\s,\.;，。；]/).filter(w => w.length > 2);
  
  return keywords1.some(k1 => keywords2.some(k2 => 
    k1.includes(k2) || k2.includes(k1)
  ));
}

/**
 * 计算整体匹配度
 */
function calculateOverallScore(moduleScores) {
  const modules = Object.values(moduleScores);
  if (modules.length === 0) return 0;
  
  const avgTotal = modules.reduce((sum, m) => sum + m.total, 0) / modules.length;
  const avgCoverage = modules.reduce((sum, m) => sum + m.coverage, 0) / modules.length;
  
  return {
    overallMatchRate: Math.round(avgTotal),
    coverageRate: Math.round(avgCoverage),
    fitRate: Math.round(modules.reduce((sum, m) => sum + m.fit, 0) / modules.length),
    integrationRate: Math.round(modules.reduce((sum, m) => sum + m.integration, 0) / modules.length),
    customizationRate: Math.round(modules.reduce((sum, m) => sum + m.customization, 0) / modules.length),
    matchedModuleCount: modules.length,
    recommendation: avgTotal >= 80 ? '高度推荐' : avgTotal >= 60 ? '推荐' : '需谨慎评估'
  };
}

/**
 * 生成能力匹配建议
 */
function generateCapabilityRecommendations(moduleScores, capabilities) {
  const recommendations = [];
  
  Object.entries(moduleScores).forEach(([moduleId, score]) => {
    const module = capabilities.modules[moduleId];
    
    if (score.total >= 80) {
      recommendations.push({
        module: moduleId,
        moduleName: module.name,
        level: 'green',
        message: 'Ariba原生支持度高，实施风险低'
      });
    } else if (score.total >= 60) {
      recommendations.push({
        module: moduleId,
        moduleName: module.name,
        level: 'yellow',
        message: 'Ariba支持大部分功能，需要少量定制'
      });
    } else {
      recommendations.push({
        module: moduleId,
        moduleName: module.name,
        level: 'red',
        message: '功能差异较大，建议深入评估或考虑替代方案'
      });
    }
  });
  
  return recommendations;
}

// ============================================================================
// 模块3: Gap分析
// ============================================================================

/**
 * 分析Ariba能力与需求之间的差距
 */
function analyzeGaps(matchingResult) {
  const gaps = [];
  
  // 从匹配结果中提取Gap
  matchingResult.matchedRequirements.forEach(match => {
    match.gaps.forEach(gap => {
      gaps.push({
        id: `GAP-${Math.random().toString(36).substr(2, 6)}`,
        requirementId: match.requirement.id,
        requirementTitle: match.requirement.title,
        module: match.module,
        ...gap
      });
    });
  });
  
  // 添加基于能力的Gap
  Object.entries(matchingResult.moduleScores).forEach(([moduleId, score]) => {
    if (score.customization < 70) {
      gaps.push({
        id: `GAP-${Math.random().toString(36).substr(2, 6)}`,
        type: 'customization_gap',
        module: moduleId,
        severity: 'medium',
        description: '该模块需要较多定制开发',
        impact: '实施周期延长，成本增加'
      });
    }
    
    if (score.integration < 70) {
      gaps.push({
        id: `GAP-${Math.random().toString(36).substr(2, 6)}`,
        type: 'integration_gap',
        module: moduleId,
        severity: 'medium',
        description: '系统集成存在挑战',
        impact: '需要额外开发接口'
      });
    }
  });
  
  return gaps;
}

/**
 * Gap优先级排序
 */
function prioritizeGaps(gaps, requirements) {
  return gaps.map(gap => {
    const priority = calculatePriority(gap, requirements);
    const effort = estimateEffort(gap);
    const risk = assessGapRisk(gap);
    
    return {
      ...gap,
      priority,
      effort,
      risk,
      priorityLevel: priority >= 80 ? 'P1' : priority >= 60 ? 'P2' : priority >= 40 ? 'P3' : 'P4'
    };
  }).sort((a, b) => b.priority - a.priority);
}

/**
 * 计算Gap优先级
 */
function calculatePriority(gap, requirements) {
  const urgencyWeight = 40;
  const impactWeight = 30;
  const costWeight = 30;
  
  // 紧急程度
  const urgencyScore = {
    critical: 3,
    high: 3,
    medium: 2,
    low: 1
  }[gap.severity] || 2;
  
  // 影响程度
  const impactScore = {
    function_gap: 3,
    process_gap: 2,
    integration_gap: 2,
    customization_gap: 1
  }[gap.type] || 2;
  
  // 成本/难度（反向）
  const costScore = {
    high: 1,
    medium: 2,
    low: 3
  }[gap.effort || 'medium'] || 2;
  
  return (urgencyScore * urgencyWeight) + (impactScore * impactWeight) + (costScore * costWeight);
}

/**
 * 估算Gap修复工作量
 */
function estimateEffort(gap) {
  const effortMap = {
    function_gap: 'medium',
    process_gap: 'low',
    integration_gap: 'high',
    customization_gap: 'medium'
  };
  
  return effortMap[gap.type] || 'medium';
}

/**
 * 评估Gap风险
 */
function assessGapRisk(gap) {
  const riskMap = {
    critical: 'high',
    high: 'high',
    medium: 'medium',
    low: 'low'
  };
  
  return riskMap[gap.severity] || 'medium';
}

// ============================================================================
// 模块4: ROI分析
// ============================================================================

/**
 * 计算ROI
 */
function calculateROI(enterpriseProfile, capabilityMatch) {
  const capabilities = require('./ariba-capabilities.json');
  
  // 估算年度采购支出
  const annualSpend = parseAnnualSpend(enterpriseProfile.basicInfo.annualSpend);
  
  // 计算各模块节约潜力
  const savingsByModule = {};
  let totalSavingsRate = 0;
  
  Object.entries(capabilityMatch.moduleScores).forEach(([moduleId, score]) => {
    const roiData = capabilities.roiBenchmarks.by_module[moduleId];
    if (roiData) {
      // 根据匹配度调整节约预期
      const adjustedSavings = (score.total / 100) * roiData.avgSavings;
      savingsByModule[moduleId] = {
        moduleName: capabilities.modules[moduleId].name,
        estimatedSavings: annualSpend * (adjustedSavings / 100),
        savingsRate: adjustedSavings,
        paybackMonths: Math.round(roiData.paybackMonths * (100 / score.total))
      };
      totalSavingsRate += adjustedSavings;
    }
  });
  
  // 估算实施成本
  const implementationCost = estimateImplementationCost(capabilityMatch, enterpriseProfile);
  
  // 计算ROI指标
  const annualSavings = annualSpend * (totalSavingsRate / 100);
  const threeYearROI = ((annualSavings * 3 - implementationCost.total) / implementationCost.total) * 100;
  const paybackPeriod = implementationCost.total / (annualSavings / 12);
  
  return {
    investmentAnalysis: {
      totalInvestment: implementationCost.total,
      breakdown: {
        software: implementationCost.software,
        implementation: implementationCost.implementation,
        training: implementationCost.training,
        integration: implementationCost.integration,
        dataMigration: implementationCost.dataMigration
      },
      yearlyBreakdown: implementationCost.yearlyBreakdown
    },
    savingsAnalysis: {
      totalAnnualSavings: annualSavings,
      savingsRate: totalSavingsRate,
      byModule: savingsByModule,
      breakdown: {
        priceSavings: annualSavings * 0.4,
        processSavings: annualSavings * 0.3,
        complianceSavings: annualSavings * 0.15,
        riskReduction: annualSavings * 0.15
      }
    },
    roiMetrics: {
      threeYearROI: Math.round(threeYearROI),
      paybackPeriodMonths: Math.round(paybackPeriod),
      npv: calculateNPV(annualSavings, implementationCost.total),
      irr: calculateIRR(annualSavings, implementationCost.total)
    },
    sensitivity: {
      optimistic: { roi: Math.round(threeYearROI * 1.3), savings: Math.round(annualSavings * 1.3) },
      realistic: { roi: Math.round(threeYearROI), savings: Math.round(annualSavings) },
      conservative: { roi: Math.round(threeYearROI * 0.7), savings: Math.round(annualSavings * 0.7) }
    }
  };
}

/**
 * 解析年度支出
 */
function parseAnnualSpend(annualSpend) {
  if (!annualSpend || annualSpend === '未知') return 10000000; // 默认1000万
  
  const str = String(annualSpend).toLowerCase().replace(/[,，亿万元]/g, '');
  const match = str.match(/(\d+\.?\d*)/);
  if (!match) return 10000000;
  
  const value = parseFloat(match[1]);
  if (str.includes('亿')) return value * 100000000;
  if (str.includes('万')) return value * 10000;
  return value;
}

/**
 * 估算实施成本
 */
function estimateImplementationCost(matchingResult, enterpriseProfile) {
  const baseCost = 500000; // 基础成本50万
  
  // 根据企业规模调整
  const scaleFactors = {
    '小型企业': 0.6,
    '中型企业': 1.0,
    '大型企业': 1.5,
    '超大型企业': 2.0
  };
  const scaleFactor = scaleFactors[enterpriseProfile.basicInfo.companySize] || 1.0;
  
  // 根据模块数量调整
  const moduleCount = Object.keys(matchingResult.moduleScores).length;
  const moduleFactor = 1 + (moduleCount - 1) * 0.15;
  
  // 根据Gap数量调整（定制开发）
  const gapCount = matchingResult.matchedRequirements.filter(m => m.gaps.length > 0).length;
  const gapFactor = 1 + (gapCount * 0.05);
  
  const total = Math.round(baseCost * scaleFactor * moduleFactor * gapFactor);
  
  return {
    total,
    software: Math.round(total * 0.25),
    implementation: Math.round(total * 0.40),
    training: Math.round(total * 0.10),
    integration: Math.round(total * 0.15),
    dataMigration: Math.round(total * 0.10),
    yearlyBreakdown: [
      { year: 1, cost: Math.round(total * 0.6) },
      { year: 2, cost: Math.round(total * 0.25) },
      { year: 3, cost: Math.round(total * 0.15) }
    ]
  };
}

/**
 * 计算NPV
 */
function calculateNPV(annualSavings, initialCost, years = 5, discountRate = 0.1) {
  let npv = -initialCost;
  for (let i = 1; i <= years; i++) {
    npv += annualSavings / Math.pow(1 + discountRate, i);
  }
  return Math.round(npv);
}

/**
 * 计算IRR（简化版）
 */
function calculateIRR(annualSavings, initialCost) {
  // 简化IRR计算
  const ratio = annualSavings / initialCost;
  return Math.round(ratio * 100);
}

// ============================================================================
// 模块5: 组织变革管理 (OCM)
// ============================================================================

/**
 * 评估组织变革管理需求
 */
function assessOCM(enterpriseProfile) {
  return {
    stakeholderAnalysis: identifyStakeholders(enterpriseProfile),
    changeImpact: assessChangeImpact(enterpriseProfile),
    changeStrategy: designChangeStrategy(enterpriseProfile),
    trainingPlan: designTrainingPlan(enterpriseProfile),
    communicationPlan: designCommunicationPlan(enterpriseProfile),
    resistanceMitigation: designResistanceMitigation()
  };
}

/**
 * 识别利益相关方
 */
function identifyStakeholders(enterpriseProfile) {
  return [
    {
      role: '项目发起人',
      level: 'executive',
      influence: 'high',
      interest: 'high',
      engagement: 'manage-closely',
      concerns: ['ROI达成', '项目进度', '业务影响']
    },
    {
      role: '采购总监',
      level: 'director',
      influence: 'high',
      interest: 'high',
      engagement: 'manage-closely',
      concerns: ['流程变化', '工作负荷', '绩效指标']
    },
    {
      role: 'IT部门',
      level: 'support',
      influence: 'medium',
      interest: 'high',
      engagement: 'keep-informed',
      concerns: ['系统集成', '技术复杂度', '运维负担']
    },
    {
      role: '财务部门',
      level: 'director',
      influence: 'high',
      interest: 'medium',
      engagement: 'keep-satisfied',
      concerns: ['成本控制', '数据准确性', '报表需求']
    },
    {
      role: '业务用户',
      level: 'operational',
      influence: 'low',
      interest: 'high',
      engagement: 'consult',
      concerns: ['使用便捷性', '学习成本', '工作效率']
    },
    {
      role: '供应商',
      level: 'external',
      influence: 'medium',
      interest: 'medium',
      engagement: 'keep-informed',
      concerns: ['系统对接', '培训要求', '合作关系']
    }
  ];
}

/**
 * 评估变革影响
 */
function assessChangeImpact(enterpriseProfile) {
  return {
    processChanges: {
      level: 'moderate',
      affectedProcesses: [
        '采购申请流程',
        '审批流程',
        '订单处理流程',
        '发票核对流程'
      ],
      automationLevel: '从60%提升至85%'
    },
    roleChanges: {
      level: 'moderate',
      affectedRoles: [
        '采购员',
        '审批经理',
        '财务专员',
        '系统管理员'
      ],
      newResponsibilities: [
        '系统操作',
        '数据维护',
        '供应商协同'
      ]
    },
    skillRequirements: {
      level: 'significant',
      currentGap: '40%',
      requiredSkills: [
        '系统操作技能',
        '流程管理能力',
        '数据分析能力'
      ]
    },
    culturalChanges: {
      level: 'gradual',
      aspects: [
        '数据驱动决策',
        '协作工作方式',
        '持续改进理念'
      ]
    }
  };
}

/**
 * 设计变革策略
 */
function designChangeStrategy(enterpriseProfile) {
  return {
    approach: 'incremental',
    phases: [
      {
        phase: 1,
        name: '意识唤醒',
        duration: '2-4周',
        activities: [
          '高管启动会',
          '部门宣贯会',
          '愿景分享'
        ]
      },
      {
        phase: 2,
        name: '能力建设',
        duration: '4-8周',
        activities: [
          '培训计划制定',
          '关键用户选拔',
          '培训材料开发'
        ]
      },
      {
        phase: 3,
        name: '试点验证',
        duration: '8-12周',
        activities: [
          '试点团队培训',
          '并行运行',
          '反馈收集'
        ]
      },
      {
        phase: 4,
        name: '全面推广',
        duration: '12-16周',
        activities: [
          '分批培训',
          '全面切换',
          '持续支持'
        ]
      }
    ],
    successFactors: [
      '高层持续支持',
      '充分沟通',
      '渐进式变革',
      '及时激励'
    ]
  };
}

/**
 * 设计培训计划
 */
function designTrainingPlan(enterpriseProfile) {
  return {
    targetAudiences: [
      {
        audience: '高管层',
        duration: '4小时',
        format: '研讨会',
        content: ['战略价值', '期望收益', '角色职责', '成功案例']
      },
      {
        audience: '项目团队',
        duration: '40小时',
        format: '课堂+实操',
        content: ['系统管理', '配置设置', '问题处理', '项目管理']
      },
      {
        audience: '关键用户',
        duration: '24小时',
        format: '课堂+实操',
        content: ['业务流程', '系统操作', '报表使用', '日常维护']
      },
      {
        audience: '普通用户',
        duration: '8小时',
        format: '在线+实操',
        content: ['自助采购', '审批操作', '查询使用', '常见问题']
      },
      {
        audience: '供应商',
        duration: '4小时',
        format: '在线培训',
        content: ['Portal使用', '订单确认', '发票提交', '协同操作']
      }
    ],
    timeline: {
      total: '16周',
      preparation: '4周',
      training: '8周',
      support: '4周'
    },
    resources: {
      trainers: 4,
      trainingEnvironments: 2,
      materials: '电子+纸质'
    }
  };
}

/**
 * 设计沟通计划
 */
function designCommunicationPlan(enterpriseProfile) {
  return {
    objectives: [
      '建立共识',
      '消除顾虑',
      '获取支持',
      '保持透明'
    ],
    channels: [
      { type: 'Town Hall', frequency: '季度', audience: '全员' },
      { type: '项目简报', frequency: '双周', audience: '项目组' },
      { type: '邮件更新', frequency: '周', audience: '利益相关方' },
      { type: '内部门户', frequency: '持续', audience: '全员' },
      { type: '即时通讯', frequency: '实时', audience: '核心团队' }
    ],
    keyMessages: {
      launch: 'Ariba项目正式启动，我们将共同打造更高效的采购体系',
      milestone: '项目取得重要进展，感谢大家的配合与支持',
      goLive: '系统正式上线，开启采购数字化新篇章',
      feedback: '您的反馈是我们持续改进的动力'
    }
  };
}

/**
 * 设计阻力缓解措施
 */
function designResistanceMitigation() {
  return {
    commonResistance: [
      {
        concern: '担心被系统取代',
        mitigation: '强调人机协作，突出战略决策价值'
      },
      {
        concern: '学习成本高',
        mitigation: '提供充分培训，设置过渡期和答疑支持'
      },
      {
        concern: '工作流程改变',
        mitigation: '解释变革必要性，展示改进后的效率提升'
      },
      {
        concern: '数据安全担忧',
        mitigation: '说明数据保护措施，满足合规要求'
      }
    ],
    incentivePrograms: [
      '优秀用户奖励',
      '最佳实践分享',
      '快速响应奖励',
      '持续贡献认可'
    ],
    supportChannels: [
      '在线帮助中心',
      '即时答疑群',
      '超级用户支持',
      '专家热线'
    ]
  };
}

// ============================================================================
// 模块6: 数据迁移策略
// ============================================================================

/**
 * 规划数据迁移
 */
function planDataMigration(enterpriseProfile) {
  return {
    masterDataMigration: planMasterDataMigration(enterpriseProfile),
    transactionDataMigration: planTransactionDataMigration(enterpriseProfile),
    historicalDataMigration: planHistoricalDataMigration(enterpriseProfile),
    migrationApproach: designMigrationApproach(enterpriseProfile),
    migrationTimeline: designMigrationTimeline(enterpriseProfile),
    qualityAssurance: designMigrationQA()
  };
}

/**
 * 规划主数据迁移
 */
function planMasterDataMigration(enterpriseProfile) {
  return {
    dataTypes: [
      {
        type: '供应商主数据',
        recordCount: enterpriseProfile.basicInfo.supplierCount || '未知',
        complexity: 'high',
        fields: [
          '基本信息（名称、地址、联系人）',
          '银行信息',
          '资质证照',
          '绩效评级',
          '合作条款'
        ],
        validationRules: [
          '数据完整性检查',
          '重复检测',
          '地址标准化',
          '银行信息验证'
        ]
      },
      {
        type: '物料/服务目录',
        recordCount: '待评估',
        complexity: 'medium',
        fields: [
          '商品编码',
          '描述信息',
          '价格信息',
          '规格参数',
          '图片附件'
        ],
        validationRules: [
          '编码唯一性',
          '分类准确性',
          '价格合理性'
        ]
      },
      {
        type: '成本中心/内部订单',
        recordCount: '待评估',
        complexity: 'low',
        fields: [
          '组织结构',
          '预算归属',
          '审批层级'
        ],
        validationRules: [
          '层级关系正确',
          '预算归属明确'
        ]
      },
      {
        type: '合同数据',
        recordCount: '待评估',
        complexity: 'high',
        fields: [
          '合同主体',
          '条款明细',
          '执行状态',
          '关联订单'
        ],
        validationRules: [
          '条款完整性',
          '日期有效性',
          '金额准确性'
        ]
      }
    ],
    migrationStrategy: 'phased',
    dataCleansing: {
      required: true,
      activities: [
        '重复数据识别与合并',
        '过期数据归档',
        '格式标准化',
        '缺失数据补录'
      ],
      estimatedEffort: '4-8周'
    }
  };
}

/**
 * 规划交易数据迁移
 */
function planTransactionDataMigration(enterpriseProfile) {
  return {
    dataTypes: [
      {
        type: '待处理订单',
        priority: 'high',
        migrationNote: '需要在系统切换时完整迁移'
      },
      {
        type: '进行中审批',
        priority: 'high',
        migrationNote: '需要追踪并完成审批流程'
      },
      {
        type: '未结发票',
        priority: 'high',
        migrationNote: '需要与原系统并行处理'
      }
    ],
    cutoverStrategy: 'parallel',
    parallelPeriod: '2-4周',
    fallbackPlan: '保留原系统只读访问'
  };
}

/**
 * 规划历史数据迁移
 */
function planHistoricalDataMigration(enterpriseProfile) {
  return {
    scope: [
      {
        type: '历史订单',
        years: '2-3年',
        purpose: '查询参考',
        migrationMethod: '归档库'
      },
      {
        type: '历史发票',
        years: '5年+',
        purpose: '合规存档',
        migrationMethod: '归档库'
      },
      {
        type: '历史报表',
        years: '3年',
        purpose: '趋势分析',
        migrationMethod: '数据仓库'
      }
    ],
    archiveStrategy: 'cold-storage',
    retentionCompliance: '满足财务存档要求'
  };
}

/**
 * 设计迁移方案
 */
function designMigrationApproach(enterpriseProfile) {
  return {
    strategy: 'big-bang',
    alternatives: [
      {
        name: '大爆炸式',
        description: '一次性切换',
        pros: ['周期短', '数据一致性好'],
        cons: ['风险集中', '回退复杂'],
        suitable: '小型部署'
      },
      {
        name: '分阶段式',
        description: '按模块逐步切换',
        pros: ['风险分散', '可调整'],
        cons: ['周期较长', '双系统并行'],
        suitable: '大型部署'
      },
      {
        name: '试点先行',
        description: '先小范围试点，再推广',
        pros: ['验证充分', '经验积累'],
        cons: ['准备时间长'],
        suitable: '复杂环境'
      }
    ],
    recommended: 'pilot-first',
    rationale: '确保平稳过渡，降低业务风险'
  };
}

/**
 * 设计迁移时间线
 */
function designMigrationTimeline(enterpriseProfile) {
  return {
    phases: [
      {
        phase: 1,
        name: '数据准备',
        duration: '4-6周',
        activities: [
          '数据调研与映射',
          '数据清理',
          '模板开发',
          '初始数据导入'
        ]
      },
      {
        phase: 2,
        name: '测试迁移',
        duration: '2-4周',
        activities: [
          '测试环境迁移',
          '数据验证',
          '问题修复',
          '用户确认'
        ]
      },
      {
        phase: 3,
        name: '生产迁移',
        duration: '1-2周',
        activities: [
          '最终数据导出',
          '数据转换',
          '数据导入',
          '最终验证'
        ]
      },
      {
        phase: 4,
        name: '并行验证',
        duration: '2-4周',
        activities: [
          '双系统并行',
          '数据核对',
          '问题处理',
          '正式切换'
        ]
      }
    ],
    totalDuration: '10-16周',
    criticalPath: '数据清理',
    dependencies: [
      '主数据定义完成',
      '历史数据归档完成',
      '测试用例通过'
    ]
  };
}

/**
 * 设计迁移质量保证
 */
function designMigrationQA() {
  return {
    validationChecks: [
      {
        type: '完整性检查',
        method: '记录数核对',
        tolerance: '100%'
      },
      {
        type: '准确性检查',
        method: '抽样验证',
        tolerance: '99.5%'
      },
      {
        type: '一致性检查',
        method: '关联关系验证',
        tolerance: '100%'
      },
      {
        type: '格式检查',
        method: '字段格式验证',
        tolerance: '100%'
      }
    ],
    signoffProcess: [
      '技术团队自检',
      '业务团队复核',
      '数据owner确认',
      '项目负责人批准'
    ],
    rollbackCriteria: [
      '错误率超过0.5%',
      '关键数据缺失',
      '关联关系破坏',
      '业务无法正常处理'
    ],
    tools: [
      '数据验证脚本',
      '差异报告工具',
      '回滚脚本',
      '监控仪表盘'
    ]
  };
}

// ============================================================================
// 模块7: 技术架构分析
// ============================================================================

/**
 * 分析技术架构
 */
function analyzeTechnicalArchitecture(enterpriseProfile, capabilityMatch) {
  return {
    currentArchitecture: analyzeCurrentArchitecture(enterpriseProfile),
    targetArchitecture: designTargetArchitecture(capabilityMatch),
    technicalGaps: identifyTechnicalGaps(enterpriseProfile, capabilityMatch),
    integrationDesign: designIntegrationArchitecture(enterpriseProfile),
    securityArchitecture: designSecurityArchitecture(),
    scalabilityPlan: designScalabilityPlan()
  };
}

/**
 * 分析现有架构
 */
function analyzeCurrentArchitecture(enterpriseProfile) {
  return {
    erpSystem: {
      name: enterpriseProfile.basicInfo.erpSystem,
      version: '待确认',
      integration: 'unknown'
    },
    network: {
      type: ' intranet',
      bandwidth: '待评估',
      redundancy: '待确认'
    },
    infrastructure: {
      type: 'cloud',
      currentLoad: '待评估'
    },
    applications: [
      'ERP系统',
      '财务系统',
      'HR系统',
      '其他业务系统'
    ],
    maturity: 3,
    concerns: [
      '系统集成复杂度',
      '数据同步时效性',
      '接口标准不统一'
    ]
  };
}

/**
 * 设计目标架构
 */
function designTargetArchitecture(capabilityMatch) {
  const modules = Object.keys(capabilityMatch.moduleScores);
  
  return {
    cloud: {
      type: 'SAP Ariba Cloud',
      region: '中国区',
      components: modules.map(m => `Ariba ${m}`)
    },
    integration: {
      type: 'SAP Cloud Platform Integration',
      pattern: 'centralized',
      middleware: 'SAP CPI'
    },
    security: {
      type: 'SAP Identity Provisioning',
      sso: true,
      mfa: true
    },
    monitoring: {
      type: 'SAP Solution Manager',
      alerts: true,
      dashboards: true
    }
  };
}

/**
 * 识别技术差距
 */
function identifyTechnicalGaps(enterpriseProfile, capabilityMatch) {
  const gaps = [];
  
  // 网络差距
  if (enterpriseProfile.basicInfo.location.includes('多地')) {
    gaps.push({
      category: 'network',
      severity: 'medium',
      description: '多地点部署需要考虑网络延迟',
      recommendation: '使用CDN加速或边缘节点'
    });
  }
  
  // 集成差距
  const integrationNeeds = capabilityMatch.moduleScores;
  if (Object.keys(integrationNeeds).length > 3) {
    gaps.push({
      category: 'integration',
      severity: 'medium',
      description: '多系统集成需要集成中间件',
      recommendation: '部署SAP CPI作为集成平台'
    });
  }
  
  // 安全差距
  gaps.push({
    category: 'security',
    severity: 'low',
    description: '需要与企业身份认证系统对接',
    recommendation: '配置SAP Identity Provisioning'
  });
  
  return gaps;
}

/**
 * 设计集成架构
 */
function designIntegrationArchitecture(enterpriseProfile) {
  return {
    integrationPattern: 'hub-and-spoke',
    middleware: {
      product: 'SAP Cloud Platform Integration',
      location: 'Cloud',
      alternatives: ['MuleSoft', 'Boomi']
    },
    interfaces: [
      {
        source: 'ERP',
        target: 'Ariba',
        type: 'bidirectional',
        data: '订单、发票、供应商',
        frequency: 'near-real-time'
      },
      {
        source: 'Finance',
        target: 'Ariba',
        type: 'bidirectional',
        data: '成本中心、付款数据',
        frequency: 'daily'
      },
      {
        source: 'HR',
        target: 'Ariba',
        type: 'unidirectional',
        data: '员工、组织架构',
        frequency: 'daily'
      }
    ],
    errorHandling: {
      strategy: 'retry',
      maxRetries: 3,
      alertThreshold: 5
    },
    monitoring: {
      tools: ['SAP CPI Monitors', 'Custom Dashboards'],
      alerting: true
    }
  };
}

/**
 * 设计安全架构
 */
function designSecurityArchitecture() {
  return {
    authentication: {
      method: 'SSO',
      provider: 'Azure AD / SAP IAS',
      protocols: ['SAML 2.0', 'OAuth 2.0']
    },
    authorization: {
      model: 'RBAC',
      segregation: true,
      roleMining: 'required'
    },
    dataProtection: {
      encryption: {
        transit: 'TLS 1.2+',
        atRest: 'AES-256'
      },
      privacy: '符合GDPR和中国网络安全法'
    },
    compliance: [
      'ISO 27001',
      'SOC 2 Type II',
      'SAP Cloud Trust Center'
    ],
    audit: {
      logging: true,
      retention: '1年',
      reviewFrequency: 'quarterly'
    }
  };
}

/**
 * 设计扩展性计划
 */
function designScalabilityPlan() {
  return {
    currentCapacity: {
      users: 500,
      transactions: 10000
    },
    growthPlan: {
      year1: { users: 800, transactions: 15000 },
      year2: { users: 1200, transactions: 25000 },
      year3: { users: 2000, transactions: 40000 }
    },
    scalingStrategy: [
      '水平扩展：自动扩容',
      '垂直扩展：按需升级',
      '地理扩展：多区域部署'
    ],
    performanceTargets: {
      responseTime: '< 2秒',
      uptime: '99.9%',
      batchProcessing: '< 30分钟'
    }
  };
}

// ============================================================================
// 模块8: 合规性分析
// ============================================================================

/**
 * 分析合规性
 */
function analyzeCompliance(enterpriseProfile) {
  return {
    industryCompliance: analyzeIndustryCompliance(enterpriseProfile),
    dataProtection: analyzeDataProtection(enterpriseProfile),
    auditRequirements: analyzeAuditRequirements(enterpriseProfile),
    regulatoryMapping: mapRegulations(enterpriseProfile)
  };
}

/**
 * 分析行业合规
 */
function analyzeIndustryCompliance(enterpriseProfile) {
  const industryComplianceMap = {
    '制造业': ['ISO 9001', 'IATF 16949', '环境法规'],
    '医疗健康': ['GSP', 'GMP', 'FDA', '医疗器械法规'],
    '金融': ['SOX', 'Basel III', '金融监管'],
    '政府': ['政府采购法', '阳光采购', '审计要求'],
    '零售': ['消费者保护', '食品安全'],
    '能源': ['安全生产', '环保合规']
  };
  
  return {
    required: industryComplianceMap[enterpriseProfile.basicInfo.industry] || ['通用合规'],
    currentStatus: {
      compliant: true,
      gaps: [],
      actionItems: []
    },
    aribaCapabilities: [
      '完整的审计追踪',
      '电子签名',
      '审批流程记录',
      '报表追溯',
      '数据归档'
    ],
    gapAssessment: 'Ariba提供良好的合规支持基础，需结合企业实际完善配置'
  };
}

/**
 * 分析数据保护
 */
function analyzeDataProtection(enterpriseProfile) {
  return {
    regulations: [
      '中国网络安全法',
      '数据安全法',
      '个人信息保护法',
      'GDPR（跨境数据）'
    ],
    dataClassification: [
      { level: '公开', examples: ['商品目录', '公开价格'] },
      { level: '内部', examples: ['采购申请', '订单信息'] },
      { level: '机密', examples: ['供应商报价', '合同条款'] },
      { level: '绝密', examples: ['谈判策略', '成本结构'] }
    ],
    dataResidency: {
      requirement: '中国境内',
      solution: 'SAP中国区数据中心'
    },
    crossBorderTransfer: {
      applicable: false,
      conditions: '如有跨境需求需单独评估'
    },
    aribaFeatures: [
      '字段级权限控制',
      '数据加密',
      '访问日志',
      '数据脱敏',
      '导出控制'
    ]
  };
}

/**
 * 分析审计要求
 */
function analyzeAuditRequirements(enterpriseProfile) {
  return {
    auditTrails: {
      required: true,
      retention: '7年',
      scope: [
        '用户登录',
        '数据变更',
        '审批操作',
        '系统配置'
      ]
    },
    segregationOfDuties: {
      required: true,
      policies: [
        '请购与审批分离',
        '审批与执行分离',
        '采购与付款分离'
      ]
    },
    approvalEvidence: {
      type: '电子签名',
      legalValidity: '中国电子签名法认可',
      provider: 'SAP Ariba eSign'
    },
    reporting: {
      frequency: '月度/季度/年度',
      contents: [
        '采购统计',
        '支出分析',
        '供应商绩效',
        '合规检查'
      ]
    },
    aribaSupport: '完整支持所有审计需求'
  };
}

/**
 * 映射法规要求
 */
function mapRegulations(enterpriseProfile) {
  return {
    regulations: [
      {
        id: 'REG-001',
        name: '财务报告合规',
        description: '确保采购数据可追溯，满足财务审计要求',
        aribaSupport: '完整支持',
        implementation: '标准配置+定制报表'
      },
      {
        id: 'REG-002',
        name: '供应商准入合规',
        description: '供应商资质审核与持续监控',
        aribaSupport: '完整支持',
        implementation: '启用供应商管理模块'
      },
      {
        id: 'REG-003',
        name: '合同法合规',
        description: '电子合同的法律效力与存档',
        aribaSupport: '完整支持',
        implementation: '启用电子签章'
      },
      {
        id: 'REG-004',
        name: '反腐败合规',
        description: '供应商送礼、利益冲突管理',
        aribaSupport: '部分支持',
        implementation: '配置审批流程+人工审核'
      }
    ],
    overallCompliance: 'Ariba可满足85%以上的合规需求'
  };
}

// ============================================================================
// 模块9: 竞品对比分析
// ============================================================================

/**
 * 分析竞争对手
 */
function analyzeCompetitors(enterpriseProfile) {
  return {
    competitors: [
      {
        name: 'SAP S/4HANA MM',
        vendor: 'SAP',
        strength: [
          '与ECC无缝集成',
          '财务一体化',
          '本地部署选项'
        ],
        weakness: [
          '用户体验较老旧',
          '实施复杂',
          '成本较高'
        ],
        matchScore: 85,
        estimatedCost: '800-1500万',
        suitable: '已使用SAP ERP的企业'
      },
      {
        name: 'Oracle Procurement Cloud',
        vendor: 'Oracle',
        strength: [
          '完整的SaaS套件',
          '现代化UI',
          '强大分析能力'
        ],
        weakness: [
          '与中国本地化适配',
          '集成复杂度',
          '学习曲线'
        ],
        matchScore: 78,
        estimatedCost: '600-1200万',
        suitable: '使用Oracle ERP的企业'
      },
      {
        name: 'Coupa Business Spend Management',
        vendor: 'Coupa',
        strength: [
          '用户体验好',
          '快速部署',
          'AI驱动的分析'
        ],
        weakness: [
          '中国本地化不足',
          '供应商网络有限',
          '定制能力弱'
        ],
        matchScore: 72,
        estimatedCost: '500-1000万',
        suitable: '跨国企业，快消零售'
      },
      {
        name: 'JDE Procurement',
        vendor: 'Oracle',
        strength: [
          '与JDE ERP集成',
          '功能稳定',
          '本地支持好'
        ],
        weakness: [
          'UI落后',
          '扩展性有限',
          '移动端弱'
        ],
        matchScore: 70,
        estimatedCost: '400-800万',
        suitable: '使用JDE的企业'
      }
    ],
    comparisonMatrix: {
      criteria: [
        { name: '功能完整性', weight: 25 },
        { name: '集成能力', weight: 20 },
        { name: '用户体验', weight: 15 },
        { name: '实施周期', weight: 10 },
        { name: '总体成本', weight: 15 },
        { name: '本地化支持', weight: 15 }
      ],
      scores: {
        'SAP Ariba': [90, 95, 80, 70, 75, 95],
        'SAP MM': [85, 90, 60, 60, 70, 90],
        'Oracle': [85, 80, 85, 75, 80, 75],
        'Coupa': [80, 70, 95, 90, 75, 50]
      }
    },
    recommendation: 'SAP Ariba',
    rationale: 'Ariba在采购管理领域最为专业，与中国市场适配度高，特别是在与SAP ERP集成方面具有天然优势'
  };
}

// ============================================================================
// 模块10: 风险评估
// ============================================================================

/**
 * 评估风险
 */
function assessRisks(gaps, enterpriseProfile) {
  return {
    projectRisks: assessProjectRisks(gaps, enterpriseProfile),
    businessRisks: assessBusinessRisks(gaps, enterpriseProfile),
    technicalRisks: assessTechnicalRisks(gaps, enterpriseProfile),
    mitigationPlans: designMitigationPlans(gaps),
    overallRiskProfile: calculateOverallRisk(gaps)
  };
}

/**
 * 评估项目风险
 */
function assessProjectRisks(gaps, enterpriseProfile) {
  return [
    {
      id: 'PRJ-001',
      category: '项目',
      title: '范围蔓延',
      likelihood: 'medium',
      impact: 'high',
      riskScore: 6,
      mitigation: [
        '明确范围边界',
        '变更管理流程',
        '定期范围审视'
      ],
      contingency: '冻结范围，评估后续迭代'
    },
    {
      id: 'PRJ-002',
      category: '项目',
      title: '资源不足',
      likelihood: 'medium',
      impact: 'high',
      riskScore: 6,
      mitigation: [
        '提前锁定资源',
        '培养内部关键用户',
        '建立备选团队'
      ],
      contingency: '外部顾问补充'
    },
    {
      id: 'PRJ-003',
      category: '项目',
      title: '关键用户流失',
      likelihood: 'low',
      impact: 'high',
      riskScore: 4,
      mitigation: [
        '知识转移计划',
        '备份人员培养',
        '文档标准化'
      ],
      contingency: '快速招聘或外部支持'
    },
    {
      id: 'PRJ-004',
      category: '项目',
      title: '关键里程碑延期',
      likelihood: 'medium',
      impact: 'medium',
      riskScore: 4,
      mitigation: [
        '分阶段交付',
        '风险预警机制',
        '敏捷迭代管理'
      ],
      contingency: '调整交付计划'
    }
  ];
}

/**
 * 评估业务风险
 */
function assessBusinessRisks(gaps, enterpriseProfile) {
  return [
    {
      id: 'BUS-001',
      category: '业务',
      title: '用户抵触',
      likelihood: 'medium',
      impact: 'high',
      riskScore: 6,
      mitigation: [
        '充分沟通培训',
        '渐进式推进',
        '激励机制'
      ],
      contingency: '高层介入推动'
    },
    {
      id: 'BUS-002',
      category: '业务',
      title: '业务流程中断',
      likelihood: 'medium',
      impact: 'high',
      riskScore: 6,
      mitigation: [
        '并行运行期',
        '应急预案',
        '快速响应团队'
      ],
      contingency: '回退到原系统'
    },
    {
      id: 'BUS-003',
      category: '业务',
      title: '数据质量差',
      likelihood: 'high',
      impact: 'medium',
      riskScore: 6,
      mitigation: [
        '数据清理专项',
        '数据治理流程',
        '定期数据质量检查'
      ],
      contingency: '接受部分数据不迁移'
    },
    {
      id: 'BUS-004',
      category: '业务',
      title: '供应商配合度低',
      likelihood: 'medium',
      impact: 'medium',
      riskScore: 4,
      mitigation: [
        '供应商激励计划',
        '简化接入流程',
        '多渠道支持'
      ],
      contingency: '人工协助过渡'
    }
  ];
}

/**
 * 评估技术风险
 */
function assessTechnicalRisks(gaps, enterpriseProfile) {
  const highGapCount = gaps.filter(g => g.severity === 'high' || g.severity === 'critical').length;
  
  return [
    {
      id: 'TEC-001',
      category: '技术',
      title: '集成开发复杂',
      likelihood: 'high',
      impact: 'high',
      riskScore: 9,
      mitigation: [
        'SAP CPI统一集成',
        '标准接口优先',
        '充分测试验证'
      ],
      contingency: '简化集成范围'
    },
    {
      id: 'TEC-002',
      category: '技术',
      title: '性能不达标',
      likelihood: 'low',
      impact: 'high',
      riskScore: 4,
      mitigation: [
        '性能测试计划',
        '优化资源配置',
        '监控预警'
      ],
      contingency: '扩容或优化'
    },
    {
      id: 'TEC-003',
      category: '技术',
      title: '安全漏洞',
      likelihood: 'low',
      impact: 'high',
      riskScore: 4,
      mitigation: [
        '安全测试',
        '代码审查',
        '渗透测试'
      ],
      contingency: '紧急修补'
    },
    {
      id: 'TEC-004',
      category: '技术',
      title: '定制开发风险',
      likelihood: 'medium',
      impact: 'medium',
      riskScore: 4,
      mitigation: [
        '最小化定制',
        '标准功能优先',
        '文档维护'
      ],
      contingency: '回退到标准流程'
    }
  ];
}

/**
 * 设计缓解计划
 */
function designMitigationPlans(gaps) {
  return {
    topRisks: gaps.filter(g => g.risk === 'high').map(g => ({
      riskId: g.id,
      riskTitle: g.description,
      primaryMitigation: '见各风险项',
      responsible: '项目经理',
      deadline: '上线前'
    })),
    monitoringPlan: [
      '周风险评审会',
      '月度风险报告',
      '重大风险实时升级'
    ],
    escalationPath: [
      '项目层面：项目经理',
      '部门层面：项目总监',
      '公司层面：项目发起人'
    ]
  };
}

/**
 * 计算整体风险
 */
function calculateOverallRisk(gaps) {
  const highGapCount = gaps.filter(g => g.risk === 'high').length;
  const mediumGapCount = gaps.filter(g => g.risk === 'medium').length;
  
  let level = 'low';
  let score = 20;
  
  if (highGapCount >= 3) {
    level = 'high';
    score = 75;
  } else if (highGapCount >= 1 || mediumGapCount >= 4) {
    level = 'medium';
    score = 50;
  }
  
  return {
    level,
    score,
    summary: level === 'high' ? '项目风险较高，需要重点关注' :
             level === 'medium' ? '项目风险可控，需要持续监控' :
             '项目风险较低，可按计划推进',
    keyFocusAreas: [
      '集成开发',
      '数据质量',
      '用户培训',
      '变更管理'
    ]
  };
}

// ============================================================================
// 模块11: 项目治理
// ============================================================================

/**
 * 规划项目治理
 */
function planProjectGovernance(enterpriseProfile) {
  return {
    organization: designProjectOrganization(enterpriseProfile),
    decisionMaking: designDecisionMechanism(),
    communication: designProjectCommunication(),
    escalation: designEscalationProcess(),
    quality: designQualityManagement()
  };
}

/**
 * 设计项目组织
 */
function designProjectOrganization(enterpriseProfile) {
  return {
    steeringCommittee: {
      role: '项目指导委员会',
      members: [
        { title: 'CEO/COO', role: '主席' },
        { title: 'CFO', role: '成员' },
        { title: 'CTO', role: '成员' },
        { title: '采购总监', role: '成员' }
      ],
      responsibilities: [
        '战略决策',
        '资源调配',
        '重大问题解决',
        '上线审批'
      ],
      frequency: '月度'
    },
    projectTeam: {
      projectManager: {
        role: '项目经理',
        responsibilities: ['日常管理', '进度控制', '风险管理', '协调沟通'],
        timeAllocation: '100%'
      },
      functionalLead: {
        role: '业务负责人',
        responsibilities: ['需求确认', 'UAT测试', '培训支持', '上线验收'],
        timeAllocation: '50%'
      },
      technicalLead: {
        role: '技术负责人',
        responsibilities: ['架构设计', '集成开发', '技术测试', '问题解决'],
        timeAllocation: '80%'
      },
      keyUsers: {
        role: '关键用户',
        count: 6,
        responsibilities: ['业务测试', '培训支持', '问题反馈', '用户指导'],
        timeAllocation: '30%'
      }
    },
    externalTeam: {
      vendorPM: 'SAP实施伙伴项目经理',
      consultants: '4-6人',
      specialists: '按需'
    }
  };
}

/**
 * 设计决策机制
 */
function designDecisionMechanism() {
  return {
    decisionTypes: [
      {
        type: '战略决策',
        threshold: '影响范围>2个部门或预算>50万',
        authority: '指导委员会',
        timeline: '5个工作日'
      },
      {
        type: '战术决策',
        threshold: '影响范围≤2个部门且预算≤50万',
        authority: '项目总监',
        timeline: '3个工作日'
      },
      {
        type: '执行决策',
        threshold: '日常工作事项',
        authority: '项目经理',
        timeline: '1个工作日'
      }
    ],
    RACIMatrix: {
      Responsible: '项目经理',
      Accountable: '业务负责人',
      Consulted: '指导委员会（重大事项）',
      Informed: '全员（定期通报）'
    }
  };
}

/**
 * 设计项目沟通机制
 */
function designProjectCommunication() {
  return {
    regularMeetings: [
      {
        name: '项目周会',
        participants: '项目团队',
        frequency: '每周',
        format: '线下/线上',
        agenda: ['进度回顾', '下周计划', '问题升级', '风险讨论']
      },
      {
        name: '月度项目汇报',
        participants: '指导委员会',
        frequency: '每月',
        format: '汇报材料',
        agenda: ['整体进度', '关键里程碑', '风险状态', '资源需求']
      },
      {
        name: '业务部门沟通会',
        participants: '业务部门代表',
        frequency: '双周',
        format: '研讨会',
        agenda: ['需求确认', '培训安排', '反馈收集', '上线准备']
      }
    ],
    reporting: {
      weekly: {
        recipients: '项目团队',
        content: '进度报告、问题清单、风险状态'
      },
      monthly: {
        recipients: '指导委员会',
        content: '项目状态报告、KPI达成、决策请求'
      },
      milestone: {
        recipients: '全员',
        content: '里程碑达成、庆祝成功'
      }
    },
    documentation: {
      repository: 'Confluence/SharePoint',
      access: '按角色授权',
      retention: '项目结束+2年'
    }
  };
}

/**
 * 设计升级流程
 */
function designEscalationProcess() {
  return {
    levels: [
      {
        level: 1,
        name: '执行层',
        handlers: ['关键用户', '顾问'],
        scope: '操作问题',
        responseTime: '4小时'
      },
      {
        level: 2,
        name: '管理层',
        handlers: ['项目经理', '业务负责人'],
        scope: '进度/资源问题',
        responseTime: '1个工作日'
      },
      {
        level: 3,
        name: '领导层',
        handlers: ['项目总监', '部门总监'],
        scope: '战略/重大问题',
        responseTime: '2个工作日'
      },
      {
        level: 4,
        name: '执行委员会',
        handlers: ['指导委员会'],
        scope: '需要高层决策',
        responseTime: '5个工作日'
      }
    ],
    criteria: [
      '影响关键里程碑',
      '超出预算阈值',
      '需要额外资源',
      '影响业务连续性',
      '法律/合规风险'
    ]
  };
}

/**
 * 设计质量管理
 */
function designQualityManagement() {
  return {
    qualityGates: [
      {
        gate: 'G1-方案设计',
        criteria: ['方案评审通过', '技术架构确认', '风险评估完成'],
        signoff: '技术负责人'
      },
      {
        gate: 'G2-开发完成',
        criteria: ['单元测试通过', '代码审查通过', '集成测试通过'],
        signoff: '项目经理'
      },
      {
        gate: 'G3-UAT完成',
        criteria: ['测试用例100%通过', '关键用户确认', '问题关闭率>95%'],
        signoff: '业务负责人'
      },
      {
        gate: 'G4-上线准备',
        criteria: ['培训完成', '数据就绪', '回退方案确认'],
        signoff: '项目总监'
      }
    ],
    metrics: {
      defectDensity: '< 5 defects/KLOC',
      testCoverage: '> 90%',
      issueResolutionTime: '< 48小时',
      userSatisfaction: '> 80%'
    }
  };
}

// ============================================================================
// 模块12: 试点方案
// ============================================================================

/**
 * 设计试点方案
 */
function designPilotPlan(gaps, enterpriseProfile) {
  return {
    scope: designPilotScope(gaps, enterpriseProfile),
    successCriteria: defineSuccessCriteria(),
    timeline: designPilotTimeline(),
    rolloutStrategy: designRolloutStrategy(enterpriseProfile),
    resources: designPilotResources()
  };
}

/**
 * 设计试点范围
 */
function designPilotScope(gaps, enterpriseProfile) {
  // 选择Gap少、风险低的模块作为试点
  const pilotModules = Object.entries(gaps)
    .filter(([_, g]) => g.priorityLevel === 'P1' || g.priorityLevel === 'P2')
    .slice(0, 2)
    .map(([id]) => id);
  
  return {
    modules: pilotModules.length > 0 ? pilotModules : ['buying'],
    geographicScope: '单一地点/部门',
    userScope: {
      internal: 30,
      external: 5
    },
    transactionVolume: {
      orders: 100,
      invoices: 50,
      suppliers: 20
    },
    duration: '4-8周',
    rationale: '选择风险可控、价值明显的场景进行验证'
  };
}

/**
 * 定义成功标准
 */
function defineSuccessCriteria() {
  return {
    businessCriteria: [
      { metric: '流程完成率', target: '> 95%', measurement: '系统成功处理/总处理量' },
      { metric: '用户采纳率', target: '> 80%', measurement: '活跃用户/总授权用户' },
      { metric: '处理效率提升', target: '> 30%', measurement: '对比原流程处理时间' }
    ],
    technicalCriteria: [
      { metric: '系统可用性', target: '> 99.5%', measurement: '正常运行时间' },
      { metric: '响应时间', target: '< 3秒', measurement: 'P95响应时间' },
      { metric: '集成成功率', target: '> 99%', measurement: '成功集成/总集成量' }
    ],
    operationalCriteria: [
      { metric: '数据准确性', target: '> 99%', measurement: '正确数据/总数据' },
      { metric: '问题响应时间', target: '< 4小时', measurement: 'P1问题平均响应' },
      { metric: '用户满意度', target: '> 4.0/5.0', measurement: '满意度调查' }
    ],
    goNoGoCriteria: [
      '业务测试通过率 > 95%',
      '关键用户签字确认',
      '无P1/P2未解决问题'
    ]
  };
}

/**
 * 设计试点时间线
 */
function designPilotTimeline() {
  return {
    phases: [
      {
        phase: 1,
        name: '准备阶段',
        duration: '2周',
        activities: [
          '试点团队组建',
          '环境准备',
          '数据准备',
          '培训实施'
        ]
      },
      {
        phase: 2,
        name: 'UAT阶段',
        duration: '2周',
        activities: [
          '业务测试',
          '缺陷修复',
          '用户确认'
        ]
      },
      {
        phase: 3,
        name: '试运行阶段',
        duration: '4周',
        activities: [
          '并行运行',
          '问题收集',
          '优化调整'
        ]
      },
      {
        phase: 4,
        name: '评估阶段',
        duration: '1周',
        activities: [
          '数据收集',
          '效果评估',
          '经验总结'
        ]
      }
    ],
    totalDuration: '9周',
    milestones: {
      pilotKickoff: 'Week 0',
      uatStart: 'Week 3',
      goLive: 'Week 5',
      pilotComplete: 'Week 9'
    }
  };
}

/**
 * 设计推广策略
 */
function designRolloutStrategy(enterpriseProfile) {
  return {
    approach: 'wave',
    waves: [
      {
        wave: 1,
        name: '核心推广',
        scope: '采购部全员',
        timeline: 'Week 10-14',
        users: 50,
        successCriteria: '基准达成'
      },
      {
        wave: 2,
        name: '横向扩展',
        scope: '其他需求部门',
        timeline: 'Week 15-20',
        users: 100,
        successCriteria: '流程标准化'
      },
      {
        wave: 3,
        name: '深化应用',
        scope: '全组织',
        timeline: 'Week 21-26',
        users: 200,
        successCriteria: '全面覆盖'
      }
    ],
    prerequisites: [
      '试点成功',
      '培训材料完善',
      '支持团队就绪',
      '推广经验总结'
    ],
    riskMitigation: [
      '渐进式推广',
      '充分培训支持',
      '快速响应团队',
      '经验分享机制'
    ]
  };
}

/**
 * 设计试点资源
 */
function designPilotResources() {
  return {
    team: {
      internal: 8,
      external: 4
    },
    budget: '实施预算的30%',
    tools: [
      '测试环境',
      '培训环境',
      '文档库',
      '监控工具'
    ],
    training: {
      sessions: 6,
      hours: 40,
      materials: '电子版+纸质版'
    }
  };
}

// ============================================================================
// 模块13: 成功案例
// ============================================================================

/**
 * 查找成功案例
 */
function findSuccessCases(enterpriseProfile) {
  const cases = getSuccessCases();
  
  // 根据行业筛选相关案例
  const relevantCases = cases.filter(c => 
    c.industry === enterpriseProfile.basicInfo.industry || 
    c.industry === '通用'
  );
  
  return {
    industryCases: relevantCases.slice(0, 3),
    similarSizeCases: cases.filter(c => 
      c.companySize === enterpriseProfile.basicInfo.companySize
    ).slice(0, 2),
    keyLearnings: extractKeyLearnings(cases),
    referenceValue: '高参考价值，建议深入了解'
  };
}

/**
 * 获取成功案例库
 */
function getSuccessCases() {
  return [
    {
      id: 'CASE-001',
      company: '某大型制造企业',
      industry: '制造业',
      companySize: '大型企业',
      modules: ['buying', 'sourcing', 'supplier_management'],
      duration: '12个月',
      investment: '1200万',
      benefits: [
        '年节约采购成本8%',
        '审批周期缩短60%',
        '供应商响应时间提升50%'
      ],
      keySuccessFactors: [
        '高层强力支持',
        '数据质量治理',
        '充分的用户培训'
      ]
    },
    {
      id: 'CASE-002',
      company: '某知名零售企业',
      industry: '零售',
      companySize: '大型企业',
      modules: ['catalog', 'buying', 'invoicing'],
      duration: '8个月',
      investment: '800万',
      benefits: [
        '目录采购占比提升至70%',
        '发票处理效率提升45%',
        '支出可视性达95%'
      ],
      keySuccessFactors: [
        'Punchout集成',
        '供应商充分培训',
        '移动端应用'
      ]
    },
    {
      id: 'CASE-003',
      company: '某三甲医院',
      industry: '医疗健康',
      companySize: '中型企业',
      modules: ['buying', 'contract', 'supplier_management'],
      duration: '10个月',
      investment: '600万',
      benefits: [
        '采购合规率提升至98%',
        '供应商准入周期缩短50%',
        '合同管理效率提升70%'
      ],
      keySuccessFactors: [
        'GSP合规设计',
        '资质管理自动化',
        '审批流程优化'
      ]
    },
    {
      id: 'CASE-004',
      company: '某政府机关',
      industry: '政府',
      companySize: '中型企业',
      modules: ['buying', 'sourcing', 'contract'],
      duration: '14个月',
      investment: '700万',
      benefits: [
        '阳光采购达标',
        '审计追踪完整',
        '采购周期透明'
      ],
      keySuccessFactors: [
        '合规优先设计',
        '全程电子化',
        '多部门协同'
      ]
    }
  ];
}

/**
 * 提取关键经验
 */
function extractKeyLearnings(cases) {
  return [
    {
      topic: '项目启动',
      learnings: [
        '高层 sponsor 必须到位',
        '业务部门全程参与',
        '明确项目目标和KPI'
      ]
    },
    {
      topic: '数据准备',
      learnings: [
        '提前6个月启动数据治理',
        '主数据标准化是关键',
        '历史数据需要清理'
      ]
    },
    {
      topic: '变革管理',
      learnings: [
        '培训要充分且分层次',
        '激励机制促进采纳',
        '超级用户发挥关键作用'
      ]
    },
    {
      topic: '技术实施',
      learnings: [
        '集成测试要充分',
        '分阶段上线降低风险',
        '并行运行确保平稳过渡'
      ]
    }
  ];
}

// ============================================================================
// 模块14: 实施建议
// ============================================================================

/**
 * 生成实施建议
 */
function generateRecommendations(analysis) {
  const { enterpriseProfile, capabilityMatch, gaps, roi, risks } = analysis;
  
  return {
    executiveSummary: generateExecutiveSummary(analysis),
    roadmap: designImplementationRoadmap(gaps, enterpriseProfile),
    resourcePlan: planResources(enterpriseProfile),
    timeline: designOverallTimeline(gaps),
    recommendations: generateDetailedRecommendations(analysis)
  };
}

/**
 * 生成执行摘要
 */
function generateExecutiveSummary(analysis) {
  const { enterpriseProfile, capabilityMatch, gaps, roi, risks, recommendations } = analysis;
  
  const keyFindings = [];
  
  // 匹配度发现
  if (capabilityMatch.overallScore.overallMatchRate >= 80) {
    keyFindings.push('Ariba与贵司需求高度匹配，实施风险较低');
  } else if (capabilityMatch.overallScore.overallMatchRate >= 60) {
    keyFindings.push('Ariba可满足贵司大部分需求，少量定制可弥补差距');
  } else {
    keyFindings.push('建议深入评估Ariba与需求的匹配程度，考虑备选方案');
  }
  
  // ROI发现
  keyFindings.push(`预计年节约采购成本${roi.roiMetrics.threeYearROI}%，${roi.roiMetrics.paybackPeriodMonths}个月收回投资`);
  
  // 风险发现
  if (risks.overallRiskProfile.level === 'high') {
    keyFindings.push('项目风险较高，需要重点关注集成和数据质量');
  } else if (risks.overallRiskProfile.level === 'medium') {
    keyFindings.push('项目风险可控，建议加强变更管理和用户培训');
  } else {
    keyFindings.push('项目整体风险较低，可按计划推进');
  }
  
  return {
    title: 'SAP Ariba需求分析报告 - 执行摘要',
    keyFindings,
    coreRecommendations: [
      '建议采用分阶段实施策略',
      '优先实施核心模块，快速交付价值',
      '充分重视数据治理和主数据质量',
      '加强变革管理和用户培训',
      '建立有效的项目治理机制'
    ],
    expectedOutcomes: [
      `采购效率提升${Math.round(roi.savingsAnalysis.totalAnnualSavings / 10000 * 30)}%`,
      `审批周期缩短50%以上`,
      `支出可视性达到${capabilityMatch.overallScore.coverageRate}%`,
      `供应商协同效率提升40%`
    ],
    goDecision: capabilityMatch.overallScore.overallMatchRate >= 60 && 
                 risks.overallRiskProfile.level !== 'high' ? 
                 '建议推进' : '建议深入评估后再决策'
  };
}

/**
 * 设计实施路线图
 */
function designImplementationRoadmap(gaps, enterpriseProfile) {
  const phases = [];
  
  // 阶段1：基础建设
  phases.push({
    phase: 1,
    name: '基础建设期',
    duration: '3个月',
    objectives: [
      '完成项目准备与启动',
      '完成需求详细分析和方案设计',
      '完成系统配置和基础开发',
      '完成主数据迁移准备'
    ],
    deliverables: [
      '项目计划与治理文档',
      '详细设计方案',
      '配置完成系统',
      '主数据迁移方案'
    ],
    modules: ['foundation'],
    milestones: [
      { name: '项目Kickoff', date: 'Month 1' },
      { name: '方案设计完成', date: 'Month 2' },
      { name: '配置完成', date: 'Month 3' }
    ]
  });
  
  // 阶段2：试点实施
  phases.push({
    phase: 2,
    name: '试点实施期',
    duration: '3个月',
    objectives: [
      '完成试点范围系统开发',
      '完成集成接口开发',
      '完成试点用户培训',
      '完成试点上线与验证'
    ],
    deliverables: [
      '试点系统',
      '集成接口',
      '培训材料',
      'UAT测试报告'
    ],
    modules: designPilotScope(gaps, enterpriseProfile).modules,
    milestones: [
      { name: 'UAT开始', date: 'Month 4' },
      { name: '试点上线', date: 'Month 5' },
      { name: '试点验收', date: 'Month 6' }
    ]
  });
  
  // 阶段3：全面推广
  phases.push({
    phase: 3,
    name: '全面推广期',
    duration: '4个月',
    objectives: [
      '完成全面推广开发',
      '完成全员培训',
      '完成分批次上线',
      '完成系统优化'
    ],
    deliverables: [
      '完整系统',
      '培训完成报告',
      '上线切换文档',
      '优化配置'
    ],
    modules: Object.keys(gaps.reduce((acc, g) => ({ ...acc, [g.module]: true }), {})),
    milestones: [
      { name: '第一批推广', date: 'Month 7' },
      { name: '第二批推广', date: 'Month 8' },
      { name: '第三批推广', date: 'Month 9' },
      { name: '系统优化', date: 'Month 10' }
    ]
  });
  
  // 阶段4：持续优化
  phases.push({
    phase: 4,
    name: '持续优化期',
    duration: '6个月',
    objectives: [
      '监控运营指标',
      '收集用户反馈',
      '持续优化改进',
      '挖掘更多价值'
    ],
    deliverables: [
      '月度运营报告',
      '优化需求清单',
      '价值实现报告',
      '最佳实践总结'
    ],
    milestones: [
      { name: '上线后1个月', date: 'Month 11' },
      { name: '上线后3个月', date: 'Month 13' },
      { name: '上线后6个月', date: 'Month 16' }
    ]
  });
  
  return {
    phases,
    totalDuration: '16个月',
    criticalPath: '方案设计→试点→推广',
    phaseGateReviews: ['Phase 1 Gate Review', 'Phase 2 Gate Review', 'Phase 3 Gate Review', 'Go Live Review']
  };
}

/**
 * 规划资源需求
 */
function planResources(enterpriseProfile) {
  return {
    teamSize: {
      internal: {
        peak: 15,
        average: 10
      },
      external: {
        peak: 8,
        average: 6
      }
    },
    byPhase: [
      {
        phase: '基础建设',
        internal: 8,
        external: 4
      },
      {
        phase: '试点实施',
        internal: 12,
        external: 6
      },
      {
        phase: '全面推广',
        internal: 15,
        external: 8
      },
      {
        phase: '持续优化',
        internal: 5,
        external: 3
      }
    ],
    skills: [
      '项目管理',
      '业务分析',
      'SAP Ariba技术',
      '系统集成',
      '数据治理',
      '变革管理'
    ],
    keyRoles: [
      { role: '项目经理', required: 1, source: '内部' },
      { role: '业务分析师', required: 2, source: '混合' },
      { role: 'Ariba顾问', required: 3, source: '外部' },
      { role: '集成顾问', required: 2, source: '外部' },
      { role: '培训师', required: 1, source: '混合' }
    ]
  };
}

/**
 * 设计整体时间线
 */
function designOverallTimeline(gaps) {
  return {
    startDate: 'TBD',
    endDate: '+16个月',
    summary: [
      { phase: '基础建设', start: 'Month 1', end: 'Month 3', duration: '3个月' },
      { phase: '试点实施', start: 'Month 4', end: 'Month 6', duration: '3个月' },
      { phase: '全面推广', start: 'Month 7', end: 'Month 10', duration: '4个月' },
      { phase: '持续优化', start: 'Month 11', end: 'Month 16', duration: '6个月' }
    ],
    keyMilestones: [
      { milestone: '项目Kickoff', target: 'Month 1' },
      { milestone: '方案设计完成', target: 'Month 2' },
      { milestone: '系统配置完成', target: 'Month 3' },
      { milestone: 'UAT开始', target: 'Month 4' },
      { milestone: '试点上线', target: 'Month 5' },
      { milestone: '试点验收', target: 'Month 6' },
      { milestone: '全面上线', target: 'Month 10' },
      { milestone: '项目收尾', target: 'Month 12' }
    ]
  };
}

/**
 * 生成详细建议
 */
function generateDetailedRecommendations(analysis) {
  const { enterpriseProfile, capabilityMatch, gaps, roi, risks } = analysis;
  
  const recommendations = [];
  
  // 战略建议
  recommendations.push({
    category: '战略',
    priority: 'P1',
    title: '明确采购数字化战略目标',
    description: '将Ariba实施与公司采购数字化战略对齐，建立明确的长期目标和短期里程碑',
    rationale: '确保项目成功并持续创造价值'
  });
  
  // 组织建议
  if (risks.overallRiskProfile.level !== 'low') {
    recommendations.push({
      category: '组织',
      priority: 'P1',
      title: '建立强力的项目组织',
      description: '确保有足够权限的项目发起人，组建全职项目团队，明确各部门职责',
      rationale: '项目治理是成功的关键保障'
    });
  }
  
  // 技术建议
  recommendations.push({
    category: '技术',
    priority: 'P2',
    title: '重视数据治理',
    description: '提前启动数据清理和标准化工作，建立主数据管理流程和职责',
    rationale: '数据质量直接影响系统价值和用户体验'
  });
  
  // 集成建议
  if (Object.keys(capabilityMatch.moduleScores).length > 3) {
    recommendations.push({
      category: '技术',
      priority: 'P2',
      title: '建立集成平台',
      description: '采用SAP CPI作为统一的集成中间件，确保系统间数据同步的可靠性和时效性',
      rationale: '集成是复杂部署的核心挑战'
    });
  }
  
  // 变更建议
  recommendations.push({
    category: '变革',
    priority: 'P1',
    title: '加强变革管理',
    description: '制定全面的沟通和培训计划，建立激励机制，关注用户反馈',
    rationale: '用户采纳是实现ROI的前提'
  });
  
  // 分阶段建议
  recommendations.push({
    category: '实施',
    priority: 'P2',
    title: '采用分阶段实施策略',
    description: '先试点验证，再逐步推广，降低风险，积累经验',
    rationale: '确保平稳过渡，降低业务风险'
  });
  
  return recommendations;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 加载Ariba能力库
 */
async function loadAribaCapabilities() {
  try {
    const capabilitiesPath = path.join(__dirname, '../data/ariba-capabilities.json');
    const data = await fs.readFile(capabilitiesPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('加载能力库失败:', error);
    throw error;
  }
}

/**
 * 优先级业务领域
 */
function prioritizeBusinessAreas(requirements) {
  const categoryScores = {};
  
  requirements.forEach(req => {
    const category = req.category || 'other';
    categoryScores[category] = (categoryScores[category] || 0) + (req.priority === 'high' ? 3 : req.priority === 'medium' ? 2 : 1);
  });
  
  return Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
}

/**
 * 业务优先级
 */
function businessPriorities(requirements) {
  return prioritizeBusinessAreas(requirements).slice(0, 5);
}

/**
 * 保存报告
 */
async function saveReport(reportId, report) {
  try {
    const reportsDir = path.join(__dirname, '../../data/reports');
    await fs.mkdir(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, `${reportId}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    return reportPath;
  } catch (error) {
    console.error('保存报告失败:', error);
    throw error;
  }
}

/**
 * 获取报告
 */
async function getReport(reportId) {
  try {
    const reportPath = path.join(__dirname, `../../data/reports/${reportId}.json`);
    const data = await fs.readFile(reportPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('获取报告失败:', error);
    throw error;
  }
}

/**
 * 获取访谈状态
 */
function getInterviewStatus(sessionId) {
  // 从需求服务获取访谈状态
  const requirementService = require('./requirement');
  return requirementService.getInterviewStatus(sessionId);
}

// ============================================================================
// 导出函数
// ============================================================================

module.exports = {
  generateReport,
  getReport,
  analyzeEnterprise,
  matchAriba,
  analyzeGaps,
  prioritizeGaps,
  calculateROI,
  assessRisks,
  generateRecommendations,
  loadAribaCapabilities
};
