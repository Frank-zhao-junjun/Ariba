"""
实施检查清单生成器 - US2 单元测试
测试智能推荐引擎功能
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from recommendation.recommendation_engine import (
    RecommendationEngine,
    CompanySize,
    Industry,
    IntegrationLevel,
    RiskLevel
)


class TestRecommendationEngine(unittest.TestCase):
    """测试推荐引擎"""
    
    def setUp(self):
        """测试前准备"""
        self.engine = RecommendationEngine()
    
    def test_engine_initialization(self):
        """测试引擎初始化"""
        self.assertIsNotNone(self.engine)
        self.assertIsNotNone(self.engine.recommendation_rules)
    
    def test_analyze_project_profile(self):
        """测试项目特征分析"""
        profile = self.engine.analyze_project_profile(
            company_size=CompanySize.LARGE_ENTERPRISE.value,
            industry=Industry.MANUFACTURING.value,
            existing_systems=["SAP S/4HANA"],
            integration_level=IntegrationLevel.LEVEL_3.value
        )
        
        self.assertIsNotNone(profile)
        self.assertEqual(profile["company_size"]["value"], CompanySize.LARGE_ENTERPRISE.value)
        self.assertEqual(profile["industry"]["value"], Industry.MANUFACTURING.value)
        self.assertEqual(profile["integration"]["value"], IntegrationLevel.LEVEL_3.value)
        self.assertIn("timeline_factor", profile["company_size"])
    
    def test_assess_risk_level_low(self):
        """测试低风险评估"""
        result = self.engine.assess_risk_level(
            company_size=CompanySize.SME.value,
            industry=Industry.OTHER.value,
            integration_level=IntegrationLevel.LEVEL_1.value,
            has_historical_data=False,
            has_change_management=True
        )
        
        self.assertEqual(result["risk_level"], RiskLevel.LOW.value)
        self.assertLess(result["risk_score"], 30)
    
    def test_assess_risk_level_high(self):
        """测试高风险评估"""
        result = self.engine.assess_risk_level(
            company_size=CompanySize.GLOBAL_ENTERPRISE.value,
            industry=Industry.HEALTHCARE.value,
            integration_level=IntegrationLevel.LEVEL_4.value,
            has_historical_data=True,
            has_change_management=False
        )
        
        self.assertEqual(result["risk_level"], RiskLevel.HIGH.value)
        self.assertGreater(result["risk_score"], 60)
    
    def test_recommend_items_for_large_enterprise(self):
        """测试大型企业推荐项"""
        profile = self.engine.analyze_project_profile(
            company_size=CompanySize.LARGE_ENTERPRISE.value,
            industry=Industry.OTHER.value,
            existing_systems=[],
            integration_level=IntegrationLevel.LEVEL_2.value
        )
        
        recommendations = self.engine.recommend_checklist_items(
            project_profile=profile,
            base_checklist=[]
        )
        
        # 应该有一些推荐项
        self.assertIsNotNone(recommendations)
        self.assertIn("recommended_additions", recommendations)
    
    def test_recommend_items_for_manufacturing(self):
        """测试制造业推荐项"""
        profile = self.engine.analyze_project_profile(
            company_size=CompanySize.MID_MARKET.value,
            industry=Industry.MANUFACTURING.value,
            existing_systems=["SAP ERP"],
            integration_level=IntegrationLevel.LEVEL_2.value
        )
        
        recommendations = self.engine.recommend_checklist_items(
            project_profile=profile,
            base_checklist=[]
        )
        
        # 应该有制造业特定项
        self.assertGreater(len(recommendations["recommended_additions"]), 0)
    
    def test_recommendation_report_generation(self):
        """测试推荐报告生成"""
        profile = self.engine.analyze_project_profile(
            company_size=CompanySize.LARGE_ENTERPRISE.value,
            industry=Industry.MANUFACTURING.value,
            existing_systems=["SAP S/4HANA"],
            integration_level=IntegrationLevel.LEVEL_3.value
        )
        
        risk = self.engine.assess_risk_level(
            company_size=CompanySize.LARGE_ENTERPRISE.value,
            industry=Industry.MANUFACTURING.value,
            integration_level=IntegrationLevel.LEVEL_3.value,
            has_historical_data=True
        )
        
        recommendations = self.engine.recommend_checklist_items(profile, [])
        
        report = self.engine.generate_recommendation_report(
            profile, risk, recommendations
        )
        
        self.assertIsInstance(report, str)
        self.assertIn("Ariba实施项目智能推荐报告", report)
        self.assertIn("风险评估", report)
        self.assertIn("清单推荐", report)


class TestRiskFactors(unittest.TestCase):
    """测试风险因素分析"""
    
    def setUp(self):
        self.engine = RecommendationEngine()
    
    def test_risk_factors_present(self):
        """测试风险因素包含必要信息"""
        result = self.engine.assess_risk_level(
            company_size=CompanySize.LARGE_ENTERPRISE.value,
            industry=Industry.FINANCIAL_SERVICES.value,
            integration_level=IntegrationLevel.LEVEL_3.value
        )
        
        self.assertIn("risk_factors", result)
        self.assertGreater(len(result["risk_factors"]), 0)
        
        for factor in result["risk_factors"]:
            self.assertIn("factor", factor)
            self.assertIn("value", factor)
            self.assertIn("score", factor)
    
    def test_recommendations_match_level(self):
        """测试建议与风险等级匹配"""
        for level in [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]:
            recommendations = self.engine._get_risk_recommendations(level.value)
            self.assertIsInstance(recommendations, list)


class TestCompanySizeRules(unittest.TestCase):
    """测试企业规模规则"""
    
    def test_all_sizes_have_rules(self):
        """测试所有规模都有规则"""
        engine = RecommendationEngine()
        rules = engine.recommendation_rules["company_size_rules"]
        
        for size in CompanySize:
            self.assertIn(size.value, rules)
    
    def test_timeline_factor(self):
        """测试时间线系数"""
        engine = RecommendationEngine()
        rules = engine.recommendation_rules["company_size_rules"]
        
        # SME应该更快
        sme_factor = rules[CompanySize.SME.value]["timeline_factor"]
        global_factor = rules[CompanySize.GLOBAL_ENTERPRISE.value]["timeline_factor"]
        
        self.assertLess(sme_factor, global_factor)


if __name__ == "__main__":
    unittest.main(verbosity=2)
