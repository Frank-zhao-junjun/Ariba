/**
 * 采购申请FAQ知识库
 * 
 * 包含政策、流程、系统操作三类常见问题
 */

const faqKnowledge = [
  // ========== 政策类 ==========
  {
    id: 'policy-001',
    category: 'policy',
    question: '超过多少钱需要总经理审批',
    answer: '根据公司采购政策，审批权限如下：\n• 10万以下：部门经理审批\n• 10-50万：总监审批\n• 50万以上：总经理审批\n\n注：紧急采购可先采购后补批，但需在48小时内完成审批。',
    keywords: ['审批', '金额', '总经理', '权限', '多少', '门槛']
  },
  {
    id: 'policy-002',
    category: 'policy',
    question: '哪些品类必须使用优选供应商',
    answer: '以下品类必须从优选供应商库选择：\n• IT设备及软件（台式机、笔记本、服务器、软件许可）\n• 办公家具（办公桌、办公椅、储物柜）\n• 公务用车维修保养\n• 商务印刷品（名片、宣传册）\n\n如需使用非优选供应商，需额外说明原因并经总监批准。',
    keywords: ['优选', '供应商', '品类', '必须', '指定']
  },
  {
    id: 'policy-003',
    category: 'policy',
    question: '没有供应商资质可以采购吗',
    answer: '原则上需要在供应商库中选取已认证的供应商。\n\n以下情况可申请新增供应商：\n1. 填写《新增供应商申请表》\n2. 提供营业执照、资质证书\n3. 经采购部门审核\n4. 完成准入评估后即可使用\n\n紧急情况可先采购后补办资质，但需部门总监签字确认。',
    keywords: ['供应商', '资质', '认证', '新增', '准入']
  },
  {
    id: 'policy-004',
    category: 'policy',
    question: '采购需要哪些附件',
    answer: '根据采购金额，需要的附件如下：\n\n• 1万以下：可选附件\n• 1-5万：至少1家供应商报价\n• 5-10万：至少2家供应商报价\n• 10万以上：至少3家供应商报价 + 询价单\n\n特殊品类（IT设备、工程物资）无论金额均需提供规格说明。',
    keywords: ['附件', '报价', '询价', '需要', '上传']
  },
  {
    id: 'policy-005',
    category: 'policy',
    question: '框架协议采购有什么优惠',
    answer: '通过框架协议采购可享受：\n\n• 价格折扣：通常比市场价低5-20%\n• 简化流程：无需比价，直接下单\n• 质量保障：已通过采购部门审核\n• 交期保障：供应商有库存承诺\n\n当前有效的框架协议可在"供应商管理"模块查看。',
    keywords: ['框架协议', '优惠', '折扣', '价格', '协议价']
  },
  {
    id: 'policy-006',
    category: 'policy',
    question: '紧急采购怎么处理',
    answer: '紧急采购处理流程：\n\n1. 在申请备注中标注"紧急"及原因\n2. 联系采购部门开通绿色通道\n3. 事后48小时内补齐审批手续\n4. 需部门总监签字确认紧急必要性\n\n注意：频繁申请紧急采购会影响部门采购评分。',
    keywords: ['紧急', '加急', '应急', '快速']
  },

  // ========== 流程类 ==========
  {
    id: 'process-001',
    category: 'process',
    question: '采购IT设备走什么流程',
    answer: 'IT设备采购标准流程：\n\n1. 【申请】在Ariba中填写采购申请\n   - 选择"IT设备"品类\n   - 填写设备型号、数量、预算\n   - 如有指定供应商需说明原因\n\n2. 【审批】按金额自动路由审批人\n\n3. 【下单】审批通过后采购部统一采购\n   - 标准设备3-5个工作日\n   - 定制设备7-10个工作日\n\n4. 【收货】收到设备后验收确认\n\n5. 【付款】按合同账期付款',
    keywords: ['IT', '设备', '流程', '步骤', '电脑', '采购流程']
  },
  {
    id: 'process-002',
    category: 'process',
    question: '如何添加新的供应商',
    answer: '新增供应商步骤：\n\n1. 登录Ariba系统\n2. 进入"供应商管理" → "新增供应商"\n3. 填写供应商信息：\n   - 企业名称、统一社会信用代码\n   - 联系人、电话、邮箱\n   - 主营产品/服务\n4. 上传资质材料：\n   - 营业执照\n   - 相关资质证书\n5. 提交采购部门审核\n6. 审核通过后即可在采购申请中使用\n\n预计审核时间：3个工作日',
    keywords: ['供应商', '新增', '添加', '审核', '入库']
  },
  {
    id: 'process-003',
    category: 'process',
    question: '审批到哪一步了',
    answer: '查询审批进度：\n\n方法1：登录Ariba → "我的申请" → 查看状态\n\n方法2：联系当前审批人确认\n\n常见审批状态：\n• 待提交：申请尚未提交\n• 审批中：正在审批流程中\n• 已批准：审批完成，等待采购处理\n• 已拒绝：申请被驳回，可查看驳回原因\n• 已关闭：流程结束（可能已下单或取消）',
    keywords: ['审批', '进度', '状态', '流程', '哪里', '查看']
  },
  {
    id: 'process-004',
    category: 'process',
    question: '采购申请被驳回了怎么办',
    answer: '申请被驳回后：\n\n1. 登录Ariba查看驳回原因\n   - 进入"我的申请" → 点击申请编号\n   - 查看审批意见\n\n2. 根据原因修改申请\n   - 常见驳回原因：\n     • 金额与规格不符 → 重新核实\n     • 供应商不在优选库 → 更换供应商或申请特批\n     • 缺少附件 → 补充报价单/规格书\n     • 预算不足 → 联系财务确认预算\n\n3. 修改后重新提交\n\n如有异议可联系驳回审批人沟通。',
    keywords: ['驳回', '拒绝', '不通过', '修改', '重新']
  },
  {
    id: 'process-005',
    category: 'process',
    question: '合同审批需要多久',
    answer: '合同审批时间参考：\n\n• 标准合同（模板）：1-2个工作日\n• 非标合同：3-5个工作日\n• 大额合同（50万+）：5-7个工作日\n• 特殊合同（涉及法务）：可能更长\n\n加速审批建议：\n1. 使用标准合同模板\n2. 提前与供应商协商好条款\n3. 准备好所有附件一次性提交',
    keywords: ['合同', '审批', '时间', '多久', '法务']
  },

  // ========== 操作类 ==========
  {
    id: 'operation-001',
    category: 'operation',
    question: '如何上传附件',
    answer: '上传附件步骤：\n\n1. 在采购申请页面，点击"添加附件"按钮\n2. 选择文件（支持PDF、Word、Excel、图片）\n3. 单个文件不超过10MB\n4. 可上传多个附件\n\n常见附件类型：\n• 询价单/报价单\n• 技术规格书\n• 供应商资质证明\n• 合同草案\n\n提示：附件命名建议包含日期和内容描述，便于审批人理解。',
    keywords: ['附件', '上传', '文件', '如何', '操作']
  },
  {
    id: 'operation-002',
    category: 'operation',
    question: '在哪里查看历史申请',
    answer: '查看历史申请：\n\n1. 登录Ariba系统\n2. 点击左侧菜单"采购申请"\n3. 选择"我提交的申请"\n4. 可以按以下条件筛选：\n   • 申请日期\n   • 申请状态\n   • 采购品类\n   • 金额范围\n\n5. 点击申请编号可查看详情和审批历史',
    keywords: ['历史', '申请', '查看', '记录', '我的']
  },
  {
    id: 'operation-003',
    category: 'operation',
    question: '怎么修改已提交的申请',
    answer: '已提交申请的处理方式：\n\n情况1：审批尚未开始\n• 可联系采购部撤回修改\n• 撤回后重新提交\n\n情况2：审批进行中\n• 无法直接修改\n• 可取消申请后重新提交\n\n情况3：已审批通过\n• 无法修改内容\n• 如需变更请联系采购部门\n\n建议：在提交前仔细核对申请内容！',
    keywords: ['修改', '变更', '编辑', '已提交', '撤回']
  },
  {
    id: 'operation-004',
    category: 'operation',
    question: '如何选择成本中心',
    answer: '成本中心选择方法：\n\n1. 在申请页面"成本中心"字段点击选择\n2. 输入部门名称或成本中心代码搜索\n3. 常见成本中心：\n   • CC-RD-XXX：研发部门\n   • CC-MK-XXX：市场部门\n   • CC-PR-XXX：生产部门\n   • CC-AD-XXX：行政管理\n\n4. 项目费用需关联项目代码\n\n注意：成本中心选择错误会导致报销问题，请确认后再提交！',
    keywords: ['成本中心', '部门', '选择', '项目', '费用']
  },
  {
    id: 'operation-005',
    category: 'operation',
    question: '找不到我要采购的物料怎么办',
    answer: '物料未找到时的解决方案：\n\n方法1：使用自由文本申请\n• 点击"非目录物料申请"\n• 手动填写采购描述\n• 采购部门会根据描述帮您匹配\n\n方法2：联系采购部\n• 提供采购需求说明\n• 采购部会帮您查找或新增物料\n\n方法3：提交新物料申请\n• 填写物料信息申请表\n• 经审批后系统会新增该物料\n\n建议优先使用目录物料，价格和交期更有保障。',
    keywords: ['物料', '找不到', '目录', '没有', '新增']
  },

  // ========== 系统类 ==========
  {
    id: 'system-001',
    category: 'system',
    question: 'Ariba系统登录不了怎么办',
    answer: '登录问题排查：\n\n1. 确认账号密码正确\n   • 账号通常是公司邮箱前缀\n   • 密码可通过"忘记密码"重置\n\n2. 清除浏览器缓存\n   • Chrome: 设置 → 隐私 → 清除缓存\n   • 建议使用Chrome或Edge浏览器\n\n3. 检查网络连接\n   • 确保可以访问外网\n   • 公司VPN是否正常\n\n4. 浏览器兼容性\n   • 推荐Chrome 90+、Edge 90+\n   • 不支持IE浏览器\n\n如仍无法解决，联系IT部门：support@company.com',
    keywords: ['登录', '密码', '账号', '系统', '打不开', '无法']
  },
  {
    id: 'system-002',
    category: 'system',
    question: '手机可以使用Ariba吗',
    answer: 'Ariba移动端使用：\n\n支持方式：\n• 手机浏览器访问：ariba.company.com\n• SAP Ariba移动APP（App Store/Google Play）\n\n可实现功能：\n✓ 查看审批任务\n✓ 审批/驳回申请\n✓ 查看申请状态\n✓ 接收审批通知\n\n暂不支持：\n✗ 创建采购申请\n✗ 上传附件\n✗ 复杂查询\n\n建议PC端提交申请，移动端主要用于审批。',
    keywords: ['手机', '移动', 'APP', '移动端', 'PAD']
  }
];

class PrFaqKnowledge {
  /**
   * 搜索匹配的问题
   */
  search(question, limit = 5) {
    const keywords = this.extractKeywords(question);
    const scores = [];
    
    for (const faq of faqKnowledge) {
      let score = 0;
      
      // 完全匹配问题
      if (faq.question.includes(question) || question.includes(faq.question)) {
        score = 100;
      } else {
        // 关键词匹配
        for (const keyword of keywords) {
          if (faq.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
            score += 20;
          }
          // 在问题中匹配关键词
          if (faq.question.includes(keyword)) {
            score += 10;
          }
          // 在答案中匹配关键词
          if (faq.answer.includes(keyword)) {
            score += 5;
          }
        }
      }
      
      if (score > 0) {
        scores.push({ faq, score });
      }
    }
    
    // 按分数排序并返回
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, limit).map(s => s.faq);
  }

  /**
   * 提取关键词
   */
  extractKeywords(question) {
    // 移除常见停用词
    const stopWords = ['的', '了', '是', '在', '和', '与', '或', '怎么', '如何', '哪里', '哪里'];
    let keywords = question.toLowerCase();
    
    for (const word of stopWords) {
      keywords = keywords.replace(new RegExp(word, 'g'), ' ');
    }
    
    return keywords.split(/\s+/).filter(k => k.length >= 2);
  }

  /**
   * 按分类获取FAQ
   */
  getByCategory(category) {
    return faqKnowledge.filter(f => f.category === category);
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    return [...new Set(faqKnowledge.map(f => f.category))];
  }

  /**
   * 获取热门问题
   */
  getPopular(limit = 10) {
    // 简化版：返回所有问题的前N个
    return faqKnowledge.slice(0, limit).map(f => ({
      id: f.id,
      question: f.question,
      category: f.category
    }));
  }

  /**
   * 获取单个FAQ详情
   */
  getById(id) {
    return faqKnowledge.find(f => f.id === id);
  }
}

module.exports = new PrFaqKnowledge();
