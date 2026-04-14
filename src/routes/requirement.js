/**
 * 需求分析API路由
 */

const express = require('express');
const router = express.Router();
const requirementService = require('../services/requirement');
const knowledgeService = require('../services/knowledge');

router.post('/analyze', async (req, res) => {
  try {
    const { industry, modules, description, existingRequirements } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, error: '缺少需求描述' });
    }
    const result = await requirementService.analyzeRequirement({
      industry: industry || '通用',
      modules: modules || '采购管理',
      description,
      existingRequirements: existingRequirements || []
    });
    res.json(result);
  } catch (error) {
    console.error('需求分析API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = knowledgeService.getRequirementTemplateList();
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/supplement', async (req, res) => {
  try {
    const { industry, modules, currentRequirements } = req.body;
    const result = await requirementService.supplementRequirements({
      industry: industry || '通用',
      modules: modules || '采购管理',
      currentRequirements: currentRequirements || []
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/conflict-check', async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.detectConflicts(requirements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/priority', async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.evaluatePriority(requirements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/document', async (req, res) => {
  try {
    const { industry, modules, requirements, conflicts, supplements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.generateRequirementDocument({
      industry: industry || '通用',
      modules: modules || '采购管理',
      requirements,
      conflicts: conflicts || [],
      supplements: supplements || []
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
