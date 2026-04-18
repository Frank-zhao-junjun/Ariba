"""US9: 自动化测试回归 - 单元测试"""
import unittest
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from testing import (
    KnowledgeValidator, knowledge_validator,
    TestGenerator, test_generator,
    RegressionTestRunner, TestStatus,
    TestReportGenerator, report_generator
)


class TestKnowledgeValidator(unittest.TestCase):
    def setUp(self):
        self.validator = KnowledgeValidator()
        self.sample_kb = {
            "id": "KBE-TEST", "title": "测试知识标题", "description": "测试描述内容",
            "solution": "这是解决方案的详细步骤说明", "tags": ["#测试"], "versions": ["#V2602"],
            "related_ids": ["KBE-001"]
        }
    
    def test_ac9_1_validate(self):
        """AC9.1: 验证知识"""
        result = self.validator.validate_knowledge(self.sample_kb)
        self.assertEqual(result.knowledge_id, "KBE-TEST")
    
    def test_ac9_1_required_fields(self):
        """AC9.1: 必填字段检查"""
        invalid_kb = {"id": "KBE-001", "title": ""}
        result = self.validator.validate_knowledge(invalid_kb)
        self.assertFalse(result.is_valid)
        self.assertTrue(len(result.issues) > 0)
    
    def test_ac9_1_batch(self):
        """AC9.1: 批量验证"""
        report = self.validator.validate_batch([self.sample_kb])
        self.assertEqual(report.total_checked, 1)


class TestTestGenerator(unittest.TestCase):
    def setUp(self):
        self.generator = test_generator
        self.sample_kb = {
            "id": "KBE-TEST", "title": "供应商登录失败",
            "description": "无法登录系统", "solution": "检查密码或联系管理员",
            "tags": ["#登录"], "versions": ["#V2602"], "related_ids": ["KBE-001"]
        }
    
    def test_ac9_2_generate_cases(self):
        """AC9.2: 生成测试用例"""
        cases = self.generator.generate_from_knowledge(self.sample_kb)
        self.assertIsInstance(cases, list)
        self.assertGreater(len(cases), 0)
    
    def test_ac9_2_test_suite(self):
        """AC9.2: 生成测试套件"""
        suite = self.generator.generate_test_suite([self.sample_kb])
        self.assertEqual(suite.name, "Ariba知识库自动化测试套件")
        self.assertGreater(len(suite.test_cases), 0)


class TestRegressionRunner(unittest.TestCase):
    def setUp(self):
        self.runner = RegressionTestRunner()
    
    def test_ac9_3_register(self):
        """AC9.3: 注册测试"""
        def dummy_test():
            pass
        self.runner.register_test("test_001", dummy_test)
        self.assertIn("test_001", self.runner.test_functions)
    
    def test_ac9_3_run(self):
        """AC9.3: 执行测试"""
        def passing_test():
            assert True
        self.runner.register_test("pass_test", passing_test)
        result = self.runner.run_test("pass_test")
        self.assertEqual(result.status, TestStatus.PASSED)
    
    def test_ac9_3_run_suite(self):
        """AC9.3: 执行套件"""
        def t1(): pass
        def t2(): pass
        self.runner.register_test("t1", t1)
        self.runner.register_test("t2", t2)
        report = self.runner.run_test_suite(["t1", "t2"], "Test Suite")
        self.assertEqual(report.total_tests, 2)


class TestReportGenerator(unittest.TestCase):
    def setUp(self):
        self.generator = report_generator
    
    def test_ac9_4_markdown(self):
        """AC9.4: Markdown报告"""
        from testing import TestReport
        report = TestReport(
            suite_name="Test", total_tests=5, passed=4, failed=1,
            skipped=0, errors=0, duration_ms=100,
            executions=[], failed_tests=[{"test_id": "t1", "status": "failed", "error": "error"}]
        )
        md = self.generator.generate_markdown_report(report)
        self.assertIn("测试执行报告", md)
        self.assertIn("通过率", md)
    
    def test_ac9_4_html(self):
        """AC9.4: HTML报告"""
        from testing import TestReport
        report = TestReport(
            suite_name="Test", total_tests=5, passed=4, failed=1,
            skipped=0, errors=0, duration_ms=100,
            executions=[], failed_tests=[]
        )
        html = self.generator.generate_html_report(report)
        self.assertIn("<html>", html)
        self.assertIn("测试报告", html)


if __name__ == "__main__":
    unittest.main()
