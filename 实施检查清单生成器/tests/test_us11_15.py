#!/usr/bin/env python3
"""
US11-US15 集成测试
测试工作流、通知、备份、国际化、搜索模块的集成功能
"""

import unittest
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from workflow.workflow_engine import (
    WorkflowEngine, WorkflowRule, Trigger, Action,
    TriggerType, ActionType, WorkflowTemplate, Event
)
from notification.notification_system import (
    NotificationSystem, NotificationChannel, NotificationTemplate,
    NotificationRule, Notification, NotificationPriority, DeliveryStatus
)
from backup.backup_manager import (
    BackupManager, BackupPlan, BackupType, BackupStatus, RecoveryPoint, Snapshot
)
from i18n.i18n_manager import I18nManager, Locale
from search.advanced_search import (
    AdvancedSearch, SearchQuery, FilterCondition, SearchResult,
    FilterOperator, SortOrder, ExportFormat
)


class TestWorkflowEngine(unittest.TestCase):
    """US11: 工作流自动化测试"""
    
    def setUp(self):
        self.engine = WorkflowEngine()
    
    def test_create_rule(self):
        """测试创建规则"""
        rule = WorkflowRule(
            name="测试规则",
            description="测试规则描述",
            priority=100
        )
        rule.trigger = Trigger(type=TriggerType.ON_COMPLETE.value)
        rule.actions.append(Action(type=ActionType.NOTIFY.value))
        
        created = self.engine.create_rule(rule)
        
        self.assertIsNotNone(created.id)
        self.assertEqual(created.name, "测试规则")
        self.assertTrue(created.enabled)
    
    def test_trigger_event(self):
        """测试触发事件"""
        rule = WorkflowRule(
            name="完成通知",
            priority=100
        )
        rule.trigger = Trigger(type=TriggerType.ON_COMPLETE.value)
        rule.actions.append(Action(
            type=ActionType.NOTIFY.value,
            notification_template="item_completed"
        ))
        self.engine.create_rule(rule)
        
        event = Event(
            event_type=TriggerType.ON_COMPLETE.value,
            source="test",
            data={"item_id": "test-001", "title": "测试项"}
        )
        
        results = self.engine.trigger_event(event)
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['results'][0]['action'], 'notify')
    
    def test_templates(self):
        """测试工作流模板"""
        templates = self.engine.get_all_templates()
        
        self.assertGreaterEqual(len(templates), 5)
        
        # 验证内置模板
        builtin = [t for t in templates if t.is_builtin]
        self.assertEqual(len(builtin), 5)
    
    def test_enable_disable_rule(self):
        """测试启用/禁用规则"""
        rule = WorkflowRule(name="测试规则")
        created = self.engine.create_rule(rule)
        
        self.engine.disable_rule(created.id)
        rule = self.engine.get_rule(created.id)
        self.assertFalse(rule.enabled)
        
        self.engine.enable_rule(created.id)
        rule = self.engine.get_rule(created.id)
        self.assertTrue(rule.enabled)


class TestNotificationSystem(unittest.TestCase):
    """US12: 通知系统测试"""
    
    def setUp(self):
        self.system = NotificationSystem()
    
    def test_create_template(self):
        """测试创建模板"""
        template = self.system.create_template(
            name="测试模板",
            channel="email",
            subject="测试主题",
            body="测试内容 {name}",
            variables=["name"]
        )
        
        self.assertIsNotNone(template.id)
        self.assertEqual(template.name, "测试模板")
        self.assertFalse(template.is_builtin)
    
    def test_send_notification(self):
        """测试发送通知"""
        notification = self.system.send(
            channel="email",
            recipient="test@example.com",
            subject="测试",
            content="测试内容"
        )
        
        self.assertIsNotNone(notification.id)
        self.assertEqual(notification.channel, "email")
    
    def test_render_template(self):
        """测试模板渲染"""
        template = self.system.get_template("tpl_email_welcome")
        
        if template:
            rendered = template.render({
                "username": "张三",
                "project_name": "测试项目",
                "start_date": "2024-01-01",
                "duration": "90"
            })
            
            self.assertIn("张三", rendered['body'])
            self.assertIn("测试项目", rendered['body'])
    
    def test_notification_history(self):
        """测试通知历史"""
        self.system.send(
            channel="email",
            recipient="test@example.com",
            content="测试"
        )
        
        history = self.system.get_notification_history()
        self.assertGreater(len(history), 0)
    
    def test_stats(self):
        """测试统计功能"""
        stats = self.system.get_stats()
        
        self.assertIn('total_sent', stats)
        self.assertIn('by_channel', stats)
        self.assertEqual(len(stats['by_channel']), 5)


class TestBackupManager(unittest.TestCase):
    """US13: 备份恢复测试"""
    
    def setUp(self):
        self.manager = BackupManager()
    
    def test_create_plan(self):
        """测试创建备份计划"""
        plan = self.manager.create_plan(
            name="每日备份",
            backup_type=BackupType.FULL.value,
            schedule_type="daily",
            schedule_time="02:00",
            retention_days=30
        )
        
        self.assertIsNotNone(plan.id)
        self.assertEqual(plan.name, "每日备份")
        self.assertTrue(plan.enabled)
    
    def test_execute_backup(self):
        """测试执行备份"""
        plan = self.manager.create_plan(name="测试计划")
        
        source_data = {
            "checklists": [
                {"id": "1", "title": "清单1"},
                {"id": "2", "title": "清单2"}
            ],
            "settings": {"theme": "dark"}
        }
        
        recovery_point = self.manager.execute_backup(plan.id, source_data)
        
        self.assertIsNotNone(recovery_point.id)
        self.assertGreater(recovery_point.file_size, 0)
        self.assertTrue(os.path.exists(recovery_point.file_path))
    
    def test_snapshot(self):
        """测试快照"""
        source_data = {"key": "value", "number": 123}
        
        snapshot = self.manager.create_snapshot(
            name="测试快照",
            source_data=source_data,
            description="测试快照描述",
            tags=["test", "snapshot"]
        )
        
        self.assertIsNotNone(snapshot.id)
        self.assertEqual(snapshot.name, "测试快照")
        self.assertIn("test", snapshot.tags)
    
    def test_restore(self):
        """测试恢复"""
        plan = self.manager.create_plan(name="恢复测试")
        
        source_data = {
            "version": "1.0.0",
            "data": {"test": "value"}
        }
        
        rp = self.manager.execute_backup(plan.id, source_data)
        restored = self.manager.restore(rp.id)
        
        self.assertEqual(restored['version'], "1.0.0")
        self.assertEqual(restored['data']['test'], "value")
    
    def test_incremental_backup(self):
        """测试增量备份"""
        plan = self.manager.create_plan(
            name="增量备份测试",
            backup_type=BackupType.INCREMENTAL.value
        )
        
        # 第一次全量备份
        data1 = {"version": 1, "items": [{"id": 1}]}
        self.manager.execute_backup(plan.id, data1)
        
        # 第二次增量备份
        data2 = {"version": 2, "items": [{"id": 1}, {"id": 2}]}
        rp2 = self.manager.execute_backup(plan.id, data2)
        
        self.assertEqual(rp2.backup_type, BackupType.INCREMENTAL.value)


class TestI18nManager(unittest.TestCase):
    """US14: 国际化测试"""
    
    def setUp(self):
        self.i18n = I18nManager()
    
    def test_translate(self):
        """测试翻译"""
        self.i18n.set_locale("zh_CN")
        result = self.i18n.t("common.save")
        self.assertEqual(result, "保存")
        
        self.i18n.set_locale("en_US")
        result = self.i18n.t("common.save")
        self.assertEqual(result, "Save")
    
    def test_locale_switch(self):
        """测试语言切换"""
        self.i18n.set_locale("zh_CN")
        self.assertEqual(self.i18n.get_locale(), "zh_CN")
        
        self.i18n.set_locale("ja_JP")
        self.assertEqual(self.i18n.get_locale(), "ja_JP")
    
    def test_supported_locales(self):
        """测试支持的语言"""
        locales = self.i18n.get_supported_locales()
        
        self.assertEqual(len(locales), 5)
        codes = [l["code"] for l in locales]
        self.assertIn("zh_CN", codes)
        self.assertIn("en_US", codes)
        self.assertIn("ja_JP", codes)
        self.assertIn("de_DE", codes)
        self.assertIn("fr_FR", codes)
    
    def test_timezone(self):
        """测试时区"""
        self.i18n.set_timezone("Asia/Tokyo")
        self.assertEqual(self.i18n.get_timezone(), "Asia/Tokyo")
    
    def test_date_format(self):
        """测试日期格式化"""
        self.i18n.set_locale("zh_CN")
        
        dt = datetime(2024, 3, 15, 14, 30, 0)
        formatted = self.i18n.format_date(dt)
        
        self.assertIn("2024", formatted)
        self.assertIn("03", formatted)
        self.assertIn("15", formatted)
    
    def test_supported_timezones(self):
        """测试支持的时区"""
        timezones = self.i18n.get_supported_timezones()
        
        self.assertGreater(len(timezones), 0)
        ids = [tz["id"] for tz in timezones]
        self.assertIn("Asia/Shanghai", ids)
        self.assertIn("Asia/Tokyo", ids)
        self.assertIn("UTC", ids)


class TestAdvancedSearch(unittest.TestCase):
    """US15: 高级搜索测试"""
    
    def setUp(self):
        self.search = AdvancedSearch()
        
        # 索引测试文档
        self.test_docs = [
            {"id": "1", "title": "SAP Ariba实施清单", "status": "active", "module": "sourcing"},
            {"id": "2", "title": "合同管理配置", "status": "active", "module": "contract"},
            {"id": "3", "title": "采购流程优化", "status": "completed", "module": "buying"},
            {"id": "4", "title": "供应商准入标准", "status": "active", "module": "supplier"},
            {"id": "5", "title": "支出分析报告", "status": "draft", "module": "spending"}
        ]
        self.search.index_documents(self.test_docs, "id")
    
    def test_full_text_search(self):
        """测试全文搜索"""
        # 添加英文测试文档
        self.test_docs.append({
            "id": "6", "title": "SAP Implementation Guide", "status": "active", "module": "sourcing"
        })
        self.search.index_documents([{"id": "6", "title": "SAP Implementation Guide", "status": "active", "module": "sourcing"}], "id")
        
        query = SearchQuery(keywords="Implementation")
        result = self.search.search(query)
        
        self.assertGreaterEqual(result.total_count, 1)
    
    def test_filter(self):
        """测试过滤"""
        query = SearchQuery(
            filters=[{"field": "status", "operator": "equals", "value": "active"}]
        )
        result = self.search.search(query)
        
        self.assertEqual(result.total_count, 3)
        for doc in result.results:
            self.assertEqual(doc.get("status"), "active")
    
    def test_sort(self):
        """测试排序"""
        query = SearchQuery(
            sort_by="title",
            sort_order=SortOrder.ASC.value
        )
        result = self.search.search(query)
        
        if result.total_count > 1:
            titles = [r.get("title", "") for r in result.results]
            self.assertEqual(titles, sorted(titles))
    
    def test_pagination(self):
        """测试分页"""
        query = SearchQuery(page=1, page_size=2)
        result = self.search.search(query)
        
        self.assertEqual(len(result.results), 2)
        self.assertTrue(result.has_next)
        self.assertFalse(result.has_prev)
    
    def test_save_filter(self):
        """测试保存筛选条件"""
        filters = [
            FilterCondition(field="status", operator="equals", value="active")
        ]
        
        saved = self.search.save_filter(
            name="活跃项目",
            filters=filters,
            description="显示所有活跃项目"
        )
        
        self.assertIsNotNone(saved.id)
        self.assertEqual(saved.name, "活跃项目")
    
    def test_export_json(self):
        """测试JSON导出"""
        query = SearchQuery()
        result = self.search.search(query)
        
        exported = self.search.export_results(result.results, "json")
        
        self.assertIsInstance(exported, str)
        data = json.loads(exported)
        self.assertIsInstance(data, list)
    
    def test_export_csv(self):
        """测试CSV导出"""
        query = SearchQuery()
        result = self.search.search(query)
        
        exported = self.search.export_results(result.results, "csv")
        
        self.assertIsInstance(exported, str)
        self.assertIn("title", exported)
    
    def test_facets(self):
        """测试分面统计"""
        query = SearchQuery()
        result = self.search.search(query)
        
        self.assertIn('status', result.facets)
        self.assertIn('module', result.facets)


class TestIntegration(unittest.TestCase):
    """集成测试"""
    
    def test_workflow_notification_integration(self):
        """测试工作流与通知集成"""
        workflow = WorkflowEngine()
        notification = NotificationSystem()
        
        # 创建触发通知的规则
        rule = WorkflowRule(name="超期通知")
        rule.trigger = Trigger(type=TriggerType.ON_OVERDUE.value)
        rule.actions.append(Action(
            type=ActionType.NOTIFY.value,
            notification_template="tpl_email_overdue"
        ))
        workflow.create_rule(rule)
        
        # 触发超期事件
        event = Event(
            event_type=TriggerType.ON_OVERDUE.value,
            source="test",
            data={"item_id": "1", "title": "测试项", "days_overdue": 5}
        )
        
        results = workflow.trigger_event(event)
        
        # 验证通知已发送
        self.assertGreaterEqual(len(results), 1)
    
    def test_backup_restore_workflow(self):
        """测试备份恢复与清单的集成"""
        backup = BackupManager()
        
        # 创建清单数据
        checklist_data = {
            "id": "checklist-001",
            "name": "SAP Ariba实施清单",
            "phases": [
                {"name": "准备阶段", "items": 10},
                {"name": "实施阶段", "items": 50}
            ],
            "items": [
                {"id": "i1", "title": "项目启动", "status": "completed"},
                {"id": "i2", "title": "需求分析", "status": "in_progress"}
            ]
        }
        
        # 执行备份
        plan = backup.create_plan(name="清单备份")
        rp = backup.execute_backup(plan.id, checklist_data)
        
        # 恢复数据
        restored = backup.restore(rp.id)
        
        self.assertEqual(restored['id'], "checklist-001")
        self.assertEqual(len(restored['items']), 2)
    
    def test_i18n_workflow(self):
        """测试国际化与工作流集成"""
        i18n = I18nManager()
        workflow = WorkflowEngine()
        
        # 创建多语言规则
        for locale in ["zh_CN", "en_US"]:
            i18n.set_locale(locale)
            
            rule = WorkflowRule(
                name=i18n.t("checklist.overdue"),
                description=i18n.t("error.timeout")
            )
            rule.trigger = Trigger(type=TriggerType.ON_OVERDUE.value)
            workflow.create_rule(rule)


def run_tests():
    """运行所有测试"""
    unittest.main(
        argv=[''],
        verbosity=2,
        exit=False
    )


if __name__ == '__main__':
    run_tests()
