/**
 * 智能发票差异分析服务
 */

class InvoiceAnalyzer {
  constructor() {
    this.discrepancyReasons = {
      PRICE_VARIANCE: { name: '价格差异', thresholds: { minor: 0.02, moderate: 0.05, major: 0.10 } },
      QUANTITY_VARIANCE: { name: '数量差异', thresholds: { minor: 0.02, moderate: 0.05, major: 0.10 } },
      MISSING_IN_PO: { name: '无PO匹配', thresholds: {} }
    };
  }

  async analyze(invoice, po, receipt = null) {
    const results = {
      matchStatus: 'UNKNOWN',
      lineItems: [],
      summary: {
        totalInvoiceAmount: 0,
        totalPOAmount: 0,
        totalVariance: 0,
        variancePercent: 0,
        itemsMatched: 0,
        itemsWithDiscrepancy: 0
      },
      discrepancies: [],
      rootCauses: [],
      recommendations: []
    };

    results.summary.totalInvoiceAmount = invoice.totalAmount || this.calcLineTotal(invoice.lineItems);
    results.summary.totalPOAmount = po.totalAmount || this.calcLineTotal(po.lineItems);
    results.summary.totalVariance = results.summary.totalInvoiceAmount - results.summary.totalPOAmount;
    results.summary.variancePercent = results.summary.totalPOAmount > 0 
      ? Math.abs(results.summary.totalVariance / results.summary.totalPOAmount) : 0;

    const poLineMap = this.buildLineMap(po.lineItems);
    
    for (const invLine of invoice.lineItems || []) {
      const poLine = poLineMap[invLine.itemNumber] || this.findMatchingLine(poLineMap, invLine);
      const lineAnalysis = this.analyzeLine(invLine, poLine, receipt);
      results.lineItems.push(lineAnalysis);

      if (lineAnalysis.status === 'MATCHED') {
        results.summary.itemsMatched++;
      } else {
        results.summary.itemsWithDiscrepancy++;
        results.discrepancies.push(...lineAnalysis.discrepancies);
      }
    }

    results.matchStatus = this.determineMatchStatus(results);

    if (receipt) {
      results.threeWayMatch = this.performThreeWayMatch(invoice, po, receipt);
    }

    results.recommendations = this.generateRecommendations(results);
    results.rootCauses = this.analyzeRootCauses(results.discrepancies);

    return results;
  }

  calcLineTotal(lineItems) {
    if (!lineItems || !Array.isArray(lineItems)) return 0;
    return lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) || 0) * (parseFloat(item.quantity) || 0);
    }, 0);
  }

  buildLineMap(lineItems) {
    const map = {};
    (lineItems || []).forEach(item => { map[item.itemNumber] = item; });
    return map;
  }

  findMatchingLine(lineMap, targetLine) {
    if (lineMap[targetLine.itemNumber]) return lineMap[targetLine.itemNumber];
    for (const key in lineMap) {
      const poLine = lineMap[key];
      if (poLine.description && targetLine.description &&
          (poLine.description.includes(targetLine.description) || 
           targetLine.description.includes(poLine.description))) {
        return poLine;
      }
    }
    return null;
  }

  analyzeLine(invLine, poLine, receipt) {
    const result = {
      itemNumber: invLine.itemNumber,
      description: invLine.description,
      status: 'MATCHED',
      discrepancies: []
    };

    if (!poLine) {
      result.status = 'NO_MATCH';
      result.discrepancies.push({
        type: 'MISSING_IN_PO',
        severity: 'MAJOR',
        message: '发票行 ' + invLine.itemNumber + ' 在采购订单中未找到匹配项'
      });
      return result;
    }

    const priceVariance = this.calcPriceVariance(invLine, poLine);
    if (Math.abs(priceVariance.percent) > 0.001) {
      const severity = this.determineSeverity(priceVariance.percent, this.discrepancyReasons.PRICE_VARIANCE.thresholds);
      result.discrepancies.push({
        type: 'PRICE_VARIANCE',
        severity: severity,
        invPrice: invLine.unitPrice,
        poPrice: poLine.unitPrice,
        invQty: invLine.quantity,
        poQty: poLine.quantity,
        variancePercent: priceVariance.percent,
        message: '价格差异: ¥' + invLine.unitPrice + ' vs ¥' + poLine.unitPrice + ' (' + (priceVariance.percent * 100).toFixed(2) + '%)'
      });
    }

    const qtyVariance = this.calcQuantityVariance(invLine, poLine);
    if (Math.abs(qtyVariance) > 0.001) {
      const severity = this.determineSeverity(qtyVariance, this.discrepancyReasons.QUANTITY_VARIANCE.thresholds);
      result.discrepancies.push({
        type: 'QUANTITY_VARIANCE',
        severity: severity,
        invQty: invLine.quantity,
        poQty: poLine.quantity,
        variance: qtyVariance,
        message: '数量差异: ' + invLine.quantity + ' vs ' + poLine.quantity
      });
    }

    if (result.discrepancies.length > 0) {
      const hasMajor = result.discrepancies.some(d => d.severity === 'MAJOR');
      const hasModerate = result.discrepancies.some(d => d.severity === 'MODERATE');
      result.status = hasMajor ? 'MAJOR_DISCREPANCY' : hasModerate ? 'MODERATE_DISCREPANCY' : 'MINOR_DISCREPANCY';
    }

    return result;
  }

  calcPriceVariance(invLine, poLine) {
    const invPrice = parseFloat(invLine.unitPrice) || 0;
    const poPrice = parseFloat(poLine.unitPrice) || 0;
    return { percent: poPrice > 0 ? (invPrice - poPrice) / poPrice : 0 };
  }

  calcQuantityVariance(invLine, poLine) {
    const invQty = parseFloat(invLine.quantity) || 0;
    const poQty = parseFloat(poLine.quantity) || 0;
    return poQty > 0 ? (invQty - poQty) / poQty : 0;
  }

  determineSeverity(value, thresholds) {
    const absValue = Math.abs(value);
    if (absValue <= (thresholds.minor || 0)) return 'MINOR';
    if (absValue <= (thresholds.moderate || 0)) return 'MODERATE';
    return 'MAJOR';
  }

  performThreeWayMatch(invoice, po, receipt) {
    const result = {
      status: 'PASSED',
      totalLines: invoice.lineItems?.length || 0,
      matchedLines: 0,
      failedLines: 0,
      details: []
    };

    const poLineMap = this.buildLineMap(po.lineItems);
    
    for (const invLine of invoice.lineItems || []) {
      const poLine = poLineMap[invLine.itemNumber];
      const receiptLine = this.findReceiptLine(receipt, invLine);

      if (!poLine || !receiptLine) {
        result.status = 'BLOCKED';
        result.failedLines++;
        result.details.push({
          itemNumber: invLine.itemNumber,
          status: 'MISSING_DOCUMENT',
          message: !poLine ? '无采购订单' : '无收货记录'
        });
        continue;
      }

      const invQty = parseFloat(invLine.quantity) || 0;
      const grQty = parseFloat(receiptLine.quantity) || 0;

      if (Math.abs(invQty - grQty) > 0.01) {
        result.status = 'FAILED';
        result.failedLines++;
        result.details.push({
          itemNumber: invLine.itemNumber,
          status: 'QUANTITY_MISMATCH',
          message: '发票(' + invQty + ') ≠ 收货单(' + grQty + ')'
        });
      } else {
        result.matchedLines++;
        result.details.push({
          itemNumber: invLine.itemNumber,
          status: 'MATCHED',
          message: '三单匹配'
        });
      }
    }

    return result;
  }

  findReceiptLine(receipt, invLine) {
    const receiptLines = receipt.lineItems || [];
    return receiptLines.find(line => 
      line.itemNumber === invLine.itemNumber ||
      (line.description && invLine.description && line.description.includes(invLine.description))
    );
  }

  determineMatchStatus(results) {
    if (results.summary.itemsWithDiscrepancy === 0) return 'APPROVED';
    if (results.summary.variancePercent > 0.10) return 'ESCALATE';
    if (results.summary.variancePercent > 0.05) return 'REVIEW';
    return 'PENDING_INFO';
  }

  analyzeRootCauses(discrepancies) {
    const causes = [];
    const typeCount = {};
    discrepancies.forEach(d => { typeCount[d.type] = (typeCount[d.type] || 0) + 1; });

    if (typeCount['PRICE_VARIANCE']) {
      causes.push({
        type: 'PRICE_VARIANCE',
        probability: 0.7,
        description: '可能是合同价格变更、紧急采购溢价或市场波动导致',
        suggestions: ['检查是否有合同变更单', '核对供应商调价通知', '评估采购批次历史']
      });
    }

    if (typeCount['QUANTITY_VARIANCE']) {
      causes.push({
        type: 'QUANTITY_VARIANCE',
        probability: 0.6,
        description: '可能是分批交货、部分验收或包装单位不一致',
        suggestions: ['核对收货单实际数量', '检查是否存在在途物资', '确认计量单位']
      });
    }

    return causes;
  }

  generateRecommendations(results) {
    const recommendations = [];

    switch (results.matchStatus) {
      case 'APPROVED':
        recommendations.push({ priority: 'LOW', category: 'COMPLIANCE', message: '发票与PO完全匹配，可自动审批通过', action: 'AUTO_APPROVE' });
        break;
      case 'REVIEW':
        recommendations.push({ priority: 'MEDIUM', category: 'INVESTIGATION', message: '存在中等差异，请采购员核实原因后提交审批', action: 'REVIEW' });
        break;
      case 'ESCALATE':
        recommendations.push({ priority: 'HIGH', category: 'APPROVAL', message: '差异超过10%，需要采购经理和财务总监审批', action: 'ESCALATE' });
        break;
      default:
        recommendations.push({ priority: 'LOW', category: 'CLARIFICATION', message: '轻微差异，可要求供应商说明原因后处理', action: 'PENDING' });
    }

    return recommendations;
  }

  getDemoData() {
    return {
      invoice: {
        documentNumber: 'INV-2024-0892',
        date: '2024-04-15',
        vendor: '博世汽车部件(苏州)有限公司',
        vendorCode: 'V001234',
        totalAmount: 198500.00,
        currency: 'CNY',
        lineItems: [
          { itemNumber: 'MAT-001', description: '制动系统传感器', quantity: 500, unitPrice: 350.00, amount: 175000.00 },
          { itemNumber: 'MAT-002', description: '电子控制单元线束', quantity: 150, unitPrice: 156.67, amount: 23500.00 }
        ]
      },
      po: {
        documentNumber: 'PO-2024-0456',
        date: '2024-04-01',
        vendor: '博世汽车部件(苏州)有限公司',
        vendorCode: 'V001234',
        totalAmount: 186600.00,
        currency: 'CNY',
        paymentTerms: 'NET 60',
        deliveryDate: '2024-04-10',
        lineItems: [
          { itemNumber: 'MAT-001', description: '制动系统传感器', quantity: 500, unitPrice: 340.00, amount: 170000.00 },
          { itemNumber: 'MAT-002', description: '电子控制单元线束', quantity: 140, unitPrice: 150.00, amount: 21000.00 }
        ]
      },
      receipt: {
        documentNumber: 'GR-2024-0234',
        date: '2024-04-12',
        vendor: '博世汽车部件(苏州)有限公司',
        vendorCode: 'V001234',
        lineItems: [
          { itemNumber: 'MAT-001', description: '制动系统传感器', quantity: 500, receivedDate: '2024-04-12' },
          { itemNumber: 'MAT-002', description: '电子控制单元线束', quantity: 140, receivedDate: '2024-04-12' }
        ]
      }
    };
  }
}

module.exports = InvoiceAnalyzer;
