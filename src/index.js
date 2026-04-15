/**
 * Ariba项目实施助手 v1.9.0
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
const contractQARouter = require('./routes/contractQA');
const invoiceRouter = require('./routes/invoice');
const rfxRouter = require('./routes/rfx');
const approvalRouter = require('./routes/approval');
const guidedBuyingRouter = require('./routes/guided-buying');
const chatbotRouter = require('./routes/chatbot');
const sourcingOptimizerRouter = require('./routes/sourcingOptimizer');
const supplierRiskRouter = require('./routes/supplierRisk');
const bidComparisonRouter = require('./routes/bid-comparison');
const sourcingScenarioRouter = require('./routes/sourcingScenario');
const prFaqRouter = require('./routes/pr-faq');  // PR FAQ助手 v1.9新增
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
app.use('/api/contract-qa', contractQARouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/rfx', rfxRouter);
app.use('/api/approval', approvalRouter);
app.use('/api/guided-buying', guidedBuyingRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/sourcing-optimizer', sourcingOptimizerRouter);
app.use('/api/supplier-risk', supplierRiskRouter);
app.use('/api/bid-comparison', bidComparisonRouter);
app.use('/api/sourcing-scenario', sourcingScenarioRouter);
app.use('/api/pr-faq', prFaqRouter);  // PR FAQ助手 v1.9新增

// 主页
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  res.sendFile(indexPath);
});

// 页面路由
app.get('/requirement', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/requirement.html'));
});

app.get('/blueprint', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/blueprint.html'));
});

app.get('/invoice', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/invoice.html'));
});

app.get('/contract-summary', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contract-summary.html'));
});

app.get('/approval', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/approval.html'));
});

app.get('/supplier-risk', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/supplier-risk.html'));
});

app.get('/contract-qa', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/contract-qa.html'));
});

app.get('/sourcing-scenario', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sourcing-scenario.html'));
});

app.get('/sourcing-optimizer', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sourcing-optimizer.html'));
});

app.get('/bid-comparison', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/bid-comparison.html'));
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Ariba项目实施助手', 
    version: '1.9.0',  // 升级到v1.9
    uptime: process.uptime(), 
    timestamp: new Date().toISOString() 
  });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    service: 'Ariba项目实施助手 API',
    version: '1.9.0',
    endpoints: {
      requirement: { 'POST /api/requirement/analyze': '分析用户需求', 'GET /api/requirement/templates': '获取需求模板列表' },
      blueprint: { 'GET /api/blueprint/templates': '获取蓝图模板列表', 'POST /api/blueprint/generate': '生成User Stories' },
      invoice: { 'POST /api/invoice/analyze': '分析发票与PO差异' },
      rfx: { 'POST /api/rfx/generate': '生成RFx/RFP/RFI/RFB文档' },
      approval: { 'GET /api/approval/pending': '获取待审批列表', 'POST /api/approval/process': '执行审批操作', 'POST /api/approval/batch': '批量审批', 'POST /api/approval/query': '自然语言查询' },
      'contract-qa': { 'POST /api/contract-qa/ask': '询问合同问题', 'POST /api/contract-qa/multi': '多合同对比问答', 'GET /api/contract-qa/suggestions': '获取推荐问题' },
      'bid-comparison': { 'POST /api/bid-comparison/upload': '上传报价文件', 'POST /api/bid-comparison/compare': '生成比价矩阵', 'POST /api/bid-comparison/recommend': 'AI推荐最优供应商', 'GET /api/bid-comparison/export': '导出比价报告' },
      'pr-faq': {  // v1.9新增
        'POST /api/pr-faq/ask': '问答接口',
        'GET /api/pr-faq/categories': '获取FAQ分类',
        'GET /api/pr-faq/popular': '获取热门问题',
        'GET /api/pr-faq/by-category/:category': '按分类获取FAQ'
      }
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
