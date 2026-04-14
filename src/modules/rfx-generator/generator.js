/**
 * RFx 文档生成器核心
 */

const { templates, categoryConfigs } = require('./templates');

class RFxGenerator {
  constructor(options = {}) {
    this.language = options.language || 'zh';
    this.template = null;
  }

  validateInput(input) {
    if (!input.type || !['RFQ', 'RFP', 'RFI', 'RFB'].includes(input.type.toUpperCase())) {
      throw new Error('无效的RFx类型，支持: RFQ, RFP, RFI, RFB');
    }
    if (!input.category) {
      throw new Error('请指定采购品类');
    }
    if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
      throw new Error('请提供物料或服务清单');
    }
    return true;
  }

  async generate(input) {
    this.validateInput(input);
    const { type, category, items, requirements = {}, language } = input;
    this.language = language || 'zh';
    const upperType = type.toUpperCase();
    this.template = templates[upperType];
    const categoryConfig = categoryConfigs[category] || categoryConfigs['MRO'];
    
    const sections = [];
    if (upperType === 'RFQ') {
      sections.push(this.generateRFQOverview(upperType, category, requirements));
      sections.push(this.generateItemsList(items, category));
      sections.push(this.generateSpecs(items, categoryConfig, requirements));
      sections.push(this.generateCommercialTerms(requirements, categoryConfig));
      sections.push(this.generateSubmissionReqs(requirements));
      if (requirements.deliveryDate) sections.push(this.generateTimeline(requirements));
    } else if (upperType === 'RFP') {
      sections.push(this.generateRFPOverview(category, requirements));
      sections.push(this.generateRFPScope(items));
      sections.push(this.generateRFPRequirements(items, requirements));
      sections.push(this.generateEvaluationCriteria(requirements));
      sections.push(this.generateContractTerms(requirements));
      sections.push(this.generateRFPSubmission(requirements));
      sections.push(this.generateRFPTimeline(requirements));
    } else if (upperType === 'RFI') {
      sections.push(this.generateRFIPurpose(requirements));
      sections.push(this.generateCompanyIntro(requirements));
      sections.push(this.generateCapabilities(items));
      sections.push(this.generateContactInfo(requirements));
    } else if (upperType === 'RFB') {
      sections.push(this.generateRFBInvitation(category));
      sections.push(this.generateRFBProject(items, requirements));
      sections.push(this.generateRFBNotes(requirements));
      sections.push(this.generateRFBSubmission(requirements));
    }
    
    return {
      success: true,
      document: this.assembleDocument(upperType, category, sections),
      metadata: { generatedAt: new Date().toISOString(), type: upperType, category, language: this.language, version: '1.0' }
    };
  }

  generateRFQOverview(type, category, requirements) {
    const deliveryDate = requirements.deliveryDate || '待定';
    const deadline = requirements.quoteDeadline || '待定';
    if (this.language === 'zh') {
      return { id: 'overview', title: '一、项目概述', content: `## 一、项目概述\n\n本询价单旨在向合格供应商征集**${category}**类物料/服务报价。\n\n### 基本信息\n| 项目 | 内容 |\n|------|------|\n| 询价类型 | ${type} |\n| 采购品类 | ${category} |\n| 期望交货日期 | ${deliveryDate} |\n| 报价截止时间 | ${deadline} |\n\n### 报价要求\n1. 请提供含税报价\n2. 报价有效期不少于30天\n3. 包含运输费用至指定交货地点` };
    } else {
      return { id: 'overview', title: '1. Project Overview', content: `## 1. Project Overview\n\nThis RFQ solicits competitive bids for **${category}**.\n\n### General Info\n| Item | Content |\n|------|---------|\n| RFQ Type | ${type} |\n| Category | ${category} |\n| Expected Delivery | ${deliveryDate} |\n| Quote Deadline | ${deadline} |` };
    }
  }

  generateItemsList(items, category) {
    const itemRows = items.map((item, idx) => `| ${idx + 1} | ${item.name} | ${item.spec || '-'} | ${item.qty || 1} | ${item.unit || '个'} | ${item.note || '-'} |`).join('\n');
    if (this.language === 'zh') {
      return { id: 'items', title: '二、物料清单', content: `## 二、物料清单\n\n| 序号 | 物料名称 | 规格描述 | 数量 | 单位 | 备注 |\n|------|----------|----------|------|------|------|\n${itemRows}` };
    } else {
      return { id: 'items', title: '2. Item List', content: `## 2. Item List\n\n| No. | Item Name | Specification | Qty | Unit | Notes |\n|-----|-----------|---------------|-----|------|-------|\n${itemRows}` };
    }
  }

  generateSpecs(items, categoryConfig, requirements) {
    const specs = (categoryConfig.commonSpecs || []).map(s => `- ${s}`).join('\n');
    if (this.language === 'zh') {
      return { id: 'specs', title: '三、技术规格', content: `## 三、技术规格\n\n### 3.1 通用规格要求\n${specs}\n\n### 3.2 质量标准\n${requirements.qualityStandard || '需符合国家标准或行业标准'}\n\n### 3.3 认证要求\n${requirements.certifications ? requirements.certifications.map(c => `- ${c}`).join('\n') : '- 无特殊认证要求'}\n\n### 3.4 包装与标识\n- 包装需符合运输要求\n- 每件货物需有清晰标识\n- 随货附产品合格证` };
    } else {
      return { id: 'specs', title: '3. Technical Specifications', content: `## 3. Technical Specifications\n\n### 3.1 General Specifications\n${specs}\n\n### 3.2 Quality Standards\n${requirements.qualityStandard || 'Shall comply with national or industry standards'}\n\n### 3.3 Certification Requirements\n${requirements.certifications ? requirements.certifications.map(c => `- ${c}`).join('\n') : '- No special certification required'}` };
    }
  }

  generateCommercialTerms(requirements, categoryConfig) {
    const paymentTerms = requirements.paymentTerms || categoryConfig.paymentTerms[0] || 'NET30';
    if (this.language === 'zh') {
      return { id: 'terms', title: '四、商务条款', content: `## 四、商务条款\n\n### 4.1 价格条款\n- 价格类型：${requirements.priceType || '含税含运费价'}\n- 货币：${requirements.currency || '人民币 (CNY)'}\n\n### 4.2 付款条件\n- 付款方式：${paymentTerms}\n- ${this.paymentNotes[paymentTerms] || paymentTerms}\n\n### 4.3 交货条款\n- 交货地点：${requirements.deliveryAddress || '采购方指定地点'}\n- 运输方式：${requirements.shippingMethod || '供应商自定'}\n\n### 4.4 质保要求\n- 质保期：${requirements.warrantyPeriod || '不少于12个月'}\n- 质保范围：${requirements.warrantyScope || '材料/工艺质量问题'}` };
    } else {
      return { id: 'terms', title: '4. Commercial Terms', content: `## 4. Commercial Terms\n\n### 4.1 Pricing\n- Price Type: ${requirements.priceType || 'CIF (All-inclusive)'}\n- Currency: ${requirements.currency || 'CNY'}\n\n### 4.2 Payment Terms\n- Payment Method: ${paymentTerms}\n- ${this.paymentNotesEn[paymentTerms] || paymentTerms}\n\n### 4.3 Delivery\n- Location: ${requirements.deliveryAddress || 'Buyer designated'}\n\n### 4.4 Warranty\n- Period: ${requirements.warrantyPeriod || 'Min 12 months'}` };
    }
  }

  paymentNotes = { 'NET30': '交货验收合格后30天内付款', 'NET60': '交货验收合格后60天内付款', '预付款': '签订合同后预付30%，交货验收后付余款' };
  paymentNotesEn = { 'NET30': 'Payment within 30 days after acceptance', 'NET60': 'Payment within 60 days after acceptance', 'Prepaid': '30% advance, balance upon acceptance' };

  generateSubmissionReqs(requirements) {
    const deadline = requirements.quoteDeadline || '待定';
    if (this.language === 'zh') {
      return { id: 'submission', title: '五、报价提交要求', content: `## 五、报价提交要求\n\n### 5.1 提交截止时间\n**${deadline}**\n\n### 5.2 报价文件内容\n1. 单项物料/服务的单价及总价\n2. 交货周期\n3. 付款条件\n4. 质量保证说明\n5. 供应商资质证明\n\n### 5.3 提交方式\n- 邮箱：${requirements.submitEmail || '[填写接收邮箱]'}\n- 邮件主题：**RFQ报价 - [公司名称]**\n\n---\n*本询价单不构成采购承诺，最终采购决定权归采购方所有。*` };
    } else {
      return { id: 'submission', title: '5. Quote Submission', content: `## 5. Quote Submission\n\n### 5.1 Deadline\n**${deadline}**\n\n### 5.2 Required Contents\n1. Unit price and total price\n2. Delivery cycle\n3. Payment terms\n4. Quality assurance\n5. Supplier qualifications\n\n---\n*This RFQ does not constitute a purchase commitment.*` };
    }
  }

  generateTimeline(requirements) {
    if (this.language === 'zh') {
      return { id: 'timeline', title: '六、时间节点', content: `## 六、时间节点\n\n| 阶段 | 时间 |\n|------|------|\n| 询价发布 | ${requirements.rfqDate || new Date().toLocaleDateString('zh-CN')} |\n| 报价截止 | ${requirements.quoteDeadline || '待定'} |\n| 评审完成 | ${requirements.reviewDate || '待定'} |\n| 供应商确定 | ${requirements.decisionDate || '待定'} |\n| 期望交货 | ${requirements.deliveryDate || '待定'} |` };
    } else {
      return { id: 'timeline', title: '6. Timeline', content: `## 6. Timeline\n\n| Stage | Date |\n|-------|------|\n| RFQ Issued | ${requirements.rfqDate || new Date().toLocaleDateString('en-US')} |\n| Quote Deadline | ${requirements.quoteDeadline || 'TBD'} |\n| Evaluation | ${requirements.reviewDate || 'TBD'} |\n| Decision | ${requirements.decisionDate || 'TBD'} |\n| Delivery | ${requirements.deliveryDate || 'TBD'} |` };
    }
  }

  generateRFPOverview(category, requirements) {
    if (this.language === 'zh') {
      return { id: 'overview', title: '一、项目背景与目标', content: `## 一、项目背景与目标\n\n### 1.1 项目背景\n${requirements.background || '为提升企业采购效率，现拟采购' + category + '类物资/服务。'}\n\n### 1.2 采购目标\n1. ${requirements.goal1 || '获取最优性价比的产品/服务'}\n2. ${requirements.goal2 || '建立长期稳定的供应商合作关系'}\n3. ${requirements.goal3 || '确保供应链的稳定性和可靠性'}\n\n### 1.3 预算范围\n预算总额：${requirements.budget || '面议'}` };
    } else {
      return { id: 'overview', title: '1. Background & Objectives', content: `## 1. Background & Objectives\n\n### 1.1 Background\n${requirements.background || 'To improve procurement efficiency, we intend to procure ' + category + '.'}\n\n### 1.2 Objectives\n1. ${requirements.goal1 || 'Obtain optimal cost-performance'}\n2. ${requirements.goal2 || 'Establish stable supplier relationships'}\n3. ${requirements.goal3 || 'Ensure supply chain stability'}\n\n### 1.3 Budget\nTotal Budget: ${requirements.budget || 'Negotiable'}` };
    }
  }

  generateRFPScope(items) {
    if (this.language === 'zh') {
      return { id: 'scope', title: '二、采购范围', content: `## 二、采购范围\n\n本次采购涉及 **${items.length}** 项物料/服务。\n\n### 主要采购内容\n${items.map((item, idx) => `${idx + 1}. ${item.name} (${item.qty || '-'}${item.unit || '个'})`).join('\n')}` };
    } else {
      return { id: 'scope', title: '2. Procurement Scope', content: `## 2. Procurement Scope\n\nThis procurement covers **${items.length}** items.\n\n### Main Items\n${items.map((item, idx) => `${idx + 1}. ${item.name} (${item.qty || '-'}${item.unit || 'pcs'})`).join('\n')}` };
    }
  }

  generateRFPRequirements(items, requirements) {
    if (this.language === 'zh') {
      return { id: 'requirements', title: '三、功能需求', content: `## 三、功能需求\n\n### 3.1 必备功能 (Must-Have)\n${requirements.mustHave || items.map(i => `- ${i.name}：${i.spec || '符合行业标准'}`).join('\n')}\n\n### 3.2 期望功能 (Should-Have)\n${requirements.shouldHave || '- 具备数据对接能力\n- 提供使用培训\n- 支持后期扩展'}\n\n### 3.3 合规要求\n${requirements.compliance || '- 符合国家相关法律法规\n- 满足行业标准规范'}` };
    } else {
      return { id: 'requirements', title: '3. Requirements', content: `## 3. Requirements\n\n### 3.1 Must-Have\n${requirements.mustHave || items.map(i => `- ${i.name}: ${i.spec || 'Industry standard'}`).join('\n')}\n\n### 3.2 Should-Have\n${requirements.shouldHave || '- Data integration capability\n- Training support\n- Future expansion support'}` };
    }
  }

  generateEvaluationCriteria(requirements) {
    const criteria = requirements.evaluationCriteria || [
      { name: '价格', weight: 40 }, { name: '质量/技术', weight: 30 },
      { name: '交货期', weight: 15 }, { name: '服务', weight: 10 }, { name: '资质', weight: 5 }
    ];
    const rows = criteria.map(c => `| ${c.name} | ${c.weight}% |`).join('\n');
    if (this.language === 'zh') {
      return { id: 'evaluation', title: '四、评标标准', content: `## 四、评标标准\n\n### 4.1 评分权重\n\n| 评标维度 | 权重 |\n|----------|------|\n${rows}\n\n### 4.2 评标方法\n综合评分法或最低价法，招标方保留最终决定权。` };
    } else {
      return { id: 'evaluation', title: '4. Evaluation Criteria', content: `## 4. Evaluation Criteria\n\n### 4.1 Weights\n\n| Dimension | Weight |\n|-----------|--------|\n${rows}\n\n### 4.2 Method\nComprehensive scoring or lowest price. Buyer reserves final decision.` };
    }
  }

  generateContractTerms(requirements) {
    if (this.language === 'zh') {
      return { id: 'terms', title: '五、合同条款', content: `## 五、合同条款\n\n### 5.1 主要条款\n| 条款 | 内容 |\n|------|------|\n| 履约保证金 | ${requirements.performanceBond || '合同金额的5-10%'} |\n| 质量保证金 | ${requirements.qualityBond || '合同金额的5-10%'} |\n| 违约金 | ${requirements.penalty || '合同金额的10-20%'} |\n\n### 5.2 终止条款\n${requirements.termination || '招标方有权在合同签订前终止招标。'}` };
    } else {
      return { id: 'terms', title: '5. Contract Terms', content: `## 5. Contract Terms\n\n### 5.1 Key Terms\n| Term | Content |\n|------|---------|\n| Performance Bond | ${requirements.performanceBond || '5-10% of contract'} |\n| Quality Bond | ${requirements.qualityBond || '5-10% of contract'} |\n\n### 5.2 Termination\n${requirements.termination || 'Buyer may terminate before contract signing.'}` };
    }
  }

  generateRFPSubmission(requirements) {
    const deadline = requirements.bidDeadline || '待定';
    if (this.language === 'zh') {
      return { id: 'submission', title: '六、投标文件要求', content: `## 六、投标文件要求\n\n### 6.1 投标截止时间\n**${deadline}**\n\n### 6.2 投标文件内容\n1. 技术方案\n2. 商务报价\n3. 公司资质\n4. 业绩案例\n5. 服务承诺\n\n### 6.3 提交方式\n- 联系人：${requirements.contact || '[联系人]'}` };
    } else {
      return { id: 'submission', title: '6. Submission Requirements', content: `## 6. Submission Requirements\n\n### 6.1 Deadline\n**${deadline}**\n\n### 6.2 Contents\n1. Technical proposal\n2. Commercial quote\n3. Company qualifications\n4. Case studies\n5. Service commitment` };
    }
  }

  generateRFPTimeline(requirements) {
    if (this.language === 'zh') {
      return { id: 'timeline', title: '七、招标时间表', content: `## 七、招标时间表\n\n| 阶段 | 时间 |\n|------|------|\n| 招标公告 | ${requirements.announcementDate || new Date().toLocaleDateString('zh-CN')} |\n| 投标截止 | ${requirements.bidDeadline || '待定'} |\n| 中标通知 | ${requirements.awardDate || '评审后5个工作日内'} |\n| 合同签订 | ${requirements.contractDate || '中标通知后15天内'} |` };
    } else {
      return { id: 'timeline', title: '7. Timeline', content: `## 7. Timeline\n\n| Stage | Date |\n|-------|------|\n| Announcement | ${requirements.announcementDate || new Date().toLocaleDateString('en-US')} |\n| Bid Deadline | ${requirements.bidDeadline || 'TBD'} |\n| Award | ${requirements.awardDate || 'Within 5 days after evaluation'} |\n| Contract | ${requirements.contractDate || 'Within 15 days after award'} |` };
    }
  }

  generateRFIPurpose(requirements) {
    if (this.language === 'zh') {
      return { id: 'purpose', title: '一、目的说明', content: `## 一、目的说明\n\n本信息请求函旨在了解市场上相关产品/服务的主流方案、供应商能力及市场价格水平。\n\n本次调研不构成采购承诺。` };
    } else {
      return { id: 'purpose', title: '1. Purpose', content: `## 1. Purpose\n\nThis RFI aims to understand market solutions, supplier capabilities, and pricing.\n\nThis survey does not constitute a procurement commitment.` };
    }
  }

  generateCompanyIntro(requirements) {
    if (this.language === 'zh') {
      return { id: 'company', title: '二、公司简介', content: `## 二、公司简介\n\n| 项目 | 内容 |\n|------|------|\n| 公司名称 | ${requirements.companyName || '[公司名称]'} |\n| 所属行业 | ${requirements.industry || '[行业]'} |\n| 年采购规模 | ${requirements.annualSpend || '[年采购额]'} |` };
    } else {
      return { id: 'company', title: '2. Company', content: `## 2. Company Introduction\n\n| Item | Content |\n|------|---------|\n| Company | ${requirements.companyName || '[Name]'} |\n| Industry | ${requirements.industry || '[Industry]'} |\n| Annual Spend | ${requirements.annualSpend || '[Spend]'} |` };
    }
  }

  generateCapabilities(items) {
    if (this.language === 'zh') {
      return { id: 'capabilities', title: '三、能力调研', content: `## 三、能力调研\n\n请就以下方面提供贵司能力说明：\n\n### 3.1 基本信息\n- 公司规模（人数、营业额）\n- 行业经验年限\n\n### 3.2 产品/服务能力\n${items.map((item, idx) => `${idx + 1}. **${item.name}**\n   - 品牌/自有产品\n   - 产能情况`).join('\n\n')}\n\n### 3.3 资质认证\n请列出相关资质认证。` };
    } else {
      return { id: 'capabilities', title: '3. Capability Survey', content: `## 3. Capability Survey\n\n### 3.1 Basic Info\n- Company size (employees, revenue)\n- Years of experience\n\n### 3.2 Capabilities\n${items.map((item, idx) => `${idx + 1}. **${item.name}**\n   - Brand/Own products\n   - Production capacity`).join('\n\n')}` };
    }
  }

  generateContactInfo(requirements) {
    if (this.language === 'zh') {
      return { id: 'contact', title: '四、联系方式', content: `## 四、联系方式\n\n### 回复方式\n- 邮箱：${requirements.replyEmail || '[填写邮箱]'}\n- 截止时间：${requirements.replyDeadline || '收到函件后15日内'}\n\n### 采购方联系方式\n- 联系人：${requirements.contact || '[联系人]'}` };
    } else {
      return { id: 'contact', title: '4. Contact', content: `## 4. Contact Information\n\n### Response Method\n- Email: ${requirements.replyEmail || '[Enter email]'}\n- Deadline: ${requirements.replyDeadline || 'Within 15 days'}\n\n### Buyer Contact\n- Contact: ${requirements.contact || '[Contact]'}` };
    }
  }

  generateRFBInvitation(category) {
    if (this.language === 'zh') {
      return { id: 'invitation', title: '一、投标邀请', content: `## 一、投标邀请\n\n**尊敬的供应商：**\n\n感谢贵司对我司采购项目的关注。现正式邀请贵司参与 **[${category}]** 采购项目的投标。\n\n### 1.1 投标资格\n- 具有独立法人资格\n- 具备相关经营资质\n- 近三年无重大质量、安全事故` };
    } else {
      return { id: 'invitation', title: '1. Bid Invitation', content: `## 1. Bid Invitation\n\nDear Supplier:\n\nYou are invited to participate in **[${category}]** bidding.\n\n### 1.1 Qualifications\n- Independent legal entity\n- Relevant business licenses\n- No major incidents in past 3 years` };
    }
  }

  generateRFBProject(items, requirements) {
    if (this.language === 'zh') {
      return { id: 'project', title: '二、项目说明', content: `## 二、项目说明\n\n### 2.1 采购内容\n${items.map((item, idx) => `${idx + 1}. ${item.name}：${item.qty || '-'}${item.unit || '个'}`).join('\n')}\n\n### 2.2 交货要求\n- 交货时间：${requirements.deliveryDate || '按合同约定'}\n- 交货地点：${requirements.deliveryAddress || '采购方指定地点'}` };
    } else {
      return { id: 'project', title: '2. Project Description', content: `## 2. Project Description\n\n### 2.1 Contents\n${items.map((item, idx) => `${idx + 1}. ${item.name}: ${item.qty || '-'}${item.unit || 'pcs'}`).join('\n')}\n\n### 2.2 Delivery\n- Time: ${requirements.deliveryDate || 'As per contract'}\n- Location: ${requirements.deliveryAddress || 'Buyer designated'}` };
    }
  }

  generateRFBNotes(requirements) {
    if (this.language === 'zh') {
      return { id: 'bidding', title: '三、投标须知', content: `## 三、投标须知\n\n### 3.1 投标文件要求\n1. 投标函（加盖公章）\n2. 报价明细表\n3. 营业执照复印件\n4. 相关资质证明\n\n### 3.2 评标方式\n${requirements.bidEvaluation || '综合评分法'}\n\n### 3.3 注意事项\n- 投标文件需装订成册\n- 逾期送达的投标文件不予受理` };
    } else {
      return { id: 'bidding', title: '3. Instructions', content: `## 3. Bidding Instructions\n\n### 3.1 Requirements\n1. Bid letter (stamped)\n2. Price breakdown\n3. Business license\n4. Qualifications\n\n### 3.2 Evaluation\n${requirements.bidEvaluation || 'Comprehensive scoring'}\n\n### 3.3 Notes\n- Bids must be bound\n- Late bids not accepted` };
    }
  }

  generateRFBSubmission(requirements) {
    const deadline = requirements.bidDeadline || '待定';
    if (this.language === 'zh') {
      return { id: 'submission', title: '四、投标文件递交', content: `## 四、投标文件递交\n\n### 4.1 投标截止时间\n**${deadline}**\n\n### 4.2 递交方式\n- 现场递交\n- 邮寄\n\n### 4.3 开标时间\n**${requirements.openingDate || '投标截止后3个工作日内'}**\n\n---\n*期待贵司的积极参与！*` };
    } else {
      return { id: 'submission', title: '4. Submission', content: `## 4. Submission\n\n### 4.1 Deadline\n**${deadline}**\n\n### 4.2 Methods\n- In-person\n- Mail\n\n### 4.3 Opening\n**${requirements.openingDate || 'Within 3 business days after deadline'}**\n\n---\n*We look forward to your participation!*` };
    }
  }

  assembleDocument(type, category, sections) {
    const title = this.language === 'zh' 
      ? `${type} - ${category} ${type === 'RFQ' ? '询价单' : type === 'RFP' ? '招标书' : type === 'RFI' ? '信息请求' : '投标邀请'}`
      : this.template.title;
    return {
      title,
      type,
      category,
      language: this.language,
      sections: sections.map(s => ({ id: s.id, title: s.title })),
      content: sections.map(s => s.content).join('\n\n---\n\n'),
      createdAt: new Date().toISOString(),
    };
  }
}

module.exports = RFxGenerator;
