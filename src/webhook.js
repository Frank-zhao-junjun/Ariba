/**
 * Webhook处理模块
 */

const express = require('express');
const crypto = require('crypto');
const logger = require('./utils/logger');
const aribaService = require('./services/ariba');
const feishuService = require('./services/feishu');

const APPROVAL_FAQ = {
  '审批流程': `采购审批流程如下：

1. **金额 < 5,000元**: 部门主管审批
2. **金额 5,000-20,000元**: 部门主管 + 采购经理审批
3. **金额 > 20,000元**: 部门主管 + 采购经理 + 财务总监审批
4. **金额 > 100,000元**: 需额外总经理审批

如需加急审批，请联系采购部门。`,
  '审批时间': `审批时效说明：

- 普通审批: 1-2个工作日
- 加急审批: 4小时内
- 紧急采购: 可申请绿色通道

审批被驳回常见原因：
- 预算超支
- 缺少附件（询价单/合同等）
- 供应商不在合格名单中`,
  '如何提交': `提交采购申请步骤：

1. 登录Ariba系统
2. 点击"创建采购申请"
3. 填写：物品描述、数量、预计金额、交货日期、成本中心
4. 上传必要的附件（如需要）
5. 提交申请

系统会自动路由到相应的审批人。`
};

function verifySignature(req) {
  const secret = process.env.COZE_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = req.headers['x-coze-signature'];
  const timestamp = req.headers['x-coze-timestamp'];
  if (!signature || !timestamp) return false;
  const body = JSON.stringify(req.body);
  const signString = `${timestamp}${body}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signString).digest('hex');
  return signature === expectedSignature;
}

function recognizeIntent(message) {
  if (/PR\s*(\d+)|采购申请.*状态|申请.*到哪|申请.*进度/i.test(message)) return 'query_pr_status';
  if (/PO\s*(\d+)|订单.*状态|订单.*到哪|订单.*进度/i.test(message)) return 'query_po_status';
  if (/收货|GR|到货|交付/i.test(message)) return 'query_gr_status';
  if (/审批流程|谁审批|怎么审批|谁来批/i.test(message)) return 'query_policy_process';
  if (/审批时间|多久|多长时间|等.*久/i.test(message)) return 'query_policy_time';
  if (/如何提交|怎么申请|怎么创建|提交.*步骤/i.test(message)) return 'query_how_to_apply';
  if (/驳回|为什么.*没批|为什么.*拒绝/i.test(message)) return 'query_rejection';
  if (/帮助|help|帮忙|怎么用|使用.*说明/i.test(message)) return 'help';
  if (/提醒|通知我|超时/i.test(message)) return 'set_reminder';
  return 'default_query';
}

async function handleMessage(message, userId) {
  logger.info('处理用户消息', { message, userId });
  const intent = recognizeIntent(message);
  const parsedId = aribaService.parseDocumentId(message);
  switch (intent) {
    case 'query_pr_status': return await handleQueryPR(parsedId);
    case 'query_po_status': return await handleQueryPO(parsedId);
    case 'query_gr_status': return await handleQueryGR(parsedId);
    case 'query_policy_process': case 'query_policy_time': case 'query_how_to_apply': return handlePolicyQuery(intent);
    case 'query_rejection': return handleRejectionQuery(message);
    case 'help': return handleHelp();
    case 'set_reminder': return handleSetReminder();
    case 'default_query': if (parsedId) return await handleDefaultQuery(parsedId);
    default: return handleUnrecognized();
  }
}

async function handleQueryPR(parsedId) {
  if (!parsedId || !parsedId.id) return '请提供采购申请编号，格式如：PR12345 或 直接输入数字';
  const result = await aribaService.getPurchaseRequestStatus(parsedId.id);
  if (result.success) return aribaService.formatApprovalStatus(result.data);
  return `❌ 查询失败: ${result.error}\n\n请确认申请编号是否正确，或稍后重试。`;
}

async function handleQueryPO(parsedId) {
  if (!parsedId || !parsedId.id) return '请提供采购订单编号，格式如：PO12345 或 直接输入数字';
  const result = await aribaService.getPurchaseOrderStatus(parsedId.id);
  if (result.success) return aribaService.formatApprovalStatus(result.data);
  return `❌ 查询失败: ${result.error}\n\n请确认订单编号是否正确，或稍后重试。`;
}

async function handleQueryGR(parsedId) {
  const params = parsedId?.id ? { id: parsedId.id } : {};
  const result = await aribaService.getGoodsReceipts(params);
  if (result.success && result.data.length > 0) {
    let message = '📦 **收货记录**\n\n';
    result.data.slice(0, 5).forEach(item => { message += `• GR${item.id}: ${item.status} - ${item.date}\n`; });
    return message;
  }
  return '未找到相关收货记录';
}

function handlePolicyQuery(intent) {
  const faqKey = { 'query_policy_process': '审批流程', 'query_policy_time': '审批时间', 'query_how_to_apply': '如何提交' }[intent];
  return APPROVAL_FAQ[faqKey] || '抱歉，暂不支持该问题咨询。请联系采购部门。';
}

function handleRejectionQuery() {
  return `审批被驳回常见原因：

1. **预算超支** - 申请金额超出预算额度
2. **缺少附件** - 询价单、合同或其他证明文件缺失
3. **供应商问题** - 供应商不在合格名单中或资质不符
4. **价格异常** - 单价偏离市场行情较大
5. **采购方式不当** - 应走招标流程但选择了直接采购

**建议操作**：
- 查看驳回备注了解具体原因
- 联系审批人确认修正方案
- 修改后重新提交或与采购部门沟通`;
}

function handleHelp() {
  return `🤖 **Ariba助手使用指南**

**常用功能**：

1. **查询审批状态**
   - "PR12345到哪了"
   - "PO98765什么状态"

2. **了解审批政策**
   - "审批流程是什么"
   - "5000块谁审批"
   - "审批要多久"

3. **如何提交申请**
   - "如何提交采购申请"
   - "怎么创建PR"

4. **审批被拒处理**
   - "为什么被驳回"
   - "申请被拒绝了怎么办"

直接输入申请编号（如12345）也可快速查询~`;
}

function handleSetReminder() {
  return `⏰ **审批超时提醒设置**

系统会监控以下超时情况：
- 审批人在2个工作日内未处理
- 紧急申请在4小时内未处理

**设置提醒**：
- 当您有待审批任务时，系统会自动提醒
- 您也可以直接联系审批人催促处理

如需加急处理，请拨打采购部门热线：400-XXX-XXXX`;
}

async function handleDefaultQuery(parsedId) {
  if (parsedId.type === 'pr') return await handleQueryPR(parsedId);
  if (parsedId.type === 'po') return await handleQueryPO(parsedId);
  return handleUnrecognized();
}

function handleUnrecognized() {
  return `🤔 我无法理解您的问题

**试试这样问我**：
- "PR12345到哪了" - 查询采购申请状态
- "PO98765什么状态" - 查询采购订单状态
- "审批流程是什么" - 了解审批政策
- "如何提交采购申请" - 查看提交指南

输入"帮助"获取更多信息~`;
}

function createWebhookRouter() {
  const router = express.Router();
  router.post('/coze', async (req, res) => {
    try {
      logger.info('收到Coze Webhook请求', { body: req.body });
      if (!verifySignature(req)) {
        logger.warn('Webhook签名验证失败');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { event, message } = req.body;
      if (event === 'message') {
        const userMessage = message?.content || '';
        const userId = message?.sender?.open_id || 'unknown';
        const response = await handleMessage(userMessage, userId);
        return res.json({ code: 0, msg: 'success', data: { content: response } });
      }
      return res.json({ code: 0, msg: 'event received' });
    } catch (error) {
      logger.error('Webhook处理异常', { error: error.message });
      return res.status(500).json({ error: 'Internal error' });
    }
  });
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'ariba-assistant' });
  });
  return router;
}

module.exports = { createWebhookRouter, handleMessage };
