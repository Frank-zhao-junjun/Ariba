/**
 * RFx/RFP/RFI/RFB 自动生成助手
 */

const RFxGenerator = require('./generator');

class RFxAssistant {
  constructor(options = {}) {
    this.generator = new RFxGenerator(options);
  }

  async generate(input) {
    try {
      const result = await this.generator.generate(input);
      return result;
    } catch (error) {
      return { success: false, error: error.message, message: 'RFx文档生成失败' };
    }
  }

  getSupportedTypes() {
    return [
      { type: 'RFQ', name: 'Request for Quotation', nameZh: '询价单', desc: '用于向供应商请求报价' },
      { type: 'RFP', name: 'Request for Proposal', nameZh: '招标书', desc: '用于征集供应商提案和方案' },
      { type: 'RFI', name: 'Request for Information', nameZh: '信息请求', desc: '用于收集供应商信息和能力' },
      { type: 'RFB', name: 'Request for Bid', nameZh: '投标邀请', desc: '正式邀请供应商参与投标' },
    ];
  }

  getSupportedCategories() {
    return [
      { category: 'MRO', name: 'MRO物料', desc: '维护、维修、运营物料' },
      { category: '原材料', name: '原材料', desc: '生产用原材料' },
      { category: '服务', name: '专业服务', desc: '咨询、实施、培训等服务' },
      { category: 'IT设备', name: 'IT设备', desc: '电脑、网络、服务器等IT设备' },
    ];
  }

  validate(input) {
    const errors = [];
    if (!input.type) errors.push('缺少RFx类型（type）');
    else if (!['RFQ', 'RFP', 'RFI', 'RFB'].includes(input.type.toUpperCase())) errors.push('RFx类型无效');
    if (!input.category) errors.push('缺少采购品类（category）');
    if (!input.items || !Array.isArray(input.items) || input.items.length === 0) errors.push('缺少物料清单（items）');
    return { valid: errors.length === 0, errors };
  }

  getExample(type = 'RFQ') {
    const examples = {
      RFQ: {
        type: 'RFQ', category: 'MRO',
        items: [
          { name: '轴承', spec: '6205-2Z SKF', qty: 100, unit: '个' },
          { name: '润滑油', spec: 'ISO VG 68', qty: 50, unit: '桶' }
        ],
        requirements: { deliveryDate: '2026-05-15', paymentTerms: 'NET30', quoteDeadline: '2026-04-25' },
        language: 'zh'
      },
      RFP: {
        type: 'RFP', category: 'IT设备',
        items: [
          { name: '服务器', spec: '16核CPU/64GB内存/1TB SSD', qty: 5, unit: '台' },
          { name: '网络交换机', spec: '48口万兆', qty: 3, unit: '台' }
        ],
        requirements: { background: '企业ERP系统升级项目', budget: '¥500,000-800,000', bidDeadline: '2026-05-01' },
        language: 'zh'
      }
    };
    return examples[type] || examples.RFQ;
  }
}

module.exports = RFxAssistant;
