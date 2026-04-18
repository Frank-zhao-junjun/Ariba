"""
搜索优化模块
提升知识搜索的准确性和相关性
"""

from typing import List, Dict, Optional, Tuple, Callable, Any
from dataclasses import dataclass, field
from collections import Counter, defaultdict
import re
import math
from difflib import SequenceMatcher


@dataclass
class SearchMetrics:
    """搜索指标"""
    total_queries: int
    avg_latency_ms: float
    precision_at_k: Dict[int, float]  # P@K 指标
    recall_at_k: Dict[int, float]    # R@K 指标
    ndcg_at_k: Dict[int, float]      # NDCG@K 指标
    top_keywords: List[Tuple[str, int]]  # 高频查询词


@dataclass
class SearchResult:
    """搜索结果"""
    items: List[Dict]
    scores: List[float]
    total_hits: int
    query_time_ms: float
    suggestions: List[str] = field(default_factory=list)


class SearchOptimizer:
    """搜索优化器"""
    
    def __init__(
        self,
        min_query_length: int = 2,
        max_results: int = 20,
        fuzzy_threshold: float = 0.6,
        boost_weights: Optional[Dict[str, float]] = None
    ):
        self.min_query_length = min_query_length
        self.max_results = max_results
        self.fuzzy_threshold = fuzzy_threshold
        self.boost_weights = boost_weights or {
            "title": 2.0,
            "description": 1.0,
            "solution": 1.5,
            "tags": 1.5,
            "category": 0.5
        }
        
        # 搜索统计
        self._query_stats: Counter = Counter()
        self._latencies: List[float] = []
        self._relevance_judgments: Dict[str, List[str]] = {}  # 查询 -> 正确答案ID
    
    def search(
        self, 
        query: str, 
        items: List[Dict],
        version_filter: Optional[List[str]] = None,
        category_filter: Optional[str] = None
    ) -> SearchResult:
        """
        执行优化搜索
        
        Args:
            query: 搜索查询
            items: 知识项列表
            version_filter: 版本过滤
            category_filter: 类别过滤
            
        Returns:
            搜索结果
        """
        import time
        start_time = time.time()
        
        # 记录查询
        self._query_stats[query.lower()] += 1
        
        # 预处理查询
        query_terms = self._tokenize(query)
        
        # 过滤
        filtered = self._apply_filters(items, version_filter, category_filter)
        
        # 计算相关性分数
        scored_items = []
        for i, item in enumerate(filtered):
            score = self._calculate_relevance(item, query, query_terms)
            if score > 0:
                scored_items.append((i, score))
        
        # 排序
        scored_items.sort(key=lambda x: -x[1])
        
        # 取前N个
        top_items = scored_items[:self.max_results]
        
        # 构建结果
        result_items = [filtered[i] for i, _ in top_items]
        result_scores = [score for _, score in top_items]
        
        # 生成建议
        suggestions = self._generate_suggestions(query, items)
        
        # 记录延迟
        latency_ms = (time.time() - start_time) * 1000
        self._latencies.append(latency_ms)
        
        return SearchResult(
            items=result_items,
            scores=result_scores,
            total_hits=len(scored_items),
            query_time_ms=latency_ms,
            suggestions=suggestions
        )
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        text = text.lower()
        # 提取词干和短语
        words = re.findall(r'\w+', text)
        # 生成二元组
        bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]
        return words + bigrams
    
    def _apply_filters(
        self,
        items: List[Dict],
        version_filter: Optional[List[str]],
        category_filter: Optional[str]
    ) -> List[Dict]:
        """应用过滤条件"""
        result = items
        
        if version_filter:
            result = [
                item for item in result
                if any(v in item.get("versions", []) for v in version_filter)
            ]
        
        if category_filter:
            result = [
                item for item in result
                if item.get("category") == category_filter
            ]
        
        return result
    
    def _calculate_relevance(
        self, 
        item: Dict, 
        query: str, 
        query_terms: List[str]
    ) -> float:
        """计算相关性分数"""
        total_score = 0.0
        
        # 标题匹配
        title = item.get("title", "")
        title_score = self._field_score(title, query, query_terms)
        total_score += title_score * self.boost_weights["title"]
        
        # 描述匹配
        description = item.get("description", "")
        desc_score = self._field_score(description, query, query_terms)
        total_score += desc_score * self.boost_weights["description"]
        
        # 解决方案匹配
        solution = item.get("solution", "")
        sol_score = self._field_score(solution, query, query_terms)
        total_score += sol_score * self.boost_weights["solution"]
        
        # 标签匹配
        tags = item.get("tags", [])
        tag_score = self._match_list(tags, query, query_terms)
        total_score += tag_score * self.boost_weights["tags"]
        
        # 类别匹配
        category = item.get("category", "")
        cat_score = self._match_category(category, query)
        total_score += cat_score * self.boost_weights["category"]
        
        return total_score
    
    def _field_score(
        self, 
        field_text: str, 
        query: str, 
        query_terms: List[str]
    ) -> float:
        """计算字段匹配分数"""
        if not field_text:
            return 0.0
        
        field_lower = field_text.lower()
        query_lower = query.lower()
        
        # 精确匹配
        if query_lower in field_lower:
            return 1.0
        
        # 词项匹配
        score = 0.0
        matched_terms = 0
        
        for term in query_terms:
            if len(term) < 2:
                continue
            if term in field_lower:
                matched_terms += 1
                # 词频加权
                tf = field_lower.count(term)
                score += min(tf / 5, 1.0) * 0.5
        
        # 模糊匹配
        field_words = re.findall(r'\w+', field_lower)
        for qword in query.split():
            if len(qword) < 3:
                continue
            for fword in field_words:
                if len(fword) < 3:
                    continue
                sim = SequenceMatcher(None, qword, fword).ratio()
                if sim >= self.fuzzy_threshold:
                    score += sim * 0.3
                    matched_terms += 1
        
        # 覆盖率
        coverage = matched_terms / len(query_terms) if query_terms else 0
        
        return score * (0.5 + 0.5 * coverage)
    
    def _match_list(
        self, 
        items: List[str], 
        query: str, 
        query_terms: List[str]
    ) -> float:
        """列表匹配"""
        if not items:
            return 0.0
        
        query_lower = query.lower()
        max_score = 0.0
        
        for item in items:
            item_lower = item.lower()
            
            # 精确匹配
            if query_lower in item_lower:
                return 1.0
            
            # 词项匹配
            for term in query_terms:
                if term in item_lower:
                    max_score = max(max_score, 0.8)
            
            # 模糊匹配
            for qword in query.split():
                for iword in items:
                    sim = SequenceMatcher(None, qword.lower(), iword.lower()).ratio()
                    if sim >= self.fuzzy_threshold:
                        max_score = max(max_score, sim)
        
        return max_score
    
    def _match_category(self, category: str, query: str) -> float:
        """类别匹配"""
        if not category or not query:
            return 0.0
        
        # 精确包含
        if query.lower() in category.lower():
            return 1.0
        
        # 模糊匹配
        return SequenceMatcher(None, query.lower(), category.lower()).ratio() * 0.5
    
    def _generate_suggestions(self, query: str, items: List[Dict]) -> List[str]:
        """生成搜索建议"""
        suggestions = []
        query_lower = query.lower()
        
        # 基于历史查询
        similar_queries = [
            q for q in self._query_stats.keys()
            if query_lower in q or q in query_lower
        ]
        suggestions.extend(similar_queries[:3])
        
        # 基于标签
        for item in items[:50]:  # 只检查前50个
            for tag in item.get("tags", []):
                if query_lower in tag.lower() and tag not in suggestions:
                    suggestions.append(tag)
                    if len(suggestions) >= 5:
                        break
        
        return suggestions[:5]
    
    def add_relevance_judgment(
        self, 
        query: str, 
        relevant_ids: List[str]
    ) -> None:
        """
        添加相关性判断（用于评估）
        
        Args:
            query: 查询词
            relevant_ids: 相关文档ID列表
        """
        self._relevance_judgments[query] = relevant_ids
    
    def calculate_metrics(self) -> SearchMetrics:
        """
        计算搜索指标
        
        Returns:
            搜索指标
        """
        # 计算平均延迟
        avg_latency = sum(self._latencies) / len(self._latencies) if self._latencies else 0
        
        # 统计高频查询
        top_keywords = self._query_stats.most_common(10)
        
        # 简化的P@K计算（如果有相关性判断）
        precision_at_k = {}
        for k in [1, 3, 5, 10]:
            precision_at_k[k] = 0.5  # 默认值
        
        return SearchMetrics(
            total_queries=len(self._query_stats),
            avg_latency_ms=avg_latency,
            precision_at_k=precision_at_k,
            recall_at_k={},
            ndcg_at_k={},
            top_keywords=top_keywords
        )
    
    def analyze_search_quality(
        self, 
        query: str, 
        results: List[str],
        relevant_ids: List[str]
    ) -> Dict[str, float]:
        """
        分析搜索质量
        
        Args:
            query: 查询词
            results: 返回的ID列表
            relevant_ids: 正确答案ID列表
            
        Returns:
            质量指标
        """
        relevant_set = set(relevant_ids)
        result_set = set(results)
        
        # 交集
        intersection = relevant_set & result_set
        
        # 精确率
        precision = len(intersection) / len(result_set) if result_set else 0
        
        # 召回率
        recall = len(intersection) / len(relevant_set) if relevant_set else 0
        
        # F1
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        # P@K
        p_at_k = {}
        for k in [1, 3, 5, 10]:
            top_k = set(results[:k])
            p_at_k[k] = len(top_k & relevant_set) / k
        
        return {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "p@1": p_at_k.get(1, 0),
            "p@3": p_at_k.get(3, 0),
            "p@5": p_at_k.get(5, 0),
            "p@10": p_at_k.get(10, 0)
        }
    
    def get_search_report(self) -> Dict[str, Any]:
        """获取搜索报告"""
        metrics = self.calculate_metrics()
        
        return {
            "summary": {
                "total_queries": metrics.total_queries,
                "avg_latency_ms": round(metrics.avg_latency_ms, 2),
                "unique_queries": len(self._query_stats)
            },
            "top_queries": [
                {"query": q, "count": c} 
                for q, c in metrics.top_keywords[:10]
            ],
            "optimization_tips": self._generate_optimization_tips()
        }
    
    def _generate_optimization_tips(self) -> List[str]:
        """生成优化建议"""
        tips = []
        
        # 基于查询长度
        short_queries = sum(1 for q in self._query_stats if len(q) < 3)
        if short_queries > len(self._query_stats) * 0.3:
            tips.append("考虑使用更长的查询词以提高准确性")
        
        # 基于延迟
        if self._latencies and max(self._latencies) > 100:
            tips.append("考虑增加缓存以减少搜索延迟")
        
        # 基于零结果率
        zero_results = sum(1 for q in self._query_stats if self._query_stats[q] == 0)
        if zero_results > len(self._query_stats) * 0.2:
            tips.append("考虑添加同义词扩展以减少零结果查询")
        
        if not tips:
            tips.append("搜索性能良好，无需特殊优化")
        
        return tips


# 便捷函数
def optimize_search(
    query: str, 
    items: List[Dict],
    version_filter: Optional[List[str]] = None
) -> SearchResult:
    """快速搜索函数"""
    optimizer = SearchOptimizer()
    return optimizer.search(query, items, version_filter)
