/**
 * Ariba项目实施助手 - 测试文件
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const TIMEOUT = 10000;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(TIMEOUT, () => { req.destroy(); reject(new Error('Request timeout')); });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('Ariba项目实施助手 - 测试套件');
  console.log('='.repeat(50));
  console.log('');

  let passed = 0, failed = 0;

  const tests = [
    { name: '健康检查', fn: async () => {
      const res = await request('GET', '/health');
      return res.status === 200 && res.body.status === 'healthy';
    }},
    { name: 'API文档', fn: async () => {
      const res = await request('GET', '/api');
      return res.status === 200 && res.body.service === 'Ariba项目实施助手 API';
    }},
    { name: '需求模板列表', fn: async () => {
      const res = await request('GET', '/api/requirement/templates');
      return res.status === 200 && res.body.success && res.body.templates.length > 0;
    }},
    { name: '需求分析', fn: async () => {
      const res = await request('POST', '/api/requirement/analyze', {
        industry: '制造业', modules: '采购管理', description: '测试需求'
      });
      return res.status === 200 && res.body.success && res.body.requirements.length > 0;
    }},
    { name: '需求补充', fn: async () => {
      const res = await request('POST', '/api/requirement/supplement', {
        industry: '制造业', modules: '采购管理', currentRequirements: []
      });
      return res.status === 200 && res.body.success;
    }},
    { name: '冲突检测', fn: async () => {
      const res = await request('POST', '/api/requirement/conflict-check', {
        requirements: [{ id: 'REQ-001', description: '必须启用审批' }, { id: 'REQ-002', description: '禁止启用审批' }]
      });
      return res.status === 200 && res.body.success;
    }},
    { name: '优先级评估', fn: async () => {
      const res = await request('POST', '/api/requirement/priority', {
        requirements: [{ id: 'REQ-001', businessValue: 8, complexity: 5 }]
      });
      return res.status === 200 && res.body.success;
    }},
    { name: '蓝图模板列表', fn: async () => {
      const res = await request('GET', '/api/blueprint/templates');
      return res.status === 200 && res.body.success && res.body.templates.length > 0;
    }},
    { name: 'User Stories生成', fn: async () => {
      const res = await request('POST', '/api/blueprint/generate', {
        requirements: [{ id: 'REQ-001', name: '采购申请', module: '采购申请', priority: 'P0', businessValue: 8, complexity: 5 }],
        industry: '制造业', processType: '采购流程'
      });
      return res.status === 200 && res.body.success && res.body.userStories.length > 0;
    }},
    { name: '流程图生成', fn: async () => {
      const res = await request('POST', '/api/blueprint/flowchart', { processType: '采购流程', industry: '制造业' });
      return res.status === 200 && res.body.success && res.body.flowchart.includes('ascii');
    }},
    { name: '蓝图文档生成', fn: async () => {
      const res = await request('POST', '/api/blueprint/document', {
        requirements: [{ id: 'REQ-001', name: '采购申请', module: '采购申请', priority: 'P0', businessValue: 8, complexity: 5 }],
        industry: '制造业', processType: '采购流程'
      });
      return res.status === 200 && res.body.success && res.body.markdown.includes('# 蓝图设计文档');
    }},
    { name: 'INVEST验证', fn: async () => {
      const res = await request('POST', '/api/blueprint/validate', {
        userStories: [{ id: 'US-001', title: '测试', estimatedHours: 8, acceptanceCriteria: ['标准1'] }]
      });
      return res.status === 200 && res.body.success;
    }},
    { name: '验收标准生成', fn: async () => {
      const res = await request('POST', '/api/blueprint/criteria', {
        userStory: { id: 'US-001', title: '测试' }
      });
      return res.status === 200 && res.body.success;
    }},
    { name: '404处理', fn: async () => {
      const res = await request('GET', '/not-exist');
      return res.status === 404 && res.body.error === 'Not found';
    }}
  ];

  for (const test of tests) {
    try {
      process.stdout.write(`📋 ${test.name}... `);
      const result = await test.fn();
      if (result) {
        console.log('✅ 通过');
        passed++;
      } else {
        console.log('❌ 失败');
        failed++;
      }
    } catch (e) {
      console.log(`❌ 失败: ${e.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('测试结果汇总');
  console.log('='.repeat(50));
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📊 总计: ${passed + failed}`);
  console.log('');
  console.log(failed === 0 ? '🎉 所有测试通过！' : '⚠️ 部分测试失败，请检查。');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error('测试执行失败:', err); process.exit(1); });
