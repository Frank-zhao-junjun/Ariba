/**
 * 合同分析API路由
 */

const express = require('express');
const router = express.Router();
const ContractAnalyzer = require('../services/contractAnalyzer');
const path = require('path');
const fs = require('fs').promises;

// 存储上传文件
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const analyzer = new ContractAnalyzer();

// 确保上传目录存在
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    // 目录已存在
  }
})();

/**
 * POST /api/contract/analyze
 * 上传并分析合同
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text, filename } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供合同文本内容'
      });
    }

    // 分析合同
    const report = await analyzer.analyze(text, filename || '合同文本');
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('合同分析失败:', error);
    res.status(500).json({
      success: false,
      error: '分析失败: ' + error.message
    });
  }
});

/**
 * POST /api/contract/demo
 * 演示模式 - 使用示例合同
 */
router.post('/demo', async (req, res) => {
  try {
    const demoContract = `
    软件开发服务合同
    
    甲方（委托方）：某某科技有限公司
    乙方（受托方）：软件开发有限公司
    
    一、合同金额
    本合同总价为人民币500,000元整，含税。
    
    二、付款条款
    甲方应在乙方完成阶段性验收后30个工作日内支付相应款项。
    
    三、实施交付
    乙方应在合理时间内完成系统开发和部署，并提交交付物。
    
    四、验收标准
    系统应满足甲方的业务需求，达到预定功能要求。
    
    五、质保条款
    质保期为系统验收通过后12个月。
    
    六、违约责任
    任何一方违约，应承担相应的违约责任，赔偿对方因此产生的损失。
    
    七、保密条款
    双方应对合作过程中知悉的对方商业秘密予以保密。
    
    八、知识产权
    乙方开发的软件著作权归甲方所有。
    
    九、争议解决
    如双方发生争议，应友好协商解决；协商不成的，提交甲方所在地法院诉讼解决。
    `;

    const report = await analyzer.analyze(demoContract, '示例合同.txt');
    
    res.json({
      success: true,
      data: report,
      message: '演示模式'
    });
  } catch (error) {
    console.error('演示分析失败:', error);
    res.status(500).json({
      success: false,
      error: '分析失败: ' + error.message
    });
  }
});

module.exports = router;
