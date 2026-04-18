"""
统一的日志配置模块
"""

import logging
import sys
from typing import Optional
from pathlib import Path
from datetime import datetime

# 日志格式
DEFAULT_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
DEFAULT_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# 日志级别
LOG_LEVELS = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}


def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    format_string: Optional[str] = None,
    date_format: Optional[str] = None,
) -> logging.Logger:
    """
    配置日志系统
    
    Args:
        level: 日志级别
        log_file: 日志文件路径（可选）
        format_string: 日志格式字符串
        date_format: 日期格式
    
    Returns:
        配置好的Logger对象
    """
    # 获取根logger
    logger = logging.getLogger("ariba_assistant")
    logger.setLevel(LOG_LEVELS.get(level.upper(), logging.INFO))
    
    # 清除已有的处理器
    logger.handlers.clear()
    
    # 设置格式
    fmt = format_string or DEFAULT_FORMAT
    date_fmt = date_format or DEFAULT_DATE_FORMAT
    formatter = logging.Formatter(fmt, datefmt=date_fmt)
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 文件处理器（如果指定）
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    获取指定名称的Logger
    
    Args:
        name: Logger名称，通常使用__name__
    
    Returns:
        Logger对象
    """
    return logging.getLogger(f"ariba_assistant.{name}")


class LogContext:
    """日志上下文管理器"""
    
    def __init__(self, logger: logging.Logger, message: str, level: str = "INFO"):
        self.logger = logger
        self.message = message
        self.level = level.upper()
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.now()
        getattr(self.logger, self.level.lower())(f"开始: {self.message}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = (datetime.now() - self.start_time).total_seconds()
        if exc_type:
            self.logger.error(f"失败: {self.message} - {exc_type.__name__}: {exc_val} (耗时: {elapsed:.3f}s)")
        else:
            getattr(self.logger, self.level.lower())(f"完成: {self.message} (耗时: {elapsed:.3f}s)")
        return False


# 便捷函数
def log_operation(operation: str, level: str = "INFO"):
    """
    操作日志装饰器
    
    Args:
        operation: 操作名称
        level: 日志级别
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = datetime.now()
            getattr(logger, level.lower())(f"[{operation}] 开始: {func.__name__}")
            try:
                result = func(*args, **kwargs)
                elapsed = (datetime.now() - start_time).total_seconds()
                getattr(logger, level.lower())(f"[{operation}] 完成: {func.__name__} (耗时: {elapsed:.3f}s)")
                return result
            except Exception as e:
                elapsed = (datetime.now() - start_time).total_seconds()
                logger.exception(f"[{operation}] 失败: {func.__name__} - {e} (耗时: {elapsed:.3f}s)")
                raise
        return wrapper
    return decorator


# 默认初始化
def init_logging():
    """初始化日志系统"""
    return setup_logging(level="INFO")


__all__ = [
    "setup_logging",
    "get_logger",
    "LogContext",
    "log_operation",
    "init_logging",
]
