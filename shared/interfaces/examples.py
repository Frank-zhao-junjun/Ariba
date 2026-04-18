"""
模块解耦示例
展示如何使用统一接口系统重构现有模块
"""

from shared.interfaces import (
    BaseModule,
    ModuleMetadata,
    ModuleConfig,
    ModuleFactory,
    get_registry,
    LazyModuleProxy,
)
from shared import (
    normalize_version,
    get_logger,
    safe_execute,
)


# ===== 示例1: 故障排除助手模块重构 =====

class QueryEngineModule(BaseModule):
    """
    重构后的查询引擎模块
    实现BaseModule接口，支持依赖注入
    """
    
    def __init__(self):
        super().__init__()
        self._engine = None
        self._cache = None
        self._index_builder = None
    
    def get_metadata(self) -> ModuleMetadata:
        return ModuleMetadata(
            name="troubleshooting.query_engine",
            version="2.0.0",
            description="故障排除助手核心查询引擎",
            interfaces=["IQueryEngine", "ISearchable"],
            dependencies=[]
        )
    
    def _do_initialize(self) -> bool:
        """初始化查询引擎"""
        try:
            # 延迟导入，避免循环依赖
            from 故障排除助手.core.query_engine import OptimizedQueryEngine
            from 故障排除助手.performance.cache import LRUCache
            from 故障排除助手.performance.index_builder import IndexBuilder
            
            # 获取依赖模块（通过注册表注入）
            cache_module = self.get_dependency("cache")
            if cache_module:
                self._cache = cache_module
            
            # 创建引擎实例
            self._engine = OptimizedQueryEngine()
            
            self._logger = get_logger("QueryEngineModule")
            self._logger.info("QueryEngineModule initialized")
            
            return True
        except Exception as e:
            self._error = e
            return False
    
    def _do_shutdown(self) -> None:
        """清理资源"""
        self._engine = None
        self._cache = None
    
    def search(self, query: str, version: str = None):
        """搜索接口"""
        if self._engine:
            return self._engine.search(query, version)
        return []
    
    def query_by_symptom(self, symptom: str):
        """按症状查询"""
        if self._engine:
            return self._engine.query_by_symptom(symptom)
        return []


# ===== 示例2: 清单生成器模块重构 =====

class ChecklistModule(BaseModule):
    """
    重构后的清单生成器模块
    实现BaseModule接口，支持依赖注入
    """
    
    def __init__(self):
        super().__init__()
        self._generator = None
        self._templates = {}
    
    def get_metadata(self) -> ModuleMetadata:
        return ModuleMetadata(
            name="checklist.generator",
            version="2.0.0",
            description="实施检查清单生成器",
            interfaces=["IChecklistGenerator", "ITemplateManager"],
            dependencies=["troubleshooting.query_engine"]
        )
    
    def _do_initialize(self) -> bool:
        """初始化清单生成器"""
        try:
            from 实施检查清单生成器.core.checklist_generator import (
                ChecklistGenerator,
                ProjectPhase,
                AribaModule,
            )
            
            # 获取依赖的查询引擎
            query_engine = self.get_dependency("troubleshooting.query_engine")
            
            self._generator = ChecklistGenerator(
                query_engine=query_engine,
                config=self._config
            )
            
            self._logger = get_logger("ChecklistModule")
            self._logger.info("ChecklistModule initialized")
            
            return True
        except Exception as e:
            self._error = e
            return False
    
    def _do_shutdown(self) -> None:
        """清理资源"""
        self._generator = None
        self._templates.clear()
    
    def generate_checklist(self, phase: str, module: str, version: str):
        """生成清单"""
        if self._generator:
            return self._generator.generate(phase, module, version)
        return []
    
    def get_template(self, phase: str):
        """获取模板"""
        if phase not in self._templates:
            self._templates[phase] = self._load_template(phase)
        return self._templates[phase]


# ===== 示例3: 使用配置注册模块 =====

def register_all_modules():
    """注册所有模块"""
    registry = get_registry()
    
    # 注册查询引擎
    registry.register(
        "troubleshooting.query_engine",
        QueryEngineModule,
        dependencies=[]
    )
    
    # 注册清单生成器（依赖查询引擎）
    registry.register(
        "checklist.generator",
        ChecklistModule,
        dependencies=["troubleshooting.query_engine"]
    )


def initialize_system():
    """初始化系统"""
    registry = get_registry()
    
    # 注册模块
    register_all_modules()
    
    # 验证依赖
    missing = registry.validate_dependencies()
    if missing:
        raise RuntimeError(f"Missing dependencies: {missing}")
    
    # 初始化所有模块
    results = registry.initialize_all()
    
    return all(results.values())


def shutdown_system():
    """关闭系统"""
    registry = get_registry()
    return registry.shutdown_all()


# ===== 示例4: 延迟加载模式 =====

def create_lazy_module(name: str, class_path: str):
    """创建延迟加载模块配置"""
    return ModuleConfig(
        name=name,
        class_path=class_path,
        dependencies=[],
        lazy=True  # 延迟加载
    )


# ===== 示例5: YAML配置加载 =====

MODULE_CONFIG_YAML = """
troubleshooting.query_engine:
  class_path: "故障排除助手.core.query_engine:OptimizedQueryEngine"
  dependencies: []
  lazy: false

checklist.generator:
  class_path: "实施检查清单生成器.core.checklist_generator:ChecklistGenerator"
  dependencies:
    - "troubleshooting.query_engine"
  lazy: false
"""

# 使用方式：
# factory = load_from_yaml("modules.yaml")
# factory.create_all()
