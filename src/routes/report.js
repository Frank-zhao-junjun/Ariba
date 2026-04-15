/**
 * 报告生成API路由 v1.0.0
 * 功能：
 * - POST /api/report/generate - 生成报告
 * - GET /api/report/:sessionId - 获取报告
 * - GET /api/report/:sessionId/export/:format - 导出报告
 */

const express = require('express');
const router = express.Router();
const reportGenerator = require('../services/report-generator');
const requirementService = require('../services/requirement');
const logger = require('../middleware/logger');

// ============================================================================
// 报告生成API
// ============================================================================

/**
 * POST /api/report/generate
 * 生成需求分析报告
 */
router.post('/generate', async (req, res) => {
  try {
    const { sessionId, interviewData } = req.body;
    
    // 验证输入
    if (!sessionId && !interviewData) {
      return res.status(400).json({
        success: false,
        error: '必须提供 sessionId 或 interviewData'
      });
    }
    
    let data;
    
    // 如果提供了sessionId，从访谈获取数据
    if (sessionId) {
      const interviewStatus = requirementService.getInterviewStatus(sessionId);
      if (!interviewStatus || !interviewStatus.answers) {
        return res.status(404).json({
          success: false,
          error: '访谈会话不存在或未完成'
        });
      }
      data = convertInterviewToReportData(interviewStatus);
    } else {
      data = interviewData;
    }
    
    // 生成报告
    const report = await reportGenerator.generateReport(data);
    
    logger.info('Report generated', { reportId: report.id, sessionId });
    
    res.json({
      success: true,
      reportId: report.id,
      report: {
        id: report.id,
        timestamp: report.timestamp,
        executiveSummary: report.executiveSummary,
        metadata: report.metadata
      }
    });
  } catch (error) {
    logger.logError('报告生成API错误', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/report/:reportId
 * 获取报告详情
 */
router.get('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await reportGenerator.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: '报告不存在'
      });
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    logger.logError('获取报告API错误', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/report/:reportId/summary
 * 获取报告摘要
 */
router.get('/:reportId/summary', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await reportGenerator.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: '报告不存在'
      });
    }
    
    // 返回摘要信息
    res.json({
      success: true,
      summary: {
        id: report.id,
        timestamp: report.timestamp,
        executiveSummary: report.executiveSummary,
        capabilityMatch: report.capabilityMatch?.overallScore,
        roiMetrics: report.roiAnalysis?.roiMetrics,
        riskProfile: report.riskAssessment?.overallRiskProfile,
        gapSummary: report.gapAnalysis?.summary
      }
    });
  } catch (error) {
    logger.logError('获取报告摘要API错误', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/report/:reportId/export/:format
 * 导出报告
 * 支持格式：html, json
 */
router.get('/:reportId/export/:format', async (req, res) => {
  try {
    const { reportId, format } = req.params;
    
    const report = await reportGenerator.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: '报告不存在'
      });
    }
    
    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${reportId}.json"`);
        res.json(report);
        break;
        
      case 'html':
        const htmlContent = generateHTMLReport(report);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${reportId}.html"`);
        res.send(htmlContent);
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: '不支持的导出格式，支持：json, html'
        });
    }
  } catch (error) {
    logger.logError('导出报告API错误', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/report/:reportId/charts
 * 获取报告图表数据
 */
router.get('/:reportId/charts', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await reportGenerator.getReport(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: '报告不存在'
      });
    }
    
    // 生成图表数据
    const charts = {
      // 能力匹配度雷达图
      capabilityRadar: generateCapabilityRadar(report.capabilityMatch),
      // Gap分布饼图
      gapDistribution: generateGapDistribution(report.gapAnalysis),
      // ROI趋势图
      roiTrend: generateROITrend(report.roiAnalysis),
      // 风险热力图
      riskMatrix: generateRiskMatrix(report.riskAssessment),
      // 实施路线图
      roadmap: generateRoadmapTimeline(report.implementationRoadmap)
    };
    
    res.json({
      success: true,
      charts
    });
  } catch (error) {
    logger.logError('获取图表数据API错误', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 转换访谈数据为报告数据格式
 */
function convertInterviewToReportData(interviewStatus) {
  const { answers, context } = interviewStatus;
  
  // 从答案中提取信息
  const requirements = [];
  const painPoints = [];
  
  // 解析访谈答案
  Object.entries(answers || {}).forEach(([key, value]) => {
    if (key.includes('requirement') || key.includes('需求')) {
      requirements.push({
        title: value.title || value,
        description: value.description || '',
        priority: value.priority || 'medium',
        category: value.category || inferCategory(value)
      });
    }
    
    if (key.includes('pain') || key.includes('痛点')) {
      painPoints.push({
        description: value,
        source: 'interview'
      });
    }
  });
  
  // 合并上下文信息
  return {
    industry: context?.industry || '通用',
    companySize: context?.companySize || '中型企业',
    employeeCount: answers?.employeeCount,
    annualSpend: answers?.annualSpend,
    supplierCount: answers?.supplierCount,
    erpSystem: answers?.erpSystem,
    requirements,
    painPoints,
    currentProcesses: answers?.processes,
    ...answers
  };
}

/**
 * 推断需求类别
 */
function inferCategory(value) {
  const text = JSON.stringify(value).toLowerCase();
  
  if (text.includes('审批') || text.includes('请购') || text.includes('订单')) return 'buying';
  if (text.includes('寻源') || text.includes('招标')) return 'sourcing';
  if (text.includes('合同')) return 'contract';
  if (text.includes('供应商') || text.includes('绩效')) return 'supplier_management';
  if (text.includes('发票') || text.includes('付款')) return 'invoicing';
  if (text.includes('目录') || text.includes('商品')) return 'catalog';
  if (text.includes('协同') || text.includes('供应链')) return 'scc';
  
  return 'other';
}

/**
 * 生成能力匹配雷达图数据
 */
function generateCapabilityRadar(capabilityMatch) {
  if (!capabilityMatch || !capabilityMatch.moduleScores) {
    return { labels: [], datasets: [] };
  }
  
  const labels = [];
  const coverageData = [];
  const fitData = [];
  const integrationData = [];
  
  Object.entries(capabilityMatch.moduleScores).forEach(([moduleId, score]) => {
    labels.push(score.moduleName || moduleId);
    coverageData.push(score.coverage || 0);
    fitData.push(score.fit || 0);
    integrationData.push(score.integration || 0);
  });
  
  return {
    labels,
    datasets: [
      {
        label: '功能覆盖率',
        data: coverageData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      },
      {
        label: '流程匹配度',
        data: fitData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2
      },
      {
        label: '集成可行性',
        data: integrationData,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2
      }
    ]
  };
}

/**
 * 生成Gap分布数据
 */
function generateGapDistribution(gapAnalysis) {
  if (!gapAnalysis || !gapAnalysis.summary) {
    return { labels: [], datasets: [] };
  }
  
  const { summary } = gapAnalysis;
  
  return {
    labels: ['严重', '高', '中', '低'],
    datasets: [{
      data: [summary.critical || 0, summary.high || 0, summary.medium || 0, summary.low || 0],
      backgroundColor: [
        '#e74c3c',
        '#f39c12',
        '#3498db',
        '#95a5a6'
      ]
    }]
  };
}

/**
 * 生成ROI趋势数据
 */
function generateROITrend(roiAnalysis) {
  if (!roiAnalysis) {
    return { labels: [], datasets: [] };
  }
  
  const { investmentAnalysis, savingsAnalysis } = roiAnalysis;
  const labels = ['Year 1', 'Year 2', 'Year 3'];
  
  return {
    labels,
    datasets: [
      {
        label: '累计投资',
        data: [
          investmentAnalysis?.yearlyBreakdown?.[0]?.cost || 0,
          (investmentAnalysis?.yearlyBreakdown?.[0]?.cost || 0) + (investmentAnalysis?.yearlyBreakdown?.[1]?.cost || 0),
          investmentAnalysis?.totalInvestment || 0
        ],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        fill: true
      },
      {
        label: '累计节约',
        data: [
          savingsAnalysis?.totalAnnualSavings || 0,
          (savingsAnalysis?.totalAnnualSavings || 0) * 2,
          (savingsAnalysis?.totalAnnualSavings || 0) * 3
        ],
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        fill: true
      }
    ]
  };
}

/**
 * 生成风险矩阵
 */
function generateRiskMatrix(riskAssessment) {
  if (!riskAssessment) {
    return { project: [], business: [], technical: [] };
  }
  
  const transformRisks = (risks) => {
    return (risks || []).map(r => ({
      id: r.id,
      title: r.title,
      likelihood: r.likelihood === 'high' ? 3 : r.likelihood === 'medium' ? 2 : 1,
      impact: r.impact === 'high' ? 3 : r.impact === 'medium' ? 2 : 1,
      riskScore: r.riskScore || 0
    }));
  };
  
  return {
    project: transformRisks(riskAssessment.projectRisks),
    business: transformRisks(riskAssessment.businessRisks),
    technical: transformRisks(riskAssessment.technicalRisks)
  };
}

/**
 * 生成路线图时间线
 */
function generateRoadmapTimeline(roadmap) {
  if (!roadmap || !roadmap.phases) {
    return [];
  }
  
  return roadmap.phases.map(phase => ({
    phase: phase.phase,
    name: phase.name,
    duration: phase.duration,
    modules: phase.modules,
    milestones: phase.milestones
  }));
}

/**
 * 生成HTML报告
 */
function generateHTMLReport(report) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.executiveSummary?.title || 'Ariba需求分析报告'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    .summary { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px; text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #3498db; }
    .metric-label { color: #7f8c8d; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #3498db; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .recommendation { background: #e8f6f3; padding: 15px; margin: 10px 0; border-left: 4px solid #1abc9c; }
    .risk-high { color: #e74c3c; }
    .risk-medium { color: #f39c12; }
    .risk-low { color: #27ae60; }
  </style>
</head>
<body>
  <h1>${report.executiveSummary?.title || 'Ariba需求分析报告'}</h1>
  <p>报告ID: ${report.id} | 生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
  
  <div class="summary">
    <h2>核心发现</h2>
    ${(report.executiveSummary?.keyFindings || []).map(f => `<p>• ${f}</p>`).join('')}
    
    <h3>关键指标</h3>
    <div class="metric">
      <div class="metric-value">${report.capabilityMatch?.overallScore?.overallMatchRate || 0}%</div>
      <div class="metric-label">Ariba匹配度</div>
    </div>
    <div class="metric">
      <div class="metric-value">${report.roiAnalysis?.roiMetrics?.threeYearROI || 0}%</div>
      <div class="metric-label">3年ROI</div>
    </div>
    <div class="metric">
      <div class="metric-value">${report.roiAnalysis?.roiMetrics?.paybackPeriodMonths || 0}月</div>
      <div class="metric-label">投资回收期</div>
    </div>
    <div class="metric">
      <div class="metric-value">${report.gapAnalysis?.summary?.totalGaps || 0}</div>
      <div class="metric-label">Gap数量</div>
    </div>
  </div>
  
  <div class="section">
    <h2>一、企业需求画像</h2>
    <table>
      <tr><th>项目</th><th>信息</th></tr>
      <tr><td>行业</td><td>${report.enterpriseProfile?.basicInfo?.industry || '-'}</td></tr>
      <tr><td>企业规模</td><td>${report.enterpriseProfile?.basicInfo?.companySize || '-'}</td></tr>
      <tr><td>员工数量</td><td>${report.enterpriseProfile?.basicInfo?.employeeCount || '-'}</td></tr>
      <tr><td>年采购额</td><td>${report.enterpriseProfile?.basicInfo?.annualSpend || '-'}</td></tr>
      <tr><td>供应商数量</td><td>${report.enterpriseProfile?.basicInfo?.supplierCount || '-'}</td></tr>
      <tr><td>现有ERP系统</td><td>${report.enterpriseProfile?.currentState?.erpSystem || '-'}</td></tr>
    </table>
    
    <h3>核心痛点</h3>
    ${(report.enterpriseProfile?.painPoints || []).map(p => `<p>• ${p.description || p}</p>`).join('')}
  </div>
  
  <div class="section">
    <h2>二、Ariba能力匹配度</h2>
    <table>
      <tr><th>模块</th><th>功能覆盖</th><th>流程匹配</th><th>集成可行性</th><th>总分</th></tr>
      ${Object.entries(report.capabilityMatch?.moduleScores || {}).map(([id, score]) => 
        `<tr><td>${score.moduleName || id}</td><td>${score.coverage || 0}%</td><td>${score.fit || 0}%</td><td>${score.integration || 0}%</td><td>${score.total || 0}%</td></tr>`
      ).join('')}
    </table>
    <p><strong>整体匹配度:</strong> ${report.capabilityMatch?.overallScore?.overallMatchRate || 0}% | 
       <strong>推荐意见:</strong> ${report.capabilityMatch?.overallScore?.recommendation || '-'}</p>
  </div>
  
  <div class="section">
    <h2>三、Gap分析</h2>
    <p>共识别 <strong>${report.gapAnalysis?.summary?.totalGaps || 0}</strong> 个差距项</p>
    <table>
      <tr><th>优先级</th><th>Gap描述</th><th>模块</th><th>风险</th></tr>
      ${(report.gapAnalysis?.gaps || []).slice(0, 10).map(gap => 
        `<tr><td>${gap.priorityLevel || '-'}</td><td>${gap.description || '-'}</td><td>${gap.module || '-'}</td><td class="risk-${gap.risk || 'low'}">${gap.risk || '-'}</td></tr>`
      ).join('')}
    </table>
  </div>
  
  <div class="section">
    <h2>四、ROI分析</h2>
    <table>
      <tr><th>指标</th><th>数值</th></tr>
      <tr><td>总投资成本</td><td>¥${(report.roiAnalysis?.investmentAnalysis?.totalInvestment || 0).toLocaleString()}</td></tr>
      <tr><td>年节约金额</td><td>¥${(report.roiAnalysis?.savingsAnalysis?.totalAnnualSavings || 0).toLocaleString()}</td></tr>
      <tr><td>3年ROI</td><td>${report.roiAnalysis?.roiMetrics?.threeYearROI || 0}%</td></tr>
      <tr><td>投资回收期</td><td>${report.roiAnalysis?.roiMetrics?.paybackPeriodMonths || 0}个月</td></tr>
    </table>
  </div>
  
  <div class="section">
    <h2>五、风险评估</h2>
    <p>整体风险等级: <strong class="risk-${report.riskAssessment?.overallRiskProfile?.level || 'low'}">${report.riskAssessment?.overallRiskProfile?.level || '-'}</strong></p>
    <p>${report.riskAssessment?.overallRiskProfile?.summary || '-'}</p>
    
    <h3>重点关注风险</h3>
    ${(report.riskAssessment?.projectRisks || []).filter(r => r.riskScore >= 6).map(r =>
      `<p>• ${r.title} (可能性: ${r.likelihood}, 影响: ${r.impact})</p>`
    ).join('')}
  </div>
  
  <div class="section">
    <h2>六、实施建议</h2>
    ${(report.implementationRoadmap?.recommendations || []).map(rec => `
      <div class="recommendation">
        <strong>[${rec.category} - ${rec.priority}] ${rec.title}</strong>
        <p>${rec.description}</p>
      </div>
    `).join('')}
    
    <h3>实施路线图</h3>
    <table>
      <tr><th>阶段</th><th>名称</th><th>时长</th><th>关键里程碑</th></tr>
      ${(report.implementationRoadmap?.roadmap?.phases || []).map(p =>
        `<tr><td>Phase ${p.phase}</td><td>${p.name}</td><td>${p.duration}</td><td>${p.milestones?.map(m => m.name).join(', ') || '-'}</td></tr>`
      ).join('')}
    </table>
    <p><strong>总工期:</strong> ${report.implementationRoadmap?.roadmap?.totalDuration || '-'}</p>
  </div>
  
  <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; text-align: center;">
    <p>本报告由 Ariba实施助手 自动生成 | ${report.metadata?.generatedBy || 'Ariba Assistant'}</p>
  </footer>
</body>
</html>`;
}

module.exports = router;
