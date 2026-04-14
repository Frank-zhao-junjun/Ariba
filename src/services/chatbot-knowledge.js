const policyDocuments = [
  { id: 'POL-001', category: '审批流程', title: '采购金额阈值与审批权限', content: '金额分级：<5000元直接采购；5000-20000元部门主管；20000-100000元部门主管+采购经理；100000-500000元三级审批；>500000元需CEO审批。紧急采购需标注原因并获VP批准。' },
  { id: 'POL-002', category: '供应商管理', title: '供应商资质要求', content: 'A级：全面审核+现场考察，无金额上限；B级：文件审核，最高50万；C级：基础审核，最高10万。新供应商引入需填写申请表并提供3家比价。' },
  { id: 'POL-003', category: '采购渠道', title: '采购渠道选择规则', content: '1.目录采购(办公/MRO) 2.协议采购 3.竞价采购(>5万，需3家) 4.标准询价(2-5万，需2家) 5.紧急采购(仅限紧急)。' },
  { id: 'POL-004', category: '付款条款', title: '付款政策和账期', content: 'A级供应商：月结60天；B级供应商：月结30天；C级供应商：预付或到付。收货后7日内提交付款申请。' }
];
const vendors = [
  { id: 'V001', name: '华强电子科技有限公司', category: '电子元器件', contact: '李经理 138-0000-1234', rating: 4.8, level: 'A级', paymentTerm: '60天' },
  { id: 'V002', name: '光明办公用品有限公司', category: '办公用品', contact: '王经理 139-0000-5678', rating: 4.5, level: 'B级', paymentTerm: '30天' },
  { id: 'V003', name: '东方机械设备有限公司', category: '生产设备', contact: '张经理 137-0000-9012', rating: 4.6, level: 'A级', paymentTerm: '60天' },
  { id: 'V004', name: '中科软件技术有限公司', category: 'IT服务', contact: '刘经理 136-0000-3456', rating: 4.9, level: 'A级', paymentTerm: '30天' },
  { id: 'V005', name: '鑫源MRO工业品超市', category: 'MRO物料', contact: '赵经理 135-0000-7890', rating: 4.3, level: 'B级', paymentTerm: '30天' }
];
const mockPurchaseRequests = [
  { id: 'PR-20260315-001', title: '研发部办公电脑采购', amount: 45000, status: '审批中', currentStep: '采购经理审批', submitDate: '2026-03-15' },
  { id: 'PR-20260312-002', title: '生产车间润滑油采购', amount: 8500, status: '已完成', currentStep: '已到货', submitDate: '2026-03-12' },
  { id: 'PR-20260318-003', title: 'IT系统升级项目', amount: 180000, status: '审批中', currentStep: '等待财务总监审批', submitDate: '2026-03-18' }
];
const departmentBudgets = [
  { department: '研发部', fiscalYear: 2026, totalBudget: 2000000, used: 850000, committed: 320000 },
  { department: '生产部', fiscalYear: 2026, totalBudget: 5000000, used: 3200000, committed: 800000 },
  { department: '信息中心', fiscalYear: 2026, totalBudget: 1500000, used: 600000, committed: 400000 }
];
const faqData = [
  { question: '超过多少金额需要CEO审批?', answer: '超过50万元的采购需要CEO审批。其他分级：5千-2万需部门主管；2万-10万需部门主管+采购经理；10万-50万需三级审批。' },
  { question: '付款周期是多久?', answer: '付款账期根据供应商等级：A级战略供应商60天，B级合格供应商30天，C级供应商需预付或到付。' },
  { question: '紧急采购怎么处理?', answer: '紧急采购需在系统中标注"紧急"并说明原因。24小时内完成的采购需部门VP批准。' }
];
module.exports = { policyDocuments, vendors, mockPurchaseRequests, departmentBudgets, faqData };
