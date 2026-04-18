#!/usr/bin/env python3
"""
US11: 工作流自动化引擎
实现工作流规则引擎（事件-条件-动作）、5种触发器、4种自动化操作和工作流模板库
"""

import json
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field, asdict
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TriggerType(Enum):
    """触发器类型"""
    ON_COMPLETE = "on_complete"           # 清单项完成
    ON_DELAY = "on_delay"                  # 延迟触发
    ON_HIGH_RISK = "on_high_risk"         # 高风险检测
    ON_OVERDUE = "on_overdue"              # 超期触发
    ON_CUSTOM = "on_custom"                # 自定义触发


class ActionType(Enum):
    """动作类型"""
    NOTIFY = "notify"                      # 发送通知
    ASSIGN = "assign"                      # 分配任务
    TAG = "tag"                            # 标记标签
    ESCALATE = "escalate"                  # 升级处理


class ConditionOperator(Enum):
    """条件操作符"""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    CONTAINS = "contains"
    IN_LIST = "in_list"
    NOT_IN_LIST = "not_in_list"


@dataclass
class Condition:
    """条件定义"""
    field: str                    # 字段名
    operator: str                 # 操作符
    value: Any                    # 比较值
    
    def evaluate(self, context: Dict) -> bool:
        """评估条件是否满足"""
        field_value = self._get_nested_value(context, self.field)
        
        if self.operator == ConditionOperator.EQUALS.value:
            return field_value == self.value
        elif self.operator == ConditionOperator.NOT_EQUALS.value:
            return field_value != self.value
        elif self.operator == ConditionOperator.GREATER_THAN.value:
            return field_value > self.value
        elif self.operator == ConditionOperator.LESS_THAN.value:
            return field_value < self.value
        elif self.operator == ConditionOperator.CONTAINS.value:
            return self.value in str(field_value)
        elif self.operator == ConditionOperator.IN_LIST.value:
            return field_value in self.value
        elif self.operator == ConditionOperator.NOT_IN_LIST.value:
            return field_value not in self.value
        return False
    
    def _get_nested_value(self, data: Dict, path: str) -> Any:
        """获取嵌套字段值"""
        keys = path.split('.')
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value


@dataclass
class Trigger:
    """触发器定义"""
    type: str                     # 触发器类型
    conditions: List[Condition] = field(default_factory=list)
    delay_seconds: int = 0        # 延迟秒数（用于ON_DELAY）
    custom_event: Optional[str] = None  # 自定义事件名
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Trigger':
        """从字典创建触发器"""
        conditions = [
            Condition(**c) for c in data.get('conditions', [])
        ]
        return cls(
            type=data['type'],
            conditions=conditions,
            delay_seconds=data.get('delay_seconds', 0),
            custom_event=data.get('custom_event')
        )
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            'type': self.type,
            'conditions': [asdict(c) for c in self.conditions],
            'delay_seconds': self.delay_seconds,
            'custom_event': self.custom_event
        }


@dataclass
class Action:
    """动作定义"""
    type: str                     # 动作类型
    params: Dict[str, Any] = field(default_factory=dict)
    notification_template: Optional[str] = None
    assignee_role: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    escalation_level: Optional[int] = None
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Action':
        """从字典创建动作"""
        return cls(
            type=data['type'],
            params=data.get('params', {}),
            notification_template=data.get('notification_template'),
            assignee_role=data.get('assignee_role'),
            tags=data.get('tags', []),
            escalation_level=data.get('escalation_level')
        )
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            'type': self.type,
            'params': self.params,
            'notification_template': self.notification_template,
            'assignee_role': self.assignee_role,
            'tags': self.tags,
            'escalation_level': self.escalation_level
        }


@dataclass
class WorkflowRule:
    """工作流规则"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    enabled: bool = True
    priority: int = 100
    trigger: Optional[Trigger] = None
    conditions: List[Condition] = field(default_factory=list)
    actions: List[Action] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    execution_count: int = 0
    last_executed_at: Optional[str] = None
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'WorkflowRule':
        """从字典创建规则"""
        trigger = Trigger.from_dict(data['trigger']) if data.get('trigger') else None
        conditions = [Condition(**c) for c in data.get('conditions', [])]
        actions = [Action.from_dict(a) for a in data.get('actions', [])]
        
        return cls(
            id=data.get('id', str(uuid.uuid4())),
            name=data.get('name', ''),
            description=data.get('description', ''),
            enabled=data.get('enabled', True),
            priority=data.get('priority', 100),
            trigger=trigger,
            conditions=conditions,
            actions=actions,
            created_at=data.get('created_at', datetime.now().isoformat()),
            updated_at=data.get('updated_at', datetime.now().isoformat()),
            execution_count=data.get('execution_count', 0),
            last_executed_at=data.get('last_executed_at')
        )
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'enabled': self.enabled,
            'priority': self.priority,
            'trigger': self.trigger.to_dict() if self.trigger else None,
            'conditions': [asdict(c) for c in self.conditions],
            'actions': [asdict(a) for a in self.actions],
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'execution_count': self.execution_count,
            'last_executed_at': self.last_executed_at
        }


@dataclass
class WorkflowTemplate:
    """工作流模板"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    category: str = ""
    rules: List[Dict] = field(default_factory=list)
    is_builtin: bool = False
    usage_count: int = 0
    
    def to_rule(self) -> WorkflowRule:
        """从模板创建规则"""
        rule_data = self.rules[0] if self.rules else {}
        return WorkflowRule.from_dict(rule_data)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'WorkflowTemplate':
        """从字典创建模板"""
        return cls(
            id=data.get('id', str(uuid.uuid4())),
            name=data.get('name', ''),
            description=data.get('description', ''),
            category=data.get('category', ''),
            rules=data.get('rules', []),
            is_builtin=data.get('is_builtin', False),
            usage_count=data.get('usage_count', 0)
        )


class Event:
    """工作流事件"""
    def __init__(
        self,
        event_type: str,
        source: str,
        data: Dict[str, Any],
        timestamp: Optional[datetime] = None
    ):
        self.id = str(uuid.uuid4())
        self.event_type = event_type
        self.source = source
        self.data = data
        self.timestamp = timestamp or datetime.now()
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'event_type': self.event_type,
            'source': self.source,
            'data': self.data,
            'timestamp': self.timestamp.isoformat()
        }


class WorkflowEngine:
    """
    工作流规则引擎
    实现ECA (Event-Condition-Action) 模式
    """
    
    # 预定义工作流模板
    BUILTIN_TEMPLATES = [
        # 模板1: 清单项完成通知
        WorkflowTemplate(
            id="tpl_complete_notify",
            name="完成通知模板",
            description="当清单项完成时，自动通知相关人员",
            category="notification",
            is_builtin=True,
            rules=[{
                'name': '清单项完成通知',
                'description': '清单项完成时发送通知',
                'priority': 100,
                'trigger': {
                    'type': TriggerType.ON_COMPLETE.value,
                    'conditions': []
                },
                'conditions': [],
                'actions': [{
                    'type': ActionType.NOTIFY.value,
                    'params': {'message': '清单项已完成'},
                    'notification_template': 'item_completed'
                }]
            }]
        ),
        
        # 模板2: 延迟预警
        WorkflowTemplate(
            id="tpl_delay_warning",
            name="延迟预警模板",
            description="当任务延迟超过设定阈值时，自动发送预警",
            category="risk",
            is_builtin=True,
            rules=[{
                'name': '延迟预警',
                'description': '任务延迟时发送预警通知',
                'priority': 90,
                'trigger': {
                    'type': TriggerType.ON_DELAY.value,
                    'conditions': [],
                    'delay_seconds': 86400  # 1天
                },
                'conditions': [{
                    'field': 'delay_hours',
                    'operator': 'greater_than',
                    'value': 24
                }],
                'actions': [{
                    'type': ActionType.NOTIFY.value,
                    'params': {'level': 'warning'},
                    'notification_template': 'delay_warning'
                }]
            }]
        ),
        
        # 模板3: 高风险升级
        WorkflowTemplate(
            id="tpl_high_risk_escalate",
            name="高风险升级模板",
            description="当检测到高风险项时，自动升级给项目经理",
            category="risk",
            is_builtin=True,
            rules=[{
                'name': '高风险升级',
                'description': '高风险项自动升级',
                'priority': 80,
                'trigger': {
                    'type': TriggerType.ON_HIGH_RISK.value,
                    'conditions': []
                },
                'conditions': [{
                    'field': 'risk_level',
                    'operator': 'equals',
                    'value': 'high'
                }],
                'actions': [
                    {
                        'type': ActionType.NOTIFY.value,
                        'params': {'level': 'critical'},
                        'notification_template': 'high_risk_alert'
                    },
                    {
                        'type': ActionType.ESCALATE.value,
                        'params': {},
                        'escalation_level': 2
                    }
                ]
            }]
        ),
        
        # 模板4: 超期自动分配
        WorkflowTemplate(
            id="tpl_overdue_assign",
            name="超期任务分配模板",
            description="当任务超期时，自动分配给项目经理处理",
            category="assignment",
            is_builtin=True,
            rules=[{
                'name': '超期任务分配',
                'description': '超期任务自动分配',
                'priority': 85,
                'trigger': {
                    'type': TriggerType.ON_OVERDUE.value,
                    'conditions': []
                },
                'conditions': [{
                    'field': 'days_overdue',
                    'operator': 'greater_than',
                    'value': 0
                }],
                'actions': [{
                    'type': ActionType.ASSIGN.value,
                    'params': {},
                    'assignee_role': 'project_manager'
                }]
            }]
        ),
        
        # 模板5: 自定义审批流程
        WorkflowTemplate(
            id="tpl_custom_approval",
            name="自定义审批流程模板",
            description="支持自定义触发条件的审批工作流",
            category="approval",
            is_builtin=True,
            rules=[{
                'name': '自定义审批',
                'description': '满足自定义条件时触发',
                'priority': 95,
                'trigger': {
                    'type': TriggerType.ON_CUSTOM.value,
                    'conditions': [],
                    'custom_event': 'approval_required'
                },
                'conditions': [{
                    'field': 'amount',
                    'operator': 'greater_than',
                    'value': 100000
                }],
                'actions': [
                    {
                        'type': ActionType.TAG.value,
                        'params': {},
                        'tags': ['pending_approval', 'high_value']
                    },
                    {
                        'type': ActionType.NOTIFY.value,
                        'params': {},
                        'notification_template': 'approval_required'
                    }
                ]
            }]
        )
    ]
    
    def __init__(self, storage_path: Optional[str] = None):
        """初始化工作流引擎"""
        self.storage_path = storage_path
        self.rules: List[WorkflowRule] = []
        self.templates: List[WorkflowTemplate] = list(self.BUILTIN_TEMPLATES)
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.action_handlers: Dict[str, Callable] = {}
        self.execution_history: List[Dict] = []
        
        # 注册默认动作处理器
        self._register_default_handlers()
        
        # 加载已有规则
        self._load_rules()
    
    def _register_default_handlers(self):
        """注册默认动作处理器"""
        self.action_handlers[ActionType.NOTIFY.value] = self._handle_notify
        self.action_handlers[ActionType.ASSIGN.value] = self._handle_assign
        self.action_handlers[ActionType.TAG.value] = self._handle_tag
        self.action_handlers[ActionType.ESCALATE.value] = self._handle_escalate
    
    def _handle_notify(self, action: Action, context: Dict) -> Dict:
        """处理通知动作"""
        return {
            'success': True,
            'action': 'notify',
            'message': f"发送通知: {action.notification_template or 'default'}",
            'params': action.params
        }
    
    def _handle_assign(self, action: Action, context: Dict) -> Dict:
        """处理分配动作"""
        return {
            'success': True,
            'action': 'assign',
            'assignee_role': action.assignee_role,
            'message': f"分配给角色: {action.assignee_role}"
        }
    
    def _handle_tag(self, action: Action, context: Dict) -> Dict:
        """处理标记动作"""
        return {
            'success': True,
            'action': 'tag',
            'tags': action.tags,
            'message': f"添加标签: {', '.join(action.tags)}"
        }
    
    def _handle_escalate(self, action: Action, context: Dict) -> Dict:
        """处理升级动作"""
        return {
            'success': True,
            'action': 'escalate',
            'escalation_level': action.escalation_level,
            'message': f"升级至级别: {action.escalation_level}"
        }
    
    def _load_rules(self):
        """从存储加载规则"""
        if self.storage_path:
            try:
                with open(f"{self.storage_path}/workflow_rules.json", 'r') as f:
                    data = json.load(f)
                    self.rules = [WorkflowRule.from_dict(r) for r in data]
            except FileNotFoundError:
                self.rules = []
    
    def _save_rules(self):
        """保存规则到存储"""
        if self.storage_path:
            import os
            os.makedirs(self.storage_path, exist_ok=True)
            with open(f"{self.storage_path}/workflow_rules.json", 'w') as f:
                json.dump([r.to_dict() for r in self.rules], f, indent=2)
    
    # ==================== 规则管理 ====================
    
    def create_rule(self, rule: WorkflowRule) -> WorkflowRule:
        """创建新规则"""
        rule.id = str(uuid.uuid4())
        rule.created_at = datetime.now().isoformat()
        rule.updated_at = rule.created_at
        self.rules.append(rule)
        self._save_rules()
        logger.info(f"创建工作流规则: {rule.name}")
        return rule
    
    def update_rule(self, rule_id: str, updates: Dict) -> Optional[WorkflowRule]:
        """更新规则"""
        for rule in self.rules:
            if rule.id == rule_id:
                for key, value in updates.items():
                    if hasattr(rule, key) and key not in ['id', 'created_at']:
                        setattr(rule, key, value)
                rule.updated_at = datetime.now().isoformat()
                self._save_rules()
                logger.info(f"更新工作流规则: {rule.name}")
                return rule
        return None
    
    def delete_rule(self, rule_id: str) -> bool:
        """删除规则"""
        self.rules = [r for r in self.rules if r.id != rule_id]
        self._save_rules()
        logger.info(f"删除工作流规则: {rule_id}")
        return True
    
    def get_rule(self, rule_id: str) -> Optional[WorkflowRule]:
        """获取规则"""
        for rule in self.rules:
            if rule.id == rule_id:
                return rule
        return None
    
    def get_all_rules(self) -> List[WorkflowRule]:
        """获取所有规则"""
        return sorted(self.rules, key=lambda r: r.priority)
    
    def enable_rule(self, rule_id: str) -> bool:
        """启用规则"""
        rule = self.get_rule(rule_id)
        if rule:
            rule.enabled = True
            rule.updated_at = datetime.now().isoformat()
            self._save_rules()
            return True
        return False
    
    def disable_rule(self, rule_id: str) -> bool:
        """禁用规则"""
        rule = self.get_rule(rule_id)
        if rule:
            rule.enabled = False
            rule.updated_at = datetime.now().isoformat()
            self._save_rules()
            return True
        return False
    
    # ==================== 模板管理 ====================
    
    def get_all_templates(self) -> List[WorkflowTemplate]:
        """获取所有模板"""
        return self.templates
    
    def get_template(self, template_id: str) -> Optional[WorkflowTemplate]:
        """获取模板"""
        for tmpl in self.templates:
            if tmpl.id == template_id:
                return tmpl
        return None
    
    def create_rule_from_template(self, template_id: str) -> Optional[WorkflowRule]:
        """从模板创建规则"""
        template = self.get_template(template_id)
        if not template or not template.rules:
            return None
        
        rule = template.to_rule()
        rule.id = str(uuid.uuid4())
        rule.created_at = datetime.now().isoformat()
        rule.updated_at = rule.created_at
        self.rules.append(rule)
        
        # 更新模板使用次数
        template.usage_count += 1
        self._save_rules()
        
        logger.info(f"从模板创建规则: {rule.name}")
        return rule
    
    def add_custom_template(self, template: WorkflowTemplate) -> WorkflowTemplate:
        """添加自定义模板"""
        template.id = str(uuid.uuid4())
        template.is_builtin = False
        self.templates.append(template)
        return template
    
    # ==================== 事件处理 ====================
    
    def register_event_handler(self, event_type: str, handler: Callable):
        """注册事件处理器"""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)
    
    def register_action_handler(self, action_type: str, handler: Callable):
        """注册动作处理器"""
        self.action_handlers[action_type] = handler
    
    def trigger_event(self, event: Event) -> List[Dict]:
        """触发事件并执行匹配规则"""
        results = []
        
        # 查找匹配的规则
        matching_rules = self._find_matching_rules(event)
        
        for rule in matching_rules:
            result = self._execute_rule(rule, event)
            results.append(result)
            
            # 更新规则执行统计
            rule.execution_count += 1
            rule.last_executed_at = datetime.now().isoformat()
        
        # 记录执行历史
        self.execution_history.append({
            'event': event.to_dict(),
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
        
        # 限制历史记录大小
        if len(self.execution_history) > 1000:
            self.execution_history = self.execution_history[-500:]
        
        # 调用事件处理器
        if event.event_type in self.event_handlers:
            for handler in self.event_handlers[event.event_type]:
                handler(event)
        
        return results
    
    def _find_matching_rules(self, event: Event) -> List[WorkflowRule]:
        """查找匹配事件的规则"""
        matching = []
        
        for rule in self.rules:
            if not rule.enabled:
                continue
            
            # 检查触发器类型是否匹配
            if rule.trigger and rule.trigger.type != event.event_type:
                continue
            
            # 检查触发器条件
            if rule.trigger and rule.trigger.conditions:
                trigger_match = all(
                    c.evaluate(event.data) for c in rule.trigger.conditions
                )
                if not trigger_match:
                    continue
            
            # 检查规则条件
            if rule.conditions:
                condition_match = all(
                    c.evaluate(event.data) for c in rule.conditions
                )
                if not condition_match:
                    continue
            
            matching.append(rule)
        
        # 按优先级排序
        return sorted(matching, key=lambda r: r.priority)
    
    def _execute_rule(self, rule: WorkflowRule, event: Event) -> Dict:
        """执行规则"""
        results = []
        context = {**event.data, 'rule_id': rule.id, 'rule_name': rule.name}
        
        for action in rule.actions:
            handler = self.action_handlers.get(action.type)
            if handler:
                result = handler(action, context)
                results.append(result)
            else:
                results.append({
                    'success': False,
                    'action': action.type,
                    'error': f'未找到处理器: {action.type}'
                })
        
        return {
            'rule_id': rule.id,
            'rule_name': rule.name,
            'event_id': event.id,
            'event_type': event.event_type,
            'results': results,
            'executed_at': datetime.now().isoformat()
        }
    
    # ==================== 便捷方法 ====================
    
    def on_complete(self, item_id: str, item_data: Dict) -> List[Dict]:
        """触发完成事件"""
        event = Event(
            event_type=TriggerType.ON_COMPLETE.value,
            source='system',
            data={**item_data, 'item_id': item_id}
        )
        return self.trigger_event(event)
    
    def on_delay(self, item_id: str, delay_hours: int, item_data: Dict) -> List[Dict]:
        """触发延迟事件"""
        event = Event(
            event_type=TriggerType.ON_DELAY.value,
            source='scheduler',
            data={**item_data, 'item_id': item_id, 'delay_hours': delay_hours}
        )
        return self.trigger_event(event)
    
    def on_high_risk(self, item_id: str, risk_level: str, item_data: Dict) -> List[Dict]:
        """触发高风险事件"""
        event = Event(
            event_type=TriggerType.ON_HIGH_RISK.value,
            source='risk_analyzer',
            data={**item_data, 'item_id': item_id, 'risk_level': risk_level}
        )
        return self.trigger_event(event)
    
    def on_overdue(self, item_id: str, days_overdue: int, item_data: Dict) -> List[Dict]:
        """触发超期事件"""
        event = Event(
            event_type=TriggerType.ON_OVERDUE.value,
            source='scheduler',
            data={**item_data, 'item_id': item_id, 'days_overdue': days_overdue}
        )
        return self.trigger_event(event)
    
    def trigger_custom(self, custom_event: str, event_data: Dict) -> List[Dict]:
        """触发自定义事件"""
        event = Event(
            event_type=TriggerType.ON_CUSTOM.value,
            source='custom',
            data={**event_data, 'custom_event': custom_event}
        )
        return self.trigger_event(event)
    
    # ==================== 统计和报告 ====================
    
    def get_execution_stats(self) -> Dict:
        """获取执行统计"""
        total_executions = sum(r.execution_count for r in self.rules)
        enabled_count = sum(1 for r in self.rules if r.enabled)
        
        return {
            'total_rules': len(self.rules),
            'enabled_rules': enabled_count,
            'disabled_rules': len(self.rules) - enabled_count,
            'total_executions': total_executions,
            'templates_count': len(self.templates),
            'builtin_templates': len([t for t in self.templates if t.is_builtin]),
            'custom_templates': len([t for t in self.templates if not t.is_builtin]),
            'recent_executions': len(self.execution_history)
        }
    
    def get_execution_history(
        self,
        limit: int = 100,
        rule_id: Optional[str] = None
    ) -> List[Dict]:
        """获取执行历史"""
        history = self.execution_history
        
        if rule_id:
            history = [
                h for h in history
                if h['results'] and h['results'][0].get('rule_id') == rule_id
            ]
        
        return history[-limit:]
