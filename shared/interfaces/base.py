"""
基础接口定义
定义模块的标准基类和接口规范
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar, Callable
from dataclasses import dataclass, field
from enum import Enum
import importlib


T = TypeVar('T', bound='BaseModule')


class ModuleStatus(Enum):
    """模块状态枚举"""
    UNINITIALIZED = "uninitialized"
    INITIALIZING = "initializing"
    READY = "ready"
    ERROR = "error"
    DISABLED = "disabled"


@dataclass
class Dependency:
    """模块依赖定义"""
    name: str
    version: Optional[str] = None
    optional: bool = False
    interface: Optional[str] = None
    

@dataclass
class ModuleMetadata:
    """模块元数据"""
    name: str
    version: str
    description: str = ""
    author: str = ""
    dependencies: List[Dependency] = field(default_factory=list)
    interfaces: List[str] = field(default_factory=list)
    config_schema: Optional[Dict[str, Any]] = None


class ModuleInterface(ABC):
    """模块接口基类 - 所有模块必须实现此接口"""
    
    @abstractmethod
    def initialize(self, config: Optional[Dict[str, Any]] = None) -> bool:
        """
        初始化模块
        
        Args:
            config: 配置参数
            
        Returns:
            初始化是否成功
        """
        pass
    
    @abstractmethod
    def shutdown(self) -> bool:
        """
        关闭模块，释放资源
        
        Returns:
            关闭是否成功
        """
        pass
    
    @abstractmethod
    def get_metadata(self) -> ModuleMetadata:
        """获取模块元数据"""
        pass
    
    @abstractmethod
    def health_check(self) -> bool:
        """健康检查"""
        pass


class BaseModule(ModuleInterface):
    """模块基类 - 提供通用实现"""
    
    def __init__(self):
        self._status = ModuleStatus.UNINITIALIZED
        self._config: Dict[str, Any] = {}
        self._metadata: Optional[ModuleMetadata] = None
        self._dependencies: Dict[str, 'BaseModule'] = {}
        self._error: Optional[Exception] = None
    
    @property
    def status(self) -> ModuleStatus:
        """获取模块状态"""
        return self._status
    
    @property
    def error(self) -> Optional[Exception]:
        """获取最后的错误"""
        return self._error
    
    def set_dependencies(self, dependencies: Dict[str, 'BaseModule']) -> None:
        """设置依赖模块"""
        self._dependencies = dependencies
    
    def get_dependency(self, name: str) -> Optional['BaseModule']:
        """获取依赖模块"""
        return self._dependencies.get(name)
    
    def initialize(self, config: Optional[Dict[str, Any]] = None) -> bool:
        """初始化实现"""
        try:
            self._status = ModuleStatus.INITIALIZING
            self._config = config or {}
            
            if self._do_initialize():
                self._status = ModuleStatus.READY
                return True
            else:
                self._status = ModuleStatus.ERROR
                return False
        except Exception as e:
            self._error = e
            self._status = ModuleStatus.ERROR
            return False
    
    def shutdown(self) -> bool:
        """关闭实现"""
        try:
            self._do_shutdown()
            self._status = ModuleStatus.DISABLED
            return True
        except Exception as e:
            self._error = e
            return False
    
    def health_check(self) -> bool:
        """健康检查实现"""
        return self._status == ModuleStatus.READY
    
    def get_metadata(self) -> ModuleMetadata:
        """获取元数据"""
        if self._metadata is None:
            self._metadata = ModuleMetadata(
                name=self.__class__.__name__,
                version="1.0.0"
            )
        return self._metadata
    
    def _do_initialize(self) -> bool:
        """子类实现具体初始化逻辑"""
        return True
    
    def _do_shutdown(self) -> None:
        """子类实现具体关闭逻辑"""
        pass


class LazyModuleLoader:
    """延迟加载器 - 支持延迟导入模块"""
    
    def __init__(self, module_path: str, class_name: Optional[str] = None):
        self.module_path = module_path
        self.class_name = class_name
        self._module = None
        self._class = None
    
    def load(self) -> Any:
        """加载模块"""
        if self._module is None:
            self._module = importlib.import_module(self.module_path)
        if self.class_name:
            if self._class is None:
                self._class = getattr(self._module, self.class_name)
            return self._class
        return self._module
    
    def __call__(self, *args, **kwargs):
        """直接调用加载的类"""
        cls = self.load()
        if self.class_name:
            return cls(*args, **kwargs)
        return cls


def create_lazy_proxy(module_path: str, class_name: str) -> Type[T]:
    """创建延迟加载代理类"""
    
    class LazyProxy:
        _instance = None
        _loaded = False
        
        def __new__(cls, *args, **kwargs):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance
        
        def __getattr__(self, name):
            if not LazyProxy._loaded:
                loader = LazyModuleLoader(module_path, class_name)
                actual_class = loader.load()
                LazyProxy._loaded = True
                # 替换类方法
                self.__class__ = type(
                    self.__class__.__name__,
                    (actual_class,),
                    {k: v for k, v in self.__class__.__dict__.items() if not k.startswith('_')}
                )
            return getattr(self.__class__, name)
    
    return LazyProxy
