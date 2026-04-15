/**
 * 供应商智能评估Agent - 单元测试 v1.3
 */
const assert = require('assert');
const supplierEvaluator = require('./src/modules/supplier-risk/supplierEvaluator');

console.log('🧪 开始供应商评估引擎测试...\n');

// 测试1: 资质评估 - 完整数据
async function test1() {
  console.log('📋 测试1: 资质评估（完整数据）');
  const score = supplierEvaluator.calculateQualificationScore(
    { certifications: ['ISO 9001', 'ISO 14001'], industryExperience: 12 },
    { status: 'ACTIVE', slpCompletion: 85 }
  );
  console.log('   资质评分:', score);
  assert(score >= 80, '完整数据应有较高评分');
  console.log('   ✅ 通过\n');
}

// 测试2: 资质评估 - 最小数据
async function test2() {
  console.log('📋 测试2: 资质评估（最小数据）');
  const score = supplierEvaluator.calculateQualificationScore({}, null);
  console.log('   资质评分:', score);
  assert(score >= 0 && score <= 20, '最小数据应有较低评分');
  console.log('   ✅ 通过\n');
}

// 测试3: 财务评估 - 良好付款记录
async function test3() {
  console.log('📋 测试3: 财务评估（良好付款记录）');
  const score = supplierEvaluator.calculateFinancialScore(
    { transactionHistory: [{ paymentStatus: 'ON_TIME' }, { paymentStatus: 'ON_TIME' }], businessAge: 15 },
    { rating: 5 }
  );
  console.log('   财务评分:', score);
  assert(score >= 70, '良好数据应有高分');
  console.log('   ✅ 通过\n');
}

// 测试4: 合规检查 - 通过
async function test4() {
  console.log('📋 测试4: 合规检查（通过）');
  const result = supplierEvaluator.calculateComplianceScore({ records: [{ status: 'PASS' }, { status: 'PASS' }] }, []);
  console.log('   合规评分:', result.score);
  assert(result.score >= 90, '全通过应有高分');
  console.log('   ✅ 通过\n');
}

// 测试5: 合规检查 - 黑名单
async function test5() {
  console.log('📋 测试5: 合规检查（黑名单）');
  const result = supplierEvaluator.calculateComplianceScore({}, ['SUPPLIER_001']);
  console.log('   合规评分:', result.score);
  assert(result.score === 0, '黑名单应有0分');
  console.log('   ✅ 通过\n');
}

// 测试6: 等级判定
async function test6() {
  console.log('📋 测试6: 等级判定');
  const tests = [
    { score: 90, expected: 'excellent' },
    { score: 80, expected: 'good' },
    { score: 60, expected: 'normal' },
    { score: 40, expected: 'risk' },
    { score: 20, expected: 'high-risk' }
  ];
  for (const t of tests) {
    const grade = supplierEvaluator.determineGrade(t.score);
    console.log('   分数', t.score, '→ 等级', grade);
    assert(grade === t.expected, `分数${t.score}应判定为${t.expected}`);
  }
  console.log('   ✅ 通过\n');
}

// 测试7: 完整供应商评估
async function test7() {
  console.log('📋 测试7: 完整供应商评估');
  const input = {
    supplierId: 'SUP001',
    supplierName: '测试供应商',
    qualification: { certifications: ['ISO 9001'], industryExperience: 8 },
    aribaStatus: { status: 'ACTIVE', slpCompletion: 80 },
    financial: { transactionHistory: [{ paymentStatus: 'ON_TIME' }, { paymentStatus: 'ON_TIME' }], businessAge: 10 },
    compliance: { records: [{ status: 'PASS' }, { status: 'PASS' }] },
    esg: { environmental: { iso14001: true }, social: { laborCompliance: true }, governance: { businessEthics: true } }
  };
  const result = await supplierEvaluator.evaluateSupplier(input);
  console.log('   综合评分:', result.overallScore);
  console.log('   评估等级:', result.grade);
  console.log('   决策建议:', result.recommendation.action);
  assert(result.overallScore >= 0 && result.overallScore <= 100, '评分应在0-100范围');
  console.log('   ✅ 通过\n');
}

// 测试8: 批量评估
async function test8() {
  console.log('📋 测试8: 批量供应商评估');
  const suppliers = [
    { supplierId: 'SUP001', supplierName: '供应商A', aribaStatus: { status: 'ACTIVE', slpCompletion: 90 } },
    { supplierId: 'SUP002', supplierName: '供应商B', aribaStatus: { status: 'PENDING', slpCompletion: 50 } },
    { supplierId: 'SUP003', supplierName: '供应商C' }
  ];
  const { results, summary } = await supplierEvaluator.batchEvaluate(suppliers);
  console.log('   评估数量:', summary.total);
  console.log('   平均分:', summary.avgScore);
  assert(results.length === 3, '应有3个结果');
  console.log('   ✅ 通过\n');
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   供应商智能评估Agent - 单元测试');
  console.log('═══════════════════════════════════════════════════════════════\n');
  try {
    await test1(); await test2(); await test3(); await test4();
    await test5(); await test6(); await test7(); await test8();
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ✅ 所有测试通过！');
    console.log('═══════════════════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

runAllTests();
