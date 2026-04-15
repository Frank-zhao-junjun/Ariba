// 修复P0安全问题的补丁

// 1. 统一版本号为 1.7.0
const VERSION = '1.7.0';

// 2. CORS配置
const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || '*', // 生产环境应限制域名
  credentials: true,
  optionsSuccessStatus: 200
};

// 3. API认证中间件
function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validKey = process.env.API_KEY || 'default-dev-key';
  
  // 开发环境允许绕过认证
  if (process.env.NODE_ENV !== 'production' && !process.env.REQUIRE_AUTH) {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'Missing API key' 
    });
  }
  
  if (apiKey !== validKey) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid API key' 
    });
  }
  
  next();
}

// 4. 限流配置
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000 // 最多1000次请求
};

console.log('安全补丁加载成功');
console.log('版本:', VERSION);
console.log('CORS:', CORS_CONFIG.origin);
console.log('认证:', process.env.REQUIRE_AUTH ? '启用' : '开发模式（已禁用）');

module.exports = {
  VERSION,
  CORS_CONFIG,
  requireAuth,
  RATE_LIMIT_CONFIG
};
