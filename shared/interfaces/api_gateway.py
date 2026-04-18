"""
统一API路由处理器
实现标准化的API接口路由和请求处理
"""

from typing import Any, Dict, List, Optional, Callable, Type, Union
from dataclasses import dataclass, field
from enum import Enum
import time
import uuid
import json
from functools import wraps

from .specifications import (
    APIRequest, 
    APIResponse, 
    InterfaceType,
    InterfaceAdapter
)


class HTTPMethod(Enum):
    """HTTP方法枚举"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"


@dataclass
class RouteConfig:
    """路由配置"""
    path: str
    method: HTTPMethod
    handler: Callable
    description: str = ""
    params_schema: Optional[Dict] = None
    response_schema: Optional[Dict] = None
    auth_required: bool = False
    rate_limit: Optional[int] = None  # 每分钟请求数限制


@dataclass
class APIEndpoint:
    """API端点定义"""
    name: str
    version: str
    routes: List[RouteConfig] = field(default_factory=list)
    middleware: List[Callable] = field(default_factory=list)


class RequestValidator:
    """请求验证器"""
    
    @staticmethod
    def validate_request(request: APIRequest, schema: Dict) -> tuple[bool, Optional[str]]:
        """
        验证请求格式
        
        Args:
            request: API请求
            schema: 验证schema
            
        Returns:
            (是否有效, 错误信息)
        """
        # 验证必需参数
        required = schema.get("required", [])
        for param in required:
            if param not in request.params:
                return False, f"Missing required parameter: {param}"
        
        # 验证参数类型
        properties = schema.get("properties", {})
        for key, value in request.params.items():
            if key in properties:
                expected_type = properties[key].get("type")
                if not RequestValidator._check_type(value, expected_type):
                    return False, f"Invalid type for {key}: expected {expected_type}"
        
        return True, None
    
    @staticmethod
    def _check_type(value: Any, expected_type: str) -> bool:
        """检查类型"""
        type_map = {
            "string": str,
            "number": (int, float),
            "integer": int,
            "boolean": bool,
            "array": list,
            "object": dict,
        }
        
        expected = type_map.get(expected_type)
        if expected:
            return isinstance(value, expected)
        return True


class APIGateway:
    """API网关 - 统一路由和请求处理"""
    
    def __init__(self):
        self._endpoints: Dict[str, APIEndpoint] = {}
        self._routes: Dict[str, RouteConfig] = {}  # path -> config
        self._adapters: InterfaceAdapter = InterfaceAdapter()
        self._middleware: List[Callable] = []
        self._request_validators: Dict[str, Dict] = {}
        self._rate_limiter: Dict[str, List[float]] = {}
    
    def register_endpoint(self, endpoint: APIEndpoint) -> None:
        """注册API端点"""
        self._endpoints[endpoint.name] = endpoint
        for route in endpoint.routes:
            self._register_route(endpoint, route)
    
    def _register_route(self, endpoint: APIEndpoint, route: RouteConfig) -> None:
        """注册路由"""
        key = f"{endpoint.version}:{route.method.value}:{route.path}"
        self._routes[key] = route
        
        if route.params_schema:
            self._request_validators[key] = route.params_schema
    
    def register_adapter(self, interface_type: InterfaceType, impl: Any) -> None:
        """注册接口适配器"""
        self._adapters.register(interface_type, impl)
    
    def add_middleware(self, middleware: Callable) -> None:
        """添加中间件"""
        self._middleware.append(middleware)
    
    def handle_request(
        self, 
        method: str, 
        path: str, 
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        version: str = "v1"
    ) -> APIResponse:
        """
        处理API请求
        
        Args:
            method: HTTP方法
            path: 请求路径
            params: 请求参数
            headers: 请求头
            version: API版本
            
        Returns:
            API响应
        """
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # 构建请求
        request = APIRequest(
            action=path,
            params=params or {},
            request_id=request_id,
            timestamp=start_time
        )
        
        # 路由匹配
        route_key = f"{version}:{method}:{path}"
        route = self._routes.get(route_key)
        
        if not route:
            return APIResponse.error_response(
                f"Route not found: {method} {path}",
                error_code="ROUTE_NOT_FOUND",
                request_id=request_id
            )
        
        # 执行中间件
        for mw in self._middleware:
            result = mw(request, route)
            if result is not None and isinstance(result, APIResponse):
                return result
        
        # 速率限制
        if route.rate_limit:
            if not self._check_rate_limit(request_id, route.rate_limit):
                return APIResponse.error_response(
                    "Rate limit exceeded",
                    error_code="RATE_LIMIT",
                    request_id=request_id
                )
        
        # 验证请求
        if route_key in self._request_validators:
            valid, error = RequestValidator.validate_request(
                request, 
                self._request_validators[route_key]
            )
            if not valid:
                return APIResponse.error_response(
                    error,
                    error_code="VALIDATION_ERROR",
                    request_id=request_id
                )
        
        # 执行处理器
        try:
            result = route.handler(request)
            
            return APIResponse.success_response(
                data=result,
                request_id=request_id
            )
        except Exception as e:
            return APIResponse.error_response(
                str(e),
                error_code="INTERNAL_ERROR",
                request_id=request_id
            )
    
    def _check_rate_limit(self, request_id: str, limit: int) -> bool:
        """检查速率限制"""
        now = time.time()
        window = 60  # 1分钟窗口
        
        # 清理过期记录
        self._rate_limiter[request_id] = [
            t for t in self._rate_limiter.get(request_id, [])
            if now - t < window
        ]
        
        if len(self._rate_limiter.get(request_id, [])) >= limit:
            return False
        
        self._rate_limiter.setdefault(request_id, []).append(now)
        return True
    
    def get_route_info(self) -> List[Dict]:
        """获取所有路由信息"""
        info = []
        for route in self._routes.values():
            info.append({
                "path": route.path,
                "method": route.method.value,
                "description": route.description
            })
        return info


# ===== 快捷装饰器 =====

def route(
    path: str,
    method: HTTPMethod = HTTPMethod.POST,
    description: str = "",
    params_schema: Optional[Dict] = None,
    auth_required: bool = False
):
    """路由装饰器"""
    def decorator(func: Callable) -> Callable:
        func._route_config = RouteConfig(
            path=path,
            method=method,
            handler=func,
            description=description,
            params_schema=params_schema,
            auth_required=auth_required
        )
        return func
    return decorator


def validate(schema: Dict):
    """请求验证装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(request: APIRequest) -> Any:
            valid, error = RequestValidator.validate_request(request, schema)
            if not valid:
                raise ValueError(error)
            return func(request)
        return wrapper
    return decorator


# ===== 预定义API端点 =====

def create_troubleshooting_endpoint() -> APIEndpoint:
    """创建故障排除API端点"""
    from .specifications import IQueryEngine
    
    @route("/search", HTTPMethod.POST, "搜索故障知识")
    def search(request: APIRequest):
        adapter = APIGateway()._adapters.get(InterfaceType.QUERY)
        if not adapter:
            raise ValueError("Query engine not registered")
        return adapter.search(
            request.params.get("query", ""),
            request.params.get("version"),
            request.params.get("limit", 10)
        )
    
    @route("/symptom", HTTPMethod.POST, "按症状查询")
    def query_by_symptom(request: APIRequest):
        adapter = APIGateway()._adapters.get(InterfaceType.QUERY)
        if not adapter:
            raise ValueError("Query engine not registered")
        return adapter.query_by_symptom(request.params.get("symptom", ""))
    
    return APIEndpoint(
        name="troubleshooting",
        version="v1",
        routes=[
            search._route_config,
            query_by_symptom._route_config
        ]
    )


def create_checklist_endpoint() -> APIEndpoint:
    """创建清单生成API端点"""
    
    @route("/generate", HTTPMethod.POST, "生成检查清单")
    def generate(request: APIRequest):
        adapter = APIGateway()._adapters.get(InterfaceType.CHECKLIST)
        if not adapter:
            raise ValueError("Checklist generator not registered")
        return adapter.generate(
            request.params.get("phase", ""),
            request.params.get("module", ""),
            request.params.get("version", "")
        )
    
    @route("/phases", HTTPMethod.GET, "获取所有阶段")
    def get_phases(request: APIRequest):
        adapter = APIGateway()._adapters.get(InterfaceType.CHECKLIST)
        if not adapter:
            raise ValueError("Checklist generator not registered")
        return adapter.get_phases()
    
    return APIEndpoint(
        name="checklist",
        version="v1",
        routes=[
            generate._route_config,
            get_phases._route_config
        ]
    )
