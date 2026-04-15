/**
 * 需求分析API路由 v1.7.0
 * 包含增强功能：
 * - RA-F01: 引导式访谈
 * - RA-F02: Ariba能力匹配
 * - RA-F04: 用户故事生成
 * - RA-F05: 优先级评估增强
 * - RA-F06: 周边能力识别
 */

const express = require('express');
const router = express.Router();
const requirementService = require('../services/requirement');
const knowledgeService = require('../services/knowledge');

// ============================================================================
// 基础功能（保留）
// ============================================================================

/**
 * POST /api/requirement/analyze
 * 需求分析
 */
router.post('/analyze', async (req, res) => {
  try {
    const { industry, modules, description, existingRequirements } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, error: '缺少需求描述' });
    }
    const result = await requirementService.analyzeRequirement({
      industry: industry || '通用',
      modules: modules || '采购管理',
      description,
      existingRequirements: existingRequirements || []
    });
    res.json(result);
  } catch (error) {
    console.error('需求分析API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/requirement/templates
 * 获取需求模板列表
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = knowledgeService.getRequirementTemplateList();
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/requirement/supplement
 * 补充需求建议
 */
router.post('/supplement', async (req, res) => {
  try {
    const { industry, modules, currentRequirements } = req.body;
    const result = await requirementService.supplementRequirements({
      industry: industry || '通用',
      modules: modules || '采购管理',
      currentRequirements: currentRequirements || []
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/requirement/conflict-check
 * 冲突检测
 */
router.post('/conflict-check', async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.detectConflicts(requirements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RA-F05: 优先级评估增强 (RICE + KANO)
// ============================================================================

/**
 * POST /api/requirement/priority
 * 优先级评估（增强版）
 * 
 * 请求体：
 * {
 *   "requirements": [
 *     {
 *       "id": "REQ001",
 *       "name": "需求名称",
 *       "description": "需求描述",
 *       "reach": 8,        // 覆盖范围 1-10
 *       "impact": 7,       // 影响程度 1-10
 *       "confidence": 8,   // 置信度 1-10
 *       "effort": 5,       // 工作量 1-10
 *       "kanoType": "基本型需求"  // 可选：KANO分类
 *     }
 *   ]
 * }
 * 
 * 响应：包含RICE评分和KANO分类的优先级列表
 */
router.post('/priority', async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.evaluatePriority(requirements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RA-F01: 引导式访谈功能
// ============================================================================

/**
 * POST /api/requirement/interview/start
 * 开始访谈
 * 
 * 请求体：
 * {
 *   "projectId": "项目ID（可选）",
 *   "industry": "行业",
 *   "modules": "模块",
 *   "context": {}  // 初始上下文
 * }
 * 
 * 响应：访谈会话ID和第一个问题
 */
router.post('/interview/start', async (req, res) => {
  try {
    const { projectId, industry, modules, context } = req.body;
    const result = await requirementService.startInterview({
      projectId,
      industry: industry || '通用',
      modules: modules || '采购管理',
      context
    });
    res.json(result);
  } catch (error) {
    console.error('开始访谈API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/requirement/interview/next
 * 下一个访谈问题
 * 
 * 请求体：
 * {
 *   "sessionId": "访谈会话ID",
 *   "answer": "用户回答",
 *   "skipFollowUp": false  // 是否跳过追问
 * }
 * 
 * 响应：下一问题和进度
 */
router.post('/interview/next', async (req, res) => {
  try {
    const { sessionId, answer, skipFollowUp } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: '缺少会话ID' });
    }
    const result = await requirementService.nextInterviewQuestion({
      sessionId,
      answer,
      skipFollowUp: skipFollowUp || false
    });
    res.json(result);
  } catch (error) {
    console.error('访谈下一问题API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/requirement/interview/:sessionId
 * 获取访谈状态
 * 
 * 参数：sessionId - 访谈会话ID
 * 
 * 响应：当前访谈状态和问题
 */
router.get('/interview/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = requirementService.getInterviewStatus(sessionId);
    res.json(result);
  } catch (error) {
    console.error('获取访谈状态API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/requirement/interview/questions/template
 * 获取访谈问题模板
 */
router.get('/interview/questions/template', async (req, res) => {
  try {
    const template = requirementService.loadInterviewQuestions();
    res.json({
      success: true,
      template: {
        version: template.version,
        stages: template.stages.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          questionCount: s.questions.length
        })),
        frameworks: {
          scqa: template.scqaFramework,
          fiveWtwoH: template.fiveWtwoHFramework,
          kano: template.kanoModel,
          rice: template.riceModel
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RA-F02: Ariba能力匹配
// ============================================================================

/**
 * POST /api/requirement/match
 * Ariba能力匹配
 * 
 * 请求体：
 * {
 *   "requirements": [
 *     {
 *       "id": "REQ001",
 *       "name": "需求名称",
 *       "description": "需求描述"
 *     }
 *   ],
 *   "projectId": "项目ID（可选）"
 * }
 * 
 * 响应：能力匹配结果，包含：
 * - 🟢 原生能力（Ariba原生支持）
 * - 🔴 SAP生态（需要SAP产品配合）
 * - 🔵 第三方集成（需要第三方系统对接）
 * - 🟣 定制开发（需要定制开发）
 */
router.post('/match', async (req, res) => {
  try {
    const { requirements, projectId } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.matchCapabilities({ requirements, projectId });
    res.json(result);
  } catch (error) {
    console.error('能力匹配API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RA-F04: 用户故事生成
// ============================================================================

/**
 * POST /api/requirement/user-stories
 * 生成用户故事
 * 
 * 请求体：
 * {
 *   "requirements": [
 *     {
 *       "id": "REQ001",
 *       "name": "需求名称",
 *       "description": "需求描述",
 *       "priority": "P1",
 *       "effort": "中",
 *       "kano": "期望型需求"
 *     }
 *   ],
 *   "industry": "行业（可选）",
 *   "context": {}  // 上下文信息（可选）
 * }
 * 
 * 响应：用户故事列表和Markdown格式
 */
router.post('/user-stories', async (req, res) => {
  try {
    const { requirements, industry, context } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.generateUserStories({
      requirements,
      industry: industry || '通用',
      context
    });
    res.json(result);
  } catch (error) {
    console.error('用户故事生成API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RA-F06: 周边能力识别
// ============================================================================

/**
 * POST /api/requirement/peripheral
 * 周边能力识别
 * 
 * 请求体：
 * {
 *   "requirements": [
 *     {
 *       "id": "REQ001",
 *       "name": "需求名称",
 *       "description": "需求描述"
 *     }
 *   ]
 * }
 * 
 * 响应：周边能力识别结果，包含：
 * - SAP生态集成需求
 * - 第三方集成需求
 * - 定制开发需求
 * - 成本估算
 * - 建议和风险
 */
router.post('/peripheral', async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.identifyPeripheralCapabilities({ requirements });
    res.json(result);
  } catch (error) {
    console.error('周边能力识别API错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 文档生成（保留）
// ============================================================================

/**
 * POST /api/requirement/document
 * 生成需求文档
 */
router.post('/document', async (req, res) => {
  try {
    const { industry, modules, requirements, conflicts, supplements } = req.body;
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ success: false, error: '缺少需求列表' });
    }
    const result = await requirementService.generateRequirementDocument({
      industry: industry || '通用',
      modules: modules || '采购管理',
      requirements,
      conflicts: conflicts || [],
      supplements: supplements || []
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
