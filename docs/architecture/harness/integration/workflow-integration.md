# 工作流引擎集成方案

> 版本：v1.0.0  
> 更新日期：2024-04-14

---

## 一、集成概述

Harness层与工作流引擎的集成采用AOP（面向切面编程）模式，通过钩子函数注入Harness的各项功能。

### 1.1 钩子类型

| 钩子名称 | 执行时机 | 用途 |
|----------|----------|------|
| `beforeCreate` | 创建工作流实例前 | 权限检查、参数验证 |
| `afterCreate` | 创建工作流实例后 | 记录日志、初始化上下文 |
| `beforeExecute` | 执行节点前 | 质量预检、风险评估 |
| `afterExecute` | 执行节点后 | 质量评估、记忆存储 |
| `onError` | 执行出错时 | 异常捕获、错误恢复 |
| `onComplete` | 工作流完成时 | 结果汇总、经验提取 |

---

## 二、集成代码示例

### 2.1 扩展工作流引擎

```javascript
const { WorkflowEngine } = require('./engine');
const { Harness } = require('../../docs/architecture/harness/implementation');

class HarnessAwareWorkflowEngine extends WorkflowEngine {
  constructor(options = {}) {
    super(options);
    this.harness = options.harness || new Harness();
    this._registerHarnessHooks();
  }
  
  _registerHarnessHooks() {
    // 执行前钩子
    this.on('node.starting', async (data) => {
      const qualityContext = {
        taskType: data.node.type,
        phase: 'pre_execution',
        inputs: data.nodeState.input
      };
      
      const qualityReport = await this.harness.quality.assessQuality(qualityContext);
      
      if (qualityReport.level === 'critical') {
        console.warn(`节点 ${data.node.id} 预检发现问题`);
      }
    });
    
    // 执行后钩子
    this.on('node.completed', async (data) => {
      await this.harness.memory.remember(
        `node_output:${data.instance.id}:${data.node.id}`,
        { output: data.nodeState.output, qualityScore: qualityReport.score },
        { source: 'execution', category: 'experiential', tags: ['workflow'] }
      );
    });
    
    // 错误钩子
    this.on('node.error', async (data) => {
      await this.harness.stability.captureException(data.error, {
        agentId: 'workflow-engine',
        taskId: `${data.instance.id}:${data.node.id}`,
        phase: 'execution'
      });
      
      await this.harness.stability.recover(
        data.error,
        { type: 'retry', config: { maxRetries: 2 } },
        () => this._retryNode(data.instance, data.node)
      );
    });
    
    // 完成钩子
    this.on('workflow.completed', async (instance) => {
      const experiences = await this.harness.memory.extractExperience(instance.id);
      await this.harness.memory.remember(
        `workflow:${instance.id}`,
        { workflowId: instance.workflowId, duration: instance.endTime - instance.startTime, experiences },
        { source: 'execution', category: 'experiential', tags: ['workflow', 'completed'] }
      );
    });
  }
}
```

---

## 三、使用示例

```javascript
const { HarnessAwareWorkflowEngine } = require('./harness-workflow-engine');

const engine = new HarnessAwareWorkflowEngine({
  hooksConfig: {
    enableQualityCheck: true,
    enableBehaviorGuard: true,
    enableMemoryGovernance: true,
    enableStabilityMonitor: true
  }
});

async function main() {
  const instance = await engine.createInstance(workflowConfig, { inputData: 'test' });
  const result = await engine.execute(instance.id);
  
  const stats = await engine.harness.getStats();
  console.log('Harness统计:', stats);
}
```

---

*文档版本：v1.0.0 | 最后更新：2024-04-14*
