/**
 * RFx API 路由
 */

const express = require('express');
const RFxAssistant = require('../modules/rfx-generator');
const router = express.Router();
const rfxAssistant = new RFxAssistant();

router.post('/generate', async (req, res) => {
  try {
    const input = req.body;
    const validation = rfxAssistant.validate(input);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: '参数验证失败', details: validation.errors });
    }
    const result = await rfxAssistant.generate(input);
    if (result.success) res.json(result);
    else res.status(400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: '服务器错误', message: error.message });
  }
});

router.get('/types', (req, res) => {
  res.json({ success: true, types: rfxAssistant.getSupportedTypes() });
});

router.get('/categories', (req, res) => {
  res.json({ success: true, categories: rfxAssistant.getSupportedCategories() });
});

router.get('/example', (req, res) => {
  const type = req.query.type || 'RFQ';
  res.json({ success: true, example: rfxAssistant.getExample(type.toUpperCase()) });
});

router.get('/template/:type', (req, res) => {
  const { type } = req.params;
  const upperType = type.toUpperCase();
  if (!['RFQ', 'RFP', 'RFI', 'RFB'].includes(upperType)) {
    return res.status(400).json({ success: false, error: '无效的RFx类型' });
  }
  const { templates } = require('../modules/rfx-generator/templates');
  const template = templates[upperType];
  res.json({ success: true, template: { type: upperType, title: template.title, sections: upperType === 'RFQ' ? template.sectionsZh : template.sections } });
});

module.exports = router;
