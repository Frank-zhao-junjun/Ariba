"""自动化测试模块"""
from .knowledge_validator import KnowledgeValidator, knowledge_validator, ValidationResult, ValidationReport
from .test_generator import TestGenerator, test_generator, TestCase, TestSuite
from .regression_runner import RegressionTestRunner, regression_runner, TestStatus, TestExecution, TestReport
from .report_generator import TestReportGenerator, report_generator

__all__ = [
    "KnowledgeValidator", "knowledge_validator", "ValidationResult", "ValidationReport",
    "TestGenerator", "test_generator", "TestCase", "TestSuite",
    "RegressionTestRunner", "regression_runner", "TestStatus", "TestExecution", "TestReport",
    "TestReportGenerator", "report_generator"
]
