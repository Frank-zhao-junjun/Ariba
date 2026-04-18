"""
US3: 故障诊断流程 - 单元测试

验收标准：
- AC3.1: 症状到原因的推理链
- AC3.2: 环境上下文感知
- AC3.3: 分步骤解决方案
- AC3.4: 决策建议
"""

import unittest
from diagnosis import (
    DiagnosticEngine, create_diagnostic_engine,
    DiagnosisResult, SymptomType, CauseCategory
)


class TestDiagnosticEngine(unittest.TestCase):
    """测试诊断引擎"""
    
    def setUp(self):
        self.engine = create_diagnostic_engine()
    
    def test_ac3_1_symptom_classification(self):
        """AC3.1: 症状分类"""
        # 登录失败
        result = self.engine.diagnose("供应商登录失败")
        self.assertIsNotNone(result)
        self.assertIn(result.symptom, "供应商登录失败")
    
    def test_ac3_1_cause_reasoning(self):
        """AC3.1: 原因推理链"""
        result = self.engine.diagnose("审批流程卡住")
        self.assertIsInstance(result.possible_causes, list)
        self.assertGreater(len(result.possible_causes), 0)
        
        # 验证原因结构
        cause = result.possible_causes[0]
        self.assertIn("cause", cause)
        self.assertIn("confidence", cause)
        self.assertIn("category", cause)
    
    def test_ac3_1_reasoning_chain(self):
        """AC3.1: 推理链完整性"""
        result = self.engine.diagnose("发票匹配失败")
        
        # 验证推理链: 症状 → 原因 → 步骤
        self.assertIsNotNone(result.symptom)
        self.assertGreater(len(result.possible_causes), 0)
        self.assertGreater(len(result.diagnostic_steps), 0)
    
    def test_ac3_2_version_context(self):
        """AC3.2: 版本上下文感知"""
        # 不带版本
        result1 = self.engine.diagnose("登录失败")
        
        # 带版本上下文
        result2 = self.engine.diagnose("登录失败", context={"version": "#VNextGen"})
        
        # 带版本的结果应该有调整
        self.assertIsInstance(result2, DiagnosisResult)
        # 置信度可能不同
        self.assertIsInstance(result2.confidence, float)
    
    def test_ac3_2_integration_context(self):
        """AC3.2: 集成上下文感知"""
        result = self.engine.diagnose("集成错误", context={"integration": "s4hana"})
        self.assertIsInstance(result, DiagnosisResult)
        self.assertGreater(len(result.possible_causes), 0)
    
    def test_ac3_3_diagnostic_steps(self):
        """AC3.3: 分步骤解决方案"""
        result = self.engine.diagnose("密码错误导致登录失败")
        
        # 验证步骤存在
        self.assertIsInstance(result.diagnostic_steps, list)
        self.assertGreater(len(result.diagnostic_steps), 0)
        
        # 验证步骤结构
        step = result.diagnostic_steps[0]
        self.assertTrue(hasattr(step, 'step_id'))
        self.assertTrue(hasattr(step, 'title'))
        self.assertTrue(hasattr(step, 'action'))
        self.assertTrue(hasattr(step, 'expected_result'))
    
    def test_ac3_3_solution_steps(self):
        """AC3.3: 解决方案步骤"""
        result = self.engine.diagnose("供应商无法登录")
        
        self.assertIsInstance(result.solution_steps, list)
        self.assertGreater(len(result.solution_steps), 0)
        
        # 步骤应该是可执行的操作描述
        for step in result.solution_steps[:2]:
            self.assertIsInstance(step, str)
            self.assertGreater(len(step), 5)
    
    def test_ac3_4_recommendation(self):
        """AC3.4: 决策建议"""
        result = self.engine.diagnose("登录失败")
        
        self.assertIsInstance(result.recommendation, str)
        self.assertGreater(len(result.recommendation), 0)
    
    def test_ac3_4_support_flag(self):
        """AC3.4: 支持需求标识"""
        # 简单问题
        result1 = self.engine.diagnose("登录失败")
        
        # 复杂问题
        result2 = self.engine.diagnose("审批流程卡住，同时发票匹配失败")
        
        # 验证标志类型
        self.assertIsInstance(result1.needs_support, bool)
        self.assertIsInstance(result2.needs_support, bool)
    
    def test_ac3_4_ticket_suggestion(self):
        """AC3.4: 工单建议"""
        result = self.engine.diagnose("系统错误")
        
        # 复杂问题应该建议创建工单
        if result.needs_support:
            self.assertIn("支持", result.recommendation)
    
    def test_ac3_1_multiple_symptoms(self):
        """AC3.1: 多症状处理"""
        result = self.engine.diagnose("登录失败且审批卡住")
        
        # 应该识别主要症状
        self.assertIsNotNone(result.symptom)
        self.assertGreater(len(result.possible_causes), 0)
    
    def test_confidence_score(self):
        """置信度评分"""
        result = self.engine.diagnose("供应商登录失败")
        
        self.assertIsInstance(result.confidence, float)
        self.assertGreaterEqual(result.confidence, 0)
        self.assertLessEqual(result.confidence, 1)
    
    def test_diagnostic_flow(self):
        """诊断流程图"""
        flow = self.engine.get_diagnostic_flow("登录失败")
        
        self.assertIn("symptom", flow)
        self.assertIn("steps", flow)
        self.assertIsInstance(flow["steps"], list)


class TestSymptomClassification(unittest.TestCase):
    """测试症状分类"""
    
    def setUp(self):
        self.engine = create_diagnostic_engine()
    
    def test_login_symptom(self):
        """登录症状"""
        result = self.engine.diagnose("供应商无法登录系统")
        self.assertIsInstance(result.possible_causes, list)
    
    def test_approval_symptom(self):
        """审批症状"""
        result = self.engine.diagnose("采购申请在审批环节卡住")
        self.assertIsInstance(result.possible_causes, list)
    
    def test_timeout_symptom(self):
        """超时症状"""
        result = self.engine.diagnose("页面加载超时")
        self.assertIsInstance(result.possible_causes, list)


if __name__ == "__main__":
    unittest.main()
