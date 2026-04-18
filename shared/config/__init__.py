"""
集中配置管理
提供统一的配置加载、验证和热更新功能
"""

from typing import Any, Dict, List, Optional, Callable, Union
from dataclasses import dataclass, field
from enum import Enum
import os
import json
import yaml
from pathlib import Path
from threading import RLock
from collections import ChainMap


class ConfigSource(Enum):
    """配置来源枚举"""
    DEFAULT = "default"      # 默认配置
    ENV = "env"             # 环境变量
    FILE = "file"           # 配置文件
    RUNTIME = "runtime"     # 运行时配置


@dataclass
class ConfigEntry:
    """配置项"""
    key: str
    value: Any
    source: ConfigSource
    description: str = ""
    validator: Optional[Callable] = None
    default: Any = None


class ConfigSchema:
    """配置Schema定义"""
    
    def __init__(self):
        self._fields: Dict[str, Dict] = {}
    
    def add_field(
        self,
        key: str,
        field_type: type,
        default: Any = None,
        description: str = "",
        validator: Optional[Callable] = None,
        required: bool = False,
        choices: Optional[List[Any]] = None
    ) -> "ConfigSchema":
        """添加配置字段"""
        self._fields[key] = {
            "type": field_type,
            "default": default,
            "description": description,
            "validator": validator,
            "required": required,
            "choices": choices
        }
        return self
    
    def get_schema(self) -> Dict[str, Dict]:
        """获取完整schema"""
        return self._fields.copy()
    
    def validate(self, config: Dict[str, Any]) -> tuple[bool, List[str]]:
        """验证配置"""
        errors = []
        
        for key, field_def in self._fields.items():
            # 检查必填
            if field_def["required"] and key not in config:
                errors.append(f"Missing required field: {key}")
                continue
            
            if key not in config:
                continue
            
            value = config[key]
            
            # 检查类型
            expected_type = field_def["type"]
            if not isinstance(value, expected_type):
                errors.append(
                    f"Invalid type for {key}: expected {expected_type.__name__}, "
                    f"got {type(value).__name__}"
                )
                continue
            
            # 检查选项
            choices = field_def["choices"]
            if choices and value not in choices:
                errors.append(f"Invalid value for {key}: must be one of {choices}")
                continue
            
            # 自定义验证
            validator = field_def["validator"]
            if validator and not validator(value):
                errors.append(f"Validation failed for {key}")
        
        return len(errors) == 0, errors


class ConfigManager:
    """配置管理器 - 线程安全单例"""
    
    _instance = None
    _lock = RLock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance
    
    def _init(self):
        """初始化"""
        self._configs: Dict[str, ConfigEntry] = {}
        self._schemas: Dict[str, ConfigSchema] = {}
        self._listeners: List[Callable] = []
        self._file_paths: List[Path] = []
        self._env_prefix = "ARIBAS_"
        self._loaded = False
    
    def set_env_prefix(self, prefix: str) -> None:
        """设置环境变量前缀"""
        self._env_prefix = prefix.upper()
    
    def add_schema(self, namespace: str, schema: ConfigSchema) -> None:
        """添加配置schema"""
        self._schemas[namespace] = schema
    
    def load_from_file(self, path: Union[str, Path], format: str = "auto") -> bool:
        """
        从文件加载配置
        
        Args:
            path: 文件路径
            format: 文件格式 (yaml/json/auto)
        """
        path = Path(path)
        
        if not path.exists():
            return False
        
        # 自动检测格式
        if format == "auto":
            suffix = path.suffix.lower()
            if suffix in ['.yaml', '.yml']:
                format = 'yaml'
            elif suffix == '.json':
                format = 'json'
            else:
                return False
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                if format == 'yaml':
                    data = yaml.safe_load(f)
                else:
                    data = json.load(f)
            
            self._load_dict(data, ConfigSource.FILE)
            self._file_paths.append(path)
            self._loaded = True
            return True
        except Exception:
            return False
    
    def load_from_env(self) -> None:
        """从环境变量加载配置"""
        for key, value in os.environ.items():
            if key.startswith(self._env_prefix):
                config_key = key[len(self._env_prefix):].lower()
                self._configs[config_key] = ConfigEntry(
                    key=config_key,
                    value=self._parse_value(value),
                    source=ConfigSource.ENV
                )
    
    def _load_dict(self, data: Dict, source: ConfigSource) -> None:
        """加载字典配置"""
        for key, value in data.items():
            if isinstance(value, dict):
                # 递归处理嵌套字典
                for sub_key, sub_value in value.items():
                    full_key = f"{key}.{sub_key}"
                    self._configs[full_key] = ConfigEntry(
                        key=full_key,
                        value=sub_value,
                        source=source
                    )
            else:
                self._configs[key] = ConfigEntry(
                    key=key,
                    value=value,
                    source=source
                )
    
    def _parse_value(self, value: str) -> Any:
        """解析环境变量值"""
        # 布尔值
        if value.lower() in ['true', 'yes', '1']:
            return True
        if value.lower() in ['false', 'no', '0']:
            return False
        
        # 数字
        try:
            if '.' in value:
                return float(value)
            return int(value)
        except ValueError:
            pass
        
        # JSON数组/对象
        if value.startswith('[') or value.startswith('{'):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                pass
        
        return value
    
    def get(self, key: str, default: Any = None, namespace: Optional[str] = None) -> Any:
        """
        获取配置值
        
        Args:
            key: 配置键
            default: 默认值
            namespace: 命名空间
        """
        # 构建完整键名
        full_key = f"{namespace}.{key}" if namespace else key
        
        # 从多个源获取
        sources = [
            (ConfigSource.RUNTIME, self._configs.get(full_key)),
            (ConfigSource.ENV, self._configs.get(full_key)),
            (ConfigSource.FILE, self._configs.get(full_key)),
            (ConfigSource.DEFAULT, self._configs.get(full_key)),
        ]
        
        for source, entry in sources:
            if entry and entry.value is not None:
                return entry.value
        
        return default
    
    def set(self, key: str, value: Any, namespace: Optional[str] = None) -> None:
        """设置配置值"""
        full_key = f"{namespace}.{key}" if namespace else key
        
        self._configs[full_key] = ConfigEntry(
            key=full_key,
            value=value,
            source=ConfigSource.RUNTIME
        )
        
        # 通知监听器
        self._notify_listeners(key, value)
    
    def get_all(self, namespace: Optional[str] = None) -> Dict[str, Any]:
        """获取所有配置"""
        if namespace:
            prefix = f"{namespace}."
            return {
                k[len(prefix):]: v.value 
                for k, v in self._configs.items() 
                if k.startswith(prefix)
            }
        return {k: v.value for k, v in self._configs.items()}
    
    def validate(self, namespace: Optional[str] = None) -> tuple[bool, List[str]]:
        """验证配置"""
        if namespace and namespace in self._schemas:
            config = self.get_all(namespace)
            return self._schemas[namespace].validate(config)
        return True, []
    
    def reload(self) -> bool:
        """重新加载配置"""
        # 清空非运行时配置
        for key in list(self._configs.keys()):
            if self._configs[key].source != ConfigSource.RUNTIME:
                del self._configs[key]
        
        # 重新加载
        for path in self._file_paths:
            self.load_from_file(path)
        
        self.load_from_env()
        return True
    
    def add_listener(self, listener: Callable) -> None:
        """添加配置变更监听器"""
        self._listeners.append(listener)
    
    def _notify_listeners(self, key: str, value: Any) -> None:
        """通知监听器"""
        for listener in self._listeners:
            try:
                listener(key, value)
            except Exception:
                pass
    
    def load_defaults(self, defaults: Dict[str, Any], namespace: Optional[str] = None) -> None:
        """加载默认配置"""
        for key, value in defaults.items():
            full_key = f"{namespace}.{key}" if namespace else key
            self._configs[full_key] = ConfigEntry(
                key=full_key,
                value=value,
                source=ConfigSource.DEFAULT
            )


# ===== 预定义配置Schema =====

def get_checklist_schema() -> ConfigSchema:
    """清单生成器配置Schema"""
    schema = ConfigSchema()
    schema.add_field(
        "template_dir", str,
        default="templates",
        description="模板目录"
    )
    schema.add_field(
        "cache_enabled", bool,
        default=True,
        description="是否启用缓存"
    )
    schema.add_field(
        "cache_ttl", int,
        default=3600,
        description="缓存TTL(秒)"
    )
    return schema


def get_troubleshooting_schema() -> ConfigSchema:
    """故障排除配置Schema"""
    schema = ConfigSchema()
    schema.add_field(
        "knowledge_base_path", str,
        default="knowledge",
        description="知识库路径"
    )
    schema.add_field(
        "max_results", int,
        default=10,
        description="最大结果数",
        choices=[5, 10, 20, 50]
    )
    schema.add_field(
        "similarity_threshold", float,
        default=0.7,
        description="相似度阈值"
    )
    return schema


# ===== 全局配置管理器 =====

_config_manager: Optional[ConfigManager] = None


def get_config_manager() -> ConfigManager:
    """获取全局配置管理器"""
    global _config_manager
    if _config_manager is None:
        _config_manager = ConfigManager()
    return _config_manager


# ===== 快捷函数 =====

def config(key: str, default: Any = None) -> Any:
    """快捷获取配置"""
    return get_config_manager().get(key, default)


def set_config(key: str, value: Any) -> None:
    """快捷设置配置"""
    get_config_manager().set(key, value)


def load_config(path: str) -> bool:
    """快捷加载配置文件"""
    return get_config_manager().load_from_file(path)


def validate_config() -> tuple[bool, List[str]]:
    """验证所有配置"""
    return get_config_manager().validate()


# 导入ConfigLoader
from .loaders import ConfigLoader, EnvironmentAdapter, MultiSourceConfigLoader
