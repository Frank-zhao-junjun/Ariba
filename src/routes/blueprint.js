/**
 * 蓝图设计API路由
 */

const express = require('express');
const router = express.Router();
const blueprintService = require('../services/blueprint');
const knowledgeService = require('../services/knowledge');

router.get('/templates', async (req, res) => {
  try {
    const { industry } = req.query;
    const result = await blueprintService.getBlueprintTemplates(industry);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { requirements, industry, processType } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await blueprintService.generateUserStories({
      requirements,
      industry: industry || '通用',
      processType: processType || '采购流程'
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { userStories } = req.body;
    if (!userStories || !Array.isArray(userStories)) {
      return res.status(400).json({ success: false, error: '缺少User Stories列表' });
    }
    const validatedStories = blueprintService.validateInvestPrinciples(userStories);
    res.json({
      success: true,
      userStories: validatedStories,
      summary: {
        total: validatedStories.length,
        validCount: validatedStories.filter(s => s.investScore >= 80).length,
        needsImprovementCount: validatedStories.filter(s => s.investScore < 80).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/criteria', async (req, res) => {
  try {
    const { userStory, requirements, context } = req.body;
    if (!userStory) {
      return res.status(400).json({ success: false, error: '缺少User Story' });
    }
    const result = await blueprintService.generateAcceptanceCriteria({
      userStory,
      requirements: requirements || [],
      context: context || ''
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/flowchart', async (req, res) => {
  try {
    const { processType, industry, steps } = req.body;
    const result = await blueprintService.generateFlowchart({
      processType: processType || '采购审批流程',
      industry: industry || '通用',
      steps: steps || []
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/document', async (req, res) => {
  try {
    const { requirements, industry, processType, modules } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await blueprintService.generateBlueprintDocument({
      requirements,
      industry: industry || '通用',
      processType: processType || '采购流程',
      modules: modules || []
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
