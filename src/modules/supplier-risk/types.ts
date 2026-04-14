/**
 * 供应商风险分析助手 - 类型定义
 * v1.5
 */

// 风险等级
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

// 风险因素
export interface RiskFactor {
  category: string;
  description: string;
  score: number;
  weight: number;
  evidence: string[];
}

// 交易记录
export interface TransactionRecord {
  date: string;
  amount: number;
  currency: string;
  paymentStatus: 'ON_TIME' | 'DELAYED' | 'OVERDUE';
  daysOverdue?: number;
}

// 交付记录
export interface DeliveryRecord {
  date: string;
  plannedDate: string;
  actualDate: string;
  onTime: boolean;
  qualityScore: number;  // 0-100
}

// 合规记录
export interface ComplianceRecord {
  type: string;
  date: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  description: string;
}

// 市场指标
export interface MarketIndicators {
  industryRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  geopoliticalRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  newsSentiment: number;  // -100 to 100
  newsItems: string[];
}

// 供应商输入
export interface SupplierRiskInput {
  supplierId: string;
  supplierName: string;
  industry: string;
  country: string;
  transactionHistory: TransactionRecord[];
  deliveryRecords: DeliveryRecord[];
  complianceHistory: ComplianceRecord[];
  marketData?: MarketIndicators;
  businessAge?: number;  // 经营年限
  certifications?: string[];  // 资质证书
}

// 风险输出
export interface SupplierRiskOutput {
  supplierId: string;
  supplierName: string;
  overallRiskScore: number;        // 0-100, 越高风险越高
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendations: RiskRecommendation[];
  report: RiskReport;
  timestamp: string;
}

// 风险建议
export interface RiskRecommendation {
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  reason: string;
  approvalRequired: boolean;
}

// 风险报告
export interface RiskReport {
  summary: string;
  keyFindings: string[];
  riskDistribution: {
    financial: number;
    delivery: number;
    compliance: number;
    certification: number;
    market: number;
  };
  trendAnalysis: string;
  complianceScore: number;  // 0-100
  deliveryScore: number;   // 0-100
}

// 批量评估结果
export interface BatchRiskResult {
  total: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  suppliers: SupplierRiskOutput[];
  summary: string;
}

// 风险评分配置
export interface RiskScoringConfig {
  weights: {
    financial: number;
    delivery: number;
    compliance: number;
    certification: number;
    market: number;
  };
  thresholds: {
    high: number;
    medium: number;
  };
}
