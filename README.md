# Ariba 项目实施助手

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)

**专为企业 SAP Ariba 实施项目设计的全方位管理平台**

</div>

## 产品愿景

Ariba 项目实施助手旨在解决企业实施 SAP Ariba 项目过程中的核心痛点：

- **统一知识入口** - 整合分散在 help.sap.com、SAP Community、SAP Learning Hub 等平台的知识资源
- **标准化实施流程** - 提供标准化的实施方法论和文档模板，确保交付质量一致性
- **高效团队协作** - 任务跟踪、评论、@提及等协作功能
- **知识沉淀传承** - 有效沉淀项目经验和最佳实践，降低新成员学习曲线
- **智能故障诊断** - AI 驱动的故障排除和解决方案推荐

## 系统架构

本项目采用 **主从架构**：

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Ariba 项目实施助手                                │
├──────────────────────────────────────┬──────────────────────────────┤
│         主系统 (Main System)         │      辅助服务 (Auxiliary)    │
│                                      │                              │
│   ┌─────────────────────────────┐   │   ┌──────────────────────┐   │
│   │   Next.js 16 + React 19     │   │   │   FastAPI 服务       │   │
│   │   - 项目管理仪表板          │   │   │   - 故障排除API      │   │
│   │   - 知识库管理              │   │   │   - 检查清单API      │   │
│   │   - AI 助手界面             │   │   │   - 知识图谱查询     │   │
│   │   - 运维监控                │   │   └──────────────────────┘   │
│   └─────────────────────────────┘   │                              │
│                                      │   (web/backend/)             │
│   入口: http://localhost:5000        │   入口: http://localhost:8000│
└──────────────────────────────────────┴──────────────────────────────┘
```

**说明：**
- **主系统** (`src/`) - 完整的 Next.js 全栈应用，包含前端界面和模拟数据层
- **辅助服务** (`web/backend/`) - 独立的 FastAPI 服务，提供故障排除、检查清单等 API（可选扩展）

## 核心功能

### 主系统功能 (Next.js)

#### 1. 项目管理
- **实施里程碑追踪** - 5 阶段跟踪（准备、蓝图设计、开发配置、测试验证、上线部署）
- **任务清单管理** - 看板视图 + 列表视图，支持状态/优先级/类别组合筛选
- **项目进度仪表板** - 统计卡片、趋势图、任务分布、里程碑时间线
- **项目详情页** - 从项目列表直接进入项目详情

#### 2. 知识库管理
- **标准知识库**：官方知识图谱、最佳实践、配置指南、接口指南、FAQ
- **项目知识库**：企业背景、需求文档、蓝图设计、实施文档
- **搜索与筛选**：全文搜索、分类筛选、标签筛选、收藏筛选，支持组合使用
- **文档模板库**：需求文档、测试用例、培训材料、汇报模板

#### 3. AI 实施助手
- 对话式交互界面
- 快捷问题入口
- 消息复制与反馈
- 模拟 AI 回复演示

#### 4. 运维中心
- 系统健康监控概览
- 服务状态筛选与浏览
- 性能指标（CPU/内存/磁盘/网络）
- 运维日志级别筛选
- 告警记录浏览

#### 5. 团队协作
- 成员搜索与角色筛选
- 角色分类统计
- 成员信息展示

#### 6. 系统设置
- 个人资料编辑与保存反馈
- 通知偏好管理
- 安全设置（两步验证）
- 系统偏好（语言/时区/主题/日期格式）

### 辅助服务功能 (FastAPI)

**可选扩展服务**，提供以下 API：

- **故障排除助手** - 智能诊断、语义搜索、知识图谱分析
- **检查清单生成器** - 模板管理、智能推荐
- **知识图谱服务** - 关系可视化、版本对比

## 技术栈

### 主系统技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16 | App Router 全栈框架 |
| React | 19 | UI 库 |
| TypeScript | 5 | 类型安全 |
| shadcn/ui | - | 基于 Radix UI 的组件库 |
| Tailwind CSS | 4 | 样式方案 |
| Recharts | - | 图表库 |
| Lucide React | - | 图标库 |
| Node.js | 24+ | 运行环境 |

### 辅助服务技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.11+ | 编程语言 |
| FastAPI | 0.104+ | Web 框架 |
| SQLite | 3.40+ | 数据存储 |
| Pydantic | 2.0+ | 数据验证 |
| Uvicorn | - | ASGI 服务器 |

### 基础设施

| 技术 | 说明 |
|------|------|
| Docker | 容器化部署 |
| Docker Compose | 本地开发编排 |
| Kubernetes | 生产环境编排（可选） |

## 快速开始

### 环境要求
- Node.js 24+
- Python 3.11+（如使用辅助服务）
- pnpm 8+

### 方式一：仅启动主系统（推荐）

主系统已包含完整的前端界面和模拟数据，可独立运行：

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 访问 http://localhost:5000
```

### 方式二：启动辅助服务（可选）

如需使用 FastAPI 提供的故障排除、检查清单等功能：

```bash
# 进入辅助服务目录
cd web/backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
python api_server.py

# API 文档 http://localhost:8000/docs
```

### 方式三：Docker Compose 全栈启动

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 构建与部署

```bash
# 主系统构建
pnpm build
pnpm start

# Docker 构建（注意 context 路径）
docker build -f Dockerfile.backend -t ariba-backend ./web/backend
docker build -f Dockerfile.frontend -t ariba-web .

# K8s 部署（可选）
kubectl apply -f k8s/
```

## 质量验证

### 主系统验证

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

### 辅助服务验证（可选）

```bash
cd web/backend
python -m pytest tests/
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
.
├── src/                          # 主系统（Next.js 前端）
│   ├── app/
│   │   ├── (app)/               # 应用布局组
│   │   │   ├── layout.tsx       # 应用布局
│   │   │   ├── page.tsx         # 首页仪表板
│   │   │   ├── projects/        # 项目管理
│   │   │   ├── milestones/      # 里程碑追踪
│   │   │   ├── tasks/          # 任务清单
│   │   │   ├── knowledge/      # 知识库
│   │   │   ├── team/           # 团队协作
│   │   │   ├── assistant/      # AI 实施助手
│   │   │   ├── operations/     # 运维中心
│   │   │   └── settings/       # 系统设置
│   │   └── globals.css         # 全局样式
│   ├── components/
│   │   ├── layout/             # 布局组件
│   │   └── ui/                 # shadcn/ui 组件库
│   └── lib/                    # 业务逻辑 + 模拟数据
│       ├── utils.ts
│       ├── data.ts
│       ├── assistant.ts
│       ├── dashboard.ts
│       ├── knowledge.ts
│       ├── milestones.ts
│       ├── projects.ts
│       ├── tasks.ts
│       └── *.test.ts           # 单元测试
│
├── web/                         # 辅助服务（可选扩展）
│   └── backend/                 # FastAPI 后端服务
│       ├── api/                # API 路由
│       │   ├── troubleshooting.py
│       │   ├── checklist.py
│       │   ├── dashboard.py
│       │   └── graph.py
│       ├── models/             # 数据模型
│       ├── tests/              # 测试
│       ├── api_server.py       # 服务入口
│       └── requirements.txt
│
├── 故障排除助手/               # Python 故障诊断模块（独立）
│   ├── core/                  # 核心引擎
│   ├── diagnosis/             # 诊断逻辑
│   ├── semantic/              # 语义搜索
│   ├── knowledge_graph/       # 知识图谱
│   ├── tests/                 # 测试
│   └── fixtures/              # 测试数据
│
├── shared/                     # 共享模块（独立）
│   ├── config/                # 配置管理
│   ├── interfaces/            # 接口定义
│   └── knowledge/             # 知识库工具
│
├── k8s/                        # Kubernetes 配置（可选）
├── scripts/                    # 脚本工具
├── docker-compose.dev.yml      # Docker 开发配置
├── docker-compose.prod.yml     # Docker 生产配置
├── ralph.cmd                   # Ralph 入口
├── prd.json                    # 用户故事与质量门禁
└── README.md
```

## API 文档

### 辅助服务 API（可选）

启动辅助服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 主要接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/troubleshooting/diagnose` | POST | 故障诊断 |
| `/api/troubleshooting/search` | POST | 语义搜索 |
| `/api/checklist/generate` | POST | 生成检查清单 |
| `/api/checklist/templates` | GET | 获取模板列表 |
| `/api/dashboard/stats` | GET | 仪表板统计 |
| `/api/graph/query` | POST | 知识图谱查询 |

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
