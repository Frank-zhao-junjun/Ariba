/**
 * 采购申请智能辅助 API 路由
 */

const express = require('express');
const router = express.Router();
const guidedBuyingService = require('../modules/guided-buying/service');

/**
 * POST /api/guided-buying/assist
 * 处理采购申请辅助请求
 */
router.post('/assist', async (req, res) => {
  try {
    const { intent, query, context } = req.body;
    
    if (!intent) {
      return res.status(400).json({
        success: false,
        error: '缺少intent参数'
      });
    }
    
    const result = await guidedBuyingService.processAssistance({
      intent,
      query,
      context
    });
    
    res.json(result);
  } catch (error) {
    console.error('Guided Buying API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/guided-buying/validate
 * 验证采购申请
 */
router.post('/validate', async (req, res) => {
  try {
    const result = await guidedBuyingService.processAssistance({
      intent: 'validate_request',
      context: req.body
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/guided-buying/recommend-vendor
 * 推荐供应商
 */
router.post('/recommend-vendor', async (req, res) => {
  try {
    const result = await guidedBuyingService.processAssistance({
      intent: 'recommend_vendor',
      context: req.body
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/guided-buying/guide-channel
 * 引导采购渠道
 */
router.post('/guide-channel', async (req, res) => {
  try {
    const result = await guidedBuyingService.processAssistance({
      intent: 'guide_channel',
      context: req.body
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
