/**
 * 智能审批助手服务
 * 功能：对话式审批、批量审批、审批历史追踪
 */

// 模拟审批数据
const mockPendingApprovals = [
  {
    id: 'PR-2026-0415-001',
    type: '采购申请',
    title: 'IT设备采购 - 服务器升级',
    requester: '张明',
    department: 'IT部',
    amount: 150000,
    currency: 'CNY',
    submitDate: '2026-04-14',
    priority: '高',
    supplier: '华为技术有限公司',
    items: [
      { name: '服务器', quantity: 2, unitPrice: 50000 },
      { name: '存储设备', quantity: 1, unitPrice: 50000 }
    ],
    reason: '现有服务器已使用5年，性能不足，需升级以支持新业务系统'
  },
  {
    id: 'PR-2026-0415-002',
    type: '采购申请',
    title: '办公家具采购',
    requester: '李华',
    department: '行政部',
    amount: 45000,
    currency: 'CNY',
    submitDate: '2026-04-14',
    priority: '中',
    supplier: '宜家中国',
    items: [
      { name: '办公桌', quantity: 10, unitPrice: 1500 },
      { name: '办公椅', quantity: 10, unitPrice: 800 }
    ],
    reason: '新入职员工办公家具配置'
  },
  {
    id: 'PO-2026-0415-001',
    type: '采购订单',
    title: 'MRO备件采购 - 博世中国',
    requester: '王强',
    department: '生产部',
    amount: 186600,
    currency: 'CNY',
    submitDate: '2026-04-13',
    priority: '高',
    supplier: '博世中国投资有限公司',
    items: [
      { name: '轴承组件', quantity: 500, unitPrice: 200 }
    ],
    reason: 'Q2季度MRO备件库存补充'
  }
];

const mockApprovalHistory = [
  {
    id: 'PR-2026-0412-001',
    type: '采购申请',
    title: '市场活动物料采购',
    requester: '市场部',
    amount: 28000,
    status: '已批准',
    approvedBy: '张总',
    approvedDate: '2026-04-12',
    comment: '符合预算，批准'
  }
];

class ApprovalService {
  async getPendingApprovals(filters = {}) {
    let results = [...mockPendingApprovals];
    if (filters.type) results = results.filter(item => item.type.includes(filters.type));
    if (filters.department) results = results.filter(item => item.department.includes(filters.department));
    if (filters.priority) results = results.filter(item => item.priority === filters.priority);
    if (filters.minAmount) results = results.filter(item => item.amount >= filters.minAmount);
    if (filters.maxAmount) results = results.filter(item => item.amount <= filters.maxAmount);
    
    const summary = {
      total: results.length,
      totalAmount: results.reduce((sum, item) => sum + item.amount, 0),
      byType: { '采购申请': results.filter(i => i.type === '采购申请').length, '采购订单': results.filter(i => i.type === '采购订单').length },
      byPriority: { '高': results.filter(i => i.priority === '高').length, '中': results.filter(i => i.priority === '中').length }
    };
    return { success: true, approvals: results, summary };
  }
  
  async getApprovalDetail(id) {
    const approval = mockPendingApprovals.find(item => item.id === id);
    if (!approval) return { success: false, error: '审批项不存在' };
    return { success: true, approval, suggestion: this.generateLocalSuggestion(approval) };
  }
  
  generateLocalSuggestion(approval) {
    const reasons = [], warnings = [];
    if (approval.amount > 100000) reasons.push('金额较大，建议重点审核预算来源');
    else reasons.push('金额在常规范围内');
    if (['华为', '博世', '阿里', '腾讯'].some(s => approval.supplier.includes(s))) reasons.push('供应商为知名企业，可靠性较高');
    if (approval.priority === '高') warnings.push('高优先级审批，建议优先处理');
    return { suggestion: approval.amount > 50000 ? '建议重点审核' : '建议通过', riskLevel: approval.amount > 100000 ? '中' : '低', reasons, warnings };
  }
  
  async processApproval(id, action, comment = '') {
    const approval = mockPendingApprovals.find(item => item.id === id);
    if (!approval) return { success: false, error: '审批项不存在' };
    const actionText = { approve: '批准', reject: '拒绝', return: '退回' };
    const historyRecord = { ...approval, status: actionText[action], approvedBy: '当前用户', approvedDate: new Date().toISOString().split('T')[0], comment: comment || '无' };
    mockApprovalHistory.push(historyRecord);
    const index = mockPendingApprovals.findIndex(item => item.id === id);
    if (index > -1) mockPendingApprovals.splice(index, 1);
    return { success: true, message: approval.id + ' 已' + actionText[action], record: historyRecord };
  }
  
  async batchProcessApproval(ids, action, comment = '') {
    const results = { success: [], failed: [] };
    for (const id of ids) {
      const result = await this.processApproval(id, action, comment);
      if (result.success) results.success.push(id);
      else results.failed.push({ id, error: result.error });
    }
    return { success: true, processed: results.success.length, failed: results.failed.length, details: results };
  }
  
  async getApprovalHistory(filters = {}) {
    let results = [...mockApprovalHistory];
    if (filters.status) results = results.filter(item => item.status === filters.status);
    if (filters.type) results = results.filter(item => item.type.includes(filters.type));
    return { success: true, history: results };
  }
  
  async naturalLanguageQuery(query) {
    let filters = {}, response = '正在处理查询...';
    if (query.includes('IT') || query.includes('技术')) { filters.department = 'IT部'; response = '已筛选IT部门的待审批项'; }
    if (query.includes('高优先')) { filters.priority = '高'; response += '\n已添加高优先级筛选条件'; }
    if (query.includes('5万') || query.includes('50000')) { filters.minAmount = 50000; response += '\n已添加金额筛选：超过5万元'; }
    const queryResult = await this.getPendingApprovals(filters);
    return { success: true, intent: '查询', response: response + '\n\n找到 ' + queryResult.approvals.length + ' 项待审批', data: queryResult };
  }
  
  async getApprovalSummary() {
    const pending = await this.getPendingApprovals({});
    return { success: true, report: { pendingApprovals: pending.summary, highPriority: pending.approvals.filter(a => a.priority === '高'), totalPendingAmount: pending.summary.totalAmount, avgProcessingTime: '2.5天', approvalRate: '94.5%' } };
  }
}

module.exports = new ApprovalService();
