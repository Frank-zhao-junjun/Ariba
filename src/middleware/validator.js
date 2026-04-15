/**
 * 请求体验证中间件 - P1-01: 添加请求体验证
 */
const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const projectValidators = {
  create: [body('name').trim().notEmpty().withMessage('项目名称不能为空').isLength({ min: 1, max: 200 }), validate],
  update: [param('id').notEmpty().withMessage('项目ID不能为空'), validate],
  getById: [param('id').notEmpty().withMessage('项目ID不能为空'), validate],
  delete: [param('id').notEmpty().withMessage('项目ID不能为空'), validate]
};

const requirementValidators = {
  analyze: [body('description').trim().notEmpty().withMessage('缺少需求描述').isLength({ min: 5 }), validate],
  interviewStart: [body('industry').optional().trim(), body('modules').optional().trim(), validate],
  interviewNext: [body('sessionId').trim().notEmpty().withMessage('缺少会话ID'), validate],
  match: [body('requirements').isArray({ min: 1 }).withMessage('缺少需求列表'), validate],
  userStories: [body('requirements').isArray({ min: 1 }).withMessage('缺少需求列表'), validate],
  priority: [body('requirements').isArray({ min: 1 }).withMessage('缺少需求列表'), validate],
  peripheral: [body('requirements').isArray({ min: 1 }).withMessage('缺少需求列表'), validate],
  document: [body('requirements').isArray({ min: 1 }).withMessage('缺少需求列表'), validate],
  supplement: [validate],
  conflictCheck: [body('requirements').isArray({ min: 1 }).withMessage('缺少需求列表'), validate]
};

const knowledgeValidators = {
  search: [query('keyword').notEmpty().withMessage('搜索关键词不能为空').isLength({ min: 1, max: 200 }), validate],
  searchPost: [body('query').trim().notEmpty().withMessage('搜索关键词不能为空').isLength({ min: 2 }), validate],
  ask: [body('question').trim().notEmpty().withMessage('问题不能为空').isLength({ min: 5 }), validate],
  getById: [param('id').notEmpty().withMessage('知识ID不能为空'), validate]
};

module.exports = { validate, projectValidators, requirementValidators, knowledgeValidators };
