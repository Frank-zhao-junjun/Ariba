"""
版本标签统一工具
提供跨模块的版本标签标准化处理
"""

from typing import List, Set, Optional
import re

# 统一版本格式：#VXXXX
SUPPORTED_VERSIONS = {"#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"}

# 版本优先级（数值越大优先级越高）
VERSION_PRIORITY = {"#VClassic": 0, "#V2505": 1, "#V2602": 2, "#V2604": 3, "#V2605": 4, "#VNextGen": 5}


def normalize_version(version: str) -> str:
    """
    规范化版本标签为标准格式 #VXXXX
    
    Args:
        version: 原始版本标签
        
    Returns:
        规范化后的版本标签（标准格式 #VXXXX）
    """
    if not version:
        return ""
    
    version = version.strip().upper()
    
    # 如果已有#前缀，直接返回大写
    if version.startswith("#"):
        return version
    
    # 处理变体格式
    variants = {
        "V2505": "#V2505",
        "2605": "#V2605",
        "V2602": "#V2602",
        "2602": "#V2602",
        "V2604": "#V2604",
        "2604": "#V2604",
        "V2605": "#V2605",
        "V2505": "#V2505",
        "NEXTGEN": "#VNextGen",
        "NEXT": "#VNextGen",
        "VNextGen": "#VNextGen",
        "CLASSIC": "#VClassic",
        "LEGACY": "#VClassic",
        "VCLASSIC": "#VClassic",
    }
    
    # 尝试匹配变体
    for key, value in variants.items():
        if version == key or version == key.upper():
            return value
    
    # 如果是纯数字年份
    if version.isdigit():
        year = int(version)
        if 2025 <= year <= 2699:
            return f"#V{year}"
    
    # 默认添加#前缀
    return f"#{version}" if not version.startswith("#") else version


def parse_version_tags(version_string: str) -> List[str]:
    """
    从字符串中解析版本标签
    
    Args:
        version_string: 包含版本标签的字符串
        
    Returns:
        解析出的版本标签列表
    """
    if not version_string:
        return []
    
    pattern = r'#?V?\w+'
    matches = re.findall(pattern, version_string.upper())
    return list(set(normalize_version(m) for m in matches if m))


def is_version_supported(version: str) -> bool:
    """
    检查版本是否支持
    
    Args:
        version: 版本标签
        
    Returns:
        是否支持该版本
    """
    return normalize_version(version) in SUPPORTED_VERSIONS


def compare_versions(v1: str, v2: str) -> int:
    """
    比较两个版本的优先级
    
    Args:
        v1: 版本1
        v2: 版本2
        
    Returns:
        -1: v1 < v2
         0: v1 == v2
         1: v1 > v2
    """
    nv1 = normalize_version(v1)
    nv2 = normalize_version(v2)
    
    p1 = VERSION_PRIORITY.get(nv1, -1)
    p2 = VERSION_PRIORITY.get(nv2, -1)
    
    if p1 < p2:
        return -1
    elif p1 > p2:
        return 1
    else:
        return 0


def filter_by_versions(items: List[dict], required_versions: List[str], 
                       match_mode: str = "any", version_field: str = "versions") -> List[dict]:
    """
    按版本过滤项目列表
    
    Args:
        items: 项目列表
        required_versions: 需要的版本列表
        match_mode: 匹配模式，"any"表示任意匹配，"all"表示全部匹配
        version_field: 版本字段名
        
    Returns:
        过滤后的项目列表
    """
    if not required_versions:
        return items
    
    # 规范化需求版本
    required = set(normalize_version(v) for v in required_versions)
    
    filtered = []
    for item in items:
        # 获取项目的版本字段
        item_versions_raw = item.get(version_field, [])
        
        # 处理可能的字符串格式（用逗号分隔）
        if isinstance(item_versions_raw, str):
            item_versions_raw = [v.strip() for v in item_versions_raw.split(",")]
        
        item_versions = set(normalize_version(v) for v in item_versions_raw)
        
        if match_mode == "any":
            # 任意一个版本匹配即可
            if item_versions & required:  # 交集非空
                filtered.append(item)
        elif match_mode == "all":
            # 所有需要的版本都要匹配
            if required <= item_versions:  # required是item_versions的子集
                filtered.append(item)
    
    return filtered


class VersionUtils:
    """版本工具类（面向对象接口）"""
    
    def __init__(self):
        self.supported_versions = SUPPORTED_VERSIONS.copy()
        self.priority = VERSION_PRIORITY.copy()
    
    def normalize(self, version: str) -> str:
        """规范化版本"""
        return normalize_version(version)
    
    def parse(self, version_string: str) -> List[str]:
        """解析版本标签"""
        return parse_version_tags(version_string)
    
    def is_supported(self, version: str) -> bool:
        """检查版本支持"""
        return is_version_supported(version)
    
    def compare(self, v1: str, v2: str) -> int:
        """比较版本"""
        return compare_versions(v1, v2)
    
    def filter(self, items: List[dict], required_versions: List[str],
               match_mode: str = "any", version_field: str = "versions") -> List[dict]:
        """过滤项目"""
        return filter_by_versions(items, required_versions, match_mode, version_field)


# 全局实例
version_utils = VersionUtils()

__all__ = [
    "SUPPORTED_VERSIONS",
    "VERSION_PRIORITY",
    "normalize_version",
    "parse_version_tags",
    "is_version_supported",
    "compare_versions",
    "filter_by_versions",
    "VersionUtils",
    "version_utils"
]
