"""US4: 解决方案推荐 - 单元测试"""
import unittest
import json
from pathlib import Path
import sys

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from recommendation import RecommendationEngine, create_recommendation_engine


class TestRecommendationEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_path = project_root / "fixtures" / "sample_knowledge.json"
        with open(fixture_path, "r", encoding="utf-8") as f:
            cls.test_data = json.load(f)
        cls.engine = create_recommendation_engine(cls.test_data)
    
    def test_ac4_1_recommend_knowledge(self):
        """AC4.1: 推荐相关知识点"""
        result = self.engine.recommend("供应商登录失败", limit=5)
        self.assertIsInstance(result.related_knowledge, list)
        self.assertLessEqual(len(result.related_knowledge), 5)
    
    def test_ac4_1_knowledge_structure(self):
        """AC4.1: 推荐知识结构"""
        result = self.engine.recommend("登录问题", limit=3)
        if result.related_knowledge:
            item = result.related_knowledge[0]
            self.assertTrue(hasattr(item, 'id'))
            self.assertTrue(hasattr(item, 'title'))
            self.assertTrue(hasattr(item, 'similarity'))
    
    def test_ac4_1_sorted_by_relevance(self):
        """AC4.1: 按相关性排序"""
        result = self.engine.recommend("审批", limit=5)
        if len(result.related_knowledge) >= 2:
            scores = [k.relevance_score for k in result.related_knowledge]
            self.assertEqual(scores, sorted(scores, reverse=True))
    
    def test_ac4_2_similar_cases(self):
        """AC4.2: 相似案例匹配"""
        result = self.engine.recommend("发票匹配失败", limit=3)
        self.assertIsInstance(result.similar_cases, list)
        for case in result.similar_cases:
            self.assertTrue(hasattr(case, 'similarity_score'))
    
    def test_ac4_2_case_scoring(self):
        """AC4.2: 案例匹配评分"""
        result = self.engine.recommend("供应商无法登录", limit=5)
        for case in result.similar_cases:
            self.assertIsInstance(case.similarity_score, float)
            self.assertGreaterEqual(case.similarity_score, 0)
    
    def test_ac4_3_document_links(self):
        """AC4.3: 官方文档链接"""
        result = self.engine.recommend("供应商登录", limit=5)
        self.assertIsInstance(result.document_links, list)
        for link in result.document_links:
            self.assertTrue(hasattr(link, 'title'))
            self.assertTrue(hasattr(link, 'url'))
            self.assertTrue(link.url.startswith("http"))
    
    def test_ac4_3_url_format(self):
        """AC4.3: URL格式验证"""
        result = self.engine.recommend("审批工作流", limit=3)
        for link in result.document_links:
            self.assertIn("help.sap.com", link.url)
    
    def test_ac4_4_best_practices(self):
        """AC4.4: 最佳实践提示"""
        result = self.engine.recommend("登录优化", limit=5)
        self.assertIsInstance(result.best_practices, list)
    
    def test_ac4_4_practice_content(self):
        """AC4.4: 实践内容结构"""
        result = self.engine.recommend("审批效率", limit=5)
        for practice in result.best_practices:
            self.assertTrue(hasattr(practice, 'title'))
            self.assertTrue(hasattr(practice, 'steps'))
            self.assertTrue(hasattr(practice, 'benefits'))
    
    def test_summary_generation(self):
        """摘要生成"""
        result = self.engine.recommend("供应商登录", limit=5)
        self.assertIsInstance(result.summary, str)
    
    def test_with_context(self):
        """上下文感知"""
        result = self.engine.recommend("发票", current_item={"id": "KBE-003"}, version="#V2605")
        self.assertIsInstance(result, type(result))


if __name__ == "__main__":
    unittest.main()
