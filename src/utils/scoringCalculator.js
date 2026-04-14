/**
 * 评分计算工具
 * 用于计算供应商报价的多维度综合得分
 */

module.exports = {
  // 权重配置
  ScoringWeights: {
    price: 0.35,
    leadTime: 0.15,
    quality: 0.20,
    delivery: 0.10,
    service: 0.10,
    payment: 0.10,
  },

  // 付款条件评分
  PAYMENT_TERMS_SCORES: {
    '预付': 10,
    'T/T 30天': 8,
    'T/T 45天': 6,
    'T/T 60天': 4,
    'T/T 90天': 2,
    '货到付款': 7,
    '月结30天': 8,
    '月结45天': 6,
    '月结60天': 4,
  },

  /**
   * 计算付款条件的归一化得分
   */
  calculatePaymentScore(paymentTerms) {
    const normalized = paymentTerms.toUpperCase().replace(/\s+/g, '');
    for (const [key, score] of Object.entries(this.PAYMENT_TERMS_SCORES)) {
      if (normalized.includes(key.replace(/\s+/g, '').toUpperCase())) {
        return score * 10;
      }
    }
    const match = paymentTerms.match(/(\d+)\s*天/);
    if (match) {
      const days = parseInt(match[1]);
      if (days <= 30) return 80;
      if (days <= 45) return 60;
      if (days <= 60) return 40;
      return 20;
    }
    return 50;
  },

  /**
   * 归一化得分到0-100范围
   */
  normalizeScore(value, minValue, maxValue, reverse = false) {
    if (maxValue === minValue) return 100;
    let normalized = ((value - minValue) / (maxValue - minValue)) * 100;
    if (reverse) normalized = 100 - normalized;
    return Math.max(0, Math.min(100, normalized));
  },

  /**
   * 计算单个供应商的综合得分
   */
  calculateSupplierScore(quote, allQuotes, weights = this.ScoringWeights) {
    const prices = allQuotes.map(q => q.totalPrice);
    const leadTimes = allQuotes.map(q => q.leadTime);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minLeadTime = Math.min(...leadTimes);
    const maxLeadTime = Math.max(...leadTimes);

    const priceScore = this.normalizeScore(quote.totalPrice, minPrice, maxPrice, true);
    const leadTimeScore = this.normalizeScore(quote.leadTime, minLeadTime, maxLeadTime, true);
    const qualityScore = (quote.ratings?.quality ?? 4) * 20;
    const deliveryScore = (quote.ratings?.delivery ?? 4) * 20;
    const serviceScore = (quote.ratings?.service ?? 4) * 20;
    const paymentScore = this.calculatePaymentScore(quote.paymentTerms);

    const totalScore = Math.round(
      priceScore * weights.price +
      leadTimeScore * weights.leadTime +
      qualityScore * weights.quality +
      deliveryScore * weights.delivery +
      serviceScore * weights.service +
      paymentScore * weights.payment
    );

    return {
      priceScore: Math.round(priceScore),
      leadTimeScore: Math.round(leadTimeScore),
      qualityScore: Math.round(qualityScore),
      deliveryScore: Math.round(deliveryScore),
      serviceScore: Math.round(serviceScore),
      paymentScore: Math.round(paymentScore),
      totalScore,
    };
  },

  /**
   * 计算所有供应商得分并排序
   */
  rankSuppliers(quotes, weights) {
    const results = quotes.map(quote => ({
      quote,
      scores: this.calculateSupplierScore(quote, quotes, weights),
    }));
    results.sort((a, b) => b.scores.totalScore - a.scores.totalScore);
    return results.map((item, index) => ({ ...item, rank: index + 1 }));
  },

  /**
   * 计算性价比指数
   */
  calculateValueIndex(quote, score) {
    if (score === 0) return 0;
    return Math.round((quote.totalPrice / score) * 100);
  },

  /**
   * 检测价格异常
   */
  detectAnomalies(quote, allQuotes) {
    const anomalies = [];
    const prices = allQuotes.map(q => q.totalPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);

    if (quote.totalPrice > avgPrice * 1.1) {
      const diff = ((quote.totalPrice - avgPrice) / avgPrice * 100).toFixed(1);
      anomalies.push({ type: 'price_high', message: `总报价偏高(+${diff}%)`, severity: 'warning' });
    }

    if (quote.totalPrice < minPrice * 1.2 && quote.totalPrice < avgPrice * 0.85) {
      anomalies.push({ type: 'price_low', message: '报价显著偏低，可能存在风险', severity: 'warning' });
    }

    if (quote.items && quote.items.length > 0) {
      for (const item of quote.items) {
        const sameItems = allQuotes.flatMap(q => q.items || []).filter(i => i.name === item.name);
        if (sameItems.length > 0) {
          const avgItemPrice = sameItems.reduce((sum, i) => sum + i.unitPrice, 0) / sameItems.length;
          if (item.unitPrice > avgItemPrice * 1.15) {
            const diff = ((item.unitPrice - avgItemPrice) / avgItemPrice * 100).toFixed(1);
            anomalies.push({ type: 'item_high', message: `${item.name}单价偏高(+${diff}%)`, severity: 'warning' });
          }
        }
      }
    }

    const avgLeadTime = allQuotes.reduce((sum, q) => sum + q.leadTime, 0) / allQuotes.length;
    if (quote.leadTime > avgLeadTime * 1.3) {
      anomalies.push({ type: 'leadtime_long', message: `交货期较长(+${Math.round(quote.leadTime - avgLeadTime)}天)`, severity: 'info' });
    }

    return anomalies;
  },
};
