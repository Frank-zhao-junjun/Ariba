"""
异常检测器 - US7 AC7.2

基于历史数据的异常检测算法
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import deque
import math


@dataclass
class Anomaly:
    """异常"""
    anomaly_type: str
    metric_name: str
    value: float
    expected_value: float
    deviation: float
    severity: str  # low, medium, high, critical
    timestamp: datetime
    message: str


class AnomalyDetector:
    """
    异常检测器
    
    AC7.2: 异常检测算法
    """
    
    def __init__(self):
        self.baseline: Dict[str, Dict] = {}
        self.history: deque = deque(maxlen=1000)
    
    def learn_baseline(self, metric_name: str, values: List[float]):
        """
        学习基线
        
        Args:
            metric_name: 指标名称
            values: 历史值列表
        """
        if not values:
            return
        
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        std_dev = math.sqrt(variance) if variance > 0 else 1.0
        
        self.baseline[metric_name] = {
            "mean": mean,
            "std_dev": std_dev,
            "min": min(values),
            "max": max(values),
            "count": len(values),
            "updated_at": datetime.now()
        }
    
    def detect_anomaly(
        self,
        metric_name: str,
        value: float,
        timestamp: datetime = None
    ) -> Optional[Anomaly]:
        """
        检测异常
        
        Args:
            metric_name: 指标名称
            value: 当前值
            timestamp: 时间戳
            
        Returns:
            异常对象或None
        """
        if metric_name not in self.baseline:
            # 没有基线，无法检测
            return None
        
        timestamp = timestamp or datetime.now()
        baseline = self.baseline[metric_name]
        
        # Z-score检测
        z_score = (value - baseline["mean"]) / baseline["std_dev"] if baseline["std_dev"] > 0 else 0
        
        # 阈值检测
        abs_z = abs(z_score)
        
        if abs_z < 2:
            return None  # 正常范围内
        
        # 计算偏差
        deviation = (value - baseline["mean"]) / baseline["mean"] * 100 if baseline["mean"] > 0 else 0
        
        # 判断严重程度
        if abs_z >= 4:
            severity = "critical"
        elif abs_z >= 3:
            severity = "high"
        elif abs_z >= 2.5:
            severity = "medium"
        else:
            severity = "low"
        
        # 异常类型
        if value > baseline["max"]:
            anomaly_type = "spike"
            message = f"突增: 当前值 {value:.2f} 超过历史最大值 {baseline['max']:.2f}"
        elif value < baseline["min"] * 0.5:
            anomaly_type = "drop"
            message = f"骤降: 当前值 {value:.2f} 低于历史最小值 {baseline['min']:.2f}"
        elif z_score > 0:
            anomaly_type = "high"
            message = f"偏高: 当前值 {value:.2f} 高于均值 {baseline['mean']:.2f}"
        else:
            anomaly_type = "low"
            message = f"偏低: 当前值 {value:.2f} 低于均值 {baseline['mean']:.2f}"
        
        anomaly = Anomaly(
            anomaly_type=anomaly_type,
            metric_name=metric_name,
            value=value,
            expected_value=baseline["mean"],
            deviation=deviation,
            severity=severity,
            timestamp=timestamp,
            message=message
        )
        
        self.history.append(anomaly)
        return anomaly
    
    def detect_burst(self, events: List[Dict], threshold: int = 10, window_seconds: int = 60) -> Optional[Anomaly]:
        """
        检测突发异常
        
        Args:
            events: 事件列表
            threshold: 阈值
            window_seconds: 时间窗口
            
        Returns:
            异常或None
        """
        if not events:
            return None
        
        now = datetime.now()
        cutoff = now - timedelta(seconds=window_seconds)
        
        recent_count = sum(
            1 for e in events
            if datetime.fromisoformat(e.get("timestamp", datetime.now().isoformat())) > cutoff
        )
        
        if recent_count >= threshold:
            return Anomaly(
                anomaly_type="burst",
                metric_name="event_burst",
                value=recent_count,
                expected_value=threshold / 2,
                deviation=recent_count / threshold * 100,
                severity="high" if recent_count >= threshold * 2 else "medium",
                timestamp=now,
                message=f"事件突发: {recent_count}个事件在{window_seconds}秒内发生"
            )
        
        return None
    
    def detect_knowledge_gap(self, queries: List[str], knowledge_hits: List[int]) -> Optional[Anomaly]:
        """
        检测知识库覆盖缺口
        
        Args:
            queries: 查询列表
            knowledge_hits: 命中数列表
            
        Returns:
            异常或None
        """
        if len(queries) < 10:
            return None
        
        miss_count = sum(1 for hits in knowledge_hits if hits == 0)
        miss_rate = miss_count / len(queries)
        
        if miss_rate > 0.3:  # 30%的查询没有命中
            return Anomaly(
                anomaly_type="knowledge_gap",
                metric_name="knowledge_coverage",
                value=1 - miss_rate,
                expected_value=0.8,
                deviation=-miss_rate * 100,
                severity="high" if miss_rate > 0.5 else "medium",
                timestamp=datetime.now(),
                message=f"知识库覆盖缺口: {miss_count}/{len(queries)} 查询未命中"
            )
        
        return None
    
    def get_recent_anomalies(self, minutes: int = 30) -> List[Anomaly]:
        """获取最近的异常"""
        cutoff = datetime.now() - timedelta(minutes=minutes)
        return [a for a in self.history if a.timestamp > cutoff]
    
    def get_baseline_stats(self) -> Dict:
        """获取基线统计"""
        return {
            name: {
                "mean": b["mean"],
                "std_dev": b["std_dev"],
                "updated_at": b["updated_at"].isoformat()
            }
            for name, b in self.baseline.items()
        }


# 全局实例
anomaly_detector = AnomalyDetector()


__all__ = ["AnomalyDetector", "anomaly_detector", "Anomaly"]
