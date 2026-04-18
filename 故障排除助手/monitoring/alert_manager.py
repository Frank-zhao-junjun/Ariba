"""
告警管理器 - US7 AC7.3

多渠道告警推送
"""

from typing import List, Dict, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json


class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AlertChannel(Enum):
    EMAIL = "email"
    FEISHU = "feishu"
    LOG = "log"
    WEBHOOK = "webhook"
    CONSOLE = "console"


@dataclass
class Alert:
    """告警"""
    id: str
    level: AlertLevel
    title: str
    message: str
    source: str
    timestamp: datetime = field(default_factory=datetime.now)
    tags: Dict = field(default_factory=dict)
    data: Dict = field(default_factory=dict)


class AlertChannelHandler:
    """告警渠道处理器基类"""
    
    def send(self, alert: Alert) -> bool:
        raise NotImplementedError


class LogHandler(AlertChannelHandler):
    """日志告警处理器"""
    
    def send(self, alert: Alert) -> bool:
        level_str = alert.level.value.upper()
        print(f"[{alert.timestamp.isoformat()}] [{level_str}] {alert.title}: {alert.message}")
        return True


class WebhookHandler(AlertChannelHandler):
    """Webhook告警处理器"""
    
    def __init__(self, webhook_url: str = None):
        self.webhook_url = webhook_url
    
    def send(self, alert: Alert) -> bool:
        if not self.webhook_url:
            print(f"[Webhook] Would send to {self.webhook_url}: {alert.title}")
            return True
        
        # 实际发送逻辑
        payload = {
            "msg_type": "text",
            "content": {
                "text": f"[{alert.level.value.upper()}] {alert.title}\n{alert.message}"
            }
        }
        # requests.post(self.webhook_url, json=payload)
        return True


class AlertManager:
    """
    告警管理器
    
    AC7.3: 多渠道告警推送
    """
    
    def __init__(self):
        self.handlers: Dict[AlertChannel, List[AlertChannelHandler]] = {
            channel: [] for channel in AlertChannel
        }
        self.alert_history: List[Alert] = []
        self.alert_rules: List[Dict] = []
        
        # 默认添加日志处理器
        self.add_handler(AlertChannel.LOG, LogHandler())
    
    def add_handler(self, channel: AlertChannel, handler: AlertChannelHandler):
        """添加告警处理器"""
        self.handlers[channel].append(handler)
    
    def send_alert(
        self,
        level: AlertLevel,
        title: str,
        message: str,
        source: str = "system",
        tags: Dict = None,
        data: Dict = None
    ) -> Alert:
        """
        发送告警
        
        Args:
            level: 告警级别
            title: 标题
            message: 消息
            source: 来源
            tags: 标签
            data: 附加数据
            
        Returns:
            告警对象
        """
        alert = Alert(
            id=f"ALT-{len(self.alert_history) + 1:05d}",
            level=level,
            title=title,
            message=message,
            source=source,
            timestamp=datetime.now(),
            tags=tags or {},
            data=data or {}
        )
        
        self.alert_history.append(alert)
        
        # 发送告警到各渠道
        self._dispatch_alert(alert)
        
        # 保持最近1000条
        if len(self.alert_history) > 1000:
            self.alert_history = self.alert_history[-500:]
        
        return alert
    
    def _dispatch_alert(self, alert: Alert):
        """分发告警到各处理器"""
        for channel, handlers in self.handlers.items():
            for handler in handlers:
                try:
                    handler.send(alert)
                except Exception as e:
                    print(f"Failed to send alert via {channel.value}: {e}")
    
    def send_anomaly_alert(self, anomaly_data: Dict):
        """发送异常告警"""
        level_map = {
            "low": AlertLevel.INFO,
            "medium": AlertLevel.WARNING,
            "high": AlertLevel.ERROR,
            "critical": AlertLevel.CRITICAL
        }
        
        level = level_map.get(anomaly_data.get("severity", "medium"), AlertLevel.WARNING)
        
        self.send_alert(
            level=level,
            title=f"异常检测: {anomaly_data.get('metric_name', 'unknown')}",
            message=anomaly_data.get("message", ""),
            source="anomaly_detector",
            tags={"anomaly_type": anomaly_data.get("anomaly_type", "")},
            data=anomaly_data
        )
    
    def send_error_alert(self, error: Exception, context: Dict = None):
        """发送错误告警"""
        self.send_alert(
            level=AlertLevel.ERROR,
            title=f"系统错误: {type(error).__name__}",
            message=str(error),
            source="system",
            tags={"error_type": type(error).__name__},
            data={"context": context} if context else {}
        )
    
    def get_recent_alerts(self, minutes: int = 60, level: AlertLevel = None) -> List[Alert]:
        """获取最近的告警"""
        from datetime import timedelta
        cutoff = datetime.now() - timedelta(minutes=minutes)
        
        alerts = [
            a for a in self.alert_history
            if a.timestamp > cutoff
        ]
        
        if level:
            alerts = [a for a in alerts if a.level == level]
        
        return alerts
    
    def get_alert_stats(self) -> Dict:
        """获取告警统计"""
        stats = {
            "total": len(self.alert_history),
            "by_level": {},
            "recent_count": 0
        }
        
        for alert in self.alert_history:
            level = alert.level.value
            stats["by_level"][level] = stats["by_level"].get(level, 0) + 1
        
        # 最近1小时的告警
        from datetime import timedelta
        cutoff = datetime.now() - timedelta(hours=1)
        stats["recent_count"] = sum(1 for a in self.alert_history if a.timestamp > cutoff)
        
        return stats
    
    def clear_old_alerts(self, days: int = 7):
        """清除旧告警"""
        from datetime import timedelta
        cutoff = datetime.now() - timedelta(days=days)
        self.alert_history = [
            a for a in self.alert_history if a.timestamp > cutoff
        ]


# 全局实例
alert_manager = AlertManager()


__all__ = ["AlertManager", "alert_manager", "Alert", "AlertLevel", "AlertChannel", "AlertChannelHandler"]
