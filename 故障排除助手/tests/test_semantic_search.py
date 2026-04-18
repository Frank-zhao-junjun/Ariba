"""
US2: 智能语义搜索 - 单元测试

验收标准：
- AC2.1: 支持自然语言语义理解
- AC2.2: 同义词和变体词匹配
- AC2.3: 错误代码精确查询
- AC2.4: 多条件组合查询
"""

import unittest
import json
from pathlib import Path
import sys

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from semantic import (
    SemanticSearchEngine, create_semantic_engine,
    SemanticAnalyzer, semantic_analyzer,
    SynonymExpander, synonym_expander,
    ErrorCodeParser, error_parser,
    ComboSearchEngine, QueryIntent, QueryType
)


class TestSemanticUnderstanding(unittest.TestCase):
    """测试语义理解"""
    
    def setUp(self):
        self.analyzer = SemanticAnalyzer()
    
    def test_ac2_1_intent_recognition(self):
        """AC2.1: 自然语言意图识别"""
        # 原因查询
        result = self.analyzer.parse("为什么供应商无法登录")
        self.assertEqual(result.intent, QueryIntent.WHY)
        
        # 解决查询
        result = self.analyzer.parse("如何解决发票匹配失败")
        self.assertEqual(result.intent, QueryIntent.HOW_TO)
        
        # 搜索查询
        result = self.analyzer.parse("查找审批超时问题")
        self.assertEqual(result.intent, QueryIntent.SEARCH)
    
    def test_ac2_1_nl_query_type(self):
        """AC2.1: 自然语言查询类型识别"""
        result = self.analyzer.parse("为什么系统登录失败")
        self.assertEqual(result.query_type, QueryType.NATURAL_LANGUAGE)
    
    def test_ac2_1_keyword_extraction(self):
        """AC2.1: 关键词提取"""
        result = self.analyzer.parse("供应商登录失败")
        self.assertTrue(len(result.keywords) > 0)
        self.assertTrue(any("登录" in kw or "供应商" in kw for kw in result.keywords))


class TestSynonymExpansion(unittest.TestCase):
    """测试同义词扩展"""
    
    def setUp(self):
        self.expander = SynonymExpander()
    
    def test_ac2_2_synonym_expand(self):
        """AC2.2: 同义词扩展"""
        expanded = self.expander.expand_query("供应商登录")
        
        # 应该包含多个变体
        self.assertTrue(len(expanded) > 2)
        # 应该包含中文变体
        self.assertTrue(any("供应商" in e for e in expanded))
        # 应该包含英文变体
        self.assertTrue(any("vendor" in e or "supplier" in e for e in expanded))
    
    def test_ac2_2_bidirectional(self):
        """AC2.2: 中英文双向扩展"""
        # 英文查询扩展到中文
        expanded_en = self.expander.expand_query("vendor login")
        self.assertTrue(any("供应商" in e for e in expanded_en))
        
        # 中文查询扩展到英文
        expanded_cn = self.expander.expand_query("供应商登录")
        self.assertTrue(any("vendor" in e or "login" in e for e in expanded_cn))
    
    def test_ac2_2_canonical_form(self):
        """AC2.2: 规范形式获取"""
        canonical = self.expander.get_canonical_form("登录")
        self.assertEqual(canonical, "登录")
    
    def test_ac2_2_find_synonyms(self):
        """AC2.2: 查找同义词"""
        synonyms = self.expander.find_synonyms("登录")
        self.assertTrue(len(synonyms) > 1)


class TestErrorCodeParser(unittest.TestCase):
    """测试错误代码解析"""
    
    def setUp(self):
        self.parser = ErrorCodeParser()
    
    def test_ac2_3_extract_error_codes(self):
        """AC2.3: 错误代码提取"""
        # 格式1: AUTH-001
        errors = self.parser.extract_error_codes("错误代码AUTH-001")
        self.assertIn("AUTH-001", errors)
        
        # 格式2: ERR-12345
        errors = self.parser.extract_error_codes("系统报错ERR-12345")
        self.assertIn("ERR-12345", errors)
        
        # 格式3: WS-404
        errors = self.parser.extract_error_codes("WS-404错误")
        self.assertIn("WS-404", errors)
    
    def test_ac2_3_multiple_codes(self):
        """AC2.3: 多错误代码提取"""
        errors = self.parser.extract_error_codes("AUTH-001和WS-404都出现错误")
        self.assertEqual(len(errors), 2)
        self.assertIn("AUTH-001", errors)
        self.assertIn("WS-404", errors)
    
    def test_ac2_3_classification(self):
        """AC2.3: 错误分类"""
        result = self.parser.classify_error("AUTH-001")
        self.assertEqual(result["category"], "AUTH")
        self.assertEqual(result["description"], "认证授权错误")
    
    def test_ac2_3_error_knowledge(self):
        """AC2.3: 错误知识映射"""
        knowledge = self.parser.get_error_knowledge("AUTH-001")
        self.assertIsNotNone(knowledge)
        self.assertIn("title", knowledge)


class TestComboSearch(unittest.TestCase):
    """测试组合查询"""
    
    @classmethod
    def setUpClass(cls):
        fixture_path = project_root / "fixtures" / "sample_knowledge.json"
        with open(fixture_path, "r", encoding="utf-8") as f:
            cls.test_data = json.load(f)
        cls.engine = ComboSearchEngine(cls.test_data)
    
    def test_ac2_4_multi_condition(self):
        """AC2.4: 多条件查询"""
        results = self.engine.search("审批 失败", limit=10)
        self.assertIsInstance(results, list)


class TestSemanticSearch(unittest.TestCase):
    """测试语义搜索引擎"""
    
    @classmethod
    def setUpClass(cls):
        fixture_path = project_root / "fixtures" / "sample_knowledge.json"
        with open(fixture_path, "r", encoding="utf-8") as f:
            cls.test_data = json.load(f)
        cls.engine = create_semantic_engine(cls.test_data)
    
    def test_ac2_1_semantic_search(self):
        """AC2.1: 语义搜索"""
        result = self.engine.search("为什么供应商登录失败", include_analysis=True)
        self.assertIn("results", result)
        self.assertIsInstance(result["results"], list)
        self.assertIn("analysis", result)
    
    def test_ac2_2_synonym_search(self):
        """AC2.2: 同义词搜索"""
        result = self.engine.search("vendor login issue")
        self.assertIn("results", result)
        # 应该能找到供应商登录相关的知识
        if result["results"]:
            titles = [r.get("title", "") for r in result["results"]]
            # 至少应该匹配到登录相关的
    
    def test_ac2_3_error_code_search(self):
        """AC2.3: 错误代码搜索"""
        result = self.engine.search("AUTH-001错误")
        self.assertIn("results", result)
        self.assertEqual(result["query_type"], "error_code")
    
    def test_ac2_4_version_filter(self):
        """AC2.4: 版本过滤"""
        result = self.engine.search("供应商", version_tags=["#V2605"])
        self.assertIn("results", result)
        for item in result["results"]:
            versions = [v.upper() for v in item.get("versions", [])]
            self.assertIn("#V2605", versions)
    
    def test_explain_error(self):
        """错误代码解释"""
        explanation = self.engine.explain_error_code("AUTH-001")
        self.assertIn("error_code", explanation)
        self.assertEqual(explanation["error_code"], "AUTH-001")


if __name__ == "__main__":
    unittest.main()
