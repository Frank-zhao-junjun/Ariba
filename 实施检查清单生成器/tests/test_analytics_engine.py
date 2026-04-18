"""
实施检查清单生成器 - US5 单元测试
测试统计分析引擎功能
"""

import unittest
import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.checklist_generator import ChecklistGenerator
from tracking.tracking_engine import TrackingEngine, ItemStatus
from analytics.analytics_engine import (
    AnalyticsEngine,
    HealthLevel
)


class TestAnalyticsEngine(unittest.TestCase):
    """测试分析引擎"""
    
    def setUp(self):
        """测试前准备"""
        self.generator = ChecklistGenerator()
        self.tracker = TrackingEngine()
        self.analytics = AnalyticsEngine()
        
        # 创建测试清单
        self.checklist = self.generator.generate_checklist(
            phases=["requirements_analysis", "system_configuration"],
            modules=["buying", "sourcing"],
            version="V2605"
        )
    
    def test_engine_initialization(self):
        """测试引擎初始化"""
        self.assertIsNotNone(self.analytics)
    
    def test_calculate_completion_stats_empty(self):
        """测试空清单完成率统计"""
        stats = self.analytics.calculate_completion_stats(self.checklist)
        
        self.assertEqual(stats["total_items"], len(self.checklist["items"]))
        self.assertIn("overall_completion_rate", stats)
        self.assertIn("status_distribution", stats)
        self.assertIn("phase_stats", stats)
    
    def test_calculate_completion_stats_with_progress(self):
        """测试有进度的完成率统计"""
        # 设置进度
        for i, item in enumerate(self.checklist["items"][:6]):
            status = [
                ItemStatus.COMPLETED.value,
                ItemStatus.COMPLETED.value,
                ItemStatus.VERIFIED.value,
                ItemStatus.IN_PROGRESS.value,
                ItemStatus.BLOCKED.value,
                ItemStatus.NOT_STARTED.value
            ][i]
            self.tracker.update_item_status(self.checklist["id"], item["id"], status)
        
        stats = self.analytics.calculate_completion_stats(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertEqual(stats["completed_items"], 2)
        self.assertEqual(stats["verified_items"], 1)
        self.assertEqual(stats["in_progress_items"], 1)
        self.assertEqual(stats["blocked_items"], 1)
        self.assertEqual(stats["not_started_items"], 1)
        
        # 50%完成（2+1 / 6）
        self.assertAlmostEqual(stats["overall_completion_rate"], 0.5, places=1)
    
    def test_completion_stats_phase_breakdown(self):
        """测试按阶段统计"""
        stats = self.analytics.calculate_completion_stats(self.checklist)
        
        self.assertIn("phase_stats", stats)
        for phase in self.checklist["phases"]:
            self.assertIn(phase, stats["phase_stats"])
    
    def test_completion_stats_module_breakdown(self):
        """测试按模块统计"""
        stats = self.analytics.calculate_completion_stats(self.checklist)
        
        self.assertIn("module_stats", stats)
        for module in self.checklist["modules"]:
            self.assertIn(module, stats["module_stats"])
    
    def test_analyze_delays_no_delays(self):
        """测试无延迟分析"""
        # 所有项都完成
        for item in self.checklist["items"][:3]:
            self.tracker.update_item_status(
                self.checklist["id"],
                item["id"],
                ItemStatus.COMPLETED.value
            )
        
        delays = self.analytics.analyze_delays(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertEqual(len(delays["overdue_items"]), 0)
    
    def test_analyze_delays_with_blocked(self):
        """测试有受阻项的延迟分析"""
        # 设置受阻项
        self.tracker.update_item_status(
            self.checklist["id"],
            self.checklist["items"][0]["id"],
            ItemStatus.BLOCKED.value
        )
        
        delays = self.analytics.analyze_delays(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertGreaterEqual(delays["at_risk_count"], 0)
    
    def test_calculate_health_score_excellent(self):
        """测试优秀健康度评分"""
        # 完成大部分项
        for i, item in enumerate(self.checklist["items"][:8]):
            status = ItemStatus.COMPLETED.value if i < 7 else ItemStatus.IN_PROGRESS.value
            self.tracker.update_item_status(self.checklist["id"], item["id"], status)
        
        health = self.analytics.calculate_health_score(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertIn("health_score", health)
        self.assertIn("health_level", health)
        self.assertIn("recommendations", health)
    
    def test_calculate_health_score_critical(self):
        """测试危急健康度评分"""
        # 设置多个受阻项
        for item in self.checklist["items"][:3]:
            self.tracker.update_item_status(
                self.checklist["id"],
                item["id"],
                ItemStatus.BLOCKED.value
            )
        
        health = self.analytics.calculate_health_score(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertIn("health_score", health)
        self.assertLess(health["health_score"], 60)
    
    def test_health_score_details_structure(self):
        """测试健康评分详情结构"""
        health = self.analytics.calculate_health_score(self.checklist)
        
        self.assertIn("details", health)
        details = health["details"]
        
        self.assertIn("completion_score", details)
        self.assertIn("progress_score", details)
        self.assertIn("blocked_score", details)
        self.assertIn("risk_score", details)
        
        for score_key in ["completion_score", "progress_score", "blocked_score", "risk_score"]:
            score_detail = details[score_key]
            self.assertIn("value", score_detail)
            self.assertIn("max", score_detail)
    
    def test_health_recommendations(self):
        """测试健康建议生成"""
        health = self.analytics.calculate_health_score(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertIsInstance(health["recommendations"], list)
        self.assertGreater(len(health["recommendations"]), 0)
    
    def test_generate_analytics_report_markdown(self):
        """测试生成Markdown分析报告"""
        # 添加一些数据
        self.tracker.update_item_status(
            self.checklist["id"],
            self.checklist["items"][0]["id"],
            ItemStatus.COMPLETED.value
        )
        
        report = self.analytics.generate_analytics_report(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertIsInstance(report, str)
        self.assertIn(self.checklist["name"], report)
        self.assertIn("项目健康度", report)
        self.assertIn("完成率统计", report)
        self.assertIn("延迟分析", report)
    
    def test_generate_analytics_report_json(self):
        """测试生成JSON分析报告"""
        report = self.analytics.generate_analytics_report(
            self.checklist,
            self.tracker.track_records,
            format="json"
        )
        
        self.assertIsInstance(report, str)
        
        parsed = json.loads(report)
        self.assertEqual(parsed["checklist_id"], self.checklist["id"])
        self.assertIn("completion_stats", parsed)
        self.assertIn("delay_analysis", parsed)
        self.assertIn("health_score", parsed)
    
    def test_generate_chart_data(self):
        """测试生成图表数据"""
        chart_data = self.analytics.generate_chart_data(
            self.checklist,
            self.tracker.track_records
        )
        
        self.assertIn("completion_gauge", chart_data)
        self.assertIn("status_pie", chart_data)
        self.assertIn("phase_bar", chart_data)
        self.assertIn("module_bar", chart_data)
        
        # 验证gauge数据
        self.assertIn("value", chart_data["completion_gauge"])
        self.assertIn("name", chart_data["completion_gauge"])
        
        # 验证pie数据
        self.assertIsInstance(chart_data["status_pie"]["data"], list)


class TestHealthLevel(unittest.TestCase):
    """测试健康等级枚举"""
    
    def test_health_level_values(self):
        """测试健康等级值"""
        self.assertEqual(HealthLevel.EXCELLENT.value, "excellent")
        self.assertEqual(HealthLevel.GOOD.value, "good")
        self.assertEqual(HealthLevel.FAIR.value, "fair")
        self.assertEqual(HealthLevel.NEEDS_IMPROVEMENT.value, "needs_improvement")
        self.assertEqual(HealthLevel.CRITICAL.value, "critical")


class TestCompletionBreakdown(unittest.TestCase):
    """测试完成率分解"""
    
    def setUp(self):
        self.generator = ChecklistGenerator()
        self.analytics = AnalyticsEngine()
        self.tracker = TrackingEngine()
        
        self.checklist = self.generator.generate_all_phases_checklist(
            modules=["sourcing", "buying", "supplier", "contract"],
            version="V2605"
        )
    
    def test_priority_breakdown(self):
        """测试按优先级统计"""
        stats = self.analytics.calculate_completion_stats(self.checklist)
        
        self.assertIn("priority_stats", stats)
        self.assertIn("high", stats["priority_stats"])
        self.assertIn("medium", stats["priority_stats"])
        self.assertIn("low", stats["priority_stats"])
    
    def test_category_breakdown(self):
        """测试按类别统计"""
        stats = self.analytics.calculate_completion_stats(self.checklist)
        
        self.assertIn("category_stats", stats)
        # 应该有一些类别
        self.assertIsInstance(stats["category_stats"], dict)


if __name__ == "__main__":
    unittest.main(verbosity=2)
