/**
 * 流程节点注册表
 */

class NodeRegistry {
  constructor() {
    this.handlers = new Map();
    this.nodeDefinitions = new Map();
    this._initializeBuiltInNodes();
  }

  _initializeBuiltInNodes() {
    // 开始节点
    this.register('start', {
      name: '开始节点',
      type: 'start',
      category: 'system',
      handler: async (context) => {
        return { success: true, output: { startedAt: new Date().toISOString() } };
      }
    });

    // 结束节点
    this.register('end', {
      name: '结束节点',
      type: 'end',
      category: 'system',
      handler: async (context) => {
        return { success: true, output: { completedAt: new Date().toISOString() } };
      }
    });

    // 排他网关
    this.register('gateway', {
      name: '排他网关',
      type: 'gateway',
      category: 'flow',
      handler: async (context) => {
        const node = context.currentNode || {};
        const conditions = node.conditions || [];
        
        for (const condition of conditions) {
          if (this._evaluateCondition(condition.expression, context)) {
            return { success: true, output: { selectedCondition: condition.id }, nextNodeId: condition.targetNode };
          }
        }
        return { success: true, output: { selectedCondition: 'default' }, nextNodeId: node.defaultTarget };
      }
    });
  }

  register(nodeType, definition) {
    this.handlers.set(nodeType, { ...definition, registeredAt: new Date().toISOString() });
    this.nodeDefinitions.set(nodeType, definition);
  }

  getHandler(nodeType) {
    return this.handlers.get(nodeType);
  }

  has(nodeType) {
    return this.handlers.has(nodeType);
  }

  _evaluateCondition(expression, context) {
    try {
      const safeEval = new Function('context', `const { variables, output } = context; return !!(${expression});`);
      return safeEval(context);
    } catch (error) {
      return false;
    }
  }
}

const defaultRegistry = new NodeRegistry();

module.exports = { NodeRegistry, defaultRegistry };
