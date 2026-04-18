"""
版本标签管理模块
完善和优化知识条目的版本标签
"""

from typing import List, Dict, Set, Optional, Tuple
from dataclasses import dataclass, field
from collections import Counter, defaultdict
import re
import json


@dataclass
class VersionAnalysis:
    """版本分析结果"""
    total_items: int
    items_with_version: int     # 有版本标签的项数
    items_without_version: int  # 无版本标签的项数
    coverage_rate: float        # 版本覆盖率
    version_distribution: Dict[str, int]  # 各版本出现次数
    items_without_tags: List[str]  # 缺少版本标签的项ID
    suggested_versions: Dict[str, List[str]]  # 建议为各项目添加的版本


@dataclass
class VersionSuggestion:
    """版本建议"""
    item_id: str
    current_versions: List[str]
    suggested_versions: List[str]
    reason: str
    confidence: float


# SAP Ariba 支持的版本
SUPPORTED_VERSIONS = [
    "#V2505", "#V2602", "#V2604", "#V2605", 
    "#VNextGen", "#VClassic", "#V2311", "#V2402"
]

# 版本别名映射
VERSION_ALIASES = {
    "v2505": "#V2505",
    "v2602": "#V2602",
    "v2604": "#V2604",
    "v2605": "#V2605",
    "vnextgen": "#VNextGen",
    "vnext": "#VNextGen",
    "vclassic": "#VClassic",
    "classic": "#VClassic",
    "v2311": "#V2311",
    "v2402": "#V2402",
    "nextgen": "#VNextGen",
}

# 版本兼容性映射
VERSION_COMPATIBILITY = {
    "#VNextGen": ["所有版本", "最新版本", "新功能"],
    "#VClassic": ["经典版", "旧版本"],
    "#V2505": ["2505", "2025.05"],
    "#V2602": ["2602", "2026.02"],
    "#V2604": ["2604", "2026.04"],
    "#V2605": ["2605", "2026.05"],
}


class VersionManager:
    """版本管理器"""
    
    def __init__(
        self,
        supported_versions: Optional[List[str]] = None,
        default_version: str = "#VNextGen"
    ):
        self.supported_versions = supported_versions or SUPPORTED_VERSIONS
        self.default_version = default_version
        self._version_cache: Dict[str, str] = {}
    
    def normalize_version(self, version: str) -> str:
        """
        规范化版本号
        
        Args:
            version: 原始版本号
            
        Returns:
            规范化后的版本号
        """
        if not version:
            return ""
        
        version = version.strip()
        
        # 检查缓存
        if version in self._version_cache:
            return self._version_cache[version]
        
        # 已经是规范格式
        if version in self.supported_versions:
            self._version_cache[version] = version
            return version
        
        # 检查别名
        normalized = version.lower()
        if normalized in VERSION_ALIASES:
            result = VERSION_ALIASES[normalized]
            self._version_cache[version] = result
            return result
        
        # 尝试模糊匹配
        for supported in self.supported_versions:
            if self._fuzzy_match(version, supported):
                self._version_cache[version] = supported
                return supported
        
        return version
    
    def _fuzzy_match(self, version1: str, version2: str) -> bool:
        """模糊匹配"""
        v1 = re.sub(r'[^\w]', '', version1.lower())
        v2 = re.sub(r'[^\w]', '', version2.lower())
        return v1 in v2 or v2 in v1
    
    def analyze_versions(self, items: List[Dict]) -> VersionAnalysis:
        """
        分析知识库版本标签
        
        Args:
            items: 知识项列表
            
        Returns:
            版本分析结果
        """
        items_with_version = 0
        items_without_version = []
        version_counter = Counter()
        suggested_versions = {}
        
        for i, item in enumerate(items):
            item_id = item.get("id", f"item_{i}")
            versions = item.get("versions", [])
            
            # 规范化版本
            normalized_versions = [self.normalize_version(v) for v in versions]
            normalized_versions = [v for v in normalized_versions if v]
            
            if normalized_versions:
                items_with_version += 1
                for v in normalized_versions:
                    version_counter[v] += 1
            else:
                items_without_version.append(item_id)
                # 建议版本
                suggested = self._suggest_version(item)
                if suggested:
                    suggested_versions[item_id] = suggested
        
        total = len(items)
        coverage = items_with_version / total if total > 0 else 0
        
        return VersionAnalysis(
            total_items=total,
            items_with_version=items_with_version,
            items_without_version=items_without_version,
            coverage_rate=coverage,
            version_distribution=dict(version_counter),
            items_without_tags=items_without_version,
            suggested_versions=suggested_versions
        )
    
    def _suggest_version(self, item: Dict) -> List[str]:
        """为项目建议版本"""
        suggestions = []
        
        # 基于内容分析
        content = self._get_content(item)
        content_lower = content.lower()
        
        # 检查是否提到特定版本
        for supported in self.supported_versions:
            version_num = supported.replace("#V", "").lower()
            
            # 检查版本号提及
            if version_num in content_lower or version_num.replace("v", "") in content_lower:
                suggestions.append(supported)
            
            # 检查兼容性关键词
            for keyword in VERSION_COMPATIBILITY.get(supported, []):
                if keyword.lower() in content_lower:
                    if supported not in suggestions:
                        suggestions.append(supported)
        
        # 如果没有找到特定版本，默认建议NextGen
        if not suggestions:
            suggestions = ["#VNextGen", "#VClassic"]
        
        return suggestions[:3]  # 最多返回3个建议
    
    def _get_content(self, item: Dict) -> str:
        """获取项目内容"""
        return " ".join([
            item.get("title", ""),
            item.get("description", ""),
            item.get("solution", ""),
            " ".join(item.get("tags", []))
        ])
    
    def suggest_missing_versions(self, items: List[Dict]) -> List[VersionSuggestion]:
        """
        建议缺失的版本标签
        
        Args:
            items: 知识项列表
            
        Returns:
            版本建议列表
        """
        suggestions = []
        
        for i, item in enumerate(items):
            item_id = item.get("id", f"item_{i}")
            current_versions = item.get("versions", [])
            
            # 规范化当前版本
            normalized_current = [self.normalize_version(v) for v in current_versions]
            normalized_current = [v for v in normalized_current if v]
            
            # 获取建议版本
            suggested = self._suggest_version(item)
            
            # 过滤已存在的版本
            new_suggestions = [v for v in suggested if v not in normalized_current]
            
            if new_suggestions:
                suggestions.append(VersionSuggestion(
                    item_id=item_id,
                    current_versions=normalized_current,
                    suggested_versions=new_suggestions,
                    reason="基于内容分析",
                    confidence=0.8
                ))
        
        return suggestions
    
    def apply_version_suggestions(
        self, 
        items: List[Dict], 
        suggestions: List[VersionSuggestion],
        mode: str = "append"  # "append" 或 "replace"
    ) -> List[Dict]:
        """
        应用版本建议
        
        Args:
            items: 原始知识项列表
            suggestions: 版本建议列表
            mode: "append"(追加) 或 "replace"(替换)
            
        Returns:
            应用建议后的知识项列表
        """
        # 构建建议映射
        suggestion_map = {s.item_id: s.suggested_versions for s in suggestions}
        
        result = []
        for item in items:
            item = item.copy()
            item_id = item.get("id", "")
            
            if item_id in suggestion_map:
                current = item.get("versions", [])
                
                if mode == "append":
                    # 追加新版本
                    new_versions = list(set(current + suggestion_map[item_id]))
                else:
                    # 替换
                    new_versions = suggestion_map[item_id]
                
                item["versions"] = new_versions
            
            result.append(item)
        
        return result
    
    def validate_versions(self, items: List[Dict]) -> Tuple[List[Dict], List[str]]:
        """
        验证版本标签
        
        Args:
            items: 知识项列表
            
        Returns:
            (有效项列表, 无效版本列表)
        """
        valid_items = []
        invalid_versions = []
        
        for item in items:
            item = item.copy()
            versions = item.get("versions", [])
            
            # 规范化版本
            normalized = [self.normalize_version(v) for v in versions]
            normalized = [v for v in normalized if v]
            
            # 检查是否有无法规范化的版本
            for v in versions:
                norm = self.normalize_version(v)
                if norm and norm not in self.supported_versions:
                    invalid_versions.append(f"{item.get('id')}: {v} -> {norm}")
            
            item["versions"] = normalized
            valid_items.append(item)
        
        return valid_items, invalid_versions
    
    def get_version_coverage_report(self, items: List[Dict]) -> Dict:
        """生成版本覆盖率报告"""
        analysis = self.analyze_versions(items)
        
        # 计算推荐版本分布
        recommendations = self.suggest_missing_versions(items)
        
        return {
            "summary": {
                "total_items": analysis.total_items,
                "items_with_version": analysis.items_with_version,
                "items_without_version": analysis.items_without_version,
                "coverage_rate": f"{analysis.coverage_rate:.1%}"
            },
            "version_distribution": analysis.version_distribution,
            "top_versions": dict(Counter(analysis.version_distribution).most_common(5)),
            "missing_coverage_items": analysis.items_without_tags[:10],
            "recommendations_count": len(recommendations)
        }
    
    def export_version_mapping(self) -> Dict:
        """导出版本映射表"""
        return {
            "supported_versions": self.supported_versions,
            "aliases": VERSION_ALIASES,
            "compatibility": VERSION_COMPATIBILITY
        }


# 便捷函数
def analyze_knowledge_versions(items: List[Dict]) -> VersionAnalysis:
    """快速版本分析函数"""
    manager = VersionManager()
    return manager.analyze_versions(items)


def suggest_missing_version_tags(items: List[Dict]) -> List[VersionSuggestion]:
    """快速建议缺失版本函数"""
    manager = VersionManager()
    return manager.suggest_missing_versions(items)
