"""
查询缓存 - US10 AC10.1

LRU缓存实现
"""

from typing import Any, Optional, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import OrderedDict
import hashlib
import json


@dataclass
class CacheEntry:
    """缓存条目"""
    key: str
    value: Any
    created_at: datetime
    accessed_at: datetime
    hit_count: int = 0
    ttl_seconds: int = 3600


class LRUCache:
    """
    LRU缓存
    
    AC10.1: 查询结果缓存机制
    """
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self.stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "expired": 0
        }
    
    def _generate_key(self, *args, **kwargs) -> str:
        """生成缓存键"""
        key_data = {
            "args": str(args),
            "kwargs": sorted(kwargs.items())
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存
        
        Args:
            key: 缓存键
            
        Returns:
            缓存值或None
        """
        if key not in self.cache:
            self.stats["misses"] += 1
            return None
        
        entry = self.cache[key]
        
        # 检查过期
        if self._is_expired(entry):
            self._remove(key)
            self.stats["expired"] += 1
            return None
        
        # 更新访问时间
        entry.accessed_at = datetime.now()
        entry.hit_count += 1
        
        # 移到末尾（最近使用）
        self.cache.move_to_end(key)
        
        self.stats["hits"] += 1
        return entry.value
    
    def set(self, key: str, value: Any, ttl: int = None):
        """
        设置缓存
        
        Args:
            key: 缓存键
            value: 缓存值
            ttl: 过期时间(秒)
        """
        ttl = ttl or self.default_ttl
        
        # 如果已存在，更新
        if key in self.cache:
            self.cache[key].value = value
            self.cache[key].accessed_at = datetime.now()
            self.cache.move_to_end(key)
            return
        
        # 如果达到最大容量，淘汰
        while len(self.cache) >= self.max_size:
            self._evict_lru()
        
        # 添加新条目
        entry = CacheEntry(
            key=key,
            value=value,
            created_at=datetime.now(),
            accessed_at=datetime.now(),
            ttl_seconds=ttl
        )
        self.cache[key] = entry
    
    def _is_expired(self, entry: CacheEntry) -> bool:
        """检查是否过期"""
        age = (datetime.now() - entry.created_at).total_seconds()
        return age > entry.ttl_seconds
    
    def _evict_lru(self):
        """淘汰最久未使用的"""
        if self.cache:
            oldest = next(iter(self.cache))
            self._remove(oldest)
            self.stats["evictions"] += 1
    
    def _remove(self, key: str):
        """移除条目"""
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        """清空缓存"""
        self.cache.clear()
    
    def get_stats(self) -> Dict:
        """获取缓存统计"""
        total = self.stats["hits"] + self.stats["misses"]
        hit_rate = self.stats["hits"] / total if total > 0 else 0
        
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "hit_rate": hit_rate,
            "evictions": self.stats["evictions"],
            "expired": self.stats["expired"]
        }
    
    def cleanup_expired(self):
        """清理过期条目"""
        expired_keys = [
            k for k, v in self.cache.items()
            if self._is_expired(v)
        ]
        for key in expired_keys:
            self._remove(key)
            self.stats["expired"] += 1


class QueryCache:
    """
    查询结果缓存
    
    AC10.1: 查询结果缓存
    """
    
    def __init__(self, max_size: int = 500):
        self.cache = LRUCache(max_size=max_size)
        self.query_index: Dict[str, int] = {}  # 查询->命中次数
    
    def _make_query_key(self, query: str, version_tags: list = None) -> str:
        """生成查询缓存键"""
        key_data = {
            "query": query.lower().strip(),
            "versions": sorted(version_tags or [])
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get_cached_results(self, query: str, version_tags: list = None) -> Optional[list]:
        """获取缓存的查询结果"""
        key = self._make_query_key(query, version_tags)
        results = self.cache.get(key)
        
        if results is not None:
            # 更新查询索引
            self.query_index[key] = self.query_index.get(key, 0) + 1
        
        return results
    
    def cache_results(self, query: str, version_tags: list, results: list, ttl: int = 1800):
        """缓存查询结果"""
        key = self._make_query_key(query, version_tags)
        self.cache.set(key, results, ttl)
    
    def get_hot_queries(self, limit: int = 10) -> list:
        """获取热点查询"""
        sorted_queries = sorted(
            self.query_index.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [q[0] for q in sorted_queries[:limit]]
    
    def get_stats(self) -> Dict:
        """获取统计"""
        stats = self.cache.get_stats()
        stats["hot_queries_count"] = len(self.query_index)
        return stats


# 全局实例
query_cache = QueryCache()


__all__ = ["LRUCache", "QueryCache", "query_cache", "CacheEntry"]
