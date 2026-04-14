/**
 * Ariba API 服务模块
 */

const axios = require('axios');
const logger = require('../utils/logger');

const ARIBA_CONFIG = {
  baseURL: process.env.ARIBAS_API_URL || 'https://purchase.coze.cn',
  timeout: 10000
};

const aribaClient = axios.create(ARIBA_CONFIG);

aribaClient.interceptors.request.use((config) => {
  logger.debug('Ariba API请求', { url: config.url });
  return config;
});

async function getPurchaseRequestStatus(id) {
  try {
    logger.info('查询采购申请状态', { id });
    const response = await aribaClient.get(`/api/purchase-requests/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('查询采购申请失败', { id, error: error.message });
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

async function getPurchaseOrderStatus(id) {
  try {
    logger.info('查询采购订单状态', { id });
    const response = await aribaClient.get(`/api/purchase-orders/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('查询采购订单失败', { id, error: error.message });
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

async function getGoodsReceipts(params = {}) {
  try {
    logger.info('查询收货记录', params);
    const response = await aribaClient.get('/api/goods-receipts', { params });
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('查询收货记录失败', { error: error.message });
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

function formatApprovalStatus(request) {
  const statusMap = { DRAFT: '草稿', PENDING: '待审批', APPROVED: '已批准', REJECTED: '已驳回', PROCESSING: '处理中', COMPLETED: '已完成', CANCELLED: '已取消' };
  const status = statusMap[request.status] || request.status;
  let message = `单号: ${request.id}\n状态: ${status}\n类型: ${request.type || '采购申请'}\n`;
  if (request.amount) message += `金额: ¥${request.amount.toLocaleString()}\n`;
  if (request.submitter) message += `申请人: ${request.submitter}\n`;
  if (request.currentApprover) message += `当前审批人: ${request.currentApprover}\n`;
  if (request.approvalHistory && request.approvalHistory.length > 0) {
    message += '\n审批历史:\n';
    request.approvalHistory.forEach((item, index) => {
      const approverStatus = item.action === 'APPROVE' ? '✅' : item.action === 'REJECT' ? '❌' : '⏳';
      message += `${index + 1}. ${approverStatus} ${item.approver} - ${item.action} (${item.date})\n`;
      if (item.comment) message += `   备注: ${item.comment}\n`;
    });
  }
  return message;
}

function parseDocumentId(input) {
  const prMatch = input.match(/PR\s*(\d+)/i) || input.match(/采购申请\s*(\d+)/);
  if (prMatch) return { type: 'pr', id: prMatch[1] };
  const poMatch = input.match(/PO\s*(\d+)/i) || input.match(/采购订单\s*(\d+)/);
  if (poMatch) return { type: 'po', id: poMatch[1] };
  const grMatch = input.match(/GR\s*(\d+)/i) || input.match(/收货\s*(\d+)/);
  if (grMatch) return { type: 'gr', id: grMatch[1] };
  const numMatch = input.match(/(\d+)/);
  if (numMatch) return { type: 'pr', id: numMatch[1] };
  return null;
}

module.exports = { getPurchaseRequestStatus, getPurchaseOrderStatus, getGoodsReceipts, formatApprovalStatus, parseDocumentId };
