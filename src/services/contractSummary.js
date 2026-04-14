/**
 * 智能合同摘要生成器服务 v1.6
 * 基于LLM自动分析合同文本，生成结构化摘要
 */

const { generate } = require('./llm');

// 合同摘要Prompt模板
const SUMMARY_PROMPT_TEMPLATE = `你是一位专业的SAP Ariba合同分析顾问。请分析以下合同文本，生成结构化摘要。

## 合同文本
{contract_text}

## 输出要求
请按以下JSON格式输出分析结果：
{
  "summary": "合同一句话摘要（50字以内）",
  "overview": {
    "contract_type": "合同类型",
    "contract_value": "合同金额（如有）",
    "parties": ["甲方", "乙方"],
    "duration": "合同期限",
    "effective_date": "生效日期"
  },
  "key_clauses": [
    {
      "type": "条款类型",
      "content": "条款内容摘要",
      "importance": "high/medium/low"
    }
  ],
  "risks": [
    {
      "level": "high/medium/low",
      "description": "风险描述",
      "suggestion": "建议"
    }
  ],
  "highlights": ["关键亮点1", "关键亮点2"],
  "compliance_check": {
    "passed": true/false,
    "issues": ["合规问题1"]
  }
}

请确保输出是有效的JSON格式。`;

/**
 * 生成完整合同摘要
 * @param {string} contractText - 合同文本
 * @param {object} options - 可选参数
 * @returns {object} 结构化分析结果
 */
async function generateContractSummary(contractText, options = {}) {
  try {
    const prompt = SUMMARY_PROMPT_TEMPLATE.replace('{contract_text}', contractText);
    
    const result = await generate({
      prompt,
      system: '你是一位专业的SAP Ariba合同分析顾问，擅长提取合同关键信息并识别风险点。'
    });

    // 解析JSON响应
    let analysis = null;
    try {
      // 尝试提取JSON
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      // 如果JSON解析失败，返回原始文本
      analysis = {
        summary: result.substring(0, 200),
        overview: {},
        key_clauses: [],
        risks: [],
        highlights: [],
        compliance_check: { passed: true, issues: [] },
        _raw_response: result
      };
    }

    return {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('合同摘要生成失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 生成简短摘要（用于聊天场景）
 * @param {string} contractText - 合同文本
 * @returns {object} 简短摘要结果
 */
async function generateBriefSummary(contractText) {
  try {
    const prompt = `请用一句话概括以下合同的要点（不超过100字）：

${contractText}`;

    const result = await generate({
      prompt,
      system: '你是一位专业的合同分析顾问，擅长简洁准确地概括合同核心内容。'
    });

    return {
      success: true,
      brief: result.trim(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('简短摘要生成失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 提取合同关键条款
 * @param {string} contractText - 合同文本
 * @returns {object} 条款提取结果
 */
async function extractKeyClauses(contractText) {
  try {
    const prompt = `请从以下合同中提取所有关键条款，并按类型分类：

${contractText}

支持的条款类型：
- 合同当事人
- 合同金额与付款
- 交付与验收
- 质量保证
- 违约责任
- 保密条款
- 知识产权
- 争议解决
- 合同期限
- 其他重要条款

请以JSON数组格式输出。`;

    const result = await generate({
      prompt,
      system: '你是一位专业的合同分析顾问，擅长提取和分类合同条款。'
    });

    let clauses = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        clauses = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      clauses = [{ type: '未分类', content: result, importance: 'medium' }];
    }

    return {
      success: true,
      clauses,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('条款提取失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 检测合同风险
 * @param {string} contractText - 合同文本
 * @returns {object} 风险检测结果
 */
async function detectContractRisks(contractText) {
  try {
    const prompt = `请分析以下合同，识别潜在风险点：

${contractText}

风险类型包括：
- 金额风险（金额不明确、付款条件不利）
- 时间风险（交付期限模糊、延期责任不清）
- 质量风险（验收标准模糊、质保期过短）
- 法律风险（权责不对等、霸王条款）
- 合规风险（违反法规、缺少必要条款）

请以JSON格式输出风险列表，每个风险包含：level(高/中/低)、description(描述)、suggestion(建议)。`;

    const result = await generate({
      prompt,
      system: '你是一位专业的合同风险顾问，擅长识别合同中的潜在风险。'
    });

    let risks = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        risks = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      risks = [];
    }

    return {
      success: true,
      risks,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('风险检测失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 演示数据
 */
function getDemoSummary() {
  return {
    success: true,
    data: {
      summary: "博世中国与华南电子就工业传感器采购签订年度框架协议，合同金额200万元，期限1年。",
      overview: {
        contract_type: "采购框架协议",
        contract_value: "200万元",
        parties: ["博世（中国）投资有限公司", "华南电子科技有限公司"],
        duration: "1年",
        effective_date: "2026-01-01"
      },
      key_clauses: [
        { type: "合同金额与付款", content: "总价200万元，预付30%，尾款验收后支付", importance: "high" },
        { type: "交付与验收", content: "分批交付，最后一批需在6月30日前完成", importance: "high" },
        { type: "质量保证", content: "质保期12个月，以到货日期起算", importance: "medium" },
        { type: "违约责任", content: "延迟交付每天罚款合同金额的0.5%", importance: "high" }
      ],
      risks: [
        { level: "medium", description: "预付比例较高，资金占用较大", suggestion: "建议争取降低预付比例至20%" },
        { level: "low", description: "验收标准描述较为笼统", suggestion: "建议明确各项传感器的具体验收指标" }
      ],
      highlights: [
        "✅ 框架协议形式，灵活度高",
        "✅ 付款条件相对合理",
        "✅ 违约条款明确"
      ],
      compliance_check: {
        passed: true,
        issues: []
      }
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateContractSummary,
  generateBriefSummary,
  extractKeyClauses,
  detectContractRisks,
  getDemoSummary
};
