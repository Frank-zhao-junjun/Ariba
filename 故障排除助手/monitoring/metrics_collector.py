"""
指标采集器 - US7 AC7.1

实时采集关键指标
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict
from enum import Enum
import json


class MetricType(Enum):
    """指标类型"""
    QUERY_COUNT = "query_count"           # 查询次数
    QUERY_LATENCY = "query_latency"       # 查询延迟
    ERROR_RATE = "error_rate"             # 错误率
    KNOWLEDGE_HITS = "knowledge_hits"     # 知识命中
    USER_ACTIVITY = "user_activity"       # 用户活动
    SYSTEM_HEALTH = "system_health"       # 系统健康度


@dataclass
class Metric:
    """指标数据"""
    name: str
    value: float
    metric_type: MetricType
    timestamp: datetime
    tags: Dict = field(default_factory=dict)
    unit: str = ""


@dataclass
class MetricSnapshot:
    """指标快照"""
    timestamp: datetime
    metrics: List[Metric]
    summary: Dict


class MetricsCollector:
    """
    指标采集器
    
    AC7.1: 关键指标实时采集
    """
    
    def __init__(self):
        self.metrics_store: List[Metric] = []
        self.aggregations: Dict[str, List[float]] = defaultdict(list)
    
    def record_metric(
        self,
        name: str,
        value: float,
        metric_type: MetricType,
        tags: Dict = None,
        unit: str = ""
    ) -> Metric:
        """
        记录指标
        
        Args:
            name: 指标名称
            value: 指标值
            metric_type: 指标类型
            tags: 标签
            unit: 单位
            
        Returns:
            指标对象
        """
        metric = Metric(
            name=name,
            value=value,
            metric_type=metric_type,
            timestamp=datetime.now(),
            tags=tags or {},
            unit=unit
        )
        
        self.metrics_store.append(metric)
        self.aggregations[name].append(value)
        
        # 保持最近10000条
        if len(self.metrics_store) > 10000:
            self.metrics_store = self.metrics_store[-5000:]
        
        return metric
    
    def record_query(self, query: str, latency_ms: float, hits: int, errors: int = 0):
        """记录查询指标"""
        self.record_metric("queries", 1, MetricType.QUERY_COUNT)
        self.record_metric("query_latency", latency_ms, MetricType.QUERY_LATENCY, unit="ms")
        self.record_metric("knowledge_hits", hits, MetricType.KNOWLEDGE_HITS)
        if errors > 0:
            self.record_metric("errors", errors, MetricType.ERROR_RATE)
    
    def record_user_activity(self, user_id: str, action: str):
        """记录用户活动"""
        self.record_metric(
            "user_activity", 1,
            MetricType.USER_ACTIVITY,
            tags={"user_id": user_id, "action": action}
        )
    
    def get_current_metrics(self) -> MetricSnapshot:
        """获取当前指标快照"""
        now = datetime.now()
        recent = [
            m for m in self.metrics_store
            if (now - m.timestamp).total_seconds() < 300  # 最近5分钟
        ]
        
        # 计算摘要
        summary = self._calculate_summary(recent)
        
        return MetricSnapshot(
            timestamp=now,
            metrics=recent,
            summary=summary
        )
    
    def _calculate_summary(self, metrics: List[Metric]) -> Dict:
        """计算指标摘要"""
        summary = {}
        
        for metric in metrics:
            name = metric.name
            if name not in summary:
                summary[name] = {
                    "count": 0,
                    "sum": 0,
                    "min": float('inf'),
                    "max": float('-inf'),
                    "avg": 0
                }
            
            s = summary[name]
            s["count"] += 1
            s["sum"] += metric.value
            s["min"] = min(s["min"], metric.value)
            s["max"] = max(s["max"], metric.value)
            s["avg"] = s["sum"] / s["count"]
        
        # 计算错误率
        if "queries" in summary and "errors" in summary:
            queries = summary["queries"]["sum"]
            errors = summary["errors"]["sum"]
            summary["error_rate"] = {"value": errors / queries if queries > 0 else 0}
        
        return summary
    
    def get_metrics_by_type(self, metric_type: MetricType, minutes: int = 5) -> List[Metric]:
        """按类型获取指标"""
        cutoff = datetime.now() - timedelta(minutes=minutes)
        return [
            m for m in self.metrics_store
            if m.metric_type == metric_type and m.timestamp > cutoff
        ]
    
    def get_time_series(
        self,
        metric_name: str,
        start: datetime = None,
        end: datetime = None,
        interval_seconds: int = 60
    ) -> List[Dict]:
        """获取时间序列数据"""
        if start is None:
            start = datetime.now() - timedelta(hours=1)
        if end is None:
            end = datetime.now()
        
        metrics = [
            m for m in self.metrics_store
            if m.name == metric_name and start <= m.timestamp <= end
        ]
        
        # 按时间桶聚合
        buckets = defaultdict(list)
        for m in metrics:
            bucket_time = m.timestamp.replace(
                second=0, microsecond=0
            )
            if interval_seconds >= 60:
                bucket_time = bucket_time.replace(minute=0)
            buckets[bucket_time].append(m.value)
        
        # 计算每个桶的统计
        result = []
        for bucket_time in sorted(buckets.keys()):
            values = buckets[bucket_time]
            result.append({
                "timestamp": bucket_time.isoformat(),
                "count": len(values),
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values)
            })
        
        return result
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        total_metrics = len(self.metrics_store)
        unique_names = set(m.name for m in self.metrics_store)
        
        return {
            "total_metrics": total_metrics,
            "unique_metrics": len(unique_names),
            "metric_names": list(unique_names),
            "time_range": {
                "oldest": min(m.timestamp for m in self.metrics_store).isoformat() if self.metrics_store else None,
                "newest": max(m.timestamp for m in self.metrics_store).isoformat() if self.metrics_store else None
            }
        }


# 全局实例
metrics_collector = MetricsCollector()


__all__ = ["MetricsCollector", "metrics_collector", "Metric", "MetricSnapshot", "MetricType"]
