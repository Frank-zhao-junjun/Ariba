/**
 * Harness层 - 主入口文件
 */

const { EventBus, EventTypes, globalEventBus } = require('./event-bus');
const { QualityAssessor } = require('./quality-assessor');
const { BehaviorGuard } = require('./behavior-guard');
const { MemoryGovernor } = require('./memory-governor');
const { StabilityMonitor } = require('./stability-monitor');

class Harness {
  constructor(options = {}) {
    this.eventBus = options.eventBus || globalEventBus;
    
    this.quality = new QualityAssessor({
      eventBus: this.eventBus,
      ...options.qualityOptions
    });
    
    this.behavior = new BehaviorGuard({
      eventBus: this.eventBus,
      ...options.behaviorOptions
    });
    
    this.memory = new MemoryGovernor({
      eventBus: this.eventBus,
      ...options.memoryOptions
    });
    
    this.stability = new StabilityMonitor({
      eventBus: this.eventBus,
      ...options.stabilityOptions
    });
    
    this._initHooks();
  }
  
  _initHooks() {
    this.eventBus.on(EventTypes.QUALITY_ASSESS_COMPLETED, (event) => {
      this._handleQualityReport(event.data);
    });
    
    this.eventBus.on(EventTypes.BEHAVIOR_ACTION_BLOCKED, (event) => {
      this._handleBlockedAction(event.data);
    });
    
    this.eventBus.on(EventTypes.STABILITY_EXCEPTION, (event) => {
      this._handleException(event.data);
    });
  }
  
  async wrapAgentExecution(agent, task) {
    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();
    
    // 执行前检查
    const preCheckResult = await this.preExecutionCheck({
      agentId: agent.id,
      task
    });
    
    if (!preCheckResult.allowed) {
      return {
        success: false,
        reason: 'pre_execution_check_failed',
        details: preCheckResult
      };
    }
    
    // 发布开始事件
    this.eventBus.publish(EventTypes.AGENT_EXECUTION_STARTED, {
      executionId,
      agentId: agent.id,
      task
    });
    
    let result;
    let error = null;
    
    try {
      result = await agent.execute(task);
    } catch (err) {
      error = err;
      
      const errorContext = await this.stability.captureException(err, {
        agentId: agent.id,
        taskId: executionId,
        phase: 'execution',
        inputs: task
      });
      
      const recoveryResult = await this.stability.recover(
        err,
        { type: 'retry', config: { maxRetries: 3 } },
        () => agent.execute(task)
      );
      
      if (recoveryResult.recovered) {
        result = recoveryResult.result;
        error = null;
        
        this.eventBus.publish(EventTypes.STABILITY_RECOVERED, {
          executionId,
          originalError: err.message,
          recoveryStrategy: recoveryResult.strategy
        });
      }
    }
    
    if (!error) {
      await this.memory.remember(
        `execution:${executionId}`,
        { agentId: agent.id, task, result, duration: Date.now() - startTime, success: true },
        { source: 'execution', category: 'experiential', tags: [agent.id, 'success'], confidence: 0.9 }
      );
      
      await this.stability.recordMetric({
        name: 'agent.execution_time',
        value: Date.now() - startTime,
        unit: 'ms',
        tags: { agent_id: agent.id }
      });
      
      if (result) {
        const qualityReport = await this.quality.assessQuality({
          taskType: task.type,
          phase: 'output',
          inputs: result
        });
        
        await this.stability.recordMetric({
          name: 'quality.score',
          value: qualityReport.score,
          unit: 'score',
          tags: { agent_id: agent.id }
        });
      }
      
      this.eventBus.publish(EventTypes.AGENT_EXECUTION_COMPLETED, {
        executionId,
        agentId: agent.id,
        success: true
      });
    }
    
    return {
      success: !error,
      executionId,
      result,
      error: error?.message,
      duration: Date.now() - startTime
    };
  }
  
  async preExecutionCheck(context) {
    const { agentId, task } = context;
    
    const permissionResult = await this.behavior.checkPermission({
      agentId,
      action: task.action || 'execute',
      target: task.target || 'unknown',
      targetType: task.targetType || 'unknown',
      parameters: task.parameters || {},
      timestamp: new Date()
    });
    
    if (!permissionResult.allowed) {
      return { allowed: false, reason: 'permission_denied', details: permissionResult };
    }
    
    const riskLevel = await this.behavior.assessRisk({
      type: task.action || 'execute',
      agentId,
      parameters: task.parameters || {}
    });
    
    if (riskLevel.level === 'critical') {
      return { allowed: false, reason: 'risk_too_high', details: riskLevel };
    }
    
    const interceptResult = await this.behavior.interceptDangerous({
      type: task.action || 'execute',
      agentId,
      parameters: task.parameters || {}
    });
    
    if (interceptResult.blocked) {
      return {
        allowed: false,
        reason: 'action_blocked',
        details: interceptResult
      };
    }
    
    return { allowed: true, riskLevel, requiresConfirmation: interceptResult.confirmationRequired };
  }
  
  async getHealthStatus() {
    return await this.stability.getHealthStatus();
  }
  
  async getStats() {
    const memoryStats = await this.memory.getStats();
    const errorStats = this.stability.getErrorStats();
    const activeAlerts = this.stability.getActiveAlerts();
    
    return {
      memory: memoryStats,
      errors: errorStats,
      alerts: { active: activeAlerts.length, details: activeAlerts },
      quality: { totalRules: this.quality.getRules().length }
    };
  }
  
  _handleQualityReport(report) {
    if (report.level === 'critical' || report.level === 'warning') {
      this.memory.remember(
        `quality_issue:${report.id}`,
        { context: report.context, score: report.score, findings: report.findings },
        { source: 'quality_assessment', category: 'experiential', tags: ['quality_issue'], confidence: report.score / 100 }
      );
    }
  }
  
  _handleBlockedAction(data) {
    this.memory.remember(
      `blocked_action:${Date.now()}`,
      { action: data.action, reason: data.result.reason },
      { source: 'behavior_guard', category: 'experiential', tags: ['blocked', 'security'], confidence: 1.0 }
    );
  }
  
  _handleException(errorContext) {
    this.memory.remember(
      `error:${errorContext.errorId}`,
      {
        errorType: errorContext.errorType,
        message: errorContext.message,
        agentId: errorContext.agentId,
        stack: errorContext.stack
      },
      { source: 'exception', category: 'experiential', tags: ['error', errorContext.errorType.toLowerCase()], confidence: 1.0 }
    );
  }
}

const defaultHarness = new Harness();

module.exports = {
  Harness,
  defaultHarness,
  EventBus,
  EventTypes,
  globalEventBus,
  QualityAssessor,
  BehaviorGuard,
  MemoryGovernor,
  StabilityMonitor
};
