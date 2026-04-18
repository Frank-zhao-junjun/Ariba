"""
模块工厂
提供模块的统一创建接口
"""

from typing import Dict, List, Optional, Any, Callable, Type
from dataclasses import dataclass
import importlib

from .base import BaseModule, ModuleMetadata
from .registry import get_registry


@dataclass
class ModuleConfig:
    """模块配置"""
    name: str
    class_path: str  # 格式: "module.path:ClassName"
    dependencies: List[str] = None
    init_config: Dict[str, Any] = None
    lazy: bool = False


class ModuleFactory:
    """模块工厂 - 统一创建和管理模块"""
    
    def __init__(self):
        self._configs: Dict[str, ModuleConfig] = {}
        self._registry = get_registry()
    
    def register_from_config(self, config: ModuleConfig) -> None:
        """从配置注册模块"""
        self._configs[config.name] = config
        
        if not config.lazy:
            # 立即加载
            self._load_and_register(config)
        else:
            # 延迟加载 - 注册工厂函数
            self._registry.register(
                config.name,
                LazyModuleProxy,
                config.dependencies,
                factory=lambda: self._create_from_config(config)
            )
    
    def register_from_configs(self, configs: List[ModuleConfig]) -> None:
        """批量注册模块"""
        for config in configs:
            self.register_from_config(config)
    
    def _load_and_register(self, config: ModuleConfig) -> None:
        """加载并注册模块"""
        module_path, class_name = config.class_path.split(':')
        module = importlib.import_module(module_path)
        module_class = getattr(module, class_name)
        
        self._registry.register(
            config.name,
            module_class,
            config.dependencies
        )
    
    def _create_from_config(self, config: ModuleConfig) -> BaseModule:
        """从配置创建模块实例"""
        module_path, class_name = config.class_path.split(':')
        module = importlib.import_module(module_path)
        module_class = getattr(module, class_name)
        
        instance = module_class()
        if config.init_config:
            instance.initialize(config.init_config)
        
        return instance
    
    def create(self, name: str, config: Optional[Dict[str, Any]] = None) -> Optional[BaseModule]:
        """创建模块实例"""
        # 检查配置
        if name in self._configs:
            config_obj = self._configs[name]
            return self._create_from_config(config_obj)
        
        # 尝试从注册表获取
        return self._registry.get(name)
    
    def create_all(self) -> Dict[str, BaseModule]:
        """创建所有已注册的模块"""
        results = {}
        for name in self._configs:
            instance = self.create(name)
            if instance:
                results[name] = instance
        return results
    
    def get_config(self, name: str) -> Optional[ModuleConfig]:
        """获取模块配置"""
        return self._configs.get(name)
    
    def list_configs(self) -> List[str]:
        """列出所有配置"""
        return list(self._configs.keys())


class LazyModuleProxy(BaseModule):
    """延迟加载模块代理"""
    
    def __init__(self, factory: Optional[Callable] = None):
        super().__init__()
        self._factory = factory
        self._actual_instance: Optional[BaseModule] = None
    
    def _do_initialize(self) -> bool:
        """延迟初始化"""
        if self._factory:
            self._actual_instance = self._factory()
            if self._actual_instance:
                return self._actual_instance.initialize(self._config)
        return False
    
    def _do_shutdown(self) -> None:
        """关闭实际实例"""
        if self._actual_instance:
            self._actual_instance.shutdown()
    
    def get_metadata(self) -> ModuleMetadata:
        """获取元数据"""
        if self._actual_instance:
            return self._actual_instance.get_metadata()
        return ModuleMetadata(
            name=self.__class__.__name__,
            version="1.0.0"
        )
    
    def __getattr__(self, name: str):
        """代理到实际实例"""
        if self._actual_instance:
            return getattr(self._actual_instance, name)
        raise AttributeError(f"'{self.__class__.__name__}' has no attribute '{name}'")


def create_module(config: ModuleConfig) -> Optional[BaseModule]:
    """快捷创建函数"""
    factory = ModuleFactory()
    return factory.create(config.name, config.init_config)


def load_from_yaml(yaml_path: str) -> ModuleFactory:
    """从YAML配置加载"""
    # 延迟导入，避免不必要的依赖
    try:
        import yaml
        with open(yaml_path, 'r', encoding='utf-8') as f:
            configs_data = yaml.safe_load(f)
        
        factory = ModuleFactory()
        configs = []
        for name, data in configs_data.items():
            config = ModuleConfig(
                name=name,
                class_path=data['class_path'],
                dependencies=data.get('dependencies', []),
                init_config=data.get('config'),
                lazy=data.get('lazy', False)
            )
            configs.append(config)
        
        factory.register_from_configs(configs)
        return factory
    except ImportError:
        raise RuntimeError("PyYAML is required to load YAML configuration")
