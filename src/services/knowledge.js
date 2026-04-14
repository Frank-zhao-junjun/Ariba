/**
 * 知识库服务
 * 管理需求模板和蓝图模板
 */

const fs = require('fs');
const path = require('path');

// 知识库目录
const KNOWLEDGE_DIR = path.join(__dirname, '../../knowledge');

// 确保知识库目录存在
if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

function getRequirementTemplate(industry, module) {
  const templates = loadRequirementTemplates();
  let template = templates.find(t => t.industry === industry);
  if (!template) template = templates.find(t => t.industry === '通用');
  return template || getDefaultRequirementTemplate();
}

function getBlueprintTemplate(industry, processType) {
  const templates = loadBlueprintTemplates();
  let template = templates.find(t => t.industry === industry);
  if (!template) template = templates.find(t => t.industry === '通用');
  return template || getDefaultBlueprintTemplate();
}

function loadRequirementTemplates() {
  const filePath = path.join(KNOWLEDGE_DIR, 'requirements.json');
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载需求模板失败:', error.message);
  }
  return [getDefaultRequirementTemplate()];
}

function loadBlueprintTemplates() {
  const filePath = path.join(KNOWLEDGE_DIR, 'blueprints.json');
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载蓝图模板失败:', error.message);
  }
  return [getDefaultBlueprintTemplate()];
}

function getRequirementTemplateList() {
  return loadRequirementTemplates().map(t => ({
    industry: t.industry,
    module: t.module,
    description: t.description,
    requirementCount: t.standardRequirements?.length || 0
  }));
}

function getBlueprintTemplateList() {
  return loadBlueprintTemplates().map(t => ({
    industry: t.industry,
    processType: t.processType,
    description: t.description,
    phaseCount: t.phases?.length || 0
  }));
}

function initializeDefaultTemplates() {
  const reqFile = path.join(KNOWLEDGE_DIR, 'requirements.json');
  if (!fs.existsSync(reqFile)) {
    fs.writeFileSync(reqFile, JSON.stringify([getDefaultRequirementTemplate()], null, 2), 'utf8');
  }
  const bpFile = path.join(KNOWLEDGE_DIR, 'blueprints.json');
  if (!fs.existsSync(bpFile)) {
    fs.writeFileSync(bpFile, JSON.stringify([getDefaultBlueprintTemplate()], null, 2), 'utf8');
  }
}

function getDefaultRequirementTemplate() {
  return {
    industry: '通用',
    module: '采购管理',
    description: '通用采购管理需求模板',
    standardRequirements: [
      { id: 'REQ-GEN-001', name: '采购申请管理', description: '支持采购申请的创建、编辑、提交、审批流程', priority: 'P0', businessValue: 9, complexity: 6 },
      { id: 'REQ-GEN-002', name: '供应商管理', description: '支持供应商的创建、审批、信息变更', priority: 'P0', businessValue: 8, complexity: 5 },
      { id: 'REQ-GEN-003', name: '合同管理', description: '支持框架协议和采购合同的创建、审批、执行跟踪', priority: 'P1', businessValue: 7, complexity: 6 },
      { id: 'REQ-GEN-004', name: '采购订单管理', description: '支持采购订单的创建、审批、发送、执行跟踪', priority: 'P0', businessValue: 9, complexity: 5 },
      { id: 'REQ-GEN-005', name: '收货管理', description: '支持采购收货、退货操作', priority: 'P1', businessValue: 7, complexity: 4 },
      { id: 'REQ-GEN-006', name: '发票管理', description: '支持发票的匹配、审批、付款流程', priority: 'P1', businessValue: 7, complexity: 6 }
    ]
  };
}

function getDefaultBlueprintTemplate() {
  return {
    industry: '通用',
    processType: '采购流程',
    description: '通用采购流程蓝图',
    phases: [
      { name: '需求识别', activities: ['需求提交', '需求审批'], userStories: [] },
      { name: '寻源管理', activities: ['供应商选择', '询价比价', '合同签订'], userStories: [] },
      { name: '订单执行', activities: ['订单创建', '订单审批', '订单发送'], userStories: [] },
      { name: '收货验收', activities: ['收货确认', '质量验收', '问题处理'], userStories: [] },
      { name: '发票付款', activities: ['发票匹配', '付款申请', '付款审批'], userStories: [] }
    ]
  };
}

module.exports = {
  getRequirementTemplate, getBlueprintTemplate, loadRequirementTemplates, loadBlueprintTemplates,
  getRequirementTemplateList, getBlueprintTemplateList, initializeDefaultTemplates,
  getDefaultRequirementTemplate, getDefaultBlueprintTemplate, KNOWLEDGE_DIR
};
