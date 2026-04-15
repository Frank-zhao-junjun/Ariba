/**
 * AI询价比价助手 - 核心模块
 * 自动解析供应商报价文件，生成比价分析表
 */

const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 字段映射表 - 中英文关键词匹配
const FIELD_MAPPING = {
  vendor: ['供应商', 'Vendor', 'Supplier', '报价方', 'Company', '公司名称'],
  item: ['物料', 'Item', '产品', '品名', 'Description', '物料描述', '货物名称'],
  quantity: ['数量', 'Qty', 'Quantity', '采购数量', 'Order Qty'],
  unitPrice: ['单价', 'Unit Price', '含税单价', '报价', 'UnitPrice', 'Price'],
  totalPrice: ['总价', 'Total', 'Total Price', '含税总价', 'Amount'],
  deliveryDate: ['交期', 'Delivery', '交货日期', 'Delivery Date', 'Delivery Time'],
  paymentTerm: ['付款条款', 'Payment', 'Payment Term', '结算方式'],
  validity: ['有效期', 'Validity', 'Quote Valid Until']
};

/**
 * 从文本中提取关键字段
 */
function extractFields(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const result = {};
  
  for (const [field, keywords] of Object.entries(FIELD_MAPPING)) {
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.includes(keyword)) {
          // 尝试提取冒号后的值
          const match = line.match(/[:：]\s*(.+)/);
          if (match) {
            result[field] = match[1].trim();
            break;
          }
          // 尝试提取数字（用于数量和价格）
          const numMatch = line.match(/[\d,]+\.?\d*/);
          if (numMatch && (field === 'quantity' || field === 'unitPrice' || field === 'totalPrice')) {
            result[field] = numMatch[0].replace(/,/g, '');
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * 解析PDF文件
 */
async function parsePDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    
    // 提取供应商名称（通常在开头）
    const lines = text.split('\n');
    let vendor = '';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const match = lines[i].match(/(?:供应商|报价方|Vendor|Supplier)[:：]?\s*(.+)/i);
      if (match) {
        vendor = match[1].trim();
        break;
      }
    }
    if (!vendor) {
      // 尝试从文件名提取
      vendor = path.basename(filePath, path.extname(filePath));
    }
    
    // 提取表格数据
    const extractedData = extractFields(text);
    extractedData.vendor = vendor || extractedData.vendor;
    
    // 智能提取行项目（表格形式的数据）
    const lineItems = extractLineItems(text);
    
    return {
      success: true,
      vendor: extractedData.vendor || vendor,
      rawText: text.substring(0, 500), // 保存前500字符用于调试
      fields: extractedData,
      lineItems: lineItems,
      metadata: {
        pages: data.numpages,
        parsedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('PDF解析错误:', error);
    return {
      success: false,
      error: error.message,
      vendor: path.basename(filePath, path.extname(filePath))
    };
  }
}

/**
 * 从文本中提取行项目数据
 */
function extractLineItems(text) {
  const items = [];
  const lines = text.split('\n');
  
  // 常见的数字模式：序号 物料 数量 单价 总价
  const numberPattern = /(\d+)\s+([^\d\n]+?)\s+(\d+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/;
  
  for (const line of lines) {
    const match = line.match(numberPattern);
    if (match) {
      items.push({
        index: parseInt(match[1]),
        item: match[2].trim(),
        quantity: parseFloat(match[3].replace(/,/g, '')),
        unitPrice: parseFloat(match[4].replace(/,/g, '')),
        totalPrice: parseFloat(match[5].replace(/,/g, ''))
      });
    }
  }
  
  // 备选：简单的键值对模式
  if (items.length === 0) {
    const kvPattern = /([^\s:：]+)[:：]\s*(\d+[\d,]*\.?\d*)/g;
    let match;
    while ((match = kvPattern.exec(text)) !== null) {
      const key = match[1].trim();
      const value = parseFloat(match[2].replace(/,/g, ''));
      
      if (['quantity', 'qty'].some(k => key.toLowerCase().includes(k))) {
        items.push({ quantity: value });
      } else if (['price', '单价', '报价'].some(k => key.includes(k))) {
        items.push({ unitPrice: value });
      }
    }
  }
  
  return items;
}

/**
 * 解析Excel文件
 */
function parseExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 查找表头行
    let headerRow = -1;
    const headers = ['供应商', 'Vendor', '物料', 'Item', '数量', 'Qty', '单价', 'Price'];
    
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (Array.isArray(row)) {
        const rowStr = row.join(' ');
        if (headers.some(h => rowStr.includes(h))) {
          headerRow = i;
          break;
        }
      }
    }
    
    // 提取数据行
    const lineItems = [];
    const vendor = path.basename(filePath, path.extname(filePath));
    
    if (headerRow >= 0) {
      const header = data[headerRow].map(h => String(h || '').toLowerCase());
      
      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const item = {};
        header.forEach((h, idx) => {
          if (h.includes('物料') || h.includes('item') || h.includes('description')) {
            item.item = row[idx];
          } else if (h.includes('数量') || h.includes('qty')) {
            item.quantity = parseFloat(row[idx]) || 0;
          } else if (h.includes('单价') || h.includes('price')) {
            item.unitPrice = parseFloat(String(row[idx]).replace(/,/g, '')) || 0;
          } else if (h.includes('总价') || h.includes('total')) {
            item.totalPrice = parseFloat(String(row[idx]).replace(/,/g, '')) || 0;
          }
        });
        
        if (item.item || item.quantity || item.unitPrice) {
          lineItems.push(item);
        }
      }
    }
    
    // 计算总价
    lineItems.forEach(item => {
      if (!item.totalPrice && item.quantity && item.unitPrice) {
        item.totalPrice = item.quantity * item.unitPrice;
      }
    });
    
    return {
      success: true,
      vendor: vendor,
      lineItems: lineItems,
      metadata: {
        sheets: workbook.SheetNames.length,
        rows: data.length,
        parsedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Excel解析错误:', error);
    return {
      success: false,
      error: error.message,
      vendor: path.basename(filePath, path.extname(filePath))
    };
  }
}

/**
 * 生成比价矩阵
 */
function generateComparisonMatrix(quotes) {
  // 收集所有唯一的行项目
  const allItems = new Map();
  
  quotes.forEach(quote => {
    if (quote.lineItems && quote.lineItems.length > 0) {
      quote.lineItems.forEach(item => {
        const key = item.item || `Item-${item.index || allItems.size + 1}`;
        if (!allItems.has(key)) {
          allItems.set(key, { item: key, quantities: {} });
        }
        const existing = allItems.get(key);
        existing.quantities[quote.vendor] = {
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || item.quantity * item.unitPrice || 0
        };
      });
    }
  });
  
  // 构建矩阵
  const matrix = {
    vendors: quotes.map(q => q.vendor),
    items: Array.from(allItems.values()),
    summary: {
      totalPrices: {},
      lowestPrice: {},
      recommended: null
    }
  };
  
  // 计算每个供应商的总价
  matrix.vendors.forEach(vendor => {
    let total = 0;
    matrix.items.forEach(itemData => {
      const vendorData = itemData.quantities[vendor];
      if (vendorData) {
        total += vendorData.totalPrice || 0;
      }
    });
    matrix.summary.totalPrices[vendor] = total;
  });
  
  // 找出最低价
  if (Object.keys(matrix.summary.totalPrices).length > 0) {
    const sorted = Object.entries(matrix.summary.totalPrices)
      .sort((a, b) => a[1] - b[1]);
    matrix.summary.lowestPrice = {
      vendor: sorted[0][0],
      amount: sorted[0][1]
    };
    matrix.summary.recommended = sorted[0][0];
  }
  
  return matrix;
}

/**
 * 主解析函数 - 根据文件类型选择解析方式
 */
async function parseQuote(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    return await parsePDF(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return parseExcel(filePath);
  } else {
    return {
      success: false,
      error: `不支持的文件格式: ${ext}`,
      vendor: path.basename(filePath, ext)
    };
  }
}

module.exports = {
  parseQuote,
  parsePDF,
  parseExcel,
  extractFields,
  generateComparisonMatrix,
  FIELD_MAPPING
};
