# Ariba实施助手 API文档 v1.7.0

> 需求分析模块增强功能

## 📋 功能概览

| 功能编号 | 功能名称 | API端点 |
|---------|---------|---------|
| RA-F01 | 引导式访谈 | `/api/requirement/interview/*` |
| RA-F02 | Ariba能力匹配 | `/api/requirement/match` |
| RA-F04 | 用户故事生成 | `/api/requirement/user-stories` |
| RA-F05 | 优先级评估增强 | `/api/requirement/priority` |
| RA-F06 | 周边能力识别 | `/api/requirement/peripheral` |

---

## 🔐 RA-F01: 引导式访谈

基于5W2H和SCQA框架的引导式访谈功能。

### 1.1 开始访谈

```
POST /api/requirement/interview/start
```

**请求体：**
```json
{
  "projectId": "项目ID（可选）",
  "industry": "行业",
  "modules": "模块",
  "context": {}
}
```

**响应：**
```json
{
  "success": true,
  "sessionId": "INT-xxx",
  "stage": "stage_background",
  "stageName": "背景调研",
  "question": {
    "id": "BG001",
    "text": "请介绍一下贵公司目前采购管理的整体情况？",
    "category": "background",
    "framework": "Situation",
    "keywords": ["采购规模", "品类", "组织架构"],
    "followUps": ["BG001_F1"]
  },
  "progress": {
    "current": 1,
    "total": 23,
    "stage": 1,
    "totalStages": 4
  },
  "frameworks": {
    "scqa": { "Situation": "描述当前状态和背景", ... },
    "fiveWtwoH": { "What": "具体要实现什么功能", ... },
    "kano": { "基本型需求": "必须有", ... },
    "rice": { "Reach": "覆盖范围", ... }
  }
}
```

### 1.2 下一问题

```
POST /api/requirement/interview/next
```

**请求体：**
```json
{
  "sessionId": "访谈会话ID",
  "answer": "用户回答",
  "skipFollowUp": false
}
```

### 1.3 获取访谈状态

```
GET /api/requirement/interview/:sessionId
```

### 1.4 获取访谈模板

```
GET /api/requirement/interview/questions/template
```

### 访谈阶段

| 阶段 | 名称 | 问题数量 | 框架 |
|-----|------|---------|------|
| 1 | 背景调研 | 4 | SCQA-Situation |
| 2 | 需求识别 | 8 | 5W2H |
| 3 | 能力匹配 | 4 | SCQA-Question |
| 4 | 优先级排序 | 7 | SCQA-Answer + RICE + KANO |

---

## 🔐 RA-F02: Ariba能力匹配

基于知识库能力标签索引的能力匹配。

```
POST /api/requirement/match
```

**请求体：**
```json
{
  "requirements": [
    {
      "id": "REQ001",
      "name": "需求名称",
      "description": "需求描述"
    }
  ],
  "projectId": "项目ID（可选）"
}
```

**响应：**
```json
{
  "success": true,
  "matches": [
    {
      "requirement": { "id": "REQ001", "name": "采购申请管理", ... },
      "capability": {
        "category": "🟢 原生能力",
        "description": "Ariba标准功能，开箱即用",
        "color": "#22c55e",
        "keywords": ["采购申请", "审批"],
        "confidence": 0.4
      },
      "scope": {
        "module": ["采购申请"],
        "version": "通用",
        "integration": "无",
        "industry": "通用"
      },
      "documents": [
        { "name": "采购执行", "path": "03-核心模块/Buying采购执行.md" }
      ],
      "recommendation": "建议使用Ariba标准功能实现..."
    }
  ],
  "statistics": {
    "total": 4,
    "native": 3,
    "sapIntegration": 1,
    "thirdPartyIntegration": 0,
    "customDev": 0
  }
}
```

### 能力分类

| 标签 | 含义 | 说明 |
|------|------|------|
| 🟢 原生能力 | Ariba标准功能 | 开箱即用，只需配置 |
| 🔴 SAP生态 | 需要SAP产品配合 | 如S/4HANA、CIG等 |
| 🔵 第三方集成 | 需要第三方系统对接 | 如用友、金蝶等 |
| 🟣 定制开发 | 需要定制开发 | UI扩展、AddOn等 |

---

## 🔐 RA-F04: 用户故事生成

基于访谈和需求分析生成用户故事。

```
POST /api/requirement/user-stories
```

**请求体：**
```json
{
  "requirements": [
    {
      "id": "REQ001",
      "name": "需求名称",
      "description": "需求描述",
      "priority": "P1",
      "effort": "中",
      "kano": "期望型需求"
    }
  ],
  "industry": "行业（可选）",
  "context": {}
}
```

**响应：**
```json
{
  "success": true,
  "stories": [
    {
      "id": "US-xxx",
      "asA": "采购申请人员",
      "iWant": "采购申请管理",
      "soThat": "满足业务需求，提升工作效率",
      "acceptanceCriteria": [
        {
          "given": "用户在系统中",
          "when": "执行采购申请管理",
          "then": "系统正确响应并记录"
        }
      ],
      "priority": "P0",
      "effort": "中",
      "kano": "基本型需求"
    }
  ],
  "markdown": "# 用户故事文档\n\n...",
  "totalCount": 3,
  "byPriority": { "p0": 1, "p1": 2 }
}
```

### 用户故事格式

```
作为 [角色]
我希望 [功能描述]
以便 [业务价值]

验收标准：
- Given [前置条件]
- When [触发动作]
- Then [预期结果]
```

---

## 🔐 RA-F05: 优先级评估增强

基于RICE评分模型和KANO模型的优先级评估。

```
POST /api/requirement/priority
```

**请求体：**
```json
{
  "requirements": [
    {
      "id": "REQ001",
      "name": "需求名称",
      "description": "需求描述",
      "reach": 8,
      "impact": 7,
      "confidence": 8,
      "effort": 3,
      "kanoType": "期望型需求"
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "requirements": [
    {
      "id": "REQ001",
      "rice": {
        "reach": 8,
        "impact": 7,
        "confidence": 8,
        "effort": 3,
        "score": 149.33
      },
      "kano": "期望型需求",
      "priority": "P0"
    }
  ],
  "summary": {
    "total": 4,
    "p0Count": 2,
    "p1Count": 1,
    "p2Count": 1,
    "p3Count": 0,
    "kanoDistribution": {
      "basic": 1,
      "performance": 2,
      "excitement": 1
    }
  },
  "models": {
    "rice": { "formula": "(Reach × Impact × Confidence) / Effort" },
    "kano": { "types": ["基本型需求", "期望型需求", "兴奋型需求"] }
  }
}
```

### RICE评分模型

| 维度 | 说明 | 范围 |
|------|------|------|
| Reach | 覆盖范围 - 一段时间内受影响的人数 | 1-10 |
| Impact | 影响程度 - 对该指标的潜在影响 | 1-10 |
| Confidence | 置信度 - 对估计的确定性 | 1-10 |
| Effort | 工作量 - 团队需要的人月数 | 1-10 |

**RICE公式：** `(Reach × Impact × Confidence) / Effort`

### KANO模型

| 类型 | 说明 | 示例 |
|------|------|------|
| 基本型需求 | 必须有，不满足会导致严重不满 | 审批流程、数据安全 |
| 期望型需求 | 越多越好，满足程度与满意度成正比 | 报表分析、移动端支持 |
| 兴奋型需求 | 超出预期，带来惊喜和满意度 | AI智能推荐、自动化 |

---

## 🔐 RA-F06: 周边能力识别

识别需要额外开发或集成的周边能力。

```
POST /api/requirement/peripheral
```

**请求体：**
```json
{
  "requirements": [
    { "id": "REQ001", "name": "需求名称", "description": "需求描述" }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "peripheralCapabilities": [...],
  "grouped": {
    "sapIntegration": [...],
    "thirdPartyIntegration": [...],
    "customDev": [...]
  },
  "statistics": {
    "total": 3,
    "sapIntegration": 1,
    "thirdPartyIntegration": 1,
    "customDev": 1
  },
  "costEstimate": {
    "sapIntegration": { "subtotal": { "min": 30, "max": 60, "unit": "人天" } },
    "thirdPartyIntegration": { "subtotal": { "min": 15, "max": 40, "unit": "人天" } },
    "customDev": { "subtotal": { "min": 10, "max": 30, "unit": "人天" } }
  },
  "recommendations": [
    {
      "type": "customDev",
      "priority": "高",
      "recommendation": "定制开发建议评估BTP平台AddOn方案...",
      "risks": ["开发周期长", "维护成本高", "升级兼容性"]
    }
  ]
}
```

---

## 📊 测试脚本

运行测试脚本验证所有API：

```bash
cd ~/my-workspace/projects/ariba-assistant
bash test-api-v170.sh
```

---

## 📝 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.7.0 | 2026-04-15 | 新增需求分析模块增强功能 |
| 1.6.2 | 2026-04-14 | 基础需求分析功能 |

---

*文档生成时间: 2026-04-15*
