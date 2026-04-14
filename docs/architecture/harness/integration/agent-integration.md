# Agent服务集成方案

> 版本：v1.0.0  
> 更新日期：2024-04-14

---

## 一、集成概述

Agent服务是Ariba实施助手的核心执行单元，通过Harness层提供的包装器，可以添加质量评估、行为规范、记忆治理和稳定保障功能。

---

## 二、包装器实现

### 2.1 Agent包装器

```javascript
const { Harness } = require('../../docs/architecture/harness/implementation');
const { EventTypes } = require('../../docs/architecture/harness/implementation/event-bus');

class HarnessAgentWrapper {
  constructor(agent, options = {}) {
    this.agent = agent;
    this.agentId = agent.id || `agent-${Date.now()}`;
    this.harness = options.harness || new Harness();
    this.options = {
      enablePreCheck: options.enablePreCheck !== false,
      enablePostCheck: options.enablePostCheck !== false,
      enableMemoryStorage: options.enableMemoryStorage !== false,
      enableMetrics: options.enableMetrics !== false,
      ...options
    };
    this._setupEventListeners();
  }
  
  async execute(task) {
    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();
    
    // 执行前检查
    if (this.options.enablePreCheck) {
      const preCheckResult = await this._preExecutionCheck(task);
      if (!preCheckResult.allowed) {
        return { success: false, reason: preCheckResult.reason, details: preCheckResult.details };
      }
    }
    
    this.harness.eventBus.publish(EventTypes.AGENT_EXECUTION_STARTED, {
      executionId, agentId: this.agentId, task
    });
    
    let result;
    let error = null;
    
    try {
      result = await this.agent.execute(task);
      
      if (this.options.enablePostCheck) {
        await this._postExecutionProcess(task, result);
      }
      
      if (this.options.enableMemoryStorage) {
        await this._storeExecutionMemory(executionId, task, result, startTime);
      }
      
      if (this.options.enableMetrics) {
        await this._recordExecutionMetrics(executionId, startTime);
      }
      
    } catch (err) {
      error = err;
      await this._handleExecutionError(executionId, task, err);
    }
    
    return {
      success: !error,
      executionId,
      result: error ? null : result,
      error: error?.message,
      duration: Date.now() - startTime
    };
  }
  
  async _preExecutionCheck(task) {
    const permResult = await this.harness.behavior.checkPermission({
      agentId: this.agentId,
      action: task.action || 'execute',
      target: task.target || 'unknown',
      parameters: task.parameters || {}
    });
    
    if (!permResult.allowed) {
      return { allowed: false, reason: 'permission_denied', details: permResult };
    }
    
    const riskLevel = await this.harness.behavior.assessRisk({
      type: task.action || 'execute',
      agentId: this.agentId,
      parameters: task.parameters || {}
    });
    
    if (riskLevel.level === 'critical') {
      return { allowed: false, reason: 'risk_too_high', details: riskLevel };
    }
    
    const interceptResult = await this.harness.behavior.interceptDangerous({
      type: task.action || 'execute',
      agentId: this.agentId,
      parameters: task.parameters || {}
    });
    
    if (interceptResult.blocked) {
      return { allowed: false, reason: 'action_blocked', details: interceptResult };
    }
    
    return { allowed: true, riskLevel, requiresConfirmation: interceptResult.confirmationRequired };
  }
  
  async _postExecutionProcess(task, result) {
    if (result) {
      const qualityReport = await this.harness.quality.assessQuality({
        taskType: task.type,
        phase: 'output',
        inputs: result
      });
      
      if (qualityReport.level === 'warning' || qualityReport.level === 'critical') {
        console.warn(`[Quality Warning] ${task.type}: ${qualityReport.score}分`);
      }
    }
  }
  
  async _storeExecutionMemory(executionId, task, result, startTime) {
    await this.harness.memory.remember(
      `execution:${executionId}`,
      { agentId: this.agentId, task, result, duration: Date.now() - startTime, success: true },
      { source: 'execution', category: 'experiential', tags: [this.agentId, 'success'], confidence: 0.9 }
    );
  }
  
  async _recordExecutionMetrics(executionId, startTime) {
    await this.harness.stability.recordMetric({
      name: 'agent.execution_time',
      value: Date.now() - startTime,
      unit: 'ms',
      tags: { agent_id: this.agentId }
    });
  }
  
  async _handleExecutionError(executionId, task, error) {
    const errorContext = await this.harness.stability.captureException(error, {
      agentId: this.agentId,
      taskId: executionId,
      phase: 'execution'
    });
    
    const recoveryResult = await this.harness.stability.recover(
      error,
      { type: 'retry', config: { maxRetries: 3 } },
      () => this.agent.execute(task)
    );
    
    await this.harness.memory.remember(
      `error:${executionId}`,
      { agentId: this.agentId, task, error: error.message, errorType: errorContext.errorType },
      { source: 'error', category: 'experiential', tags: [this.agentId, 'error'], confidence: 1.0 }
    );
  }
  
  _setupEventListeners() {
    this.harness.eventBus.on(EventTypes.QUALITY_CHECK_FAILED, (event) => {
      console.warn(`[Quality Failed] Agent ${this.agentId}`);
    });
    
    this.harness.eventBus.on(EventTypes.BEHAVIOR_ACTION_BLOCKED, (event) => {
      console.warn(`[Action Blocked] Agent ${this.agentId}`);
    });
  }
  
  async getExecutionHistory(limit = 100) {
    const memories = await this.harness.memory.recall({
      tags: [this.agentId],
      category: 'experiential',
      limit
    });
    return memories.map(r => r.memory.value);
  }
  
  async getStats() {
    const errorStats = this.harness.stability.getErrorStats();
    const agentErrors = errorStats.byAgent[this.agentId] || { total: 0 };
    return {
      agentId: this.agentId,
      errors: agentErrors,
      successRate: agentErrors.total > 0 ? 100 - (agentErrors.total / errorStats.total * 100) : 100
    };
  }
}
```

---

## 三、使用示例

```javascript
const { Harness } = require('../../docs/architecture/harness/implementation');
const { HarnessAgentWrapper } = require('./harness-wrapper');

const harness = new Harness();

const wrappedAgent = new HarnessAgentWrapper(originalDataAgent, {
  harness,
  enablePreCheck: true,
  enablePostCheck: true,
  enableMemoryStorage: true,
  enableMetrics: true
});

async function main() {
  const result = await wrappedAgent.execute({
    type: 'query',
    action: 'query_pr_status',
    parameters: { prId: '12345' }
  });
  
  console.log('执行结果:', result);
  console.log('Agent统计:', await wrappedAgent.getStats());
}
```

---

*文档版本：v1.0.0 | 最后更新：2024-04-14*
