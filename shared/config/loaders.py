"""
配置加载器
支持多种配置源和环境适配
"""

from typing import Any, Dict, List, Optional, Union, Callable
from pathlib import Path
from dataclasses import dataclass, field
import os
import json
import yaml


@dataclass
class ConfigLoader:
    """配置加载器"""
    search_paths: List[Path] = field(default_factory=list)
    env_prefix: str = "ARIBAS_"
    env_separator: str = "__"
    
    def __post_init__(self):
        # 默认搜索路径
        if not self.search_paths:
            self.search_paths = [
                Path.cwd(),
                Path.cwd() / "config",
                Path.home() / ".ariba",
                Path(__file__).parent.parent.parent.parent,
            ]
    
    def load(self, config_name: str = "config") -> Dict[str, Any]:
        """
        加载配置
        
        Args:
            config_name: 配置文件名(不含扩展名)
            
        Returns:
            配置字典
        """
        config = {}
        
        # 按优先级加载
        # 1. 环境变量 (最高优先级)
        config.update(self._load_from_env())
        
        # 2. 配置文件
        for path in self.search_paths:
            file_config = self._load_from_file(path, config_name)
            if file_config:
                # 文件配置优先级低于环境变量
                for key, value in file_config.items():
                    if key not in config:
                        config[key] = value
        
        # 3. 默认值
        config.update(self._get_defaults())
        
        return config
    
    def _load_from_env(self) -> Dict[str, Any]:
        """从环境变量加载"""
        result = {}
        prefix = self.env_prefix.upper()
        
        for key, value in os.environ.items():
            if key.startswith(prefix):
                config_key = key[len(prefix):].lower().replace(self.env_separator, ".")
                result[config_key] = self._parse_value(value)
        
        return result
    
    def _load_from_file(self, base_path: Path, name: str) -> Optional[Dict]:
        """从文件加载"""
        base_path = Path(base_path)
        
        # 尝试多种格式
        for ext in ['.yaml', '.yml', '.json', '.toml']:
            file_path = base_path / f"{name}{ext}"
            if file_path.exists():
                return self._parse_file(file_path)
        
        return None
    
    def _parse_file(self, path: Path) -> Dict:
        """解析配置文件"""
        with open(path, 'r', encoding='utf-8') as f:
            suffix = path.suffix.lower()
            if suffix in ['.yaml', '.yml']:
                return yaml.safe_load(f) or {}
            elif suffix == '.json':
                return json.load(f)
        
        return {}
    
    def _parse_value(self, value: str) -> Any:
        """解析环境变量值"""
        # 布尔值
        if value.lower() in ['true', 'yes', 'on']:
            return True
        if value.lower() in ['false', 'no', 'off']:
            return False
        
        # None
        if value.lower() == 'none' or value == '':
            return None
        
        # 数字
        try:
            if '.' in value:
                return float(value)
            return int(value)
        except ValueError:
            pass
        
        # JSON
        if value.startswith('[') or value.startswith('{'):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                pass
        
        return value
    
    def _get_defaults(self) -> Dict[str, Any]:
        """获取默认值"""
        return {
            "debug": False,
            "log_level": "INFO",
            "cache_enabled": True,
            "cache_ttl": 3600,
            "max_results": 10,
        }


class EnvironmentAdapter:
    """环境适配器 - 根据运行环境调整配置"""
    
    # 环境定义
    ENV_DEV = "development"
    ENV_TEST = "testing"
    ENV_STAGING = "staging"
    ENV_PROD = "production"
    
    @classmethod
    def get_environment(cls) -> str:
        """获取当前环境"""
        return os.environ.get("ENVIRONMENT", cls.ENV_DEV)
    
    @classmethod
    def is_production(cls) -> bool:
        """是否生产环境"""
        return cls.get_environment() == cls.ENV_PROD
    
    @classmethod
    def is_development(cls) -> bool:
        """是否开发环境"""
        return cls.get_environment() == cls.ENV_DEV
    
    @classmethod
    def is_testing(cls) -> bool:
        """是否测试环境"""
        return cls.get_environment() == cls.ENV_TEST
    
    @classmethod
    def get_env_config(cls, environment: Optional[str] = None) -> Dict[str, Any]:
        """
        获取环境特定配置
        
        Args:
            environment: 环境名称，默认自动检测
            
        Returns:
            环境配置
        """
        env = environment or cls.get_environment()
        
        base_config = {
            "environment": env,
            "debug": env in [cls.ENV_DEV, cls.ENV_TEST],
            "log_level": "DEBUG" if env == cls.ENV_DEV else "INFO",
        }
        
        env_configs = {
            cls.ENV_DEV: {
                "db_echo": True,
                "cache_enabled": False,
                "reload": True,
            },
            cls.ENV_TEST: {
                "db_echo": False,
                "cache_enabled": False,
                "reload": False,
                "testing": True,
            },
            cls.ENV_STAGING: {
                "db_echo": False,
                "cache_enabled": True,
                "reload": False,
            },
            cls.ENV_PROD: {
                "db_echo": False,
                "cache_enabled": True,
                "reload": False,
                "log_level": "WARNING",
            },
        }
        
        base_config.update(env_configs.get(env, {}))
        return base_config
    
    @classmethod
    def get_profile_config(cls, profile: str) -> Dict[str, Any]:
        """
        获取Profile配置
        
        Args:
            profile: profile名称 (如: docker, kubernetes, aws)
            
        Returns:
            profile特定配置
        """
        profiles = {
            "docker": {
                "host": "docker",
                "port": 5432,
            },
            "kubernetes": {
                "host": os.environ.get("KUBERNETES_SERVICE_HOST", "kubernetes"),
                "port": int(os.environ.get("KUBERNETES_SERVICE_PORT", 5432)),
            },
            "aws": {
                "region": os.environ.get("AWS_REGION", "us-east-1"),
                "use_iam": True,
            },
        }
        
        return profiles.get(profile, {})


@dataclass
class ConfigSource:
    """配置源"""
    name: str
    type: str  # file, env, default
    priority: int
    loader: Optional[Callable] = None


class MultiSourceConfigLoader:
    """多源配置加载器"""
    
    def __init__(self):
        self._sources: List[ConfigSource] = []
        self._config: Dict[str, Any] = {}
    
    def add_source(self, source: ConfigSource) -> None:
        """添加配置源"""
        self._sources.append(source)
        self._sources.sort(key=lambda s: s.priority)
    
    def add_file_source(self, path: str, priority: int = 50) -> None:
        """添加文件源"""
        self.add_source(ConfigSource(
            name=path,
            type="file",
            priority=priority,
            loader=lambda: self._load_file(path)
        ))
    
    def add_env_source(self, prefix: str = "ARIBAS_", priority: int = 100) -> None:
        """添加环境变量源"""
        self.add_source(ConfigSource(
            name=f"env:{prefix}",
            type="env",
            priority=priority,
            loader=lambda: self._load_env(prefix)
        ))
    
    def load(self) -> Dict[str, Any]:
        """加载所有配置源"""
        self._config = {}
        
        for source in self._sources:
            if source.loader:
                data = source.loader()
                if data:
                    self._config.update(data)
        
        return self._config.copy()
    
    def _load_file(self, path: str) -> Dict:
        """加载文件"""
        p = Path(path)
        if not p.exists():
            return {}
        
        if p.suffix in ['.yaml', '.yml']:
            with open(p, 'r') as f:
                return yaml.safe_load(f) or {}
        elif p.suffix == '.json':
            with open(p, 'r') as f:
                return json.load(f)
        
        return {}
    
    def _load_env(self, prefix: str) -> Dict:
        """加载环境变量"""
        result = {}
        prefix = prefix.upper()
        
        for key, value in os.environ.items():
            if key.startswith(prefix):
                config_key = key[len(prefix):].lower().replace("__", ".")
                result[config_key] = value
        
        return result
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值"""
        return self._config.get(key, default)
    
    def get_all(self) -> Dict:
        """获取所有配置"""
        return self._config.copy()
