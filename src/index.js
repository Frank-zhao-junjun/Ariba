/**
 * Ariba项目实施助手 v1.6
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
const contractSummaryRouter = require('./routes/contractSummary');
const invoiceRouter = require('./routes/invoice');
const rfxRouter = require('./routes/rfx');
const approvalRouter = require('./routes/approval');
const guidedBuyingRouter = require('./routes/guided-buying');
const knowledgeService = require('./services/knowledge');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  logger.info('收到请求', { method: req.method, path: req.path, ip: req.ip });
  next();
});

// 静态文件
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/api/requirement', requirementRouter);
app.use('/api/blueprint', blueprintRouter);
app.use('/api/bid-analysis', bidAnalysisRouter);
app.use('/api/contract', contractRouter);
app.use('/api/contract-summary', contractSummaryRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/rfx', rfxRouter);
app.use('/api/approval', approvalRouter);
app.use('/api/guided-buying', guidedBuyingRouter);

// 页面路由
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });
app.get('/requirement', (req, res) => { res.sendFile(path.join(__dirname, '../public/requirement.html')); });
app.get('/blueprint', (req, res) => { res.sendFile(path.join(__dirname, '../public/blueprint.html')); });
app.get('/invoice', (req, res) => { res.sendFile(path.join(__dirname, '../public/invoice.html')); });
app.get('/contract-summary', (req, res) => { res.sendFile(path.join(__dirname, '../public/contract-summary.html')); });
app.get('/approval', (req, res) => { res.sendFile(path.join(__dirname, '../public/approval.html')); });

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Ariba项目实施助手', version: '1.4.0', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    service: 'Ariba项目实施助手 API',
    version: '1.4.0',
    endpoints: {
      requirement: { 'POST /api/requirement/analyze': '分析用户需求', 'GET /api/requirement/templates': '获取需求模板列表' },
      blueprint: { 'GET /api/blueprint/templates': '获取蓝图模板列表', 'POST /api/blueprint/generate': '生成User Stories' },
      invoice: { 'POST /api/invoice/analyze': '分析发票与PO差异' },
      rfx: { 'POST /api/rfx/generate': '生成RFx/RFP/RFI/RFB文档' },
      approval: { 'GET /api/approval/pending': '获取待审批列表', 'POST /api/approval/process': '执行审批操作', 'POST /api/approval/batch': '批量审批', 'POST /api/approval/query': '自然语言查询' }
    }
  });
});

// 错误处理
app.use((err, req, res, next) => { logger.error('未处理的错误', { error: err.message, stack: err.stack }); res.status(500).json({ success: false, error: 'Internal server error' }); });
app.use((req, res) => { res.status(404).json({ success: false, error: 'Not found', path: req.path }); });

// 初始化知识库
knowledgeService.initializeDefaultTemplates();
logger.info('知识库初始化完成');

// 启动服务
app.listen(PORT, () => { logger.info('Ariba项目实施助手服务已启动', { port: PORT, env: process.env.NODE_ENV || 'development' }); });

module.exports = app;
