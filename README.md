# Ariba 项目实施助手

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

**专为企业 SAP Ariba 实施项目设计的全方位管理平台**

</div>

## 产品愿景

Ariba 项目实施助手旨在解决企业实施 SAP Ariba 项目过程中的核心痛点：

- **统一知识入口** - 整合分散在 help.sap.com、SAP Community、SAP Learning Hub 等平台的知识资源
- **标准化实施流程** - 提供标准化的实施方法论和文档模板，确保交付质量一致性
- **高效团队协作** - 任务跟踪、评论、@提及等协作功能
- **知识沉淀传承** - 有效沉淀项目经验和最佳实践，降低新成员学习曲线

## 核心功能

### 1. 项目管理
- **实施里程碑追踪** - 5 阶段跟踪（准备、蓝图设计、开发配置、测试验证、上线部署）
- **任务清单管理** - 看板视图 + 列表视图，支持状态/优先级/类别组合筛选
- **项目进度仪表板** - 统计卡片、趋势图、任务分布、里程碑时间线
- **项目详情页** - 从项目列表直接进入项目详情

### 2. 知识库管理
- **标准知识库**：官方知识图谱、最佳实践、配置指南、接口指南、FAQ
- **项目知识库**：企业背景、需求文档、蓝图设计、实施文档
- **搜索与筛选**：全文搜索、分类筛选、标签筛选、收藏筛选，支持组合使用
- **文档模板库**：需求文档、测试用例、培训材料、汇报模板

### 3. AI 实施助手
- 对话式交互界面
- 快捷问题入口
- 消息复制与反馈
- 模拟 AI 回复演示

### 4. 运维中心
- 系统健康监控概览
- 服务状态筛选与浏览
- 性能指标（CPU/内存/磁盘/网络）
- 运维日志级别筛选
- 告警记录浏览

### 5. 团队协作
- 成员搜索与角色筛选
- 角色分类统计
- 成员信息展示

### 6. 系统设置
- 个人资料编辑与保存反馈
- 通知偏好管理
- 安全设置（两步验证）
- 系统偏好（语言/时区/主题/日期格式）

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
| Node.js | 24 | 运行环境 |

## 快速开始

### 环境要求
- Node.js 24+
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

### 构建与部署

```bash
# 构建
pnpm build

# 启动生产服务
pnpm start
```

### 质量验证

```bash
# Lint 检查
pnpm lint .

# TypeScript 类型检查
pnpm ts-check

# 单元测试
pnpm exec tsx --test src/lib/assistant.test.ts
pnpm exec tsx --test src/lib/dashboard.test.ts
pnpm exec tsx --test src/lib/knowledge.test.ts
pnpm exec tsx --test src/lib/milestones.test.ts
pnpm exec tsx --test src/lib/projects.test.ts
pnpm exec tsx --test src/lib/tasks.test.ts
```

### Ralph 方法论

项目使用 Ralph 方法论进行迭代开发，通过 `prd.json` 管理用户故事和质量门禁：

```bash
# Windows
ralph          # 查看下一个待处理故事
ralph verify   # 执行 lint + ts-check + build 验证
ralph deploy   # 构建并启动生产服务

# Linux/macOS
pnpm lint . && pnpm ts-check && pnpm build
```

## 项目结构

```
src/
├── app/
│   ├── (app)/                  # 应用布局组
│   │   ├── layout.tsx          # 应用布局（侧边栏、头部）
│   │   ├── page.tsx            # 首页仪表板
│   │   ├── projects/           # 项目管理
│   │   │   ├── page.tsx        # 项目列表
│   │   │   └── [id]/page.tsx   # 项目详情
│   │   ├── milestones/         # 里程碑追踪
│   │   ├── tasks/             # 任务清单
│   │   ├── knowledge/         # 知识库
│   │   ├── team/              # 团队协作
│   │   ├── assistant/         # AI 实施助手
│   │   ├── operations/        # 运维中心
│   │   └── settings/          # 系统设置
│   └── globals.css             # 全局样式
├── components/
│   ├── layout/                 # 布局组件
│   │   ├── sidebar.tsx        # 侧边栏
│   │   ├── header.tsx         # 头部
│   │   ├── breadcrumb.tsx     # 面包屑
│   │   ├── toast.tsx          # 通知
│   │   └── confirm-dialog.tsx # 确认框
│   └── ui/                    # shadcn/ui 组件库
└── lib/
    ├── utils.ts               # 工具函数
    ├── data.ts                # 模拟数据
    ├── assistant.ts           # 助手消息逻辑
    ├── dashboard.ts           # 仪表板刷新逻辑
    ├── knowledge.ts           # 知识库筛选逻辑
    ├── milestones.ts          # 里程碑筛选逻辑
    ├── projects.ts            # 项目导航逻辑
    ├── tasks.ts               # 任务筛选逻辑
    ├── assistant.test.ts      # 助手测试
    ├── dashboard.test.ts      # 仪表板测试
    ├── knowledge.test.ts      # 知识库测试
    ├── milestones.test.ts     # 里程碑测试
    ├── projects.test.ts       # 项目测试
    └── tasks.test.ts          # 任务测试
scripts/
├── build.sh                   # 构建脚本
├── dev.sh                     # 开发脚本
├── start.sh                   # 启动脚本
└── prepare.sh                 # 准备脚本
ralph.cmd                      # Windows Ralph 入口
prd.json                       # Ralph 用户故事与质量门禁
```

## 设计规范

### 设计理念
- **专业可信** - 蓝色系主色调，简洁清晰，遵循 SAP Fiori 设计指南
- **效率优先** - 合理布局、快捷操作、智能推荐
- **信息清晰** - 视觉层级、颜色编码、图表可视化
- **一致性** - 界面元素、交互模式、术语使用统一

### 色彩系统

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色调 | 商务蓝 | `#6366F1` |
| 辅助色 | 活力青 | `#06B6D4` |
| 成功 | 绿 | `#10B981` |
| 警告 | 橙 | `#F59E0B` |
| 错误 | 红 | `#EF4444` |

### 里程碑阶段色

| 阶段 | 颜色 | 色值 |
|------|------|------|
| 准备阶段 | 靛蓝 | `#6366F1` |
| 蓝图设计 | 紫色 | `#8B5CF6` |
| 开发配置 | 青色 | `#06B6D4` |
| 测试验证 | 橙色 | `#F59E0B` |
| 上线部署 | 绿色 | `#10B981` |

### 交互原则
- **即时反馈** - 操作后立即给予视觉反馈
- **渐进式披露** - 先展示核心信息，按需展开详情
- **容错设计** - 危险操作提供确认对话框
- **状态可见** - 系统状态实时可见

## 用户故事状态

| ID | 标题 | 状态 |
|----|------|------|
| US-001 | AI 助手消息发送稳定化 | PASS |
| US-002 | 首页仪表板刷新与时间状态稳定化 | PASS |
| US-003 | 知识库搜索筛选闭环 | PASS |
| US-004 | 项目列表到详情的导航闭环 | PASS |
| US-005 | 里程碑阶段筛选与任务透视 | PASS |
| US-006 | 任务清单筛选与视图一致性 | PASS |
| US-007 | 团队目录搜索与角色浏览 | PASS |
| US-008 | 运维中心筛选与告警浏览 | PASS |
| US-009 | 设置页偏好保存反馈 | PASS |
| US-010 | 本地部署冒烟脚本收敛 | PASS |

## License

MIT License
