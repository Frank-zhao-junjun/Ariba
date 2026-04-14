/**
 * 测试脚本
 */

const logger = require('../src/utils/logger');
const { handleMessage } = require('../src/webhook');

const testCases = [
  { name: '查询采购申请状态', input: 'PR12345到哪了' },
  { name: '查询采购订单状态', input: 'PO98765什么状态' },
  { name: '查询审批流程', input: '审批流程是什么' },
  { name: '查询审批时间', input: '审批要多久' },
  { name: '查询如何提交', input: '如何提交采购申请' },
  { name: '查询驳回原因', input: '为什么被驳回' },
  { name: '获取帮助', input: '帮助' },
  { name: '设置提醒', input: '提醒我' },
  { name: '默认查询', input: '12345' },
  { name: '无法识别', input: '今天天气怎么样' }
];

async function runTests() {
  logger.info('开始运行测试...');
  let passed = 0, failed = 0;
  for (const testCase of testCases) {
    try {
      logger.info(`测试: ${testCase.name}`);
      const response = await handleMessage(testCase.input, 'test_user');
      logger.info(`输出: ${response.substring(0, 80)}...`);
      logger.info(`状态: ✅ 通过`);
      passed++;
    } catch (error) {
      logger.error(`测试失败: ${testCase.name}`, { error: error.message });
      failed++;
    }
  }
  logger.info('测试完成', { passed, failed, total: testCases.length });
}

runTests().catch(error => {
  logger.error('测试执行异常', { error: error.message });
  process.exit(1);
});
