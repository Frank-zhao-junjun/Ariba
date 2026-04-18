"""
类型定义和约束模块
提供统一的类型注解
"""

from typing import TypeVar, List, Optional, Dict, Any, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

# 类型别名
VersionStr = str
ModuleStr = str
PhaseStr = str
QueryStr = str
ScoreFloat = float

T = TypeVar("T")

# ====== 枚举定义 ======

class ModuleType(Enum):
    """Ariba模块枚举"""
    SOURCING = "sourcing"
    CONTRACT = "contract"
    BUYING = "buying"
    SUPPLIER = "supplier"
    SPENDING = "spending"
    COMMON = "common"


class PhaseType(Enum):
    """项目阶段枚举"""
    REQUIREMENTS = "requirements_analysis"
    CONFIGURATION = "system_configuration"
    MIGRATION = "data_migration"
    TRAINING = "user_training"
    GOLIVE = "go_live_support"


class PriorityType(Enum):
    """优先级枚举"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class StatusType(Enum):
    """状态枚举"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"
    BLOCKED = "blocked"


class CapabilityTag(Enum):
    """能力标签"""
    NATIVE = "🟢"       # 原生能力
    CONFIGURABLE = "🟡" # 可配置
    CUSTOM = "🔴"      # 需定制
    TOOL = "🔵"        # 需工具
    INTEGRATION = "🟣" # 需集成
    REFERENCE = "⚪"    # 参考


# ====== 数据类定义 ======

@dataclass
class BaseModel:
    """基础模型"""
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


@dataclass
class KnowledgeItem(BaseModel):
    """知识条目"""
    title: str = ""
    description: str = ""
    solution: str = ""
    category: str = ""
    tags: List[str] = field(default_factory=list)
    versions: List[str] = field(default_factory=list)
    related_ids: List[str] = field(default_factory=list)
    
    def get_searchable_text(self) -> str:
        """获取可搜索文本"""
        parts = [
            self.title,
            self.description,
            self.solution,
            " ".join(self.tags),
            self.category
        ]
        return " ".join(parts).lower()


@dataclass
class ChecklistItem:
    """清单项"""
    id: str
    original_id: str
    title: str
    description: str
    phase: str
    phase_name: str
    module: List[str]
    priority: str
    category: str
    versions: List[str]
    status: str = "not_started"
    assignee: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    notes: str = ""


@dataclass
class QueryResult:
    """查询结果"""
    item: KnowledgeItem
    score: float = 0.0
    match_type: str = "keyword"
    matched_keywords: List[str] = field(default_factory=list)


@dataclass
class PerformanceMetrics:
    """性能指标"""
    total_queries: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    avg_query_time_ms: float = 0.0
    cache_hit_rate: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_queries": self.total_queries,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "avg_query_time_ms": round(self.avg_query_time_ms, 2),
            "cache_hit_rate": f"{self.cache_hit_rate * 100:.1f}%"
        }


# ====== API相关类型 ======

@dataclass
class APIResponse:
    """API响应"""
    success: bool
    message: str
    data: Any = None
    error: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class QueryRequest:
    """查询请求"""
    query: str
    version_tags: Optional[List[str]] = None
    limit: int = 10
    min_score: float = 0.0


@dataclass
class CreateProjectRequest:
    """创建项目请求"""
    name: str
    modules: List[str]
    version: str = "V2605"
    description: Optional[str] = None


# ====== 类型守卫 ======

def is_valid_version(version: str) -> bool:
    """验证版本格式"""
    if not version:
        return False
    version = version.strip().upper()
    return version.startswith("#") and len(version) >= 3


def is_valid_module(module: str) -> bool:
    """验证模块"""
    return module in [m.value for m in ModuleType]


def is_valid_priority(priority: str) -> bool:
    """验证优先级"""
    return priority in [p.value for p in PriorityType]


def is_valid_status(status: str) -> bool:
    """验证状态"""
    return status in [s.value for s in StatusType]


__all__ = [
    # 类型别名
    "VersionStr",
    "ModuleStr",
    "PhaseStr",
    "QueryStr",
    "ScoreFloat",
    # 枚举
    "ModuleType",
    "PhaseType",
    "PriorityType",
    "StatusType",
    "CapabilityTag",
    # 数据类
    "BaseModel",
    "KnowledgeItem",
    "ChecklistItem",
    "QueryResult",
    "PerformanceMetrics",
    # API类型
    "APIResponse",
    "QueryRequest",
    "CreateProjectRequest",
    # 类型守卫
    "is_valid_version",
    "is_valid_module",
    "is_valid_priority",
    "is_valid_status",
]
