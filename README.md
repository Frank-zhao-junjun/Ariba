# Ariba Assistant - 智能审批状态查询助手

> 基于Coze平台的商业软件实施助手，为SAP Ariba采购系统用户提供智能审批状态查询服务

## 🎯 项目简介

Ariba Assistant 是一款基于自然语言处理的智能采购审批助手，帮助企业用户通过对话方式快速查询采购申请、订单、发票的审批状态，减少支持工单，提升用户体验。

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 🔍 **智能状态查询** | 支持自然语言查询PR/PO/GR审批状态 |
| 💬 **政策问答** | 自动回答审批流程、时效等常见问题 |
| ⏰ **超时提醒** | 监控审批超时并主动提醒 |
| 📊 **多渠道支持** | 飞书、Slack、Teams等多平台接入 |
| 🔔 **状态通知** | 审批状态变更实时通知用户 |

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
```

## 📁 项目结构

```
ariba-assistant/
├── src/
│   ├── index.js           # 主入口
│   ├── webhook.js         # Webhook处理器
│   ├── services/
│   │   ├── ariba.js       # Ariba API服务
│   │   └── feishu.js      # 飞书通知服务
│   └── utils/
│       └── logger.js      # 日志工具
├── test/
│   └── test.js            # 测试脚本
├── package.json
├── .env.example
└── README.md
```

## 🔧 配置说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `PORT` | 否 | 服务端口，默认3000 |
| `ARIBAS_API_URL` | 是 | Ariba采购系统API地址 |
| `COZE_WEBHOOK_SECRET` | 否 | Webhook签名密钥 |
| `FEISHU_APP_ID` | 否 | 飞书应用App ID |
| `FEISHU_APP_SECRET` | 否 | 飞书应用App Secret |

## 💬 对话示例

### 查询采购申请

```
用户: PR12345到哪了
助手: 单号: 12345
      状态: 待审批
      类型: 采购申请
      金额: ¥5,000
      当前审批人: 张三
```

### 了解审批政策

```
用户: 审批流程是什么
助手: 采购审批流程如下：

1. 金额 < 5,000元: 部门主管审批
2. 金额 5,000-20,000元: 部门主管 + 采购经理审批
3. 金额 > 20,000元: 部门主管 + 采购经理 + 财务总监审批
```

## 📊 产品路线图

| 阶段 | 功能 | 状态 |
|------|------|------|
| v1.0 | 审批状态查询、FAQ问答 | ✅ 已完成 |
| v1.1 | 飞书渠道集成、超时提醒 | 🔄 开发中 |
| v1.2 | 多语言支持、批量查询 | 📋 规划中 |

## 🧪 测试

```bash
npm test
```

---

**Made with ❤️ by Frank Zhao**
