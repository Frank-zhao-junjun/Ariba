/**
 * 智能审批助手API路由
 */
const express = require('express');
const router = express.Router();
const approvalService = require('../services/approval');

router.get('/pending', async (req, res) => {
  try {
    const { type, department, priority, minAmount, maxAmount } = req.query;
    const filters = { type, department, priority, minAmount: minAmount ? parseInt(minAmount) : undefined, maxAmount: maxAmount ? parseInt(maxAmount) : undefined };
    const result = await approvalService.getPendingApprovals(filters);
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await approvalService.getApprovalDetail(req.params.id);
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/process', async (req, res) => {
  try {
    const { id, action, comment } = req.body;
    if (!id || !action) return res.status(400).json({ success: false, error: '缺少必要参数' });
    const result = await approvalService.processApproval(id, action, comment);
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/batch', async (req, res) => {
  try {
    const { ids, action, comment } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, error: '缺少必要参数：ids' });
    const result = await approvalService.batchProcessApproval(ids, action, comment);
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/history/list', async (req, res) => {
  try {
    const result = await approvalService.getApprovalHistory(req.query);
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: '缺少查询内容' });
    const result = await approvalService.naturalLanguageQuery(query);
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/summary/report', async (req, res) => {
  try {
    const result = await approvalService.getApprovalSummary();
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

module.exports = router;
