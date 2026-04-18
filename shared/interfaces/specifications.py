"""
统一接口规范定义
定义项目中所有模块的标准化接口
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, Callable
from dataclasses import dataclass, field
from enum import Enum
import json


# ===== 接口类型定义 =====

class InterfaceType(Enum):
    """接口类型枚举"""
    QUERY = "query"                    # 查询接口
    CHECKLIST = "checklist"            # 清单生成接口
    KNOWLEDGE = "knowledge"             # 知识库接口
    ANALYTICS = "analytics"             # 分析接口
    NOTIFICATION = "notification"       # 通知接口
    CONFIG = "config"                   # 配置接口
    HEALTH = "health"                   # 健康检查接口


# ===== 通用请求/响应格式 =====

@dataclass
class APIRequest:
    """通用请求格式"""
    action: str                          # 操作类型
    params: Dict[str, Any] = field(default_factory=dict)  # 参数
    request_id: Optional[str] = None     # 请求ID（用于追踪）
    timestamp: Optional[float] = None     # 时间戳
    version: str = "1.0"                 # 接口版本
    
    def to_dict(self) -> Dict:
        return {
            "action": self.action,
            "params": self.params,
            "request_id": self.request_id,
            "timestamp": self.timestamp,
            "version": self.version
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "APIRequest":
        return cls(
            action=data.get("action", ""),
            params=data.get("params", {}),
            request_id=data.get("request_id"),
            timestamp=data.get("timestamp"),
            version=data.get("version", "1.0")
        )


@dataclass
class APIResponse:
    """通用响应格式"""
    success: bool                        # 是否成功
    data: Any = None                     # 响应数据
    error: Optional[str] = None          # 错误信息
    error_code: Optional[str] = None     # 错误码
    request_id: Optional[str] = None      # 关联请求ID
    timestamp: float = field(default_factory=0)  # 响应时间戳
    
    def to_dict(self) -> Dict:
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "error_code": self.error_code,
            "request_id": self.request_id,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def success_response(cls, data: Any, request_id: Optional[str] = None) -> "APIResponse":
        import time
        return cls(
            success=True,
            data=data,
            request_id=request_id,
            timestamp=time.time()
        )
    
    @classmethod
    def error_response(cls, error: str, error_code: Optional[str] = None, 
                      request_id: Optional[str] = None) -> "APIResponse":
        import time
        return cls(
            success=False,
            error=error,
            error_code=error_code,
            request_id=request_id,
            timestamp=time.time()
        )


# ===== 查询接口定义 =====

class IQueryEngine(ABC):
    """查询引擎接口"""
    
    @abstractmethod
    def search(self, query: str, version: Optional[str] = None, 
               limit: int = 10) -> List[Dict[str, Any]]:
        """
        搜索故障知识
        
        Args:
            query: 搜索关键词
            version: 版本筛选
            limit: 返回数量限制
            
        Returns:
            搜索结果列表
        """
        pass
    
    @abstractmethod
    def query_by_symptom(self, symptom: str) -> List[Dict[str, Any]]:
        """按症状查询"""
        pass
    
    @abstractmethod
    def get_related_knowledge(self, knowledge_id: str) -> Optional[Dict[str, Any]]:
        """获取相关知识"""
        pass


# ===== 清单生成接口定义 =====

class IChecklistGenerator(ABC):
    """清单生成器接口"""
    
    @abstractmethod
    def generate(
        self,
        phase: str,
        module: str,
        version: str,
        options: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        生成实施检查清单
        
        Args:
            phase: 项目阶段
            module: Ariba模块
            version: 版本
            options: 生成选项
            
        Returns:
            清单项列表
        """
        pass
    
    @abstractmethod
    def get_phases(self) -> List[str]:
        """获取所有阶段"""
        pass
    
    @abstractmethod
    def get_modules(self) -> List[str]:
        """获取所有模块"""
        pass


# ===== 知识库接口定义 =====

class IKnowledgeBase(ABC):
    """知识库接口"""
    
    @abstractmethod
    def get_knowledge(self, knowledge_id: str) -> Optional[Dict[str, Any]]:
        """获取知识项"""
        pass
    
    @abstractmethod
    def list_knowledge(self, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """列出知识项"""
        pass
    
    @abstractmethod
    def add_knowledge(self, knowledge: Dict[str, Any]) -> str:
        """添加知识项"""
        pass
    
    @abstractmethod
    def update_knowledge(self, knowledge_id: str, 
                         updates: Dict[str, Any]) -> bool:
        """更新知识项"""
        pass
    
    @abstractmethod
    def delete_knowledge(self, knowledge_id: str) -> bool:
        """删除知识项"""
        pass


# ===== 分析接口定义 =====

class IAnalytics(ABC):
    """分析引擎接口"""
    
    @abstractmethod
    def analyze_usage(self, time_range: str) -> Dict[str, Any]:
        """分析使用情况"""
        pass
    
    @abstractmethod
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        pass


# ===== 配置接口定义 =====

class IConfigManager(ABC):
    """配置管理器接口"""
    
    @abstractmethod
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值"""
        pass
    
    @abstractmethod
    def set(self, key: str, value: Any) -> bool:
        """设置配置值"""
        pass
    
    @abstractmethod
    def get_all(self) -> Dict[str, Any]:
        """获取所有配置"""
        pass
    
    @abstractmethod
    def reload(self) -> bool:
        """重新加载配置"""
        pass


# ===== 健康检查接口 =====

class IHealthCheck(ABC):
    """健康检查接口"""
    
    @abstractmethod
    def check_health(self) -> Dict[str, Any]:
        """
        执行健康检查
        
        Returns:
            {
                "healthy": bool,
                "checks": {...},
                "issues": [...]
            }
        """
        pass


# ===== 版本管理接口 =====

class IVersionManager(ABC):
    """版本管理器接口"""
    
    @abstractmethod
    def normalize_version(self, version: str) -> str:
        """规范化版本号"""
        pass
    
    @abstractmethod
    def compare_versions(self, v1: str, v2: str) -> int:
        """比较版本"""
        pass
    
    @abstractmethod
    def get_supported_versions(self) -> List[str]:
        """获取支持的版本"""
        pass


# ===== 统一接口适配器 =====

class InterfaceAdapter:
    """接口适配器 - 统一不同接口的调用方式"""
    
    def __init__(self):
        self._adapters: Dict[InterfaceType, Any] = {}
    
    def register(self, interface_type: InterfaceType, impl: Any):
        """注册接口实现"""
        self._adapters[interface_type] = impl
    
    def get(self, interface_type: InterfaceType) -> Any:
        """获取接口实现"""
        return self._adapters.get(interface_type)
    
    def call(self, interface_type: InterfaceType, method: str, *args, **kwargs) -> Any:
        """统一调用接口方法"""
        adapter = self.get(interface_type)
        if adapter is None:
            raise ValueError(f"Interface {interface_type} not registered")
        
        if not hasattr(adapter, method):
            raise AttributeError(f"Method {method} not found in {interface_type}")
        
        return getattr(adapter, method)(*args, **kwargs)


# ===== 接口文档生成器 =====

class InterfaceDocumentor:
    """接口文档生成器"""
    
    @staticmethod
    def generate_markdown(interface_class: Type) -> str:
        """生成Markdown格式接口文档"""
        lines = [
            f"# {interface_class.__name__}",
            "",
            f"{interface_class.__doc__ or ''}",
            "",
            "## 方法列表",
            ""
        ]
        
        for name, method in interface_class.__dict__.items():
            if name.startswith('_'):
                continue
            if callable(method):
                doc = method.__doc__ or "无描述"
                lines.append(f"### `{name}()`")
                lines.append("")
                lines.append(f"{doc}")
                lines.append("")
        
        return '\n'.join(lines)
    
    @staticmethod
    def generate_openapi(interface_class: Type, title: str) -> Dict:
        """生成OpenAPI格式文档"""
        paths = {}
        methods = [m for m in dir(interface_class) if not m.startswith('_') and callable(getattr(interface_class, m))]
        
        for method_name in methods:
            paths[f"/{method_name}"] = {
                "post": {
                    "summary": method_name,
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "params": {"type": "object"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Success",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Response"}
                                }
                            }
                        }
                    }
                }
            }
        
        return {
            "openapi": "3.0.0",
            "info": {"title": title, "version": "1.0"},
            "paths": paths,
            "components": {
                "schemas": {
                    "Response": {
                        "type": "object",
                        "properties": {
                            "success": {"type": "boolean"},
                            "data": {"type": "object"},
                            "error": {"type": "string"}
                        }
                    }
                }
            }
        }
