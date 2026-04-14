/**
 * 智能合同分析服务
 * 功能: 合同上传解析、关键条款提取、风险评分
 */

const fs = require('fs').promises;
const path = require('path');

// 关键合同条款关键词
const CLAUSE_PATTERNS = {
  // 合同基本信息
  contractParties: {
    name: '合同当事人',
    keywords: ['甲方', '乙方', '供应商', '采购方', '买方', '卖方', '供应商', '承包商', '服务商', '客户'],
    weight: 1.0
  },
  contractAmount: {
    name: '合同金额',
    keywords: ['合同金额', '总价', '价款', '费用', '金额', '人民币', '美元', '含税', '不含税', '元'],
    weight: 1.5
  },
  paymentTerms: {
    name: '付款条款',
    keywords: ['付款', '支付', '账期', '预付', '尾款', '进度款', '验收后', '到账', '结算', '发票'],
    weight: 2.0
  },
  deliveryTerms: {
    name: '交付条款',
    keywords: ['交付', '交货', '供货', '实施', '交付物', '里程碑', '阶段', '完成'],
    weight: 2.0
  },
  acceptanceCriteria: {
    name: '验收标准',
    keywords: ['验收', '确认', '合格', '通过', '满足', '符合', '达到', '标准'],
    weight: 2.5
  },
  warrantyTerms: {
    name: '质保条款',
    keywords: ['质保', '保修', '维保', '服务期', '有效期', '缺陷', '修补', '修复'],
    weight: 1.5
  },
  liabilityTerms: {
    name: '违约责任',
    keywords: ['违约', '违约金', '赔偿', '损失', '责任', '免除', '赔偿限额', '免责'],
    weight: 2.5
  },
  terminationTerms: {
    name: '终止条款',
    keywords: ['终止', '解除', '提前终止', '解除合同', '终止合同', '满期'],
    weight: 2.0
  },
  confidentialityTerms: {
    name: '保密条款',
    keywords: ['保密', '机密', '信息保护', '不得披露', '保密义务', '商业秘密'],
    weight: 1.5
  },
  intellectualProperty: {
    name: '知识产权',
    keywords: ['知识产权', '版权', '专利', '著作权', '所有权', '转让', '授权'],
    weight: 2.0
  },
  forceMajeure: {
    name: '不可抗力',
    keywords: ['不可抗力', '自然灾害', '战争', '政府行为', '瘟疫', '疫情'],
    weight: 1.0
  },
  disputeResolution: {
    name: '争议解决',
    keywords: ['争议', '仲裁', '诉讼', '管辖', '法院', '适用法律', '法律适用'],
    weight: 1.5
  },
  governingLaw: {
    name: '适用法律',
    keywords: ['适用法律', '中华人民共和国', '法律', '法规', '规定'],
    weight: 1.0
  },
  effectiveDate: {
    name: '生效日期',
    keywords: ['生效', '签订日期', '签订时间', '签署日期', '自___起'],
    weight: 1.0
  },
  contractDuration: {
    name: '合同期限',
    keywords: ['合同期限', '有效期', '服务期限', '__年', '__月', '为期'],
    weight: 1.5
  }
};

// 风险关键词
const RISK_KEYWORDS = [
  { keyword: '验收标准未量化', pattern: /(验收|确认|合格).{0,20}(未|无|不).{0,10}(量化|明确|规定)/gi, severity: 'HIGH' },
  { keyword: '无限连带', pattern: /无限.{0,5}(连带|责任|赔偿)/gi, severity: 'HIGH' },
  { keyword: '单方解除权', pattern: /甲方.{0,10}(随时|单方|任意).{0,10}(解除|终止)/gi, severity: 'HIGH' },
  { keyword: '模糊量化词', pattern: /(合理|适当|必要|及时|迅速|尽快).{0,15}(完成|提供|交付|处理)/gi, severity: 'MEDIUM' },
  { keyword: '不对等责任', pattern: /(甲方|乙方).{0,10}(免除|不承担).{0,10}(责任|义务)/gi, severity: 'HIGH' },
  { keyword: '隐性费用', pattern: /(其他|额外|附加).{0,10}(费用|收费|款项)/gi, severity: 'MEDIUM' },
  { keyword: '超长账期', pattern: /(验收|交付|完成).{0,20}(一年|两年|三年|以上).{0,10}(后|再)/gi, severity: 'MEDIUM' },
  { keyword: '数据归属模糊', pattern: /(数据|信息|成果).{0,10}(归属|所有权|知识产权).{0,10}(待定|另行|协商)/gi, severity: 'MEDIUM' }
];

// 模糊量化词检测
const FUZZY_QUANTIFIERS = [
  { pattern: /合理(的)?/g, suggestion: '建议明确具体时间，如"30个工作日内"' },
  { pattern: /适当/g, suggestion: '建议明确具体标准或次数' },
  { pattern: /及时/g, suggestion: '建议明确时限，如"2个工作日内"' },
  { pattern: /尽快/g, suggestion: '建议明确最长期限' },
  { pattern: /必要时/g, suggestion: '建议明确触发条件' },
  { pattern: /相关/g, suggestion: '建议明确具体范围' },
  { pattern: /必要/g, suggestion: '建议明确必要性判断标准' }
];

class ContractAnalyzer {
  constructor() {
    this.clausePatterns = CLAUSE_PATTERNS;
    this.riskKeywords = RISK_KEYWORDS;
    this.fuzzyQuantifiers = FUZZY_QUANTIFIERS;
  }

  /**
   * 提取合同文本中的关键条款
   * @param {string} text - 合同文本
   * @returns {Object} 条款分析结果
   */
  extractClauses(text) {
    const result = {
      foundClauses: [],
      missingClauses: [],
      confidence: 0
    };

    // 检测每个条款类型
    for (const [key, clause] of Object.entries(CLAUSE_PATTERNS)) {
      const found = clause.keywords.some(kw => text.includes(kw));
      if (found) {
        // 提取包含关键词的上下文
        const contexts = this.extractContexts(text, clause.keywords);
        result.foundClauses.push({
          type: key,
          name: clause.name,
          weight: clause.weight,
          contexts: contexts.slice(0, 3) // 最多3个上下文
        });
      } else {
        result.missingClauses.push({
          type: key,
          name: clause.name,
          weight: clause.weight
        });
      }
    }

    // 计算置信度
    const totalWeight = Object.values(CLAUSE_PATTERNS).reduce((sum, c) => sum + c.weight, 0);
    const foundWeight = result.foundClauses.reduce((sum, c) => sum + c.weight, 0);
    result.confidence = Math.round((foundWeight / totalWeight) * 100);

    return result;
  }

  /**
   * 提取关键词上下文
   */
  extractContexts(text, keywords, windowSize = 50) {
    const contexts = [];
    for (const kw of keywords) {
      let index = 0;
      while ((index = text.indexOf(kw, index)) !== -1) {
        const start = Math.max(0, index - windowSize);
        const end = Math.min(text.length, index + kw.length + windowSize);
        let context = text.substring(start, end);
        if (start > 0) context = '...' + context;
        if (end < text.length) context = context + '...';
        contexts.push(context.trim());
        index += kw.length;
        if (contexts.length >= 3) break;
      }
      if (contexts.length >= 3) break;
    }
    return contexts;
  }

  /**
   * 检测合同风险点
   * @param {string} text - 合同文本
   * @returns {Object} 风险分析结果
   */
  detectRisks(text) {
    const result = {
      risks: [],
      riskScore: 0,
      riskLevel: 'LOW'
    };

    // 检测预定义风险模式
    for (const risk of RISK_KEYWORDS) {
      const matches = text.match(risk.pattern);
      if (matches && matches.length > 0) {
        const contexts = [];
        for (const match of matches) {
          const index = text.indexOf(match);
          const start = Math.max(0, index - 30);
          const end = Math.min(text.length, index + match.length + 30);
          contexts.push({
            match: match,
            context: (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '')
          });
        }
        result.risks.push({
          keyword: risk.keyword,
          severity: risk.severity,
          count: matches.length,
          contexts: contexts.slice(0, 2)
        });
      }
    }

    // 检测模糊量化词
    const fuzzyIssues = [];
    for (const fq of FUZZY_QUANTIFIERS) {
      const matches = text.match(fq.pattern);
      if (matches && matches.length > 0) {
        fuzzyIssues.push({
          term: matches[0],
          suggestion: fq.suggestion,
          count: matches.length
        });
      }
    }
    if (fuzzyIssues.length > 0) {
      result.risks.push({
        keyword: '模糊量化词',
        severity: 'MEDIUM',
        count: fuzzyIssues.length,
        details: fuzzyIssues
      });
    }

    // 计算风险评分
    const severityWeights = { HIGH: 10, MEDIUM: 5, LOW: 2 };
    result.riskScore = result.risks.reduce((score, risk) => {
      return score + (severityWeights[risk.severity] || 2) * risk.count;
    }, 0);

    // 标准化到0-100
    result.riskScore = Math.min(100, result.riskScore);

    // 确定风险等级
    if (result.riskScore >= 30) {
      result.riskLevel = 'HIGH';
    } else if (result.riskScore >= 15) {
      result.riskLevel = 'MEDIUM';
    } else {
      result.riskLevel = 'LOW';
    }

    return result;
  }

  /**
   * 综合分析合同
   * @param {string} text - 合同文本
   * @param {string} filename - 文件名
   * @returns {Object} 完整分析报告
   */
  async analyze(text, filename = 'unknown') {
    // 条款提取
    const clauseAnalysis = this.extractClauses(text);
    
    // 风险检测
    const riskAnalysis = this.detectRisks(text);

    // 生成建议
    const recommendations = this.generateRecommendations(clauseAnalysis, riskAnalysis);

    // 组装报告
    const report = {
      filename,
      analyzeTime: new Date().toISOString(),
      summary: {
        totalClauses: Object.keys(CLAUSE_PATTERNS).length,
        foundClauses: clauseAnalysis.foundClauses.length,
        clauseCoverage: clauseAnalysis.confidence,
        totalRisks: riskAnalysis.risks.length,
        riskScore: riskAnalysis.riskScore,
        riskLevel: riskAnalysis.riskLevel
      },
      clauseAnalysis: clauseAnalysis,
      riskAnalysis: riskAnalysis,
      recommendations: recommendations
    };

    return report;
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(clauseAnalysis, riskAnalysis) {
    const recommendations = [];

    // 基于缺失条款建议
    const criticalMissing = clauseAnalysis.missingClauses.filter(c => c.weight >= 2.0);
    if (criticalMissing.length > 0) {
      recommendations.push({
        type: 'MISSING_CLAUSE',
        priority: 'HIGH',
        message: `建议补充以下关键条款: ${criticalMissing.map(c => c.name).join('、')}`,
        details: criticalMissing
      });
    }

    // 基于风险建议
    const highRisks = riskAnalysis.risks.filter(r => r.severity === 'HIGH');
    if (highRisks.length > 0) {
      recommendations.push({
        type: 'HIGH_RISK',
        priority: 'HIGH',
        message: `存在${highRisks.length}项高风险条款，需要重点关注和修改`,
        details: highRisks.map(r => ({ keyword: r.keyword, count: r.count }))
      });
    }

    // 基于模糊量化词建议
    const fuzzyRisk = riskAnalysis.risks.find(r => r.keyword === '模糊量化词');
    if (fuzzyRisk && fuzzyRisk.details) {
      recommendations.push({
        type: 'FUZZY_TERMS',
        priority: 'MEDIUM',
        message: `发现${fuzzyRisk.count}处模糊表述，建议量化`,
        details: fuzzyRisk.details.slice(0, 5)
      });
    }

    return recommendations;
  }
}

module.exports = ContractAnalyzer;
