#!/usr/bin/env python3
"""
查询引擎优化性能对比测试
对比优化前后的查询性能
"""

import sys
import time
import random
from pathlib import Path
from collections import Counter, OrderedDict
import math

# ====== 知识条目模型 ======
class KnowledgeItem:
    def __init__(self, id, title, description, solution, category="", tags=None, versions=None, related_ids=None):
        self.id = id
        self.title = title
        self.description = description
        self.solution = solution
        self.category = category or "08-故障排查"
        self.tags = tags or []
        self.versions = versions or []
        self.related_ids = related_ids or []
    
    def get_searchable_text(self):
        return " ".join([self.title, self.description, self.solution, " ".join(self.tags), self.category])

class QueryResult:
    def __init__(self, item, score=0, match_type="keyword", matched_keywords=None):
        self.item = item
        self.score = score
        self.match_type = match_type
        self.matched_keywords = matched_keywords or []

# ====== 原始查询引擎（未优化）======
class OriginalQueryEngine:
    """原始版本：无缓存、无索引"""
    
    def __init__(self, knowledge_base=None):
        self.knowledge_base = knowledge_base or []
        self._idf_cache = {}
        if self.knowledge_base:
            self._compute_idf()
    
    def _compute_idf(self):
        doc_count = len(self.knowledge_base)
        word_freq = Counter()
        for item in self.knowledge_base:
            words = set(self._tokenize(item.get_searchable_text()))
            for word in words:
                word_freq[word] += 1
        for word, freq in word_freq.items():
            self._idf_cache[word] = math.log(doc_count / (1 + freq))
    
    def _tokenize(self, text):
        import re
        return re.findall(r'[\w\u4e00-\u9fff]+', text.lower())
    
    def search(self, query, version_tags=None, limit=10):
        keywords = self._tokenize(query)
        if not keywords:
            return []
        
        results = []
        for item in self.knowledge_base:  # 全表扫描
            # 版本过滤
            if version_tags:
                if not any(v in version_tags for v in item.versions):
                    continue
            
            # 计算TF-IDF
            score = 0
            for keyword in keywords:
                tokens = self._tokenize(item.get_searchable_text())
                tf = tokens.count(keyword.lower()) / len(tokens) if tokens else 0
                idf = self._idf_cache.get(keyword.lower(), 1.0)
                score += tf * idf
            
            results.append(QueryResult(item=item, score=score * 100))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]

# ====== LRU缓存 ======
class LRUCache:
    def __init__(self, max_size=500):
        self.max_size = max_size
        self.cache = OrderedDict()
        self.stats = {"hits": 0, "misses": 0}
    
    def get(self, key):
        if key in self.cache:
            self.cache.move_to_end(key)
            self.stats["hits"] += 1
            return self.cache[key]
        self.stats["misses"] += 1
        return None
    
    def set(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)
        self.cache[key] = value

# ====== 倒排索引 ======
class IndexBuilder:
    def __init__(self):
        self.inverted_index = {}
        self.forward_index = {}
    
    def build(self, items):
        for item in items:
            self.forward_index[item.id] = item
            tokens = self._tokenize(item.get_searchable_text())
            for token in tokens:
                if token not in self.inverted_index:
                    self.inverted_index[token] = set()
                self.inverted_index[token].add(item.id)
    
    def _tokenize(self, text):
        import re
        return re.findall(r'[\w\u4e00-\u9fff]+', text.lower())
    
    def search(self, query):
        tokens = self._tokenize(query)
        if not tokens:
            return set()
        result = None
        for token in tokens:
            docs = self.inverted_index.get(token, set())
            if result is None:
                result = docs
            else:
                result &= docs
        return result or set()

# ====== 优化版查询引擎 ======
class OptimizedQueryEngine:
    """优化版本：缓存 + 索引"""
    
    def __init__(self, knowledge_base=None):
        self.knowledge_base = knowledge_base or []
        self._idf_cache = {}
        self._query_cache = LRUCache(max_size=500)
        self._index_builder = IndexBuilder()
        self._version_cache = {}
        self._stats = {"queries": 0, "total_time": 0}
        
        if self.knowledge_base:
            self._index_builder.build(self.knowledge_base)
            self._compute_idf()
    
    def _compute_idf(self):
        doc_count = len(self.knowledge_base)
        word_freq = Counter()
        for item in self.knowledge_base:
            words = set(self._tokenize(item.get_searchable_text()))
            for word in words:
                word_freq[word] += 1
        for word, freq in word_freq.items():
            self._idf_cache[word] = math.log(doc_count / (1 + freq))
    
    def _tokenize(self, text):
        import re
        return re.findall(r'[\w\u4e00-\u9fff]+', text.lower())
    
    def _normalize_version(self, v):
        if v not in self._version_cache:
            v_norm = v.strip().upper()
            if not v_norm.startswith("#"):
                v_norm = "#" + v_norm
            self._version_cache[v] = v_norm
        return self._version_cache[v]
    
    def search(self, query, version_tags=None, limit=10, use_cache=True):
        start = time.time()
        self._stats["queries"] += 1
        
        # 检查缓存
        cache_key = f"{query}:{version_tags}:{limit}"
        if use_cache:
            cached = self._query_cache.get(cache_key)
            if cached is not None:
                self._stats["total_time"] += time.time() - start
                return cached
        
        keywords = self._tokenize(query)
        if not keywords:
            return []
        
        # 使用索引快速定位
        candidate_ids = self._index_builder.search(query)
        if candidate_ids:
            id_to_item = {item.id: item for item in self.knowledge_base}
            candidates = [id_to_item[kb_id] for kb_id in candidate_ids if kb_id in id_to_item]
        else:
            candidates = self.knowledge_base
        
        # 版本过滤
        if version_tags:
            norm_versions = [self._normalize_version(v) for v in version_tags]
            candidates = [c for c in candidates 
                        if any(self._normalize_version(v) in norm_versions for v in c.versions)]
        
        # 计算得分
        results = []
        for item in candidates:
            score = sum(self._idf_cache.get(k, 1.0) for k in keywords) / len(keywords)
            results.append(QueryResult(item=item, score=score * 100))
        
        results.sort(key=lambda x: x.score, reverse=True)
        final = results[:limit]
        
        if use_cache:
            self._query_cache.set(cache_key, final)
        
        self._stats["total_time"] += time.time() - start
        return final
    
    def get_stats(self):
        total = self._stats["queries"]
        avg = self._stats["total_time"] / total if total > 0 else 0
        cache_total = self._query_cache.stats["hits"] + self._query_cache.stats["misses"]
        hit_rate = self._query_cache.stats["hits"] / cache_total if cache_total > 0 else 0
        return {
            "queries": total,
            "avg_ms": avg * 1000,
            "cache_hits": self._query_cache.stats["hits"],
            "cache_misses": self._query_cache.stats["misses"],
            "hit_rate": f"{hit_rate * 100:.1f}%"
        }

# ====== 创建测试数据 ======
def create_test_data(size):
    topics = ["登录失败", "网络连接", "数据库超时", "API错误", "配置问题", 
              "权限不足", "同步异常", "证书错误", "服务不可用", "响应超时"]
    categories = ["network", "database", "auth", "integration", "config"]
    versions = ["#V2505", "#V2602", "#V2604", "#V2605"]
    
    items = []
    for i in range(size):
        topic = topics[i % len(topics)]
        items.append(KnowledgeItem(
            id=f"KB-{i+1:05d}",
            title=f"{topic}问题排查指南",
            description=f"本文档详细描述了{topic}的常见原因和解决方法。包括错误码、诊断步骤等。",
            solution=f"解决{topic}的标准流程：1.检查配置 2.验证网络 3.重启服务 4.清除缓存",
            category=categories[i % len(categories)],
            tags=[topic, "troubleshoot", categories[i % len(categories)]],
            versions=[versions[i % len(versions)]]
        ))
    return items

# ====== 测试对比 ======
def run_comparison_test():
    print("=" * 70)
    print("查询引擎优化性能对比测试")
    print("=" * 70)
    
    sizes = [100, 500, 1000]
    test_queries = ["登录失败", "网络连接问题", "数据库超时", "API错误"]
    
    for size in sizes:
        print(f"\n📊 知识库规模: {size} 条记录")
        print("-" * 50)
        
        # 创建测试数据
        test_data = create_test_data(size)
        
        # 测试原始版本
        print("\n[原始版本 - 无缓存/无索引]")
        original = OriginalQueryEngine(test_data)
        start = time.time()
        for q in test_queries:
            results = original.search(q, limit=10)
        original_time = (time.time() - start) / len(test_queries) * 1000
        print(f"  平均查询时间: {original_time:.2f}ms")
        
        # 测试优化版本
        print("\n[优化版本 - 缓存+索引]")
        optimized = OptimizedQueryEngine(test_data)
        
        # 第一次查询（无缓存）
        for q in test_queries:
            results = optimized.search(q, limit=10, use_cache=False)
        
        # 第二次查询（有缓存）
        for q in test_queries:
            results = optimized.search(q, limit=10, use_cache=True)
        
        # 第三次查询（有缓存）
        for q in test_queries:
            results = optimized.search(q, limit=10, use_cache=True)
        
        stats = optimized.get_stats()
        print(f"  平均查询时间: {stats['avg_ms']:.2f}ms")
        print(f"  缓存命中率: {stats['hit_rate']}")
        
        # 计算提升
        if original_time > 0:
            improvement = ((original_time - stats['avg_ms']) / original_time) * 100
            print(f"  ⚡ 性能提升: {improvement:.1f}%")
    
    print("\n" + "=" * 70)
    print("测试完成！")
    print("=" * 70)

if __name__ == "__main__":
    run_comparison_test()
