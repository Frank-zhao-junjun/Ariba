"""
语义理解模块 - 自然语言查询解析和意图识别
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class QueryIntent(Enum):
    """查询意图类型"""
    UNKNOWN = "unknown"
    SEARCH = "search"                    # 搜索故障
    HOW_TO = "how_to"                   # 如何解决
    WHY = "why"                          # 为什么出错
    ERROR_LOOKUP = "error_lookup"       # 错误代码查询
    TROUBLESHOOT = "troubleshoot"       # 故障排除
    COMPARE = "compare"                 # 比较
    RECENT = "recent"                   # 最近问题


class QueryType(Enum):
    """查询类型"""
    KEYWORD = "keyword"                 # 关键词查询
    NATURAL_LANGUAGE = "natural"        # 自然语言
    ERROR_CODE = "error_code"           # 错误代码
    MULTI_CONDITION = "multi"          # 多条件


@dataclass
class ParsedQuery:
    """解析后的查询"""
    original: str
    intent: QueryIntent = QueryIntent.UNKNOWN
    query_type: QueryType = QueryType.KEYWORD
    keywords: List[str] = field(default_factory=list)
    extracted_errors: List[str] = field(default_factory=list)
    version_filters: List[str] = field(default_factory=list)
    conditions: Dict = field(default_factory=dict)
    synonyms: List[str] = field(default_factory=list)


class SemanticAnalyzer:
    """
    语义分析器
    
    功能：
    - 意图识别
    - 自然语言解析
    - 关键词提取
    - 错误代码识别
    - 版本标签提取
    """
    
    # 意图关键词
    INTENT_PATTERNS = {
        QueryIntent.SEARCH: ["搜索", "查找", "查询", "找", "search", "find", "look"],
        QueryIntent.HOW_TO: ["如何", "怎么办", "怎么解决", "how to", "how do", "solve", "fix"],
        QueryIntent.WHY: ["为什么", "原因", "why", "reason", "cause"],
        QueryIntent.ERROR_LOOKUP: ["错误", "报错", "error", "err"],
        QueryIntent.TROUBLESHOOT: ["排除", "诊断", "troubleshoot", "debug", "诊断"],
        QueryIntent.RECENT: ["最近", "新", "latest", "recent", "new"],
    }
    
    # 版本标签模式
    VERSION_PATTERNS = [
        r'#V(\d{4})',
        r'#V(NextGen|Classic|Next)',
        r'V(\d{4})版本',
        r'版本(V\d{4})',
    ]
    
    # 条件连接词
    CONDITION_CONNECTORS = ["和", "与", "以及", "或", "或者", "and", "or"]
    
    def __init__(self):
        self.intent_patterns = self.INTENT_PATTERNS.copy()
    
    def parse(self, query: str) -> ParsedQuery:
        """
        解析自然语言查询
        
        Args:
            query: 原始查询
            
        Returns:
            ParsedQuery对象
        """
        result = ParsedQuery(original=query)
        
        # 1. 识别意图
        result.intent = self._identify_intent(query)
        
        # 2. 判断查询类型
        result.query_type = self._identify_type(query)
        
        # 3. 提取关键词
        result.keywords = self._extract_keywords(query)
        
        # 4. 提取错误代码
        result.extracted_errors = self._extract_error_codes(query)
        
        # 5. 提取版本标签
        result.version_filters = self._extract_version_tags(query)
        
        # 6. 解析条件
        result.conditions = self._parse_conditions(query)
        
        return result
    
    def _identify_intent(self, query: str) -> QueryIntent:
        """识别查询意图"""
        query_lower = query.lower()
        scores = {}
        
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if pattern.lower() in query_lower:
                    score += 1
            scores[intent] = score
        
        if scores:
            best_intent = max(scores.items(), key=lambda x: x[1])
            if best_intent[1] > 0:
                return best_intent[0]
        
        return QueryIntent.SEARCH
    
    def _identify_type(self, query: str) -> QueryType:
        """判断查询类型"""
        # 错误代码
        if re.search(r'[A-Z]+-\d+', query, re.IGNORECASE):
            return QueryType.ERROR_CODE
        
        # 多条件查询
        condition_count = sum(query.count(c) for c in self.CONDITION_CONNECTORS)
        if condition_count >= 2:
            return QueryType.MULTI_CONDITION
        
        # 自然语言特征
        nl_indicators = ["为什么", "如何", "怎么", "什么", "how", "why", "what"]
        if any(ind in query.lower() for ind in nl_indicators):
            return QueryType.NATURAL_LANGUAGE
        
        return QueryType.KEYWORD
    
    def _extract_keywords(self, query: str) -> List[str]:
        """提取关键词"""
        # 移除版本标签
        text = re.sub(r'#V\w+', '', query)
        
        # 移除错误代码
        text = re.sub(r'[A-Z]+-\d+', '', text)
        
        # 分词
        import jieba
        words = jieba.cut(text)
        
        # 过滤停用词
        stopwords = {"的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一", "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有", "看", "好", "自己", "这"}
        keywords = [w for w in words if len(w) >= 2 and w not in stopwords]
        
        return list(set(keywords))
    
    def _extract_error_codes(self, query: str) -> List[str]:
        """提取错误代码"""
        from .error_parser import error_parser
        return error_parser.extract_error_codes(query)
    
    def _extract_version_tags(self, query: str) -> List[str]:
        """提取版本标签"""
        versions = []
        
        # #V格式
        v_tags = re.findall(r'#V(\w+)', query, re.IGNORECASE)
        for v in v_tags:
            v_upper = v.upper()
            if v_upper == "NEXT" or v_upper == "NEXTGEN":
                versions.append("#VNextGen")
            elif v_upper == "CLASSIC":
                versions.append("#VClassic")
            elif v_upper.isdigit() and len(v_upper) == 4:
                versions.append(f"#V{v_upper}")
        
        # 文字描述
        if "next" in query.lower() and "gen" in query.lower():
            versions.append("#VNextGen")
        if "classic" in query.lower():
            versions.append("#VClassic")
        
        return list(set(versions))
    
    def _parse_conditions(self, query: str) -> Dict:
        """解析多条件"""
        conditions = {}
        
        # 模块条件
        modules = ["供应商", "审批", "发票", "合同", "目录", "预算", "采购"]
        for module in modules:
            if module in query:
                conditions["module"] = module
                break
        
        # 状态条件
        if "失败" in query or "错误" in query or "failed" in query.lower():
            conditions["status"] = "failed"
        elif "卡住" in query or "stuck" in query.lower():
            conditions["status"] = "stuck"
        elif "超时" in query or "timeout" in query.lower():
            conditions["status"] = "timeout"
        
        return conditions
    
    def get_search_terms(self, parsed: ParsedQuery) -> List[str]:
        """获取搜索词列表"""
        terms = parsed.keywords.copy()
        
        # 添加错误代码
        terms.extend(parsed.extracted_errors)
        
        # 添加条件值
        if parsed.conditions.get("module"):
            terms.append(parsed.conditions["module"])
        if parsed.conditions.get("status"):
            terms.append(parsed.conditions["status"])
        
        return list(set(terms))


# 全局实例
semantic_analyzer = SemanticAnalyzer()


__all__ = [
    "SemanticAnalyzer",
    "semantic_analyzer",
    "QueryIntent",
    "QueryType",
    "ParsedQuery"
]
