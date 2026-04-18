#!/usr/bin/env python3
"""
US12: 通知系统
实现多渠道通知（邮件/飞书/微信/短信/Web）、通知模板管理、通知规则配置和通知历史统计
"""

import json
import uuid
import re
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field, asdict
import logging
import time

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationPriority(Enum):
    """通知优先级"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class DeliveryStatus(Enum):
    """投递状态"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    RATE_LIMITED = "rate_limited"


class NotificationChannel(Enum):
    """通知渠道"""
    EMAIL = "email"
    FEISHU = "feishu"           # 飞书
    WECHAT = "wechat"           # 微信
    SMS = "sms"                 # 短信
    WEBHOOK = "webhook"         # Web推送


@dataclass
class NotificationTemplate:
    """通知模板"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    channel: str = ""
    subject: str = ""           # 邮件/短信主题
    body: str = ""               # 富文本内容
    variables: List[str] = field(default_factory=list)  # 变量列表
    is_builtin: bool = False
    usage_count: int = 0
    
    def render(self, context: Dict[str, Any]) -> Dict[str, str]:
        """渲染模板，替换变量"""
        result = {
            'subject': self.subject,
            'body': self.body
        }
        
        for key, value in context.items():
            placeholder = f"{{{key}}}"
            result['subject'] = result['subject'].replace(placeholder, str(value))
            result['body'] = result['body'].replace(placeholder, str(value))
        
        return result
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'name': self.name,
            'channel': self.channel,
            'subject': self.subject,
            'body': self.body,
            'variables': self.variables,
            'is_builtin': self.is_builtin,
            'usage_count': self.usage_count
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'NotificationTemplate':
        return cls(**data)


@dataclass
class NotificationRule:
    """通知规则"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    channel: str = ""
    enabled: bool = True
    priority: str = NotificationPriority.NORMAL.value
    frequency_limit: int = 0       # 频率限制（0表示不限制）
    frequency_window: int = 3600   # 频率窗口（秒）
    time_window_start: str = "00:00"  # 允许发送时间窗口
    time_window_end: str = "23:59"
    template_id: Optional[str] = None
    conditions: List[Dict] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'NotificationRule':
        return cls(**data)


@dataclass
class Notification:
    """通知"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    channel: str = ""
    recipient: str = ""          # 收件人地址
    subject: str = ""
    content: str = ""
    priority: str = NotificationPriority.NORMAL.value
    status: str = DeliveryStatus.PENDING.value
    retry_count: int = 0
    max_retries: int = 3
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    sent_at: Optional[str] = None
    delivered_at: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Notification':
        return cls(**data)


class ChannelAdapter:
    """渠道适配器基类"""
    
    def send(self, notification: Notification) -> Dict:
        """发送通知，返回结果"""
        raise NotImplementedError
    
    def validate_recipient(self, recipient: str) -> bool:
        """验证收件人格式"""
        raise NotImplementedError


class EmailAdapter(ChannelAdapter):
    """邮件适配器"""
    
    PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    def validate_recipient(self, recipient: str) -> bool:
        return bool(re.match(self.PATTERN, recipient))
    
    def send(self, notification: Notification) -> Dict:
        """模拟发送邮件"""
        logger.info(f"[Email] 发送邮件到 {notification.recipient}: {notification.subject}")
        return {
            'success': True,
            'channel': NotificationChannel.EMAIL.value,
            'message_id': str(uuid.uuid4()),
            'recipient': notification.recipient
        }


class FeishuAdapter(ChannelAdapter):
    """飞书适配器"""
    
    def validate_recipient(self, recipient: str) -> bool:
        return bool(re.match(r'^ou_[a-zA-Z0-9]+$', recipient))
    
    def send(self, notification: Notification) -> Dict:
        """模拟发送飞书消息"""
        logger.info(f"[Feishu] 发送消息到 {notification.recipient}: {notification.content[:50]}...")
        return {
            'success': True,
            'channel': NotificationChannel.FEISHU.value,
            'message_id': str(uuid.uuid4()),
            'recipient': notification.recipient
        }


class WechatAdapter(ChannelAdapter):
    """微信适配器"""
    
    def validate_recipient(self, recipient: str) -> bool:
        return len(recipient) >= 5
    
    def send(self, notification: Notification) -> Dict:
        """模拟发送微信消息"""
        logger.info(f"[Wechat] 发送消息到 {notification.recipient}: {notification.content[:50]}...")
        return {
            'success': True,
            'channel': NotificationChannel.WECHAT.value,
            'message_id': str(uuid.uuid4()),
            'recipient': notification.recipient
        }


class SMSAdapter(ChannelAdapter):
    """短信适配器"""
    
    PATTERN = r'^1[3-9]\d{9}$'
    
    def validate_recipient(self, recipient: str) -> bool:
        return bool(re.match(self.PATTERN, recipient))
    
    def send(self, notification: Notification) -> Dict:
        """模拟发送短信"""
        logger.info(f"[SMS] 发送短信到 {notification.recipient}: {notification.content[:50]}...")
        return {
            'success': True,
            'channel': NotificationChannel.SMS.value,
            'message_id': str(uuid.uuid4()),
            'recipient': notification.recipient
        }


class WebhookAdapter(ChannelAdapter):
    """Web推送适配器"""
    
    PATTERN = r'^https?://'
    
    def validate_recipient(self, recipient: str) -> bool:
        return bool(re.match(self.PATTERN, recipient))
    
    def send(self, notification: Notification) -> Dict:
        """模拟发送Web推送"""
        logger.info(f"[Webhook] 发送推送到 {notification.recipient}: {notification.content[:50]}...")
        return {
            'success': True,
            'channel': NotificationChannel.WEBHOOK.value,
            'message_id': str(uuid.uuid4()),
            'recipient': notification.recipient
        }


class TokenBucket:
    """令牌桶算法 - 频率控制"""
    
    def __init__(self, rate: int, window: int):
        self.rate = rate           # 令牌数
        self.window = window       # 时间窗口（秒）
        self.tokens = rate
        self.last_update = time.time()
    
    def consume(self) -> bool:
        """尝试消费一个令牌"""
        now = time.time()
        elapsed = now - self.last_update
        
        # 补充令牌
        self.tokens = min(
            self.rate,
            self.tokens + elapsed * (self.rate / self.window)
        )
        self.last_update = now
        
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


class NotificationSystem:
    """
    通知系统
    支持5种通知渠道、模板管理、规则配置和历史统计
    """
    
    # 预定义通知模板
    BUILTIN_TEMPLATES = [
        # 邮件模板
        NotificationTemplate(
            id="tpl_email_welcome",
            name="欢迎邮件",
            channel=NotificationChannel.EMAIL.value,
            subject="欢迎使用Ariba实施检查清单系统",
            body="""
            <h1>尊敬的 {username}，</h1>
            <p>欢迎使用Ariba实施检查清单系统！</p>
            <p>您的项目 <strong>{project_name}</strong> 已成功创建。</p>
            <p>开始时间: {start_date}</p>
            <p>项目周期: {duration} 天</p>
            <hr>
            <p>如需帮助，请联系系统管理员。</p>
            """,
            variables=["username", "project_name", "start_date", "duration"],
            is_builtin=True
        ),
        NotificationTemplate(
            id="tpl_email_overdue",
            name="超期提醒邮件",
            channel=NotificationChannel.EMAIL.value,
            subject="【重要】清单项超期提醒 - {item_title}",
            body="""
            <h1>清单项超期提醒</h1>
            <p>您好 {assignee}，</p>
            <p>以下清单项已超期，请及时处理：</p>
            <ul>
                <li><strong>项目:</strong> {project_name}</li>
                <li><strong>清单项:</strong> {item_title}</li>
                <li><strong>计划完成:</strong> {due_date}</li>
                <li><strong>超期天数:</strong> {days_overdue} 天</li>
            </ul>
            <p><a href="{item_url}">查看详情</a></p>
            """,
            variables=["assignee", "project_name", "item_title", "due_date", "days_overdue", "item_url"],
            is_builtin=True
        ),
        NotificationTemplate(
            id="tpl_email_high_risk",
            name="高风险预警邮件",
            channel=NotificationChannel.EMAIL.value,
            subject="【紧急】高风险清单项预警 - {item_title}",
            body="""
            <h1 style="color:red;">⚠️ 高风险预警</h1>
            <p>检测到以下清单项存在高风险：</p>
            <ul>
                <li><strong>清单项:</strong> {item_title}</li>
                <li><strong>风险等级:</strong> {risk_level}</li>
                <li><strong>风险描述:</strong> {risk_description}</li>
                <li><strong>建议:</strong> {recommendation}</li>
            </ul>
            <p>请立即处理！</p>
            """,
            variables=["item_title", "risk_level", "risk_description", "recommendation"],
            is_builtin=True
        ),
        
        # 飞书消息模板
        NotificationTemplate(
            id="tpl_feishu_task",
            name="任务通知（飞书）",
            channel=NotificationChannel.FEISHU.value,
            subject="",
            body="""
            📋 {title}
            
            {content}
            
            ⏰ {time}
            """,
            variables=["title", "content", "time"],
            is_builtin=True
        ),
        NotificationTemplate(
            id="tpl_feishu_overdue",
            name="超期提醒（飞书）",
            channel=NotificationChannel.FEISHU.value,
            subject="",
            body="""
            ⚠️ 超期提醒
            
            📌 {item_title}
            🏢 项目: {project_name}
            ⏰ 计划完成: {due_date}
            🔴 超期: {days_overdue} 天
            
            <at id="{assignee_id}"></at> 请及时处理！
            """,
            variables=["item_title", "project_name", "due_date", "days_overdue", "assignee_id"],
            is_builtin=True
        ),
        
        # 微信模板
        NotificationTemplate(
            id="tpl_wechat_task",
            name="任务通知（微信）",
            channel=NotificationChannel.WECHAT.value,
            subject="",
            body="{title}\n{content}\n{time}",
            variables=["title", "content", "time"],
            is_builtin=True
        ),
        
        # 短信模板
        NotificationTemplate(
            id="tpl_sms_overdue",
            name="超期提醒（短信）",
            channel=NotificationChannel.SMS.value,
            subject="",
            body="【Ariba系统】清单项「{item_title}」已超期{days_overdue}天，请尽快处理。如需帮助请联系管理员。",
            variables=["item_title", "days_overdue"],
            is_builtin=True
        ),
        
        # Web推送模板
        NotificationTemplate(
            id="tpl_webhook_alert",
            name="告警推送",
            channel=NotificationChannel.WEBHOOK.value,
            subject="",
            body="""
            {{
                "type": "{alert_type}",
                "title": "{title}",
                "content": "{content}",
                "timestamp": "{timestamp}",
                "data": {data}
            }}
            """,
            variables=["alert_type", "title", "content", "timestamp", "data"],
            is_builtin=True
        )
    ]
    
    def __init__(self, storage_path: Optional[str] = None):
        """初始化通知系统"""
        self.storage_path = storage_path
        self.templates: List[NotificationTemplate] = list(self.BUILTIN_TEMPLATES)
        self.rules: List[NotificationRule] = []
        self.notifications: List[Notification] = []
        self.adapters: Dict[str, ChannelAdapter] = {}
        self.rate_limiters: Dict[str, TokenBucket] = {}
        self.stats: Dict[str, Any] = {
            'total_sent': 0,
            'total_delivered': 0,
            'total_failed': 0,
            'by_channel': {ch.value: {'sent': 0, 'failed': 0} for ch in NotificationChannel}
        }
        
        # 注册渠道适配器
        self._register_adapters()
        
        # 加载数据
        self._load_data()
    
    def _register_adapters(self):
        """注册渠道适配器"""
        self.adapters[NotificationChannel.EMAIL.value] = EmailAdapter()
        self.adapters[NotificationChannel.FEISHU.value] = FeishuAdapter()
        self.adapters[NotificationChannel.WECHAT.value] = WechatAdapter()
        self.adapters[NotificationChannel.SMS.value] = SMSAdapter()
        self.adapters[NotificationChannel.WEBHOOK.value] = WebhookAdapter()
    
    def _load_data(self):
        """加载数据"""
        if not self.storage_path:
            return
        
        import os
        os.makedirs(self.storage_path, exist_ok=True)
        
        # 加载模板
        try:
            with open(f"{self.storage_path}/notification_templates.json", 'r') as f:
                data = json.load(f)
                custom_templates = [NotificationTemplate.from_dict(t) for t in data]
                self.templates = list(self.BUILTIN_TEMPLATES) + custom_templates
        except FileNotFoundError:
            pass
        
        # 加载规则
        try:
            with open(f"{self.storage_path}/notification_rules.json", 'r') as f:
                data = json.load(f)
                self.rules = [NotificationRule.from_dict(r) for r in data]
        except FileNotFoundError:
            pass
        
        # 加载历史
        try:
            with open(f"{self.storage_path}/notification_history.json", 'r') as f:
                data = json.load(f)
                self.notifications = [Notification.from_dict(n) for n in data]
        except FileNotFoundError:
            pass
    
    def _save_data(self):
        """保存数据"""
        if not self.storage_path:
            return
        
        import os
        os.makedirs(self.storage_path, exist_ok=True)
        
        # 保存自定义模板
        custom_templates = [t.to_dict() for t in self.templates if not t.is_builtin]
        with open(f"{self.storage_path}/notification_templates.json", 'w') as f:
            json.dump(custom_templates, f, indent=2)
        
        # 保存规则
        with open(f"{self.storage_path}/notification_rules.json", 'w') as f:
            json.dump([r.to_dict() for r in self.rules], f, indent=2)
        
        # 保存历史（限制大小）
        history = self.notifications[-500:]
        with open(f"{self.storage_path}/notification_history.json", 'w') as f:
            json.dump([n.to_dict() for n in history], f, indent=2)
    
    # ==================== 模板管理 ====================
    
    def create_template(
        self,
        name: str,
        channel: str,
        body: str,
        subject: str = "",
        variables: Optional[List[str]] = None
    ) -> NotificationTemplate:
        """创建模板"""
        template = NotificationTemplate(
            name=name,
            channel=channel,
            subject=subject,
            body=body,
            variables=variables or [],
            is_builtin=False
        )
        self.templates.append(template)
        self._save_data()
        return template
    
    def update_template(self, template_id: str, updates: Dict) -> Optional[NotificationTemplate]:
        """更新模板"""
        for template in self.templates:
            if template.id == template_id:
                for key, value in updates.items():
                    if hasattr(template, key):
                        setattr(template, key, value)
                self._save_data()
                return template
        return None
    
    def delete_template(self, template_id: str) -> bool:
        """删除模板"""
        self.templates = [t for t in self.templates if t.id != template_id or t.is_builtin]
        self._save_data()
        return True
    
    def get_template(self, template_id: str) -> Optional[NotificationTemplate]:
        """获取模板"""
        for template in self.templates:
            if template.id == template_id:
                return template
        return None
    
    def get_templates_by_channel(self, channel: str) -> List[NotificationTemplate]:
        """按渠道获取模板"""
        return [t for t in self.templates if t.channel == channel]
    
    def get_all_templates(self) -> List[NotificationTemplate]:
        """获取所有模板"""
        return self.templates
    
    # ==================== 规则管理 ====================
    
    def create_rule(
        self,
        name: str,
        channel: str,
        template_id: Optional[str] = None,
        priority: str = NotificationPriority.NORMAL.value,
        frequency_limit: int = 0,
        frequency_window: int = 3600,
        time_window_start: str = "00:00",
        time_window_end: str = "23:59",
        conditions: Optional[List[Dict]] = None
    ) -> NotificationRule:
        """创建规则"""
        rule = NotificationRule(
            name=name,
            channel=channel,
            template_id=template_id,
            priority=priority,
            frequency_limit=frequency_limit,
            frequency_window=frequency_window,
            time_window_start=time_window_start,
            time_window_end=time_window_end,
            conditions=conditions or []
        )
        self.rules.append(rule)
        self._save_data()
        return rule
    
    def update_rule(self, rule_id: str, updates: Dict) -> Optional[NotificationRule]:
        """更新规则"""
        for rule in self.rules:
            if rule.id == rule_id:
                for key, value in updates.items():
                    if hasattr(rule, key):
                        setattr(rule, key, value)
                self._save_data()
                return rule
        return None
    
    def delete_rule(self, rule_id: str) -> bool:
        """删除规则"""
        self.rules = [r for r in self.rules if r.id != rule_id]
        self._save_data()
        return True
    
    def get_rule(self, rule_id: str) -> Optional[NotificationRule]:
        """获取规则"""
        for rule in self.rules:
            if rule.id == rule_id:
                return rule
        return None
    
    def get_all_rules(self) -> List[NotificationRule]:
        """获取所有规则"""
        return self.rules
    
    def enable_rule(self, rule_id: str) -> bool:
        """启用规则"""
        rule = self.get_rule(rule_id)
        if rule:
            rule.enabled = True
            self._save_data()
            return True
        return False
    
    def disable_rule(self, rule_id: str) -> bool:
        """禁用规则"""
        rule = self.get_rule(rule_id)
        if rule:
            rule.enabled = False
            self._save_data()
            return True
        return False
    
    # ==================== 通知发送 ====================
    
    def send(
        self,
        channel: str,
        recipient: str,
        subject: str = "",
        content: str = "",
        template_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        priority: str = NotificationPriority.NORMAL.value,
        metadata: Optional[Dict] = None
    ) -> Notification:
        """发送通知"""
        notification = Notification(
            channel=channel,
            recipient=recipient,
            subject=subject,
            content=content,
            priority=priority,
            metadata=metadata or {}
        )
        
        # 如果使用模板，先渲染
        if template_id:
            template = self.get_template(template_id)
            if template:
                context = context or {}
                rendered = template.render(context)
                notification.subject = rendered.get('subject', '')
                notification.content = rendered.get('body', notification.content)
                template.usage_count += 1
        
        # 检查频率限制
        rate_key = f"{channel}:{recipient}"
        if rate_key in self.rate_limiters:
            limiter = self.rate_limiters[rate_key]
            if not limiter.consume():
                notification.status = DeliveryStatus.RATE_LIMITED.value
                self.notifications.append(notification)
                return notification
        
        # 验证收件人
        adapter = self.adapters.get(channel)
        if not adapter:
            notification.status = DeliveryStatus.FAILED.value
            notification.error_message = f"未知渠道: {channel}"
            self.notifications.append(notification)
            return notification
        
        if not adapter.validate_recipient(recipient):
            notification.status = DeliveryStatus.FAILED.value
            notification.error_message = "无效的收件人地址"
            self.notifications.append(notification)
            return notification
        
        # 检查时间窗口
        if not self._is_in_time_window():
            notification.status = DeliveryStatus.PENDING.value
            notification.error_message = "不在允许的时间窗口内"
            self.notifications.append(notification)
            return notification
        
        # 发送
        try:
            result = adapter.send(notification)
            if result.get('success'):
                notification.status = DeliveryStatus.SENT.value
                notification.sent_at = datetime.now().isoformat()
                self.stats['total_sent'] += 1
                self.stats['by_channel'][channel]['sent'] += 1
            else:
                notification.status = DeliveryStatus.FAILED.value
                notification.error_message = result.get('error', '发送失败')
                self.stats['total_failed'] += 1
                self.stats['by_channel'][channel]['failed'] += 1
        except Exception as e:
            notification.status = DeliveryStatus.FAILED.value
            notification.error_message = str(e)
            self.stats['total_failed'] += 1
            self.stats['by_channel'][channel]['failed'] += 1
        
        self.notifications.append(notification)
        self._save_data()
        
        return notification
    
    def _is_in_time_window(self) -> bool:
        """检查是否在允许的时间窗口内"""
        now = datetime.now().strftime("%H:%M")
        
        for rule in self.rules:
            if not rule.enabled:
                continue
            if rule.time_window_start <= now <= rule.time_window_end:
                return True
        
        return True  # 默认允许
    
    def send_to_multiple(
        self,
        channel: str,
        recipients: List[str],
        template_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        priority: str = NotificationPriority.NORMAL.value
    ) -> List[Notification]:
        """批量发送通知"""
        results = []
        for recipient in recipients:
            result = self.send(
                channel=channel,
                recipient=recipient,
                template_id=template_id,
                context=context,
                priority=priority
            )
            results.append(result)
        return results
    
    def retry_notification(self, notification_id: str) -> Optional[Notification]:
        """重试失败的通知"""
        for notification in self.notifications:
            if notification.id == notification_id:
                if notification.retry_count >= notification.max_retries:
                    return None
                
                notification.retry_count += 1
                notification.status = DeliveryStatus.PENDING.value
                
                # 重新发送
                adapter = self.adapters.get(notification.channel)
                if adapter:
                    result = adapter.send(notification)
                    if result.get('success'):
                        notification.status = DeliveryStatus.SENT.value
                        notification.sent_at = datetime.now().isoformat()
                    else:
                        notification.error_message = result.get('error')
                
                self._save_data()
                return notification
        
        return None
    
    # ==================== 历史和统计 ====================
    
    def get_notification_history(
        self,
        channel: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Notification]:
        """获取通知历史"""
        results = self.notifications
        
        if channel:
            results = [n for n in results if n.channel == channel]
        if status:
            results = [n for n in results if n.status == status]
        
        return results[-limit:]
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            **self.stats,
            'total_notifications': len(self.notifications),
            'pending': sum(1 for n in self.notifications if n.status == DeliveryStatus.PENDING.value),
            'sent': sum(1 for n in self.notifications if n.status == DeliveryStatus.SENT.value),
            'failed': sum(1 for n in self.notifications if n.status == DeliveryStatus.FAILED.value),
            'templates_count': len(self.templates),
            'rules_count': len(self.rules),
            'enabled_rules': sum(1 for r in self.rules if r.enabled)
        }
    
    def get_channel_stats(self, channel: str) -> Dict:
        """获取渠道统计"""
        channel_notifications = [n for n in self.notifications if n.channel == channel]
        
        return {
            'total': len(channel_notifications),
            'sent': sum(1 for n in channel_notifications if n.status == DeliveryStatus.SENT.value),
            'pending': sum(1 for n in channel_notifications if n.status == DeliveryStatus.PENDING.value),
            'failed': sum(1 for n in channel_notifications if n.status == DeliveryStatus.FAILED.value),
            'rate_limited': sum(1 for n in channel_notifications if n.status == DeliveryStatus.RATE_LIMITED.value)
        }
    
    def set_rate_limit(self, channel: str, recipient: str, rate: int, window: int):
        """设置频率限制"""
        rate_key = f"{channel}:{recipient}"
        self.rate_limiters[rate_key] = TokenBucket(rate, window)
