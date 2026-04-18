"""
模块注册表
提供模块的注册、发现和依赖管理功能
"""

from typing import Dict, List, Optional, Type, Any, Set, Callable
from threading import RLock
from collections import defaultdict

from .base import BaseModule, ModuleMetadata, ModuleStatus, Dependency


class ModuleRegistry:
    """模块注册表 - 线程安全的单例"""
    
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
        """初始化注册表"""
        self._modules: Dict[str, Type[BaseModule]] = {}
        self._instances: Dict[str, BaseModule] = {}
        self._factories: Dict[str, Callable] = {}
        self._dependencies: Dict[str, Set[str]] = defaultdict(set)
        self._initialized = False
    
    def register(
        self,
        name: str,
        module_class: Type[BaseModule],
        dependencies: Optional[List[str]] = None,
        factory: Optional[Callable] = None
    ) -> None:
        """
        注册模块
        
        Args:
            name: 模块名称
            module_class: 模块类
            dependencies: 依赖模块列表
            factory: 可选的工厂函数
        """
        with self._lock:
            self._modules[name] = module_class
            self._dependencies[name] = set(dependencies or [])
            if factory:
                self._factories[name] = factory
            self._initialized = False
    
    def unregister(self, name: str) -> bool:
        """取消注册模块"""
        with self._lock:
            if name in self._instances:
                self._instances[name].shutdown()
                del self._instances[name]
            if name in self._modules:
                del self._modules[name]
            for deps in self._dependencies.values():
                deps.discard(name)
            return True
    
    def get(self, name: str, auto_init: bool = True) -> Optional[BaseModule]:
        """
        获取模块实例
        
        Args:
            name: 模块名称
            auto_init: 是否自动初始化
            
        Returns:
            模块实例
        """
        with self._lock:
            # 如果已实例化，直接返回
            if name in self._instances:
                return self._instances[name]
            
            # 如果未注册，尝试延迟加载
            if name not in self._modules:
                return None
            
            # 创建实例
            module_class = self._modules[name]
            instance = module_class()
            
            # 设置依赖
            deps = self._dependencies.get(name, set())
            dep_instances = {
                dep_name: self.get(dep_name, auto_init)
                for dep_name in deps
                if self.get(dep_name, auto_init) is not None
            }
            instance.set_dependencies(dep_instances)
            
            # 初始化
            if auto_init:
                instance.initialize()
            
            self._instances[name] = instance
            return instance
    
    def has(self, name: str) -> bool:
        """检查模块是否已注册"""
        return name in self._modules
    
    def list_modules(self) -> List[str]:
        """列出所有已注册的模块"""
        return list(self._modules.keys())
    
    def list_instances(self) -> List[str]:
        """列出所有已实例化的模块"""
        return list(self._instances.keys())
    
    def get_dependencies(self, name: str) -> Set[str]:
        """获取模块的依赖列表"""
        return self._dependencies.get(name, set()).copy()
    
    def get_dependents(self, name: str) -> Set[str]:
        """获取依赖该模块的所有模块"""
        dependents = set()
        for module_name, deps in self._dependencies.items():
            if name in deps:
                dependents.add(module_name)
        return dependents
    
    def validate_dependencies(self) -> Dict[str, List[str]]:
        """
        验证所有模块的依赖是否满足
        
        Returns:
            包含缺失依赖的模块字典
        """
        missing = {}
        for name in self._modules:
            deps = self._dependencies.get(name, set())
            missing_deps = [d for d in deps if d not in self._modules]
            if missing_deps:
                missing[name] = missing_deps
        return missing
    
    def initialize_all(self, config: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, bool]:
        """
        初始化所有模块（按依赖顺序）
        
        Args:
            config: 各模块的配置字典
            
        Returns:
            各模块的初始化结果
        """
        if self._initialized:
            return {name: inst.health_check() for name, inst in self._instances.items()}
        
        results = {}
        config = config or {}
        
        # 拓扑排序确定初始化顺序
        order = self._topological_sort()
        
        for name in order:
            try:
                instance = self.get(name, auto_init=False)
                if instance:
                    instance.initialize(config.get(name))
                    results[name] = instance.health_check()
            except Exception as e:
                results[name] = False
        
        self._initialized = True
        return results
    
    def shutdown_all(self) -> Dict[str, bool]:
        """关闭所有模块"""
        results = {}
        for name in reversed(list(self._instances.keys())):
            try:
                results[name] = self._instances[name].shutdown()
            except Exception:
                results[name] = False
        self._instances.clear()
        self._initialized = False
        return results
    
    def _topological_sort(self) -> List[str]:
        """拓扑排序确定初始化顺序"""
        visited = set()
        order = []
        
        def visit(name: str):
            if name in visited:
                return
            visited.add(name)
            for dep in self._dependencies.get(name, set()):
                visit(dep)
            order.append(name)
        
        for name in self._modules:
            visit(name)
        
        return order
    
    def reset(self) -> None:
        """重置注册表"""
        with self._lock:
            self.shutdown_all()
            self._modules.clear()
            self._factories.clear()
            self._dependencies.clear()
            self._initialized = False


# 全局注册表实例
_registry: Optional[ModuleRegistry] = None


def get_registry() -> ModuleRegistry:
    """获取全局注册表实例"""
    global _registry
    if _registry is None:
        _registry = ModuleRegistry()
    return _registry


def register_module(
    name: str,
    module_class: Type[BaseModule],
    dependencies: Optional[List[str]] = None
) -> None:
    """注册模块的快捷函数"""
    get_registry().register(name, module_class, dependencies)


def get_module(name: str) -> Optional[BaseModule]:
    """获取模块的快捷函数"""
    return get_registry().get(name)


def list_modules() -> List[str]:
    """列出所有模块的快捷函数"""
    return get_registry().list_modules()


def validate_dependencies() -> Dict[str, List[str]]:
    """验证依赖的快捷函数"""
    return get_registry().validate_dependencies()
