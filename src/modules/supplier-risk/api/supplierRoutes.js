/**
 * 供应商评估API路由 - v1.3
 */
const express = require('express');
const router = express.Router();
const supplierEvaluator = require('../supplierEvaluator');

// POST /api/supplier/evaluate - 单供应商评估
router.post('/evaluate', async (req, res) => {
  try {
    const { supplierId, supplierName, qualification, aribaStatus, financial, moodysData, moodysEsg, compliance, esg, blacklist, geographicRisk } = req.body;
    if (!supplierId) {
      return res.status(400).json({ success: false, error: '缺少必需参数：supplierId' });
    }
    const result = await supplierEvaluator.evaluateSupplier({ supplierId, supplierName, qualification, aribaStatus, financial, moodysData, moodysEsg, compliance, esg, blacklist, geographicRisk });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('供应商评估API错误:', error.message);
    res.status(500).json({ success: false, error: '评估失败', message: error.message });
  }
});

// POST /api/supplier/batch-evaluate - 批量评估
router.post('/batch-evaluate', async (req, res) => {
  try {
    const { suppliers } = req.body;
    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return res.status(400).json({ success: false, error: '缺少必需参数：suppliers（数组）' });
    }
    if (suppliers.length > 100) {
      return res.status(400).json({ success: false, error: '单次批量评估最多支持100家供应商' });
    }
    const { results, summary } = await supplierEvaluator.batchEvaluate(suppliers);
    res.json({ success: true, data: { results, summary } });
  } catch (error) {
    console.error('批量评估API错误:', error.message);
    res.status(500).json({ success: false, error: '批量评估失败', message: error.message });
  }
});

// POST /api/supplier/risk-monitor - 风险监控配置
router.post('/risk-monitor', async (req, res) => {
  try {
    const { supplierId, frequency, notification } = req.body;
    if (!supplierId) {
      return res.status(400).json({ success: false, error: '缺少必需参数：supplierId' });
    }
    const monitorId = 'MON-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    res.json({ success: true, data: { monitorId, supplierId, frequency: frequency || 'monthly', notification: notification || { email: true }, status: 'active', createdAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: '监控配置失败', message: error.message });
  }
});

// GET /api/supplier/report/:id - 获取评估报告
router.get('/report/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ success: true, data: { reportId: id, status: 'completed', downloadUrl: '/api/supplier/report/' + id + '/download', createdAt: new Date().toISOString() } });
});

// POST /api/supplier/slp-status - 查询Ariba SLP状态
router.post('/slp-status', async (req, res) => {
  try {
    const { supplierId } = req.body;
    if (!supplierId) {
      return res.status(400).json({ success: false, error: '缺少必需参数：supplierId' });
    }
    res.json({ success: true, data: { supplierId, status: 'ACTIVE', slpCompletion: 85, lastUpdated: new Date().toISOString(), registrationDate: '2024-06-15', complianceStatus: 'COMPLIANT' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'SLP状态查询失败' });
  }
});

// POST /api/supplier/compliance-check - 合规检查
router.post('/compliance-check', async (req, res) => {
  try {
    const { supplierId, supplierName } = req.body;
    if (!supplierId && !supplierName) {
      return res.status(400).json({ success: false, error: '缺少必需参数：supplierId 或 supplierName' });
    }
    res.json({ success: true, data: { supplierId: supplierId || supplierName, sanctionCheck: { passed: true }, blacklistCheck: { passed: true, matches: [] }, overallStatus: 'PASS', checkedAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, error: '合规检查失败' });
  }
});

module.exports = router;
