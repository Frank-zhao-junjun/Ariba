"""
监控系统
提供指标采集、健康检查和性能监控功能
"""

from typing import Any, Dict, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict
import time
import threading
import psutil
import os


class MetricType(Enum):
    """指标类型"""
    COUNTER = "counter"        # 计数器
    GAUGE = "gauge"           # 仪表值
    HISTOGRAM = "histogram"    # 直方图
    SUMMARY = "summary"       # 摘要


@dataclass
class Metric:
    """指标"""
    name: str
    value: float
    metric_type: MetricType
    labels: Dict[str, str] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "value": self.value,
            "type": self.metric_type.value,
            "labels": self.labels,
            "timestamp": self.timestamp
        }


class MetricsCollector:
    """指标采集器"""
    
    def __init__(self):
        self._metrics: Dict[str, List[Metric]] = defaultdict(list)
        self._counters: Dict[str, float] = defaultdict(float)
        self._gauges: Dict[str, float] = {}
        self._histograms: Dict[str, List[float]] = defaultdict(list)
        self._lock = threading.RLock()
    
    def counter(self, name: str, value: float = 1, labels: Optional[Dict] = None) -> None:
        """增加计数器"""
        with self._lock:
            self._counters[name] += value
            self._metrics[name].append(Metric(
                name=name,
                value=self._counters[name],
                metric_type=MetricType.COUNTER,
                labels=labels or {}
            ))
    
    def gauge(self, name: str, value: float, labels: Optional[Dict] = None) -> None:
        """设置仪表值"""
        with self._lock:
            self._gauges[name] = value
            self._metrics[name].append(Metric(
                name=name,
                value=value,
                metric_type=MetricType.GAUGE,
                labels=labels or {}
            ))
    
    def histogram(self, name: str, value: float, labels: Optional[Dict] = None) -> None:
        """记录直方图值"""
        with self._lock:
            self._histograms[name].append(value)
            self._metrics[name].append(Metric(
                name=name,
                value=value,
                metric_type=MetricType.HISTOGRAM,
                labels=labels or {}
            ))
    
    def get(self, name: str) -> Optional[Dict]:
        """获取指标统计"""
        with self._lock:
            if name in self._counters:
                return {
                    "type": "counter",
                    "value": self._counters[name],
                    "count": len(self._metrics[name])
                }
            elif name in self._gauges:
                return {
                    "type": "gauge",
                    "value": self._gauges[name],
                    "count": len(self._metrics[name])
                }
            elif name in self._histograms:
                values = self._histograms[name]
                return {
                    "type": "histogram",
                    "count": len(values),
                    "sum": sum(values),
                    "min": min(values) if values else 0,
                    "max": max(values) if values else 0,
                    "avg": sum(values) / len(values) if values else 0,
                }
        return None
    
    def get_all(self) -> Dict[str, Any]:
        """获取所有指标"""
        with self._lock:
            result = {}
            for name in self._metrics:
                result[name] = self.get(name)
            return result
    
    def reset(self) -> None:
        """重置所有指标"""
        with self._lock:
            self._metrics.clear()
            self._counters.clear()
            self._gauges.clear()
            self._histograms.clear()


class HealthChecker:
    """健康检查器"""
    
    def __init__(self):
        self._checks: Dict[str, Callable] = {}
        self._last_results: Dict[str, Dict] = {}
    
    def register_check(self, name: str, check: Callable) -> None:
        """注册健康检查"""
        self._checks[name] = check
    
    def check(self, name: str) -> Dict:
        """执行单个检查"""
        if name not in self._checks:
            return {"healthy": False, "error": "Check not found"}
        
        try:
            start = time.time()
            result = self._checks[name]()
            duration = time.time() - start
            
            health_status = {
                "healthy": result.get("healthy", True),
                "duration_ms": round(duration * 1000, 2),
                "details": result
            }
            
            self._last_results[name] = health_status
            return health_status
        except Exception as e:
            return {
                "healthy": False,
                "error": str(e)
            }
    
    def check_all(self) -> Dict:
        """执行所有检查"""
        results = {}
        overall_healthy = True
        
        for name in self._checks:
            result = self.check(name)
            results[name] = result
            if not result.get("healthy", False):
                overall_healthy = False
        
        return {
            "healthy": overall_healthy,
            "timestamp": time.time(),
            "checks": results
        }


class SystemMonitor:
    """系统监控"""
    
    @staticmethod
    def get_cpu_usage() -> float:
        """获取CPU使用率"""
        return psutil.cpu_percent(interval=0.1)
    
    @staticmethod
    def get_memory_usage() -> Dict[str, float]:
        """获取内存使用"""
        mem = psutil.virtual_memory()
        return {
            "total": mem.total,
            "available": mem.available,
            "used": mem.used,
            "percent": mem.percent
        }
    
    @staticmethod
    def get_disk_usage(path: str = "/") -> Dict[str, float]:
        """获取磁盘使用"""
        disk = psutil.disk_usage(path)
        return {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        }
    
    @staticmethod
    def get_process_info() -> Dict:
        """获取进程信息"""
        process = psutil.Process(os.getpid())
        return {
            "pid": process.pid,
            "memory_mb": process.memory_info().rss / 1024 / 1024,
            "cpu_percent": process.cpu_percent(),
            "num_threads": process.num_threads()
        }


class PerformanceMonitor:
    """性能监控器"""
    
    def __init__(self):
        self._metrics = MetricsCollector()
        self._start_times: Dict[str, float] = {}
    
    def start_timer(self, name: str) -> None:
        """开始计时"""
        self._start_times[name] = time.time()
    
    def stop_timer(self, name: str) -> Optional[float]:
        """停止计时并记录"""
        if name not in self._start_times:
            return None
        
        duration = time.time() - self._start_times[name]
        self._metrics.histogram(f"{name}_duration", duration * 1000)  # 毫秒
        del self._start_times[name]
        return duration
    
    def record_request(self, endpoint: str, status: int, duration: float) -> None:
        """记录请求"""
        self._metrics.counter("requests_total", 1, {"endpoint": endpoint, "status": str(status)})
        self._metrics.histogram("request_duration", duration, {"endpoint": endpoint})
    
    def get_metrics(self) -> Dict:
        """获取性能指标"""
        return self._metrics.get_all()


# ===== 预定义健康检查 =====

def create_default_health_checks(app_state: Optional[Dict] = None) -> HealthChecker:
    """创建默认健康检查"""
    checker = HealthChecker()
    
    # 系统健康检查
    def system_check():
        cpu = SystemMonitor.get_cpu_usage()
        memory = SystemMonitor.get_memory_usage()
        
        healthy = cpu < 90 and memory["percent"] < 90
        return {
            "healthy": healthy,
            "cpu_percent": cpu,
            "memory_percent": memory["percent"],
            "issues": []
        }
    
    checker.register_check("system", system_check)
    
    # 应用健康检查
    def app_check():
        if app_state is None:
            return {"healthy": True, "status": "running"}
        
        return {
            "healthy": app_state.get("ready", True),
            "status": app_state.get("status", "running")
        }
    
    checker.register_check("app", app_check)
    
    return checker


# 全局实例
_metrics_collector: Optional[MetricsCollector] = None
_health_checker: Optional[HealthChecker] = None
_performance_monitor: Optional[PerformanceMonitor] = None


def get_metrics_collector() -> MetricsCollector:
    """获取全局指标采集器"""
    global _metrics_collector
    if _metrics_collector is None:
        _metrics_collector = MetricsCollector()
    return _metrics_collector


def get_health_checker() -> HealthChecker:
    """获取全局健康检查器"""
    global _health_checker
    if _health_checker is None:
        _health_checker = create_default_health_checks()
    return _health_checker


def get_performance_monitor() -> PerformanceMonitor:
    """获取全局性能监控器"""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = PerformanceMonitor()
    return _performance_monitor
