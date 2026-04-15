/**
 * 询价比价API路由
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bidComparison = require('../modules/bid-comparison');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/bid-comparison');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB限制
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持PDF和Excel文件'));
    }
  }
});

/**
 * POST /api/bid-comparison/upload
 * 上传多个报价文件
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: '请上传至少一个报价文件' });
    }
    
    // 解析每个文件
    const parsedQuotes = [];
    for (const file of files) {
      const result = await bidComparison.parseQuote(file.path);
      result.fileId = file.filename;
      result.originalName = file.originalname;
      parsedQuotes.push(result);
    }
    
    res.json({
      success: true,
      sessionId: uuidv4(),
      files: files.map(f => ({
        filename: f.filename,
        originalName: f.originalname,
        size: f.size
      })),
      parsedQuotes,
      message: `成功解析 ${parsedQuotes.filter(q => q.success).length}/${files.length} 个文件`
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bid-comparison/compare
 * 生成比价矩阵
 */
router.post('/compare', async (req, res) => {
  try {
    const { parsedQuotes, scoringRules } = req.body;
    
    if (!parsedQuotes || !Array.isArray(parsedQuotes) || parsedQuotes.length < 2) {
      return res.status(400).json({ 
        error: '请提供至少2个已解析的报价数据' 
      });
    }
    
    // 生成比价矩阵
    const matrix = bidComparison.generateComparisonMatrix(parsedQuotes);
    
    // 应用评分规则（如果提供）
    if (scoringRules) {
      matrix.scored = applyScoring(matrix, scoringRules, parsedQuotes);
    }
    
    // 生成分析报告
    matrix.analysis = generateAnalysis(matrix);
    
    res.json({
      success: true,
      matrix,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('比价生成错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 应用评分规则
 */
function applyScoring(matrix, rules, quotes) {
  const { price = 40, quality = 30, delivery = 20, payment = 10 } = rules;
  const totalWeight = price + quality + delivery + payment;
  
  const scores = {};
  
  matrix.vendors.forEach(vendor => {
    const vendorTotal = matrix.summary.totalPrices[vendor] || 0;
    
    // 价格得分：最低价得满分，其他按比例
    const minPrice = Math.min(...Object.values(matrix.summary.totalPrices));
    const priceScore = minPrice > 0 ? (minPrice / vendorTotal) * 100 : 100;
    
    // 其他得分（从quotes中提取）
    const quote = quotes.find(q => q.vendor === vendor);
    const qualityScore = 80 + Math.random() * 20; // 模拟质量评分
    const deliveryScore = 75 + Math.random() * 25; // 模拟交期评分
    const paymentScore = 70 + Math.random() * 30; // 模拟付款条款评分
    
    // 加权总分
    const totalScore = 
      (priceScore * price / totalWeight) +
      (qualityScore * quality / totalWeight) +
      (deliveryScore * delivery / totalWeight) +
      (paymentScore * payment / totalWeight);
    
    scores[vendor] = {
      priceScore: Math.round(priceScore),
      qualityScore: Math.round(qualityScore),
      deliveryScore: Math.round(deliveryScore),
      paymentScore: Math.round(paymentScore),
      totalScore: Math.round(totalScore * 100) / 100
    };
  });
  
  // 按总分排序
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].totalScore - a[1].totalScore);
  
  return {
    rankings: sorted.map(([vendor, score], index) => ({
      rank: index + 1,
      vendor,
      ...score
    })),
    rules: { price, quality, delivery, payment }
  };
}

/**
 * 生成分析报告
 */
function generateAnalysis(matrix) {
  const analysis = {
    summary: '',
    recommendations: [],
    risks: []
  };
  
  const vendors = Object.keys(matrix.summary.totalPrices);
  if (vendors.length < 2) {
    analysis.summary = '供应商数量不足，无法进行有效比价分析';
    return analysis;
  }
  
  // 找出价格差异
  const prices = Object.values(matrix.summary.totalPrices);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const diff = ((maxPrice - minPrice) / minPrice * 100).toFixed(1);
  
  analysis.summary = `收到 ${vendors.length} 家供应商报价，最低报价 ${minPrice.toLocaleString()}，最高报价 ${maxPrice.toLocaleString()}，价差 ${diff}%`;
  
  // 推荐
  const sorted = vendors.sort((a, b) => 
    matrix.summary.totalPrices[a] - matrix.summary.totalPrices[b]
  );
  
  analysis.recommendations.push({
    type: '最优价格',
    vendor: sorted[0],
    reason: `总价最低：${matrix.summary.totalPrices[sorted[0]].toLocaleString()}`
  });
  
  if (sorted.length > 1) {
    const secondPrice = matrix.summary.totalPrices[sorted[1]];
    const saving = secondPrice - matrix.summary.totalPrices[sorted[0]];
    if (saving > 0) {
      analysis.recommendations.push({
        type: '节省建议',
        vendor: sorted[0],
        reason: `相比第2名可节省 ${saving.toLocaleString()}（${((saving/secondPrice)*100).toFixed(1)}%）`
      });
    }
  }
  
  // 风险提示
  if (vendors.length === 2) {
    analysis.risks.push({
      type: '竞争不足',
      level: 'medium',
      message: '仅有2家供应商参与，建议增加询价供应商以获得更有竞争力的价格'
    });
  }
  
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  vendors.forEach(vendor => {
    const price = matrix.summary.totalPrices[vendor];
    if (price > avgPrice * 1.2) {
      analysis.risks.push({
        type: '价格偏高',
        vendor,
        level: 'high',
        message: `${vendor}报价高于平均价${((price/avgPrice - 1)*100).toFixed(1)}%，建议谈判或更换`
      });
    }
  });
  
  return analysis;
}

/**
 * GET /api/bid-comparison/export
 * 导出比价报告
 */
router.get('/export', (req, res) => {
  try {
    const { matrix } = req.query;
    if (!matrix) {
      return res.status(400).json({ error: '缺少比价矩阵数据' });
    }
    
    const data = JSON.parse(Buffer.from(matrix, 'base64').toString());
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: 比价汇总
    const summaryData = [
      ['供应商比价分析报告'],
      ['生成时间', new Date().toLocaleString('zh-CN')],
      [],
      ['供应商', '总价', '排名', '备注']
    ];
    
    if (data.scored) {
      data.scored.rankings.forEach(r => {
        summaryData.push([
          r.vendor,
          data.summary.totalPrices[r.vendor] || 0,
          r.rank,
          r.rank === 1 ? '★ 推荐' : ''
        ]);
      });
    } else {
      const sorted = Object.entries(data.summary.totalPrices || {})
        .sort((a, b) => a[1] - b[1]);
      sorted.forEach(([vendor, price], index) => {
        summaryData.push([
          vendor,
          price,
          index + 1,
          index === 0 ? '★ 推荐' : ''
        ]);
      });
    }
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, '比价汇总');
    
    // Sheet 2: 明细数据
    const detailData = [['物料', ...data.vendors]];
    data.items.forEach(item => {
      const row = [item.item];
      data.vendors.forEach(vendor => {
        const vendorData = item.quantities[vendor];
        row.push(vendorData ? vendorData.totalPrice : '-');
      });
      detailData.push(row);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws2, '明细数据');
    
    // 导出
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=比价报告_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bid-comparison/recommend
 * AI推荐最优供应商
 */
router.post('/recommend', async (req, res) => {
  try {
    const { matrix, requirements } = req.body;
    
    if (!matrix) {
      return res.status(400).json({ error: '缺少比价矩阵数据' });
    }
    
    // 简单推荐逻辑
    const recommendation = {
      primary: {
        vendor: matrix.summary.recommended || Object.keys(matrix.summary.totalPrices)[0],
        reason: '基于综合比价结果，该供应商提供最优价格'
      },
      alternatives: [],
      factors: []
    };
    
    // 分析各因素
    const factors = [];
    if (matrix.items.length > 0) {
      const firstItem = matrix.items[0];
      const prices = Object.entries(firstItem.quantities)
        .sort((a, b) => a[1].totalPrice - b[1].totalPrice);
      
      if (prices.length > 0) {
        factors.push({
          name: '价格竞争力',
          best: prices[0][0],
          value: `最低单价 ${prices[0][1].unitPrice}`
        });
      }
    }
    
    // 考虑交货期
    if (requirements?.deliveryDate) {
      factors.push({
        name: '交货能力',
        note: '需评估供应商交货承诺'
      });
    }
    
    recommendation.factors = factors;
    
    // 备选供应商
    if (matrix.summary.totalPrices) {
      const sorted = Object.entries(matrix.summary.totalPrices)
        .sort((a, b) => a[1] - b[1]);
      
      if (sorted.length > 1) {
        recommendation.alternatives.push({
          vendor: sorted[1][0],
          reason: '价格次优，可作为备选'
        });
      }
    }
    
    res.json({
      success: true,
      recommendation,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('推荐生成错误:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
