const { policyDocuments, vendors, mockPurchaseRequests, departmentBudgets, faqData } = require('./chatbot-knowledge');
const logger = require('../utils/logger');

function classifyIntent(message) {
  const msg = message.toLowerCase();
  if (/采购政策|审批|金额阈值|审批流程|ceo审批|多少钱/.test(msg)) return 'policy';
  if (/供应商|有哪些供应商|供应商信息|哪家好/.test(msg)) return 'vendor';
  if (/申请|状态|进度|我的申请|订单状态|订单|采购单/.test(msg)) return 'status';
  if (/预算|还有多少钱|部门支出|年度预算|还剩/.test(msg)) return 'budget';
  if (/帮我|怎么采购|如何申请|提交采购|新建采购/.test(msg)) return 'guide';
  if (/你好|hello|hi|在吗/.test(msg)) return 'greeting';
  if (/谢谢|感谢|明白了/.test(msg)) return 'thanks';
  return 'unknown';
}

function searchPolicy(keywords) {
  const kw = keywords.toLowerCase();
  return policyDocuments.filter(d => {
    if (d.title.toLowerCase().includes(kw)) return true;
    if (d.content.toLowerCase().includes(kw)) return true;
    // Check category
    if (d.category.toLowerCase().includes(kw)) return true;
    return false;
  });
}

function searchVendor(keywords) {
  const kw = keywords.toLowerCase();
  // Extract category from message
  const categories = ['电子元器件', '办公用品', '生产设备', 'IT服务', 'MRO物料', '包装材料', '物流服务', '环保设备'];
  const words = keywords.split(/[,，、\s]+/);
  
  return vendors.filter(v => {
    // Match by category in message
    for (const cat of categories) {
      if (keywords.includes(cat) && v.category === cat) return true;
    }
    // Match by vendor name
    if (v.name.toLowerCase().includes(kw)) return true;
    return false;
  });
}

function searchPurchaseRequest(keywords) {
  const kw = keywords.toLowerCase();
  return mockPurchaseRequests.filter(pr => {
    if (pr.title.toLowerCase().includes(kw)) return true;
    if (pr.id.toLowerCase().includes(kw)) return true;
    if (kw === '全部' || kw === '我的' || kw === '申请' || kw === '订单') return true;
    return false;
  });
}

function queryBudget(department) {
  return departmentBudgets.find(b => b.department === department);
}

function searchFAQ(message) {
  return faqData.find(f => message.includes(f.question.split('？')[0]));
}

async function processMessage(sessionId, message, userContext = {}) {
  const intent = classifyIntent(message);
  let response = { intent, sessionId };
  
  switch (intent) {
    case 'policy':
      const policyResults = searchPolicy(message);
      if (policyResults.length > 0) {
        response.type = 'policy';
        response.content = '📋 **' + policyResults[0].title + '**\n\n' + policyResults[0].content;
        response.suggestions = ['详细流程', '金额阈值', '联系采购部'];
      } else {
        response.type = 'text';
        response.content = '抱歉，没有找到相关的采购政策。请问您想了解审批流程、供应商管理还是付款政策？';
        response.suggestions = ['审批流程', '供应商管理', '付款政策'];
      }
      break;
    case 'vendor':
      const vendorResults = searchVendor(message);
      if (vendorResults.length > 0) {
        response.type = 'vendor';
        let content = '🏢 **找到 ' + vendorResults.length + ' 家供应商**\n\n';
        vendorResults.forEach((v, i) => { content += (i+1) + '. **' + v.name + '** ⭐' + v.rating + '\n   📦 ' + v.category + ' | ' + v.contact + '\n\n'; });
        response.content = content;
        response.suggestions = ['查看详情', '查看联系方式', '其他品类'];
      } else {
        response.type = 'text';
        response.content = '没有找到符合条件的供应商。请问您需要采购什么品类？';
        response.suggestions = ['电子元器件', '办公用品', 'IT服务', 'MRO物料'];
      }
      break;
    case 'status':
      const prResults = searchPurchaseRequest(message);
      if (prResults.length > 0) {
        response.type = 'status';
        let content = '📦 **您的采购申请**\n\n';
        prResults.forEach(pr => { content += (pr.status === '已完成' ? '✅' : '⏳') + ' **' + pr.id + '** - ' + pr.title + '\n   金额：¥' + pr.amount.toLocaleString() + ' | 状态：' + pr.currentStep + '\n\n'; });
        response.content = content;
        response.suggestions = ['查看详情', '催促审批', '取消申请'];
      } else {
        response.type = 'text';
        response.content = '您目前没有进行中的采购申请。需要提交新的采购申请吗？';
        response.suggestions = ['提交采购申请', '查看采购政策', '联系采购部'];
      }
      break;
    case 'budget':
      const dept = extractDepartment(message);
      const budget = queryBudget(dept);
      if (budget) {
        response.type = 'budget';
        const remaining = budget.totalBudget - budget.used - budget.committed;
        const usagePercent = ((budget.used + budget.committed) / budget.totalBudget * 100).toFixed(1);
        let content = '💰 **' + dept + ' ' + budget.fiscalYear + '年度预算**\n\n';
        content += '| 项目 | 金额 |\n|------|------|\n| 年度预算 | ¥' + budget.totalBudget.toLocaleString() + ' |\n| 已使用 | ¥' + budget.used.toLocaleString() + ' |\n| 已承诺 | ¥' + budget.committed.toLocaleString() + ' |\n| 剩余可用 | ¥' + remaining.toLocaleString() + ' |\n\n';
        const barLen = 20, filled = Math.round((budget.used + budget.committed) / budget.totalBudget * barLen);
        content += '消耗进度：[ ' + '█'.repeat(filled) + '░'.repeat(barLen - filled) + ' ] ' + usagePercent + '%\n';
        response.content = content;
        response.suggestions = ['查看项目明细', '申请追加预算', '查看采购政策'];
      } else {
        response.type = 'text';
        response.content = '没有找到该部门的预算信息。';
        response.suggestions = ['研发部预算', '生产部预算', '信息中心预算'];
      }
      break;
    case 'guide':
      response.type = 'guide';
      response.content = '🛒 **采购申请引导**\n\n好的，我来帮您提交采购申请。请告诉我：**您需要采购什么产品或服务？**\n\n例如："采购3台办公电脑" 或 "需要IT软件开发服务"';
      response.suggestions = ['办公电脑', '办公用品', 'IT服务', 'MRO物料'];
      break;
    case 'greeting':
      response.type = 'text';
      response.content = '👋 你好！我是采购小助手，可以帮你：\n\n• 📋 解答采购政策问题\n• 🏢 查找供应商信息\n• 📦 查询采购申请状态\n• 💰 了解部门预算\n• 🛒 引导提交采购申请\n\n请告诉我你需要什么帮助？';
      response.suggestions = ['采购政策', '找供应商', '我的申请', '提交采购', '预算查询'];
      break;
    case 'thanks':
      response.type = 'text';
      response.content = '很高兴能帮到你！😊 还有其他采购相关的问题吗？';
      response.suggestions = ['采购政策', '找供应商', '提交采购'];
      break;
    default:
      const faq = searchFAQ(message);
      if (faq) {
        response.type = 'faq';
        response.content = '💡 **' + faq.question + '**\n\n' + faq.answer;
        response.suggestions = ['还有其他问题', '我要采购', '查看供应商'];
      } else {
        response.type = 'text';
        response.content = '抱歉，我不太理解您的问题。🤔\n\n您可以尝试这样问我：\n• "超过10万需要哪些审批？"\n• "电子元器件有哪些供应商？"\n• "我的采购申请状态"\n• "研发部还有多少预算？"';
        response.suggestions = ['采购政策', '找供应商', '我的申请', '提交采购'];
      }
  }
  logger.info('聊天消息处理', { sessionId, intent, type: response.type });
  return response;
}

function extractDepartment(message) {
  const depts = ['研发部', '生产部', '信息中心', '市场部', '财务部', '人力资源部', '采购部'];
  for (const dept of depts) { if (message.includes(dept)) return dept; }
  return null;
}

module.exports = { classifyIntent, searchPolicy, searchVendor, searchPurchaseRequest, queryBudget, processMessage };
