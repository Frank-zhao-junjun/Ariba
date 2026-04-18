"""
测试用例生成器 - US9 AC9.2

自动生成测试用例
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
import json


@dataclass
class TestCase:
    """测试用例"""
    test_id: str
    title: str
    description: str
    input_data: Dict
    expected_result: Dict
    tags: List[str]
    priority: str  # high, medium, low


@dataclass
class TestSuite:
    """测试套件"""
    name: str
    description: str
    test_cases: List[TestCase]
    metadata: Dict


class TestGenerator:
    """
    测试用例生成器
    
    AC9.2: 测试用例自动生成
    """
    
    def generate_from_knowledge(self, knowledge: Dict) -> List[TestCase]:
        """
        从知识生成测试用例
        
        Args:
            knowledge: 知识条目
            
        Returns:
            测试用例列表
        """
        test_cases = []
        kb_id = knowledge.get("id", "")
        title = knowledge.get("title", "")
        
        # 1. 搜索测试
        test_cases.append(TestCase(
            test_id=f"{kb_id}-SEARCH-001",
            title=f"搜索: {title}",
            description=f"验证关键词能正确搜索到该知识",
            input_data={"query": title, "expected_id": kb_id},
            expected_result={"contains_id": kb_id, "relevance_score": "> 0.5"},
            tags=["search", "basic"],
            priority="high"
        ))
        
        # 2. 解决方案完整性测试
        solution = knowledge.get("solution", "")
        if solution and len(solution) > 50:
            test_cases.append(TestCase(
                test_id=f"{kb_id}-SOLUTION-001",
                title=f"解决方案验证: {title}",
                description="验证解决方案包含必要步骤",
                input_data={"solution": solution},
                expected_result={"has_steps": True, "step_count": ">= 2"},
                tags=["solution", "completeness"],
                priority="medium"
            ))
        
        # 3. 版本兼容性测试
        versions = knowledge.get("versions", [])
        if versions:
            test_cases.append(TestCase(
                test_id=f"{kb_id}-VERSION-001",
                title=f"版本过滤: {title}",
                description="验证版本过滤正常工作",
                input_data={"query": title, "version_filter": versions[0]},
                expected_result={"filtered_count": f"<= total_count", "all_support_version": True},
                tags=["version", "filter"],
                priority="medium"
            ))
        
        # 4. 关联知识测试
        related_ids = knowledge.get("related_ids", [])
        if related_ids:
            test_cases.append(TestCase(
                test_id=f"{kb_id}-RELATED-001",
                title=f"关联知识: {title}",
                description="验证关联知识推荐",
                input_data={"knowledge_id": kb_id},
                expected_result={"related_count": f">= {min(len(related_ids), 3)}"},
                tags=["related", "recommendation"],
                priority="low"
            ))
        
        return test_cases
    
    def generate_test_suite(self, knowledge_list: List[Dict]) -> TestSuite:
        """
        生成完整测试套件
        
        Args:
            knowledge_list: 知识列表
            
        Returns:
            测试套件
        """
        all_test_cases = []
        
        for kb in knowledge_list:
            test_cases = self.generate_from_knowledge(kb)
            all_test_cases.extend(test_cases)
        
        # 按优先级排序
        priority_order = {"high": 0, "medium": 1, "low": 2}
        all_test_cases.sort(key=lambda x: priority_order.get(x.priority, 1))
        
        return TestSuite(
            name="Ariba知识库自动化测试套件",
            description="基于知识库的自动化测试用例集",
            test_cases=all_test_cases,
            metadata={
                "total_cases": len(all_test_cases),
                "high_priority": sum(1 for tc in all_test_cases if tc.priority == "high"),
                "medium_priority": sum(1 for tc in all_test_cases if tc.priority == "medium"),
                "low_priority": sum(1 for tc in all_test_cases if tc.priority == "low")
            }
        )
    
    def generate_pytest_code(self, test_suite: TestSuite) -> str:
        """生成pytest代码"""
        lines = [
            '"""',
            f"自动生成的测试套件: {test_suite.name}",
            f"生成时间: {test_suite.metadata}",
            '"""',
            "",
            "import pytest",
            "from pathlib import Path",
            "import sys",
            "",
            f"project_root = Path(__file__).parent.parent",
            "sys.path.insert(0, str(project_root))",
            "",
            "from core.query_engine import create_query_engine",
            "from semantic import create_semantic_engine",
            "",
            "# 加载测试数据",
            "FIXTURE_PATH = project_root / 'fixtures' / 'sample_knowledge.json'",
            "",
            "",
            "# 测试用例",
        ]
        
        for tc in test_suite.test_cases:
            lines.append("")
            lines.append(f"def test_{tc.test_id.lower().replace('-', '_').replace('_', '')}(knowledge_base):")
            lines.append(f'    """{tc.title}""")')
            lines.append(f'    # {tc.description}')
            lines.append(f'    pass  # TODO: 实现测试逻辑')
        
        return "\n".join(lines)


# 全局实例
test_generator = TestGenerator()


__all__ = ["TestGenerator", "test_generator", "TestCase", "TestSuite"]
