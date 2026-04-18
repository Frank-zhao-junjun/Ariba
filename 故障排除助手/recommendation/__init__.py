"""
解决方案推荐模块
"""
from .recommendation_engine import (
    RecommendationEngine,
    create_recommendation_engine,
    RelatedKnowledge,
    SimilarCase,
    DocumentLink,
    BestPractice,
    RecommendationResult
)

__all__ = [
    "RecommendationEngine",
    "create_recommendation_engine",
    "RelatedKnowledge",
    "SimilarCase",
    "DocumentLink",
    "BestPractice",
    "RecommendationResult"
]
