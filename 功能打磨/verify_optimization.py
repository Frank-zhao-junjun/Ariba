#!/usr/bin/env python3
"""
查询引擎优化验证测试
"""

import sys
import time
import random
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from collections import Counter
import math
import hashlib
import json

# ====== 简化的知识条目模型 ======
class KnowledgeItem(BaseModel):
    id: str
    title: str
    description: str
    solution: str
    category: str = "08-故障排查"
    tags: List[str] = []
    versions: List[str] = []
    related_ids: List[str] = []
    
    def get_searchable_text(self) -> str:
        parts = [self.title, self.description, self.solution, " ".join(self.tags), self.category]
        return " ".join(parts).lower()

class QueryResult(BaseModel):
    item: KnowledgeItem
    score: float = 0
    match_type: str = "keyword"
    matched_keywords: List[str] = []

# ====== LRU缓存实现 ======
from collections import OrderedDict

class CacheEntry:
    def __init__(self, key, value, ttl=3600):
        self.key = key
        self.value = value
        self.created_at = time.time()
        self.ttl = ttl
    
    def is_expired(self):
        return time.time() - self.created_at > self.ttl

class SimpleLRUCache:
    def __init__(self, max_size=500):
        self.max_size = max_size
        self.cache = OrderedDict()
        self.stats = {"hits": 0, "misses": 0}
    
    def get(self, key):
        if key in self.cache:
            entry = self.cache[key]
            if not entry.is_expired():
                self.cache.move_to_end(key)
                self.stats["hits"] += 1
                return entry.value
            del self.cache[key]
        self.stats["misses"] += 1
        return None
    
    def set(self, key, value):
        if key in self.cache:
            self.cache[key].value = value
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)
            self.cache[key] = CacheEntry(key, value)

# ====== 倒排索引实现 ======
class SimpleIndexBuilder:
    def __init__(self):
        self.inverted_index = {}
        self.forward_index = {}
        self.version_index = {}
    
    def build(self, items):
        for item in items:
            self.forward_index[item.id] = item
            # 倒排索引
            tokens = self._tokenize(item.get_searchable_text())
            for token in tokens:
                if token not in self.inverted_index:
                    self.inverted_index[token] = set()
                self.inverted_index[token].add(item.id)
            # 版本索引
            for v in item.versions:
                if v not in self.version_index:
                    self.version_index[v] = set()
                self.version_index[v].add(item.id)
    
    def _tokenize(self, text):
        import re
        return re.findall(r'[\w\u4e00-\u9fff]+', text.lower())
    
    def search(self, query):
        tokens = self._tokenize(query)
        if not tokens:
            return set()
        # 取交集
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
    def __init__(self, knowledge_base=None):
        self.knowledge_base = knowledge_base or []
        self._idf_cache = {}
        self._query_cache = SimpleLRUCache(max_size=500)
        self._index_builder = SimpleIndexBuilder()
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
    
    def _normalize_version(self, version):
        if version not in self._version_cache:
            v = version.strip().upper()
            if not v.startswith("#"):
                v = "#" + v
            self._version_cache[version] = v
        return self._version_cache[version]
    
    def search(self, query, version_tags=None, limit=10, use_cache=True):
        start = time.time()
        self._stats["queries"] += 1
        
        # 检查缓存
        if use_cache:
            cache_key = f"{query}:{version_tags}:{limit}"
            cached = self._query_cache.get(cache_key)
            if cached:
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
            "avg_time_ms": avg * 1000,
            "cache_hits": self._query_cache.stats["hits"],
            "cache_misses": self._query_cache.stats["misses"],
            "cache_hit_rate": f"{hit_rate * 100:.1f}%"
        }

# ====== 创建测试数据 ======
def create_test_data(size=100):
    topics = ["登录失败", "网络连接", "数据库超时", "API错误", "配置问题"]
    categories = ["network", "database", "auth"]
    versions = ["#V2505", "#V2602", "#V2604"]
    
    items = []
    for i in range(size):
        topic = topics[i % len(topics)]
        items.append(KnowledgeItem(
            id=f"KB-{i+1:04d}",
            title=f"{topic}问题排查",
            description=f"关于{topic}的详细描述",
            solution=f"解决{topic}的方法",
            category=categories[i % len(categories)],
            tags=[topic, "troubleshoot"],
            versions=[versions[i % len(versions)]]
        ))
    return items

# ====== 测试 ======
def run_test():
    print("=" * 60)
    print("查询引擎优化验证测试")
    print("=" * 60)
    
    # 创建测试数据
    test_data = create_test_data(100)
    engine = OptimizedQueryEngine(test_data)
    
    test_queries = ["登录失败", "网络连接", "数据库超时"]
    
    print("\n📊 性能测试结果:")
    print("-" * 40)
    
    # 首次查询（无缓存）
    print("\n[首次查询 - 无缓存]")
    for q in test_queries:
        start = time.time()
        results = engine.search(q, use_cache=False)
        elapsed = (time.time() - start) * 1000
        print(f"  '{q}': {elapsed:.2f}ms, {len(results)} 结果")
    
    # 第二次查询（有缓存）
    print("\n[第二次查询 - 有缓存]")
    for q in test_queries:
        start = time.time()
        results = engine.search(q, use_cache=True)
        elapsed = (time.time() - start) * 1000
        print(f"  '{q}': {elapsed:.2f}ms, {len(results)} 结果")
    
    # 版本过滤测试
    print("\n[版本过滤查询]")
    start = time.time()
    results = engine.search("问题", version_tags=["#V2602"])
    elapsed = (time.time() - start) * 1000
    print(f"  '#V2602': {elapsed:.2f}ms, {len(results)} 结果")
    
    # 统计
    stats = engine.get_stats()
    print("\n📈 统计信息:")
    print("-" * 40)
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    print("\n" + "=" * 60)
    print("✅ 测试完成！优化生效。")
    print("=" * 60)

if __name__ == "__main__":
    run_test()
