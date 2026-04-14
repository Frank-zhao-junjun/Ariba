/**
 * 合同智能问答服务 v1.6.1
 * 基于RAG架构，支持自然语言询问合同内容
 */

const { generate } = require('./llm');

// 对话历史存储（生产环境应使用Redis等外部存储）
const conversationStore = new Map();

/**
 * 合同问答Prompt模板
 */
const QA_PROMPT_TEMPLATE = `你是专业的SAP Ariba合同分析顾问。基于以下合同内容，请回答用户的问题。

## 合同内容
{contract_text}

## 用户问题
{question}

## 回答要求
1. 回答必须基于合同原文，不能编造内容
2. 如问题超出合同范围，明确告知用户
3. 如涉及金额、日期等关键信息，引用原文佐证
4. 回答结构清晰，使用要点列表或表格（如适用）
5. 对于复杂的法律条款，适当解释其含义

请用中文回答。`;

/**
 * 上下文理解Prompt
 */
const CONTEXT_PROMPT_TEMPLATE = `根据对话历史，理解用户的追问意图：

## 对话历史
{history}

## 当前问题
{question}

请判断当前问题是：
1. 追问之前的话题（简短回答即可）
2. 开启新话题（完整回答）
3. 要求对比分析（需要对比多个条款）

只需输出：追问/新话题/对比分析`;

/**
 * 生成合同问答答案
 */
async function answerContractQuestion(contractText, question, sessionId = 'default') {
  try {
    const history = conversationStore.get(sessionId) || [];
    
    const contextPrompt = CONTEXT_PROMPT_TEMPLATE
      .replace('{history}', history.map(h => `用户: ${h.question}\n助手: ${h.answer}`).join('\n\n'))
      .replace('{question}', question);
    
    const contextType = await generate({
      prompt: contextPrompt,
      system: '你是一个对话意图分析助手，只输出简短分类。'
    });
    
    let adjustedQuestion = question;
    let contextHint = '';
    
    if (contextType.includes('追问')) {
      contextHint = '（基于之前的对话上下文）';
    }
    
    const prompt = QA_PROMPT_TEMPLATE
      .replace('{contract_text}', contractText)
      .replace('{question}', `${contextHint}${adjustedQuestion}`);
    
    const answer = await generate({
      prompt,
      system: '你是一位专业的合同分析顾问，擅长解读合同条款、回答合同相关问题。回答要准确、专业、易懂。'
    });
    
    const newHistory = [...history, { question, answer, timestamp: new Date().toISOString() }];
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    conversationStore.set(sessionId, newHistory);
    
    const relatedClauses = await extractRelatedClauses(contractText, question);
    
    return {
      success: true,
      data: {
        answer: answer.trim(),
        relatedClauses,
        contextType: contextType.includes('追问') ? 'follow-up' : 'new',
        historyLength: newHistory.length
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('合同问答失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 提取与问题相关的条款
 */
async function extractRelatedClauses(contractText, question) {
  try {
    const prompt = `从以下合同文本中，找出与用户问题最相关的条款片段：

合同内容：
${contractText}

用户问题：${question}

请返回最相关的3-5个条款片段，每个包含：
- 条款类型
- 原文内容（简短摘要）
- 相关度评分(1-10)

以JSON数组格式输出。`;

    const result = await generate({
      prompt,
      system: '你是一个条款检索助手，只输出JSON。'
    });
    
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * 获取对话历史
 */
function getConversationHistory(sessionId = 'default') {
  return conversationStore.get(sessionId) || [];
}

/**
 * 清除对话历史
 */
function clearConversationHistory(sessionId = 'default') {
  conversationStore.delete(sessionId);
  return { success: true, message: '对话历史已清除' };
}

/**
 * 批量问答（支持多合同对比）
 */
async function answerMultiContractQuestions(contracts, question) {
  try {
    const contractsText = contracts.map((c, i) => 
      `合同${i + 1} [${c.name || '合同' + (i + 1)}]：\n${c.text}`
    ).join('\n\n---\n\n');
    
    const prompt = `作为专业的合同分析顾问，请对比分析以下多个合同，回答用户问题。

## 合同列表
${contractsText}

## 用户问题
${question}

## 回答要求
1. 对比各合同的异同点
2. 指出优劣
3. 给出建议

请用中文详细回答。`;

    const answer = await generate({
      prompt,
      system: '你是一位专业的合同对比分析顾问，擅长多合同对比和采购决策支持。'
    });
    
    return {
      success: true,
      data: {
        answer: answer.trim(),
        contractCount: contracts.length
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('多合同问答失败:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 预设问题推荐
 */
function getSuggestedQuestions() {
  return [
    {
      category: '基本信息',
      questions: [
        '合同的总金额是多少？',
        '合同双方是谁？',
        '合同的有效期是多久？'
      ]
    },
    {
      category: '付款与交付',
      questions: [
        '付款方式是什么？',
        '交付期限是什么时候？',
        '验收标准有哪些？'
      ]
    },
    {
      category: '风险与合规',
      questions: [
        '有哪些潜在风险点？',
        '违约责任是什么？',
        '保密条款有哪些要求？'
      ]
    },
    {
      category: '智能分析',
      questions: [
        '这份合同对我方有利吗？',
        '有哪些条款需要特别注意？',
        '可以帮我生成审批意见吗？'
      ]
    }
  ];
}

/**
 * 演示问答
 */
async function getDemoAnswer() {
  const demoContract = `
  软件开发服务合同
  
  甲方：某某科技有限公司
  乙方：软件开发有限公司
  
  一、合同金额：本合同总价为人民币500,000元整，含税。
  
  二、付款条款：甲方应在乙方完成阶段性验收后30个工作日内支付相应款项。
  
  三、实施交付：乙方应在合理时间内完成系统开发和部署，并提交交付物。
  
  四、验收标准：系统应满足甲方的业务需求，达到预定功能要求。
  
  五、质保条款：质保期为系统验收通过后12个月。
  
  六、违约责任：任何一方违约，应承担相应的违约责任，赔偿对方因此产生的损失。
  
  七、保密条款：双方应对合作过程中知悉的对方商业秘密予以保密。
  
  八、知识产权：乙方开发的软件著作权归甲方所有。
  
  九、争议解决：如双方发生争议，应友好协商解决；协商不成的，提交甲方所在地法院诉讼解决。
  `;
  
  return answerContractQuestion(demoContract, '付款方式对我方是否有利？', 'demo-session');
}

module.exports = {
  answerContractQuestion,
  getConversationHistory,
  clearConversationHistory,
  answerMultiContractQuestions,
  getSuggestedQuestions,
  getDemoAnswer
};
