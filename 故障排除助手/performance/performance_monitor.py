"""
性能监控器 - US10 AC10.4

性能指标优化监控
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque
import time


@dataclass
class PerformanceMetric:
    """性能指标"""
    operation: str
    duration_ms: float
    timestamp: datetime
    success: bool = True
    metadata: Dict = field(default_factory=dict)


class PerformanceMonitor:
    """
    性能监控器
    
    AC10.4: 性能指标优化
    """
    
    def __init__(self, window_size: int = 1000):
        self.metrics: deque = deque(maxlen=window_size)
        self.operation_stats: Dict[str, Dict] = {}
        self.thresholds = {
            "query": 100,  # 查询应该<100ms
            "cache": 10,   # 缓存应该<10ms
            "index": 50    # 索引应该<50ms
        }
    
    def record(self, operation: str, duration_ms: float, success: bool = True, metadata: Dict = None):
        """记录性能指标"""
        metric = PerformanceMetric(
            operation=operation,
            duration_ms=duration_ms,
            timestamp=datetime.now(),
            success=success,
            metadata=metadata or {}
        )
        
        self.metrics.append(metric)
        self._update_stats(operation, duration_ms, success)
    
    def _update_stats(self, operation: str, duration_ms: float, success: bool):
        """更新统计"""
        if operation not in self.operation_stats:
            self.operation_stats[operation] = {
                "count": 0,
                "total_ms": 0,
                "min_ms": float('inf'),
                "max_ms": 0,
                "failures": 0,
                "durations": []
            }
        
        stats = self.operation_stats[operation]
        stats["count"] += 1
        stats["total_ms"] += duration_ms
        stats["min_ms"] = min(stats["min_ms"], duration_ms)
        stats["max_ms"] = max(stats["max_ms"], duration_ms)
        stats["durations"].append(duration_ms)
        if not success:
            stats["failures"] += 1
        
        # 保持最近100个duration
        if len(stats["durations"]) > 100:
            stats["durations"] = stats["durations"][-100:]
    
    def get_stats(self, operation: str = None) -> Dict:
        """获取统计信息"""
        if operation:
            return self._get_operation_stats(operation)
        return {op: self._get_operation_stats(op) for op in self.operation_stats}
    
    def _get_operation_stats(self, operation: str) -> Dict:
        """获取单个操作的统计"""
        if operation not in self.operation_stats:
            return {}
        
        stats = self.operation_stats[operation]
        durations = stats["durations"]
        
        avg_ms = stats["total_ms"] / stats["count"] if stats["count"] > 0 else 0
        
        # 计算百分位数
        sorted_durations = sorted(durations)
        p50 = sorted_durations[len(sorted_durations) // 2] if sorted_durations else 0
        p95 = sorted_durations[int(len(sorted_durations) * 0.95)] if sorted_durations else 0
        p99 = sorted_durations[int(len(sorted_durations) * 0.99)] if sorted_durations else 0
        
        # 是否达标
        threshold = self.thresholds.get(operation, 100)
        avg_latency_ok = avg_ms < threshold
        
        return {
            "count": stats["count"],
            "avg_ms": round(avg_ms, 2),
            "min_ms": round(stats["min_ms"], 2) if stats["min_ms"] != float('inf') else 0,
            "max_ms": round(stats["max_ms"], 2),
            "p50_ms": round(p50, 2),
            "p95_ms": round(p95, 2),
            "p99_ms": round(p99, 2),
            "failures": stats["failures"],
            "failure_rate": round(stats["failures"] / stats["count"], 4) if stats["count"] > 0 else 0,
            "threshold_ms": threshold,
            "meets_slo": avg_latency_ok
        }
    
    def check_performance(self) -> Dict:
        """检查性能是否达标"""
        results = []
        
        for operation, stats in self.get_stats().items():
            if stats:
                is_ok = stats.get("meets_slo", False)
                results.append({
                    "operation": operation,
                    "avg_ms": stats.get("avg_ms", 0),
                    "threshold": stats.get("threshold_ms", 0),
                    "status": "✅ OK" if is_ok else "❌ SLOW"
                })
        
        overall_ok = all(r["status"] == "✅ OK" for r in results)
        
        return {
            "overall": "✅ 性能达标" if overall_ok else "❌ 存在性能问题",
            "checks": results
        }
    
    def get_recent_metrics(self, minutes: int = 5) -> List[Dict]:
        """获取最近的指标"""
        cutoff = datetime.now() - timedelta(minutes=minutes)
        return [
            {
                "operation": m.operation,
                "duration_ms": m.duration_ms,
                "timestamp": m.timestamp.isoformat(),
                "success": m.success
            }
            for m in self.metrics
            if m.timestamp > cutoff
        ]


class PerformanceDecorator:
    """性能监控装饰器"""
    
    def __init__(self, monitor: PerformanceMonitor):
        self.monitor = monitor
    
    def __call__(self, func):
        def wrapper(*args, **kwargs):
            start = time.time()
            success = True
            result = None
            error = None
            
            try:
                result = func(*args, **kwargs)
            except Exception as e:
                success = False
                error = str(e)
                raise
            finally:
                duration_ms = (time.time() - start) * 1000
                self.monitor.record(
                    operation=func.__name__,
                    duration_ms=duration_ms,
                    success=success,
                    metadata={"error": error} if error else {}
                )
            
            return result
        
        return wrapper


# 全局实例
performance_monitor = PerformanceMonitor()


__all__ = ["PerformanceMonitor", "performance_monitor", "PerformanceMetric", "PerformanceDecorator"]
