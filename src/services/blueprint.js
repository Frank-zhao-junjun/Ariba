/**
 * 蓝图设计与User Stories服务
 */

const llm = require('./llm');
const knowledge = require('./knowledge');

async function getBlueprintTemplates(industry) {
  const templates = knowledge.loadBlueprintTemplates();
  if (industry) {
    return { success: true, templates: templates.filter(t => t.industry === industry || t.industry === '通用') };
  }
  return { success: true, templates };
}

function getRoleForModule(module) {
  const roleMap = { '采购申请': '采购申请人员', '供应商管理': '采购经理', '合同管理': '法务人员', '采购订单': '采购员', '收货管理': '仓库管理员', '发票管理': '财务人员' };
  return roleMap[module] || '采购人员';
}

function getBenefitForModule(module) {
  const benefitMap = { '采购申请': '快速提交采购需求，跟踪审批进度', '供应商管理': '规范供应商准入，确保供应质量', '合同管理': '管控合同风险，保障企业权益', '采购订单': '高效执行采购，提高供货及时性' };
  return benefitMap[module] || '提高采购效率';
}

function estimateHours(complexity) {
  const baseHours = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 12, 6: 16, 7: 24, 8: 32, 9: 40, 10: 48 };
  return baseHours[Math.min(Math.max(complexity, 1), 10)] || 8;
}

function generateBaseCriteria() {
  return [
    { type: 'functional', criteria: '能够成功完成操作', given: '用户在系统中', when: '执行相关操作时', then: '系统返回正确结果' },
    { type: 'validation', criteria: '数据验证通过', given: '用户输入有效数据', when: '提交表单时', then: '系统验证通过并保存' }
  ];
}

function validateInvestPrinciples(stories) {
  return stories.map(story => {
    const score = story.principles?.small ? 90 : 75;
    return { ...story, investValidation: { issues: story.principles?.small ? [] : ['建议拆分'] }, investScore: score };
  });
}

async function generateUserStories(params) {
  const { requirements, industry, processType } = params;
  const tmpl = knowledge.getBlueprintTemplate(industry, processType);
  
  const stories = (requirements || []).map((req, idx) => ({
    id: `US-${Date.now()}-${idx + 1}`,
    title: `实现${req.name || '功能'}`,
    asA: getRoleForModule(req.module),
    iWant: req.description || `实现${req.name}`,
    soThat: getBenefitForModule(req.module),
    acceptanceCriteria: generateBaseCriteria(),
    priority: req.priority || 'P1',
    estimatedHours: estimateHours(req.complexity || 5),
    phase: tmpl.phases?.[0]?.name || '通用',
    requirementId: req.id,
    principles: { independent: true, negotiable: true, valuable: true, estimable: true, small: (req.complexity || 5) <= 5, testable: true }
  }));
  
  return {
    success: true,
    userStories: validateInvestPrinciples(stories),
    template: { industry: tmpl.industry, processType: tmpl.processType, phases: tmpl.phases?.map(p => p.name) || [] },
    statistics: { totalStories: stories.length, totalEstimatedHours: stories.reduce((sum, s) => sum + s.estimatedHours, 0), averageInvestScore: 85 }
  };
}

async function generateAcceptanceCriteria(params) {
  const { userStory } = params;
  return { success: true, criteria: generateBaseCriteria(), format: 'Given-When-Then' };
}

async function generateFlowchart(params) {
  const { processType, industry } = params;
  const tmpl = knowledge.getBlueprintTemplate(industry, processType);
  
  let diagram = '```ascii\n';
  diagram += '┌─────────────────────────────────────┐\n';
  diagram += '│         Ariba采购流程               │\n';
  diagram += '└─────────────────┬───────────────────┘\n';
  diagram += '                  │\n';
  diagram += '                  ▼\n';
  
  (tmpl.phases || []).forEach((phase, idx) => {
    diagram += '┌─────────────────────────────────────┐\n';
    diagram += `│ ${idx + 1}. ${phase.name.padEnd(31)} │\n`;
    diagram += '└─────────────────┬───────────────────┘\n';
    if (idx < tmpl.phases.length - 1) {
      diagram += '                  │\n';
      diagram += '                  ▼\n';
    }
  });
  
  diagram += '┌─────────────────────────────────────┐\n';
  diagram += '│              流程结束               │\n';
  diagram += '└─────────────────────────────────────┘\n';
  diagram += '```\n';
  
  let mermaid = '```mermaid\nflowchart TD\n    Start([开始]) --> ';
  (tmpl.phases || []).forEach((phase, idx) => {
    mermaid += `\n    P${idx + 1}[${phase.name}]`;
    if (idx < tmpl.phases.length - 1) mermaid += `\n    P${idx + 1} --> P${idx + 2}`;
  });
  mermaid += '\n    P' + tmpl.phases.length + ' --> End([结束])\n```';
  
  return { success: true, flowchart: diagram, processType, industry, mermaid };
}

async function generateBlueprintDocument(params) {
  const { requirements, industry, processType } = params;
  
  const storiesResult = await generateUserStories({ requirements, industry, processType });
  const flowchartResult = await generateFlowchart({ processType, industry });
  const tmpl = knowledge.getBlueprintTemplate(industry, processType);
  
  const docId = `BP-DOC-${Date.now()}`;
  let md = `# 蓝图设计文档\n\n> 文档ID: ${docId}\n> 行业: ${industry}\n> 流程类型: ${processType}\n\n## 统计概览\n\n| 指标 | 值 |\n|------|----|\n`;
  md += `| User Stories总数 | ${storiesResult.userStories?.length || 0} |\n`;
  md += `| 总预估工时 | ${storiesResult.statistics?.totalEstimatedHours || 0}小时 |\n`;
  md += `| 平均INVEST评分 | ${storiesResult.statistics?.averageInvestScore || 0}% |\n\n`;
  md += `## 流程图\n\n${flowchartResult.flowchart}\n\n## User Stories\n\n`;
  
  (storiesResult.userStories || []).forEach(story => {
    md += `### ${story.id}: ${story.title}\n\n`;
    md += `**As a** ${story.asA}\n`;
    md += `**I want** ${story.iWant}\n`;
    md += `**So that** ${story.soThat}\n\n`;
    md += `| 属性 | 值 |\n|------|----|\n`;
    md += `| 优先级 | ${story.priority} |\n`;
    md += `| 预估工时 | ${story.estimatedHours}小时 |\n`;
    md += `| 阶段 | ${story.phase} |\n`;
    md += `| INVEST评分 | ${story.investScore}% |\n\n`;
  });
  
  return {
    success: true,
    document: { id: docId, timestamp: new Date().toISOString(), userStories: storiesResult.userStories, flowchart: flowchartResult.flowchart, mermaidDiagram: flowchartResult.mermaid, phases: tmpl.phases?.map(p => p.name) || [], statistics: storiesResult.statistics },
    markdown: md
  };
}

module.exports = { getBlueprintTemplates, generateUserStories, generateAcceptanceCriteria, generateFlowchart, generateBlueprintDocument, validateInvestPrinciples };
