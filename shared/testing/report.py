"""
测试报告生成器
"""

import unittest
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass, field, asdict


@dataclass
class TestResult:
    """单个测试结果"""
    name: str
    class_name: str
    status: str  # passed, failed, error, skipped
    duration_ms: float
    message: Optional[str] = None
    traceback: Optional[str] = None


@dataclass
class TestSuiteResult:
    """测试套件结果"""
    name: str
    total_tests: int
    passed: int
    failed: int
    errors: int
    skipped: int
    duration_ms: float
    test_results: List[TestResult] = field(default_factory=list)


@dataclass
class CoverageReport:
    """覆盖率报告"""
    total_lines: int
    covered_lines: int
    coverage_percent: float
    uncovered_lines: List[int] = field(default_factory=list)


class TestReportGenerator:
    """测试报告生成器"""
    
    def __init__(self, output_dir: str = "test_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.suite_results: List[TestSuiteResult] = []
    
    def add_suite_result(self, suite: TestSuiteResult):
        """添加测试套件结果"""
        self.suite_results.append(suite)
    
    def generate_summary(self) -> Dict[str, Any]:
        """生成测试摘要"""
        total_tests = sum(s.total_tests for s in self.suite_results)
        total_passed = sum(s.passed for s in self.suite_results)
        total_failed = sum(s.failed for s in self.suite_results)
        total_errors = sum(s.errors for s in self.suite_results)
        total_skipped = sum(s.skipped for s in self.suite_results)
        total_duration = sum(s.duration_ms for s in self.suite_results)
        
        return {
            "summary": {
                "total_suites": len(self.suite_results),
                "total_tests": total_tests,
                "passed": total_passed,
                "failed": total_failed,
                "errors": total_errors,
                "skipped": total_skipped,
                "pass_rate": f"{(total_passed / total_tests * 100):.1f}%" if total_tests > 0 else "0%",
                "total_duration_ms": round(total_duration, 2),
                "timestamp": datetime.now().isoformat()
            },
            "suites": [asdict(s) for s in self.suite_results]
        }
    
    def save_json_report(self, filename: str = None) -> str:
        """保存JSON报告"""
        if filename is None:
            filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        filepath = self.output_dir / filename
        report = self.generate_summary()
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return str(filepath)
    
    def save_html_report(self, filename: str = None) -> str:
        """保存HTML报告"""
        if filename is None:
            filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        
        filepath = self.output_dir / filename
        summary = self.generate_summary()["summary"]
        suites = self.generate_summary()["suites"]
        
        html = self._generate_html(summary, suites)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        
        return str(filepath)
    
    def _generate_html(self, summary: Dict, suites: List[Dict]) -> str:
        """生成HTML内容"""
        pass_rate = float(summary["pass_rate"].replace("%", ""))
        status_color = "green" if pass_rate >= 80 else "orange" if pass_rate >= 60 else "red"
        
        html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>测试报告 - {summary['timestamp']}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }}
        .summary {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .summary h1 {{ margin-top: 0; }}
        .metrics {{ display: flex; gap: 20px; flex-wrap: wrap; }}
        .metric {{ background: white; padding: 15px 25px; border-radius: 8px; text-align: center; }}
        .metric .value {{ font-size: 32px; font-weight: bold; color: #333; }}
        .metric .label {{ color: #666; font-size: 14px; }}
        .pass-rate {{ color: {status_color}; }}
        .suite {{ background: white; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; padding: 15px; }}
        .suite h3 {{ margin-top: 0; }}
        .status-passed {{ color: green; }}
        .status-failed {{ color: red; }}
        .status-error {{ color: orange; }}
        .status-skipped {{ color: gray; }}
    </style>
</head>
<body>
    <div class="summary">
        <h1>🧪 测试报告</h1>
        <p>生成时间: {summary['timestamp']}</p>
        <div class="metrics">
            <div class="metric">
                <div class="value">{summary['total_tests']}</div>
                <div class="label">总测试数</div>
            </div>
            <div class="metric">
                <div class="value status-passed">{summary['passed']}</div>
                <div class="label">通过</div>
            </div>
            <div class="metric">
                <div class="value status-failed">{summary['failed']}</div>
                <div class="label">失败</div>
            </div>
            <div class="metric">
                <div class="value">{summary['total_duration_ms']}ms</div>
                <div class="label">耗时</div>
            </div>
            <div class="metric">
                <div class="value pass-rate">{summary['pass_rate']}</div>
                <div class="label">通过率</div>
            </div>
        </div>
    </div>
    
    <h2>测试套件</h2>
"""
        
        for suite in suites:
            html += f"""
    <div class="suite">
        <h3>{suite['name']}</h3>
        <p>
            <span class="status-passed">✓ {suite['passed']}</span> |
            <span class="status-failed">✗ {suite['failed']}</span> |
            <span class="status-error">⚠ {suite['errors']}</span> |
            <span class="status-skipped">⊘ {suite['skipped']}</span>
        </p>
    </div>
"""
        
        html += """
</body>
</html>
"""
        return html
    
    def print_summary(self):
        """打印摘要到控制台"""
        summary = self.generate_summary()["summary"]
        print("\n" + "=" * 50)
        print("📊 测试报告摘要")
        print("=" * 50)
        print(f"  测试总数: {summary['total_tests']}")
        print(f"  通过: {summary['passed']}")
        print(f"  失败: {summary['failed']}")
        print(f"  错误: {summary['errors']}")
        print(f"  跳过: {summary['skipped']}")
        print(f"  通过率: {summary['pass_rate']}")
        print(f"  总耗时: {summary['total_duration_ms']}ms")
        print("=" * 50)


def run_tests_with_report(
    test_module: str,
    test_pattern: str = "test_*.py",
    output_dir: str = "test_reports"
) -> TestReportGenerator:
    """运行测试并生成报告"""
    generator = TestReportGenerator(output_dir)
    
    # 发现并运行测试
    loader = unittest.TestLoader()
    suite = loader.discover(test_module, pattern=test_pattern)
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=0, resultclass=unittest.TestResult)
    result = runner.run(suite)
    
    # 收集结果
    suite_result = TestSuiteResult(
        name=test_module,
        total_tests=result.testsRun,
        passed=result.testsRun - len(result.failures) - len(result.errors) - len(result.skipped),
        failed=len(result.failures),
        errors=len(result.errors),
        skipped=len(result.skipped),
        duration_ms=0  # 简化处理
    )
    generator.add_suite_result(suite_result)
    
    return generator


__all__ = [
    "TestResult",
    "TestSuiteResult",
    "CoverageReport",
    "TestReportGenerator",
    "run_tests_with_report",
]
