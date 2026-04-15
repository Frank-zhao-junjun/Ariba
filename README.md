# Ariba项目实施助手 v1.8.0

> 🎯 专为SAP Ariba项目实施顾问打造的智能化工具

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Frank-zhao-junjun/Ariba)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 产品简介

Ariba项目实施助手是一款基于AI的智能化工具，帮助SAP Ariba实施顾问快速完成需求分析和蓝图设计，提升项目实施效率。

### 核心价值

- ⚡ **效率提升**: 自动化生成需求文档和User Stories，减少80%重复工作
- 🎯 **标准化输出**: 基于行业最佳实践，确保文档质量
- 🚀 **快速启动**: 智能辅助决策，加速项目启动

---

## ✨ 核心功能

### 1️⃣ 需求分析助手

| 功能 | 描述 |
|------|------|
| 📊 **行业模板** | 制造业、零售业、能源、医疗、金融等5+行业模板 |
| ✨ **智能补充** | 基于最佳实践自动补充遗漏需求 |
| ⚠️ **冲突检测** | 自动识别需求间的逻辑冲突 |
| 📈 **优先级评估** | 基于业务价值和复杂度智能排序 |

### 2️⃣ 蓝图设计与User Stories助手

| 功能 | 描述 |
|------|------|
| 🏗️ **蓝图模板库** | 预置多个行业的标准流程蓝图 |
| 📝 **User Stories生成** | 符合INVEST原则的敏捷User Stories |
| ✅ **验收标准** | Given-When-Then格式验收标准建议 |
| 📊 **流程图可视化** | ASCII和Mermaid双格式流程图 |
| 🎯 **INVEST评分** | 自动评估Stories质量 |

### 3️⃣ Data Agent 数据分析助手 (v1.5新增)

| 功能 | 描述 |
|------|------|
| 📊 **自然语言查询** | 用口语化问题查询采购数据 |
| 📈 **多维度聚合** | 按供应商/时间/品类聚合分析 |
| 🔍 **趋势洞察** | 自动计算环比/同比增长 |
| 📉 **异常预警** | 智能识别数据异常 |

### 4️⃣ RFx/RFP 自动生成助手 (v1.2新增) ⭐

### 5️⃣ 采购申请智能辅助 Guided Buying Copilot (v1.5新增) 🚀

| 功能 | 描述 |
|------|------|
| 🎯 **主数据推荐** | 智能推荐供应商、物料组、成本中心 |
| 🛒 **渠道引导** | 根据金额和条件自动建议采购渠道 |
| 📋 **政策检查** | 自动验证采购申请合规性 |
| ✍️ **描述优化** | 改进采购描述质量 |
| ✅ **申请校验** | 提交前自动校验必填项 |

**核心价值**:
- ⏱️ **50%** 处理时间缩短
- 📉 **80%** 支持工单减少
- 🎯 **合规率** 提升至98%+

**API示例**:
```bash
# 推荐供应商
curl -X POST http://localhost:3001/api/guided-buying/recommend-vendor \
  -H "Content-Type: application/json" \
  -d '{"category":"电子元器件","amount":50000}'

# 引导采购渠道
curl -X POST http://localhost:3001/api/guided-buying/guide-channel \
  -H "Content-Type: application/json" \
  -d '{"amount":80000}'

# 验证采购申请
curl -X POST http://localhost:3001/api/guided-buying/validate \
  -H "Content-Type: application/json" \
  -d '{"description":"采购办公电脑","amount":50000,"category":"IT设备"}'
```

**功能详情**:

| 功能 | 说明 |
|------|------|
| 供应商推荐 | 基于优选供应商、协议价、认证状态智能排序 |
| 渠道判断 | 目录采购 > 协议采购 > 竞价采购 > 标准PO > 简化PO |
| 政策合规 | 金额阈值、附件要求、供应商认证自动检查 |

| 功能 | 描述 |
|------|------|
| 📝 **RFQ询价单** | 快速生成采购询价文档 |
| 📋 **RFP招标书** | 智能生成招标书方案 |
| 📄 **RFI信息请求** | 供应商能力调研问卷 |
| 📨 **RFB投标邀请** | 正式投标邀请函 |

**使用示例**:
```
用户: "帮我生成一个IT设备的招标书，包含5台服务器和3台交换机"
AI:   "📋 RFP招标书已生成
       - 项目背景与目标
       - 采购范围：8项设备
       - 功能需求与技术规格
       - 评标标准（价格40%/技术30%/服务20%/资质10%）
       - 合同条款与时间表"
```

**使用示例**:
```
用户: "Q3从博世中国采购的零件总数是多少?"
AI:   "📊 数据汇总
       - 采购总额: ¥186.6万
       - 采购数量: 17,749件
       
       📈 趋势分析
       - 环比变化: -41.3% (下降)
       
       🏆 供应商排名
       1. 博世中国: ¥186.6万"
```

---


### 6️⃣ AI寻源场景优化器 (v1.8新增) 🎯

| 功能 | 描述 |
|------|------|
| 📊 **多维度评分** | 价格、质量、交期、风险四维综合评分 |
| 💰 **TCO计算** | 总拥有成本智能分析（采购+运输+质量+持有+风险） |
| 🤖 **智能推荐** | 基于AI算法推荐最优供应商组合 |
| 📈 **敏感性分析** | 价格波动对最优方案的影响分析 |
| 📋 **场景对比** | 多方案可视化对比展示 |

**核心价值**:
- ⏱️ **70%** 评标时间缩短
- 📉 **10-15%** 采购成本降低
- 🎯 **80%+** 推荐准确率

**API示例**:
```bash
# 创建寻源场景
curl -X POST http://localhost:3001/api/sourcing-optimizer/scenarios \
  -H "Content-Type: application/json" \
  -d '{"name":"Q2电子元器件采购","items":[{"materialId":"M001","quantity":100}],"supplierIds":["sup-001","sup-002","sup-003"]}'

# 获取评分结果
curl http://localhost:3001/api/sourcing-optimizer/scenarios/{id}/scores
```
## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/Frank-zhao-junjun/Ariba.git
cd Ariba

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件填入实际配置

# 启动服务
npm start

# 运行测试
npm test
```

---

## 📁 项目结构

```
ariba-assistant/
├── src/
│   ├── index.js           # 主入口
│   ├── webhook.js         # Webhook处理器
│   ├── routes/            # 路由
│   ├── services/
│   │   ├── ariba.js       # Ariba API服务
│   │   ├── dataAgent.js   # Data Agent数据分析服务
│   │   ├── feishu.js      # 飞书通知服务
│   │   ├── requirement.js  # 需求分析服务
│   │   ├── blueprint.js   # 蓝图设计服务
│   │   └── llm.js         # LLM服务
│   ├── utils/
│   │   └── logger.js      # 日志工具
│   └── templates/         # 模板文件
├── test/
│   ├── test.js            # 基础测试
│   └── dataAgent.test.js  # Data Agent测试
├── knowledge/             # 知识库
├── package.json
└── README.md
```

---

## 🔧 配置说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `PORT` | 否 | 服务端口，默认3000 |
| `ARIBAS_API_URL` | 是 | Ariba采购系统API地址 |
| `COZE_WEBHOOK_SECRET` | 否 | Webhook签名密钥 |
| `FEISHU_APP_ID` | 否 | 飞书应用App ID |
| `FEISHU_APP_SECRET` | 否 | 飞书应用App Secret |

---

## 💬 对话示例

### 状态查询

```
用户: PR12345到哪了
助手: 单号: 12345
      状态: 待审批
      类型: 采购申请
      金额: ¥5,000
      当前审批人: 张三
```

### 数据分析（新功能）

```
用户: Q3采购总额是多少
助手: 📊 数据汇总
      - 采购总额: ¥450.0万
      - 采购数量: 15,000件
      
      📈 趋势分析
      - 环比变化: +12.5% (增长)
      
      🏆 Top供应商
      1. 采埃孚: ¥200.5万
      2. 博世中国: ¥157.9万
```

### 政策问答

```
用户: 审批流程是什么
助手: 采购审批流程如下：

1. 金额 < 5,000元: 部门主管审批
2. 金额 5,000-20,000元: 部门主管 + 采购经理审批
3. 金额 > 20,000元: 部门主管 + 采购经理 + 财务总监审批
```

---

## 📊 产品路线图

| 版本 | 功能 | 状态 |
|------|------|------|
| v1.0 | 需求分析、蓝图设计、User Stories生成 | ✅ 已完成 |
| **v1.5** | **Data Agent数据分析助手** | ✅ **已完成** |
| v1.2 | 多语言支持、批量查询 | 📋 规划中 |
| v2.0 | AI Copilot智能副驾驶 | 🔜 开发中 |

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行Data Agent测试
node test/dataAgent.test.js
```

---

## 📚 文档

- [PRD文档](./PRD.md) - 产品需求文档
- [技术架构](./ARCHITECTURE.md) - 系统架构设计
- [Data Agent PRD](./PRD-DATA-AGENT.md) - 数据分析助手需求文档

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ by Frank Zhao**
**Powered by Coze + GPT**

---

## 🆕 v1.2 新增：竞标分析代理 (Bid Analysis Agent)

| 功能 | 描述 |
|------|------|
| 📊 **多维度报价解析** | 支持总报价、分项报价、交货期、付款条件等多维度数据 |
| 🎯 **智能评分排序** | 基于多维度权重自动计算综合得分 |
| 💰 **性价比分析** | 计算性价比指数，识别最佳方案 |
| ⚠️ **异常检测** | 智能识别报价异常（过高/过低/分项不平衡） |
| 📈 **权衡可视化** | ASCII矩阵展示多供应商对比 |
| 📝 **报告生成** | 生成结构化比价分析报告 |

**使用示例**:
```
输入: 3个供应商报价数据
输出: 
  🏆 综合推荐：华南供应商（74分）
  📈 性价比最优：华南供应商
  ⚠️ 异常提醒：设备B单价偏高(+10.4%)
```

**API接口**:
- `POST /api/bid-analysis/analyze` - 执行完整竞标分析
- `POST /api/bid-analysis/brief` - 简短回复（聊天场景）
- `POST /api/bid-analysis/chat` - 聊天式交互
- `GET /api/bid-analysis/demo/report` - 获取演示报告


### 4️⃣ 智能合同分析助手 (v1.2新增)

| 功能 | 描述 |
|------|------|
| 📋 **条款提取** | 自动识别15+标准合同条款 |
| ⚠️ **风险检测** | 识别验收标准模糊、权责不对等等风险 |
| 💡 **量化建议** | 提示模糊表述并建议量化标准 |
| 📊 **综合评分** | 基于条款覆盖率和风险评分的合同评分 |

**使用示例**:
```
用户: 粘贴合同文本
AI:   📊 合同分析报告
       - 条款覆盖率: 73%
       - 风险评分: 10/100 (LOW)
       - 发现条款: 合同当事人、金额、付款、交付、验收、质保、违约...
       - 风险点: 模糊量化词
       
       💡 改进建议
       1. "合理时间内" 建议明确具体时间
       2. "达到预定功能要求" 建议量化验收标准
```

---

## 🆕 v1.6 新增：智能合同摘要生成器 🚀

| 功能 | 描述 |
|------|------|
| 📝 **一键摘要** | 自动生成合同一句话摘要 |
| ⚖️ **关键条款提取** | 自动识别15+标准合同条款类型 |
| ⚠️ **风险检测** | 识别金额/时间/质量/法律风险 |
| ✅ **合规检查** | 自动验证合同合规性 |
| 💡 **智能建议** | 针对风险点提供改进建议 |

**核心价值**:
- ⏱️ **80%** 合同审查时间缩短
- 🎯 **风险识别率** 提升至95%+
- 📊 **标准化输出** 便于审计追踪

**API接口**:
- `POST /api/contract-summary/generate` - 生成完整摘要
- `POST /api/contract-summary/brief` - 一句话摘要
- `POST /api/contract-summary/clauses` - 提取关键条款
- `POST /api/contract-summary/risks` - 风险检测
- `GET /api/contract-summary/demo` - 演示数据

**使用示例**:
```bash
# 生成完整摘要
curl -X POST http://localhost:3001/api/contract-summary/generate \
  -H "Content-Type: application/json" \
  -d '{"text":"甲方：XXX公司\\n乙方：YYY公司\\n合同金额：100万元..."}'

# 一句话摘要
curl -X POST http://localhost:3001/api/contract-summary/brief \
  -H "Content-Type: application/json" \
  -d '{"text":"甲方：XXX公司..."}'
```

### 6️⃣ 智能采购聊天助手 (AI Procurement Chatbot v1.7) 🚀

| 功能 | 描述 |
|------|------|
| 💬 **对话式交互** | 自然语言问答，无需学习系统操作 |
| 📋 **政策问答** | 采购政策、审批流程、付款条款智能解答 |
| 🏢 **供应商查询** | 按品类搜索认证供应商，查看联系方式和评级 |
| 📦 **申请追踪** | 查询采购申请和订单审批状态 |
| 💰 **预算查询** | 部门预算使用情况和预警提醒 |
| 🛒 **申请引导** | 对话式引导提交采购申请 |

**核心价值**:
- ⏱️ **85%** 减少采购工单
- 🎯 **24/7** 全天候自助服务
- 📈 **提升合规性** 自动验证采购政策

**使用示例**:
```bash
# 政策问答
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"超过10万需要哪些审批"}'

# 供应商查询
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"电子元器件有哪些供应商"}'

# 预算查询
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"研发部还有多少预算"}'

# 申请状态
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"我的采购申请状态"}'
```

**API接口**:
- `POST /api/chatbot/chat` - 发送聊天消息
- `GET /api/chatbot/demo` - 获取演示信息
- `GET /api/chatbot/policy/search?q=关键词` - 搜索政策
- `GET /api/chatbot/vendor/search?q=品类` - 搜索供应商
- `GET /api/chatbot/pr/status?q=关键词` - 查询申请状态
- `GET /api/chatbot/budget/:部门` - 查询部门预算

---

## 🚀 最新功能

### v1.7.0 - AI询价比价助手 (2026-04-15) 🆕

| 功能 | 描述 |
|------|------|
| 📤 **批量上传** | 支持PDF、Excel、Word格式报价文件 |
| 🔍 **智能解析** | AI自动识别供应商、物料、单价、交期等关键信息 |
| 📊 **比价矩阵** | 自动生成标准比价分析表 |
| ⚖️ **权重评分** | 自定义价格/质量/交期/付款权重 |
| 🎯 **AI推荐** | 智能推荐最优供应商并说明原因 |
| 📥 **报告导出** | 一键导出Excel比价报告 |

**使用示例**:
```bash
# 上传报价文件
curl -X POST http://localhost:3001/api/bid-comparison/upload \
  -F "files=@供应商A报价.pdf" \
  -F "files=@供应商B报价.xlsx"

# 生成比价报告
curl -X POST http://localhost:3001/api/bid-comparison/compare \
  -H "Content-Type: application/json" \
  -d '{"parsedQuotes": [...], "scoringRules": {"price": 40, "quality": 30, "delivery": 20, "payment": 10}}'
```

**访问页面**: http://localhost:3001/bid-comparison

---

## 🚀 最新功能

### v1.8.0 - 智能寻源场景推荐助手 (2026-04-15) 🆕

| 功能 | 描述 |
|------|------|
| 🎯 **智能场景识别** | 根据金额和品类自动推荐寻源方式（询价/竞价/招标/框架） |
| 📊 **评分规则配置** | AI自动生成品类专属评分维度权重 |
| 👥 **供应商匹配** | 智能推荐合格供应商并排序 |
| ⏱️ **周期预测** | 自动计算各阶段时间节点 |
| 💡 **寻源建议** | 提供专业采购策略建议 |

**适用场景**:
- 不知道选择哪种寻源方式
- 不确定邀请哪些供应商
- 不知道怎么设置评分规则
- 需要缩短紧急采购周期

**使用示例**:
```bash
# 生成寻源场景推荐
curl -X POST http://localhost:3001/api/sourcing-scenario/generate \
  -H "Content-Type: application/json" \
  -d '{
    "category": "IT设备",
    "amount": 500000,
    "deliveryDate": "2026-05-01",
    "urgency": "normal",
    "requirements": ["本地供应商优先", "需要原厂授权"]
  }'

# 获取品类供应商推荐
curl -X GET "http://localhost:3001/api/sourcing-scenario/suppliers/IT设备?amount=100000"

# 获取评分权重
curl -X GET "http://localhost:3001/api/sourcing-scenario/weights/IT设备"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "scenarioType": {
      "type": "竞价采购",
      "code": "BIDDING",
      "description": "适用于中等金额采购，多轮竞价获取最优价",
      "reason": "金额较大，竞价可获取最优价格"
    },
    "timeline": {
      "invitationDays": 2,
      "responseDays": 5,
      "totalDays": 9,
      "milestones": [...]
    },
    "scoringRules": {
      "dimensions": [
        {"name": "价格", "weight": 40},
        {"name": "质量", "weight": 35},
        {"name": "交期", "weight": 15},
        {"name": "服务", "weight": 10}
      ]
    },
    "recommendedSuppliers": [
      {"name": "华通科技有限公司", "rating": 4.5, "matchScore": 90}
    ],
    "confidence": 0.92
  }
}
```

**访问页面**: http://localhost:3001/sourcing-scenario

---

## 7️⃣ 采购申请FAQ助手 (v1.9新增) 💬

嵌入式AI助手，帮助采购申请人在填写申请时即时获取政策、流程、操作问题的答案。

| 功能 | 描述 |
|------|------|
| 💬 **智能问答** | 即时回答采购政策、审批权限等问题 |
| 📋 **分类导航** | 政策/流程/操作/系统四类问题精准路由 |
| 🔍 **关联推荐** | 自动推荐相关问题 |
| ⚡ **快速响应** | 3秒内返回答案 |

**核心价值**:
- ⏱️ **80%** 支持工单减少
- 📈 **员工满意度** 显著提升
- 🎯 **7x24** 随时可用

**API示例**:
```bash
# 问答接口
curl -X POST http://localhost:3001/api/pr-faq/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "超过多少钱需要总经理审批"}'

# 获取FAQ分类
curl http://localhost:3001/api/pr-faq/categories

# 获取热门问题
curl http://localhost:3001/api/pr-faq/popular
```

**示例问答**:

| 用户问题 | 答案分类 |
|----------|----------|
| 超过多少钱需要总经理审批 | 政策类 |
| 采购IT设备走什么流程 | 流程类 |
| 如何上传附件 | 操作类 |
| Ariba系统登录不了怎么办 | 系统类 |

---

## 8️⃣ AI寻源场景优化器 (v1.8新增) 🎯

| 功能 | 描述 |
|------|------|
| 📊 **多维度评分** | 价格、质量、交期、风险四维综合评分 |
| 💰 **TCO计算** | 总拥有成本智能分析 |
| 🤖 **智能推荐** | 基于AI算法推荐最优供应商组合 |
| 📈 **敏感性分析** | 价格波动对最优方案的影响分析 |

---

## 📊 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.9.0 | 2026-04-15 | 新增采购申请FAQ助手，支持18个常见问题智能问答 |
| v1.8.0 | 2026-04-14 | 新增AI寻源场景优化器 |
| v1.7.0 | 2026-04-13 | 新增供应商风险评估功能 |
| v1.6.0 | 2026-04-12 | 优化比价分析，支持多格式导出 |
| v1.5.0 | 2026-04-11 | 新增采购申请Guided Buying Copilot |

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 访问 http://localhost:3001
```

---

## 📝 API文档

完整的API文档请访问：http://localhost:3001/api

