/**
 * 发票差异分析API路由
 */

const express = require('express');
const router = express.Router();
const InvoiceAnalyzer = require('../services/invoiceAnalyzer');

const analyzer = new InvoiceAnalyzer();

/**
 * POST /api/invoice/analyze
 * 分析发票与PO的差异
 */
router.post('/analyze', async (req, res) => {
  try {
    const { invoice, po, receipt } = req.body;
    
    if (!invoice || !po) {
      return res.status(400).json({
        success: false,
        error: '请提供发票和采购订单数据'
      });
    }

    // 分析差异
    const report = await analyzer.analyze(invoice, po, receipt);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('发票差异分析失败:', error);
    res.status(500).json({
      success: false,
      error: '分析失败: ' + error.message
    });
  }
});

/**
 * POST /api/invoice/demo
 * 演示模式 - 使用示例数据
 */
router.post('/demo', async (req, res) => {
  try {
    const demoData = analyzer.getDemoData();
    const report = await analyzer.analyze(demoData.invoice, demoData.po, demoData.receipt);
    
    res.json({
      success: true,
      data: report,
      sourceData: demoData,
      message: '演示模式 - 使用示例发票数据'
    });
  } catch (error) {
    console.error('演示分析失败:', error);
    res.status(500).json({
      success: false,
      error: '分析失败: ' + error.message
    });
  }
});

/**
 * POST /api/invoice/quick-check
 * 快速检查 - 简化分析
 */
router.post('/quick-check', async (req, res) => {
  try {
    const { invoiceAmount, poAmount } = req.body;
    
    if (!invoiceAmount || !poAmount) {
      return res.status(400).json({
        success: false,
        error: '请提供发票金额和PO金额'
      });
    }

    const variance = invoiceAmount - poAmount;
    const variancePercent = poAmount > 0 ? Math.abs(variance / poAmount) : 0;
    
    // 快速判断
    let status = 'APPROVED';
    let action = 'AUTO_APPROVE';
    
    if (variancePercent > 0.10) {
      status = 'REJECTED';
      action = 'ESCALATE';
    } else if (variancePercent > 0.05) {
      status = 'REVIEW';
      action = 'REVIEW';
    } else if (variancePercent > 0.01) {
      status = 'PENDING';
      action = 'AUTO_APPROVE';
    }

    res.json({
      success: true,
      data: {
        invoiceAmount,
        poAmount,
        variance,
        variancePercent,
        status,
        action,
        message: variance === 0 
          ? '发票金额与采购订单完全匹配' 
          : '存在 ' + (variancePercent * 100).toFixed(2) + '% 的金额差异'
      }
    });
  } catch (error) {
    console.error('快速检查失败:', error);
    res.status(500).json({
      success: false,
      error: '检查失败: ' + error.message
    });
  }
});

module.exports = router;
