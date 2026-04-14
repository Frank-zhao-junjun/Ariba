/**
 * RFx 文档模板库
 */

const templates = {
  RFQ: {
    title: 'Request for Quotation - 询价单',
    sections: [
      { id: 'overview', title: '1. 项目概述', required: true },
      { id: 'items', title: '2. 物料清单', required: true },
      { id: 'specs', title: '3. 技术规格', required: true },
      { id: 'terms', title: '4. 商务条款', required: true },
      { id: 'submission', title: '5. 报价提交要求', required: true },
      { id: 'timeline', title: '6. 时间节点', required: false },
    ],
    sectionsZh: [
      { id: 'overview', title: '一、项目概述', required: true },
      { id: 'items', title: '二、物料清单', required: true },
      { id: 'specs', title: '三、技术规格', required: true },
      { id: 'terms', title: '四、商务条款', required: true },
      { id: 'submission', title: '五、报价提交要求', required: true },
      { id: 'timeline', title: '六、时间节点', required: false },
    ]
  },
  RFP: {
    title: 'Request for Proposal - 招标书',
    sections: [
      { id: 'overview', title: '1. 项目背景与目标', required: true },
      { id: 'scope', title: '2. 采购范围', required: true },
      { id: 'requirements', title: '3. 功能需求', required: true },
      { id: 'evaluation', title: '4. 评标标准', required: true },
      { id: 'terms', title: '5. 合同条款', required: true },
      { id: 'submission', title: '6. 投标文件要求', required: true },
      { id: 'timeline', title: '7. 招标时间表', required: true },
    ],
    sectionsZh: [
      { id: 'overview', title: '一、项目背景与目标', required: true },
      { id: 'scope', title: '二、采购范围', required: true },
      { id: 'requirements', title: '三、功能需求', required: true },
      { id: 'evaluation', title: '四、评标标准', required: true },
      { id: 'terms', title: '五、合同条款', required: true },
      { id: 'submission', title: '六、投标文件要求', required: true },
      { id: 'timeline', title: '七、招标时间表', required: true },
    ]
  },
  RFI: {
    title: 'Request for Information - 信息请求',
    sections: [
      { id: 'purpose', title: '1. 目的说明', required: true },
      { id: 'company', title: '2. 公司简介', required: true },
      { id: 'capabilities', title: '3. 能力调研', required: true },
      { id: 'contact', title: '4. 联系方式', required: true },
    ],
    sectionsZh: [
      { id: 'purpose', title: '一、目的说明', required: true },
      { id: 'company', title: '二、公司简介', required: true },
      { id: 'capabilities', title: '三、能力调研', required: true },
      { id: 'contact', title: '四、联系方式', required: true },
    ]
  },
  RFB: {
    title: 'Request for Bid - 投标邀请',
    sections: [
      { id: 'invitation', title: '1. 投标邀请', required: true },
      { id: 'project', title: '2. 项目说明', required: true },
      { id: 'bidding', title: '3. 投标须知', required: true },
      { id: 'submission', title: '4. 投标文件递交', required: true },
    ],
    sectionsZh: [
      { id: 'invitation', title: '一、投标邀请', required: true },
      { id: 'project', title: '二、项目说明', required: true },
      { id: 'bidding', title: '三、投标须知', required: true },
      { id: 'submission', title: '四、投标文件递交', required: true },
    ]
  }
};

const categoryConfigs = {
  MRO: {
    name: 'MRO物料',
    commonSpecs: ['品牌要求', '质量标准', '最小订购量', '包装规格'],
    paymentTerms: ['NET30', 'NET60', '预付款'],
  },
  '原材料': {
    name: '原材料',
    commonSpecs: ['化学成分', '物理性能', '检测标准'],
    paymentTerms: ['T/T', 'L/C', '预付款30%'],
  },
  '服务': {
    name: '专业服务',
    commonSpecs: ['服务范围', '人员资质', '交付标准'],
    paymentTerms: ['月结30天', '里程碑付款'],
  },
  'IT设备': {
    name: 'IT设备',
    commonSpecs: ['品牌型号', '配置要求', '保修期限'],
    paymentTerms: ['NET30', 'NET45', '验收后付款'],
  },
};

module.exports = { templates, categoryConfigs };
