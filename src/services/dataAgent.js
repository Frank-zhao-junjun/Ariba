/**
 * Data Agent - 采购数据分析服务
 * 功能：自然语言数据查询、多维度聚合、趋势分析
 */

const axios = require('axios');

// Ariba API配置
const ARIBA_API_URL = process.env.ARIBAS_API_URL || 'https://purchase.coze.cn';

// 常见查询模式
const QUERY_PATTERNS = [
  { pattern: /^(.+)采购了?(.+)(零件|商品|物料|产品)/i, type: 'by_supplier_item' },
  { pattern: /^Q(\d)(.+)?(采购|订单|金额|数量)/i, type: 'quarter_summary' },
  { pattern: /(供应商|供应商)(.+)的?(采购|订单|金额)/i, type: 'supplier_detail' },
  { pattern: /^(总|全部|所有)(采购|订单|金额)/i, type: 'total_summary' },
  { pattern: /(环比|同比|增长|下降|趋势)/i, type: 'trend_analysis' },
  { pattern: /(最多|最大|最高|最少|最小|最低)/i, type: 'extreme_value' },
];

/**
 * 解析自然语言查询
 * @param {string} text 用户输入
 * @returns {Object} 解析后的查询参数
 */
function parseNaturalQuery(text) {
  const result = {
    dimensions: [],
    metrics: ['amount', 'count'],
    filters: {},
    granularity: 'month',
    queryType: 'general'
  };

  // 检测查询模式
  for (const { pattern, type } of QUERY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      result.queryType = type;
      break;
    }
  }

  // 提取时间维度
  const quarterMatch = text.match(/Q([1-4])/i);
  if (quarterMatch) {
    result.filters.quarter = parseInt(quarterMatch[1]);
    result.dimensions.push('quarter');
  }

  const yearMatch = text.match(/20\d{2}/);
  if (yearMatch) {
    result.filters.year = parseInt(yearMatch[0]);
  } else {
    result.filters.year = new Date().getFullYear();
  }

  // 提取供应商
  const supplierMatch = text.match(/从(.+)采购|供应商(.+?)的/);
  if (supplierMatch) {
    result.filters.supplier = supplierMatch[1] || supplierMatch[2];
    result.dimensions.push('supplier');
  }

  // 提取品类
  if (/零件|物料|产品/.test(text)) {
    result.dimensions.push('category');
  }

  // 提取指标
  if (/数量|个数|多少/.test(text)) {
    result.metrics = ['quantity', 'count'];
  }
  if (/金额|价格|多少钱/.test(text)) {
    result.metrics.push('amount');
  }

  // 提取粒度
  if (/月/.test(text)) result.granularity = 'month';
  if (/周/.test(text)) result.granularity = 'week';
  if (/季度/.test(text)) result.granularity = 'quarter';

  return result;
}

/**
 * 聚合采购数据（模拟实现）
 * @param {Object} params 查询参数
 * @returns {Object} 聚合结果
 */
async function aggregatePurchaseData(params) {
  // 实际项目中调用 Ariba API
  // 这里使用模拟数据演示
  const mockData = generateMockData(params);
  
  // 按维度聚合
  const aggregated = {
    summary: {
      totalAmount: 0,
      totalQuantity: 0,
      totalCount: 0
    },
    breakdown: [],
    periodData: []
  };

  // 计算汇总
  mockData.forEach(item => {
    aggregated.summary.totalAmount += item.amount;
    aggregated.summary.totalQuantity += item.quantity;
    aggregated.summary.totalCount += item.count;
  });

  // 按供应商聚合
  const bySupplier = {};
  mockData.forEach(item => {
    if (!bySupplier[item.supplier]) {
      bySupplier[item.supplier] = { amount: 0, quantity: 0, count: 0 };
    }
    bySupplier[item.supplier].amount += item.amount;
    bySupplier[item.supplier].quantity += item.quantity;
    bySupplier[item.supplier].count += item.count;
  });

  aggregated.breakdown = Object.entries(bySupplier).map(([supplier, data]) => ({
    supplier,
    ...data
  }));

  // 按月份聚合
  const byPeriod = {};
  mockData.forEach(item => {
    if (!byPeriod[item.period]) {
      byPeriod[item.period] = { amount: 0, quantity: 0, count: 0 };
    }
    byPeriod[item.period].amount += item.amount;
    byPeriod[item.period].quantity += item.quantity;
    byPeriod[item.period].count += item.count;
  });

  aggregated.periodData = Object.entries(byPeriod)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, data]) => ({ period, ...data }));

  return aggregated;
}

/**
 * 计算趋势数据
 * @param {Array} periodData 时间序列数据
 * @returns {Object} 趋势分析结果
 */
function calculateTrends(periodData) {
  if (periodData.length < 2) {
    return { growth: '0%', trend: 'stable' };
  }

  const current = periodData[periodData.length - 1].amount;
  const previous = periodData[periodData.length - 2].amount;
  
  const growth = ((current - previous) / previous * 100).toFixed(1);
  const trend = growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable';

  return {
    growth: `${growth > 0 ? '+' : ''}${growth}%`,
    trend,
    direction: trend === 'up' ? '增长' : trend === 'down' ? '下降' : '持平'
  };
}

/**
 * 生成可视化文本图表
 * @param {Object} data 聚合数据
 * @returns {string} ASCII图表
 */
function formatVisualization(data) {
  if (!data.periodData || data.periodData.length === 0) {
    return '暂无数据';
  }

  const maxAmount = Math.max(...data.periodData.map(d => d.amount));
  const chartLines = ['📊 采购趋势图', ''];

  data.periodData.forEach(item => {
    const barLength = Math.round((item.amount / maxAmount) * 20);
    const bar = '█'.repeat(barLength);
    const label = item.period.padEnd(6);
    const amount = `¥${(item.amount / 10000).toFixed(1)}万`;
    chartLines.push(`${label} ${bar} ${amount}`);
  });

  chartLines.push('');
  chartLines.push(`总计: ¥${(data.summary.totalAmount / 10000).toFixed(1)}万`);
  
  return chartLines.join('\n');
}

/**
 * 生成数据洞察
 * @param {Object} data 聚合数据
 * @param {Object} trends 趋势数据
 * @returns {Array} 洞察列表
 */
function generateInsights(data, trends) {
  const insights = [];

  // 趋势洞察
  if (trends.trend === 'up') {
    insights.push(`📈 采购金额呈上升趋势，环比${trends.growth}`);
  } else if (trends.trend === 'down') {
    insights.push(`📉 采购金额有所下降，环比${trends.growth}`);
  }

  // Top供应商
  if (data.breakdown && data.breakdown.length > 0) {
    const topSupplier = data.breakdown.reduce((max, s) => 
      s.amount > max.amount ? s : max
    );
    insights.push(`🏆 最大供应商: ${topSupplier.supplier} (¥${(topSupplier.amount/10000).toFixed(1)}万)`);
  }

  // 异常检测（简化版）
  if (data.periodData && data.periodData.length >= 3) {
    const recent = data.periodData.slice(-3);
    const avg = recent.reduce((sum, d) => sum + d.amount, 0) / recent.length;
    const current = recent[recent.length - 1].amount;
    
    if (current > avg * 1.5) {
      insights.push('⚠️ 注意: 最近一期采购金额异常偏高');
    }
  }

  return insights;
}

/**
 * 主查询处理函数
 * @param {string} query 用户查询
 * @returns {Object} 查询结果
 */
async function handleDataQuery(query) {
  try {
    // 1. 解析查询
    const params = parseNaturalQuery(query);
    console.log('[DataAgent] 解析查询:', JSON.stringify(params));

    // 2. 聚合数据
    const data = await aggregatePurchaseData(params);

    // 3. 计算趋势
    const trends = calculateTrends(data.periodData);

    // 4. 生成可视化
    const visualization = formatVisualization(data);

    // 5. 生成洞察
    const insights = generateInsights(data, trends);

    // 6. 组装响应
    return {
      success: true,
      query: query,
      params: params,
      data: data,
      trends: trends,
      visualization: visualization,
      insights: insights,
      naturalResponse: buildNaturalResponse(query, data, trends, insights)
    };

  } catch (error) {
    console.error('[DataAgent] 查询失败:', error);
    return {
      success: false,
      error: error.message,
      naturalResponse: '抱歉，数据查询遇到了问题，请稍后再试或联系管理员。'
    };
  }
}

/**
 * 构建自然语言响应
 */
function buildNaturalResponse(query, data, trends, insights) {
  const parts = [];
  
  // 汇总数据
  parts.push(`根据查询"${query}"，以下是采购数据分析结果：\n`);
  parts.push(`📊 **数据汇总**`);
  parts.push(`- 采购总额: ¥${(data.summary.totalAmount / 10000).toFixed(1)}万`);
  parts.push(`- 采购数量: ${data.summary.totalQuantity.toLocaleString()}件`);
  parts.push(`- 订单数量: ${data.summary.totalCount}笔\n`);

  // 趋势
  parts.push(`📈 **趋势分析**`);
  parts.push(`- 环比变化: ${trends.growth} (${trends.direction})\n`);

  // Top供应商
  if (data.breakdown && data.breakdown.length > 0) {
    parts.push(`🏆 **供应商排名**`);
    data.breakdown
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .forEach((s, i) => {
        parts.push(`${i + 1}. ${s.supplier}: ¥${(s.amount/10000).toFixed(1)}万`);
      });
    parts.push('');
  }

  // 洞察
  if (insights.length > 0) {
    parts.push(...insights.join('\n').split('\n'));
  }

  return parts.join('\n');
}

/**
 * 生成模拟数据
 */
function generateMockData(params) {
  const suppliers = ['博世中国', '大陆集团', '采埃孚', '麦格纳', '佛吉亚'];
  const periods = ['8月', '9月', '10月', '11月'];
  
  const data = [];
  
  // 根据过滤器筛选供应商
  const filteredSuppliers = params.filters.supplier 
    ? suppliers.filter(s => s.includes(params.filters.supplier))
    : suppliers;

  filteredSuppliers.forEach(supplier => {
    periods.forEach(period => {
      data.push({
        supplier,
        period,
        amount: Math.floor(Math.random() * 500000) + 100000,
        quantity: Math.floor(Math.random() * 5000) + 1000,
        count: Math.floor(Math.random() * 50) + 10,
        category: '汽车零部件'
      });
    });
  });

  return data;
}

module.exports = {
  parseNaturalQuery,
  aggregatePurchaseData,
  calculateTrends,
  formatVisualization,
  generateInsights,
  handleDataQuery,
  QUERY_PATTERNS
};
