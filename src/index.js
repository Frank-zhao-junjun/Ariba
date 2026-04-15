const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API路由（保留实施相关的路由）
app.use('/api/blueprint', require('./routes/blueprint'));
app.use('/api/requirement', require('./routes/requirement'));
app.use('/api/chatbot', require('./routes/chatbot'));

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Ariba实施助手运行在端口 ${PORT}`);
});

module.exports = app;
