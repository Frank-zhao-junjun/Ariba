/**
 * Ariba项目实施助手 v1.7.0
 * P1修复：安全头、限流、验证、日志
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const logger = require('./middleware/logger');
const { VERSION, CORS_CONFIG, requireAuth } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3001;

// P1-05: Helmet安全头
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"], connectSrc: ["'self'"], frameSrc: ["'none'"]
  }
}));

// CORS
app.use(cors(CORS_CONFIG));

// P1-04: 速率限制
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, error: '请求过于频繁' }
});
app.use('/api/', generalLimiter);

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => logger.logRequest(req, res, Date.now() - start));
  next();
});

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 认证路由
const authRoutes = express.Router();
if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true') {
  authRoutes.use(requireAuth);
}

// API路由
authRoutes.use('/v1/projects', require('./routes/projects'));
authRoutes.use('/blueprint', require('./routes/blueprint'));
authRoutes.use('/requirement', require('./routes/requirement'));
authRoutes.use('/chatbot', require('./routes/chatbot'));
authRoutes.use('/knowledge', require('./routes/knowledge'));
app.use('/api', authRoutes);

// 页面路由
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, '../public/projects.html')));

// 健康检查
app.get('/health', (req, res) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: VERSION });
});

// API文档
app.get('/api', (req, res) => {
  res.json({
    service: 'Ariba实施助手 API', version: VERSION,
    security: { cors: CORS_CONFIG.origin, rateLimit: 'enabled', helmet: 'enabled' }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.logError('Error', err);
  res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Internal error' : err.message });
});

app.use((req, res) => res.status(404).json({ success: false, error: 'Not found' }));

app.listen(PORT, () => {
  logger.info(`Ariba实施助手 v${VERSION} 运行在端口 ${PORT}`);
  logger.info('P1修复: 安全头、限流、验证、日志已启用');
});

module.exports = app;
