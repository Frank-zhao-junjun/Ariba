"""
知识库管理模块
提供知识去重、关联优化、版本标签和搜索优化功能
"""

from .deduplicator import KnowledgeDeduplicator, DeduplicationResult
from .linker import KnowledgeLinker, LinkResult
from .version_manager import VersionManager, VersionAnalysis
from .search_optimizer import SearchOptimizer, SearchMetrics

__all__ = [
    "KnowledgeDeduplicator",
    "DeduplicationResult",
    "KnowledgeLinker", 
    "LinkResult",
    "VersionManager",
    "VersionAnalysis",
    "SearchOptimizer",
    "SearchMetrics",
]
