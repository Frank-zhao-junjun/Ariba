"""
统一的路径管理模块
解决硬编码路径问题
"""

import os
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent.parent.resolve()

# 知识库路径
KNOWLEDGE_BASE_PATH = os.environ.get(
    "KNOWLEDGE_BASE_PATH",
    str(PROJECT_ROOT / "my-wiki" / "wiki" / "SAP-Ariba")
)

# 故障排除助手路径
TROUBLESHOOTING_PATH = PROJECT_ROOT / "Ariba实施助手" / "故障排除助手"

# 清单生成器路径
CHECKLIST_PATH = PROJECT_ROOT / "Ariba实施助手" / "实施检查清单生成器"

# Web后端路径
WEB_BACKEND_PATH = PROJECT_ROOT / "Ariba实施助手" / "web" / "backend"

# Web前端路径
WEB_FRONTEND_PATH = PROJECT_ROOT / "Ariba实施助手" / "web" / "frontend"

# 故障排除助手子目录
TROUBLESHOOTING_FIXTURES = TROUBLESHOOTING_PATH / "fixtures"
TROUBLESHOOTING_CORE = TROUBLESHOOTING_PATH / "core"
TROUBLESHOOTING_MODELS = TROUBLESHOOTING_PATH / "models"
TROUBLESHOOTING_UTILS = TROUBLESHOOTING_PATH / "utils"
TROUBLESHOOTING_PERFORMANCE = TROUBLESHOOTING_PATH / "performance"

# 清单生成器子目录
CHECKLIST_CORE = CHECKLIST_PATH / "core"
CHECKLIST_FIXTURES = CHECKLIST_PATH / "fixtures"
CHECKLIST_SHARED = CHECKLIST_PATH / "shared"


def get_path(category: str) -> Path:
    """
    获取指定类别的路径
    
    Args:
        category: 路径类别
            - "knowledge_base": 知识库根目录
            - "troubleshooting": 故障排除助手目录
            - "checklist": 清单生成器目录
            - "web_backend": Web后端目录
            - "web_frontend": Web前端目录
    
    Returns:
        Path对象
    
    Raises:
        ValueError: 未知路径类别
    """
    path_map = {
        "knowledge_base": KNOWLEDGE_BASE_PATH,
        "troubleshooting": str(TROUBLESHOOTING_PATH),
        "checklist": str(CHECKLIST_PATH),
        "web_backend": str(WEB_BACKEND_PATH),
        "web_frontend": str(WEB_FRONTEND_PATH),
        "troubleshooting_fixtures": str(TROUBLESHOOTING_FIXTURES),
        "troubleshooting_core": str(TROUBLESHOOTING_CORE),
        "troubleshooting_models": str(TROUBLESHOOTING_MODELS),
        "troubleshooting_utils": str(TROUBLESHOOTING_UTILS),
        "troubleshooting_performance": str(TROUBLESHOOTING_PERFORMANCE),
        "checklist_core": str(CHECKLIST_CORE),
        "checklist_fixtures": str(CHECKLIST_FIXTURES),
        "checklist_shared": str(CHECKLIST_SHARED),
    }
    
    if category not in path_map:
        raise ValueError(f"Unknown path category: {category}")
    
    return Path(path_map[category])


def ensure_path(category: str) -> Path:
    """
    获取路径，确保目录存在
    
    Args:
        category: 路径类别
    
    Returns:
        Path对象
    """
    path = get_path(category)
    path.mkdir(parents=True, exist_ok=True)
    return path


def add_to_sys_path(category: str) -> None:
    """
    将指定路径添加到sys.path
    
    Args:
        category: 路径类别
    """
    import sys
    path = get_path(category)
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))


def validate_paths() -> dict:
    """
    验证所有关键路径是否存在
    
    Returns:
        验证结果字典
    """
    results = {}
    
    critical_paths = [
        "troubleshooting",
        "checklist",
        "troubleshooting_core",
        "checklist_core",
    ]
    
    for category in critical_paths:
        try:
            path = get_path(category)
            exists = path.exists()
            results[category] = {
                "path": str(path),
                "exists": exists,
                "is_dir": path.is_dir() if exists else False
            }
        except Exception as e:
            results[category] = {
                "path": category,
                "exists": False,
                "error": str(e)
            }
    
    return results


__all__ = [
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
]
