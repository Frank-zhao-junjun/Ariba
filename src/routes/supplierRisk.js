/**
 * 供应商风险分析API路由
 * v1.5
 */

const express = require('express');
const router = express.Router();
const supplierRiskModule = require('../modules/supplier-risk');
const logger = require('../utils/logger');

/**
 * POST /api/supplier-risk/analyze
 * 分析单个供应商风险
 */
router.post('/analyze', async (req, res) => {
  try {
    const supplierData = req.body;

    if (!supplierData.supplierId || !supplierData.supplierName) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段: supplierId, supplierName'
      });
    }

    logger.info('收到供应商风险分析请求', { supplierId: supplierData.supplierId });

    const result = await supplierRiskModule.analyzeSupplierRisk(supplierData);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('供应商风险分析失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/supplier-risk/batch
 * 批量分析供应商风险
 */
router.post('/batch', async (req, res) => {
  try {
    const { suppliers } = req.body;

    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少供应商列表'
      });
    }

    logger.info('收到批量供应商风险分析请求', { count: suppliers.length });

    const result = await supplierRiskModule.analyzeBatchSuppliers(suppliers);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('批量供应商风险分析失败', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/supplier-risk/templates
 * 获取示例数据模板
 */
router.get('/templates', (req, res) => {
  const template = {
    supplierId: 'SUP-001',
    supplierName: '示例供应商',
    industry: '制造业',
    country: '中国',
    businessAge: 5,
    certifications: ['ISO9001', 'ISO14001', '营业执照'],
    transactionHistory: [
      { date: '2026-01-15', amount: 50000, currency: 'CNY', paymentStatus: 'ON_TIME' },
      { date: '2026-02-15', amount: 75000, currency: 'CNY', paymentStatus: 'DELAYED', daysOverdue: 5 },
      { date: '2026-03-15', amount: 60000, currency: 'CNY', paymentStatus: 'ON_TIME' },
      { date: '2026-04-10', amount: 80000, currency: 'CNY', paymentStatus: 'OVERDUE', daysOverdue: 15 }
    ],
    deliveryRecords: [
      { date: '2026-01-20', plannedDate: '2026-01-20', actualDate: '2026-01-20', onTime: true, qualityScore: 95 },
      { date: '2026-02-25', plannedDate: '2026-02-25', actualDate: '2026-02-28', onTime: false, qualityScore: 88 },
      { date: '2026-03-30', plannedDate: '2026-03-30', actualDate: '2026-03-30', onTime: true, qualityScore: 92 }
    ],
    complianceHistory: [
      { type: 'ISO审核', date: '2026-01-10', status: 'PASS', description: 'ISO9001年度审核通过' },
      { type: '环境审核', date: '2026-02-15', status: 'WARNING', description: '建议改进废弃物处理流程' },
      { type: '安全审核', date: '2026-03-20', status: 'PASS', description: '安全生产达标' }
    ],
    marketData: {
      industryRisk: 'MEDIUM',
      geopoliticalRisk: 'LOW',
      newsSentiment: 10,
      newsItems: ['供应商近期获得行业奖项', '扩展新生产线']
    }
  };

  res.json({
    success: true,
    data: template
  });
});

module.exports = router;
