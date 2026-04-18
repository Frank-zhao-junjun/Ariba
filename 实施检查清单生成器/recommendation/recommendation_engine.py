"""
智能推荐引擎 (US2)
基于项目特征智能推荐清单项
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum


class CompanySize(Enum):
    """企业规模"""
    SME = "sme"  # 1-500员工
    MID_MARKET = "mid_market"  # 500-2000员工
    LARGE_ENTERPRISE = "large_enterprise"  # 2000-10000员工
    GLOBAL_ENTERPRISE = "global_enterprise"  # 10000+员工


class Industry(Enum):
    """行业类型"""
    MANUFACTURING = "manufacturing"
    RETAIL = "retail"
    HEALTHCARE = "healthcare"
    FINANCIAL_SERVICES = "financial_services"
    TECHNOLOGY = "technology"
    ENERGY = "energy"
    OTHER = "other"


class IntegrationLevel(Enum):
    """集成复杂度"""
    LEVEL_1 = "level_1"  # 仅Ariba独立使用
    LEVEL_2 = "level_2"  # Ariba + ERP集成
    LEVEL_3 = "level_3"  # Ariba + ERP + 多系统集成
    LEVEL_4 = "level_4"  # Ariba + ERP + 多系统 + 定制开发


class RiskLevel(Enum):
    """风险等级"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RecommendationEngine:
    """智能推荐引擎"""
    
    def __init__(self):
        """初始化推荐引擎"""
        self.recommendation_rules = self._load_recommendation_rules()
    
    def _load_recommendation_rules(self) -> Dict[str, Any]:
        """加载推荐规则"""
        return {
            # 企业规模规则
            "company_size_rules": {
                CompanySize.SME.value: {
                    "description": "中小企业简化实施",
                    "add_items": [],
                    "remove_items": [],
                    "weight_adjustments": {
                        "training": 1.2,  # 培训权重增加
                        "support": 1.3    # 支持权重增加
                    },
                    "timeline_factor": 0.7  # 时间线缩短70%
                },
                CompanySize.MID_MARKET.value: {
                    "description": "中型企业标准实施",
                    "add_items": [],
                    "remove_items": [],
                    "weight_adjustments": {},
                    "timeline_factor": 1.0
                },
                CompanySize.LARGE_ENTERPRISE.value: {
                    "description": "大型企业扩展实施",
                    "add_items": [
                        {"id": "EXT-001", "title": "多BU并行实施规划", "phase": "requirements_analysis"},
                        {"id": "EXT-002", "title": "治理委员会建立", "phase": "requirements_analysis"},
                        {"id": "EXT-003", "title": "变革管理计划", "phase": "user_training"}
                    ],
                    "remove_items": [],
                    "weight_adjustments": {
                        "integration": 1.3,
                        "change_management": 1.5
                    },
                    "timeline_factor": 1.5
                },
                CompanySize.GLOBAL_ENTERPRISE.value: {
                    "description": "跨国企业全面实施",
                    "add_items": [
                        {"id": "GLB-001", "title": "多语言多货币配置", "phase": "system_configuration"},
                        {"id": "GLB-002", "title": "跨国数据合规审计", "phase": "requirements_analysis"},
                        {"id": "GLB-003", "title": "全球支持体系建立", "phase": "go_live_support"},
                        {"id": "GLB-004", "title": "区域实施团队培训", "phase": "user_training"},
                        {"id": "EXT-001", "title": "多BU并行实施规划", "phase": "requirements_analysis"},
                        {"id": "EXT-002", "title": "治理委员会建立", "phase": "requirements_analysis"}
                    ],
                    "remove_items": [],
                    "weight_adjustments": {
                        "integration": 1.5,
                        "change_management": 2.0,
                        "security": 1.5,
                        "compliance": 1.5
                    },
                    "timeline_factor": 2.5
                }
            },
            
            # 行业规则
            "industry_rules": {
                Industry.MANUFACTURING.value: {
                    "description": "制造业特殊需求",
                    "add_items": [
                        {"id": "MFG-001", "title": "供应商质量管理体系集成", "phase": "system_configuration"},
                        {"id": "MFG-002", "title": "采购物料清单(BOM)管理", "phase": "data_migration"},
                        {"id": "MFG-003", "title": "交货期协同管理", "phase": "requirements_analysis"}
                    ],
                    "focus_areas": ["supplier", "sourcing"]
                },
                Industry.RETAIL.value: {
                    "description": "零售业特殊需求",
                    "add_items": [
                        {"id": "RTL-001", "title": "品类管理集成", "phase": "system_configuration"},
                        {"id": "RTL-002", "title": "促销活动协调", "phase": "requirements_analysis"},
                        {"id": "RTL-003", "title": "多渠道价格同步", "phase": "data_migration"}
                    ],
                    "focus_areas": ["buying", "spending"]
                },
                Industry.HEALTHCARE.value: {
                    "description": "医疗行业合规需求",
                    "add_items": [
                        {"id": "HLT-001", "title": "医疗器械法规合规", "phase": "requirements_analysis"},
                        {"id": "HLT-002", "title": "GXP审计追踪配置", "phase": "system_configuration"},
                        {"id": "HLT-003", "title": "供应商资质管理", "phase": "supplier"},
                        {"id": "HLT-004", "title": "药品追溯系统集成", "phase": "system_configuration"}
                    ],
                    "focus_areas": ["supplier", "contract", "compliance"]
                },
                Industry.FINANCIAL_SERVICES.value: {
                    "description": "金融服务严格合规",
                    "add_items": [
                        {"id": "FIN-001", "title": "Sarbanes-Oxley合规配置", "phase": "system_configuration"},
                        {"id": "FIN-002", "title": "财务审计追踪", "phase": "go_live_support"},
                        {"id": "FIN-003", "title": "三重一大审批流程", "phase": "requirements_analysis"}
                    ],
                    "focus_areas": ["buying", "contract", "compliance"]
                },
                Industry.TECHNOLOGY.value: {
                    "description": "科技行业敏捷实施",
                    "add_items": [
                        {"id": "TECH-001", "title": "API集成开发", "phase": "system_configuration"},
                        {"id": "TECH-002", "title": "自动化测试框架", "phase": "go_live_support"},
                        {"id": "TECH-003", "title": "CI/CD流程集成", "phase": "system_configuration"}
                    ],
                    "focus_areas": ["integration", "automation"]
                },
                Industry.ENERGY.value: {
                    "description": "能源行业特殊需求",
                    "add_items": [
                        {"id": "ENR-001", "title": "大宗商品价格联动", "phase": "system_configuration"},
                        {"id": "ENR-002", "title": "供应商安全资质审查", "phase": "supplier"},
                        {"id": "ENR-003", "title": "长周期合同管理", "phase": "contract"}
                    ],
                    "focus_areas": ["contract", "sourcing", "supplier"]
                }
            },
            
            # 集成复杂度规则
            "integration_level_rules": {
                IntegrationLevel.LEVEL_1.value: {
                    "description": "仅Ariba独立使用",
                    "add_items": [
                        {"id": "INT-L1-001", "title": "Ariba独立运行验证", "phase": "go_live_support"}
                    ],
                    "integration_complexity": "low"
                },
                IntegrationLevel.LEVEL_2.value: {
                    "description": "Ariba + ERP集成",
                    "add_items": [
                        {"id": "INT-L2-001", "title": "ERP集成架构设计", "phase": "requirements_analysis"},
                        {"id": "INT-L2-002", "title": "主数据同步配置", "phase": "system_configuration"},
                        {"id": "INT-L2-003", "title": "订单/发票集成测试", "phase": "data_migration"}
                    ],
                    "integration_complexity": "medium"
                },
                IntegrationLevel.LEVEL_3.value: {
                    "description": "Ariba + ERP + 多系统集成",
                    "add_items": [
                        {"id": "INT-L3-001", "title": "多系统集成架构设计", "phase": "requirements_analysis"},
                        {"id": "INT-L3-002", "title": "ESB中间件配置", "phase": "system_configuration"},
                        {"id": "INT-L3-003", "title": "数据转换规则开发", "phase": "system_configuration"},
                        {"id": "INT-L3-004", "title": "端到端集成测试", "phase": "data_migration"},
                        {"id": "INT-L3-005", "title": "性能压力测试", "phase": "go_live_support"}
                    ],
                    "integration_complexity": "high"
                },
                IntegrationLevel.LEVEL_4.value: {
                    "description": "Ariba + ERP + 多系统 + 定制开发",
                    "add_items": [
                        {"id": "INT-L4-001", "title": "定制开发需求分析", "phase": "requirements_analysis"},
                        {"id": "INT-L4-002", "title": "定制开发架构设计", "phase": "system_configuration"},
                        {"id": "INT-L4-003", "title": "定制功能开发", "phase": "system_configuration"},
                        {"id": "INT-L4-004", "title": "定制功能测试", "phase": "data_migration"},
                        {"id": "INT-L4-005", "title": "定制功能回归测试", "phase": "go_live_support"},
                        {"id": "INT-L4-006", "title": "定制开发文档编写", "phase": "go_live_support"}
                    ],
                    "integration_complexity": "very_high"
                }
            }
        }
    
    def analyze_project_profile(
        self,
        company_size: str,
        industry: str,
        existing_systems: List[str],
        integration_level: str
    ) -> Dict[str, Any]:
        """
        分析项目特征
        
        Args:
            company_size: 企业规模
            industry: 行业类型
            existing_systems: 现有系统列表
            integration_level: 集成复杂度
        
        Returns:
            项目特征分析结果
        """
        rules = self.recommendation_rules
        
        # 获取规模规则
        size_rules = rules["company_size_rules"].get(
            company_size,
            rules["company_size_rules"][CompanySize.MID_MARKET.value]
        )
        
        # 获取行业规则（如果没有特定规则，返回默认空规则）
        industry_rules = rules["industry_rules"].get(
            industry,
            {"description": "通用行业", "add_items": [], "focus_areas": []}
        )
        
        # 获取集成规则
        integration_rules = rules["integration_level_rules"].get(
            integration_level,
            rules["integration_level_rules"][IntegrationLevel.LEVEL_2.value]
        )
        
        return {
            "company_size": {
                "value": company_size,
                "description": size_rules["description"],
                "timeline_factor": size_rules["timeline_factor"]
            },
            "industry": {
                "value": industry,
                "description": industry_rules["description"],
                "focus_areas": industry_rules["focus_areas"]
            },
            "integration": {
                "value": integration_level,
                "description": integration_rules["description"],
                "complexity": integration_rules["integration_complexity"]
            },
            "existing_systems": existing_systems
        }
    
    def assess_risk_level(
        self,
        company_size: str,
        industry: str,
        integration_level: str,
        has_historical_data: bool = False,
        has_change_management: bool = False
    ) -> Dict[str, Any]:
        """
        评估项目风险等级
        
        Returns:
            风险评估结果
        """
        risk_score = 0
        risk_factors = []
        
        # 规模风险
        size_risk = {
            CompanySize.SME.value: 10,
            CompanySize.MID_MARKET.value: 20,
            CompanySize.LARGE_ENTERPRISE.value: 35,
            CompanySize.GLOBAL_ENTERPRISE.value: 50
        }
        risk_score += size_risk.get(company_size, 20)
        risk_factors.append({
            "factor": "企业规模",
            "value": company_size,
            "score": size_risk.get(company_size, 20)
        })
        
        # 行业风险
        industry_risk = {
            Industry.OTHER.value: 10,
            Industry.RETAIL.value: 15,
            Industry.TECHNOLOGY.value: 15,
            Industry.MANUFACTURING.value: 20,
            Industry.ENERGY.value: 25,
            Industry.FINANCIAL_SERVICES.value: 30,
            Industry.HEALTHCARE.value: 35
        }
        risk_score += industry_risk.get(industry, 10)
        risk_factors.append({
            "factor": "行业类型",
            "value": industry,
            "score": industry_risk.get(industry, 10)
        })
        
        # 集成风险
        integration_risk = {
            IntegrationLevel.LEVEL_1.value: 5,
            IntegrationLevel.LEVEL_2.value: 15,
            IntegrationLevel.LEVEL_3.value: 30,
            IntegrationLevel.LEVEL_4.value: 50
        }
        risk_score += integration_risk.get(integration_level, 15)
        risk_factors.append({
            "factor": "集成复杂度",
            "value": integration_level,
            "score": integration_risk.get(integration_level, 15)
        })
        
        # 历史数据风险
        if has_historical_data:
            risk_score += 10
            risk_factors.append({
                "factor": "历史数据迁移",
                "value": "是",
                "score": 10
            })
        
        # 变革管理风险
        if not has_change_management:
            risk_score += 15
            risk_factors.append({
                "factor": "变革管理",
                "value": "无正式变革管理",
                "score": 15
            })
        
        # 确定风险等级
        if risk_score < 30:
            risk_level = RiskLevel.LOW.value
        elif risk_score < 60:
            risk_level = RiskLevel.MEDIUM.value
        else:
            risk_level = RiskLevel.HIGH.value
        
        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "max_score": 150,
            "risk_percentage": round(risk_score / 150 * 100, 1),
            "risk_factors": risk_factors,
            "recommendations": self._get_risk_recommendations(risk_level)
        }
    
    def _get_risk_recommendations(self, risk_level: str) -> List[str]:
        """获取风险缓解建议"""
        recommendations = {
            RiskLevel.LOW.value: [
                "项目风险较低，建议采用标准实施方法论",
                "关注用户培训和变更管理",
                "建立基本的监控和反馈机制"
            ],
            RiskLevel.MEDIUM.value: [
                "建议制定详细的项目计划和风险管理策略",
                "增加关键里程碑的评审点",
                "建立问题升级机制和应急预案",
                "加强用户培训和变革管理"
            ],
            RiskLevel.HIGH.value: [
                "强烈建议采用分阶段实施策略",
                "建立项目管理办公室(PMO)进行集中管理",
                "增加原型验证和UAT测试轮次",
                "制定详细的回滚计划",
                "聘请经验丰富的实施顾问",
                "建立高层支持机制，确保资源投入"
            ]
        }
        return recommendations.get(risk_level, [])
    
    def recommend_checklist_items(
        self,
        profile: Dict[str, Any] = None,
        existing_items: List[Dict[str, Any]] = None,
        # 兼容旧参数名
        project_profile: Dict[str, Any] = None,
        base_checklist: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        基于项目特征推荐清单项
        
        Args:
            profile: 项目特征（新参数名）
            existing_items: 基础清单（新参数名）
            project_profile: 项目特征（兼容旧参数名）
            base_checklist: 基础清单（兼容旧参数名）
        
        Returns:
            推荐结果
        """
        # 参数兼容处理：新参数优先
        if profile is None and project_profile is not None:
            profile = project_profile
        if existing_items is None and base_checklist is not None:
            existing_items = base_checklist
        
        # 防御性处理
        if profile is None:
            profile = {}
        if existing_items is None:
            existing_items = []
        
        rules = self.recommendation_rules
        recommended_items = []
        removed_items = []
        highlighted_items = []
        
        # 安全的字典访问
        company_size = profile.get("company_size", {}).get("value", "mid_market")
        industry = profile.get("industry", {}).get("value", "other")
        integration_level = profile.get("integration", {}).get("value", "level_2")
        
        # 应用规模规则
        size_rules = rules["company_size_rules"].get(company_size, {})
        if size_rules.get("add_items"):
            for item in size_rules["add_items"]:
                recommended_items.append({
                    **item,
                    "reason": f"基于企业规模({company_size})",
                    "is_recommended": True
                })
        
        # 应用行业规则
        industry_rules = rules["industry_rules"].get(industry, {})
        if industry_rules.get("add_items"):
            for item in industry_rules["add_items"]:
                recommended_items.append({
                    **item,
                    "reason": f"基于行业特征({industry})",
                    "is_recommended": True
                })
        
        # 应用集成规则
        integration_rules = rules["integration_level_rules"].get(integration_level, {})
        if integration_rules.get("add_items"):
            for item in integration_rules["add_items"]:
                recommended_items.append({
                    **item,
                    "reason": f"基于集成需求({integration_level})",
                    "is_recommended": True
                })
        
        # 高亮关键项
        focus_areas = industry_rules.get("focus_areas", [])
        for item in existing_items:
            category = item.get("category", "")
            if category in focus_areas:
                highlighted_items.append({
                    **item,
                    "highlight_reason": f"行业重点关注领域"
                })
        
        return {
            "recommended_additions": recommended_items,
            "removed_items": removed_items,
            "highlighted_items": highlighted_items,
            "focus_areas": focus_areas,
            "timeline_factor": size_rules.get("timeline_factor", 1.0)
        }
    
    def generate_recommendation_report(
        self,
        project_profile: Dict[str, Any],
        risk_assessment: Dict[str, Any],
        recommendations: Dict[str, Any]
    ) -> str:
        """生成推荐报告"""
        lines = [
            "# Ariba实施项目智能推荐报告",
            "",
            f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "---",
            "",
            "## 项目概况",
            "",
            f"- **企业规模**: {project_profile['company_size']['description']}",
            f"- **行业类型**: {project_profile['industry']['description']}",
            f"- **集成复杂度**: {project_profile['integration']['description']}",
            f"- **现有系统**: {', '.join(project_profile['existing_systems']) if project_profile['existing_systems'] else '无'}",
            "",
            "---",
            "",
            "## 风险评估",
            "",
            f"- **风险等级**: {risk_assessment['risk_level'].upper()}",
            f"- **风险评分**: {risk_assessment['risk_score']}/{risk_assessment['max_score']} ({risk_assessment['risk_percentage']}%)",
            "",
            "### 风险因素",
            ""
        ]
        
        for factor in risk_assessment["risk_factors"]:
            lines.append(f"- **{factor['factor']}**: {factor['value']} (+{factor['score']}分)")
        
        lines.extend([
            "",
            "### 风险缓解建议",
            ""
        ])
        
        for i, rec in enumerate(risk_assessment["recommendations"], 1):
            lines.append(f"{i}. {rec}")
        
        lines.extend([
            "",
            "---",
            "",
            "## 清单推荐",
            "",
            f"- **推荐新增项目**: {len(recommendations['recommended_additions'])}项",
            f"- **重点关注领域**: {', '.join(recommendations['focus_areas']) if recommendations['focus_areas'] else '无'}",
            f"- **时间线调整系数**: {recommendations['timeline_factor']}x",
            ""
        ])
        
        if recommendations["recommended_additions"]:
            lines.extend([
                "### 推荐新增清单项",
                ""
            ])
            for item in recommendations["recommended_additions"]:
                lines.append(f"- **{item['title']}** ({item['phase']}) - {item['reason']}")
        
        return "\n".join(lines)


def create_recommendation_engine() -> RecommendationEngine:
    """工厂函数：创建推荐引擎实例"""
    return RecommendationEngine()


if __name__ == "__main__":
    # 示例使用
    engine = RecommendationEngine()
    
    # 分析项目特征
    profile = engine.analyze_project_profile(
        company_size=CompanySize.LARGE_ENTERPRISE.value,
        industry=Industry.MANUFACTURING.value,
        existing_systems=["SAP S/4HANA", "Oracle EBS"],
        integration_level=IntegrationLevel.LEVEL_3.value
    )
    
    print("项目特征分析:")
    print(f"  企业规模: {profile['company_size']['description']}")
    print(f"  行业类型: {profile['industry']['description']}")
    print(f"  集成复杂度: {profile['integration']['description']}")
    
    # 风险评估
    risk = engine.assess_risk_level(
        company_size=CompanySize.LARGE_ENTERPRISE.value,
        industry=Industry.MANUFACTURING.value,
        integration_level=IntegrationLevel.LEVEL_3.value,
        has_historical_data=True,
        has_change_management=True
    )
    
    print(f"\n风险评估:")
    print(f"  风险等级: {risk['risk_level']}")
    print(f"  风险评分: {risk['risk_score']}/{risk['max_score']}")
