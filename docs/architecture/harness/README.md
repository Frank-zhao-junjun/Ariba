# Harness层架构 - 索引文档

> 版本：v1.0.0  
> 更新日期：2024-04-14

---

## 文档结构

```
docs/architecture/harness/
│
├── README.md                      # 📖 本文档 - 索引和概览
│
├── architecture.md               # 🏗️ 整体架构设计
│
├── modules/                       # 📦 核心模块详细设计
│   ├── quality-assessor.md       # ✅ 质量评估模块
│   ├── behavior-guard.md         # 🛡️ 行为规范模块
│   ├── memory-governor.md        # 🧠 记忆治理模块
│   └── stability-monitor.md      # 📊 稳定保障模块
│
├── implementation/                # 💻 代码实现
│   ├── event-bus.js              # 事件总线
│   ├── quality-assessor.js       # 质量评估器
│   ├── behavior-guard.js         # 行为规范器
│   ├── memory-governor.js        # 记忆治理器
│   ├── stability-monitor.js      # 稳定保障器
│   └── index.js                  # 主入口文件
│
└── integration/                   # 🔗 集成方案
    ├── workflow-integration.md    # 工作流引擎集成
    └── agent-integration.md      # Agent服务集成
```

---

## 快速开始

### 引入Harness

```javascript
const { Harness } = require('./implementation');

// 创建Harness实例
const harness = new Harness();
```

### 使用质量评估

```javascript
const report = await harness.quality.assessQuality({
  taskType: 'sourcing',
  phase: 'configure',
  inputs: yourConfig
});

console.log(`质量评分: ${report.score} (${report.level})`);
```

### 使用行为规范

```javascript
const permResult = await harness.behavior.checkPermission({
  agentId: 'data-agent',
  action: 'delete',
  target: 'pr:12345'
});

if (!permResult.allowed) {
  console.log('权限拒绝:', permResult.reason);
}
```

### 使用记忆治理

```javascript
await harness.memory.remember(
  `execution:${id}`,
  { result: 'success' },
  { source: 'execution', confidence: 0.9 }
);

const memories = await harness.memory.recall({
  keywords: ['rfq', '报价'],
  confidence: { min: 0.7 }
});
```

### 使用稳定保障

```javascript
await harness.stability.captureException(error, {
  agentId: 'data-agent',
  taskId: 'task-123'
});

await harness.stability.recordMetric({
  name: 'response_time',
  value: 150,
  unit: 'ms',
  tags: { endpoint: '/api/data' }
});
```

---

## 核心概念

| 模块 | 职责 | 回答的问题 |
|------|------|-----------|
| Quality Assessor | 质量评估 | "做得对不对？" |
| Behavior Guard | 行为规范 | "允许这样做吗？" |
| Memory Governor | 记忆治理 | "以前是怎么做的？" |
| Stability Monitor | 稳定保障 | "系统稳定吗？" |

---

## 设计原则

1. **约束优于提示** - 与其告诉Agent"怎么做"，不如让它"只能这样做"
2. **评估优于生成** - 引入独立评估机制，不依赖Agent自我判断
3. **反馈优于尝试** - 建立有效反馈循环，而非盲目重试
4. **可观测性优于信任** - 构建系统验证Agent确实在工作
5. **记忆外置化** - 跨轮次积累经验，避免重复犯错
6. **安全第一** - 危险操作前必须二次确认

---

## 实现路线图

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 基础框架 | ✅ |
| Phase 2 | 行为规范 | ✅ |
| Phase 3 | 质量评估 | ✅ |
| Phase 4 | 记忆治理 | ✅ |
| Phase 5 | 稳定保障 | ✅ |
| Phase 6 | 集成优化 | ⏳ |

---

*文档版本：v1.0.0 | 最后更新：2024-04-14*
