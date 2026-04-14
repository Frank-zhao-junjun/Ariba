/**
 * 采购申请智能辅助模块 (Guided Buying Copilot)
 * 
 * 功能：
 * 1. 主数据智能推荐（供应商、物料组、成本中心）
 * 2. 采购渠道引导
 * 3. 嵌入式FAQ
 * 4. 自由文本指导
 * 5. 策略监控
 */

const masterDataService = require('../../services/master-data-service');
const policyService = require('../../services/policy-service');

class GuidedBuyingService {
  constructor() {
    this.supportedIntents = [
      'recommend_vendor',
      'recommend_material',
      'recommend_cost_center',
      'check_policy',
      'guide_channel',
      'improve_description',
      'validate_request'
    ];
  }

  /**
   * 处理采购申请辅助请求
   */
  async processAssistance(params) {
    const { intent, query, context = {} } = params;
    
    try {
      switch (intent) {
        case 'recommend_vendor':
          return await this.recommendVendor(context);
        case 'recommend_material':
          return await this.recommendMaterial(context);
        case 'recommend_cost_center':
          return await this.recommendCostCenter(context);
        case 'check_policy':
          return await this.checkPolicy(query, context);
        case 'guide_channel':
          return await this.guideChannel(context);
        case 'improve_description':
          return await this.improveDescription(query);
        case 'validate_request':
          return await this.validateRequest(context);
        default:
          return { success: false, error: '未识别的意图' };
      }
    } catch (error) {
      console.error('GuidedBuyingService Error:', error);
      return { success: false, error: error.message };
    }
  }

  async recommendVendor(context) {
    const { category, preferredVendors, amount } = context;
    const vendors = await masterDataService.getRecommendedVendors({
      category, preferred: preferredVendors, amount, limit: 5
    });
    return {
      success: true,
      type: 'vendor_recommendation',
      data: {
        recommendations: vendors,
        hasContract: vendors.some(v => v.hasContract),
        preferredVendor: vendors.find(v => v.isPreferred)
      },
      message: this.formatVendorMessage(vendors)
    };
  }

  async recommendMaterial(context) {
    const { description, category } = context;
    const materials = await masterDataService.getRecommendedMaterials({
      description, category, limit: 5
    });
    return {
      success: true,
      type: 'material_recommendation',
      data: { recommendations: materials, matchedCategory: materials[0]?.category },
      message: this.formatMaterialMessage(materials)
    };
  }

  async recommendCostCenter(context) {
    const { department, project, costType } = context;
    const costCenters = await masterDataService.getRecommendedCostCenters({
      department, project, costType, limit: 3
    });
    return {
      success: true,
      type: 'cost_center_recommendation',
      data: { recommendations: costCenters, defaultCenter: costCenters[0] },
      message: this.formatCostCenterMessage(costCenters)
    };
  }

  async checkPolicy(query, context) {
    const policyCheck = await policyService.checkCompliance({ query, ...context });
    return {
      success: true,
      type: 'policy_check',
      data: policyCheck,
      message: this.formatPolicyMessage(policyCheck)
    };
  }

  async guideChannel(context) {
    const { amount, category, isCatalogItem, hasContract } = context;
    let channel = 'free_text';
    let reason = '';

    if (isCatalogItem) {
      channel = 'catalog'; reason = '系统中存在匹配的目录物料';
    } else if (hasContract) {
      channel = 'contract'; reason = '存在有效的框架协议';
    } else if (amount > 50000) {
      channel = 'competitive_bid'; reason = '金额超过50000，需要走竞价流程';
    } else if (amount > 10000) {
      channel = 'standard_po'; reason = '建议使用标准采购订单';
    } else {
      channel = 'simple_po'; reason = '小额采购，简单PO即可';
    }

    return {
      success: true,
      type: 'channel_guidance',
      data: { channel, reason, context },
      message: `建议使用「${this.getChannelName(channel)}」渠道。${reason}`
    };
  }

  async improveDescription(query) {
    const improved = query.trim().replace(/\s+/g, ' ');
    return {
      success: true,
      type: 'description_improvement',
      data: { original: query, improved, suggestions: this.getDescriptionSuggestions(query) },
      message: `建议修改为："${improved}"`
    };
  }

  async validateRequest(context) {
    const validations = [];
    const requiredFields = ['description', 'amount', 'category'];
    
    for (const field of requiredFields) {
      if (!context[field]) {
        validations.push({ field, status: 'error', message: `缺少必填字段: ${field}` });
      }
    }

    if (context.amount && context.amount > 1000000) {
      validations.push({ field: 'amount', status: 'warning', message: '金额较大，建议确认审批权限' });
    }

    if (context.amount > 50000 && !context.attachment) {
      validations.push({ field: 'attachment', status: 'warning', message: '金额超过50000，建议附上询价单' });
    }

    const hasErrors = validations.some(v => v.status === 'error');
    return {
      success: true,
      type: 'request_validation',
      data: { validations, isValid: !hasErrors, canSubmit: validations.filter(v => v.status === 'error').length === 0 },
      message: hasErrors ? '存在错误，请修正后提交' : '校验通过，可以提交'
    };
  }

  formatVendorMessage(vendors) {
    if (vendors.length === 0) return '未找到匹配的供应商，请联系采购部门添加';
    const lines = ['推荐供应商：'];
    vendors.forEach((v, i) => {
      const tag = v.isPreferred ? '[优选] ' : '';
      const contract = v.hasContract ? '(有协议价)' : '';
      lines.push(`${i + 1}. ${tag}${v.name} ${contract}`);
    });
    return lines.join('\n');
  }

  formatMaterialMessage(materials) {
    if (materials.length === 0) return '未找到匹配的物料，请使用自由文本描述';
    const lines = ['推荐物料组：'];
    materials.forEach((m, i) => lines.push(`${i + 1}. ${m.groupName} (${m.code})`));
    return lines.join('\n');
  }

  formatCostCenterMessage(costCenters) {
    if (costCenters.length === 0) return '未找到匹配的成本中心，请联系财务部门';
    return `推荐成本中心：${costCenters[0].name} (${costCenters[0].code})`;
  }

  formatPolicyMessage(policyCheck) {
    if (policyCheck.isCompliant) return `✅ 符合采购政策：${policyCheck.policyName}`;
    const lines = ['⚠️ 存在以下政策冲突：'];
    (policyCheck.violations || []).forEach((v, i) => lines.push(`${i + 1}. ${v.description}`));
    return lines.join('\n');
  }

  getChannelName(channel) {
    const names = { catalog: '目录采购', contract: '协议采购', competitive_bid: '竞价采购', standard_po: '标准采购订单', simple_po: '简化采购订单', free_text: '自由文本申请' };
    return names[channel] || channel;
  }

  getDescriptionSuggestions(description) {
    const suggestions = [];
    if (description && description.length < 20) suggestions.push('描述过于简单，建议添加更多细节');
    if (description && !/[型号|规格|数量|品牌]/i.test(description)) suggestions.push('建议包含：规格、型号、数量等信息');
    if (description && !/\d+/.test(description)) suggestions.push('建议添加数量或预算金额');
    return suggestions;
  }
}

module.exports = new GuidedBuyingService();
