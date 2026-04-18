"""
SAP Ariba 故障排除助手 - 核心查询引擎 (优化版)

优化内容：
1. 集成LRUCache - 查询结果缓存
2. 集成IndexBuilder - 倒排索引加速搜索
3. IDF持久化 - 避免重复计算
4. 版本过滤优化 - 缓存规范化结果
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from typing import List, Optional, Dict, Tuple
import math
import hashlib
import json
import time
from collections import Counter

try:
    from models.knowledge_item import KnowledgeItem, QueryResult
except ImportError:
    from ..models.knowledge_item import KnowledgeItem, QueryResult

try:
    from utils.version_filter import VersionFilter, version_filter
except ImportError:
    from ..utils.version_filter import VersionFilter, version_filter

# 导入性能优化模块
try:
    from performance import LRUCache, IndexBuilder, performance_monitor
except ImportError:
    # 如果性能模块不可用，提供简化版本
    LRUCache = None
    IndexBuilder = None
    performance_monitor = None


class OptimizedQueryEngine:
    """优化版故障知识查询引擎"""
    
    def __init__(self, knowledge_base: List[KnowledgeItem] = None):
        self.knowledge_base = knowledge_base or []
        self.version_filter = VersionFilter()
        
        # 优化1: IDF缓存 - 避免重复计算
        self._idf_cache: Dict[str, float] = {}
        self._idf_computed = False
        self._idf_cache_key = ""
        
        # 优化2: 查询结果缓存 (LRU)
        self._query_cache: LRUCache = LRUCache(max_size=500, default_ttl=3600) if LRUCache else None
        
        # 优化3: 倒排索引
        self._index_builder: IndexBuilder = IndexBuilder() if IndexBuilder else None
        self._index_built = False
        
        # 优化4: 版本规范化缓存
        self._version_cache: Dict[str, str] = {}
        
        # 性能统计
        self._stats = {
            "cache_hits": 0,
            "cache_misses": 0,
            "queries": 0,
            "total_time": 0
        }
        
        if self.knowledge_base:
            self._initialize()
    
    def _initialize(self):
        """初始化优化组件"""
        # 构建倒排索引
        if self._index_builder and not self._index_built:
            self._build_index()
        
        # 预计算IDF
        if not self._idf_computed:
            self._compute_idf()
    
    def _generate_cache_key(self, query: str, version_tags: List[str] = None, 
                            limit: int = 10, min_score: float = 0.0) -> str:
        """生成缓存键"""
        key_data = {
            "query": query.lower().strip(),
            "versions": sorted(version_tags) if version_tags else [],
            "limit": limit,
            "min_score": min_score
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _build_index(self):
        """构建倒排索引"""
        if not self._index_builder:
            return
        
        # 转换为字典格式
        items_dict = []
        for item in self.knowledge_base:
            items_dict.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "solution": item.solution,
                "tags": item.tags,
                "versions": item.versions,
                "category": item.category
            })
        
        self._index_builder.build_index(items_dict)
        self._index_built = True
    
    def _compute_idf(self):
        """计算IDF值（带缓存）"""
        if not self.knowledge_base:
            return
        
        # 生成缓存键
        cache_key = self._generate_idf_cache_key()
        
        # 检查缓存
        if cache_key == self._idf_cache_key and self._idf_cache:
            self._idf_computed = True
            return
        
        doc_count = len(self.knowledge_base)
        word_doc_freq = Counter()
        
        for item in self.knowledge_base:
            words = set(self._tokenize(item.get_searchable_text()))
            for word in words:
                word_doc_freq[word] += 1
        
        self._idf_cache = {}
        for word, freq in word_doc_freq.items():
            self._idf_cache[word] = math.log(doc_count / (1 + freq))
        
        self._idf_cache_key = cache_key
        self._idf_computed = True
    
    def _generate_idf_cache_key(self) -> str:
        """生成IDF缓存键"""
        ids = [item.id for item in self.knowledge_base]
        return hashlib.md5(",".join(sorted(ids)).encode()).hexdigest()
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        import re
        text = text.lower()
        tokens = re.findall(r'[\w\u4e00-\u9fff]+', text)
        return tokens
    
    def _normalize_version_cached(self, version: str) -> str:
        """版本规范化（带缓存）"""
        if version in self._version_cache:
            return self._version_cache[version]
        
        normalized = self.version_filter.normalize_version(version)
        self._version_cache[version] = normalized
        return normalized
    
    def _calculate_tf(self, text: str, word: str) -> float:
        tokens = self._tokenize(text)
        if not tokens:
            return 0.0
        word_count = tokens.count(word.lower())
        return word_count / len(tokens)
    
    def _calculate_tfidf(self, text: str, keywords: List[str]) -> float:
        score = 0.0
        for keyword in keywords:
            tf = self._calculate_tf(text, keyword)
            idf = self._idf_cache.get(keyword.lower(), 1.0)
            score += tf * idf
        return score
    
    def load_knowledge(self, knowledge_base: List[KnowledgeItem]):
        """加载知识库"""
        self.knowledge_base = knowledge_base
        self._initialize()
    
    def search(
        self,
        query: str,
        version_tags: List[str] = None,
        limit: int = 10,
        min_score: float = 0.0,
        use_cache: bool = True
    ) -> List["QueryResult"]:
        """搜索（带缓存和索引优化）"""
        start_time = time.time()
        
        if not query or not query.strip():
            return []
        
        self._stats["queries"] += 1
        
        # 优化5: 检查缓存
        if use_cache and self._query_cache:
            cache_key = self._generate_cache_key(query, version_tags, limit, min_score)
            cached_result = self._query_cache.get(cache_key)
            if cached_result is not None:
                self._stats["cache_hits"] += 1
                self._stats["total_time"] += time.time() - start_time
                return cached_result
        
        self._stats["cache_misses"] += 1
        
        keywords = self._tokenize(query)
        if not keywords:
            return []
        
        # 优化6: 使用倒排索引快速定位候选文档
        candidate_ids = None
        if self._index_builder and self._index_built:
            candidate_ids = set(self._index_builder.search(query))
            if not candidate_ids:
                return []
        
        results = []
        version_tags_normalized = None
        if version_tags:
            version_tags_normalized = [self._normalize_version_cached(v) for v in version_tags]
        
        # 构建ID到item的映射（用于快速访问）
        id_to_item = {item.id: item for item in self.knowledge_base}
        
        # 确定要遍历的items
        items_to_search = []
        if candidate_ids:
            for kb_id in candidate_ids:
                if kb_id in id_to_item:
                    items_to_search.append(id_to_item[kb_id])
        else:
            items_to_search = self.knowledge_base
        
        for item in items_to_search:
            # 版本过滤（使用缓存的规范化版本）
            if version_tags_normalized:
                item_versions = [self._normalize_version_cached(v) for v in item.versions]
                if not any(v in version_tags_normalized for v in item_versions):
                    continue
            
            title_score = self._calculate_tfidf(item.title, keywords) * 3.0
            desc_score = self._calculate_tfidf(item.description, keywords) * 2.0
            solution_score = self._calculate_tfidf(item.solution, keywords) * 1.5
            tag_score = self._calculate_tfidf(" ".join(item.tags), keywords) * 2.5
            
            tag_exact_bonus = 0
            for keyword in keywords:
                for tag in item.tags:
                    if keyword in tag.lower():
                        tag_exact_bonus += 10
            
            total_score = title_score + desc_score + solution_score + tag_score + tag_exact_bonus
            
            matched_keywords = []
            for keyword in keywords:
                if keyword in item.title.lower():
                    matched_keywords.append(keyword)
                if keyword in item.description.lower():
                    matched_keywords.append(keyword)
            matched_keywords = list(set(matched_keywords))
            
            match_type = "keyword"
            if any(k in item.title.lower() for k in keywords):
                match_type = "title"
            elif any(k in item.description.lower() for k in keywords):
                match_type = "description"
            elif any(k in item.solution.lower() for k in keywords):
                match_type = "solution"
            
            if total_score >= min_score:
                result = QueryResult(
                    item=item,
                    score=min(total_score, 100),
                    match_type=match_type,
                    matched_keywords=matched_keywords
                )
                results.append(result)
        
        results.sort(key=lambda x: x.score, reverse=True)
        final_results = results[:limit]
        
        # 存入缓存
        if use_cache and self._query_cache:
            self._query_cache.set(cache_key, final_results)
        
        self._stats["total_time"] += time.time() - start_time
        return final_results
    
    def get_related_items(self, item_id: str, limit: int = 5) -> List[KnowledgeItem]:
        """获取相关条目"""
        id_to_item = {item.id: item for item in self.knowledge_base}
        current = id_to_item.get(item_id)
        
        if not current:
            return []
        
        related = []
        for related_id in current.related_ids:
            if related_id in id_to_item:
                related.append(id_to_item[related_id])
        
        return related[:limit]
    
    def get_statistics(self) -> dict:
        """获取统计信息"""
        if not self.knowledge_base:
            return {
                "total_items": 0, 
                "categories": {}, 
                "version_distribution": {},
                "performance": self._stats
            }
        
        categories = Counter(item.category for item in self.knowledge_base)
        versions = Counter()
        for item in self.knowledge_base:
            for v in item.versions:
                versions[v] += 1
        
        avg_time = self._stats["total_time"] / self._stats["queries"] if self._stats["queries"] > 0 else 0
        cache_hit_rate = self._stats["cache_hits"] / (self._stats["cache_hits"] + self._stats["cache_misses"]) if (self._stats["cache_hits"] + self._stats["cache_misses"]) > 0 else 0
        
        return {
            "total_items": len(self.knowledge_base),
            "categories": dict(categories),
            "version_distribution": dict(versions),
            "average_related_count": round(sum(len(item.related_ids) for item in self.knowledge_base) / len(self.knowledge_base), 2),
            "performance": {
                **self._stats,
                "avg_query_time_ms": round(avg_time * 1000, 2),
                "cache_hit_rate": round(cache_hit_rate * 100, 2)
            }
        }
    
    def clear_cache(self):
        """清空缓存"""
        if self._query_cache:
            self._query_cache.clear()
        self._stats = {
            "cache_hits": 0,
            "cache_misses": 0,
            "queries": 0,
            "total_time": 0
        }


def create_optimized_query_engine(knowledge_base: List[dict] = None) -> OptimizedQueryEngine:
    """创建优化版查询引擎"""
    if not knowledge_base:
        return OptimizedQueryEngine()
    
    items = []
    for kb in knowledge_base:
        if isinstance(kb, dict):
            items.append(KnowledgeItem(**kb))
        elif isinstance(kb, KnowledgeItem):
            items.append(kb)
    
    return OptimizedQueryEngine(items)


# 保持向后兼容
QueryEngine = OptimizedQueryEngine


def create_query_engine(knowledge_base: List[dict] = None) -> OptimizedQueryEngine:
    """创建查询引擎（返回优化版）"""
    return create_optimized_query_engine(knowledge_base)


__all__ = ["QueryEngine", "OptimizedQueryEngine", "QueryResult", "create_query_engine", "create_optimized_query_engine"]
