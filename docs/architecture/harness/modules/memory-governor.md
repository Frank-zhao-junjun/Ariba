# Memory Governor - 记忆治理模块

> 版本：v1.0.0  
> 更新日期：2024-04-14

---

## 一、模块概述

### 职责
Memory Governor负责管理和治理Agent的记忆，包括：
- 知识库管理（自动分类、去重、索引）
- 经验提取（从项目历史中提炼最佳实践）
- 记忆清洗（过时信息、错误纠正）
- 检索优化（语义搜索、关键词匹配）

---

## 二、核心接口

```typescript
interface MemoryMetadata {
  id: string;
  source: 'execution' | 'review' | 'user' | 'system';
  confidence: number;
  tags: string[];
  category: MemoryCategory;
  createdAt: Date;
  expiresAt?: Date;
}

interface Query {
  keywords?: string[];
  semantic?: string;
  category?: MemoryCategory;
  tags?: string[];
  confidence?: { min?: number; max?: number };
  limit?: number;
}

interface MemoryResult {
  memory: MemoryItem;
  score: number;
  highlights?: string[];
}

interface Experience {
  id: string;
  projectId: string;
  type: 'success' | 'failure' | 'pattern' | 'lesson';
  title: string;
  description: string;
  insights: string[];
}
```

---

## 三、记忆分类体系

```
记忆库
├── 事实性记忆 (Factual)
│   ├── Ariba配置知识
│   ├── 流程节点定义
│   └── API规范文档
│
├── 经验性记忆 (Experiential)
│   ├── 项目案例
│   ├── 问题解决方案
│   └── 最佳实践
│
├── 上下文记忆 (Contextual)
│   ├── 当前任务状态
│   ├── 执行历史
│   └── 临时变量
│
└── 元记忆 (Meta)
    ├── 记忆质量评分
    ├── 使用频率统计
    └── 关联关系图谱
```

---

## 四、存储策略

| 分类 | 存储类型 | TTL | 压缩 | 备份 |
|------|----------|-----|------|------|
| factual | persistent | 永不过期 | 是 | 是 |
| experiential | persistent | 1年 | 是 | 是 |
| contextual | ephemeral | 24小时 | 否 | 否 |
| meta | persistent | 永不过期 | 是 | 是 |

---

## 五、清洗策略

```typescript
const CleanupStrategies = {
  expired: {
    enabled: true,
    criteria: (memory) => memory.metadata.expiresAt < now
  },
  lowConfidence: {
    enabled: true,
    threshold: 0.3,
    criteria: (memory) => memory.metadata.confidence < 0.3
  },
  lowUsage: {
    enabled: true,
    threshold: 3,
    period: 30 * 24 * 60 * 60 * 1000,
    criteria: (memory) => memory.metadata.accessCount < 3
  }
};
```

---

## 六、使用示例

```javascript
const memoryGovernor = new MemoryGovernor();

// 存储执行经验
await memoryGovernor.remember(
  `execution:${executionId}`,
  { result: 'success', duration: 1500 },
  { source: 'execution', confidence: 0.9, tags: ['rfq', 'success'] }
);

// 检索相关经验
const results = await memoryGovernor.recall({
  keywords: ['rfq', '报价分析'],
  category: 'experiential',
  confidence: { min: 0.7 }
});

// 提取项目经验
const experiences = await memoryGovernor.extractExperience('project-123');
```

---

*文档版本：v1.0.0 | 最后更新：2024-04-14*
