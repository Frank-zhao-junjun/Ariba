/**
 * 报价分析服务
 * 提供竞标分析的核心业务逻辑
 */

const scoringCalculator = require('../utils/scoringCalculator');

/**
 * 生成进度条ASCII图形
 */
function generateProgressBar(score, length = 10) {
  const filled = Math.round((score / 100) * length);
  const empty = length - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

/**
 * 生成完整比价分析报告
 */
function generateBidAnalysisReport(sourcingEvent, quotes, weights) {
  const ranked = scoringCalculator.rankSuppliers(quotes, weights);

  const results = ranked.map(({ quote, scores, rank }) => {
    const anomalies = scoringCalculator.detectAnomalies(quote, quotes);
    const valueIndex = scoringCalculator.calculateValueIndex(quote, scores.totalScore);
    return { supplier: quote.supplier, rank, scores, valueIndex, anomalies };
  });

  const prices = quotes.map(q => q.totalPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const priceSpread = maxPrice > 0 ? ((maxPrice - minPrice) / minPrice * 100).toFixed(1) : '0';

  const sortedByPrice = [...quotes].sort((a, b) => a.totalPrice - b.totalPrice);
  const sortedByLeadTime = [...quotes].sort((a, b) => a.leadTime - b.leadTime);

  const bestPrice = sortedByPrice[0].supplier;
  const fastestDelivery = sortedByLeadTime[0].supplier;

  let bestQuality = quotes[0].supplier;
  let maxQuality = quotes[0].ratings?.quality ?? 0;
  for (const q of quotes) {
    if ((q.ratings?.quality ?? 0) > maxQuality) {
      maxQuality = q.ratings?.quality ?? 0;
      bestQuality = q.supplier;
    }
  }

  let bestService = quotes[0].supplier;
  let maxService = quotes[0].ratings?.service ?? 0;
  for (const q of quotes) {
    if ((q.ratings?.service ?? 0) > maxService) {
      maxService = q.ratings?.service ?? 0;
      bestService = q.supplier;
    }
  }

  const recommended = results[0]?.supplier ?? '暂无';
  const recommendations = [];

  if (results[0]) {
    const topSupplier = results[0];
    recommendations.push(`综合评分最优：推荐${topSupplier.supplier}，综合得分 ${topSupplier.scores.totalScore} 分`);
  }

  if (sortedByPrice[0].supplier !== recommended) {
    recommendations.push(`如需控制成本，可与${sortedByPrice[0].supplier}议价，预计可节省 ¥${(avgPrice - sortedByPrice[0].totalPrice).toFixed(0)}`);
  }

  for (const result of results) {
    const warnings = result.anomalies.filter(a => a.severity === 'warning');
    if (warnings.length > 0) {
      recommendations.push(`关注${result.supplier}：${warnings.map(w => w.message).join('，')}`);
    }
  }

  return {
    sourcingEvent,
    totalQuotes: quotes.length,
    analysisDate: new Date().toLocaleString('zh-CN'),
    priceRange: { min: minPrice, max: maxPrice, avg: Math.round(avgPrice), spread: parseFloat(priceSpread) },
    results,
    summary: { recommended, bestPrice, bestQuality, bestService, fastestDelivery },
    recommendations,
  };
}

/**
 * 生成ASCII格式的报告文本
 */
function formatReportAscii(report) {
  const lines = [];
  lines.push('');
  lines.push('━'.repeat(64));
  lines.push(`📊 竞标分析报告：${report.sourcingEvent.name}`);
  lines.push('━'.repeat(64));
  lines.push('');
  lines.push(`📅 分析时间: ${report.analysisDate}`);
  lines.push(`📦 报价数量: ${report.totalQuotes} 家供应商`);
  lines.push('');

  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push('│  💰 价格概览                                                   │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push(`│  最低报价: ¥${report.priceRange.min.toLocaleString()}                                      │`);
  lines.push(`│  最高报价: ¥${report.priceRange.max.toLocaleString()}                                      │`);
  lines.push(`│  平均报价: ¥${report.priceRange.avg.toLocaleString()}                                      │`);
  lines.push(`│  价格差距: ${report.priceRange.spread}%                                              │`);
  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('');

  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push('│  🏆 综合评分排名                                                │');
  lines.push('├─────────────────────────────────────────────────────────────┤');

  for (const result of report.results) {
    const medal = result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : result.rank === 3 ? '🥉' : ` ${result.rank}.`;
    const bar = generateProgressBar(result.scores.totalScore);
    const line = `│  ${medal} ${result.supplier.padEnd(12)} ⭐ ${String(result.scores.totalScore).padStart(3)} 分  ${bar}  │`;
    lines.push(line);
  }

  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('');

  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push('│  📈 性价比指数                                                 │');
  lines.push('├─────────────────────────────────────────────────────────────┤');

  const sortedByValue = [...report.results].sort((a, b) => a.valueIndex - b.valueIndex);
  for (const result of sortedByValue) {
    const marker = result.valueIndex === sortedByValue[0].valueIndex ? ' ✅' : '   ';
    lines.push(`│  ${marker} ${result.supplier.padEnd(12)} ¥/分 = ${String(result.valueIndex).padStart(4)}                               │`);
  }

  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('');

  const allWarnings = report.results.flatMap(r =>
    r.anomalies.filter(a => a.severity === 'warning').map(a => ({ supplier: r.supplier, ...a }))
  );

  if (allWarnings.length > 0) {
    lines.push('┌─────────────────────────────────────────────────────────────┐');
    lines.push('│  ⚠️  异常提醒                                                   │');
    lines.push('├─────────────────────────────────────────────────────────────┤');
    for (const warning of allWarnings) {
      lines.push(`│  • ${warning.supplier}: ${warning.message.padEnd(36)} │`);
    }
    lines.push('└─────────────────────────────────────────────────────────────┘');
    lines.push('');
  }

  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push('│  📊 分项得分对比                                               │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  lines.push('│  供应商       价格  交期  质量  交付  服务  付款              │');
  lines.push('├─────────────────────────────────────────────────────────────┤');

  for (const result of report.results) {
    const { scores } = result;
    lines.push(`│  ${result.supplier.padEnd(11)} ${String(scores.priceScore).padStart(4)}  ${String(scores.leadTimeScore).padStart(4)}  ${String(scores.qualityScore).padStart(4)}  ${String(scores.deliveryScore).padStart(4)}  ${String(scores.serviceScore).padStart(4)}  ${String(scores.paymentScore).padStart(4)}    │`);
  }

  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('');

  lines.push('┌─────────────────────────────────────────────────────────────┐');
  lines.push('│  💡 顾问建议                                                   │');
  lines.push('├─────────────────────────────────────────────────────────────┤');
  for (const rec of report.recommendations) {
    lines.push(`│  • ${rec.padEnd(52)} │`);
  }
  lines.push('└─────────────────────────────────────────────────────────────┘');
  lines.push('');
  lines.push('━'.repeat(64));

  return lines.join('\n');
}

/**
 * 生成简短回复文本（用于聊天场景）
 */
function formatBriefResponse(report) {
  const top = report.results[0];
  let response = `📊 竞标分析完成\n\n`;
  response += `**${report.sourcingEvent.name}**\n\n`;
  response += `🏆 综合推荐：**${top?.supplier}**（${top?.scores.totalScore}分）\n\n`;
  response += `📈 性价比最优：${report.summary.bestPrice}\n`;
  response += `⭐ 质量最优：${report.summary.bestQuality}\n`;
  response += `⚡ 交期最优：${report.summary.fastestDelivery}\n\n`;

  if (top?.anomalies && top.anomalies.length > 0) {
    response += `⚠️ 注意事项：\n`;
    for (const a of top.anomalies) {
      response += `- ${a.message}\n`;
    }
  }
  return response;
}

module.exports = {
  generateBidAnalysisReport,
  formatReportAscii,
  formatBriefResponse,
};
