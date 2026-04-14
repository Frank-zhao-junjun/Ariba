/**
 * 工作流引擎单元测试
 */

const assert = require('assert');
const { WorkflowEngine, NodeRegistry, WorkflowParser, NodeStatus, WorkflowStatus } = require('../../src/workflow');

console.log('Running workflow engine tests...\n');

// Test 1: WorkflowParser
console.log('Test 1: WorkflowParser - parse valid config');
try {
  const parser = new WorkflowParser();
  const config = {
    id: 'test-workflow-001',
    name: '测试工作流',
    nodes: [{ id: 'start', type: 'start', name: '开始' }, { id: 'end', type: 'end', name: '结束' }]
  };
  const result = parser.parse(config);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.workflow.id, 'test-workflow-001');
  console.log('  PASS\n');
} catch (err) {
  console.error('  FAIL:', err.message, '\n');
}

// Test 2: NodeRegistry
console.log('Test 2: NodeRegistry - register custom node');
try {
  const registry = new NodeRegistry();
  registry.register('custom-node', { name: 'Custom', handler: async () => ({ success: true, output: {} }) });
  assert.strictEqual(registry.has('custom-node'), true);
  console.log('  PASS\n');
} catch (err) {
  console.error('  FAIL:', err.message, '\n');
}

// Test 3: Sequential execution
console.log('Test 3: WorkflowEngine - sequential execution');
(async () => {
  try {
    let executionOrder = [];
    const engine = new WorkflowEngine();
    
    engine.registry.register('task-1', {
      name: 'Task 1', handler: async () => { executionOrder.push('task-1'); return { success: true, output: { step1Done: true } }; }
    });
    engine.registry.register('task-2', {
      name: 'Task 2', handler: async () => { executionOrder.push('task-2'); return { success: true, output: { step2Done: true } }; }
    });
    
    const config = {
      id: 'sequential-workflow', name: '顺序流程',
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'task1', type: 'task', nodeType: 'task-1' },
        { id: 'task2', type: 'task', nodeType: 'task-2' },
        { id: 'end', type: 'end' }
      ],
      edges: [
        { from: 'start', to: 'task1' },
        { from: 'task1', to: 'task2' },
        { from: 'task2', to: 'end' }
      ]
    };
    
    const instance = await engine.createInstance(config);
    const result = await engine.execute(instance.id);
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(executionOrder, ['task-1', 'task-2']);
    console.log('  PASS\n');
  } catch (err) {
    console.error('  FAIL:', err.message, '\n');
  }
})();

// Test 4: Variable passing
console.log('Test 4: WorkflowEngine - variable passing');
(async () => {
  try {
    let capturedValue;
    const engine = new WorkflowEngine();
    
    engine.registry.register('source-node', {
      name: 'Source', handler: async (ctx) => { ctx.setVariable('calculated', 42); return { success: true, output: { value: 42 } }; }
    });
    engine.registry.register('target-node', {
      name: 'Target', handler: async (ctx) => { capturedValue = ctx.getVariable('calculated'); return { success: true, output: {} }; }
    });
    
    const config = {
      id: 'var-passing', name: '变量传递',
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'source', type: 'task', nodeType: 'source-node' },
        { id: 'target', type: 'task', nodeType: 'target-node' },
        { id: 'end', type: 'end' }
      ],
      edges: [{ from: 'start', to: 'source' }, { from: 'source', to: 'target' }, { from: 'target', to: 'end' }]
    };
    
    const instance = await engine.createInstance(config);
    await engine.execute(instance.id);
    assert.strictEqual(capturedValue, 42);
    console.log('  PASS\n');
  } catch (err) {
    console.error('  FAIL:', err.message, '\n');
  }
})();

// Test 5: Conditional branch
console.log('Test 5: WorkflowEngine - conditional branch');
(async () => {
  try {
    let executedPath = '';
    const engine = new WorkflowEngine();
    
    engine.registry.register('check-node', {
      name: 'Check', handler: async (ctx) => { ctx.setVariable('budget', 150000); return { success: true, output: {} }; }
    });
    engine.registry.register('high-path', {
      name: 'High', handler: async () => { executedPath = 'high'; return { success: true, output: {} }; }
    });
    
    const config = {
      id: 'conditional', name: '条件流程',
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'check', type: 'task', nodeType: 'check-node' },
        {
          id: 'gateway', type: 'gateway', gatewayType: 'exclusive',
          conditions: [
            { id: 'high', expression: 'variables.budget > 100000', targetNode: 'high-branch' },
            { id: 'low', expression: 'variables.budget <= 100000', targetNode: 'end' }
          ]
        },
        { id: 'high-branch', type: 'task', nodeType: 'high-path' },
        { id: 'end', type: 'end' }
      ],
      edges: [
        { from: 'start', to: 'check' },
        { from: 'check', to: 'gateway' },
        { from: 'gateway', to: 'high-branch', condition: 'high' },
        { from: 'gateway', to: 'end', condition: 'low' },
        { from: 'high-branch', to: 'end' }
      ]
    };
    
    const instance = await engine.createInstance(config);
    await engine.execute(instance.id);
    assert.strictEqual(executedPath, 'high');
    console.log('  PASS\n');
  } catch (err) {
    console.error('  FAIL:', err.message, '\n');
  }
})();

// Test 6: Bid Analysis Agent integration
console.log('Test 6: Bid Analysis Agent integration');
(async () => {
  try {
    const engine = new WorkflowEngine();
    
    engine.registry.register('bid-analysis-agent', {
      name: 'Bid Analysis Agent', type: 'task',
      handler: async (ctx) => {
        const { quotes } = ctx.input;
        const rankings = quotes.map(q => ({ supplier: q.supplier, score: q.totalPrice < 120000 ? 95 : 85 })).sort((a, b) => b.score - a.score);
        return { success: true, output: { rankings, recommendedSupplier: rankings[0]?.supplier } };
      }
    });
    
    const config = {
      id: 'bid-analysis', name: '竞标分析流程',
      nodes: [
        { id: 'start', type: 'start' },
        {
          id: 'analyze', type: 'task', nodeType: 'bid-analysis-agent',
          input: {
            quotes: [
              { supplier: 'SupplierA', totalPrice: 125000 },
              { supplier: 'SupplierB', totalPrice: 118000 }
            ]
          }
        },
        { id: 'end', type: 'end' }
      ],
      edges: [{ from: 'start', to: 'analyze' }, { from: 'analyze', to: 'end' }]
    };
    
    const instance = await engine.createInstance(config);
    const result = await engine.execute(instance.id);
    assert.strictEqual(result.success, true);
    assert.strictEqual(instance.variables.recommendedSupplier, 'SupplierB');
    console.log('  PASS\n');
  } catch (err) {
    console.error('  FAIL:', err.message, '\n');
  }
})();

// Test 7: Cancel workflow
console.log('Test 7: WorkflowEngine - cancel workflow');
(async () => {
  try {
    const engine = new WorkflowEngine();
    const config = {
      id: 'cancel-test', name: '取消测试',
      nodes: [{ id: 'start', type: 'start' }, { id: 'end', type: 'end' }],
      edges: [{ from: 'start', to: 'end' }]
    };
    const instance = await engine.createInstance(config);
    await engine.cancel(instance.id);
    assert.strictEqual(engine.getInstance(instance.id).status, WorkflowStatus.CANCELLED);
    console.log('  PASS\n');
  } catch (err) {
    console.error('  FAIL:', err.message, '\n');
  }
})();

console.log('All tests completed!\n');
