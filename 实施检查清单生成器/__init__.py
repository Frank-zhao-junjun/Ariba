"""
实施检查清单生成器
Ariba实施助手P0功能 - 实施检查清单生成器

提供完整的检查清单生命周期管理：
- US1-US5: 核心功能（生成、推荐、模板、追踪、分析）
- US6-US10: 高级功能（导入导出、多项目、权限、移动端、AI增强）
- US11-US15: 企业级功能（工作流、通知、备份、国际化、搜索）
"""

__version__ = "1.5.0"
__author__ = "Ariba实施助手团队"

# 核心模块
from .core.checklist_generator import ChecklistGenerator, ProjectPhase, AribaModule
from .recommendation.recommendation_engine import (
    RecommendationEngine,
    CompanySize,
    Industry,
    IntegrationLevel,
    RiskLevel
)
from .template.template_manager import TemplateManager
from .tracking.tracking_engine import TrackingEngine, ItemStatus
from .analytics.analytics_engine import AnalyticsEngine, HealthLevel

# US11: 工作流自动化
from .workflow.workflow_engine import (
    WorkflowEngine,
    WorkflowRule,
    Trigger,
    Action,
    TriggerType,
    ActionType,
    WorkflowTemplate,
    Event
)

# US12: 通知系统
from .notification.notification_system import (
    NotificationSystem,
    NotificationChannel,
    NotificationTemplate,
    NotificationRule,
    Notification,
    NotificationPriority,
    DeliveryStatus
)

# US13: 数据备份与恢复
from .backup.backup_manager import (
    BackupManager,
    BackupPlan,
    BackupType,
    BackupStatus,
    RecoveryPoint,
    Snapshot
)

# US14: 国际化支持
from .i18n.i18n_manager import (
    I18nManager,
    Locale,
    TimezoneConfig,
    DateTimeFormat
)

# US15: 高级搜索
from .search.advanced_search import (
    AdvancedSearch,
    SearchQuery,
    FilterCondition,
    SearchResult,
    FilterOperator,
    SortOrder
)

__all__ = [
    # 版本
    "__version__",
    # 核心生成器
    "ChecklistGenerator",
    "ProjectPhase",
    "AribaModule",
    # 推荐引擎
    "RecommendationEngine",
    "CompanySize",
    "Industry",
    "IntegrationLevel",
    "RiskLevel",
    # 模板管理器
    "TemplateManager",
    # 追踪引擎
    "TrackingEngine",
    "ItemStatus",
    # 分析引擎
    "AnalyticsEngine",
    "HealthLevel",
    # US11: 工作流自动化
    "WorkflowEngine",
    "WorkflowRule",
    "Trigger",
    "Action",
    "TriggerType",
    "ActionType",
    "WorkflowTemplate",
    "Event",
    # US12: 通知系统
    "NotificationSystem",
    "NotificationChannel",
    "NotificationTemplate",
    "NotificationRule",
    "Notification",
    "NotificationPriority",
    "DeliveryStatus",
    # US13: 数据备份与恢复
    "BackupManager",
    "BackupPlan",
    "BackupType",
    "BackupStatus",
    "RecoveryPoint",
    "Snapshot",
    # US14: 国际化支持
    "I18nManager",
    "Locale",
    "TimezoneConfig",
    "DateTimeFormat",
    # US15: 高级搜索
    "AdvancedSearch",
    "SearchQuery",
    "FilterCondition",
    "SearchResult",
    "FilterOperator",
    "SortOrder"
]
