/**
 * 工作流编排模块
 */

const { NodeRegistry, defaultRegistry } = require('./node-registry');
const { WorkflowParser } = require('./parser');
const { WorkflowEngine, create, NodeStatus, WorkflowStatus } = require('./engine');

module.exports = {
  WorkflowEngine,
  Engine: WorkflowEngine,
  NodeRegistry,
  WorkflowParser,
  create,
  createEngine: create,
  defaultRegistry,
  NodeStatus,
  WorkflowStatus
};
