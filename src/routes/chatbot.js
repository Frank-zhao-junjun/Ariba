const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbot');
const logger = require('../utils/logger');

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, userContext } = req.body;
    if (!message) return res.status(400).json({ success: false, error: '消息不能为空' });
    const chatSessionId = sessionId || 'session-' + Date.now();
    const result = await chatbotService.processMessage(chatSessionId, message, userContext || {});
    res.json({ success: true, sessionId: chatSessionId, ...result });
  } catch (error) {
    logger.error('聊天处理错误', { error: error.message });
    res.status(500).json({ success: false, error: '处理消息时发生错误' });
  }
});

router.get('/demo', (req, res) => {
  res.json({ success: true, demo: { greeting: '你好！我是采购小助手', examples: [] } });
});

router.get('/policy/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: '需要关键词' });
  const results = chatbotService.searchPolicy(q);
  res.json({ success: true, results });
});

router.get('/vendor/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: '需要关键词' });
  const results = chatbotService.searchVendor(q);
  res.json({ success: true, results });
});

router.get('/pr/status', (req, res) => {
  const { q } = req.query;
  const results = chatbotService.searchPurchaseRequest(q || '全部');
  res.json({ success: true, results });
});

router.get('/budget/:department', (req, res) => {
  const budget = chatbotService.queryBudget(req.params.department);
  res.json({ success: true, budget });
});

module.exports = router;
