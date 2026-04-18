"""
知识去重模块
识别和合并重复的知识条目
"""

from typing import List, Dict, Set, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict
import re
import hashlib
import json
from difflib import SequenceMatcher


class DeduplicationStrategy(Enum):
    """去重策略"""
    EXACT = "exact"           # 精确匹配
    SIMILAR_TITLE = "similar_title"  # 相似标题
    SIMILAR_CONTENT = "similar_content"  # 相似内容
    FUZZY = "fuzzy"          # 模糊匹配


@dataclass
class DeduplicationResult:
    """去重结果"""
    total_items: int
    duplicate_groups: List[Set[str]]  # 重复组，每组包含重复项的ID
    removed_count: int
    merged_items: List[Dict]  # 合并后的知识项
    statistics: Dict[str, int] = field(default_factory=dict)


@dataclass
class SimilarityPair:
    """相似度配对"""
    id1: str
    id2: str
    similarity: float
    match_type: str


class KnowledgeDeduplicator:
    """知识去重器"""
    
    def __init__(
        self,
        strategy: DeduplicationStrategy = DeduplicationStrategy.SIMILAR_TITLE,
        title_threshold: float = 0.85,
        content_threshold: float = 0.75,
        exact_match_fields: Optional[List[str]] = None
    ):
        self.strategy = strategy
        self.title_threshold = title_threshold
        self.content_threshold = content_threshold
        self.exact_match_fields = exact_match_fields or ["title"]
        self._cache: Dict[str, float] = {}
    
    def deduplicate(self, items: List[Dict]) -> DeduplicationResult:
        """
        执行知识去重
        
        Args:
            items: 知识项列表
            
        Returns:
            去重结果
        """
        # 第一步：精确匹配去重
        exact_duplicates = self._find_exact_duplicates(items)
        
        # 第二步：相似度去重
        similar_duplicates = self._find_similar_duplicates(items)
        
        # 合并结果
        all_duplicates = self._merge_duplicate_groups(exact_duplicates, similar_duplicates)
        
        # 生成合并后的项
        merged_items = self._merge_duplicate_items(items, all_duplicates)
        
        # 统计
        removed_count = sum(len(group) - 1 for group in all_duplicates)
        
        return DeduplicationResult(
            total_items=len(items),
            duplicate_groups=all_duplicates,
            removed_count=removed_count,
            merged_items=merged_items,
            statistics={
                "exact_groups": len(exact_duplicates),
                "similar_groups": len(similar_duplicates),
                "total_groups": len(all_duplicates),
                "removed_items": removed_count
            }
        )
    
    def _find_exact_duplicates(self, items: List[Dict]) -> List[Set[str]]:
        """查找精确重复项"""
        groups = []
        seen: Dict[str, str] = {}  # 签名 -> ID
        
        for item in items:
            signature = self._generate_signature(item, self.exact_match_fields)
            
            if signature in seen:
                # 找到重复
                found = False
                for group in groups:
                    if seen[signature] in group:
                        group.add(item.get("id", ""))
                        found = True
                        break
                if not found:
                    groups.append({seen[signature], item.get("id", "")})
            else:
                seen[signature] = item.get("id", "")
        
        return groups
    
    def _find_similar_duplicates(self, items: List[Dict]) -> List[Set[str]]:
        """查找相似重复项"""
        if self.strategy == DeduplicationStrategy.EXACT:
            return []
        
        similar_pairs = []
        n = len(items)
        
        # 使用缓存优化
        cache_key = self._generate_items_hash(items)
        if cache_key in self._cache:
            cached_pairs = self._cache[cache_key]
            return self._pairs_to_groups(cached_pairs)
        
        # 逐对比较
        for i in range(n):
            for j in range(i + 1, n):
                similarity, match_type = self._calculate_similarity(items[i], items[j])
                
                threshold = self.title_threshold if match_type == "title" else self.content_threshold
                
                if similarity >= threshold:
                    similar_pairs.append(SimilarityPair(
                        id1=items[i].get("id", f"item_{i}"),
                        id2=items[j].get("id", f"item_{j}"),
                        similarity=similarity,
                        match_type=match_type
                    ))
        
        # 缓存结果
        self._cache[cache_key] = similar_pairs
        
        return self._pairs_to_groups(similar_pairs)
    
    def _pairs_to_groups(self, pairs: List[SimilarityPair]) -> List[Set[str]]:
        """将配对转换为组"""
        groups = []
        id_to_group = {}
        
        for pair in pairs:
            id1, id2 = pair.id1, pair.id2
            
            if id1 in id_to_group and id2 in id_to_group:
                # 两个ID都已分组，合并组
                group1 = id_to_group[id1]
                group2 = id_to_group[id2]
                if group1 != group2:
                    group1.update(group2)
                    groups.remove(group2)
                    for item_id in group2:
                        id_to_group[item_id] = group1
            elif id1 in id_to_group:
                # 只有id1已分组
                id_to_group[id1].add(id2)
                id_to_group[id2] = id_to_group[id1]
            elif id2 in id_to_group:
                # 只有id2已分组
                id_to_group[id2].add(id1)
                id_to_group[id1] = id_to_group[id2]
            else:
                # 两者都未分组，创建新组
                new_group = {id1, id2}
                groups.append(new_group)
                id_to_group[id1] = new_group
                id_to_group[id2] = new_group
        
        return groups
    
    def _merge_duplicate_groups(
        self, 
        exact_groups: List[Set[str]], 
        similar_groups: List[Set[str]]
    ) -> List[Set[str]]:
        """合并精确和相似重复组"""
        groups = exact_groups.copy()
        
        for similar_group in similar_groups:
            merged = False
            for i, group in enumerate(groups):
                if group & similar_group:  # 有交集
                    group.update(similar_group)
                    merged = True
                    break
            
            if not merged:
                groups.append(similar_group)
        
        return groups
    
    def _merge_duplicate_items(
        self, 
        items: List[Dict], 
        duplicate_groups: List[Set[str]]
    ) -> List[Dict]:
        """合并重复项"""
        # 创建ID到项的映射
        item_map = {item.get("id", str(i)): item for i, item in enumerate(items)}
        
        # 保留项ID集合
        keep_ids = set()
        for group in duplicate_groups:
            # 保留组中第一个（通常是较完整的项）
            keep_ids.add(next(iter(group)))
        
        # 添加不重复的项
        for i, item in enumerate(items):
            item_id = item.get("id", str(i))
            if item_id not in keep_ids:
                # 检查是否属于某个重复组
                in_group = any(item_id in group for group in duplicate_groups)
                if not in_group:
                    keep_ids.add(item_id)
        
        # 生成合并后的列表
        merged = []
        for item_id in keep_ids:
            if item_id in item_map:
                merged.append(item_map[item_id])
        
        return merged
    
    def _generate_signature(self, item: Dict, fields: List[str]) -> str:
        """生成签名用于精确匹配"""
        parts = []
        for field in fields:
            value = item.get(field, "")
            parts.append(str(value).lower().strip())
        return hashlib.md5("|".join(parts).encode()).hexdigest()
    
    def _calculate_similarity(self, item1: Dict, item2: Dict) -> Tuple[float, str]:
        """计算两项的相似度"""
        # 标题相似度
        title1 = item1.get("title", "")
        title2 = item2.get("title", "")
        title_sim = self._string_similarity(title1, title2)
        
        if title_sim >= self.title_threshold:
            return title_sim, "title"
        
        # 内容相似度
        content1 = self._get_content(item1)
        content2 = self._get_content(item2)
        content_sim = self._string_similarity(content1, content2)
        
        return max(title_sim, content_sim), "content"
    
    def _string_similarity(self, s1: str, s2: str) -> float:
        """计算字符串相似度"""
        if not s1 or not s2:
            return 0.0
        
        # 归一化
        s1 = self._normalize_text(s1)
        s2 = self._normalize_text(s2)
        
        if s1 == s2:
            return 1.0
        
        return SequenceMatcher(None, s1, s2).ratio()
    
    def _normalize_text(self, text: str) -> str:
        """归一化文本"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _get_content(self, item: Dict) -> str:
        """获取内容用于比较"""
        parts = [
            item.get("description", ""),
            item.get("solution", ""),
        ]
        return " ".join(parts)
    
    def _generate_items_hash(self, items: List[Dict]) -> str:
        """生成项列表哈希"""
        content = json.dumps(items, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()
    
    def analyze_duplicates(self, items: List[Dict]) -> Dict[str, Any]:
        """
        分析重复情况
        
        Returns:
            分析报告
        """
        result = self.deduplicate(items)
        
        return {
            "total_items": result.total_items,
            "duplicate_groups_count": len(result.duplicate_groups),
            "duplicate_items_count": result.removed_count,
            "duplicate_rate": result.removed_count / result.total_items if result.total_items > 0 else 0,
            "groups": [
                {
                    "ids": list(group),
                    "size": len(group)
                }
                for group in result.duplicate_groups
            ]
        }


# 便捷函数
def deduplicate_knowledge(items: List[Dict]) -> DeduplicationResult:
    """快速去重函数"""
    deduplicator = KnowledgeDeduplicator()
    return deduplicator.deduplicate(items)
