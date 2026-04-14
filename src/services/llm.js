/**
 * LLM 调用服务
 * 支持多种LLM提供商的统一接口
 */

const axios = require('axios');

// LLM配置
const LLM_CONFIG = {
  defaultProvider: process.env.LLM_PROVIDER || 'coze',
  coze: {
    baseURL: 'https://api.coze.cn',
    apiKey: process.env.COZE_API_KEY,
    model: process.env.COZE_MODEL || 'claude-3-5-sonnet-20241022'
  }
};

/**
 * 统一的LLM调用接口
 */
async function generate(options) {
  const { prompt, system = '', context = {} } = options;
  
  try {
    if (process.env.COZE_API_KEY) {
      return await callCoze({ prompt, system, context });
    }
  } catch (error) {
    console.error('LLM调用失败:', error.message);
  }
  
  // 回退到模板生成
  return generateFromTemplate({ prompt, system, context });
}

/**
 * 调用Coze API
 */
async function callCoze({ prompt, system, context }) {
  const config = LLM_CONFIG.coze;
  
  const response = await axios.post(
    `${config.baseURL}/v3/chat`,
    {
      model: config.model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].message.content;
  }
  
  return generateFromTemplate({ context });
}

/**
 * 基于模板生成（回退方案）
 */
function generateFromTemplate({ context }) {
  if (context.type === 'requirement_analysis') {
    return JSON.stringify({ requirements: [{ id: `REQ-${Date.now()}`, description: context.description, priority: 'P1', businessValue: 7, complexity: 5 }], supplements: [], conflicts: [] }, null, 2);
  } else if (context.type === 'user_stories') {
    return JSON.stringify({ userStories: [{ id: `US-${Date.now()}`, title: 'User Story', asA: '用户', iWant: '实现功能', soThat: '业务价值', acceptanceCriteria: [], priority: 'P1', estimatedHours: 8 }] }, null, 2);
  } else if (context.type === 'flowchart') {
    return '```ascii\n┌─────────────────┐\n│   开始           │\n└────────┬────────┘\n         ▼\n┌─────────────────┐\n│   流程节点       │\n└────────┬────────┘\n         ▼\n┌─────────────────┐\n│   结束           │\n└─────────────────┘\n```';
  }
  
  return '基于模板生成的结果';
}

function buildRequirementPrompt(context) {
  return `分析以下需求:\n行业: ${context.industry}\n描述: ${context.description}`;
}

function buildUserStoriesPrompt(context) {
  return `生成User Stories:\n需求: ${JSON.stringify(context.requirements)}`;
}

function buildFlowchartPrompt(context) {
  return `生成流程图:\n流程类型: ${context.processType}`;
}

module.exports = { generate, callCoze, generateFromTemplate, buildRequirementPrompt, buildUserStoriesPrompt, buildFlowchartPrompt };
