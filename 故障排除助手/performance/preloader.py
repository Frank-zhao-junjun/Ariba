"""
预加载优化器 - US10 AC10.2

热点查询预加载
"""

from typing import List, Dict, Optional, Callable
from datetime import datetime, timedelta
from collections import Counter
import threading


class QueryPredictor:
    """查询预测器"""
    
    def __init__(self):
        self.query_history: List[str] = []
        self.user_patterns: Dict[str, List[str]] = {}
        self.ngram_model: Dict[str, int] = Counter()
    
    def record_query(self, query: str, user_id: str = None):
        """记录查询"""
        self.query_history.append(query)
        
        # 更新用户模式
        if user_id:
            if user_id not in self.user_patterns:
                self.user_patterns[user_id] = []
            self.user_patterns[user_id].append(query)
        
        # 更新N-gram模型
        words = query.split()
        for i in range(len(words) - 1):
            ngram = f"{words[i]} {words[i+1]}"
            self.ngram_model[ngram] += 1
    
    def predict_next(self, prefix: str, limit: int = 5) -> List[str]:
        """预测下一个查询"""
        suggestions = []
        
        # 基于历史预测
        for query in self.query_history[-100:]:
            if query.startswith(prefix.lower()):
                suggestions.append(query)
        
        # 基于N-gram预测
        words = prefix.split()
        if words:
            last_word = words[-1]
            for ngram, count in self.ngram_model.most_common(50):
                if ngram.startswith(last_word.lower()):
                    predicted = prefix + " " + ngram.split()[-1]
                    if predicted not in suggestions:
                        suggestions.append(predicted)
        
        return list(set(suggestions))[:limit]
    
    def get_hot_queries(self, limit: int = 10) -> List[tuple]:
        """获取热点查询"""
        counter = Counter(self.query_history)
        return counter.most_common(limit)


class Preloader:
    """
    预加载器
    
    AC10.2: 热点查询预加载
    """
    
    def __init__(self, query_cache: "QueryCache" = None):
        self.cache = query_cache
        self.predictor = QueryPredictor()
        self.preload_queue: List[str] = []
        self.preloaded: set = set()
        self.load_callback: Optional[Callable] = None
    
    def set_load_callback(self, callback: Callable):
        """设置加载回调"""
        self.load_callback = callback
    
    def record_and_predict(self, query: str, user_id: str = None):
        """记录并预测"""
        self.predictor.record_query(query, user_id)
        
        # 获取预测的查询
        predictions = self.predictor.predict_next(query)
        
        # 加入预加载队列
        for pred in predictions:
            if pred not in self.preloaded:
                self.preload_queue.append(pred)
    
    def preload_hot_queries(self, knowledge_base: List[Dict], top_n: int = 20):
        """预加载热点查询"""
        # 获取热点查询
        hot_queries = self.predictor.get_hot_queries(top_n)
        
        if not hot_queries:
            # 如果没有历史，使用默认热点查询
            hot_queries = [
                ("供应商登录失败", 100),
                ("审批卡住", 80),
                ("发票匹配失败", 60),
                ("预算检查", 40),
                ("SSO配置", 30)
            ]
        
        for query, _ in hot_queries:
            if self.cache and self.load_callback:
                # 检查是否已缓存
                cached = self.cache.get_cached_results(query)
                if cached is None:
                    # 执行查询并缓存
                    try:
                        results = self.load_callback(query)
                        self.cache.cache_results(query, [], results)
                        self.preloaded.add(query)
                    except Exception:
                        pass
    
    def get_preload_status(self) -> Dict:
        """获取预加载状态"""
        return {
            "queue_size": len(self.preload_queue),
            "preloaded_count": len(self.preloaded),
            "hot_queries_count": len(self.predictor.query_history)
        }


__all__ = ["QueryPredictor", "Preloader"]
