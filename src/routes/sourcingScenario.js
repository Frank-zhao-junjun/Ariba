/**
 * 寻源场景推荐路由 v1.8.0
 */

const express = require('express');
const router = express.Router();
const sourcingScenarioService = require('../services/sourcingScenario');
const logger = require('../utils/logger');

/**
 * POST /api/sourcing-scenario/generate
 * 生成寻源场景推荐
 */
router.post('/generate', async (req, res) => {
  try {
    const { category, amount, deliveryDate, urgency, requirements } = req.body;
    
    // 参数验证
    if (!category) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：category（采购品类）'
      });
    }
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：amount（采购金额），必须为正数'
      });
    }
    
    const result = sourcingScenarioService.recommendScenario({
      category,
      amount,
      deliveryDate,
      urgency: urgency || 'normal',
      requirements: requirements || []
    });
    
    logger.info('寻源场景生成成功', { category, amount });
    res.json(result);
  } catch (error) {
    logger.error('生成寻源场景失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '生成寻源场景失败',
      message: error.message
    });
  }
});

/**
 * GET /api/sourcing-scenario/templates
 * 获取场景类型列表
 */
router.get('/templates', (req, res) => {
  try {
    const templates = require('../data/scenarioTemplates.json');
    
    res.json({
      success: true,
      data: {
        scenarioTypes: templates.scenarioTypes.map(s => ({
          type: s.type,
          code: s.code,
          description: s.description,
          threshold: s.threshold,
          timeline: s.timeline
        })),
        categories: Object.keys(templates.categoryRules)
      }
    });
  } catch (error) {
    logger.error('获取模板失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '获取模板失败'
    });
  }
});

/**
 * GET /api/sourcing-scenario/weights/:category
 * 获取品类评分权重
 */
router.get('/weights/:category', (req, res) => {
  try {
    const { category } = req.params;
    const templates = require('../data/scenarioTemplates.json');
    
    const categoryRules = templates.categoryRules[category];
    
    if (!categoryRules) {
      return res.status(404).json({
        success: false,
        error: `未找到品类 ${category} 的评分规则`
      });
    }
    
    res.json({
      success: true,
      data: categoryRules
    });
  } catch (error) {
    logger.error('获取评分权重失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '获取评分权重失败'
    });
  }
});

/**
 * POST /api/sourcing-scenario/save-template
 * 保存自定义模板
 */
router.post('/save-template', (req, res) => {
  try {
    const { name, scenarioType, scoringRules, suppliers, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：name（模板名称）'
      });
    }
    
    const template = {
      name,
      scenarioType,
      scoringRules,
      suppliers,
      notes
    };
    
    const result = sourcingScenarioService.saveTemplate(template);
    logger.info('模板保存成功', { name });
    
    res.json(result);
  } catch (error) {
    logger.error('保存模板失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '保存模板失败'
    });
  }
});

/**
 * GET /api/sourcing-scenario/suggestions
 * 获取推荐问题
 */
router.get('/suggestions', (req, res) => {
  try {
    const result = sourcingScenarioService.getSuggestedQuestions();
    res.json(result);
  } catch (error) {
    logger.error('获取推荐问题失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '获取推荐问题失败'
    });
  }
});

/**
 * GET /api/sourcing-scenario/suppliers/:category
 * 获取品类供应商推荐
 */
router.get('/suppliers/:category', (req, res) => {
  try {
    const { category } = req.params;
    const amount = parseInt(req.query.amount) || 100000;
    
    const templates = require('../data/scenarioTemplates.json');
    const matchingSuppliers = templates.supplierPool.filter(s => s.category === category);
    
    if (matchingSuppliers.length === 0) {
      return res.json({
        success: true,
        data: {
          suppliers: templates.supplierPool.slice(0, 5),
          message: `未找到${category}品类供应商，返回默认供应商列表`
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        suppliers: matchingSuppliers.slice(0, 5)
      }
    });
  } catch (error) {
    logger.error('获取供应商失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: '获取供应商失败'
    });
  }
});

module.exports = router;
