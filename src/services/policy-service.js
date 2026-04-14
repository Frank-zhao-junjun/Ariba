/**
 * 采购政策服务
 * 检查采购申请是否符合公司政策
 */

const policies = {
  amount_threshold: {
    name: '金额阈值政策',
    rules: [
      { max: 10000, approval: '直线经理', requiresQuote: false },
      { max: 50000, approval: '部门总监', requiresQuote: true },
      { max: 100000, approval: '采购经理', requiresQuote: true },
      { max: Infinity, approval: 'CPO', requiresQuote: true }
    ]
  },
  vendor_approval: {
    name: '供应商认证政策',
    requireApprovedVendor: true,
    exceptions: ['紧急采购', '单一来源']
  },
  attachment: {
    name: '附件政策',
    requireAttachment: { threshold: 50000, types: ['quote', 'justification'] }
  }
};

class PolicyService {
  async checkCompliance(params) {
    const { amount = 0, category, vendor, attachment, description } = params;
    const violations = [];

    if (amount > 50000 && !attachment) {
      violations.push({ type: 'attachment_required', description: '金额超过50000，需附上询价单或说明' });
    }

    if (vendor && !vendor.isApproved && !this.isException(description)) {
      violations.push({ type: 'vendor_not_approved', description: `供应商 ${vendor.name} 尚未通过认证` });
    }

    if (description && description.length < 10) {
      violations.push({ type: 'description_too_short', description: '采购描述过于简单，建议补充详细信息' });
    }

    return {
      isCompliant: violations.length === 0,
      policyName: '采购合规检查',
      violations,
      requiredApproval: this.getAmountRule(amount).approval,
      requiresQuote: this.getAmountRule(amount).requiresQuote
    };
  }

  getAmountRule(amount) {
    for (const rule of policies.amount_threshold.rules) {
      if (amount <= rule.max) return rule;
    }
    return policies.amount_threshold.rules[policies.amount_threshold.rules.length - 1];
  }

  isException(description) {
    if (!description) return false;
    return policies.vendor_approval.exceptions.some(e => description.includes(e));
  }
}

module.exports = new PolicyService();
