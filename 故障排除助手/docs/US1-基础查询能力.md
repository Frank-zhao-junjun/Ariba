# US1: 故障排除助手 - 基础查询能力

> 版本：1.0.0
> 创建日期：2026-04-17

## 用户故事

**作为** Ariba实施顾问
**我需要** 能够通过自然语言查询故障知识
**以便** 快速定位问题解决方案

## 验收标准 (AC)

| AC | 描述 | 状态 |
|----|------|------|
| AC1.1 | 支持基于关键词的简单查询（如"供应商登录失败"、"审批卡住"） | ✅ |
| AC1.2 | 返回相关的故障知识条目（标题、描述、解决方案） | ✅ |
| AC1.3 | 支持版本过滤（#V2505, #V2602, #V2604, #V2605, #VNextGen, #VClassic） | ✅ |
| AC1.4 | 返回结果按相关度排序（关键词匹配度优先） | ✅ |

## 功能规格

### 核心功能

1. **关键词搜索**
   - 支持单个或多个关键词
   - 中文分词处理
   - 不区分大小写

2. **版本过滤**
   - 支持的版本标签：#V2505, #V2602, #V2604, #V2605, #VNextGen, #VClassic
   - 多版本OR匹配
   - 自动标准化版本格式

3. **相关度排序**
   - 标题匹配：权重3x
   - 标签匹配：权重2.5x
   - 描述匹配：权重2x
   - 解决方案匹配：权重1.5x

## 技术实现

### 数据模型
```python
KnowledgeItem:
  - id: str           # 知识ID
  - title: str        # 标题
  - description: str   # 描述
  - solution: str     # 解决方案
  - tags: List[str]   # 标签
  - versions: List[str] # 适用版本
  - related_ids: List[str] # 关联ID
```

### 核心类
- `QueryEngine`: 搜索引擎
- `VersionFilter`: 版本过滤器
- `KnowledgeItem`: 数据模型

## 测试用例

| 测试ID | 描述 | 预期结果 |
|--------|------|----------|
| TC1.1 | 搜索"供应商登录" | 返回包含该关键词的知识条目 |
| TC1.2 | 版本过滤"#V2605" | 仅返回支持V2605的条目 |
| TC1.3 | 搜索"审批卡住" | 按相关度排序返回结果 |

## 使用示例

```python
from core.query_engine import create_query_engine

# 创建引擎
engine = create_query_engine(knowledge_data)

# 搜索
results = engine.search(
    query="供应商登录失败",
    version_tags=["#V2605"],
    limit=10
)

# 输出结果
for r in results:
    print(f"[{r.score}] {r.item.title}")
    print(f"解决方案: {r.item.solution}")
```

## 已知限制

- MVP版本仅支持关键词匹配
- 暂不支持模糊匹配和同义词
- 暂不支持自然语言理解

## 下一步

- US2: 智能语义搜索
- US3: 故障诊断流程
- US4: 解决方案推荐
- US5: 学习反馈机制
