"""
统一的测试工具模块
"""

import unittest
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
import time
import json


# ====== 测试数据生成器 ======

class TestDataGenerator:
    """测试数据生成器"""
    
    @staticmethod
    def create_knowledge_item(**kwargs) -> Dict[str, Any]:
        """创建测试用知识条目"""
        defaults = {
            "id": f"KB-{time.time():.0f}",
            "title": "测试标题",
            "description": "测试描述",
            "solution": "测试解决方案",
            "category": "测试分类",
            "tags": ["测试", "样例"],
            "versions": ["#V2605"],
            "related_ids": []
        }
        defaults.update(kwargs)
        return defaults
    
    @staticmethod
    def create_knowledge_base(size: int = 10, **defaults) -> List[Dict[str, Any]]:
        """创建测试用知识库"""
        topics = ["供应商", "采购", "合同", "审批", "发票", "用户", "权限", "集成", "配置", "报表"]
        categories = ["authentication", "buying", "sourcing", "contract", "data"]
        
        items = []
        for i in range(size):
            topic = topics[i % len(topics)]
            item = TestDataGenerator.create_knowledge_item(
                id=f"KB-{i+1:04d}",
                title=f"{topic}问题排查",
                description=f"这是关于{topic}的测试描述",
                solution=f"解决{topic}问题的方法",
                category=categories[i % len(categories)],
                tags=[topic, "troubleshoot"],
                versions=["#V2605", "#V2604"][i % 2:],
                **defaults
            )
            items.append(item)
        
        return items
    
    @staticmethod
    def create_checklist_item(**kwargs) -> Dict[str, Any]:
        """创建测试用清单项"""
        defaults = {
            "id": f"ITEM-{time.time():.0f}",
            "original_id": "TEST-001",
            "title": "测试清单项",
            "description": "测试描述",
            "phase": "requirements_analysis",
            "phase_name": "需求分析",
            "module": ["buying"],
            "priority": "high",
            "category": "business",
            "versions": ["#V2605"],
            "status": "not_started"
        }
        defaults.update(kwargs)
        return defaults


# ====== 测试夹具 ======

@dataclass
class TestFixture:
    """测试夹具"""
    name: str
    data: Any
    setup: Optional[Callable] = None
    teardown: Optional[Callable] = None
    
    def load(self):
        """加载夹具"""
        if self.setup:
            self.setup()
        return self.data
    
    def unload(self):
        """卸载夹具"""
        if self.teardown:
            self.teardown()


class FixtureManager:
    """夹具管理器"""
    
    def __init__(self):
        self.fixtures: Dict[str, TestFixture] = {}
    
    def register(self, name: str, data: Any, 
                 setup: Optional[Callable] = None,
                 teardown: Optional[Callable] = None):
        """注册夹具"""
        self.fixtures[name] = TestFixture(name, data, setup, teardown)
    
    def get(self, name: str) -> Optional[Any]:
        """获取夹具"""
        fixture = self.fixtures.get(name)
        if fixture:
            return fixture.load()
        return None
    
    def clear(self):
        """清空所有夹具"""
        for fixture in self.fixtures.values():
            fixture.unload()
        self.fixtures.clear()


# ====== Mock对象 ======

class MockCache:
    """Mock缓存"""
    
    def __init__(self):
        self.data = {}
        self.hits = 0
        self.misses = 0
    
    def get(self, key):
        if key in self.data:
            self.hits += 1
            return self.data[key]
        self.misses += 1
        return None
    
    def set(self, key, value):
        self.data[key] = value
    
    def clear(self):
        self.data.clear()
        self.hits = 0
        self.misses = 0


class MockKnowledgeBase:
    """Mock知识库"""
    
    def __init__(self, items: List[Dict] = None):
        self.items = items or []
    
    def search(self, query: str) -> List[Dict]:
        results = []
        for item in self.items:
            if query.lower() in item.get("title", "").lower():
                results.append(item)
        return results


# ====== 性能断言 ======

class PerformanceTestCase(unittest.TestCase):
    """性能测试基类"""
    
    def assert_performance(self, func: Callable, max_ms: float, *args, **kwargs):
        """断言函数执行时间"""
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = (time.time() - start) * 1000
        self.assertLess(
            elapsed, max_ms,
            f"执行时间 {elapsed:.2f}ms 超过限制 {max_ms}ms"
        )
        return result


# ====== 断言工具 ======

def assert_version_normalized(self, version: str, expected: str):
    """断言版本已规范化"""
    self.assertTrue(
        version.startswith("#"),
        f"版本 '{version}' 未以#开头"
    )
    self.assertEqual(version, expected)


def assert_query_result_valid(self, result: Dict):
    """断言查询结果有效"""
    required_fields = ["id", "title", "description"]
    for field in required_fields:
        self.assertIn(field, result, f"缺少必需字段: {field}")


# ====== 测试运行器 ======

class TestRunner:
    """测试运行器"""
    
    def __init__(self):
        self.results = []
    
    def run(self, test_class: type, verbose: bool = False) -> unittest.TestResult:
        """运行测试"""
        suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
        result = unittest.TextTestRunner(verbosity=2 if verbose else 1).run(suite)
        self.results.append({
            "class": test_class.__name__,
            "tests": result.testsRun,
            "failures": len(result.failures),
            "errors": len(result.errors),
            "success": result.wasSuccessful()
        })
        return result
    
    def summary(self) -> Dict[str, Any]:
        """获取测试摘要"""
        total_tests = sum(r["tests"] for r in self.results)
        total_failures = sum(r["failures"] for r in self.results)
        total_errors = sum(r["errors"] for r in self.results)
        
        return {
            "total_tests": total_tests,
            "total_failures": total_failures,
            "total_errors": total_errors,
            "success_rate": (
                (total_tests - total_failures - total_errors) / total_tests * 100
                if total_tests > 0 else 0
            ),
            "results": self.results
        }


# ====== 集成测试支持 ======

@dataclass  
class IntegrationTestContext:
    """集成测试上下文"""
    fixtures_dir: Path
    output_dir: Path
    config: Dict[str, Any] = field(default_factory=dict)


def setup_integration_test(
    fixtures_dir: str = "fixtures",
    output_dir: str = "test_output"
) -> IntegrationTestContext:
    """设置集成测试环境"""
    # 获取项目根目录
    project_root = Path(__file__).parent.parent.parent
    
    fixtures_path = project_root / fixtures_dir
    output_path = project_root / output_dir
    
    # 确保输出目录存在
    output_path.mkdir(parents=True, exist_ok=True)
    
    return IntegrationTestContext(
        fixtures_dir=fixtures_path,
        output_dir=output_path
    )


# ====== 导出 ======

__all__ = [
    "TestDataGenerator",
    "TestFixture",
    "FixtureManager",
    "MockCache",
    "MockKnowledgeBase",
    "PerformanceTestCase",
    "assert_version_normalized",
    "assert_query_result_valid",
    "TestRunner",
    "IntegrationTestContext",
    "setup_integration_test",
]
