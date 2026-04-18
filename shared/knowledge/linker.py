"""
知识关联优化模块
自动发现和优化知识条目之间的关联关系
"""

from typing import List, Dict, Set, Optional, Tuple, Callable
from dataclasses import dataclass, field
from collections import defaultdict
import re


@dataclass
class LinkResult:
    """关联优化结果"""
    total_items: int
    existing_links: int      # 已有链接数
    suggested_links: int     # 新增建议链接数
    orphaned_items: List[str]  # 孤立项ID列表
    link_groups: List[Set[str]]  # 链接组（强关联项）
    statistics: Dict[str, int] = field(default_factory=dict)


@dataclass
class LinkSuggestion:
    """链接建议"""
    source_id: str
    target_id: str
    link_type: str           # "category", "solution", "tag", "semantic"
    confidence: float        # 置信度 0-1
    reason: str              # 关联原因


class KnowledgeLinker:
    """知识关联器"""
    
    def __init__(
        self,
        min_link_confidence: float = 0.6,
        enable_semantic_link: bool = True,
        max_links_per_item: int = 10
    ):
        self.min_link_confidence = min_link_confidence
        self.enable_semantic_link = enable_semantic_link
        self.max_links_per_item = max_links_per_item
    
    def optimize_links(self, items: List[Dict]) -> LinkResult:
        """
        优化知识关联
        
        Args:
            items: 知识项列表
            
        Returns:
            关联优化结果
        """
        # 统计已有链接
        existing_links = self._count_existing_links(items)
        
        # 发现新的潜在链接
        suggestions = self._discover_links(items)
        
        # 过滤低置信度链接
        suggestions = [s for s in suggestions if s.confidence >= self.min_link_confidence]
        
        # 限制每个项的链接数
        suggestions = self._limit_links_per_item(suggestions)
        
        # 识别孤立项
        linked_ids = set()
        for suggestion in suggestions:
            linked_ids.add(suggestion.source_id)
            linked_ids.add(suggestion.target_id)
        
        orphaned = [
            item.get("id", f"item_{i}") 
            for i, item in enumerate(items) 
            if item.get("id", f"item_{i}") not in linked_ids
            and not item.get("related_ids")
        ]
        
        # 生成链接组
        link_groups = self._find_strongly_connected_groups(suggestions)
        
        return LinkResult(
            total_items=len(items),
            existing_links=existing_links,
            suggested_links=len(suggestions),
            orphaned_items=orphaned,
            link_groups=link_groups,
            statistics={
                "existing_links": existing_links,
                "suggested_links": len(suggestions),
                "orphaned_items": len(orphaned),
                "link_groups": len(link_groups),
                "avg_links_per_item": len(suggestions) / len(items) if items else 0
            }
        )
    
    def get_link_suggestions(self, items: List[Dict]) -> List[LinkSuggestion]:
        """获取所有链接建议"""
        suggestions = self._discover_links(items)
        return [s for s in suggestions if s.confidence >= self.min_link_confidence]
    
    def _count_existing_links(self, items: List[Dict]) -> int:
        """统计已有链接数"""
        count = 0
        for item in items:
            related = item.get("related_ids", [])
            if isinstance(related, list):
                count += len(related)
        return count
    
    def _discover_links(self, items: List[Dict]) -> List[LinkSuggestion]:
        """发现潜在链接"""
        suggestions = []
        n = len(items)
        
        # 按类别分组
        category_groups = self._group_by_category(items)
        
        # 按标签分组
        tag_groups = self._group_by_tags(items)
        
        # 按解决方案相似性分组
        solution_groups = self._group_by_solution_similarity(items)
        
        for i in range(n):
            item = items[i]
            item_id = item.get("id", f"item_{i}")
            
            # 类别关联
            category = item.get("category", "")
            for j, other in enumerate(items):
                if i >= j:
                    continue
                
                other_id = other.get("id", f"item_{j}")
                
                # 检查是否已有链接
                if other_id in item.get("related_ids", []):
                    continue
                
                # 1. 类别关联
                if category == other.get("category"):
                    suggestions.append(LinkSuggestion(
                        source_id=item_id,
                        target_id=other_id,
                        link_type="category",
                        confidence=0.8,
                        reason=f"同类别: {category}"
                    ))
                
                # 2. 标签关联
                common_tags = set(item.get("tags", [])) & set(other.get("tags", []))
                if common_tags:
                    confidence = min(0.5 + 0.1 * len(common_tags), 0.95)
                    suggestions.append(LinkSuggestion(
                        source_id=item_id,
                        target_id=other_id,
                        link_type="tag",
                        confidence=confidence,
                        reason=f"共同标签: {', '.join(common_tags)}"
                    ))
                
                # 3. 解决方案关联
                if other_id in solution_groups.get(item_id, set()):
                    suggestions.append(LinkSuggestion(
                        source_id=item_id,
                        target_id=other_id,
                        link_type="solution",
                        confidence=0.75,
                        reason="解决方案相关"
                    ))
                
                # 4. 语义关联
                if self.enable_semantic_link:
                    sem_conf = self._calculate_semantic_similarity(item, other)
                    if sem_conf >= self.min_link_confidence:
                        suggestions.append(LinkSuggestion(
                            source_id=item_id,
                            target_id=other_id,
                            link_type="semantic",
                            confidence=sem_conf,
                            reason="语义相关"
                        ))
        
        return suggestions
    
    def _group_by_category(self, items: List[Dict]) -> Dict[str, List[str]]:
        """按类别分组"""
        groups = defaultdict(list)
        for item in items:
            category = item.get("category", "unknown")
            groups[category].append(item.get("id", ""))
        return dict(groups)
    
    def _group_by_tags(self, items: List[Dict]) -> Dict[str, Set[str]]:
        """按标签分组"""
        tag_to_items = defaultdict(set)
        
        for item in items:
            item_id = item.get("id", "")
            for tag in item.get("tags", []):
                tag_to_items[tag].add(item_id)
        
        return dict(tag_to_items)
    
    def _group_by_solution_similarity(self, items: List[Dict]) -> Dict[str, Set[str]]:
        """按解决方案相似性分组"""
        groups = defaultdict(set)
        
        for i, item1 in enumerate(items):
            sol1 = self._normalize_text(item1.get("solution", ""))
            sol1_keywords = set(re.findall(r'\w+', sol1))
            
            for j, item2 in enumerate(items):
                if i >= j:
                    continue
                
                sol2 = self._normalize_text(item2.get("solution", ""))
                sol2_keywords = set(re.findall(r'\w+', sol2))
                
                # 计算Jaccard相似度
                intersection = sol1_keywords & sol2_keywords
                union = sol1_keywords | sol2_keywords
                
                if union and len(intersection) / len(union) >= 0.3:
                    groups[item1.get("id", f"item_{i}")].add(item2.get("id", f"item_{j}"))
                    groups[item2.get("id", f"item_{j}")].add(item1.get("id", f"item_{i}"))
        
        return dict(groups)
    
    def _calculate_semantic_similarity(self, item1: Dict, item2: Dict) -> float:
        """计算语义相似度"""
        # 基于标题关键词
        title1 = set(re.findall(r'\w+', self._normalize_text(item1.get("title", ""))))
        title2 = set(re.findall(r'\w+', self._normalize_text(item2.get("title", ""))))
        
        if title1 & title2:
            jaccard = len(title1 & title2) / len(title1 | title2)
            return 0.5 + 0.5 * jaccard
        
        return 0.0
    
    def _normalize_text(self, text: str) -> str:
        """归一化文本"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _limit_links_per_item(
        self, 
        suggestions: List[LinkSuggestion]
    ) -> List[LinkSuggestion]:
        """限制每个项的链接数"""
        item_links = defaultdict(list)
        
        for suggestion in suggestions:
            item_links[suggestion.source_id].append(suggestion)
            item_links[suggestion.target_id].append(suggestion)
        
        result = []
        for item_id, links in item_links.items():
            # 按置信度排序
            sorted_links = sorted(links, key=lambda x: -x.confidence)
            
            # 取前N个
            result.extend(sorted_links[:self.max_links_per_item])
        
        # 去重
        seen = set()
        unique = []
        for link in result:
            key = tuple(sorted([link.source_id, link.target_id]))
            if key not in seen:
                seen.add(key)
                unique.append(link)
        
        return unique
    
    def _find_strongly_connected_groups(
        self, 
        suggestions: List[LinkSuggestion]
    ) -> List[Set[str]]:
        """查找强连通分量（链接组）"""
        # 构建邻接表
        graph = defaultdict(set)
        for s in suggestions:
            if s.confidence >= 0.8:  # 高置信度链接
                graph[s.source_id].add(s.target_id)
                graph[s.target_id].add(s.source_id)
        
        # 简单的连通分量查找
        visited = set()
        groups = []
        
        def dfs(node: str, group: Set[str]):
            if node in visited:
                return
            visited.add(node)
            group.add(node)
            for neighbor in graph.get(node, set()):
                dfs(neighbor, group)
        
        for node in graph:
            if node not in visited:
                group = set()
                dfs(node, group)
                if len(group) > 1:  # 只返回多于1个节点的组
                    groups.append(group)
        
        return groups
    
    def apply_suggestions(
        self, 
        items: List[Dict], 
        suggestions: List[LinkSuggestion]
    ) -> List[Dict]:
        """
        应用链接建议到知识项
        
        Args:
            items: 原始知识项列表
            suggestions: 链接建议列表
            
        Returns:
            应用建议后的知识项列表
        """
        # 构建ID到项的映射
        item_map = {item.get("id", f"item_{i}"): item.copy() 
                    for i, item in enumerate(items)}
        
        # 应用建议
        for suggestion in suggestions:
            if suggestion.source_id in item_map:
                related = item_map[suggestion.source_id].setdefault("related_ids", [])
                if suggestion.target_id not in related:
                    related.append(suggestion.target_id)
        
        return list(item_map.values())
    
    def generate_link_report(self, items: List[Dict]) -> Dict:
        """生成链接分析报告"""
        result = self.optimize_links(items)
        
        return {
            "summary": {
                "total_items": result.total_items,
                "existing_links": result.existing_links,
                "suggested_new_links": result.suggested_links,
                "orphaned_items": len(result.orphaned_items),
                "link_groups": len(result.link_groups)
            },
            "orphaned_items": result.orphaned_items,
            "link_groups": [list(g) for g in result.link_groups],
            "statistics": result.statistics
        }


# 便捷函数
def optimize_knowledge_links(items: List[Dict]) -> LinkResult:
    """快速优化链接函数"""
    linker = KnowledgeLinker()
    return linker.optimize_links(items)
