"""
统一导入模块
在其他模块中，使用 `from shared_imports import *` 来导入所有共享工具
"""

import sys
from pathlib import Path

# 确保shared目录在路径中
_shared_dir = Path(__file__).parent / "shared"
if str(_shared_dir) not in sys.path:
    sys.path.insert(0, str(_shared_dir))

# 从共享模块导出
from version_utils import normalize_version, compare_versions, SUPPORTED_VERSIONS
from paths import get_path, add_to_sys_path, validate_paths
from logging_config import setup_logging, get_logger, LogContext, log_operation
from exceptions import (
    AribaAssistantError,
    KnowledgeBaseError,
    QueryEngineError,
    ChecklistError,
    ValidationError,
    ConfigurationError,
    handle_exceptions,
    safe_execute,
    ErrorCollector,
)

__all__ = [
    # 版本工具
    "normalize_version",
    "compare_versions",
    "SUPPORTED_VERSIONS",
    # 路径管理
    "get_path",
    "add_to_sys_path",
    "validate_paths",
    # 日志
    "setup_logging",
    "get_logger",
    "LogContext",
    "log_operation",
    # 异常处理
    "AribaAssistantError",
    "KnowledgeBaseError",
    "QueryEngineError",
    "ChecklistError",
    "ValidationError",
    "ConfigurationError",
    "handle_exceptions",
    "safe_execute",
    "ErrorCollector",
]
