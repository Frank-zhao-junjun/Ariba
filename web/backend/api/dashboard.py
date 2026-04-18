"""
仪表盘 API路由
"""

from fastapi import APIRouter
from models.schemas import DashboardStats, BaseResponse
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["仪表盘"])


@router.get("/stats", response_model=BaseResponse)
async def get_dashboard_stats():
    """获取仪表盘统计数据"""
    stats = {
        "knowledge_count": 256,
        "version_distribution": {
            "2602": 80,
            "2604": 95,
            "2605": 71,
            "2610": 10
        },
        "recent_updates": [
            {
                "id": "1",
                "title": "SAP Ariba 2605 新功能：Joule AI助手",
                "description": "集成AI能力的智能助手功能介绍",
                "solution": "配置步骤详见文档",
                "versions": ["2605"],
                "module": "AI",
                "tags": ["AI", "Joule"],
                "related_items": [],
                "created_at": "2026-04-15T10:00:00Z",
                "updated_at": "2026-04-15T10:00:00Z"
            },
            {
                "id": "2",
                "title": "采购申请审批流程优化",
                "description": "新版审批流程配置指南",
                "solution": "工作流配置步骤",
                "versions": ["2604", "2605"],
                "module": "Buying",
                "tags": ["审批", "工作流"],
                "related_items": [],
                "created_at": "2026-04-14T15:30:00Z",
                "updated_at": "2026-04-14T15:30:00Z"
            }
        ],
        "active_projects": 3,
        "completion_rate": 0.72,
        "system_health": 98.5,
        "alerts": [
            "1个项目即将逾期",
            "知识库有3条待审核条目"
        ]
    }
    return BaseResponse(success=True, data=stats)


@router.get("/health", response_model=BaseResponse)
async def get_system_health():
    """获取系统健康状态"""
    health = {
        "overall_score": 98.5,
        "components": {
            "api": {"status": "healthy", "latency_ms": 45},
            "database": {"status": "healthy", "latency_ms": 12},
            "knowledge_base": {"status": "healthy", "count": 256},
            "cache": {"status": "healthy", "hit_rate": 0.87}
        },
        "metrics": {
            "requests_today": 1256,
            "avg_response_time": 125,
            "error_rate": 0.002
        },
        "timestamp": datetime.now().isoformat()
    }
    return BaseResponse(success=True, data=health)


@router.get("/activity", response_model=BaseResponse)
async def get_recent_activity(limit: int = 10):
    """获取最近活动"""
    activities = [
        {"type": "query", "user": "张三", "action": "查询了'登录异常'相关问题", "time": "5分钟前"},
        {"type": "checklist", "user": "李四", "action": "更新了清单项状态", "time": "15分钟前"},
        {"type": "feedback", "user": "王五", "action": "提交了反馈", "time": "30分钟前"},
        {"type": "project", "user": "赵六", "action": "创建了新项目", "time": "1小时前"},
        {"type": "query", "user": "钱七", "action": "查询了'审批流程'", "time": "2小时前"}
    ]
    return BaseResponse(success=True, data=activities[:limit])
