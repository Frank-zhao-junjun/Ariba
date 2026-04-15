/**
 * 知识库路由
 * 提供知识检索、智能问答、知识库管理等功能
 */

const express = require('express');
const router = express.Router();
const knowledgeService = require('../services/knowledge-answer');

/**
 * GET /api/knowledge/stats
 * 知识库统计 - 必须在 /:id 之前定义
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await knowledgeService.getKnowledgeStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计失败: ' + error.message
    });
  }
});

/**
 * GET /api/knowledge/tags
 * 能力标签列表
 */
router.get('/tags', (req, res) => {
  try {
    const tags = knowledgeService.getCapabilityTags();
    
    res.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({
      success: false,
      error: '获取标签失败: ' + error.message
    });
  }
});

/**
 * GET /api/knowledge/modules
 * 模块列表
 */
router.get('/modules', (req, res) => {
  try {
    const modules = knowledgeService.getModuleList();
    
    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('获取模块列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取模块列表失败: ' + error.message
    });
  }
});

/**
 * GET /api/knowledge/search
 * 知识搜索 - 支持关键词搜索和分页
 */
router.get('/search', async (req, res) => {
  try {
    const { keyword, limit = 10, offset = 0 } = req.query;
    
    // 验证keyword参数
    if (!keyword || keyword.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: '缺少keyword参数或关键词为空'
      });
    }
    
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    
    const startTime = Date.now();
    
    // 使用service进行搜索（获取全部结果用于分页）
    const allResults = await knowledgeService.searchKnowledge(keyword.trim(), {
      tags: [],
      modules: [],
      limit: 1000 // 获取足够多的结果用于分页
    });
    
    const total = allResults.length;
    
    // 应用分页
    const paginatedResults = allResults.slice(parsedOffset, parsedOffset + parsedLimit);
    
    // 格式化返回数据
    const formattedResults = paginatedResults.map(item => ({
      id: item.id,
      title: item.title,
      content: item.summary,
      module: item.tags.modules && item.tags.modules.length > 0 ? item.tags.modules[0] : '通用',
      version: item.tags.version || '通用',
      capability: item.tags.capability || '⚪',
      tags: [item.tags.capability, item.tags.version].filter(Boolean),
      createdAt: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      data: {
        total,
        results: formattedResults
      },
      meta: {
        limit: parsedLimit,
        offset: parsedOffset,
        responseTime: Date.now() - startTime
      }
    });
  } catch (error) {
    console.error('知识搜索失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败: ' + error.message
    });
  }
});

/**
 * POST /api/knowledge/search
 * 知识搜索（POST方法兼容）- 支持更复杂的搜索参数
 */
router.post('/search', async (req, res) => {
  try {
    const { query, tags, modules, limit = 10 } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: '搜索关键词不能少于2个字符'
      });
    }
    
    const startTime = Date.now();
    const results = await knowledgeService.searchKnowledge(query, {
      tags: tags || [],
      modules: modules || [],
      limit: Math.min(limit, 50)
    });
    
    res.json({
      success: true,
      query,
      count: results.length,
      results,
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('知识搜索失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败: ' + error.message
    });
  }
});

/**
 * POST /api/knowledge/ask
 * 智能问答
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question || question.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: '问题不能少于5个字符'
      });
    }
    
    const result = await knowledgeService.generateAnswer(question, context || {});
    
    res.json(result);
  } catch (error) {
    console.error('问答生成失败:', error);
    res.status(500).json({
      success: false,
      error: '问答生成失败: ' + error.message
    });
  }
});

/**
 * GET /api/knowledge/:id
 * 获取知识详情 - 必须放在最后
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '缺少知识ID'
      });
    }
    
    const knowledge = await knowledgeService.getKnowledgeById(id);
    
    if (!knowledge) {
      return res.status(404).json({
        success: false,
        error: '未找到指定知识'
      });
    }
    
    res.json({
      success: true,
      knowledge
    });
  } catch (error) {
    console.error('获取知识详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取详情失败: ' + error.message
    });
  }
});

module.exports = router;
