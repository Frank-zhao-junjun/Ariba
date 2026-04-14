/**
 * 流程执行引擎
 */

const { defaultRegistry } = require('./node-registry');
const { WorkflowParser } = require('./parser');

const NodeStatus = { PENDING: 100, RUNNING: 200, SUCCESS: 300, FAILED: 400, SKIPPED: 600 };
const WorkflowStatus = { CREATED: 'created', RUNNING: 'running', PAUSED: 'paused', COMPLETED: 'completed', FAILED: 'failed', CANCELLED: 'cancelled' };

class WorkflowEngine {
  constructor(options = {}) {
    this.registry = options.registry || defaultRegistry;
    this.parser = options.parser || new WorkflowParser(this.registry);
    this.eventHandlers = new Map();
    this.activeInstances = new Map();
    this.defaultTimeout = options.defaultTimeout || 3600000;
    this.maxRetries = options.maxRetries || 3;
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
    this.eventHandlers.get(event).push(handler);
  }

  async emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Event handler error: ${error.message}`, { event, error });
      }
    }
  }

  async createInstance(workflowConfig, initialInput = {}) {
    const parseResult = this.parser.parse(workflowConfig);
    if (!parseResult.valid) {
      throw new Error(`工作流配置无效: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }

    const workflow = parseResult.workflow;
    const instance = {
      id: this._generateInstanceId(),
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: WorkflowStatus.CREATED,
      variables: { global: { ...workflow.variables.global }, ...initialInput },
      nodeStates: new Map(),
      currentNodeId: null,
      executionHistory: [],
      startTime: null,
      endTime: null,
      error: null,
      workflow
    };

    for (const node of workflow.nodes) {
      instance.nodeStates.set(node.id, {
        id: node.id, status: NodeStatus.PENDING, attempts: 0, startTime: null, endTime: null, input: null, output: null, error: null
      });
    }

    this.activeInstances.set(instance.id, instance);
    await this.emit('instance.created', instance);
    return instance;
  }

  async execute(instanceId) {
    const instance = this.activeInstances.get(instanceId);
    if (!instance) throw new Error(`工作流实例不存在: ${instanceId}`);
    if (instance.status !== WorkflowStatus.CREATED) throw new Error(`工作流实例状态无效: ${instance.status}`);

    instance.status = WorkflowStatus.RUNNING;
    instance.startTime = new Date();
    await this.emit('workflow.started', instance);

    try {
      const startNode = this._findNodeByType(instance, 'start');
      if (!startNode) throw new Error('工作流缺少开始节点');
      await this._executeFromNode(instance, startNode.id);

      if (instance.status === WorkflowStatus.RUNNING) {
        instance.status = WorkflowStatus.COMPLETED;
        instance.endTime = new Date();
        await this.emit('workflow.completed', instance);
      }
    } catch (error) {
      instance.status = WorkflowStatus.FAILED;
      instance.error = { message: error.message, stack: error.stack };
      instance.endTime = new Date();
      await this.emit('workflow.failed', { instance, error });
    }

    await this.emit('instance.finished', instance);
    return { success: instance.status === WorkflowStatus.COMPLETED, instanceId: instance.id, status: instance.status, result: this._formatResult(instance) };
  }

  async _executeFromNode(instance, nodeId) {
    let currentNodeId = nodeId;
    while (currentNodeId && instance.status === WorkflowStatus.RUNNING) {
      const node = this._getNode(instance, currentNodeId);
      if (!node) throw new Error(`节点不存在: ${currentNodeId}`);

      const result = await this._executeNode(instance, node);
      instance.executionHistory.push({ nodeId: currentNodeId, result: result.success ? 'success' : 'failed', timestamp: new Date().toISOString() });

      if (!result.success) throw new Error(`节点执行失败: ${currentNodeId} - ${result.error?.message}`);

      if (result.nextNodeId) {
        currentNodeId = result.nextNodeId;
      } else {
        const nextNode = this._findNextNode(instance, currentNodeId);
        currentNodeId = nextNode ? nextNode.id : null;
      }

      if (currentNodeId) {
        const nextNodeDef = this._getNode(instance, currentNodeId);
        if (nextNodeDef && nextNodeDef.type === 'end') {
          await this._executeNode(instance, nextNodeDef);
          break;
        }
      }
    }
  }

  async _executeNode(instance, node) {
    const nodeState = instance.nodeStates.get(node.id);
    nodeState.status = NodeStatus.RUNNING;
    nodeState.startTime = new Date();
    nodeState.attempts++;
    instance.currentNodeId = node.id;
    await this.emit('node.started', { instance, node, nodeState });

    try {
      const parsedInput = this.parser.parseVariables(node.input || {}, { variables: instance.variables, output: nodeState.output });
      const context = this._createContext(instance, node, nodeState, parsedInput);
      const nodeType = node.nodeType || node.type;
      const handler = this.registry.getHandler(nodeType);
      if (!handler) throw new Error(`未找到节点处理器: ${nodeType}`);

      const result = await this._executeWithTimeout(handler.handler || handler, context, node.timeout || this.defaultTimeout);

      if (result.output && node.outputMapping) {
        this._applyOutputMapping(instance, node, result.output);
      }

      nodeState.status = NodeStatus.SUCCESS;
      nodeState.output = result.output || {};
      nodeState.endTime = new Date();
      await this.emit('node.completed', { instance, node, nodeState, result });

      return { success: true, output: result.output || {}, nextNodeId: result.nextNodeId, nextNodeIds: result.nextNodeIds };
    } catch (error) {
      nodeState.status = NodeStatus.FAILED;
      nodeState.error = { message: error.message, code: error.code, retryable: this._isRetryableError(error) };
      nodeState.endTime = new Date();
      await this.emit('node.error', { instance, node, nodeState, error });

      if (node.retryable && nodeState.attempts < (node.retryConfig?.maxAttempts || this.maxRetries)) {
        const delay = Math.pow(node.retryConfig?.backoffMultiplier || 2, nodeState.attempts - 1) * 1000;
        console.log(`Retrying node ${node.id} in ${delay}ms (attempt ${nodeState.attempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._executeNode(instance, node);
      }

      return { success: false, error: nodeState.error };
    }
  }

  async _executeWithTimeout(fn, context, timeout) {
    return Promise.race([
      fn(context),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`执行超时: ${timeout}ms`)), timeout))
    ]);
  }

  _createContext(instance, node, nodeState, input) {
    return {
      workflowId: instance.workflowId,
      workflowName: instance.workflowName,
      instanceId: instance.id,
      currentNode: node,
      currentNodeId: node.id,
      previousNodeId: instance.executionHistory.length > 0 ? instance.executionHistory[instance.executionHistory.length - 1].nodeId : null,
      input,
      output: nodeState.output || {},
      variables: instance.variables,
      state: instance.status,
      setVariable: (name, value) => { instance.variables[name] = value; },
      getVariable: (name) => instance.variables[name],
      getNodeOutput: (nodeId) => { const state = instance.nodeStates.get(nodeId); return state ? state.output : null; },
      getOutgoingEdges: () => instance.workflow?.outgoingEdges?.get(node.id) || [],
      waitForApproval: async () => ({ approved: true, approvedBy: 'system', approvedAt: new Date().toISOString(), comments: 'Auto-approved' })
    };
  }

  _applyOutputMapping(instance, node, output) {
    for (const [sourceKey, targetPath] of Object.entries(node.outputMapping || {})) {
      if (output[sourceKey] !== undefined) {
        this._setNestedValue(instance.variables, targetPath, output[sourceKey]);
      }
    }
  }

  _setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  _findNodeByType(instance, type) {
    for (const [_, node] of instance.nodeStates) {
      if (node.id && this._getNode(instance, node.id)?.type === type) {
        return this._getNode(instance, node.id);
      }
    }
    return null;
  }

  _getNode(instance, nodeId) {
    return instance.workflow?.nodeMap?.get(nodeId) || null;
  }

  _findNextNode(instance, fromNodeId) {
    const edges = instance.workflow?.outgoingEdges?.get(fromNodeId) || [];
    if (edges.length > 0) return this._getNode(instance, edges[0].to);
    return null;
  }

  _isRetryableError(error) {
    const nonRetryableCodes = ['VALIDATION_ERROR', 'MANUAL_REJECT'];
    return !nonRetryableCodes.includes(error.code);
  }

  _generateInstanceId() {
    return `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _formatResult(instance) {
    return {
      workflowId: instance.workflowId,
      workflowName: instance.workflowName,
      status: instance.status,
      variables: instance.variables,
      executionHistory: instance.executionHistory,
      startTime: instance.startTime,
      endTime: instance.endTime,
      duration: instance.endTime && instance.startTime ? instance.endTime - instance.startTime : null,
      error: instance.error
    };
  }

  getInstance(instanceId) {
    const instance = this.activeInstances.get(instanceId);
    return instance ? this._formatResult(instance) : null;
  }

  async cancel(instanceId) {
    const instance = this.activeInstances.get(instanceId);
    if (!instance) throw new Error(`工作流实例不存在: ${instanceId}`);
    instance.status = WorkflowStatus.CANCELLED;
    instance.endTime = new Date();
    await this.emit('workflow.cancelled', instance);
  }
}

function create(options = {}) {
  return new WorkflowEngine(options);
}

module.exports = { WorkflowEngine, create, NodeStatus, WorkflowStatus };
