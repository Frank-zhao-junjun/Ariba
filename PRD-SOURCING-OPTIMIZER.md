# PRD: AI寻源场景优化器 v1.8

## 1. 产品概述

**功能名称**: AI Sourcing Scenario Optimizer  
**版本**: v1.8  
**类型**: 智能寻源决策支持模块

**一句话价值**: 基于AI算法自动生成多维度寻源方案，智能推荐最优供应商组合，降低采购成本10-15%

**解决的问题**:
- 手动评标效率低，人为偏见影响决策
- 多维度供应商比较困难（价格、质量、交期、风险）
- 总拥有成本(TCO)计算不完整
- 寻源周期长，影响生产计划

## 2. 功能范围

### 2.1 核心功能 (Must Have)

| 功能 | 描述 | 优先级 |
|------|------|--------|
| **场景创建** | 基于采购需求创建多个寻源场景 | P0 |
| **多维度评分** | 价格、质量、交期、风险四维评分 | P0 |
| **TCO计算** | 总拥有成本综合计算 | P0 |
| **智能推荐** | 基于分数自动推荐最优方案 | P0 |
| **可视化对比** | 多场景可视化对比展示 | P0 |

### 2.2 扩展功能 (Should Have)

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 敏感性分析 | 价格浮动对最优方案的影响 | P1 |
| 历史复盘 | 基于历史数据验证推荐准确性 | P1 |
| 导出报告 | 生成寻源决策报告 | P2 |

## 3. 用户故事

### US-001: 创建寻源场景
```
作为: 采购经理
我想: 基于采购需求创建多个寻源场景
以便: 系统能自动比较不同供应商组合的效果
```

**验收标准**:
- [ ] 输入采购物料和数量
- [ ] 选择候选供应商
- [ ] 设置各维度权重
- [ ] 系统生成场景列表

### US-002: 多维度供应商评分
```
作为: 采购专员
我想: 查看各供应商的多维度评分详情
以便: 理解每个方案的优劣势
```

**验收标准**:
- [ ] 显示价格得分（权重可配置）
- [ ] 显示质量得分（基于历史绩效）
- [ ] 显示交期得分（基于承诺vs实际）
- [ ] 显示风险得分（基于供应商评级）

### US-003: 智能推荐最优方案
```
作为: 采购经理
我想: 系统自动推荐最优供应商组合
以便: 快速做出采购决策
```

**验收标准**:
- [ ] 推荐Top 3方案并排序
- [ ] 说明推荐理由
- [ ] 显示与最优方案的差距
- [ ] 支持一键采纳推荐

### US-004: TCO总拥有成本计算
```
作为: 成本分析师
我想: 查看每个方案的总拥有成本
以便: 综合考虑采购成本和后续运营成本
```

**验收标准**:
- [ ] 计算采购价格
- [ ] 计算运输成本
- [ ] 计算质量成本（不良率×处理费）
- [ ] 计算库存持有成本
- [ ] 计算风险成本（潜在中断损失）

## 4. 数据模型

### 4.1 寻源场景 (SourcingScenario)
```typescript
interface SourcingScenario {
  id: string;
  name: string;
  purchaseReqId: string;
  items: ScenarioItem[];
  weightConfig: WeightConfig;
  suppliers: SupplierBid[];
  scores: ScenarioScore[];
  recommendation: Recommendation;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 评分配置 (WeightConfig)
```typescript
interface WeightConfig {
  price: number;      // 0-100, 默认30
  quality: number;    // 0-100, 默认30
  delivery: number;   // 0-100, 默认20
  risk: number;       // 0-100, 默认20
}
```

### 4.3 方案评分 (ScenarioScore)
```typescript
interface ScenarioScore {
  scenarioId: string;
  supplierId: string;
  totalScore: number;
  breakdown: {
    priceScore: number;
    qualityScore: number;
    deliveryScore: number;
    riskScore: number;
  };
  tco: TotalCostOfOwnership;
  recommendation: 'adopt' | 'consider' | 'reject';
  reason: string;
}
```

### 4.4 总拥有成本 (TotalCostOfOwnership)
```typescript
interface TotalCostOfOwnership {
  purchaseCost: number;
  shippingCost: number;
  qualityCost: number;      // defect_rate * handling_cost
  inventoryCost: number;    // holding_period * unit_cost * holding_rate
  riskCost: number;         // disruption_probability * potential_loss
  totalTCO: number;
}
```

## 5. API设计

### 5.1 创建寻源场景
```
POST /api/sourcing-scenarios
Request: {
  name: string;
  purchaseReqId: string;
  items: { materialId: string; quantity: number }[];
  supplierIds: string[];
  weightConfig: WeightConfig;
}
Response: { scenarioId: string; status: 'created' }
```

### 5.2 获取场景评分
```
GET /api/sourcing-scenarios/:id/scores
Response: {
  scenarios: ScenarioScore[];
  recommended: ScenarioScore;
  comparison: ScoreComparison;
}
```

### 5.3 敏感性分析
```
POST /api/sourcing-scenarios/:id/sensitivity
Request: { priceFluctuation: [-20%, +20%] }
Response: { sensitivityData: SensitivityChart[] }
```

## 6. 验收标准

### 功能验收
- [ ] 能创建寻源场景并关联采购需求
- [ ] 能自动计算多维度评分
- [ ] 能计算TCO并生成报告
- [ ] 能推荐最优方案并说明理由
- [ ] 能进行敏感性分析

### 性能验收
- [ ] 场景评分计算时间 < 2秒
- [ ] 支持最多20个供应商同时比较
- [ ] 支持最多5个场景并行计算

### 质量验收
- [ ] 评分结果与SAP Ariba一致
- [ ] 推荐准确率 > 80%（基于历史验证）
- [ ] UI响应时间 < 500ms

## 7. 里程碑

| 阶段 | 内容 | 目标日期 |
|------|------|----------|
| M1 | 基础框架和数据模型 | Day 1 |
| M2 | 多维度评分算法 | Day 2 |
| M3 | TCO计算引擎 | Day 3 |
| M4 | 智能推荐逻辑 | Day 4 |
| M5 | 前端UI和可视化 | Day 5 |
| M6 | 测试和部署 | Day 6 |

## 8. 风险与依赖

### 风险
- 评分算法准确性需要历史数据验证
- 多维度权重配置需要业务确认

### 依赖
- 需要Data Agent提供历史供应商绩效数据
- 需要合同摘要提供供应商评级信息
