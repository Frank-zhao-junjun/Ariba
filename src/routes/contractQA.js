/**
 * 合同智能问答API路由 v1.6.1
 */

const express = require('express');
const router = express.Router();
const contractQAService = require('../services/contractQA');

/**
 * POST /api/contract-qa/ask
 * 询问合同问题
 */
router.post('/ask', async (req, res) => {
  try {
    const { contractText, question, sessionId } = req.body;
    
    if (!contractText || contractText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供合同文本'
      });
    }
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请输入问题'
      });
    }
    
    const result = await contractQAService.answerContractQuestion(
      contractText,
      question,
      sessionId || 'default'
    );
    
    res.json(result);
  } catch (error) {
    console.error('合同问答失败:', error);
    res.status(500).json({
      success: false,
      error: '问答失败: ' + error.message
    });
  }
});

/**
 * POST /api/contract-qa/multi
 * 多合同对比问答
 */
router.post('/multi', async (req, res) => {
  try {
    const { contracts, question } = req.body;
    
    if (!contracts || !Array.isArray(contracts) || contracts.length < 2) {
      return res.status(400).json({
        success: false,
        error: '请提供至少2份合同进行对比'
      });
    }
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请输入问题'
      });
    }
    
    const result = await contractQAService.answerMultiContractQuestions(contracts, question);
    
    res.json(result);
  } catch (error) {
    console.error('多合同问答失败:', error);
    res.status(500).json({
      success: false,
      error: '问答失败: ' + error.message
    });
  }
});

/**
 * GET /api/contract-qa/history
 * 获取对话历史
 */
router.get('/history', (req, res) => {
  const { sessionId } = req.query;
  const history = contractQAService.getConversationHistory(sessionId || 'default');
  
  res.json({
    success: true,
    data: {
      history,
      count: history.length
    }
  });
});

/**
 * DELETE /api/contract-qa/history
 * 清除对话历史
 */
router.delete('/history', (req, res) => {
  const { sessionId } = req.query;
  const result = contractQAService.clearConversationHistory(sessionId || 'default');
  
  res.json(result);
});

/**
 * GET /api/contract-qa/suggestions
 * 获取推荐问题
 */
router.get('/suggestions', (req, res) => {
  const suggestions = contractQAService.getSuggestedQuestions();
  
  res.json({
    success: true,
    data: suggestions
  });
});

/**
 * POST /api/contract-qa/demo
 * 演示模式
 */
router.post('/demo', async (req, res) => {
  try {
    const result = await contractQAService.getDemoAnswer();
    res.json({
      ...result,
      message: '演示模式'
    });
  } catch (error) {
    console.error('演示失败:', error);
    res.status(500).json({
      success: false,
      error: '演示失败: ' + error.message
    });
  }
});

module.exports = router;
