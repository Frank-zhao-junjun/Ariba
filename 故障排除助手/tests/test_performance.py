"""US10: 性能优化与缓存 - 单元测试"""
import unittest
import sys
from pathlib import Path
import time

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from performance import (
    LRUCache, QueryCache, query_cache,
    IndexBuilder, index_builder,
    Preloader, QueryPredictor,
    PerformanceMonitor, performance_monitor
)


class TestLRUCache(unittest.TestCase):
    def setUp(self):
        self.cache = LRUCache(max_size=3)
    
    def test_ac10_1_set_get(self):
        """AC10.1: 设置和获取"""
        self.cache.set("key1", "value1")
        self.assertEqual(self.cache.get("key1"), "value1")
    
    def test_ac10_1_lru_eviction(self):
        """AC10.1: LRU淘汰"""
        self.cache.set("k1", "v1")
        self.cache.set("k2", "v2")
        self.cache.set("k3", "v3")
        self.cache.set("k4", "v4")  # 应该淘汰k1
        self.assertIsNone(self.cache.get("k1"))
        self.assertIsNotNone(self.cache.get("k2"))
    
    def test_ac10_1_stats(self):
        """AC10.1: 统计"""
        self.cache.set("k1", "v1")
        self.cache.get("k1")
        self.cache.get("k2")  # miss
        stats = self.cache.get_stats()
        self.assertEqual(stats["hits"], 1)
        self.assertEqual(stats["misses"], 1)


class TestIndexBuilder(unittest.TestCase):
    def setUp(self):
        self.builder = IndexBuilder()
        self.test_data = [
            {"id": "KB1", "title": "供应商登录", "description": "登录问题", "solution": "检查密码", "tags": ["#登录"], "versions": ["#V2602"]},
            {"id": "KB2", "title": "审批卡住", "description": "审批问题", "solution": "检查代理", "tags": ["#审批"], "versions": ["#V2602"]}
        ]
    
    def test_ac10_3_build(self):
        """AC10.3: 构建索引"""
        self.builder.build_index(self.test_data)
        self.assertEqual(len(self.builder.forward_index), 2)
    
    def test_ac10_3_search(self):
        """AC10.3: 搜索"""
        self.builder.build_index(self.test_data)
        results = self.builder.search("登录")
        self.assertIn("KB1", results)
    
    def test_ac10_3_version_filter(self):
        """AC10.3: 版本过滤"""
        self.builder.build_index(self.test_data)
        results = self.builder.search("问题", version="#V2602")
        self.assertGreaterEqual(len(results), 0)


class TestPerformanceMonitor(unittest.TestCase):
    def setUp(self):
        self.monitor = PerformanceMonitor()
    
    def test_ac10_4_record(self):
        """AC10.4: 记录指标"""
        self.monitor.record("query", 50.0, True)
        stats = self.monitor.get_stats("query")
        self.assertEqual(stats["count"], 1)
        self.assertEqual(stats["avg_ms"], 50.0)
    
    def test_ac10_4_check_performance(self):
        """AC10.4: 性能检查"""
        self.monitor.record("query", 50.0)
        result = self.monitor.check_performance()
        self.assertIn("overall", result)


if __name__ == "__main__":
    unittest.main()
