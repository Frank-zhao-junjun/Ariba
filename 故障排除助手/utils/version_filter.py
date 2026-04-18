"""
SAP Ariba 版本标签过滤工具
"""
from typing import List, Set, Optional
import re

SUPPORTED_VERSIONS = {"#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"}
VERSION_PRIORITY = {"#VClassic": 0, "#V2505": 1, "#V2602": 2, "#V2604": 3, "#V2605": 4, "#VNextGen": 5}


class VersionFilter:
    def __init__(self):
        self.supported_versions = SUPPORTED_VERSIONS.copy()
        self.priority = VERSION_PRIORITY.copy()
    
    def normalize_version(self, version: str) -> str:
        version = version.strip()
        if not version.startswith("#"):
            version = "#" + version
        version = version.upper()
        variants = {"V2602": "#V2602", "2602": "#V2602", "V2604": "#V2604", "2604": "#V2604",
                    "V2605": "#V2605", "2605": "#V2605", "V2505": "#V2505", "2505": "#V2505",
                    "NEXTGEN": "#VNEXTGEN", "NEXT": "#VNEXTGEN", "CLASSIC": "#VCLASSIC", "LEGACY": "#VCLASSIC"}
        return variants.get(version.lstrip("#").upper(), version)
    
    def parse_version_tags(self, version_string: str) -> List[str]:
        pattern = r'#V\w+'
        matches = re.findall(pattern, version_string.upper())
        return list(set(self.normalize_version(m) for m in matches))
    
    def is_version_supported(self, version: str) -> bool:
        return self.normalize_version(version) in self.supported_versions
    
    def filter_by_versions(self, items: List[dict], required_versions: List[str], match_mode: str = "any") -> List[dict]:
        if not required_versions:
            return items
        required = [self.normalize_version(v) for v in required_versions]
        filtered = []
        for item in items:
            item_versions = [self.normalize_version(v) for v in item.get("versions", [])]
            if match_mode == "any":
                if any(v in required for v in item_versions):
                    filtered.append(item)
            elif match_mode == "all":
                if all(v in item_versions for v in required):
                    filtered.append(item)
        return filtered


version_filter = VersionFilter()

__all__ = ["VersionFilter", "version_filter", "SUPPORTED_VERSIONS", "VERSION_PRIORITY"]
