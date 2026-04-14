/**
 * Ariba项目实施助手 v1.3
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
const invoiceRouter = require('./routes/invoice');
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
app.use('/api/invoice', invoiceRouter);

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

// 发票差异分析页面
app.get('/invoice', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/invoice.html'));
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Ariba项目实施助手',
    version: '1.3.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    service: 'Ariba项目实施助手 API',
    version: '1.3.0',
    endpoints: {
      invoice: {
        'POST /api/invoice/analyze': '分析发票与PO差异',
        'POST /api/invoice/demo': '演示模式分析',
        'POST /api/invoice/quick-check': '快速金额检查'
      }
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error('未处理的错误', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found', path: req.path });
});

// 初始化知识库
knowledgeService.initializeDefaultTemplates();
logger.info('知识库初始化完成');

// 启动服务
app.listen(PORT, () => {
  logger.info('Ariba项目实施助手服务已启动', { port: PORT, env: process.env.NODE_ENV || 'development' });
});

module.exports = app;
