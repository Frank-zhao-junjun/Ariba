/**
 * AI寻源场景优化器 - 核心服务
 * 实现多维度评分算法和TCO计算引擎
 */

const { v4: uuidv4 } = require('uuid');

// 模拟数据存储（生产环境应连接数据库）
const scenarios = new Map();

class SourcingOptimizerService {
  
  /**
   * 创建寻源场景
   */
  async createScenario(params) {
    const { name, purchaseReqId, items, supplierIds, weightConfig } = params;
    
    const scenario = {
      id: `sco-${uuidv4().slice(0, 8)}`,
      name,
      purchaseReqId,
      items: items.map(item => ({
        ...item,
        id: `item-${uuidv4().slice(0, 6)}`
      })),
      supplierIds,
      weightConfig,
      status: 'pending',
      scores: [],
      recommendations: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    scenarios.set(scenario.id, scenario);
    
    // 自动计算评分
    await this.calculateScores(scenario.id);
    
    return scenario;
  }

  /**
   * 获取场景详情
   */
  async getScenario(id) {
    return scenarios.get(id);
  }

  /**
   * 列表所有场景
   */
  async listScenarios() {
    return Array.from(scenarios.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * 计算多维度评分
   */
  async calculateScores(scenarioId) {
    const scenario = scenarios.get(scenarioId);
    if (!scenario) throw new Error('场景不存在');

    const { supplierIds, weightConfig, items } = scenario;
    
    // 计算每个供应商的评分
    const scores = supplierIds.map((supplierId, index) => {
      // 模拟供应商数据
      const supplierData = this.getMockSupplierData(supplierId, items[index % items.length]);
      
      // 计算各维度得分
      const priceScore = this.calculatePriceScore(supplierData.price, items);
      const qualityScore = this.calculateQualityScore(supplierData.defectRate);
      const deliveryScore = this.calculateDeliveryScore(
        supplierData.leadTime, 
        supplierData.onTimeRate
      );
      const riskScore = this.calculateRiskScore(supplierData.riskRating);
      
      // 加权总分
      const weights = weightConfig;
      const totalScore = 
        (priceScore * weights.price / 100) +
        (qualityScore * weights.quality / 100) +
        (deliveryScore * weights.delivery / 100) +
        (riskScore * weights.risk / 100);
      
      // 计算TCO
      const tco = this.calculateTCOForSupplier(supplierData, items);
      
      // 生成推荐
      const recommendation = this.generateRecommendation(totalScore, tco);
      
      return {
        scenarioId,
        supplierId,
        supplierName: supplierData.name,
        totalScore: Math.round(totalScore * 100) / 100,
        breakdown: {
          priceScore: Math.round(priceScore * 100) / 100,
          qualityScore: Math.round(qualityScore * 100) / 100,
          deliveryScore: Math.round(deliveryScore * 100) / 100,
          riskScore: Math.round(riskScore * 100) / 100
        },
        weights,
        tco,
        recommendation,
        reason: this.generateReason(priceScore, qualityScore, deliveryScore, riskScore, tco),
        rawData: supplierData
      };
    });

    // 按总分排序
    scores.sort((a, b) => b.totalScore - a.totalScore);
    
    // 标记排名
    scores.forEach((score, index) => {
      score.rank = index + 1;
    });

    // 更新场景
    scenario.scores = scores;
    scenario.status = 'scored';
    scenario.recommendations = {
      recommended: scores[0],
      alternatives: scores.slice(1, 4),
      totalScenarios: scores.length
    };
    scenario.updatedAt = new Date().toISOString();

    return scores;
  }

  /**
   * 计算价格得分 (越低越好，得分越高)
   */
  calculatePriceScore(price, items) {
    const avgPrice = price;
    const minPrice = avgPrice * 0.8;  // 假设最低价为平均的80%
    const maxPrice = avgPrice * 1.2; // 假设最高价为平均的120%
    
    if (price <= minPrice) return 100;
    if (price >= maxPrice) return 0;
    
    return 100 - ((price - minPrice) / (maxPrice - minPrice)) * 100;
  }

  /**
   * 计算质量得分 (不良率越低，得分越高)
   */
  calculateQualityScore(defectRate) {
    // 0%不良率=100分, 5%以上=0分
    if (defectRate <= 0) return 100;
    if (defectRate >= 5) return 0;
    
    return 100 - (defectRate / 5) * 100;
  }

  /**
   * 计算交期得分 (交期和准时率综合)
   */
  calculateDeliveryScore(leadTime, onTimeRate) {
    // 交期得分 (7天=100分, 30天=0分)
    const leadTimeScore = leadTime <= 7 ? 100 : Math.max(0, 100 - ((leadTime - 7) / 23) * 100);
    
    // 准时率得分
    const onTimeScore = onTimeRate * 100;
    
    // 综合得分 (交期40% + 准时率60%)
    return leadTimeScore * 0.4 + onTimeScore * 0.6;
  }

  /**
   * 计算风险得分 (评级越高，得分越高)
   */
  calculateRiskScore(riskRating) {
    // A=100, B=80, C=60, D=40, E=20
    const ratingScores = { 'A': 100, 'B': 80, 'C': 60, 'D': 40, 'E': 20 };
    return ratingScores[riskRating] || 50;
  }

  /**
   * 计算总拥有成本 (TCO)
   */
  calculateTCOForSupplier(supplierData, items) {
    const item = items[0]; // 取第一个物料计算
    
    const purchaseCost = supplierData.price * item.quantity;
    const shippingCost = purchaseCost * supplierData.shippingRate; // 运费比例
    const qualityCost = item.quantity * supplierData.defectRate / 100 * supplierData.unitHandlingCost;
    const inventoryCost = item.quantity * supplierData.price * supplierData.holdingDays * 0.001; // 日持有成本率
    const riskCost = purchaseCost * supplierData.disruptionProbability / 100 * 0.1; // 中断损失系数
    
    const totalTCO = purchaseCost + shippingCost + qualityCost + inventoryCost + riskCost;
    
    return {
      purchaseCost: Math.round(purchaseCost * 100) / 100,
      shippingCost: Math.round(shippingCost * 100) / 100,
      qualityCost: Math.round(qualityCost * 100) / 100,
      inventoryCost: Math.round(inventoryCost * 100) / 100,
      riskCost: Math.round(riskCost * 100) / 100,
      totalTCO: Math.round(totalTCO * 100) / 100
    };
  }

  /**
   * 生成推荐
   */
  generateRecommendation(totalScore, tco) {
    if (totalScore >= 80) return 'adopt';
    if (totalScore >= 60) return 'consider';
    return 'reject';
  }

  /**
   * 生成推荐理由
   */
  generateReason(priceScore, qualityScore, deliveryScore, riskScore, tco) {
    const reasons = [];
    
    const strengths = [];
    const weaknesses = [];
    
    if (priceScore >= 80) strengths.push('价格优势明显');
    else if (priceScore < 50) weaknesses.push('价格偏高');
    
    if (qualityScore >= 80) strengths.push('质量优秀');
    else if (qualityScore < 50) weaknesses.push('质量风险较高');
    
    if (deliveryScore >= 80) strengths.push('交期表现优异');
    else if (deliveryScore < 50) weaknesses.push('交期不稳定');
    
    if (riskScore >= 80) strengths.push('供应商风险低');
    else if (riskScore < 50) weaknesses.push('供应商风险较高');
    
    if (strengths.length > 0) {
      reasons.push(`优势: ${strengths.join('、')}`);
    }
    if (weaknesses.length > 0) {
      reasons.push(`待改进: ${weaknesses.join('、')}`);
    }
    
    reasons.push(`TCO综合成本: ¥${tco.totalTCO.toLocaleString()}`);
    
    return reasons.join(' | ');
  }

  /**
   * 获取模拟供应商数据
   */
  getMockSupplierData(supplierId, item) {
    // 模拟不同供应商的数据
    const supplierProfiles = [
      {
        name: '华强电子科技',
        price: 850 + Math.random() * 200,
        defectRate: 0.8,
        leadTime: 10,
        onTimeRate: 0.95,
        riskRating: 'A',
        shippingRate: 0.02,
        unitHandlingCost: 50,
        holdingDays: 7,
        disruptionProbability: 2
      },
      {
        name: '深圳创联供应商',
        price: 720 + Math.random() * 150,
        defectRate: 2.1,
        leadTime: 14,
        onTimeRate: 0.88,
        riskRating: 'B',
        shippingRate: 0.025,
        unitHandlingCost: 80,
        holdingDays: 10,
        disruptionProbability: 5
      },
      {
        name: '中山精密制造',
        price: 980 + Math.random() * 100,
        defectRate: 0.3,
        leadTime: 8,
        onTimeRate: 0.98,
        riskRating: 'A',
        shippingRate: 0.015,
        unitHandlingCost: 30,
        holdingDays: 5,
        disruptionProbability: 1
      },
      {
        name: '东莞鑫源实业',
        price: 650 + Math.random() * 100,
        defectRate: 3.5,
        leadTime: 18,
        onTimeRate: 0.82,
        riskRating: 'C',
        shippingRate: 0.03,
        unitHandlingCost: 100,
        holdingDays: 14,
        disruptionProbability: 8
      },
      {
        name: '苏州智造科技',
        price: 1100 + Math.random() * 150,
        defectRate: 0.2,
        leadTime: 7,
        onTimeRate: 0.99,
        riskRating: 'A',
        shippingRate: 0.012,
        unitHandlingCost: 25,
        holdingDays: 4,
        disruptionProbability: 0.5
      }
    ];

    // 基于supplierId选择供应商
    const index = supplierId ? 
      parseInt(supplierId.replace(/\D/g, '').slice(-1), 10) % supplierProfiles.length : 
      Math.floor(Math.random() * supplierProfiles.length);
    
    return supplierProfiles[index] || supplierProfiles[0];
  }

  /**
   * 敏感性分析
   */
  async sensitivityAnalysis(scenarioId, priceFluctuation) {
    const scenario = scenarios.get(scenarioId);
    if (!scenario) throw new Error('场景不存在');

    const { scores } = scenario;
    const [minFluctuation, maxFluctuation] = priceFluctuation;
    
    const sensitivityData = [];
    
    // 生成价格波动敏感性曲线
    for (let fluctuation = minFluctuation; fluctuation <= maxFluctuation; fluctuation += 5) {
      const adjustedScores = scores.map(score => {
        const adjustedPrice = score.rawData.price * (1 + fluctuation / 100);
        const adjustedTCO = {
          ...score.tco,
          purchaseCost: adjustedPrice * 100, // 假设数量100
          totalTCO: score.tco.totalTCO * (1 + fluctuation / 100)
        };
        
        // 重新计算价格得分
        const newPriceScore = this.calculatePriceScore(adjustedPrice, scenario.items);
        const weights = score.weights;
        const newTotalScore = 
          (newPriceScore * weights.price / 100) +
          (score.breakdown.qualityScore * weights.quality / 100) +
          (score.breakdown.deliveryScore * weights.delivery / 100) +
          (score.breakdown.riskScore * weights.risk / 100);
        
        return {
          supplierId: score.supplierId,
          supplierName: score.supplierName,
          fluctuation,
          priceScore: Math.round(newPriceScore * 100) / 100,
          totalScore: Math.round(newTotalScore * 100) / 100,
          tco: adjustedTCO
        };
      });

      sensitivityData.push({
        fluctuation,
        rankings: adjustedScores.sort((a, b) => b.totalScore - a.totalScore)
      });
    }

    // 分析最优方案稳定性
    const topSupplierChanges = sensitivityData.filter(
      (d, i, arr) => i > 0 && d.rankings[0].supplierId !== arr[0].rankings[0].supplierId
    );

    return {
      sensitivityData,
      insight: topSupplierChanges.length === 0 ? 
        '最优方案在价格波动±20%范围内保持稳定' :
        `价格波动会影响最优方案选择，请关注`,
      stableRange: this.calculateStableRange(sensitivityData)
    };
  }

  /**
   * 计算稳定区间
   */
  calculateStableRange(sensitivityData) {
    if (sensitivityData.length < 2) return null;
    
    let stableStart = sensitivityData[0].fluctuation;
    let stableEnd = sensitivityData[sensitivityData.length - 1].fluctuation;
    
    // 找到最优方案保持不变的区间
    const originalTop = sensitivityData[0].rankings[0].supplierId;
    
    for (const data of sensitivityData) {
      if (data.rankings[0].supplierId !== originalTop) {
        stableEnd = data.fluctuation - 5;
        break;
      }
    }
    
    return { start: stableStart, end: stableEnd };
  }

  /**
   * 计算TCO报告
   */
  async calculateTCO(scenarioId) {
    const scenario = scenarios.get(scenarioId);
    if (!scenario) throw new Error('场景不存在');

    const tcoReport = scenario.scores.map(score => ({
      supplierId: score.supplierId,
      supplierName: score.supplierName,
      tco: score.tco,
      rank: score.rank,
      recommendation: score.recommendation
    }));

    // 计算成本节约潜力
    const sortedByTCO = [...tcoReport].sort((a, b) => a.tco.totalTCO - b.tco.totalTCO);
    const bestTCO = sortedByTCO[0].tco.totalTCO;

    tcoReport.forEach(report => {
      report.savings = report.tco.totalTCO - bestTCO;
      report.savingsPercent = ((report.tco.totalTCO - bestTCO) / bestTCO * 100).toFixed(2);
    });

    return {
      suppliers: tcoReport,
      totalSavingsPotential: (tcoReport[tcoReport.length - 1].tco.totalTCO - bestTCO).toFixed(2),
      bestSupplier: sortedByTCO[0].supplierName,
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * 采纳推荐
   */
  async adoptRecommendation(scenarioId, recommendedScenarioId) {
    const scenario = scenarios.get(scenarioId);
    if (!scenario) throw new Error('场景不存在');

    const adoptedScore = scenario.scores.find(
      s => s.supplierId === recommendedScenarioId
    ) || scenario.recommendations?.recommended;

    if (!adoptedScore) throw new Error('推荐方案不存在');

    scenario.status = 'adopted';
    scenario.adoptedSupplier = {
      supplierId: adoptedScore.supplierId,
      supplierName: adoptedScore.supplierName,
      totalScore: adoptedScore.totalScore,
      tco: adoptedScore.tco,
      adoptedAt: new Date().toISOString()
    };
    scenario.updatedAt = new Date().toISOString();

    return {
      scenarioId,
      adopted: adoptedScore,
      nextSteps: [
        '生成正式询价单(RFQ)',
        '发起合同审批流程',
        '通知供应商确认'
      ]
    };
  }
}

module.exports = new SourcingOptimizerService();
