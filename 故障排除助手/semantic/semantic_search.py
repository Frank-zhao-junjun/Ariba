"""
语义搜索引擎入口 - US2核心模块

整合语义理解、同义词扩展、错误代码解析和组合查询
"""

from typing import List, Dict, Optional, Tuple
import json

from .semantic_understanding import SemanticAnalyzer, semantic_analyzer, QueryIntent, QueryType, ParsedQuery
from .synonym_dict import SynonymExpander, synonym_expander
from .error_parser import ErrorCodeParser, error_parser
from .combo_query import ComboQueryBuilder, ComboSearchEngine


class SemanticSearchEngine:
    """
    语义搜索引擎
    
    功能：
    - 自然语言语义理解
    - 同义词和变体词匹配
    - 错误代码精确查询
    - 多条件组合查询
    """
    
    def __init__(self, knowledge_base: List[Dict] = None):
        self.knowledge_base = knowledge_base or []
        self.semantic_analyzer = SemanticAnalyzer()
        self.synonym_expander = SynonymExpander()
        self.error_parser = ErrorCodeParser()
        self.combo_engine = ComboSearchEngine(knowledge_base)
        
        # TF-IDF数据
        self._idf_cache = {}
        if self.knowledge_base:
            self._compute_idf()
    
    def _compute_idf(self):
        """计算IDF"""
        from collections import Counter
        import math
        import re
        
        doc_count = len(self.knowledge_base)
        word_doc_freq = Counter()
        
        for item in self.knowledge_base:
            text = f"{item.get('title', '')} {item.get('description', '')} {item.get('solution', '')}"
            words = set(re.findall(r'[\w\u4e00-\u9fff]+', text.lower()))
            for word in words:
                word_doc_freq[word] += 1
        
        for word, freq in word_doc_freq.items():
            self._idf_cache[word] = math.log(doc_count / (1 + freq))
    
    def search(
        self,
        query: str,
        version_tags: List[str] = None,
        limit: int = 10,
        include_analysis: bool = False
    ) -> Dict:
        """
        语义搜索
        
        Args:
            query: 自然语言查询
            version_tags: 版本过滤
            limit: 结果数量
            include_analysis: 是否包含分析结果
            
        Returns:
            搜索结果字典
        """
        # 1. 语义解析
        parsed = self.semantic_analyzer.parse(query)
        
        # 2. 同义词扩展
        expanded_keywords = self.synonym_expander.expand_query(query)
        parsed.synonyms = expanded_keywords
        
        # 3. 根据查询类型执行不同搜索
        results = []
        
        if parsed.query_type == QueryType.ERROR_CODE and parsed.extracted_errors:
            # AC2.3: 错误代码查询
            results = self._search_by_error_codes(parsed.extracted_errors)
        elif parsed.query_type == QueryType.MULTI_CONDITION:
            # AC2.4: 多条件查询
            combo_results = self.combo_engine.search(query, version_tags, limit)
            results = [r["item"] for r in combo_results]
        else:
            # AC2.1+AC2.2: 语义+同义词搜索
            results = self._semantic_search(parsed, expanded_keywords, version_tags, limit)
        
        # 4. 版本过滤
        if version_tags:
            results = self._filter_by_version(results, version_tags)
        
        # 5. 构建响应
        response = {
            "results": results[:limit],
            "count": len(results),
            "query_type": parsed.query_type.value,
            "intent": parsed.intent.value
        }
        
        if include_analysis:
            response["analysis"] = {
                "parsed_query": {
                    "original": parsed.original,
                    "intent": parsed.intent.value,
                    "keywords": parsed.keywords,
                    "error_codes": parsed.extracted_errors,
                    "version_filters": parsed.version_filters,
                    "conditions": parsed.conditions
                },
                "expanded_keywords": expanded_keywords,
                "suggestions": self._generate_suggestions(parsed)
            }
        
        return response
    
    def _semantic_search(
        self,
        parsed: ParsedQuery,
        expanded_keywords: List[str],
        version_tags: List[str],
        limit: int
    ) -> List[Dict]:
        """语义搜索"""
        import re
        
        scored_results = []
        all_keywords = list(set(parsed.keywords + expanded_keywords))
        
        # 权重配置
        weights = {
            "title": 3.0,
            "description": 2.0,
            "solution": 1.5,
            "tags": 2.5
        }
        
        for item in self.knowledge_base:
            score = 0
            matched_fields = []
            
            # 标题匹配
            title_lower = item.get("title", "").lower()
            for kw in all_keywords:
                if kw.lower() in title_lower:
                    score += weights["title"] * self._idf_cache.get(kw.lower(), 1.0)
                    matched_fields.append("title")
            
            # 描述匹配
            desc_lower = item.get("description", "").lower()
            for kw in all_keywords:
                if kw.lower() in desc_lower:
                    score += weights["description"] * self._idf_cache.get(kw.lower(), 1.0)
                    matched_fields.append("description")
            
            # 解决方案匹配
            sol_lower = item.get("solution", "").lower()
            for kw in all_keywords:
                if kw.lower() in sol_lower:
                    score += weights["solution"] * self._idf_cache.get(kw.lower(), 1.0)
                    matched_fields.append("solution")
            
            # 标签匹配
            tags_text = " ".join(item.get("tags", [])).lower()
            for kw in all_keywords:
                if kw.lower() in tags_text:
                    score += weights["tags"] * 2
                    matched_fields.append("tags")
            
            if score > 0:
                scored_results.append({
                    "item": item,
                    "score": min(score, 100),
                    "matched_fields": list(set(matched_fields))
                })
        
        # 排序
        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return [r["item"] for r in scored_results]
    
    def _search_by_error_codes(self, error_codes: List[str]) -> List[Dict]:
        """AC2.3: 错误代码精确搜索"""
        results = []
        
        for item in self.knowledge_base:
            item_text = f"{item.get('title', '')} {item.get('description', '')} {item.get('solution', '')}"
            item_text_upper = item_text.upper()
            
            for code in error_codes:
                code_upper = code.upper()
                if code_upper in item_text_upper:
                    # 计算精确匹配分数
                    pos = item_text_upper.find(code_upper)
                    precision_bonus = 100 - (pos % 100)  # 位置越前分数越高
                    
                    results.append(item)
                    # 添加元数据
                    item["_error_match"] = code
                    item["_precision_score"] = precision_bonus
                    break
        
        # 按精确度排序
        results.sort(key=lambda x: x.get("_precision_score", 0), reverse=True)
        return results
    
    def _filter_by_version(self, items: List[Dict], version_tags: List[str]) -> List[Dict]:
        """版本过滤"""
        filtered = []
        version_tags_upper = [v.upper() for v in version_tags]
        
        for item in items:
            item_versions = [v.upper() for v in item.get("versions", [])]
            if any(v in version_tags_upper for v in item_versions):
                filtered.append(item)
        
        return filtered
    
    def _generate_suggestions(self, parsed: ParsedQuery) -> List[str]:
        """生成搜索建议"""
        suggestions = []
        
        # 基于意图的建议
        if parsed.intent == QueryIntent.WHY:
            suggestions.append("尝试搜索: 原因分析")
        elif parsed.intent == QueryIntent.HOW_TO:
            suggestions.append("尝试搜索: 解决方案")
        
        # 缺少版本信息
        if not parsed.version_filters:
            suggestions.append("可添加版本过滤: #V2605")
        
        return suggestions
    
    def explain_error_code(self, error_code: str) -> Dict:
        """
        解释错误代码
        
        Args:
            error_code: 错误代码
            
        Returns:
            错误解释
        """
        classification = self.error_parser.classify_error(error_code)
        knowledge = self.error_parser.get_error_knowledge(error_code)
        
        return {
            "error_code": error_code,
            "category": classification.get("category"),
            "description": classification.get("description"),
            "known_issue": knowledge
        }


def create_semantic_engine(knowledge_base: List[Dict] = None) -> SemanticSearchEngine:
    """创建语义搜索引擎"""
    return SemanticSearchEngine(knowledge_base)


__all__ = [
    "SemanticSearchEngine",
    "create_semantic_engine",
    "SemanticAnalyzer",
    "SynonymExpander",
    "ErrorCodeParser",
    "ComboSearchEngine"
]
