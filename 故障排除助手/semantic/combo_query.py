"""
组合查询器 - 支持多条件组合查询
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import re


@dataclass
class QueryCondition:
    """查询条件"""
    field: str           # 字段名
    operator: str        # 操作符 (eq, contains, gt, lt, in)
    value: any           # 值


class ComboQueryBuilder:
    """
    组合查询构建器
    
    支持的多条件格式：
    - "模块=供应商 AND 版本=#V2605"
    - "发票 AND 匹配 AND 失败"
    - "供应商 登录 失败 #V2605"
    """
    
    # 字段映射
    FIELD_MAP = {
        "模块": ["module", "category", "分类"],
        "分类": ["category", "class"],
        "状态": ["status", "state"],
        "版本": ["version", "versions"],
        "标签": ["tags", "tag"],
        "来源": ["source"],
        "ID": ["id"],
    }
    
    # 操作符映射
    OPERATOR_MAP = {
        "=": "eq",
        "==": "eq",
        "!=": "ne",
        ">": "gt",
        "<": "lt",
        ">=": "ge",
        "<=": "le",
        "包含": "contains",
        "包含": "contains",
        "in": "in",
    }
    
    def __init__(self):
        self.field_map = self.FIELD_MAP.copy()
    
    def parse_conditions(self, query: str) -> List[QueryCondition]:
        """
        解析组合查询字符串
        
        Args:
            query: 查询字符串
            
        Returns:
            条件列表
        """
        conditions = []
        
        # 处理 "field=value" 格式
        patterns = [
            r'([\w]+)\s*=\s*([^\s]+)',  # 模块=供应商
            r'([\w]+)\s*==\s*([^\s]+)', # 模块==供应商
            r'([\w]+)\s*!=\s*([^\s]+)', # 模块!=供应商
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, query)
            for field_raw, value in matches:
                field = self._normalize_field(field_raw)
                if field:
                    op = self.OPERATOR_MAP.get(pattern[-2:-1].replace(" ", ""), "eq")
                    conditions.append(QueryCondition(
                        field=field,
                        operator=op,
                        value=value.strip()
                    ))
        
        # 处理关键词形式
        keywords = self._extract_keywords(query)
        return conditions, keywords
    
    def _normalize_field(self, field_raw: str) -> Optional[str]:
        """标准化字段名"""
        field_lower = field_raw.lower()
        
        for canonical, variants in self.field_map.items():
            if field_lower in [v.lower() for v in variants]:
                return variants[0]
        
        return None
    
    def _extract_keywords(self, query: str) -> List[str]:
        """提取关键词"""
        # 移除版本标签
        text = re.sub(r'#V\w+', '', query)
        # 移除field=value
        text = re.sub(r'\w+\s*=\s*\w+', '', text)
        
        import jieba
        words = jieba.cut(text)
        return [w for w in words if len(w) >= 2]
    
    def build_query(
        self,
        keywords: List[str] = None,
        conditions: List[QueryCondition] = None,
        version_tags: List[str] = None
    ) -> Dict:
        """
        构建查询对象
        
        Args:
            keywords: 关键词列表
            conditions: 条件列表
            version_tags: 版本标签
            
        Returns:
            查询字典
        """
        query = {
            "keywords": keywords or [],
            "conditions": [],
            "version_tags": version_tags or []
        }
        
        if conditions:
            for cond in conditions:
                query["conditions"].append({
                    "field": cond.field,
                    "operator": cond.operator,
                    "value": cond.value
                })
        
        return query


class ComboSearchEngine:
    """组合搜索引擎"""
    
    def __init__(self, knowledge_base: List[Dict] = None):
        self.knowledge_base = knowledge_base or []
        self.query_builder = ComboQueryBuilder()
    
    def search(
        self,
        query: str,
        version_tags: List[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        执行组合搜索
        
        Args:
            query: 查询字符串
            version_tags: 版本过滤
            limit: 结果数量
            
        Returns:
            搜索结果
        """
        conditions, keywords = self.query_builder.parse_conditions(query)
        
        results = []
        for item in self.knowledge_base:
            # 版本过滤
            if version_tags:
                item_versions = [v.upper() for v in item.get("versions", [])]
                required = [v.upper() for v in version_tags]
                if not any(v in required for v in item_versions):
                    continue
            
            # 关键词匹配
            score = 0
            item_text = f"{item.get('title', '')} {item.get('description', '')} {item.get('solution', '')}".lower()
            
            for kw in keywords:
                if kw.lower() in item_text:
                    score += 10
            
            # 条件匹配
            cond_match = True
            for cond in conditions:
                field_value = str(item.get(cond.field, "")).lower()
                cond_value = cond.value.lower()
                
                if cond.operator == "eq" and field_value != cond_value:
                    cond_match = False
                elif cond.operator == "contains" and cond_value not in field_value:
                    cond_match = False
            
            if cond_match and score > 0:
                results.append({
                    "item": item,
                    "score": score,
                    "matched_keywords": [kw for kw in keywords if kw.lower() in item_text]
                })
        
        # 排序
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]


__all__ = ["ComboQueryBuilder", "ComboSearchEngine", "QueryCondition"]
