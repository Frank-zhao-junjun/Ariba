# Ariba 项目实施助手 - 开发规范

## 项目概述

Ariba 项目实施助手是一款专为企业 SAP Ariba 实施项目设计的全方位管理平台，涵盖项目管理、知识库、AI助手等核心功能。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **图表**: Recharts
- **图标**: Lucide React

## 目录结构

```
src/
├── app/
│   ├── (app)/              # 应用布局组
│   │   ├── layout.tsx      # 应用布局（侧边栏、头部）
│   │   ├── page.tsx        # 首页仪表板
│   │   ├── projects/        # 项目管理
│   │   ├── milestones/      # 里程碑追踪
│   │   ├── tasks/          # 任务清单
│   │   ├── knowledge/      # 知识库
│   │   ├── templates/      # 文档模板
│   │   ├── team/           # 团队协作
│   │   ├── assistant/      # AI 实施助手
│   │   ├── operations/     # 运维中心
│   │   └── settings/       # 系统设置
│   ├── globals.css         # 全局样式
│   └── layout.tsx          # 根布局
├── components/
│   ├── layout/             # 布局组件
│   │   ├── sidebar.tsx     # 侧边栏
│   │   └── header.tsx      # 头部
│   └── ui/                 # shadcn/ui 组件库
└── lib/
    ├── utils.ts            # 工具函数
    └── data.ts             # 模拟数据
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 构建生产版本
pnpm build

# 启动生产环境
pnpm start
```

## 功能模块

### 1. 首页仪表板 (`/`)
- 项目统计卡片（项目总数、任务完成率、待处理任务、里程碑进度）
- 任务完成趋势图（Recharts AreaChart）
- 任务状态分布饼图
- 最近任务列表
- 里程碑进度时间线
- 项目概览卡片

### 2. 项目管理 (`/projects`)
- 项目卡片展示
- 项目进度展示
- 团队成员头像展示

### 3. 里程碑追踪 (`/milestones`)
- 横向时间线展示5个阶段
- 阶段详情卡片
- 阶段任务列表
- 任务状态筛选

### 4. 任务清单 (`/tasks`)
- 看板视图（待处理/进行中/阻塞/已完成）
- 列表视图
- 任务筛选（状态/优先级/类别）
- 统计概览

### 5. 知识库 (`/knowledge`)
- 标准知识库（官方知识图谱、最佳实践、配置指南、接口指南、FAQ）
- 项目知识库（企业背景、需求文档、蓝图设计等）
- 文档模板库
- 搜索功能

### 6. AI 实施助手 (`/assistant`)
- 聊天对话界面
- 流式响应展示（预留）
- 快捷问题按钮
- 消息复制/反馈功能

### 7. 运维中心 (`/operations`)
- 系统健康概览
- 服务状态监控
- 性能指标展示（CPU/内存/磁盘/网络）
- 运维日志表
- 告警记录

### 8. 团队协作 (`/team`)
- 团队成员列表
- 角色分类统计
- 成员信息展示

### 9. 系统设置 (`/settings`)
- 个人资料管理
- 通知设置
- 安全设置
- 系统偏好设置

## 开发规范

### Hydration 问题防范
1. 严禁在 JSX 渲染逻辑中直接使用 `typeof window`、`Date.now()`、`Math.random()` 等动态数据
2. 必须使用 `'use client'` 并配合 `useEffect` + `useState` 确保动态内容仅在客户端挂载后渲染
3. 严禁非法 HTML 嵌套（如 `<p>` 嵌套 `<div>`）

### 组件开发
- 使用 shadcn/ui 组件库
- 使用 Tailwind CSS 进行样式开发
- 遵循组件的命名规范

### 状态管理
- 使用 React useState/useEffect 管理本地状态
- 模拟数据存储在 `src/lib/data.ts`

## 环境变量

项目使用以下环境变量：
- `COZE_PROJECT_ENV`: 开发/生产环境
- `DEPLOY_RUN_PORT`: 服务端口（默认5000）
- `COZE_PROJECT_DOMAIN_DEFAULT`: 对外访问域名

## 访问地址

开发环境：http://localhost:5000
