/**
 * Ariba项目实施助手 v1.0
 * 主入口文件
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./utils/logger');
const requirementRouter = require('./routes/requirement');
const blueprintRouter = require('./routes/blueprint');
const bidAnalysisRouter = require('./routes/bidAnalysis');
const contractRouter = require('./routes/contract');
const knowledgeService = require('./services/knowledge');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  logger.info('收到请求', { 
    method: req.method, 
    path: req.path,
    ip: req.ip
  });
  next();
});

// 静态文件
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/api/requirement', requirementRouter);
app.use('/api/blueprint', blueprintRouter);
app.use('/api/bid-analysis', bidAnalysisRouter);
app.use('/api/contract', contractRouter);

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 需求分析页面
app.get('/requirement', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/requirement.html'));
});

// 蓝图设计页面
app.get('/blueprint', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/blueprint.html'));
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Ariba项目实施助手',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    service: 'Ariba项目实施助手 API',
    version: '1.0.0',
    endpoints: {
      requirement: {
        'POST /api/requirement/analyze': '分析用户需求',
        'GET /api/requirement/templates': '获取需求模板列表',
        'POST /api/requirement/supplement': '智能补充需求',
        'POST /api/requirement/conflict-check': '需求冲突检测',
        'POST /api/requirement/priority': '需求优先级评估',
        'POST /api/requirement/document': '生成需求文档'
      },
      blueprint: {
        'GET /api/blueprint/templates': '获取蓝图模板列表',
        'POST /api/blueprint/generate': '生成User Stories',
        'POST /api/blueprint/validate': '验证INVEST原则',
        'POST /api/blueprint/criteria': '生成验收标准',
        'POST /api/blueprint/flowchart': '生成流程图',
        'POST /api/blueprint/document': '生成完整蓝图文档'
      }
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error('未处理的错误', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    success: false,
    error: 'Internal server error'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Not found', 
    path: req.path
  });
});

// 初始化知识库
knowledgeService.initializeDefaultTemplates();
logger.info('知识库初始化完成');

// 启动服务
app.listen(PORT, () => {
  logger.info('Ariba项目实施助手服务已启动', { 
    port: PORT, 
    env: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
