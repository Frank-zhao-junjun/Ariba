"""
共享工具模块
提供跨模块的通用功能
"""

from .version_utils import normalize_version, compare_versions, SUPPORTED_VERSIONS
from .paths import (
    PROJECT_ROOT,
    KNOWLEDGE_BASE_PATH,
    TROUBLESHOOTING_PATH,
    CHECKLIST_PATH,
    WEB_BACKEND_PATH,
    WEB_FRONTEND_PATH,
    get_path,
    ensure_path,
    add_to_sys_path,
    validate_paths,
)
from .logging_config import (
    setup_logging,
    get_logger,
    LogContext,
    log_operation,
    init_logging,
)
from .exceptions import (
    AribaAssistantError,
    KnowledgeBaseError,
    QueryEngineError,
    ChecklistError,
    ValidationError,
    ConfigurationError,
    handle_exceptions,
    safe_execute,
    with_error_handling,
    ErrorCollector,
)
from .interfaces import (
    BaseModule,
    ModuleInterface,
    ModuleRegistry,
    ModuleFactory,
    ModuleConfig,
    ModuleMetadata,
    Dependency,
    get_module,
    register_module,
    list_modules,
    create_module,
    LazyModuleProxy,
)
from .knowledge import (
    KnowledgeDeduplicator,
    DeduplicationResult,
    KnowledgeLinker,
    LinkResult,
    VersionManager,
    VersionAnalysis,
    SearchOptimizer,
    SearchMetrics,
)
from .config import (
    ConfigManager,
    ConfigSchema,
    ConfigLoader,
    EnvironmentAdapter,
    get_config_manager,
    config,
    set_config,
    load_config,
    get_checklist_schema,
    get_troubleshooting_schema,
)

__all__ = [
    # 版本工具
    "normalize_version",
    "compare_versions",
    "SUPPORTED_VERSIONS",
    # 路径管理
    "PROJECT_ROOT",
    "KNOWLEDGE_BASE_PATH",
    "TROUBLESHOOTING_PATH",
    "CHECKLIST_PATH",
    "WEB_BACKEND_PATH",
    "WEB_FRONTEND_PATH",
    "get_path",
    "ensure_path",
    "add_to_sys_path",
    "validate_paths",
    # 日志
    "setup_logging",
    "get_logger",
    "LogContext",
    "log_operation",
    "init_logging",
    # 异常处理
    "AribaAssistantError",
    "KnowledgeBaseError",
    "QueryEngineError",
    "ChecklistError",
    "ValidationError",
    "ConfigurationError",
    "handle_exceptions",
    "safe_execute",
    "with_error_handling",
    "ErrorCollector",
    # 模块接口
    "BaseModule",
    "ModuleInterface",
    "ModuleRegistry",
    "ModuleFactory",
    "ModuleConfig",
    "ModuleMetadata",
    "Dependency",
    "get_module",
    "register_module",
    "list_modules",
    "create_module",
    "LazyModuleProxy",
    # 知识库管理
    "KnowledgeDeduplicator",
    "DeduplicationResult",
    "KnowledgeLinker",
    "LinkResult",
    "VersionManager",
    "VersionAnalysis",
    "SearchOptimizer",
    "SearchMetrics",
]
