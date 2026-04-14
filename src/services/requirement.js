/**
 * 需求分析服务
 */

const llm = require('./llm');
const knowledge = require('./knowledge');

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

async function evaluatePriority(requirements) {
  const evaluated = (requirements || []).map(req => {
    const businessValue = req.businessValue || 5;
    const complexity = req.complexity || 5;
    const score = (businessValue * 0.5) + ((10 - complexity) * 0.5);
    
    let priority = 'P3';
    if (score >= 8) priority = 'P0';
    else if (score >= 6) priority = 'P1';
    else if (score >= 4) priority = 'P2';
    
    return { ...req, priority, score: Math.round(score * 100) / 100 };
  });
  
  evaluated.sort((a, b) => b.score - a.score);
  
  return {
    success: true,
    requirements: evaluated,
    summary: {
      total: evaluated.length,
      p0Count: evaluated.filter(r => r.priority === 'P0').length,
      p1Count: evaluated.filter(r => r.priority === 'P1').length,
      p2Count: evaluated.filter(r => r.priority === 'P2').length,
      p3Count: evaluated.filter(r => r.priority === 'P3').length
    }
  };
}

async function generateRequirementDocument(params) {
  const { industry, modules, requirements, conflicts, supplements } = params;
  const docId = `REQ-DOC-${Date.now()}`;
  
  const grouped = {
    P0: requirements.filter(r => r.priority === 'P0'),
    P1: requirements.filter(r => r.priority === 'P1'),
    P2: requirements.filter(r => r.priority === 'P2'),
    P3: requirements.filter(r => r.priority === 'P3')
  };
  
  let md = `# 需求文档\n\n> 文档ID: ${docId}\n> 行业: ${industry}\n> 模块: ${modules}\n\n## 需求总览\n\n| 优先级 | 数量 |\n|--------|------|\n`;
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
        md += `- **复杂度**: ${req.complexity || 'N/A'}/10\n\n`;
      });
    }
  });
  
  return {
    success: true,
    document: { id: docId, timestamp: new Date().toISOString(), requirements: grouped, conflicts: conflicts || [], supplements: supplements || [] },
    markdown: md
  };
}

module.exports = { analyzeRequirement, supplementRequirements, detectConflicts, evaluatePriority, generateRequirementDocument };
