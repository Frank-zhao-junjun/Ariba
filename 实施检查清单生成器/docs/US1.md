# US1: 基础清单生成

## 用户故事
作为实施顾问，我希望能够基于项目阶段和Ariba模块快速生成标准检查清单，以便确保实施过程不遗漏关键步骤。

## 功能描述
- 基于项目阶段生成标准检查清单（需求分析→系统配置→数据迁移→用户培训→上线支持）
- 支持Ariba模块选择（Sourcing、Contract、Buying、Supplier、Spending等）
- 支持版本适配（V2505, V2602, V2604, V2605, VNextGen, VClassic）
- 输出格式化清单（Markdown/JSON/Excel）

## 验收标准
- [x] AC1.1: 根据项目阶段生成对应清单
- [x] AC1.2: 根据选择的Ariba模块调整清单项
- [x] AC1.3: 根据版本过滤不兼容的清单项
- [x] AC1.4: 输出格式化清单（Markdown/JSON/Excel）

## 项目阶段
1. **需求分析阶段** (Requirements Analysis)
2. **系统配置阶段** (System Configuration)
3. **数据迁移阶段** (Data Migration)
4. **用户培训阶段** (User Training)
5. **上线支持阶段** (Go-Live Support)

## Ariba模块
- **Sourcing**: 寻源管理
- **Contract**: 合同管理
- **Buying**: 采购执行
- **Supplier**: 供应商管理
- **Spending**: 支出分析

## 版本兼容性
- V2505: 2025年5月版本
- V2602: 2026年2月版本
- V2604: 2026年4月版本
- V2605: 2026年5月版本
- VNextGen: 下一代版本
- VClassic: 经典版本

## 实现状态
- [x] 核心生成引擎
- [x] 版本过滤逻辑
- [x] 多格式导出
- [x] 单元测试
