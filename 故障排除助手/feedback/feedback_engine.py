"""学习反馈引擎 - US5"""
from typing import List, Dict, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime
from collections import defaultdict
import json
import os


@dataclass
class UserFeedback:
    id: str
    knowledge_id: str
    user_id: str
    rating: int
    is_helpful: bool
    feedback_type: str
    comment: str = ""
    timestamp: str = ""
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now().isoformat()


@dataclass
class QualityMetrics:
    knowledge_id: str
    total_views: int = 0
    helpful_votes: int = 0
    not_helpful_votes: int = 0
    avg_rating: float = 0.0
    suggestion_count: int = 0
    error_report_count: int = 0
    
    @property
    def helpful_rate(self) -> float:
        total = self.helpful_votes + self.not_helpful_votes
        return self.helpful_votes / total if total > 0 else 0.0
    
    @property
    def quality_score(self) -> float:
        view_score = min(self.total_views / 100, 1.0) * 0.3
        return self.helpful_rate * 0.4 + (self.avg_rating / 5) * 0.3 + view_score


@dataclass
class OptimizationSuggestion:
    id: str
    knowledge_id: str
    suggestion_type: str
    priority: str
    reason: str
    suggested_changes: Dict
    status: str = "pending"
    evidence: List[str] = field(default_factory=list)
    created_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


@dataclass
class UpdateQueueItem:
    id: str
    knowledge_id: str
    update_type: str
    changes: Dict
    status: str = "pending"
    created_at: str = ""
    applied_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class FeedbackEngine:
    def __init__(self, storage_path: str = None):
        self.storage_path = storage_path or "feedback_data.json"
        self.feedbacks: List[UserFeedback] = []
        self.quality_metrics: Dict[str, QualityMetrics] = {}
        self.suggestions: List[OptimizationSuggestion] = []
        self.update_queue: List[UpdateQueueItem] = []
    
    def submit_feedback(self, knowledge_id: str, user_id: str, rating: int, is_helpful: bool, feedback_type: str = "helpful", comment: str = "") -> UserFeedback:
        feedback = UserFeedback(
            id=f"FB-{len(self.feedbacks) + 1:05d}",
            knowledge_id=knowledge_id, user_id=user_id,
            rating=min(max(rating, 1), 5), is_helpful=is_helpful,
            feedback_type=feedback_type, comment=comment[:500]
        )
        self.feedbacks.append(feedback)
        self._update_quality_metrics(knowledge_id)
        self._generate_suggestions(knowledge_id)
        self._save_data()
        return feedback
    
    def _update_quality_metrics(self, knowledge_id: str):
        kb_feedbacks = [f for f in self.feedbacks if f.knowledge_id == knowledge_id]
        if not kb_feedbacks:
            return
        metrics = QualityMetrics(
            knowledge_id=knowledge_id,
            total_views=len(kb_feedbacks),
            helpful_votes=sum(1 for f in kb_feedbacks if f.is_helpful),
            not_helpful_votes=sum(1 for f in kb_feedbacks if not f.is_helpful),
            avg_rating=sum(f.rating for f in kb_feedbacks) / len(kb_feedbacks),
            suggestion_count=sum(1 for f in kb_feedbacks if f.feedback_type == "suggestion"),
            error_report_count=sum(1 for f in kb_feedbacks if f.feedback_type == "error_report")
        )
        self.quality_metrics[knowledge_id] = metrics
    
    def _generate_suggestions(self, knowledge_id: str):
        if knowledge_id not in self.quality_metrics:
            return
        metrics = self.quality_metrics[knowledge_id]
        
        suggestion_type, priority, reason, changes = None, "medium", "", {}
        
        if metrics.quality_score < 0.3:
            suggestion_type, priority, reason = "update", "high", f"质量分数较低({metrics.quality_score:.2f})"
            changes = {"action": "review_and_update"}
        elif metrics.quality_score > 0.8:
            suggestion_type, priority, reason = "create", "low", "高质量内容"
            changes = {"action": "use_as_template"}
        
        if suggestion_type:
            existing = [s for s in self.suggestions if s.knowledge_id == knowledge_id and s.status == "pending"]
            if not existing:
                suggestion = OptimizationSuggestion(
                    id=f"SG-{len(self.suggestions) + 1:05d}", knowledge_id=knowledge_id,
                    suggestion_type=suggestion_type, priority=priority, reason=reason,
                    suggested_changes=changes, evidence=[f"质量分数: {metrics.quality_score:.2f}"]
                )
                self.suggestions.append(suggestion)
    
    def _save_data(self):
        data = {
            "feedbacks": [asdict(f) for f in self.feedbacks],
            "metrics": {k: asdict(v) for k, v in self.quality_metrics.items()},
            "suggestions": [asdict(s) for s in self.suggestions],
            "queue": [asdict(q) for q in self.update_queue]
        }
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def get_quality_report(self) -> Dict:
        if not self.quality_metrics:
            return {"total_knowledge": 0, "average_quality": 0, "pending_suggestions": 0}
        all_metrics = list(self.quality_metrics.values())
        return {
            "total_knowledge": len(all_metrics),
            "average_quality": sum(m.quality_score for m in all_metrics) / len(all_metrics),
            "total_feedbacks": len(self.feedbacks),
            "pending_suggestions": len([s for s in self.suggestions if s.status == "pending"])
        }
    
    def get_suggestions(self, knowledge_id: str = None, priority: str = None, limit: int = 10) -> List[OptimizationSuggestion]:
        suggestions = [s for s in self.suggestions if s.status == "pending"]
        if knowledge_id:
            suggestions = [s for s in suggestions if s.knowledge_id == knowledge_id]
        if priority:
            suggestions = [s for s in suggestions if s.priority == priority]
        return suggestions[:limit]
    
    def add_to_queue(self, update_item: UpdateQueueItem) -> UpdateQueueItem:
        item = UpdateQueueItem(id=f"UQ-{len(self.update_queue) + 1:05d}", knowledge_id=update_item.knowledge_id, update_type=update_item.update_type, changes=update_item.changes)
        self.update_queue.append(item)
        self._save_data()
        return item
    
    def get_update_queue(self, status: str = None, limit: int = 20) -> List[UpdateQueueItem]:
        queue = self.update_queue
        if status:
            queue = [q for q in queue if q.status == status]
        return queue[:limit]
    
    def approve_update(self, queue_item_id: str) -> bool:
        for item in self.update_queue:
            if item.id == queue_item_id:
                item.status = "approved"
                self._save_data()
                return True
        return False
    
    def apply_update(self, queue_item_id: str) -> bool:
        for item in self.update_queue:
            if item.id == queue_item_id and item.status == "approved":
                item.status = "applied"
                item.applied_at = datetime.now().isoformat()
                self._save_data()
                return True
        return False
    
    def get_statistics(self) -> Dict:
        return {
            "total_feedbacks": len(self.feedbacks),
            "pending_suggestions": len([s for s in self.suggestions if s.status == "pending"]),
            "pending_updates": len([q for q in self.update_queue if q.status == "pending"]),
            "applied_updates": len([q for q in self.update_queue if q.status == "applied"])
        }


def create_feedback_engine(storage_path: str = None) -> FeedbackEngine:
    return FeedbackEngine(storage_path)


__all__ = ["FeedbackEngine", "create_feedback_engine", "UserFeedback", "QualityMetrics", "OptimizationSuggestion", "UpdateQueueItem"]
