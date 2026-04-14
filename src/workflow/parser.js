/**
 * 流程配置解析器
 */

const { defaultRegistry } = require('./node-registry');

class WorkflowParser {
  constructor(registry = defaultRegistry) {
    this.registry = registry;
    this.errors = [];
    this.warnings = [];
  }

  parse(config) {
    this.errors = [];
    this.warnings = [];

    let workflow;
    if (typeof config === 'string') {
      try {
        workflow = JSON.parse(config);
      } catch (error) {
        this.errors.push({ type: 'parse_error', message: `JSON解析失败: ${error.message}` });
        return { valid: false, errors: this.errors };
      }
    } else {
      workflow = config;
    }

    this._validateStructure(workflow);

    if (this.errors.length > 0) {
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }

    const normalized = this._normalize(workflow);
    return { valid: true, workflow: normalized, warnings: this.warnings };
  }

  _validateStructure(workflow) {
    if (!workflow.id) {
      this.errors.push({ type: 'missing_field', field: 'id', message: '工作流缺少id字段' });
    }
    if (!workflow.name) {
      this.errors.push({ type: 'missing_field', field: 'name', message: '工作流缺少name字段' });
    }
    if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      this.errors.push({ type: 'missing_field', field: 'nodes', message: '工作流缺少nodes节点定义' });
    }
    if (workflow.nodes) {
      this._validateNodes(workflow.nodes);
    }
  }

  _validateNodes(nodes) {
    const nodeIds = new Set();
    let hasStart = false;
    let hasEnd = false;

    for (const node of nodes) {
      if (nodeIds.has(node.id)) {
        this.errors.push({ type: 'duplicate_id', nodeId: node.id, message: `节点ID重复: ${node.id}` });
      }
      nodeIds.add(node.id);
      if (node.type === 'start') hasStart = true;
      if (node.type === 'end') hasEnd = true;
      if (!node.type) {
        this.errors.push({ type: 'missing_field', nodeId: node.id, field: 'type', message: `节点 ${node.id} 缺少type字段` });
      }
    }

    if (!hasStart) {
      this.errors.push({ type: 'missing_start_node', message: '工作流缺少开始节点' });
    }
  }

  _normalize(workflow) {
    const nodeMap = new Map();
    for (const node of workflow.nodes) {
      nodeMap.set(node.id, {
        ...node,
        input: node.input || {},
        outputMapping: node.outputMapping || {},
        timeout: node.timeout || 3600000,
        retryable: node.retryable !== false
      });
    }

    const outgoingEdges = new Map();
    for (const node of workflow.nodes) {
      outgoingEdges.set(node.id, []);
    }
    if (workflow.edges) {
      for (const edge of workflow.edges) {
        if (outgoingEdges.has(edge.from)) {
          outgoingEdges.get(edge.from).push(edge);
        }
      }
    }

    return {
      ...workflow,
      nodes: workflow.nodes,
      nodeMap,
      outgoingEdges,
      settings: { timeout: 604800000, retryEnabled: true, maxRetries: 3, ...workflow.settings },
      variables: { global: workflow.variables?.global || {}, ...workflow.variables }
    };
  }

  parseExpression(expression, context) {
    if (typeof expression !== 'string') return expression;
    const match = expression.match(/^\{\{([^}]+)\}\}$/);
    if (!match) return expression;
    const path = match[1].trim();
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, context);
  }

  parseVariables(obj, context) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.parseVariables(item, context));
    if (typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = typeof value === 'string' ? this.parseExpression(value, context) : this.parseVariables(value, context);
      }
      return result;
    }
    return obj;
  }
}

module.exports = { WorkflowParser };
