# SAP Ariba 实施助手 - API 文档

**版本**: V26.05
**更新日期**: 2026-04-18
**API版本**: v1.0

---

## 目录

1. [概述](#概述)
2. [认证](#认证)
3. [通用说明](#通用说明)
4. [Dashboard API](#dashboard-api)
5. [故障排除 API](#故障排除-api)
6. [清单管理 API](#清单管理-api)
7. [知识图谱 API](#知识图谱-api)
8. [错误码](#错误码)

---

## 概述

SAP Ariba 实施助手提供 RESTful API 接口，支持故障排除、知识查询、项目清单管理等核心功能。

### 基础信息

| 项目 | 说明 |
|-----|------|
| 基础URL | `/api` |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 超时时间 | 10000ms |

---

## 认证

当前版本使用简化认证机制，API Key 通过 Header 传递。

### 请求头

```
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

> ⚠️ **注意**: 请联系管理员获取 API Key。

---

## 通用说明

### 请求格式

所有请求应包含以下 Header：

```
Content-Type: application/json
Authorization: Bearer <token>
```

### 响应格式

所有 API 响应遵循统一格式：

```typescript
interface BaseResponse<T = any> {
  success: boolean   // 请求是否成功
  message: string    // 响应消息
  data: T            // 响应数据
}
```

### 分页响应

列表类 API 支持分页：

```typescript
interface PaginatedResponse<T> {
  items: T[]          // 数据列表
  total: number       // 总记录数
  page: number        // 当前页码
  page_size: number   // 每页条数
  total_pages: number // 总页数
}
```

---

## Dashboard API

### 获取统计数据

获取仪表盘统计数据。

**请求**

```
GET /api/dashboard/stats
```

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "total_knowledge": 1250,
    "total_projects": 15,
    "completed_tasks": 486,
    "satisfaction": 95,
    "version_distribution": {
      "2602": 320,
      "2604": 450,
      "2605": 280,
      "2610": 200
    },
    "system_health": 98,
    "alerts": [
      "知识库将于本周六进行更新",
      "3个项目进度落后于计划"
    ]
  }
}
```

### 获取系统健康状态

**请求**

```
GET /api/dashboard/health
```

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "status": "healthy",
    "uptime": 99.98,
    "response_time": 45,
    "last_check": "2026-04-18T10:30:00Z"
  }
}
```

### 获取活动日志

**请求**

```
GET /api/dashboard/activity
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| limit | number | 否 | 返回记录数，默认10条 |

---

## 故障排除 API

### 智能查询

根据关键词检索解决方案。

**请求**

```
POST /api/troubleshooting/query
```

**请求体**

```typescript
interface QueryRequest {
  query: string           // 搜索关键词 [必填]
  version_tags?: string[] // 版本标签筛选
  modules?: string[]      // 模块筛选
  limit?: number          // 返回数量，默认10
}
```

**请求示例**

```json
{
  "query": "登录失败",
  "version_tags": ["2605"],
  "modules": ["buying"],
  "limit": 5
}
```

**响应示例**

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "id": "kb_001",
      "title": "用户无法登录Ariba系统",
      "description": "用户在尝试登录时遇到认证失败的问题",
      "solution": "1. 检查用户账户状态\n2. 验证SSO配置\n3. 确认密码策略",
      "versions": ["2602", "2604", "2605"],
      "module": "Buying and Invoicing",
      "tags": ["登录", "认证", "SSO"],
      "score": 0.95
    }
  ]
}
```

### 获取知识详情

**请求**

```
GET /api/troubleshooting/knowledge/:itemId
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| itemId | string | 是 | 知识项ID |

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "kb_001",
    "title": "用户无法登录Ariba系统",
    "description": "用户在尝试登录时遇到认证失败的问题",
    "solution": "1. 检查用户账户状态\n2. 验证SSO配置\n3. 确认密码策略",
    "versions": ["2602", "2604", "2605"],
    "module": "Buying and Invoicing",
    "tags": ["登录", "认证", "SSO"],
    "related_items": ["kb_002", "kb_003"],
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-04-10T14:30:00Z"
  }
}
```

### 提交反馈

**请求**

```
POST /api/troubleshooting/feedback
```

**请求体**

```typescript
interface FeedbackRequest {
  item_id: string    // 知识项ID
  query: string      // 用户查询
  helpful: boolean   // 是否有帮助
  comment?: string   // 反馈评论
}
```

### 获取模块列表

**请求**

```
GET /api/troubleshooting/modules
```

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    { "id": "sourcing", "name": "寻源管理", "description": "供应商寻源、招标管理" },
    { "id": "contract", "name": "合同管理", "description": "合同创建、审批、签署" },
    { "id": "buying", "name": "采购到付款", "description": "采购申请、订单、发票" },
    { "id": "supplier", "name": "供应商管理", "description": "供应商主数据、绩效" },
    { "id": "spending", "name": "支出分析", "description": "支出分析、报表" }
  ]
}
```

### 获取版本列表

**请求**

```
GET /api/troubleshooting/versions
```

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    { "id": "v_2602", "name": "V26.02", "release_date": "2026-02-15" },
    { "id": "v_2604", "name": "V26.04", "release_date": "2026-04-10" },
    { "id": "v_2605", "name": "V26.05", "release_date": "2026-05-01" },
    { "id": "v_2610", "name": "V26.10", "release_date": "2026-10-01" }
  ]
}
```

---

## 清单管理 API

### 获取项目列表

**请求**

```
GET /api/checklist/projects
```

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": "proj_001",
      "name": "采购流程优化项目",
      "version": "2605",
      "total_items": 120,
      "completed_items": 90,
      "completion_rate": 0.75,
      "status": "active",
      "created_at": "2026-03-01T08:00:00Z",
      "updated_at": "2026-04-18T10:30:00Z"
    }
  ]
}
```

### 获取项目详情

**请求**

```
GET /api/checklist/projects/:projectId
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| projectId | string | 是 | 项目ID |

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "proj_001",
    "name": "采购流程优化项目",
    "version": "2605",
    "phases": [
      {
        "id": "phase_001",
        "name": "需求分析",
        "description": "收集和分析业务需求",
        "order": 1,
        "items": [
          {
            "id": "item_001",
            "phase_id": "phase_001",
            "phase_name": "需求分析",
            "module_id": "buying",
            "module_name": "采购到付款",
            "title": "确认采购需求范围",
            "description": "与业务部门确认采购流程的范围和边界",
            "status": "completed",
            "priority": "high",
            "assignee": "张三",
            "due_date": "2026-03-15"
          }
        ]
      }
    ],
    "total_items": 120,
    "completed_items": 90,
    "completion_rate": 0.75
  }
}
```

### 创建项目

**请求**

```
POST /api/checklist/projects
```

**请求体**

```typescript
interface CreateProjectRequest {
  name: string              // 项目名称 [必填]
  profile: {               // 企业配置
    company_size: string   // 企业规模 [必填]
    industry: string        // 所属行业 [必填]
    existing_systems: string[]  // 现有系统
    integration_level: string   // 集成级别 [必填]
  }
  modules: string[]        // 选择模块 [必填]
  version: string           // 版本号 [必填]
  template_id?: string      // 模板ID
}
```

**请求示例**

```json
{
  "name": "采购流程优化项目",
  "profile": {
    "company_size": "large",
    "industry": "manufacturing",
    "existing_systems": ["SAP S/4HANA"],
    "integration_level": "level_3"
  },
  "modules": ["buying", "sourcing", "contract"],
  "version": "2605"
}
```

### 更新清单项

**请求**

```
PATCH /api/checklist/projects/:projectId/items/:itemId
```

**请求体**

```typescript
interface UpdateItemRequest {
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  due_date?: string
  notes?: string
}
```

### 获取项目统计

**请求**

```
GET /api/checklist/stats
```

**响应示例**

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "total_projects": 15,
    "active_projects": 8,
    "completed_projects": 5,
    "overdue_projects": 2,
    "module_stats": [
      {
        "module_name": "寻源管理",
        "total_items": 200,
        "completed_items": 150,
        "completion_rate": 0.75
      }
    ]
  }
}
```

### 获取推荐配置

**请求**

```
GET /api/checklist/recommendations
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| profile | string | 否 | 企业配置标识 |

---

## 知识图谱 API

### 获取知识图谱

**请求**

```
GET /api/graph/knowledge-graph
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| version | string | 否 | 版本号筛选 |

### 版本对比

**请求**

```
GET /api/graph/version-comparison
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| version1 | string | 是 | 第一个版本 |
| version2 | string | 是 | 第二个版本 |

---

## 错误码

### HTTP 状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
| 502 | 网关错误 |
| 503 | 服务不可用 |

### 业务错误码

| 错误码 | 说明 | 解决方案 |
|-------|------|---------|
| E1001 | 知识项不存在 | 检查知识项ID |
| E1002 | 查询超时 | 简化查询条件 |
| E2001 | 项目不存在 | 检查项目ID |
| E2002 | 清单项不存在 | 检查清单项ID |
| E2003 | 项目状态不允许操作 | 检查项目当前状态 |
| E3001 | 模板不存在 | 检查模板ID |
| E3002 | 无效的企业配置 | 检查配置参数 |

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| v1.0 | 2026-04-18 | 初始版本发布 |

---

**文档更新时间**: 2026-04-18
