# Ariba实施助手 API文档

## 概述

Ariba实施助手后端API服务，基于FastAPI构建，提供故障排除、清单管理、仪表盘、知识图谱等功能。

## 基础信息

- **Base URL**: `http://localhost:8000`
- **文档地址**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc文档**: `http://localhost:8000/redoc`

## 通用响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

## API端点

### 首页

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | API首页信息 |
| `/health` | GET | 健康检查 |

### 仪表盘

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/dashboard/stats` | GET | 获取仪表盘统计数据 |
| `/api/dashboard/health` | GET | 获取系统健康状态 |
| `/api/dashboard/activity` | GET | 获取最近活动 |

### 故障排除

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/troubleshooting/query` | POST | 查询故障知识 |
| `/api/troubleshooting/knowledge/{item_id}` | GET | 获取知识详情 |
| `/api/troubleshooting/feedback` | POST | 提交反馈 |
| `/api/troubleshooting/modules` | GET | 获取模块列表 |
| `/api/troubleshooting/versions` | GET | 获取版本列表 |

#### 查询请求示例

```json
POST /api/troubleshooting/query
{
  "query": "登录失败",
  "version_tags": ["2602", "2604"],
  "modules": ["authentication"],
  "limit": 10
}
```

### 清单管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/checklist/projects` | GET | 获取项目列表 |
| `/api/checklist/projects` | POST | 创建新项目 |
| `/api/checklist/projects/{project_id}` | GET | 获取项目详情 |
| `/api/checklist/projects/{project_id}/items/{item_id}` | PATCH | 更新清单项 |
| `/api/checklist/stats` | GET | 获取统计数据 |
| `/api/checklist/recommendations` | GET | 获取推荐项 |

#### 创建项目请求示例

```json
POST /api/checklist/projects
{
  "name": "Ariba实施项目",
  "profile": {
    "company_size": "large",
    "industry": "制造业",
    "existing_systems": ["SAP S/4HANA"],
    "integration_level": "level_3"
  },
  "modules": ["sourcing", "buying", "contract"],
  "version": "2605"
}
```

### 知识图谱

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/graph/knowledge-graph` | GET | 获取知识图谱 |
| `/api/graph/version-comparison` | GET | 版本对比 |

## 错误处理

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 认证

当前版本未启用认证，所有API均可公开访问。

生产环境部署时应添加适当的认证机制。
