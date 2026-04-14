/**
 * Ariba助手 - 智能审批状态查询服务
 * 主入口文件
 */

require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { createWebhookRouter } = require('./webhook');
const feishuService = require('./services/feishu');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info('收到请求', { method: req.method, path: req.path });
  next();
});

app.use('/webhook', createWebhookRouter());

app.get('/', (req, res) => {
  res.json({
    service: 'Ariba Assistant',
    version: '1.0.0',
    status: 'running',
    endpoints: { health: '/health', webhook: '/webhook/coze', test: '/test' },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/test', async (req, res) => {
  const { message = 'PR12345' } = req.query;
  const { handleMessage } = require('./webhook');
  const response = await handleMessage(message, 'test_user');
  res.json({ input: message, output: response });
});

if (process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET) {
  feishuService.initFeishu();
}

app.use((err, req, res, next) => {
  logger.error('未处理的错误', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(PORT, () => {
  logger.info('Ariba助手服务已启动', { port: PORT, env: process.env.NODE_ENV || 'development' });
});

module.exports = app;
