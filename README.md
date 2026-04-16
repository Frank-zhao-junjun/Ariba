# Ariba 项目实施助手

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

**专为企业 SAP Ariba 实施项目设计的全方位管理平台**

</div>

## 产品愿景

Ariba 项目实施助手旨在解决企业实施 SAP Ariba 项目过程中的核心痛点：

- **统一知识入口** - 整合分散在各平台的知识资源
- **标准化实施流程** - 确保交付质量一致性
- **高效团队协作** - 任务跟踪、评论、@提及
- **知识沉淀传承** - 项目经验有效积累

## 核心功能

### 1. 项目管理
- 实施里程碑追踪（5阶段：准备、蓝图设计、开发配置、测试验证、上线部署）
- 任务清单管理（看板/列表视图）
- 项目进度可视化

### 2. 知识库管理
- **标准知识库**：官方知识图谱、最佳实践、配置指南、接口指南、FAQ
- **项目知识库**：企业背景、需求文档、蓝图设计、实施文档
- **文档模板库**：需求文档、测试用例、培训材料、汇报模板

### 3. AI 实施助手
- 智能问答
- 配置指导
- 最佳实践建议

### 4. 运维中心
- 系统健康监控
- 性能指标（CPU/内存/磁盘/网络）
- 运维日志与告警

### 5. 团队协作
- 成员管理
- 角色权限
- 任务分配

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16 | App Router 全栈框架 |
| React | 19 | UI 库 |
| TypeScript | 5 | 类型安全 |
| shadcn/ui | - | 基于 Radix UI 的组件库 |
| Tailwind CSS | 4 | 样式方案 |
| Recharts | - | 图表库 |
| Lucide React | - | 图标库 |

## 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
pnpm dev
```

访问 http://localhost:5000

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务

```bash
pnpm start
```

## 项目结构

```
src/
├── app/
│   ├── (app)/              # 应用布局组
│   │   ├── layout.tsx      # 应用布局
│   │   ├── page.tsx        # 首页仪表板
│   │   ├── projects/       # 项目管理
│   │   ├── milestones/     # 里程碑追踪
│   │   ├── tasks/          # 任务清单
│   │   ├── knowledge/      # 知识库
│   │   ├── templates/       # 文档模板
│   │   ├── team/           # 团队协作
│   │   ├── assistant/      # AI 助手
│   │   ├── operations/     # 运维中心
│   │   └── settings/       # 系统设置
│   └── globals.css          # 全局样式
├── components/
│   ├── layout/             # 布局组件
│   │   ├── sidebar.tsx     # 侧边栏
│   │   ├── header.tsx      # 头部
│   │   ├── breadcrumb.tsx  # 面包屑
│   │   ├── toast.tsx       # 通知
│   │   └── confirm-dialog.tsx # 确认框
│   └── ui/                 # shadcn/ui 组件
└── lib/
    ├── utils.ts            # 工具函数
    └── data.ts             # 模拟数据
```

## 设计规范

### 色彩系统
- **主色调**：商务蓝 `#6366F1`
- **辅助色**：活力青 `#06B6D4`
- **功能色**：成功绿、警告橙、错误红

### 里程碑阶段
| 阶段 | 颜色 |
|------|------|
| 准备阶段 | `#6366F1` |
| 蓝图设计 | `#8B5CF6` |
| 开发配置 | `#06B6D4` |
| 测试验证 | `#F59E0B` |
| 上线部署 | `#10B981` |

## 界面预览

### 首页仪表板
- 统计卡片（项目总数、任务完成率、待处理任务、里程碑进度）
- 任务完成趋势图
- 任务状态分布
- 最近任务列表
- 里程碑进度时间线

### 知识库
- 标准知识库与项目知识库分类
- 全文搜索与标签筛选
- 网格/列表视图切换
- 文档收藏与管理

### AI 实施助手
- 对话式交互界面
- 快捷问题入口
- 消息复制与反馈

## License

MIT License
