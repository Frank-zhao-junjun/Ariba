/**
 * Data Agent 测试用例
 * 测试数据分析助手功能
 */

const {
  parseNaturalQuery,
  calculateTrends,
  formatVisualization,
  generateInsights,
  handleDataQuery,
  QUERY_PATTERNS
} = require('../src/services/dataAgent');

console.log('🧪 Data Agent 单元测试\n');

// 测试1: 自然语言解析
console.log('测试1: parseNaturalQuery');
console.log('─'.repeat(50));

const testQueries = [
  'Q3从博世中国采购的零件总数是多少',
  '2024年供应商A的采购金额',
  '环比增长了多少',
  '最大供应商是谁'
];

testQueries.forEach(query => {
  const result = parseNaturalQuery(query);
  console.log(`输入: "${query}"`);
  console.log(`结果:`, JSON.stringify(result, null, 2));
  console.log('');
});

// 测试2: 趋势计算
console.log('测试2: calculateTrends');
console.log('─'.repeat(50));

const periodData = [
  { period: '8月', amount: 1000000 },
  { period: '9月', amount: 1200000 },
  { period: '10月', amount: 1150000 },
  { period: '11月', amount: 1350000 },
];

const trends = calculateTrends(periodData);
console.log('输入数据:', periodData);
console.log('趋势结果:', trends);
console.log('');

// 测试3: 可视化生成
console.log('测试3: formatVisualization');
console.log('─'.repeat(50));

const mockData = {
  summary: { totalAmount: 4500000, totalQuantity: 15000, totalCount: 200 },
  periodData: [
    { period: '8月', amount: 1000000, quantity: 3000, count: 45 },
    { period: '9月', amount: 1500000, quantity: 5000, count: 65 },
    { period: '10月', amount: 1200000, quantity: 4000, count: 50 },
    { period: '11月', amount: 800000, quantity: 3000, count: 40 },
  ]
};

const visualization = formatVisualization(mockData);
console.log('可视化输出:\n', visualization);
console.log('');

// 测试4: 洞察生成
console.log('测试4: generateInsights');
console.log('─'.repeat(50));

const insights = generateInsights(mockData, trends);
console.log('洞察列表:', insights);
console.log('');

// 测试5: 完整查询流程
console.log('测试5: handleDataQuery (集成测试)');
console.log('─'.repeat(50));

async function runIntegrationTest() {
  const queries = [
    'Q3从博世中国采购了多少零件',
    '2024年总采购金额是多少'
  ];

  for (const query of queries) {
    console.log(`\n>>> 查询: "${query}"`);
    const result = await handleDataQuery(query);
    console.log('成功:', result.success);
    console.log('自然语言响应:\n', result.naturalResponse);
  }
}

runIntegrationTest().then(() => {
  console.log('\n✅ 所有测试完成');
}).catch(err => {
  console.error('\n❌ 测试失败:', err);
});

// 导出测试函数供外部调用
module.exports = { testQueries, periodData, mockData };
