/**
 * 飞书通知服务模块
 */

const axios = require('axios');
const logger = require('../utils/logger');

const FEISHU_CONFIG = { baseURL: 'https://open.feishu.cn/open-apis', timeout: 10000 };

async function getTenantToken() {
  try {
    const response = await axios.post(`${FEISHU_CONFIG.baseURL}/auth/v3/tenant_access_token/internal`, {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    });
    if (response.data.code === 0) return response.data.tenant_access_token;
    throw new Error(`获取Token失败: ${response.data.msg}`);
  } catch (error) {
    logger.error('获取飞书Token失败', { error: error.message });
    throw error;
  }
}

async function sendTextMessage(openId, content) {
  try {
    const token = await getTenantToken();
    const response = await axios.post(`${FEISHU_CONFIG.baseURL}/im/v1/messages?receive_id_type=open_id`, {
      receive_id: openId,
      msg_type: 'text',
      content: JSON.stringify({ text: content })
    }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (response.data.code === 0) {
      logger.info('飞书消息发送成功', { openId });
      return { success: true, messageId: response.data.data.message_id };
    }
    throw new Error(`发送失败: ${response.data.msg}`);
  } catch (error) {
    logger.error('飞书消息发送失败', { openId, error: error.message });
    return { success: false, error: error.message };
  }
}

async function sendCardMessage(openId, cardData) {
  try {
    const token = await getTenantToken();
    const card = {
      config: { wide_screen_mode: true },
      elements: [
        { tag: 'markdown', content: cardData.content || '' },
        { tag: 'hr' },
        { tag: 'note', elements: [{ tag: 'plain_text', content: `Ariba助手 · ${new Date().toLocaleString('zh-CN')}` }] }
      ]
    };
    const response = await axios.post(`${FEISHU_CONFIG.baseURL}/im/v1/messages?receive_id_type=open_id`, {
      receive_id: openId,
      msg_type: 'interactive',
      content: JSON.stringify(card)
    }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (response.data.code === 0) return { success: true, messageId: response.data.data.message_id };
    throw new Error(`发送失败: ${response.data.msg}`);
  } catch (error) {
    logger.error('飞书卡片消息发送失败', { openId, error: error.message });
    return { success: false, error: error.message };
  }
}

async function sendApprovalReminder(openId, approvalInfo) {
  const content = `⏰ **审批超时提醒**\n\n您有一笔审批已等待较长时间：\n\n| 项目 | 信息 |\n|------|------|\n| 单号 | ${approvalInfo.id} |\n| 类型 | ${approvalInfo.type} |\n| 申请人 | ${approvalInfo.submitter} |\n| 金额 | ¥${approvalInfo.amount?.toLocaleString() || 'N/A'} |\n| 等待时间 | ${approvalInfo.waitTime} |\n\n请尽快处理，避免影响业务进度。`;
  return sendCardMessage(openId, { content });
}

async function sendStatusNotification(openId, statusInfo) {
  const statusEmoji = { 'APPROVED': '✅', 'REJECTED': '❌', 'PENDING': '⏳', 'PROCESSING': '🔄' };
  const emoji = statusEmoji[statusInfo.status] || '📋';
  const statusText = { 'APPROVED': '已批准', 'REJECTED': '已驳回', 'PENDING': '待审批', 'PROCESSING': '处理中' };
  const content = `${emoji} **审批状态更新**\n\n您的${statusInfo.type}有新动态：\n\n| 项目 | 信息 |\n|------|------|\n| 单号 | ${statusInfo.id} |\n| 状态 | ${statusText[statusInfo.status] || statusInfo.status} |\n${statusInfo.currentApprover ? `| 当前审批人 | ${statusInfo.currentApprover} |` : ''}\n${statusInfo.comment ? `| 备注 | ${statusInfo.comment} |` : ''}\n\n${statusInfo.nextStep || '请关注后续审批进度。'}`;
  return sendCardMessage(openId, { content });
}

function initFeishu() { logger.info('飞书服务已初始化'); }

module.exports = { initFeishu, sendTextMessage, sendCardMessage, sendApprovalReminder, sendStatusNotification };
