"""
统一的异常处理模块
"""

from typing import Optional, Any, Dict, Callable
from functools import wraps
import logging
import traceback
from datetime import datetime

logger = logging.getLogger("ariba_assistant.exceptions")


class AribaAssistantError(Exception):
    """Ariba实施助手基础异常类"""
    
    def __init__(self, message: str, code: Optional[str] = None, details: Optional[Dict] = None):
        super().__init__(message)
        self.message = message
        self.code = code or "E0000"
        self.details = details or {}
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "error": self.__class__.__name__,
            "message": self.message,
            "code": self.code,
            "details": self.details,
            "timestamp": self.timestamp
        }


class KnowledgeBaseError(AribaAssistantError):
    """知识库相关异常"""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, code="KB0001", details=details)


class QueryEngineError(AribaAssistantError):
    """查询引擎异常"""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, code="QE0001", details=details)


class ChecklistError(AribaAssistantError):
    """清单生成异常"""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, code="CL0001", details=details)


class ValidationError(AribaAssistantError):
    """数据验证异常"""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, code="VAL0001", details=details)


class ConfigurationError(AribaAssistantError):
    """配置异常"""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, code="CFG0001", details=details)


def handle_exceptions(
    default_return: Any = None,
    log_traceback: bool = True,
    reraise: bool = False
) -> Callable:
    """
    异常处理装饰器
    
    Args:
        default_return: 默认返回值
        log_traceback: 是否记录堆栈跟踪
        reraise: 是否重新抛出异常
    
    Returns:
        装饰器函数
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except AribaAssistantError:
                # 已知的业务异常，重新抛出或记录
                if reraise:
                    raise
                logger.warning(f"业务异常: {func.__name__}")
                return default_return
            except Exception as e:
                # 未知异常
                if log_traceback:
                    logger.error(
                        f"系统异常 in {func.__name__}: {type(e).__name__}: {str(e)}\n"
                        f"堆栈: {traceback.format_exc()}"
                    )
                else:
                    logger.error(f"系统异常: {func.__name__}: {type(e).__name__}: {str(e)}")
                
                if reraise:
                    raise
                return default_return
        return wrapper
    return decorator


def safe_execute(
    func: Callable,
    *args,
    default: Any = None,
    log_errors: bool = True,
    **kwargs
) -> Any:
    """
    安全执行函数
    
    Args:
        func: 要执行的函数
        *args: 位置参数
        default: 执行失败时的默认值
        log_errors: 是否记录错误
        **kwargs: 关键字参数
    
    Returns:
        函数返回值或默认值
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        if log_errors:
            logger.error(f"执行失败 {func.__name__}: {type(e).__name__}: {str(e)}")
        return default


def with_error_handling(
    success_message: Optional[str] = None,
    error_message: Optional[str] = None
) -> Callable:
    """
    带错误处理的装饰器
    
    Args:
        success_message: 成功时的消息模板
        error_message: 失败时的消息模板
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                if success_message:
                    logger.info(success_message.format(result=result))
                return result
            except Exception as e:
                msg = error_message or f"执行 {func.__name__} 失败"
                logger.error(f"{msg}: {type(e).__name__}: {str(e)}")
                raise
        return wrapper
    return decorator


class ErrorCollector:
    """错误收集器 - 用于收集多个错误"""
    
    def __init__(self):
        self.errors = []
    
    def add(self, error: Exception, context: Optional[str] = None):
        """添加错误"""
        self.errors.append({
            "type": type(error).__name__,
            "message": str(error),
            "context": context,
            "timestamp": datetime.now().isoformat()
        })
    
    def has_errors(self) -> bool:
        """是否有错误"""
        return len(self.errors) > 0
    
    def get_errors(self) -> list:
        """获取所有错误"""
        return self.errors
    
    def clear(self):
        """清空错误"""
        self.errors.clear()
    
    def log_all(self):
        """记录所有错误"""
        for error in self.errors:
            logger.error(
                f"[{error['context']}] {error['type']}: {error['message']}"
            )


__all__ = [
    "AribaAssistantError",
    "KnowledgeBaseError",
    "QueryEngineError",
    "ChecklistError",
    "ValidationError",
    "ConfigurationError",
    "handle_exceptions",
    "safe_execute",
    "with_error_handling",
    "ErrorCollector",
]
