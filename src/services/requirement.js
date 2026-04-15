/**
 * 需求分析服务 v1.7.0
 * 包含增强功能：
 * - 引导式访谈 (RA-F01)
 * - Ariba能力匹配 (RA-F02)
 * - 用户故事生成 (RA-F04)
 * - 周边能力识别 (RA-F06)
 * - 优先级评估增强 (RA-F05)
 */

const llm = require('./llm');
const knowledge = require('./knowledge');
const fs = require('fs');
const path = require('path');

// 访谈会话存储（内存）
const interviewSessions = new Map();

// ============================================================================
// 基础功能（保留）
// ============================================================================

async function analyzeRequirement(params) {
  const { industry, modules, description, existingRequirements } = params;
  
  try {
    const template = knowledge.getRequirementTemplate(industry, modules);
    
    // 构建用户需求
    const userReq = {
      id: `REQ-${Date.now()}`,
      description: description,
      module: modules,
      priority: 'P1',
      businessValue: 7,
      complexity: 5,
      dependencies: []
    };
    
    // 合并模板需求
    const requirements = [userReq];
    const templateReqs = (template.standardRequirements || []).slice(0, 3);
    templateReqs.forEach((req, idx) => {
      requirements.push({
        ...req,
        id: req.id || `REQ-TMPL-${idx}`,
        source: 'template',
        autoAdded: true
      });
    });
    
    return {
      success: true,
      industry,
      module: modules,
      requirements,
      supplements: [],
      conflicts: [],
      recommendations: [],
      template: { name: template.description, matched: template.industry === industry }
    };
  } catch (error) {
    console.error('需求分析失败:', error);
    return { success: false, error: error.message, requirements: [], supplements: [], conflicts: [] };
  }
}

async function supplementRequirements(params) {
  const { industry, modules, currentRequirements } = params;
  const template = knowledge.getRequirementTemplate(industry, modules);
  const existingIds = (currentRequirements || []).map(r => r.id);
  
  const supplements = (template.standardRequirements || [])
    .filter(req => !existingIds.includes(req.id))
    .map(req => ({
      ...req,
      source: 'template',
      reason: `基于${industry}行业${modules}模块的最佳实践建议`
    }));
  
  return { success: true, supplements, totalCount: supplements.length };
}

async function detectConflicts(requirements) {
  const conflicts = [];
  
  for (let i = 0; i < requirements.length; i++) {
    for (let j = i + 1; j < requirements.length; j++) {
      const req1 = requirements[i];
      const req2 = requirements[j];
      
      // 检测逻辑冲突
      if ((req1.description.includes('必须') && req2.description.includes('禁止')) ||
          (req1.description.includes('需要') && req2.description.includes('不需要'))) {
        conflicts.push({
          type: 'logical_conflict',
          level: 'error',
          requirements: [req1.id, req2.id],
          message: `需求 "${req1.description?.substring(0, 30)}" 和 "${req2.description?.substring(0, 30)}" 存在逻辑冲突`,
          suggestion: '请重新评估需求定义'
        });
      }
    }
  }
  
  return {
    success: true,
    conflicts,
    summary: { total: conflicts.length, critical: conflicts.filter(c => c.level === 'error').length, warnings: conflicts.filter(c => c.level === 'warning').length }
  };
}

// ============================================================================
// RA-F05: 优先级评估增强 (RICE + KANO)
// ============================================================================

async function evaluatePriority(requirements) {
  const evaluated = (requirements || []).map(req => {
    // RICE评分
    const reach = req.reach || 5;      // 1-10
    const impact = req.impact || 5;   // 1-10
    const confidence = req.confidence || 7; // 1-10
    const effort = req.effort || 5;    // 1-10
    
    // RICE公式: (Reach × Impact × Confidence) / Effort
    const riceScore = effort > 0 ? (reach * impact * confidence) / effort : 0;
    
    // KANO分类
    const kanoCategory = classifyKano(req);
    
    // 业务优先级
    let priority = 'P3';
    if (riceScore >= 50) priority = 'P0';
    else if (riceScore >= 30) priority = 'P1';
    else if (riceScore >= 15) priority = 'P2';
    
    return {
      ...req,
      rice: {
        reach,
        impact,
        confidence,
        effort,
        score: Math.round(riceScore * 100) / 100
      },
      kano: kanoCategory,
      priority
    };
  });
  
  evaluated.sort((a, b) => b.rice.score - a.rice.score);
  
  return {
    success: true,
    requirements: evaluated,
    summary: {
      total: evaluated.length,
      p0Count: evaluated.filter(r => r.priority === 'P0').length,
      p1Count: evaluated.filter(r => r.priority === 'P1').length,
      p2Count: evaluated.filter(r => r.priority === 'P2').length,
      p3Count: evaluated.filter(r => r.priority === 'P3').length,
      kanoDistribution: {
        basic: evaluated.filter(r => r.kano === '基本型需求').length,
        performance: evaluated.filter(r => r.kano === '期望型需求').length,
        excitement: evaluated.filter(r => r.kano === '兴奋型需求').length
      }
    },
    models: {
      rice: { formula: '(Reach × Impact × Confidence) / Effort', description: 'RICE评分模型，用于优先级排序' },
      kano: { types: ['基本型需求', '期望型需求', '兴奋型需求'], description: 'KANO模型，用于需求分类' }
    }
  };
}

/**
 * KANO分类
 */
function classifyKano(req) {
  const desc = (req.description || '').toLowerCase();
  const name = (req.name || '').toLowerCase();
  
  // 基本型需求关键词
  const basicKeywords = ['必须', '核心', '基础', '基本', '关键', 'essential', 'must'];
  // 期望型需求关键词
  const perfKeywords = ['增加', '提升', '优化', '改进', '提高', 'enhance', 'improve'];
  // 兴奋型需求关键词
  const excitementKeywords = ['智能', '自动', '创新', '惊喜', 'ai', '智能', 'automation'];
  
  // 检查是否有明确标记
  if (req.kanoType) return req.kanoType;
  
  // 根据关键词判断
  for (const kw of excitementKeywords) {
    if (desc.includes(kw) || name.includes(kw)) return '兴奋型需求';
  }
  for (const kw of perfKeywords) {
    if (desc.includes(kw) || name.includes(kw)) return '期望型需求';
  }
  for (const kw of basicKeywords) {
    if (desc.includes(kw) || name.includes(kw)) return '基本型需求';
  }
  
  // 默认根据影响和复杂度判断
  const impact = req.impact || 5;
  const complexity = req.complexity || 5;
  if (impact >= 8 && complexity <= 4) return '兴奋型需求';
  if (impact >= 6) return '期望型需求';
  return '基本型需求';
}

// ============================================================================
// RA-F01: 引导式访谈功能
// ============================================================================

/**
 * 加载访谈问题模板
 */
function loadInterviewQuestions() {
  const templatePath = path.join(knowledge.KNOWLEDGE_DIR, 'interview-questions.json');
  try {
    if (fs.existsSync(templatePath)) {
      const data = fs.readFileSync(templatePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载访谈问题模板失败:', error.message);
  }
  return getDefaultInterviewQuestions();
}

function getDefaultInterviewQuestions() {
  return {
    version: "1.0.0",
    stages: [
      { id: "stage_background", name: "背景调研", questions: [] },
      { id: "stage_requirement", name: "需求识别", questions: [] },
      { id: "stage_capability", name: "能力匹配", questions: [] },
      { id: "stage_priority", name: "优先级排序", questions: [] }
    ]
  };
}

/**
 * 开始访谈会话
 */
async function startInterview(params) {
  const { projectId, industry, modules, context } = params;
  const sessionId = `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const questions = loadInterviewQuestions();
  
  // 获取第一个问题
  const firstQuestion = findNextQuestion(questions, null);
  
  const session = {
    sessionId,
    projectId,
    industry: industry || '通用',
    modules: modules || '采购管理',
    context: context || {},
    questions,
    currentStage: 'stage_background',
    currentQuestionIndex: 0,
    answers: [],
    stageIndex: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  interviewSessions.set(sessionId, session);
  
  return {
    success: true,
    sessionId,
    stage: session.currentStage,
    stageName: getStageName(questions, session.currentStage),
    question: firstQuestion,
    progress: { current: 1, total: countTotalQuestions(questions), stage: 1, totalStages: questions.stages.length },
    frameworks: {
      scqa: questions.scqaFramework,
      fiveWtwoH: questions.fiveWtwoHFramework,
      kano: questions.kanoModel,
      rice: questions.riceModel
    }
  };
}

/**
 * 获取下一个问题
 */
async function nextInterviewQuestion(params) {
  const { sessionId, answer, skipFollowUp } = params;
  const session = interviewSessions.get(sessionId);
  
  if (!session) {
    return { success: false, error: '访谈会话不存在或已过期' };
  }
  
  // 记录答案
  const currentQ = getCurrentQuestion(session);
  if (currentQ && answer !== undefined) {
    session.answers.push({
      questionId: currentQ.id,
      question: currentQ.text,
      answer,
      timestamp: new Date().toISOString()
    });
  }
  
  // 提取关键信息到上下文
  if (answer && typeof answer === 'string') {
    session.context = extractContext(session, currentQ, answer);
  }
  
  // 查找下一个问题
  const nextQ = findNextQuestion(session.questions, currentQ, skipFollowUp);
  
  if (!nextQ) {
    // 访谈完成
    return {
      success: true,
      completed: true,
      sessionId,
      summary: generateInterviewSummary(session),
      nextSteps: await generateNextSteps(session)
    };
  }
  
  session.currentQuestionIndex++;
  if (nextQ.id.startsWith('stage_') || session.questions.stages.find(s => s.id === nextQ.id)) {
    session.currentStage = nextQ.id;
    session.stageIndex++;
  }
  session.updatedAt = new Date().toISOString();
  
  return {
    success: true,
    sessionId,
    currentQuestion: currentQ,
    yourAnswer: answer,
    nextQuestion: nextQ,
    stage: session.currentStage,
    stageName: getStageName(session.questions, session.currentStage),
    progress: {
      current: session.answers.length + 1,
      total: countTotalQuestions(session.questions),
      stage: session.stageIndex + 1,
      totalStages: session.questions.stages.length
    },
    context: session.context
  };
}

/**
 * 获取访谈状态
 */
function getInterviewStatus(sessionId) {
  const session = interviewSessions.get(sessionId);
  
  if (!session) {
    return { success: false, error: '访谈会话不存在或已过期' };
  }
  
  return {
    success: true,
    sessionId,
    projectId: session.projectId,
    stage: session.currentStage,
    stageName: getStageName(session.questions, session.currentStage),
    progress: {
      current: session.answers.length,
      total: countTotalQuestions(session.questions),
      stage: session.stageIndex + 1,
      totalStages: session.questions.stages.length,
      percentage: Math.round((session.answers.length / countTotalQuestions(session.questions)) * 100)
    },
    currentQuestion: getCurrentQuestion(session),
    context: session.context,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt
  };
}

// ============================================================================
// RA-F02: Ariba能力匹配
// ============================================================================

/**
 * 能力匹配
 */
async function matchCapabilities(params) {
  const { requirements, projectId } = params;
  
  // 加载能力标签索引
  const capabilityIndex = loadCapabilityIndex();
  
  const matches = [];
  
  for (const req of (requirements || [])) {
    const desc = (req.description || '').toLowerCase();
    const name = (req.name || '').toLowerCase();
    const combined = `${name} ${desc}`;
    
    // 能力分类定义
    const categories = {
      native: {
        label: '🟢 原生能力',
        description: 'Ariba标准功能，开箱即用',
        color: '#22c55e',
        keywords: ['采购申请', '供应商管理', '合同管理', '订单管理', '收货', '发票', '审批', '工作流', '目录', '寻源', 'sourcing', 'procurement', 'supplier', 'contract', 'order']
      },
      sapIntegration: {
        label: '🔴 SAP生态',
        description: '需要SAP产品配合',
        color: '#ef4444',
        keywords: ['sap', 's/4hana', 's4', 'ecc', 'cig', 'pi', 'po', 'erp集成']
      },
      thirdPartyIntegration: {
        label: '🔵 第三方集成',
        description: '需要第三方系统对接',
        color: '#3b82f6',
        keywords: ['第三方', 'external', '集成', '对接', 'api', 'webhook', 'nango', 'cdata']
      },
      customDev: {
        label: '🟣 定制开发',
        description: '需要定制开发',
        color: '#a855f7',
        keywords: ['定制', '自定义', '开发', 'custom', 'extension', 'addon', 'bapi', 'ui扩展']
      }
    };
    
    let matchedCategory = null;
    let matchedKeywords = [];
    let confidence = 0;
    
    for (const [key, cat] of Object.entries(categories)) {
      for (const kw of cat.keywords) {
        if (combined.includes(kw)) {
          matchedCategory = key;
          matchedKeywords.push(kw);
          confidence = Math.min(1, confidence + 0.2);
        }
      }
    }
    
    const category = matchedCategory ? categories[matchedCategory] : categories.native;
    
    // 查找相关文档
    const docs = findRelatedDocs(capabilityIndex, matchedKeywords);
    
    // 匹配范围
    const scope = determineScope(combined);
    
    matches.push({
      requirement: req,
      capability: {
        category: category.label,
        description: category.description,
        color: category.color,
        keywords: matchedKeywords,
        confidence: Math.round(confidence * 100) / 100
      },
      scope,
      documents: docs,
      recommendation: generateCapabilityRecommendation(category.label, req, docs)
    });
  }
  
  // 统计
  const stats = {
    total: matches.length,
    native: matches.filter(m => m.capability.category === '🟢 原生能力').length,
    sapIntegration: matches.filter(m => m.capability.category === '🔴 SAP生态').length,
    thirdPartyIntegration: matches.filter(m => m.capability.category === '🔵 第三方集成').length,
    customDev: matches.filter(m => m.capability.category === '🟣 定制开发').length
  };
  
  return {
    success: true,
    matches,
    statistics: stats,
    summary: generateCapabilitySummary(stats)
  };
}

/**
 * 加载能力标签索引
 */
function loadCapabilityIndex() {
  const indexPath = path.join(process.env.WIKI_PATH || '~/my-wiki/wiki/SAP-Ariba', '知识库能力标签索引.md');
  try {
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      return parseCapabilityIndex(content);
    }
  } catch (error) {
    console.error('加载能力标签索引失败:', error.message);
  }
  return getDefaultCapabilityIndex();
}

function parseCapabilityIndex(content) {
  // 简单解析，返回默认结构
  return getDefaultCapabilityIndex();
}

function getDefaultCapabilityIndex() {
  return {
    native: ['采购申请', '供应商管理', '合同管理', '订单管理', '寻源', '目录', '发票', '分析报表'],
    sapIntegration: ['S/4HANA集成', 'CIG', 'PI/PO', 'SAP ERP'],
    thirdParty: ['Nango', 'CData', '第三方API'],
    customDev: ['UI扩展', 'AddOn开发', '自定义报表', 'API定制']
  };
}

function findRelatedDocs(index, keywords) {
  const docs = [];
  const docList = [
    { name: '采购执行', path: '03-核心模块/Buying采购执行.md', type: 'native' },
    { name: 'API集成指南', path: '05-API与集成/API集成指南.md', type: 'integration' },
    { name: '2602版本新特性', path: '02-Next-Gen版本/2602版本新特性.md', type: 'native' },
    { name: 'S/4HANA集成', path: '08-API技术/SAP-Ariba-API集成指南.md', type: 'sap' }
  ];
  
  for (const kw of keywords) {
    for (const doc of docList) {
      if (doc.name.toLowerCase().includes(kw) && !docs.find(d => d.path === doc.path)) {
        docs.push({
          ...doc,
          url: `knowledge/${doc.path}`
        });
      }
    }
  }
  
  return docs.slice(0, 3);
}

function determineScope(text) {
  const scopes = {
    module: [],
    version: '通用',
    integration: '无',
    industry: '通用'
  };
  
  const moduleKeywords = ['采购申请', '寻源', '合同', '供应商', '发票', '目录'];
  for (const kw of moduleKeywords) {
    if (text.includes(kw)) {
      scopes.module.push(kw.replace('管理', ''));
    }
  }
  
  if (text.includes('next-gen') || text.includes('2602')) {
    scopes.version = 'Next-Gen';
  }
  
  const integrationKeywords = ['s/4hana', 'sap', 'erp'];
  if (integrationKeywords.some(kw => text.includes(kw))) {
    scopes.integration = 'CIG';
  }
  
  return scopes;
}

function generateCapabilityRecommendation(category, req, docs) {
  const name = req.name || req.description?.substring(0, 50) || '需求';
  
  switch (category) {
    case '🟢 原生能力':
      return `建议使用Ariba标准功能实现"${name}"，配置即可使用，无需额外开发。`;
    case '🔴 SAP生态':
      return `"${name}"需要SAP产品配合，建议评估CIG或PI/PO集成方案。`;
    case '🔵 第三方集成':
      return `"${name}"需要与第三方系统集成，建议使用Nango或API对接方案。`;
    case '🟣 定制开发':
      return `"${name}"需要定制开发，建议评估BTP平台AddOn方案。`;
    default:
      return `建议进一步分析"${name}"的具体需求。`;
  }
}

function generateCapabilitySummary(stats) {
  if (stats.native === stats.total) {
    return '🎉 所有需求均可通过Ariba原生功能实现，实施复杂度较低。';
  } else if (stats.customDev + stats.thirdPartyIntegration > stats.total / 2) {
    return '⚠️ 部分需求需要额外开发或集成，建议预留更多实施时间和预算。';
  } else {
    return '📋 建议采用分阶段实施策略，优先实现原生功能，后续逐步扩展。';
  }
}

// ============================================================================
// RA-F04: 用户故事生成
// ============================================================================

/**
 * 生成用户故事
 */
async function generateUserStories(params) {
  const { requirements, industry, context } = params;
  
  const stories = [];
  
  for (const req of (requirements || [])) {
    // 确定角色
    const role = determineUserRole(req);
    
    // 生成用户故事
    const story = {
      id: `US-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      asA: role,
      iWant: req.name || req.description,
      soThat: generateBusinessValue(req),
      acceptanceCriteria: generateAcceptanceCriteria(req),
      priority: req.priority || 'P1',
      effort: req.effort || estimateEffort(req),
      kano: req.kano || classifyKano(req),
      requirements: [req.id].filter(Boolean)
    };
    
    stories.push(story);
  }
  
  // 生成Markdown格式
  const markdown = generateUserStoriesMarkdown(stories, industry);
  
  return {
    success: true,
    stories,
    markdown,
    totalCount: stories.length,
    byPriority: {
      p0: stories.filter(s => s.priority === 'P0').length,
      p1: stories.filter(s => s.priority === 'P1').length,
      p2: stories.filter(s => s.priority === 'P2').length,
      p3: stories.filter(s => s.priority === 'P3').length
    }
  };
}

function determineUserRole(req) {
  const desc = (req.description || '').toLowerCase();
  const name = (req.name || '').toLowerCase();
  const combined = `${name} ${desc}`;
  
  const roleMap = [
    { keywords: ['采购员', '采购', '申请', 'requester', 'buyer'], role: '采购申请人员' },
    { keywords: ['供应商', 'vendor', 'supplier'], role: '供应商' },
    { keywords: ['审批', 'approval', 'approve'], role: '审批人员' },
    { keywords: ['财务', '发票', '付款', 'finance', 'payment'], role: '财务人员' },
    { keywords: ['管理员', 'admin', '配置', 'system'], role: '系统管理员' },
    { keywords: ['经理', 'manager', '总监', '报表'], role: '业务经理' },
    { keywords: ['仓库', '收货', '验收', 'warehouse', 'receiving'], role: '仓库人员' }
  ];
  
  for (const item of roleMap) {
    if (item.keywords.some(kw => combined.includes(kw))) {
      return item.role;
    }
  }
  
  return '业务用户';
}

function generateBusinessValue(req) {
  const desc = (req.description || '').toLowerCase();
  
  const valueMap = [
    { keywords: ['效率', '效率'], value: '提高工作效率，减少人工操作' },
    { keywords: ['成本', 'cost'], value: '降低采购成本，优化支出' },
    { keywords: ['合规', '合规', 'compliance'], value: '确保采购合规性，降低风险' },
    { keywords: ['透明', '可视化', 'visibility'], value: '提高采购流程透明度' },
    { keywords: ['协同', 'collaboration'], value: '加强内外部协同' },
    { keywords: ['数据', '报表', 'report'], value: '提供数据支撑，辅助决策' }
  ];
  
  for (const item of valueMap) {
    if (item.keywords.some(kw => desc.includes(kw))) {
      return item.value;
    }
  }
  
  return '满足业务需求，提升工作效率';
}

function generateAcceptanceCriteria(req) {
  const desc = req.description || '';
  const criteria = [];
  
  // 基于描述生成基本验收标准
  criteria.push({
    given: '用户在系统中',
    when: `执行${req.name || '相关操作'}`,
    then: '系统正确响应并记录'
  });
  
  if (desc.includes('审批')) {
    criteria.push({
      given: '提交审批时',
      when: '满足审批条件',
      then: '系统按配置流程发送审批通知'
    });
  }
  
  if (desc.includes('通知') || desc.includes('邮件')) {
    criteria.push({
      given: '触发通知条件时',
      when: '事件发生',
      then: '系统发送相应通知'
    });
  }
  
  if (desc.includes('报表') || desc.includes('数据')) {
    criteria.push({
      given: '有业务数据时',
      when: '用户查看报表',
      then: '报表准确显示相关数据'
    });
  }
  
  return criteria;
}

function estimateEffort(req) {
  const desc = (req.description || '').toLowerCase();
  
  if (desc.includes('复杂') || desc.includes('定制')) return '高';
  if (desc.includes('简单') || desc.includes('配置')) return '低';
  return '中';
}

function generateUserStoriesMarkdown(stories, industry) {
  let md = `# 用户故事文档\n\n`;
  md += `> 行业: ${industry || '通用'}\n`;
  md += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  md += `## 用户故事格式\n\n`;
  md += `\`\`\`\n`;
  md += `作为 [角色]\n`;
  md += `我希望 [功能描述]\n`;
  md += `以便 [业务价值]\n\n`;
  md += `验收标准:\n`;
  md += `- Given [前置条件]\n`;
  md += `- When [触发动作]\n`;
  md += `- Then [预期结果]\n`;
  md += `\`\`\`\n\n`;
  
  // 按优先级分组
  const grouped = {
    P0: stories.filter(s => s.priority === 'P0'),
    P1: stories.filter(s => s.priority === 'P1'),
    P2: stories.filter(s => s.priority === 'P2'),
    P3: stories.filter(s => s.priority === 'P3')
  };
  
  for (const [priority, items] of Object.entries(grouped)) {
    if (items.length === 0) continue;
    
    md += `## ${priority} 优先级用户故事\n\n`;
    
    for (const story of items) {
      md += `### ${story.id}: ${story.iWant?.substring(0, 50) || ''}\n\n`;
      md += `**作为** ${story.asA}\n\n`;
      md += `**我希望** ${story.iWant}\n\n`;
      md += `**以便** ${story.soThat}\n\n`;
      md += `**验收标准:**\n\n`;
      for (const ac of (story.acceptanceCriteria || [])) {
        md += `- Given ${ac.given}\n`;
        md += `  When ${ac.when}\n`;
        md += `  Then ${ac.then}\n`;
      }
      md += `\n`;
      md += `| 属性 | 值 |\n`;
      md += `|------|-----|\n`;
      md += `| KANO分类 | ${story.kano} |\n`;
      md += `| 工作量 | ${story.effort} |\n`;
      md += `\n`;
    }
  }
  
  return md;
}

// ============================================================================
// RA-F06: 周边能力识别
// ============================================================================

/**
 * 识别周边能力
 */
async function identifyPeripheralCapabilities(params) {
  const { requirements } = params;
  
  // 先进行能力匹配
  const matchResult = await matchCapabilities({ requirements });
  
  // 筛选周边能力
  const peripheralCapabilities = matchResult.matches.filter(
    m => m.capability.category !== '🟢 原生能力'
  );
  
  // 按类型分组
  const grouped = {
    sapIntegration: peripheralCapabilities.filter(m => m.capability.category === '🔴 SAP生态'),
    thirdPartyIntegration: peripheralCapabilities.filter(m => m.capability.category === '🔵 第三方集成'),
    customDev: peripheralCapabilities.filter(m => m.capability.category === '🟣 定制开发')
  };
  
  // 成本估算
  const costEstimate = estimateCosts(grouped);
  
  return {
    success: true,
    peripheralCapabilities,
    grouped,
    statistics: {
      total: peripheralCapabilities.length,
      sapIntegration: grouped.sapIntegration.length,
      thirdPartyIntegration: grouped.thirdPartyIntegration.length,
      customDev: grouped.customDev.length
    },
    costEstimate,
    recommendations: generatePeripheralRecommendations(grouped)
  };
}

function estimateCosts(grouped) {
  const estimates = {
    sapIntegration: {
      description: 'SAP生态系统集成',
      items: [],
      subtotal: { min: 0, max: 0, unit: '人天' }
    },
    thirdPartyIntegration: {
      description: '第三方工具和集成',
      items: [],
      subtotal: { min: 0, max: 0, unit: '人天+订阅费' }
    },
    customDev: {
      description: '定制开发工作',
      items: [],
      subtotal: { min: 0, max: 0, unit: '人天' }
    }
  };
  
  // 参考成本数据
  const costReference = {
    sapIntegration: { min: 30, max: 60, name: 'S/4HANA CIG集成' },
    thirdPartyIntegration: { min: 15, max: 40, name: '第三方系统集成' },
    customDev: { min: 10, max: 30, name: '定制开发' }
  };
  
  for (const [type, items] of Object.entries(grouped)) {
    const ref = costReference[type] || { min: 10, max: 30, name: '其他' };
    estimates[type].items = items.map(item => ({
      name: item.requirement.name || item.requirement.description?.substring(0, 30),
      estimate: { min: ref.min, max: ref.max, unit: '人天' }
    }));
    estimates[type].subtotal = {
      min: items.length * ref.min,
      max: items.length * ref.max,
      unit: '人天'
    };
  }
  
  return estimates;
}

function generatePeripheralRecommendations(grouped) {
  const recommendations = [];
  
  if (grouped.sapIntegration.length > 0) {
    recommendations.push({
      type: 'sapIntegration',
      priority: '高',
      recommendation: 'SAP生态集成需要双方系统协调，建议尽早规划并安排SAP顾问支持。',
      risks: ['集成复杂度高', '需要SAP Basis权限', '可能影响ERP系统']
    });
  }
  
  if (grouped.thirdPartyIntegration.length > 0) {
    recommendations.push({
      type: 'thirdPartyIntegration',
      priority: '中',
      recommendation: '第三方集成建议使用统一集成平台（如Nango），可以降低集成复杂度。',
      risks: ['第三方服务可用性', '数据安全', '供应商依赖']
    });
  }
  
  if (grouped.customDev.length > 0) {
    recommendations.push({
      type: 'customDev',
      priority: '高',
      recommendation: '定制开发建议评估BTP平台AddOn方案，优先使用Ariba标准API和扩展点。',
      risks: ['开发周期长', '维护成本高', '升级兼容性']
    });
  }
  
  return recommendations;
}

// ============================================================================
// 辅助函数
// ============================================================================

function findNextQuestion(questions, currentQ, skipFollowUp) {
  if (!currentQ) {
    // 返回第一个问题
    const firstStage = questions.stages[0];
    return firstStage?.questions[0] || null;
  }
  
  // 检查是否有后续问题
  if (currentQ.followUps && !skipFollowUp) {
    const followUp = questions.stages
      .flatMap(s => s.questions)
      .find(q => currentQ.followUps.includes(q.id));
    if (followUp) return followUp;
  }
  
  // 获取所有问题
  const allQuestions = questions.stages.flatMap(s => s.questions);
  const currentIndex = allQuestions.findIndex(q => q.id === currentQ.id);
  
  if (currentIndex < allQuestions.length - 1) {
    return allQuestions[currentIndex + 1];
  }
  
  // 查找下一个阶段的问题
  const currentStageIndex = questions.stages.findIndex(s => 
    s.questions.some(q => q.id === currentQ.id)
  );
  
  if (currentStageIndex < questions.stages.length - 1) {
    return questions.stages[currentStageIndex + 1].questions[0];
  }
  
  return null;
}

function getCurrentQuestion(session) {
  const allQuestions = session.questions.stages.flatMap(s => s.questions);
  return allQuestions[session.answers.length];
}

function getStageName(questions, stageId) {
  const stage = questions.stages.find(s => s.id === stageId);
  return stage?.name || '未知阶段';
}

function countTotalQuestions(questions) {
  return questions.stages.reduce((sum, stage) => sum + stage.questions.length, 0);
}

function extractContext(session, question, answer) {
  const context = { ...session.context };
  
  if (!question) return context;
  
  // 根据问题类型提取关键信息
  switch (question.category) {
    case 'what':
      context.requirements = context.requirements || [];
      context.requirements.push({ question: question.text, answer });
      break;
    case 'who':
      context.users = context.users || [];
      context.users.push({ question: question.text, answer });
      break;
    case 'when':
      context.timeline = answer;
      break;
    case 'where':
      context.scope = answer;
      break;
    case 'how_much':
      context.budget = answer;
      break;
    case 'motivation':
      context.motivations = context.motivations || [];
      context.motivations.push(answer);
      break;
    case 'pain_points':
      context.painPoints = context.painPoints || [];
      context.painPoints.push(answer);
      break;
  }
  
  return context;
}

function generateInterviewSummary(session) {
  return {
    industry: session.industry,
    modules: session.modules,
    context: session.context,
    answerCount: session.answers.length,
    duration: `${Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)}分钟`,
    frameworks: {
      scqa: {
        situation: session.answers.filter(a => a.questionId.startsWith('BG')).map(a => a.answer),
        complication: session.context.painPoints || [],
        question: session.context.requirements || [],
        answer: []
      }
    }
  };
}

async function generateNextSteps(session) {
  const steps = [];
  
  // 基于访谈内容推荐下一步
  if (session.context.requirements && session.context.requirements.length > 0) {
    steps.push({
      type: 'capability_match',
      description: '基于访谈内容进行Ariba能力匹配',
      action: 'POST /api/requirement/match'
    });
  }
  
  if (session.answers.length >= 5) {
    steps.push({
      type: 'user_stories',
      description: '生成用户故事',
      action: 'POST /api/requirement/user-stories'
    });
  }
  
  steps.push({
    type: 'priority_evaluation',
    description: '评估需求优先级',
    action: 'POST /api/requirement/priority'
  });
  
  steps.push({
    type: 'peripheral_identification',
    description: '识别周边能力需求',
    action: 'POST /api/requirement/peripheral'
  });
  
  return steps;
}

// ============================================================================
// 文档生成（保留）
// ============================================================================

async function generateRequirementDocument(params) {
  const { industry, modules, requirements, conflicts, supplements } = params;
  const docId = `REQ-DOC-${Date.now()}`;
  
  const grouped = {
    P0: requirements.filter(r => r.priority === 'P0'),
    P1: requirements.filter(r => r.priority === 'P1'),
    P2: requirements.filter(r => r.priority === 'P2'),
    P3: requirements.filter(r => r.priority === 'P3')
  };
  
  let md = `# 需求文档\n\n`;
  md += `> 文档ID: ${docId}\n`;
  md += `> 行业: ${industry}\n`;
  md += `> 模块: ${modules}\n\n`;
  
  md += `## 需求总览\n\n`;
  md += `| 优先级 | 数量 |\n|--------|------|\n`;
  md += `| P0 | ${grouped.P0?.length || 0} |\n`;
  md += `| P1 | ${grouped.P1?.length || 0} |\n`;
  md += `| P2 | ${grouped.P2?.length || 0} |\n`;
  md += `| P3 | ${grouped.P3?.length || 0} |\n\n`;
  
  ['P0', 'P1', 'P2', 'P3'].forEach(priority => {
    const reqs = grouped[priority];
    if (reqs && reqs.length > 0) {
      md += `## ${priority}优先级需求\n\n`;
      reqs.forEach(req => {
        md += `### ${req.id}: ${req.name || req.description?.substring(0, 50)}\n\n`;
        md += `- **描述**: ${req.description}\n`;
        md += `- **业务价值**: ${req.businessValue || 'N/A'}/10\n`;
        md += `- **复杂度**: ${req.complexity || 'N/A'}/10\n`;
        if (req.rice) {
          md += `- **RICE评分**: ${req.rice.score}\n`;
        }
        if (req.kano) {
          md += `- **KANO分类**: ${req.kano}\n`;
        }
        md += `\n`;
      });
    }
  });
  
  return {
    success: true,
    document: { id: docId, timestamp: new Date().toISOString(), requirements: grouped, conflicts: conflicts || [], supplements: supplements || [] },
    markdown: md
  };
}

// ============================================================================
// 导出
// ============================================================================

module.exports = {
  // 基础功能
  analyzeRequirement,
  supplementRequirements,
  detectConflicts,
  evaluatePriority,
  generateRequirementDocument,
  
  // RA-F01: 引导式访谈
  startInterview,
  nextInterviewQuestion,
  getInterviewStatus,
  loadInterviewQuestions,
  
  // RA-F02: 能力匹配
  matchCapabilities,
  
  // RA-F04: 用户故事生成
  generateUserStories,
  
  // RA-F06: 周边能力识别
  identifyPeripheralCapabilities
};
