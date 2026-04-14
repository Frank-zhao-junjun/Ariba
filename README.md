# Ariba项目实施助手 v1.1

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

### 3️⃣ Data Agent 数据分析助手 (v1.1新增)

| 功能 | 描述 |
|------|------|
| 📊 **自然语言查询** | 用口语化问题查询采购数据 |
| 📈 **多维度聚合** | 按供应商/时间/品类聚合分析 |
| 🔍 **趋势洞察** | 自动计算环比/同比增长 |
| 📉 **异常预警** | 智能识别数据异常 |

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
| **v1.1** | **Data Agent数据分析助手** | ✅ **已完成** |
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
