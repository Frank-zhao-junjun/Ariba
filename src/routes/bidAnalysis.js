/**
 * 竞标分析路由
 * 集成 Bid Analysis Agent v1.2
 */

const express = require('express');
const router = express.Router();
const scoringCalculator = require('../utils/scoringCalculator');
const quoteAnalyzer = require('../services/quoteAnalyzer');

/**
 * POST /api/bid-analysis/analyze
 * 执行竞标分析
 */
router.post('/analyze', async (req, res) => {
  try {
    const { sourcingEvent, quotes, weights } = req.body;
    if (!sourcingEvent || !quotes || !Array.isArray(quotes) || quotes.length < 2) {
      return res.status(400).json({
        success: false,
        error: '需要至少2个供应商报价',
        example: {
          sourcingEvent: { name: '办公设备采购', category: 'MRO' },
          quotes: [
            { supplier: '供应商A', totalPrice: 125000, leadTime: 7, paymentTerms: 'T/T 30天', ratings: { quality: 4.5, delivery: 4.0, service: 4.2 } },
            { supplier: '供应商B', totalPrice: 118000, leadTime: 10, paymentTerms: 'T/T 45天', ratings: { quality: 4.2, delivery: 3.8, service: 4.5 } }
          ]
        }
      });
    }
    const report = quoteAnalyzer.generateBidAnalysisReport(sourcingEvent, quotes, weights);
    res.json({ success: true, report, ascii: quoteAnalyzer.formatReportAscii(report) });
  } catch (error) {
    console.error('竞标分析失败:', error);
    res.status(500).json({ success: false, error: '分析处理失败', message: error.message });
  }
});

/**
 * POST /api/bid-analysis/brief
 * 简短回复（用于聊天场景）
 */
router.post('/brief', async (req, res) => {
  try {
    const { sourcingEvent, quotes, weights } = req.body;
    if (!sourcingEvent || !quotes || !Array.isArray(quotes) || quotes.length < 2) {
      return res.status(400).json({ success: false, error: '需要至少2个供应商报价' });
    }
    const report = quoteAnalyzer.generateBidAnalysisReport(sourcingEvent, quotes, weights);
    res.json({ success: true, reply: quoteAnalyzer.formatBriefResponse(report) });
  } catch (error) {
    res.status(500).json({ success: false, error: '分析处理失败' });
  }
});

/**
 * GET /api/bid-analysis/demo/report
 * 获取演示报告
 */
router.get('/demo/report', (req, res) => {
  const demoQuotes = [
    { supplier: '华东供应商', totalPrice: 125000, leadTime: 7, paymentTerms: 'T/T 30天', ratings: { quality: 4.5, delivery: 4.0, service: 4.2 } },
    { supplier: '华南供应商', totalPrice: 118000, leadTime: 10, paymentTerms: 'T/T 45天', ratings: { quality: 4.2, delivery: 3.8, service: 4.5 } },
    { supplier: '北方供应商', totalPrice: 132000, leadTime: 5, paymentTerms: 'T/T 30天', ratings: { quality: 4.8, delivery: 4.8, service: 4.0 } },
  ];
  const report = quoteAnalyzer.generateBidAnalysisReport({ name: '办公设备采购项目', category: 'MRO' }, demoQuotes);
  res.json({ success: true, report, ascii: quoteAnalyzer.formatReportAscii(report) });
});

/**
 * POST /api/bid-analysis/chat
 * 聊天式交互接口
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('分析') || lowerMsg.includes('比价')) {
      if (context?.quotes && context.quotes.length >= 2) {
        const report = quoteAnalyzer.generateBidAnalysisReport(context.sourcingEvent || { name: '采购项目', category: 'General' }, context.quotes);
        return res.json({ success: true, intent: 'analysis', reply: quoteAnalyzer.formatBriefResponse(report) });
      }
      return res.json({
        success: true,
        intent: 'need_data',
        reply: '请提供供应商报价数据，格式示例：\n\n```json\n{ "sourcingEvent": {"name": "项目名称", "category": "品类"}, "quotes": [...] }\n```',
      });
    }

    if (lowerMsg.includes('演示') || lowerMsg.includes('例子')) {
      const demoQuotes = [
        { supplier: '华东供应商', totalPrice: 125000, leadTime: 7, paymentTerms: 'T/T 30天', ratings: { quality: 4.5, delivery: 4.0, service: 4.2 } },
        { supplier: '华南供应商', totalPrice: 118000, leadTime: 10, paymentTerms: 'T/T 45天', ratings: { quality: 4.2, delivery: 3.8, service: 4.5 } },
        { supplier: '北方供应商', totalPrice: 132000, leadTime: 5, paymentTerms: 'T/T 30天', ratings: { quality: 4.8, delivery: 4.8, service: 4.0 } },
      ];
      const report = quoteAnalyzer.generateBidAnalysisReport({ name: '办公设备采购项目', category: 'MRO' }, demoQuotes);
      return res.json({ success: true, intent: 'demo', reply: quoteAnalyzer.formatReportAscii(report) });
    }

    res.json({
      success: true,
      intent: 'general',
      reply: '我是竞标分析助手，可以帮您分析供应商报价。\n\n发送"演示"查看示例，或提供报价数据进行比价分析。',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '处理失败' });
  }
});

module.exports = router;
