"""US5: 学习反馈机制 - 单元测试"""
import unittest
import os
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from feedback import (
    FeedbackEngine, create_feedback_engine,
    UserFeedback, QualityMetrics,
    OptimizationSuggestion, UpdateQueueItem
)


class TestFeedbackEngine(unittest.TestCase):
    """测试反馈引擎"""
    
    def setUp(self):
        self.test_file = "test_feedback.json"
        self.engine = create_feedback_engine(self.test_file)
    
    def tearDown(self):
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
    
    def test_ac5_1_submit_feedback(self):
        """AC5.1: 提交用户反馈"""
        feedback = self.engine.submit_feedback(
            knowledge_id="KBE-001",
            user_id="user123",
            rating=4,
            is_helpful=True,
            feedback_type="helpful"
        )
        
        self.assertIsInstance(feedback, UserFeedback)
        self.assertEqual(feedback.knowledge_id, "KBE-001")
        self.assertEqual(feedback.rating, 4)
        self.assertTrue(feedback.is_helpful)
    
    def test_ac5_1_feedback_id(self):
        """AC5.1: 反馈ID生成"""
        feedback = self.engine.submit_feedback(
            knowledge_id="KBE-001",
            user_id="user123",
            rating=5,
            is_helpful=True
        )
        
        self.assertIsNotNone(feedback.id)
        self.assertTrue(feedback.id.startswith("FB-"))
    
    def test_ac5_1_multiple_feedbacks(self):
        """AC5.1: 多条反馈"""
        for i in range(3):
            self.engine.submit_feedback(
                knowledge_id="KBE-001",
                user_id=f"user{i}",
                rating=i + 3,
                is_helpful=i > 0
            )
        
        self.assertEqual(len(self.engine.feedbacks), 3)
    
    def test_ac5_1_rating_validation(self):
        """AC5.1: 评分验证"""
        # 测试边界
        feedback1 = self.engine.submit_feedback("KBE-001", "u1", 0, True)
        self.assertEqual(feedback1.rating, 1)
        
        feedback2 = self.engine.submit_feedback("KBE-001", "u2", 10, True)
        self.assertEqual(feedback2.rating, 5)
    
    def test_ac5_2_quality_metrics(self):
        """AC5.2: 质量指标计算"""
        self.engine.submit_feedback("KBE-001", "u1", 5, True)
        self.engine.submit_feedback("KBE-001", "u2", 3, True)
        self.engine.submit_feedback("KBE-001", "u3", 1, False)
        
        metrics = self.engine.quality_metrics.get("KBE-001")
        self.assertIsNotNone(metrics)
        self.assertEqual(metrics.total_views, 3)
        self.assertEqual(metrics.helpful_votes, 2)
        self.assertEqual(metrics.not_helpful_votes, 1)
        self.assertAlmostEqual(metrics.avg_rating, 3.0, places=1)
    
    def test_ac5_2_helpful_rate(self):
        """AC5.2: 有用率计算"""
        self.engine.submit_feedback("KBE-001", "u1", 5, True)
        self.engine.submit_feedback("KBE-001", "u2", 3, False)
        
        metrics = self.engine.quality_metrics["KBE-001"]
        self.assertAlmostEqual(metrics.helpful_rate, 0.5, places=1)
    
    def test_ac5_2_quality_score(self):
        """AC5.2: 质量分数"""
        metrics = QualityMetrics(
            knowledge_id="TEST",
            total_views=50,
            helpful_votes=8,
            not_helpful_votes=2,
            avg_rating=4.0
        )
        
        self.assertGreater(metrics.quality_score, 0)
        self.assertLessEqual(metrics.quality_score, 1)
    
    def test_ac5_2_quality_report(self):
        """AC5.2: 质量报告"""
        self.engine.submit_feedback("KBE-001", "u1", 5, True)
        self.engine.submit_feedback("KBE-002", "u2", 3, True)
        
        report = self.engine.get_quality_report()
        self.assertIn("total_knowledge", report)
        self.assertEqual(report["total_knowledge"], 2)
    
    def test_ac5_3_suggestions_low_quality(self):
        """AC5.3: 低质量建议"""
        # 提交多条负面反馈
        for i in range(5):
            self.engine.submit_feedback("KBE-001", f"u{i}", 1, False)
        
        suggestions = self.engine.get_suggestions(knowledge_id="KBE-001")
        self.assertGreater(len(suggestions), 0)
        
        suggestion = suggestions[0]
        self.assertEqual(suggestion.priority, "high")
    
    def test_ac5_3_suggestion_types(self):
        """AC5.3: 建议类型"""
        # 高质量 → 模板建议
        for i in range(10):
            self.engine.submit_feedback("KBE-002", f"u{i}", 5, True)
        
        suggestions = self.engine.get_suggestions(knowledge_id="KBE-002")
        # 应该有建议
        self.assertIsInstance(suggestions, list)
    
    def test_ac5_3_priority_levels(self):
        """AC5.3: 优先级"""
        suggestions = self.engine.get_suggestions()
        priorities = ["high", "medium", "low"]
        
        for s in suggestions:
            self.assertIn(s.priority, priorities)
    
    def test_ac5_4_update_queue(self):
        """AC5.4: 更新队列"""
        item = UpdateQueueItem(
            id="TEST",
            knowledge_id="KBE-001",
            update_type="modify",
            changes={"field": "solution", "new_value": "test"}
        )
        
        result = self.engine.add_to_queue(item)
        self.assertEqual(result.status, "pending")
        self.assertTrue(result.id.startswith("UQ-"))
    
    def test_ac5_4_queue_filter(self):
        """AC5.4: 队列筛选"""
        item = UpdateQueueItem("TEST", "KBE-001", "modify", {})
        self.engine.add_to_queue(item)
        
        pending = self.engine.get_update_queue(status="pending")
        self.assertGreater(len(pending), 0)
    
    def test_ac5_4_approve_update(self):
        """AC5.4: 批准更新"""
        item = self.engine.add_to_queue(UpdateQueueItem("TEST", "KBE-001", "modify", {}))
        
        success = self.engine.approve_update(item.id)
        self.assertTrue(success)
        
        updated = self.engine.get_update_queue(status="pending")
        self.assertEqual(len(updated), 0)
    
    def test_ac5_4_apply_update(self):
        """AC5.4: 应用更新"""
        item = self.engine.add_to_queue(UpdateQueueItem("TEST", "KBE-001", "modify", {}))
        self.engine.approve_update(item.id)
        
        success = self.engine.apply_update(item.id)
        self.assertTrue(success)
        
        applied = self.engine.get_update_queue(status="applied")
        self.assertEqual(len(applied), 1)
    
    def test_statistics(self):
        """综合统计"""
        self.engine.submit_feedback("KBE-001", "u1", 5, True)
        self.engine.submit_feedback("KBE-002", "u2", 3, False)
        
        stats = self.engine.get_statistics()
        self.assertIn("total_feedbacks", stats)
        self.assertEqual(stats["total_feedbacks"], 2)


if __name__ == "__main__":
    unittest.main()
