/**
 * 智能合同摘要生成器 API路由 v1.6
 */

const express = require('express');
const router = express.Router();
const {
  generateContractSummary,
  generateBriefSummary,
  extractKeyClauses,
  detectContractRisks,
  getDemoSummary
} = require('../services/contractSummary');

/**
 * POST /api/contract-summary/generate
 * 生成完整合同摘要
 */
router.post('/generate', async (req, res) => {
  try {
    const { text, options } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: '合同文本长度不足，请提供至少50字的合同内容'
      });
    }

    if (text.length > 50000) {
      return res.status(400).json({
        success: false,
        error: '合同文本过长，请控制在50000字以内'
      });
    }

    const result = await generateContractSummary(text, options);
    res.json(result);
  } catch (error) {
    console.error('生成合同摘要失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contract-summary/brief
 * 生成简短摘要（用于聊天场景）
 */
router.post('/brief', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: '合同文本长度不足'
      });
    }

    const result = await generateBriefSummary(text);
    res.json(result);
  } catch (error) {
    console.error('生成简短摘要失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contract-summary/clauses
 * 提取关键条款
 */
router.post('/clauses', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: '合同文本长度不足'
      });
    }

    const result = await extractKeyClauses(text);
    res.json(result);
  } catch (error) {
    console.error('提取条款失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/contract-summary/risks
 * 检测合同风险
 */
router.post('/risks', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: '合同文本长度不足'
      });
    }

    const result = await detectContractRisks(text);
    res.json(result);
  } catch (error) {
    console.error('检测风险失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/contract-summary/demo
 * 获取演示数据
 */
router.get('/demo', (req, res) => {
  const demo = getDemoSummary();
  res.json(demo);
});

/**
 * GET /api/contract-summary/health
 * 健康检查
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'contract-summary',
    version: '1.6.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
