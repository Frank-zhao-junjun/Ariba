"""
故障排除助手 - 查询引擎单元测试
"""
import unittest
import json
from pathlib import Path

# 添加项目根目录到路径
import sys
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from models.knowledge_item import KnowledgeItem, QueryResult
from utils.version_filter import VersionFilter, version_filter
from core.query_engine import QueryEngine, create_query_engine


class TestKnowledgeItem(unittest.TestCase):
    def test_create_knowledge_item(self):
        item = KnowledgeItem(
            id="TEST-001", title="测试标题", description="测试描述",
            solution="测试解决方案", tags=["#测试"], versions=["#V2602"]
        )
        self.assertEqual(item.id, "TEST-001")
        self.assertIn("#测试", item.tags)
    
    def test_get_searchable_text(self):
        item = KnowledgeItem(
            id="TEST-002", title="供应商登录问题", description="供应商无法登录", solution="检查密码"
        )
        text = item.get_searchable_text()
        self.assertIn("供应商", text)
        self.assertIn("登录", text)


class TestVersionFilter(unittest.TestCase):
    def setUp(self):
        self.filter = VersionFilter()
    
    def test_normalize_version(self):
        self.assertEqual(self.filter.normalize_version("V2602"), "#V2602")
        self.assertEqual(self.filter.normalize_version("NextGen"), "#VNEXTGEN")
    
    def test_parse_version_tags(self):
        versions = self.filter.parse_version_tags("适用于 #V2602 和 #V2605")
        self.assertIn("#V2602", versions)
        self.assertIn("#V2605", versions)
    
    def test_filter_by_versions_any(self):
        items = [{"id": "1", "versions": ["#V2602"]}, {"id": "2", "versions": ["#V2605"]}]
        filtered = self.filter.filter_by_versions(items, ["#V2602", "#V2605"], match_mode="any")
        self.assertEqual(len(filtered), 2)
    
    def test_is_version_supported(self):
        self.assertTrue(self.filter.is_version_supported("#V2602"))
        self.assertFalse(self.filter.is_version_supported("#V9999"))


class TestQueryEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_path = project_root / "fixtures" / "sample_knowledge.json"
        with open(fixture_path, "r", encoding="utf-8") as f:
            cls.test_data = json.load(f)
        cls.engine = create_query_engine(cls.test_data)
    
    def test_ac1_1_keyword_query(self):
        """AC1.1: 支持基于关键词的简单查询"""
        results = self.engine.search("供应商登录失败")
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        self.assertIsInstance(results[0], QueryResult)
    
    def test_ac1_1_partial_match(self):
        """AC1.1: 部分关键词匹配"""
        results = self.engine.search("登录")
        self.assertGreater(len(results), 0)
    
    def test_ac1_2_return_fields(self):
        """AC1.2: 返回相关故障知识条目"""
        results = self.engine.search("审批卡住")
        self.assertGreater(len(results), 0)
        result = results[0]
        self.assertTrue(hasattr(result.item, "title"))
        self.assertTrue(hasattr(result.item, "description"))
        self.assertTrue(hasattr(result.item, "solution"))
    
    def test_ac1_3_version_filter(self):
        """AC1.3: 支持版本过滤"""
        results = self.engine.search("供应商", version_tags=["#V2605"])
        for result in results:
            item_versions = [version_filter.normalize_version(v) for v in result.item.versions]
            self.assertIn("#V2605", item_versions)
    
    def test_ac1_3_classic_filter(self):
        """AC1.3: Classic版本过滤"""
        results = self.engine.search("发票", version_tags=["#VClassic"])
        for result in results:
            item_versions = [version_filter.normalize_version(v) for v in result.item.versions]
            self.assertIn("#VCLASSIC", item_versions)
    
    def test_ac1_4_relevance_sorting(self):
        """AC1.4: 按相关度排序"""
        results = self.engine.search("供应商")
        scores = [r.score for r in results]
        self.assertEqual(scores, sorted(scores, reverse=True))
    
    def test_empty_query(self):
        results = self.engine.search("")
        self.assertEqual(len(results), 0)
    
    def test_limit_parameter(self):
        results = self.engine.search("问题", limit=3)
        self.assertLessEqual(len(results), 3)


if __name__ == "__main__":
    unittest.main()
