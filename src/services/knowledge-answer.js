/**
 * 知识库问答服务
 * 实现知识检索、智能问答、来源标注等功能
 */

const path = require('path');
const fs = require('fs').promises;
const llm = require('./llm');

// 知识库路径
const KNOWLEDGE_BASE_PATH = process.env.KNOWLEDGE_BASE_PATH || 
  (process.env.HOME ? `${process.env.HOME}/my-wiki/wiki/SAP-Ariba` : '/root/my-wiki/wiki/SAP-Ariba');

// 能力标签定义
const CAPABILITY_TAGS = {
  '🟢': { name: '原生能力', desc: '开箱即用，只需配置' },
  '🟡': { name: '可配置能力', desc: '需专业配置或顾问支持' },
  '🔴': { name: '需要额外工作', desc: '定制开发、二次开发' },
  '🔵': { name: '需要额外工具', desc: '第三方工具、平台' },
  '🟣': { name: '需要额外集成', desc: '系统对接、API集成' },
  '⚪': { name: '参考知识', desc: '案例、方法论、资源' }
};

// 适用范围标签
const SCOPE_TAGS = {
  modules: ['Buying', 'Sourcing', 'Contract', 'Supplier Management', 'SCC', 'Catalog', 'Invoicing', 'Expenses'],
  versions: ['传统版本', 'Next-Gen', '通用'],
  integrations: ['无', 'CIG', 'PI/PO', 'ESB', 'SAP ERP', '第三方ERP'],
  industries: ['通用', '制造业', '零售业', '金融', '医药', '高科技', '能源']
};

/**
 * 解析文档中的标签
 */
function parseDocumentTags(content, filePath) {
  const tags = {
    capability: null,
    modules: [],
    version: null,
    integration: null,
    industry: []
  };
  
  // 解析能力标签
  for (const [emoji, info] of Object.entries(CAPABILITY_TAGS)) {
    if (content.includes(emoji) || content.includes(info.name)) {
      tags.capability = emoji;
      break;
    }
  }
  
  // 解析适用模块
  for (const module of SCOPE_TAGS.modules) {
    if (content.includes('[' + module + ']') || content.includes('适用模块：' + module) || content.includes(module)) {
      tags.modules.push(module);
    }
  }
  
  // 解析版本
  for (const version of SCOPE_TAGS.versions) {
    if (content.includes(version)) {
      tags.version = version;
      break;
    }
  }
  
  // 解析集成依赖
  for (const integration of SCOPE_TAGS.integrations) {
    if (content.includes('集成依赖：' + integration) || content.includes(integration)) {
      tags.integration = integration;
      break;
    }
  }
  
  // 解析行业
  for (const industry of SCOPE_TAGS.industries) {
    if (content.includes(industry)) {
      tags.industry.push(industry);
    }
  }
  
  return tags;
}

/**
 * 搜索知识库文档
 */
async function searchKnowledge(query, options = {}) {
  const {
    tags = [],
    modules = [],
    limit = 10
  } = options;
  
  const results = [];
  const keywords = query.toLowerCase().split(/\s+/);
  
  try {
    const kbPath = KNOWLEDGE_BASE_PATH;
    
    // 递归扫描所有.md文件
    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            await processFile(fullPath);
          }
        }
      } catch (err) {
        console.error('扫描目录失败: ' + dir, err.message);
      }
    }
    
    async function processFile(filePath) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(kbPath, filePath);
        
        // 计算关键词匹配分数
        const contentLower = content.toLowerCase();
        let score = 0;
        let matchedKeywords = [];
        
        for (const keyword of keywords) {
          if (keyword.length < 2) continue;
          
          // 标题匹配（权重更高）
          const titleMatch = contentLower.split('\n').find(line => 
            line.startsWith('#') && line.toLowerCase().includes(keyword)
          );
          if (titleMatch) {
            score += 10;
            matchedKeywords.push(keyword);
          }
          
          // 内容匹配
          const regex = new RegExp(keyword, 'gi');
          const matches = contentLower.match(regex);
          if (matches) {
            score += matches.length;
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
          }
        }
        
        if (score > 0) {
          // 过滤能力标签
          const docTags = parseDocumentTags(content, filePath);
          
          if (tags.length > 0) {
            if (!tags.some(t => docTags.capability && docTags.capability.includes(t))) {
              return;
            }
          }
          
          if (modules.length > 0) {
            if (!modules.some(m => docTags.modules.includes(m))) {
              return;
            }
          }
          
          // 提取摘要（前200字符）
          const lines = content.split('\n');
          const contentWithoutHeaders = lines.filter(l => !l.startsWith('#')).join(' ');
          const summary = contentWithoutHeaders.substring(0, 200).trim() + '...';
          
          // 提取标题
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
          
          results.push({
            id: Buffer.from(relativePath).toString('base64'),
            title,
            summary,
            source: relativePath,
            tags: docTags,
            score,
            matchedKeywords,
            relevance: Math.min(score / 10, 1)
          });
        }
      } catch (err) {
        console.error('处理文件失败: ' + filePath, err.message);
      }
    }
    
    await scanDirectory(kbPath);
    
    // 按分数排序
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit);
    
  } catch (err) {
    console.error('知识库搜索失败:', err);
    return [];
  }
}

/**
 * 获取知识详情
 */
async function getKnowledgeById(id) {
  try {
    const decodedPath = Buffer.from(id, 'base64').toString('utf-8');
    const filePath = path.join(KNOWLEDGE_BASE_PATH, decodedPath);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const tags = parseDocumentTags(content, filePath);
    
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
    
    return {
      id,
      title,
      content,
      source: decodedPath,
      tags,
      updatedAt: (await fs.stat(filePath)).mtime.toISOString()
    };
  } catch (err) {
    console.error('获取知识详情失败:', err);
    return null;
  }
}

/**
 * 识别用户意图
 */
function identifyIntent(query) {
  const queryLower = query.toLowerCase();
  
  const intents = {
    capability: ['功能', '能力', '支持', '可以做', '有什么', '功能介绍'],
    configuration: ['配置', '设置', '如何设置', '怎么配置', '安装'],
    integration: ['集成', '对接', '接口', 'API', '连接'],
    bestPractice: ['最佳实践', '方法', '建议', '经验', '案例'],
    troubleshooting: ['问题', '报错', '解决', '故障', '错误'],
    comparison: ['对比', '区别', '差异', '哪个好', '比较']
  };
  
  const matchedIntents = [];
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      matchedIntents.push(intent);
    }
  }
  
  return matchedIntents.length > 0 ? matchedIntents : ['general'];
}

/**
 * 识别周边能力需求
 */
function identifySurroundingCapabilities(tags) {
  const capabilities = [];
  
  if (tags.capability) {
    if (tags.capability.includes('🔴')) {
      capabilities.push({
        type: '🔴 需要额外工作',
        items: ['定制开发', '二次开发', '前端扩展', 'API开发']
      });
    }
    if (tags.capability.includes('🔵')) {
      capabilities.push({
        type: '🔵 需要额外工具',
        items: ['第三方工具', '平台订阅', '工具部署']
      });
    }
    if (tags.capability.includes('🟣')) {
      capabilities.push({
        type: '🟣 需要额外集成',
        items: ['系统对接', 'API集成', '数据同步']
      });
    }
  }
  
  return capabilities;
}

/**
 * 生成问答答案
 */
async function generateAnswer(question, context) {
  context = context || {};
  const startTime = Date.now();
  
  try {
    // 1. 识别意图
    const intents = identifyIntent(question);
    
    // 2. 搜索相关知识
    const searchResults = await searchKnowledge(question, {
      limit: 5
    });
    
    if (searchResults.length === 0) {
      return {
        success: false,
        error: '未找到相关知识',
        responseTime: Date.now() - startTime
      };
    }
    
    // 3. 构建上下文
    const contextDocs = searchResults.map(r => 
      '## ' + r.title + '\n来源: ' + r.source + '\n标签: ' + (r.tags.capability || '未知') + '\n\n' + r.summary
    ).join('\n\n---\n\n');
    
    // 4. 构建系统提示
    const systemPrompt = '你是一个专业的SAP Ariba实施顾问助手。请基于提供的知识库内容，准确、专业地回答用户问题。\n\n回答规范：\n1. 直接回答问题，不要重复问题\n2. 使用中文回答\n3. 标注信息来源（文档名称）\n4. 标注适用范围（模块/版本/集成要求）\n5. 识别是否需要额外工作（🔴🔵🟣标签）\n6. 如涉及多个方案，要进行对比说明\n7. 回答要具体、可操作\n\n能力标签说明：\n- 🟢 原生能力：开箱即用，只需配置\n- 🟡 可配置能力：需专业配置\n- 🔴 需要额外工作：定制开发、二次开发\n- 🔵 需要额外工具：第三方工具、平台\n- 🟣 需要额外集成：系统对接、API集成\n- ⚪ 参考知识：案例、方法论、资源';
    
    // 5. 构建用户提示
    const userPrompt = '用户问题：' + question + '\n\n相关知识库内容：\n' + contextDocs + '\n\n请基于以上知识库内容，准确回答用户问题。';
    
    // 6. 调用LLM生成答案
    let answer;
    if (process.env.COZE_API_KEY) {
      answer = await llm.generate({
        prompt: userPrompt,
        system: systemPrompt,
        context: { type: 'knowledge_qa', question }
      });
    } else {
      // 回退方案：直接返回搜索结果
      answer = '基于知识库搜索结果，以下是相关答案：\n\n' + searchResults.map((r, i) => 
        (i + 1) + '. **' + r.title + '**\n   来源：' + r.source + '\n   摘要：' + r.summary + '\n   能力标签：' + (r.tags.capability || '未标注')
      ).join('\n\n') + '\n\n如需更详细的答案，请配置LLM API Key。';
    }
    
    // 7. 构建响应
    const response = {
      success: true,
      question,
      answer,
      sources: searchResults.map(r => ({
        title: r.title,
        source: r.source,
        tags: r.tags,
        relevance: r.relevance
      })),
      intents,
      surroundingCapabilities: searchResults.flatMap(r => 
        identifySurroundingCapabilities(r.tags)
      ).filter((v, i, a) => a.findIndex(t => t.type === v.type) === i),
      responseTime: Date.now() - startTime
    };
    
    return response;
    
  } catch (err) {
    console.error('生成答案失败:', err);
    return {
      success: false,
      error: '生成答案失败: ' + err.message,
      responseTime: Date.now() - startTime
    };
  }
}

/**
 * 获取知识库统计
 */
async function getKnowledgeStats() {
  try {
    const kbPath = KNOWLEDGE_BASE_PATH;
    let totalDocs = 0;
    const tagCounts = {
      '🟢': 0,
      '🟡': 0,
      '🔴': 0,
      '🔵': 0,
      '🟣': 0,
      '⚪': 0
    };
    const moduleCounts = {};
    const versionCounts = {};
    const integrationCounts = {};
    
    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            totalDocs++;
            
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              const tags = parseDocumentTags(content, fullPath);
              
              // 统计能力标签
              if (tags.capability) {
                tagCounts[tags.capability] = (tagCounts[tags.capability] || 0) + 1;
              }
              
              // 统计模块
              for (const module of tags.modules) {
                moduleCounts[module] = (moduleCounts[module] || 0) + 1;
              }
              
              // 统计版本
              if (tags.version) {
                versionCounts[tags.version] = (versionCounts[tags.version] || 0) + 1;
              }
              
              // 统计集成依赖
              if (tags.integration) {
                integrationCounts[tags.integration] = (integrationCounts[tags.integration] || 0) + 1;
              }
            } catch (err) {
              // 忽略读取错误
            }
          }
        }
      } catch (err) {
        // 忽略目录扫描错误
      }
    }
    
    await scanDirectory(kbPath);
    
    return {
      totalDocuments: totalDocs,
      tagDistribution: tagCounts,
      moduleDistribution: moduleCounts,
      versionDistribution: versionCounts,
      integrationDistribution: integrationCounts,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (err) {
    console.error('获取统计失败:', err);
    return {
      totalDocuments: 0,
      tagDistribution: {},
      moduleDistribution: {},
      versionDistribution: {},
      integrationDistribution: {},
      error: err.message
    };
  }
}

/**
 * 获取能力标签列表
 */
function getCapabilityTags() {
  return Object.entries(CAPABILITY_TAGS).map(([emoji, info]) => ({
    emoji,
    name: info.name,
    description: info.desc
  }));
}

/**
 * 获取模块列表
 */
function getModuleList() {
  return SCOPE_TAGS.modules.map(m => ({
    name: m,
    description: getModuleDescription(m)
  }));
}

function getModuleDescription(module) {
  const descriptions = {
    'Buying': '采购执行模块',
    'Sourcing': '战略寻源模块',
    'Contract': '合同管理模块',
    'Supplier Management': '供应商管理模块',
    'SCC': '供应商合规管理',
    'Catalog': '目录管理',
    'Invoicing': '发票管理',
    'Expenses': '费用管理'
  };
  return descriptions[module] || 'Ariba模块';
}

module.exports = {
  searchKnowledge,
  getKnowledgeById,
  generateAnswer,
  getKnowledgeStats,
  getCapabilityTags,
  getModuleList,
  identifyIntent,
  identifySurroundingCapabilities,
  CAPABILITY_TAGS,
  SCOPE_TAGS
};
