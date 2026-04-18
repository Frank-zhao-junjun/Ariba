"""US7: 实时监控与告警 - 单元测试"""
import unittest
import sys
from pathlib import Path
from datetime import datetime

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from monitoring import (
    MetricsCollector, MetricType, Metric,
    AnomalyDetector, Anomaly,
    AlertManager, AlertLevel, AlertChannel,
    DashboardGenerator, Dashboard
)


class TestMetricsCollector(unittest.TestCase):
    def setUp(self):
        self.collector = MetricsCollector()
    
    def test_ac7_1_record_metric(self):
        """AC7.1: 记录指标"""
        metric = self.collector.record_metric("test_metric", 100.0, MetricType.QUERY_COUNT)
        self.assertEqual(metric.value, 100.0)
        self.assertEqual(metric.metric_type, MetricType.QUERY_COUNT)
    
    def test_ac7_1_record_query(self):
        """AC7.1: 记录查询指标"""
        self.collector.record_query("test query", 50.0, 3, 0)
        snapshot = self.collector.get_current_metrics()
        self.assertIn("queries", snapshot.summary)
    
    def test_ac7_1_get_snapshot(self):
        """AC7.1: 获取指标快照"""
        self.collector.record_metric("latency", 100.0, MetricType.QUERY_LATENCY)
        snapshot = self.collector.get_current_metrics()
        self.assertIsNotNone(snapshot.summary)


class TestAnomalyDetector(unittest.TestCase):
    def setUp(self):
        self.detector = AnomalyDetector()
    
    def test_ac7_2_baseline(self):
        """AC7.2: 学习基线"""
        values = [10, 12, 11, 13, 10, 12, 11]
        self.detector.learn_baseline("test_metric", values)
        stats = self.detector.get_baseline_stats()
        self.assertIn("test_metric", stats)
    
    def test_ac7_2_detect_anomaly(self):
        """AC7.2: 检测异常"""
        self.detector.learn_baseline("latency", [10, 12, 11, 13, 10])
        anomaly = self.detector.detect_anomaly("latency", 100.0)
        self.assertIsNotNone(anomaly)
        self.assertIn(anomaly.severity, ["low", "medium", "high", "critical"])
    
    def test_ac7_2_no_anomaly(self):
        """AC7.2: 正常情况"""
        self.detector.learn_baseline("latency", [10, 12, 11, 13, 10])
        anomaly = self.detector.detect_anomaly("latency", 12.0)
        self.assertIsNone(anomaly)


class TestAlertManager(unittest.TestCase):
    def setUp(self):
        self.manager = AlertManager()
    
    def test_ac7_3_send_alert(self):
        """AC7.3: 发送告警"""
        alert = self.manager.send_alert(
            level=AlertLevel.WARNING,
            title="测试告警",
            message="这是一条测试告警"
        )
        self.assertIsNotNone(alert.id)
        self.assertEqual(alert.title, "测试告警")
    
    def test_ac7_3_alert_levels(self):
        """AC7.3: 告警级别"""
        for level in [AlertLevel.INFO, AlertLevel.WARNING, AlertLevel.ERROR, AlertLevel.CRITICAL]:
            alert = self.manager.send_alert(level=level, title=f"测试{level.value}", message="")
            self.assertEqual(alert.level, level)
    
    def test_ac7_3_get_stats(self):
        """AC7.3: 告警统计"""
        self.manager.send_alert(AlertLevel.INFO, "test1", "")
        self.manager.send_alert(AlertLevel.ERROR, "test2", "")
        stats = self.manager.get_alert_stats()
        self.assertEqual(stats["total"], 2)


class TestDashboard(unittest.TestCase):
    def setUp(self):
        self.generator = DashboardGenerator()
    
    def test_ac7_4_metric_widget(self):
        """AC7.4: 指标组件"""
        widget = self.generator.add_metric_widget("测试指标", "metric", 100.0, "ms")
        self.assertEqual(widget.widget_type, "metric")
        self.assertEqual(widget.data["value"], 100.0)
    
    def test_ac7_4_status_widget(self):
        """AC7.4: 状态组件"""
        widget = self.generator.add_status_widget("系统状态", "healthy")
        self.assertEqual(widget.widget_type, "status")
    
    def test_ac7_4_generate_dashboard(self):
        """AC7.4: 生成仪表盘"""
        dashboard = self.generator.generate_dashboard(
            metrics_summary={"queries": {"sum": 100}},
            anomalies=[{"metric_name": "latency", "severity": "high", "message": "高延迟"}],
            alerts=[{"level": "warning", "title": "测试", "message": ""}],
            system_status="healthy"
        )
        self.assertIsNotNone(dashboard.widgets)
        self.assertGreater(len(dashboard.widgets), 0)
    
    def test_ac7_4_generate_html(self):
        """AC7.4: HTML生成"""
        dashboard = Dashboard(
            name="Test",
            widgets=[self.generator.add_status_widget("状态", "healthy")],
            last_updated=datetime.now()
        )
        html = self.generator.generate_html(dashboard)
        self.assertIn("<html>", html)
        self.assertIn("监控仪表盘", html)


if __name__ == "__main__":
    unittest.main()
