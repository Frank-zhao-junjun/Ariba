/**
 * 智能合同摘要生成器测试
 */

const {
  generateContractSummary,
  generateBriefSummary,
  getDemoSummary
} = require('../src/services/contractSummary');

// 测试合同文本
const TEST_CONTRACT = `
采购框架协议

甲方：博世（中国）投资有限公司
乙方：华南电子科技有限公司

一、合同金额
本合同总金额为人民币贰佰万元整（¥2,000,000）

二、付款条件
甲方应在本合同签订后5个工作日内支付合同总金额的30%作为预付款，即人民币陆拾万元整。剩余70%的款项在甲方验收合格后15个工作日内支付。

三、交货期限
乙方应在本合同生效后6个月内完成全部货物的交付。

四、质量保证
乙方对所供货物提供12个月的质量保证期，自到货之日起计算。

五、违约责任
如乙方未能按约定时间交付，每延迟一天，应向甲方支付合同总金额0.5%的违约金。

六、争议解决
因本合同引起的任何争议，双方应友好协商解决；协商不成的，提交甲方所在地人民法院管辖。
`;

// 测试1：生成完整摘要
async function testGenerateSummary() {
  console.log('\n📋 测试1: 生成完整合同摘要');
  console.log('='.repeat(50));
  
  const result = await generateContractSummary(TEST_CONTRACT);
  
  if (result.success) {
    console.log('✅ 摘要生成成功');
    console.log('\n📝 一句话摘要:', result.data.summary);
    console.log('\n📊 合同概览:', JSON.stringify(result.data.overview, null, 2));
    console.log('\n⚠️ 风险提示:');
    result.data.risks.forEach(risk => {
      console.log(`  [${risk.level.toUpperCase()}] ${risk.description}`);
      console.log(`     建议: ${risk.suggestion}`);
    });
  } else {
    console.log('❌ 摘要生成失败:', result.error);
  }
  
  return result.success;
}

// 测试2：生成简短摘要
async function testBriefSummary() {
  console.log('\n📋 测试2: 生成简短摘要');
  console.log('='.repeat(50));
  
  const result = await generateBriefSummary(TEST_CONTRACT);
  
  if (result.success) {
    console.log('✅ 简短摘要生成成功');
    console.log('\n📝 简短摘要:', result.brief);
  } else {
    console.log('❌ 简短摘要生成失败:', result.error);
  }
  
  return result.success;
}

// 测试3：获取演示数据
async function testDemo() {
  console.log('\n📋 测试3: 获取演示数据');
  console.log('='.repeat(50));
  
  const result = getDemoSummary();
  
  if (result.success) {
    console.log('✅ 演示数据获取成功');
    console.log('\n📝 一句话摘要:', result.data.summary);
    console.log('\n📊 关键条款数:', result.data.key_clauses.length);
    console.log('\n⚠️ 风险数量:', result.data.risks.length);
  } else {
    console.log('❌ 演示数据获取失败');
  }
  
  return result.success;
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始测试合同摘要生成器 v1.6');
  console.log('='.repeat(50));
  
  const results = [];
  
  results.push(await testDemo());
  results.push(await testBriefSummary());
  results.push(await testGenerateSummary());
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`通过: ${results.filter(r => r).length}/${results.length}`);
  
  if (results.every(r => r)) {
    console.log('\n✅ 所有测试通过!');
    process.exit(0);
  } else {
    console.log('\n⚠️ 部分测试失败');
    process.exit(1);
  }
}

// 执行测试
runTests();
