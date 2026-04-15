/**
 * 采购申请FAQ助手路由
 * 
 * 提供即时问答、政策咨询、操作指导功能
 */

const express = require('express');
const router = express.Router();
const prFaqKnowledge = require('../services/pr-faq-knowledge');

/**
 * POST /api/pr-faq/ask
 * 问答接口
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.json({
        success: false,
        error: '请输入您的问题'
      });
    }

    // 搜索匹配的问题
    const matchedFaqs = prFaqKnowledge.search(question, 3);
    
    if (matchedFaqs.length === 0) {
      return res.json({
        success: true,
        answer: '抱歉，我暂时无法回答这个问题。\n\n您可以：\n1. 尝试换一种表述方式\n2. 联系采购部门：procurement@company.com\n3. 查看Ariba操作手册',
        category: 'unknown',
        confidence: 0,
        suggestions: [
          '审批流程是什么',
          '需要哪些附件',
          '如何选择供应商'
        ]
      });
    }

    // 返回最佳匹配
    const bestMatch = matchedFaqs[0];
    const confidence = Math.min(100, matchedFaqs[0].score || 80);
    
    // 判断分类
    let category = bestMatch.category;
    if (category === 'policy') category = 'policy';
    else if (category === 'process') category = 'process';
    else if (category === 'operation') category = 'operation';
    else category = 'system';

    res.json({
      success: true,
      answer: bestMatch.answer,
      category: category,
      confidence: confidence,
      source: 'knowledge_base',
      sourceId: bestMatch.id,
      relatedQuestions: matchedFaqs.slice(1).map(f => f.question)
    });

  } catch (error) {
    console.error('PR FAQ Error:', error);
    res.status(500).json({
      success: false,
      error: '服务异常，请稍后重试'
    });
  }
});

/**
 * GET /api/pr-faq/categories
 * 获取所有分类
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = prFaqKnowledge.getCategories();
    
    const categoryNames = {
      'policy': '采购政策',
      'process': '流程指引',
      'operation': '操作指南',
      'system': '系统使用'
    };

    const categoryList = categories.map(cat => ({
      id: cat,
      name: categoryNames[cat] || cat,
      count: prFaqKnowledge.getByCategory(cat).length
    }));

    res.json({
      success: true,
      categories: categoryList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/pr-faq/popular
 * 获取热门问题
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const popular = prFaqKnowledge.getPopular(limit);
    
    res.json({
      success: true,
      questions: popular
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/pr-faq/by-category/:category
 * 按分类获取FAQ
 */
router.get('/by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const faqs = prFaqKnowledge.getByCategory(category);
    
    res.json({
      success: true,
      category: category,
      count: faqs.length,
      faqs: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/pr-faq/:id
 * 获取单个FAQ详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faq = prFaqKnowledge.getById(id);
    
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ不存在'
      });
    }
    
    res.json({
      success: true,
      faq: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
