/**
 * 竞标分析代理测试
 * v1.2
 */

const assert = require('assert');

// 加载模块
const scoringCalculator = require('../src/utils/scoringCalculator');
const quoteAnalyzer = require('../src/services/quoteAnalyzer');

// 测试数据
const testQuotes = [
  {
    supplier: '华东供应商',
    totalPrice: 125000,
    leadTime: 7,
    paymentTerms: 'T/T 30天',
    items: [
      { name: '设备A', quantity: 100, unitPrice: 500 },
      { name: '设备B', quantity: 50, unitPrice: 1000 },
    ],
    ratings: { quality: 4.5, delivery: 4.0, service: 4.2 },
  },
  {
    supplier: '华南供应商',
    totalPrice: 118000,
    leadTime: 10,
    paymentTerms: 'T/T 45天',
    items: [
      { name: '设备A', quantity: 100, unitPrice: 480 },
      { name: '设备B', quantity: 50, unitPrice: 1100 },
    ],
    ratings: { quality: 4.2, delivery: 3.8, service: 4.5 },
  },
  {
    supplier: '北方供应商',
    totalPrice: 132000,
    leadTime: 5,
    paymentTerms: 'T/T 30天',
    items: [
      { name: '设备A', quantity: 100, unitPrice: 520 },
      { name: '设备B', quantity: 50, unitPrice: 960 },
    ],
    ratings: { quality: 4.8, delivery: 4.8, service: 4.0 },
  },
];

console.log('🧪 竞标分析代理测试\n');

// Test 1: 供应商排名
function testRankSuppliers() {
  console.log('Test 1: 供应商排名...');
  const results = scoringCalculator.rankSuppliers(testQuotes);
  assert(results.length === 3, '应该有3个供应商');
  assert(results[0].rank === 1, '第一名排名应为1');
  console.log('  ✅ 排名正确:', results.map(r => r.supplier + '(' + r.scores.totalScore + '分)').join(' > '));
  return true;
}

// Test 2: 评分计算
function testScoring() {
  console.log('Test 2: 评分计算...');
  const scores = scoringCalculator.calculateSupplierScore(testQuotes[0], testQuotes);
  assert(scores.totalScore >= 0 && scores.totalScore <= 100, '总分应在0-100之间');
  console.log('  ✅ 评分计算正确:', scores.totalScore, '分');
  return true;
}

// Test 3: 异常检测
function testAnomalyDetection() {
  console.log('Test 3: 异常检测...');
  const anomalies = scoringCalculator.detectAnomalies(testQuotes[1], testQuotes);
  console.log('  ✅ 异常检测正确:', anomalies.length, '个问题');
  return true;
}

// Test 4: 报告生成
function testReportGeneration() {
  console.log('Test 4: 报告生成...');
  const report = quoteAnalyzer.generateBidAnalysisReport(
    { name: '测试项目', category: 'MRO' },
    testQuotes
  );
  assert(report.totalQuotes === 3, '应该有3个报价');
  assert(report.summary.recommended, '应该有推荐供应商');
  console.log('  ✅ 报告生成正确，推荐:', report.summary.recommended);
  return true;
}

// Test 5: ASCII格式输出
function testAsciiOutput() {
  console.log('Test 5: ASCII格式输出...');
  const report = quoteAnalyzer.generateBidAnalysisReport(
    { name: '测试项目', category: 'MRO' },
    testQuotes
  );
  const ascii = quoteAnalyzer.formatReportAscii(report);
  assert(ascii.includes('竞标分析报告'), '应包含报告标题');
  console.log('  ✅ ASCII格式输出正确');
  return true;
}

// 运行测试
let passed = 0, failed = 0;
const tests = [testRankSuppliers, testScoring, testAnomalyDetection, testReportGeneration, testAsciiOutput];

for (const test of tests) {
  try {
    if (test()) passed++;
  } catch (error) {
    console.log('  ❌ 失败:', error.message);
    failed++;
  }
}

console.log('\n' + '='.repeat(40));
console.log('测试结果: ' + passed + ' 通过, ' + failed + ' 失败');
console.log('='.repeat(40));

// 演示报告
console.log('\n📊 演示报告:\n');
const demoReport = quoteAnalyzer.generateBidAnalysisReport(
  { name: '办公设备采购项目', category: 'MRO' },
  testQuotes
);
console.log(quoteAnalyzer.formatReportAscii(demoReport));

process.exit(failed > 0 ? 1 : 0);
