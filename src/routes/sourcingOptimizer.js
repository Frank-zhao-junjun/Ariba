/**
 * AI寻源场景优化器 - API路由
 * 基于多维度评分的智能供应商推荐
 */

const express = require('express');
const router = express.Router();
const SourcingOptimizerService = require('../services/sourcingOptimizer');

// 创建寻源场景
router.post('/scenarios', async (req, res) => {
  try {
    const { name, purchaseReqId, items, supplierIds, weightConfig } = req.body;
    
    if (!name || !items || !supplierIds) {
      return res.status(400).json({ 
        error: '缺少必填字段: name, items, supplierIds' 
      });
    }

    const scenario = await SourcingOptimizerService.createScenario({
      name,
      purchaseReqId,
      items,
      supplierIds,
      weightConfig: weightConfig || {
        price: 30,
        quality: 30,
        delivery: 20,
        risk: 20
      }
    });

    res.json({ 
      success: true, 
      scenarioId: scenario.id,
      status: 'created',
      message: '寻源场景创建成功'
    });
  } catch (error) {
    console.error('创建寻源场景失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取场景详情和评分
router.get('/scenarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scenario = await SourcingOptimizerService.getScenario(id);
    
    if (!scenario) {
      return res.status(404).json({ error: '场景不存在' });
    }

    res.json({ success: true, scenario });
  } catch (error) {
    console.error('获取场景详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取场景评分结果
router.get('/scenarios/:id/scores', async (req, res) => {
  try {
    const { id } = req.params;
    const scores = await SourcingOptimizerService.calculateScores(id);
    
    res.json({ 
      success: true, 
      scores,
      recommended: scores.find(s => s.recommendation === 'adopt'),
      count: scores.length
    });
  } catch (error) {
    console.error('计算评分失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 敏感性分析
router.post('/scenarios/:id/sensitivity', async (req, res) => {
  try {
    const { id } = req.params;
    const { priceFluctuation = [-20, 20] } = req.body;
    
    const sensitivity = await SourcingOptimizerService.sensitivityAnalysis(
      id, 
      priceFluctuation
    );
    
    res.json({ success: true, sensitivity });
  } catch (error) {
    console.error('敏感性分析失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取TCO对比
router.get('/scenarios/:id/tco', async (req, res) => {
  try {
    const { id } = req.params;
    const tcoReport = await SourcingOptimizerService.calculateTCO(id);
    
    res.json({ success: true, tco: tcoReport });
  } catch (error) {
    console.error('TCO计算失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 列表所有场景
router.get('/scenarios', async (req, res) => {
  try {
    const scenarios = await SourcingOptimizerService.listScenarios();
    res.json({ success: true, scenarios, count: scenarios.length });
  } catch (error) {
    console.error('获取场景列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 采纳推荐
router.post('/scenarios/:id/adopt', async (req, res) => {
  try {
    const { id } = req.params;
    const { recommendedScenarioId } = req.body;
    
    const result = await SourcingOptimizerService.adoptRecommendation(
      id, 
      recommendedScenarioId
    );
    
    res.json({ 
      success: true, 
      message: '推荐方案已采纳',
      adoption: result
    });
  } catch (error) {
    console.error('采纳推荐失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
