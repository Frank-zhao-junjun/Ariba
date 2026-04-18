"""
统一接口抽象层
定义各模块的标准接口规范，实现解耦
"""

from .base import (
    BaseModule,
    ModuleInterface,
    Dependency,
    ModuleMetadata,
    ModuleStatus,
    LazyModuleLoader,
    create_lazy_proxy,
)
from .registry import (
    ModuleRegistry,
    get_registry,
    register_module,
    get_module,
    list_modules,
    validate_dependencies,
)
from .factories import (
    ModuleFactory,
    ModuleConfig,
    create_module,
    LazyModuleProxy,
    load_from_yaml,
)
from .adapters import (
    AdapterRegistry,
    Adapter,
    register_adapter,
    get_adapter,
    get_adapter_registry,
    VersionFilterAdapter,
    CacheAdapter,
    init_default_adapters,
)
from .specifications import (
    InterfaceType,
    APIRequest,
    APIResponse,
    IQueryEngine,
    IChecklistGenerator,
    IKnowledgeBase,
    IAnalytics,
    IConfigManager,
    IHealthCheck,
    IVersionManager,
    InterfaceAdapter,
    InterfaceDocumentor,
)
from .api_gateway import (
    HTTPMethod,
    RouteConfig,
    APIEndpoint,
    RequestValidator,
    APIGateway,
    route,
    validate,
    create_troubleshooting_endpoint,
    create_checklist_endpoint,
)

__all__ = [
    # 基础接口
    "BaseModule",
    "ModuleInterface",
    "Dependency",
    "ModuleMetadata",
    "ModuleStatus",
    "LazyModuleLoader",
    "create_lazy_proxy",
    # 注册表
    "ModuleRegistry",
    "get_registry",
    "register_module",
    "get_module",
    "list_modules",
    "validate_dependencies",
    # 工厂
    "ModuleFactory",
    "ModuleConfig",
    "create_module",
    "LazyModuleProxy",
    "load_from_yaml",
    # 适配器
    "AdapterRegistry",
    "Adapter",
    "register_adapter",
    "get_adapter",
    "get_adapter_registry",
    "VersionFilterAdapter",
    "CacheAdapter",
    "init_default_adapters",
    # 规范
    "InterfaceType",
    "APIRequest",
    "APIResponse",
    "IQueryEngine",
    "IChecklistGenerator",
    "IKnowledgeBase",
    "IAnalytics",
    "IConfigManager",
    "IHealthCheck",
    "IVersionManager",
    "InterfaceAdapter",
    "InterfaceDocumentor",
    # API网关
    "HTTPMethod",
    "RouteConfig",
    "APIEndpoint",
    "RequestValidator",
    "APIGateway",
    "route",
    "validate",
    "create_troubleshooting_endpoint",
    "create_checklist_endpoint",
]
