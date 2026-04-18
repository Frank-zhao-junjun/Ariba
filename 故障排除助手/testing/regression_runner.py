"""
回归测试执行器 - US9 AC9.3

自动化执行测试
"""

from typing import List, Dict, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json


class TestStatus(Enum):
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"


@dataclass
class TestExecution:
    """测试执行记录"""
    test_id: str
    status: TestStatus
    duration_ms: float
    error_message: str = ""
    stack_trace: str = ""
    executed_at: datetime = field(default_factory=datetime.now)


@dataclass
class TestReport:
    """测试报告"""
    suite_name: str
    total_tests: int
    passed: int
    failed: int
    skipped: int
    errors: int
    duration_ms: float
    executions: List[TestExecution]
    failed_tests: List[Dict]
    generated_at: datetime


class RegressionTestRunner:
    """
    回归测试执行器
    
    AC9.3: 回归测试自动化执行
    """
    
    def __init__(self):
        self.test_functions: Dict[str, Callable] = {}
        self.execution_history: List[TestExecution] = []
    
    def register_test(self, test_id: str, test_func: Callable):
        """注册测试函数"""
        self.test_functions[test_id] = test_func
    
    def run_test(self, test_id: str) -> TestExecution:
        """执行单个测试"""
        import time
        
        if test_id not in self.test_functions:
            return TestExecution(
                test_id=test_id,
                status=TestStatus.ERROR,
                duration_ms=0,
                error_message=f"Test {test_id} not found"
            )
        
        test_func = self.test_functions[test_id]
        start_time = time.time()
        
        try:
            test_func()
            status = TestStatus.PASSED
            error_message = ""
        except AssertionError as e:
            status = TestStatus.FAILED
            error_message = str(e)
        except Exception as e:
            status = TestStatus.ERROR
            error_message = str(e)
        
        duration_ms = (time.time() - start_time) * 1000
        
        execution = TestExecution(
            test_id=test_id,
            status=status,
            duration_ms=duration_ms,
            error_message=error_message
        )
        
        self.execution_history.append(execution)
        return execution
    
    def run_test_suite(
        self,
        test_ids: List[str],
        suite_name: str = "Test Suite"
    ) -> TestReport:
        """
        执行测试套件
        
        Args:
            test_ids: 测试ID列表
            suite_name: 套件名称
            
        Returns:
            测试报告
        """
        import time
        start_time = time.time()
        
        executions = [self.run_test(tid) for tid in test_ids]
        
        total_duration = (time.time() - start_time) * 1000
        
        passed = sum(1 for e in executions if e.status == TestStatus.PASSED)
        failed = sum(1 for e in executions if e.status == TestStatus.FAILED)
        skipped = sum(1 for e in executions if e.status == TestStatus.SKIPPED)
        errors = sum(1 for e in executions if e.status == TestStatus.ERROR)
        
        failed_tests = [
            {
                "test_id": e.test_id,
                "status": e.status.value,
                "error": e.error_message
            }
            for e in executions if e.status in [TestStatus.FAILED, TestStatus.ERROR]
        ]
        
        return TestReport(
            suite_name=suite_name,
            total_tests=len(executions),
            passed=passed,
            failed=failed,
            skipped=skipped,
            errors=errors,
            duration_ms=total_duration,
            executions=executions,
            failed_tests=failed_tests,
            generated_at=datetime.now()
        )
    
    def run_knowledge_tests(self, knowledge_list: List[Dict]) -> TestReport:
        """运行知识相关测试"""
        # 注册测试函数
        for kb in knowledge_list:
            kb_id = kb.get("id", "")
            title = kb.get("title", "")
            
            # 模拟测试函数
            def make_test(item_id, item_title, item_data):
                def test_func():
                    # 简单验证
                    assert item_id, f"Missing ID in {item_title}"
                    assert item_title, "Title is empty"
                return test_func
            
            test_id = f"kb_{kb_id}"
            self.register_test(test_id, make_test(kb_id, title, kb))
        
        test_ids = [f"kb_{kb.get('id', '')}" for kb in knowledge_list]
        return self.run_test_suite(test_ids, "Knowledge Validation Suite")
    
    def get_execution_summary(self) -> Dict:
        """获取执行摘要"""
        if not self.execution_history:
            return {"total": 0}
        
        return {
            "total": len(self.execution_history),
            "passed": sum(1 for e in self.execution_history if e.status == TestStatus.PASSED),
            "failed": sum(1 for e in self.execution_history if e.status == TestStatus.FAILED),
            "errors": sum(1 for e in self.execution_history if e.status == TestStatus.ERROR),
            "pass_rate": sum(1 for e in self.execution_history if e.status == TestStatus.PASSED) / len(self.execution_history)
        }


# 全局实例
regression_runner = RegressionTestRunner()


__all__ = ["RegressionTestRunner", "regression_runner", "TestStatus", "TestExecution", "TestReport"]
