# 前端开发 AI 知识库

## 项目信息

- 项目：Ariba实施助手 - 前端页面
- 版本：v1.7.0
- 开发方法：ralph方法
- 开发时间：2026-04-15

## 技术栈

- HTML5
- CSS3
- 原生JavaScript
- API: http://localhost:3001

## API端点

### 需求分析API
- POST /api/requirement/interview/start
- POST /api/requirement/interview/next
- POST /api/requirement/match
- POST /api/requirement/user-stories
- POST /api/requirement/priority
- POST /api/requirement/peripheral

### 知识问答API
- POST /api/knowledge/ask
- POST /api/knowledge/search
- GET /api/knowledge/stats

### 项目管理API
- GET /api/v1/projects
- POST /api/v1/projects
- GET /api/v1/projects/:id
- PUT /api/v1/projects/:id
- DELETE /api/v1/projects/:id

## 文件结构

```
public/
├── index.html (首页)
├── projects.html (项目背景管理)
├── requirement.html (需求分析)
└── blueprint.html (蓝图设计)
```

## UI规范

### 颜色
- 主色：#667eea, #764ba2 (渐变)
- 背景：白色
- 文字：#333
- 次要文字：#666

### 间距
- 页面内边距：20px
- 卡片间距：25px
- 按钮内边距：12px 30px

### 字体
- 系统字体：-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- 标题：2.2em
- 正文：1em
- 小字：0.85em

## 交互规范

### 按钮
- 悬停效果：transform: translateY(-5px)
- 点击效果：transform: scale(1.05)
- 过渡时间：0.3s ease

### 卡片
- 悬停效果：box-shadow + translateY
- 边框：2px solid transparent
- 悬停边框：#667eea

## 开发原则

1. 每个用户故事必须在一个上下文窗口内完成
2. 遇到不确定能不能一次搞定，就继续拆
3. 每次启动全新AI实例
4. 完成后更新progress.txt
5. 记录学习笔记到progress.txt

## 已知问题

- 当前页面使用原生HTML/CSS/JS
- 需要API错误处理
- 需要加载状态指示
- 需要响应式设计
