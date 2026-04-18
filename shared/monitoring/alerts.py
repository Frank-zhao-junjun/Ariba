"""
告警系统
提供告警规则、通知和事件管理功能
"""

from typing import Any, Dict, List, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import time
import threading
import json
from collections import defaultdict, deque


class AlertLevel(Enum):
    """告警级别"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AlertStatus(Enum):
    """告警状态"""
    FIRING = "firing"
    RESOLVED = "resolved"
    ACKNOWLEDGED = "acknowledged"


@dataclass
class Alert:
    """告警"""
    name: str
    level: AlertLevel
    message: str
    labels: Dict[str, str] = field(default_factory=dict)
    value: Any = None
    threshold: Any = None
    status: AlertStatus = AlertStatus.FIRING
    fired_at: float = field(default_factory=time.time)
    resolved_at: Optional[float] = None
    acknowledged_at: Optional[float] = None
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "level": self.level.value,
            "message": self.message,
            "labels": self.labels,
            "value": self.value,
            "threshold": self.threshold,
            "status": self.status.value,
            "fired_at": self.fired_at,
            "resolved_at": self.resolved_at,
            "acknowledged_at": self.acknowledged_at,
        }


@dataclass
class AlertRule:
    """告警规则"""
    name: str
    condition: Callable[[Dict], bool]
    level: AlertLevel
    message_template: str
    cooldown_seconds: int = 60  # 冷却时间(秒)


class AlertManager:
    """告警管理器"""
    
    def __init__(self):
        self._rules: Dict[str, AlertRule] = {}
        self._active_alerts: Dict[str, Alert] = {}
        self._alert_history: deque = deque(maxlen=1000)
        self._handlers: List[Callable] = []
        self._last_fired: Dict[str, float] = {}
        self._lock = threading.RLock()
    
    def add_rule(self, rule: AlertRule) -> None:
        """添加告警规则"""
        with self._lock:
            self._rules[rule.name] = rule
    
    def remove_rule(self, name: str) -> None:
        """移除告警规则"""
        with self._lock:
            if name in self._rules:
                del self._rules[name]
    
    def add_handler(self, handler: Callable[[Alert], None]) -> None:
        """添加告警处理器"""
        self._handlers.append(handler)
    
    def evaluate(self, metrics: Dict[str, Any]) -> List[Alert]:
        """
        评估告警规则
        
        Args:
            metrics: 指标数据
            
        Returns:
            新触发的告警列表
        """
        new_alerts = []
        
        with self._lock:
            for name, rule in self._rules.items():
                try:
                    # 检查冷却时间
                    if name in self._last_fired:
                        elapsed = time.time() - self._last_fired[name]
                        if elapsed < rule.cooldown_seconds:
                            continue
                    
                    # 评估条件
                    if rule.condition(metrics):
                        alert = self._fire_alert(rule, metrics)
                        if alert:
                            new_alerts.append(alert)
                            self._last_fired[name] = time.time()
                except Exception:
                    pass
        
        return new_alerts
    
    def _fire_alert(self, rule: AlertRule, metrics: Dict) -> Optional[Alert]:
        """触发告警"""
        # 如果告警已存在且未解决，不重复触发
        if rule.name in self._active_alerts:
            existing = self._active_alerts[rule.name]
            if existing.status == AlertStatus.FIRING:
                return None
        
        # 创建告警
        alert = Alert(
            name=rule.name,
            level=rule.level,
            message=rule.message_template.format(**metrics),
            value=metrics.get(rule.name),
        )
        
        self._active_alerts[rule.name] = alert
        self._alert_history.append(alert)
        
        # 调用处理器
        for handler in self._handlers:
            try:
                handler(alert)
            except Exception:
                pass
        
        return alert
    
    def resolve(self, name: str) -> bool:
        """解决告警"""
        with self._lock:
            if name not in self._active_alerts:
                return False
            
            alert = self._active_alerts[name]
            alert.status = AlertStatus.RESOLVED
            alert.resolved_at = time.time()
            
            return True
    
    def acknowledge(self, name: str) -> bool:
        """确认告警"""
        with self._lock:
            if name not in self._active_alerts:
                return False
            
            alert = self._active_alerts[name]
            alert.status = AlertStatus.ACKNOWLEDGED
            alert.acknowledged_at = time.time()
            
            return True
    
    def get_active_alerts(self) -> List[Alert]:
        """获取活跃告警"""
        with self._lock:
            return [
                alert for alert in self._active_alerts.values()
                if alert.status == AlertStatus.FIRING
            ]
    
    def get_all_alerts(self) -> List[Alert]:
        """获取所有告警"""
        with self._lock:
            return list(self._active_alerts.values())
    
    def get_history(self, limit: int = 100) -> List[Alert]:
        """获取告警历史"""
        return list(self._alert_history)[-limit:]


# ===== 常用告警规则工厂 =====

def create_threshold_rule(
    name: str,
    metric_key: str,
    threshold: float,
    operator: str = ">",
    level: AlertLevel = AlertLevel.WARNING,
    cooldown: int = 60
) -> AlertRule:
    """创建阈值告警规则"""
    conditions = {
        ">": lambda v, t: v > t,
        "<": lambda v, t: v < t,
        ">=": lambda v, t: v >= t,
        "<=": lambda v, t: v <= t,
        "==": lambda v, t: v == t,
    }
    
    condition_fn = conditions.get(operator, conditions[">"])
    
    def condition(metrics: Dict) -> bool:
        value = metrics.get(metric_key)
        if value is None:
            return False
        return condition_fn(value, threshold)
    
    return AlertRule(
        name=name,
        condition=condition,
        level=level,
        message_template=f"{name}: {metric_key}={metric_key} {operator} {threshold}",
        cooldown_seconds=cooldown
    )


def create_cpu_alert(threshold: float = 90, level: AlertLevel = AlertLevel.WARNING) -> AlertRule:
    """创建CPU告警规则"""
    return create_threshold_rule(
        name="high_cpu",
        metric_key="cpu_percent",
        threshold=threshold,
        operator=">=",
        level=level
    )


def create_memory_alert(threshold: float = 90, level: AlertLevel = AlertLevel.ERROR) -> AlertRule:
    """创建内存告警规则"""
    return create_threshold_rule(
        name="high_memory",
        metric_key="memory_percent",
        threshold=threshold,
        operator=">=",
        level=level
    )


def create_error_rate_alert(threshold: float = 10, level: AlertLevel = AlertLevel.ERROR) -> AlertRule:
    """创建错误率告警规则"""
    return create_threshold_rule(
        name="high_error_rate",
        metric_key="error_rate",
        threshold=threshold,
        operator=">=",
        level=level
    )


# ===== 告警通知处理器 =====

class AlertHandlers:
    """告警处理器集合"""
    
    @staticmethod
    def log_handler(alert: Alert) -> None:
        """日志处理器"""
        import logging
        logger = logging.getLogger("alerts")
        
        level_map = {
            AlertLevel.INFO: logger.info,
            AlertLevel.WARNING: logger.warning,
            AlertLevel.ERROR: logger.error,
            AlertLevel.CRITICAL: logger.critical,
        }
        
        handler = level_map.get(alert.level, logger.info)
        handler(f"[ALERT] {alert.name}: {alert.message}")
    
    @staticmethod
    def webhook_handler(url: str) -> Callable:
        """Webhook处理器工厂"""
        import requests
        
        def handler(alert: Alert) -> None:
            try:
                requests.post(url, json=alert.to_dict(), timeout=5)
            except Exception:
                pass
        
        return handler
    
    @staticmethod
    def email_handler(smtp_config: Dict, recipients: List[str]) -> Callable:
        """邮件处理器工厂"""
        def handler(alert: Alert) -> None:
            # 实际实现需要smtplib
            pass
        
        return handler


# 全局告警管理器
_alert_manager: Optional[AlertManager] = None


def get_alert_manager() -> AlertManager:
    """获取全局告警管理器"""
    global _alert_manager
    if _alert_manager is None:
        _alert_manager = AlertManager()
    return _alert_manager


def setup_default_alerts() -> AlertManager:
    """设置默认告警规则"""
    manager = get_alert_manager()
    
    # CPU告警
    manager.add_rule(create_cpu_alert())
    
    # 内存告警
    manager.add_rule(create_memory_alert())
    
    # 错误率告警
    manager.add_rule(create_error_rate_alert())
    
    # 日志处理器
    manager.add_handler(AlertHandlers.log_handler)
    
    return manager
