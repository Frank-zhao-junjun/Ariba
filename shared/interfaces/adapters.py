"""
适配器系统
将现有模块适配到统一接口
"""

from typing import Dict, List, Any, Optional, Callable, Type, Union
from abc import ABC, abstractmethod
from threading import RLock

from .base import BaseModule, ModuleMetadata, ModuleStatus


class Adapter(ABC):
    """适配器基类"""
    
    @abstractmethod
    def adapt(self, original: Any) -> Any:
        """将原始对象适配到目标接口"""
        pass
    
    @abstractmethod
    def get_original_interface(self) -> str:
        """获取原始接口类型"""
        pass
    
    @abstractmethod
    def get_target_interface(self) -> str:
        """获取目标接口类型"""
        pass


class AdapterRegistry:
    """适配器注册表"""
    
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
        self._adapters: Dict[str, Dict[str, Adapter]] = {}  # from -> {to: adapter}
        self._wrappers: Dict[str, Type] = {}  # type_name -> wrapper_class
    
    def register(
        self,
        adapter: Adapter,
        from_type: Optional[str] = None,
        to_type: Optional[str] = None
    ) -> None:
        """注册适配器"""
        from_type = from_type or adapter.get_original_interface()
        to_type = to_type or adapter.get_target_interface()
        
        if from_type not in self._adapters:
            self._adapters[from_type] = {}
        self._adapters[from_type][to_type] = adapter
    
    def register_wrapper(self, name: str, wrapper_class: Type) -> None:
        """注册包装器类"""
        self._wrappers[name] = wrapper_class
    
    def get_adapter(self, from_type: str, to_type: str) -> Optional[Adapter]:
        """获取适配器"""
        return self._adapters.get(from_type, {}).get(to_type)
    
    def adapt(self, obj: Any, to_type: str) -> Any:
        """适配对象到目标类型"""
        from_type = type(obj).__name__
        
        adapter = self.get_adapter(from_type, to_type)
        if adapter:
            return adapter.adapt(obj)
        
        # 尝试包装器
        if to_type in self._wrappers:
            wrapper_class = self._wrappers[to_type]
            return wrapper_class(obj)
        
        return obj
    
    def list_adapters(self) -> Dict[str, List[str]]:
        """列出所有适配器"""
        return {
            from_type: list(to_types.keys())
            for from_type, to_types in self._adapters.items()
        }


# 全局注册表
_adapter_registry: Optional[AdapterRegistry] = None


def get_adapter_registry() -> AdapterRegistry:
    """获取适配器注册表"""
    global _adapter_registry
    if _adapter_registry is None:
        _adapter_registry = AdapterRegistry()
    return _adapter_registry


def register_adapter(
    adapter: Adapter,
    from_type: Optional[str] = None,
    to_type: Optional[str] = None
) -> None:
    """注册适配器的快捷函数"""
    get_adapter_registry().register(adapter, from_type, to_type)


def get_adapter(from_type: str, to_type: str) -> Optional[Adapter]:
    """获取适配器的快捷函数"""
    return get_adapter_registry().get_adapter(from_type, to_type)


# ===== 预置适配器 =====

class VersionFilterAdapter(Adapter):
    """版本过滤器适配器"""
    
    def __init__(self):
        self._adapted = None
    
    def adapt(self, original: Any) -> BaseModule:
        """适配版本过滤器"""
        class AdaptedVersionFilter(BaseModule):
            def __init__(self, vf):
                super().__init__()
                self._vf = vf
            
            def _do_initialize(self) -> bool:
                return True
            
            def normalize_version(self, version: str) -> str:
                if hasattr(self._vf, 'normalize_version'):
                    return self._vf.normalize_version(version)
                return version
            
            def filter_by_version(self, items: list, version: str) -> list:
                if hasattr(self._vf, 'filter_by_version'):
                    return self._vf.filter_by_version(items, version)
                return items
        
        return AdaptedVersionFilter(original)
    
    def get_original_interface(self) -> str:
        return "VersionFilter"
    
    def get_target_interface(self) -> str:
        return "BaseModule"


class CacheAdapter(Adapter):
    """缓存适配器"""
    
    def __init__(self):
        self._adapted = None
    
    def adapt(self, original: Any) -> BaseModule:
        """适配缓存"""
        class AdaptedCache(BaseModule):
            def __init__(self, cache):
                super().__init__()
                self._cache = cache
                self._status = ModuleStatus.READY
            
            def _do_initialize(self) -> bool:
                return True
            
            def get(self, key: str) -> Any:
                if hasattr(self._cache, 'get'):
                    return self._cache.get(key)
                return None
            
            def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
                if hasattr(self._cache, 'set'):
                    self._cache.set(key, value, ttl)
            
            def delete(self, key: str) -> None:
                if hasattr(self._cache, 'delete'):
                    self._cache.delete(key)
            
            def clear(self) -> None:
                if hasattr(self._cache, 'clear'):
                    self._cache.clear()
        
        return AdaptedCache(original)
    
    def get_original_interface(self) -> str:
        return "LRUCache"
    
    def get_target_interface(self) -> str:
        return "BaseModule"


def init_default_adapters() -> None:
    """初始化默认适配器"""
    registry = get_adapter_registry()
    registry.register(VersionFilterAdapter())
    registry.register(CacheAdapter())
