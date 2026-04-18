"""
测试报告生成器 - US9 AC9.4

自动生成测试报告
"""

from typing import Dict, List, Optional
from datetime import datetime


class TestReportGenerator:
    """
    测试报告生成器
    
    AC9.4: 测试报告自动生成
    """
    
    def generate_markdown_report(self, report: "TestReport") -> str:
        """
        生成Markdown报告
        
        Args:
            report: 测试报告
            
        Returns:
            Markdown格式报告
        """
        lines = [
            "# 测试执行报告",
            "",
            f"**套件名称**: {report.suite_name}",
            f"**执行时间**: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"**总耗时**: {report.duration_ms:.2f}ms",
            "",
            "---",
            "",
            "## 执行摘要",
            "",
            "| 指标 | 数值 |",
            "|------|------|",
            f"| 总测试数 | {report.total_tests} |",
            f"| 通过 | {report.passed} |",
            f"| 失败 | {report.failed} |",
            f"| 跳过 | {report.skipped} |",
            f"| 错误 | {report.errors} |",
            "",
            f"**通过率**: {report.passed / report.total_tests * 100:.1f}%",
            "",
            "---",
            "",
            "## 失败测试详情",
            ""
        ]
        
        if report.failed_tests:
            lines.append("| 测试ID | 状态 | 错误信息 |")
            lines.append("|--------|------|----------|")
            for ft in report.failed_tests:
                lines.append(f"| {ft['test_id']} | {ft['status']} | {ft['error'][:50]}... |")
        else:
            lines.append("*所有测试通过 🎉*")
        
        lines.extend([
            "",
            "---",
            "",
            "## 测试详情",
            ""
        ])
        
        for exec in report.executions[:20]:  # 只显示前20个
            status_icon = "✅" if exec.status.value == "passed" else "❌"
            lines.append(f"{status_icon} **{exec.test_id}** - {exec.status.value} ({exec.duration_ms:.2f}ms)")
        
        return "\n".join(lines)
    
    def generate_html_report(self, report: "TestReport") -> str:
        """生成HTML报告"""
        pass_rate = report.passed / report.total_tests * 100 if report.total_tests > 0 else 0
        status_color = "#27ae60" if pass_rate >= 80 else "#f39c12" if pass_rate >= 60 else "#e74c3c"
        
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>测试报告 - {report.suite_name}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        h1 {{ color: #2c3e50; }}
        .summary {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }}
        .metric {{ background: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; }}
        .metric-value {{ font-size: 32px; font-weight: bold; color: #2c3e50; }}
        .metric-label {{ font-size: 14px; color: #7f8c8d; }}
        .pass-rate {{ background: {status_color}; color: white; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ecf0f1; }}
        th {{ background: #34495e; color: white; }}
        .passed {{ color: #27ae60; }}
        .failed {{ color: #e74c3c; }}
        .error {{ color: #e67e22; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 {report.suite_name}</h1>
        <p>执行时间: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">{report.total_tests}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric passed">
                <div class="metric-value">{report.passed}</div>
                <div class="metric-label">通过</div>
            </div>
            <div class="metric">
                <div class="metric-value">{report.failed}</div>
                <div class="metric-label">失败</div>
            </div>
            <div class="metric pass-rate">
                <div class="metric-value">{pass_rate:.1f}%</div>
                <div class="metric-label">通过率</div>
            </div>
        </div>
        
        <h2>失败测试</h2>
        <table>
            <tr><th>测试ID</th><th>状态</th><th>错误信息</th></tr>
"""
        
        for ft in report.failed_tests:
            html += f"""            <tr>
                <td>{ft['test_id']}</td>
                <td class="{ft['status']}">{ft['status']}</td>
                <td>{ft['error'][:100]}</td>
            </tr>
"""
        
        html += """        </table>
    </div>
</body>
</html>"""
        
        return html


# 全局实例
report_generator = TestReportGenerator()


__all__ = ["TestReportGenerator", "report_generator"]
