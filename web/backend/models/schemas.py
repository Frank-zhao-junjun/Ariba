"""
Ariba实施助手 - API数据模型
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ============ 通用模型 ============
class BaseResponse(BaseModel):
    """基础响应"""
    success: bool = True
    message: str = ""
    data: Optional[Any] = None


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """分页响应"""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============ 故障排除模块 ============
class KnowledgeItem(BaseModel):
    """知识条目"""
    id: str
    title: str
    description: str
    solution: str
    versions: List[str] = []
    module: str = ""
    tags: List[str] = []
    related_items: List[str] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class QueryRequest(BaseModel):
    """查询请求"""
    query: str = Field(..., min_length=1, max_length=500)
    version_tags: List[str] = []
    modules: List[str] = []
    limit: int = Field(default=10, ge=1, le=50)


class QueryResult(BaseModel):
    """查询结果"""
    id: str
    title: str
    description: str
    solution: str
    score: float
    versions: List[str]
    module: str
    tags: List[str]
    related_items: List[str]


class FeedbackRequest(BaseModel):
    """反馈请求"""
    item_id: str
    query: str
    helpful: bool
    comment: Optional[str] = ""


# ============ 清单管理模块 ============
class PhaseItem(BaseModel):
    """清单阶段项"""
    id: str
    name: str
    description: str
    order: int


class ChecklistItem(BaseModel):
    """清单项"""
    id: str
    phase_id: str
    phase_name: str
    module_id: str
    module_name: str
    title: str
    description: str
    status: str = "pending"
    priority: str = "medium"
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    notes: str = ""


class Checklist(BaseModel):
    """清单"""
    id: str
    name: str
    project_name: str
    version: str
    phases: List[PhaseItem]
    items: List[ChecklistItem]
    total_items: int
    completed_items: int
    created_at: str
    updated_at: str


class ProjectProfile(BaseModel):
    """项目配置"""
    company_size: str
    industry: str
    existing_systems: List[str]
    integration_level: str


class CreateProjectRequest(BaseModel):
    """创建项目请求"""
    name: str
    profile: ProjectProfile
    modules: List[str]
    version: str
    template_id: Optional[str] = None


class ProjectStats(BaseModel):
    """项目统计"""
    total_projects: int
    active_projects: int
    completed_projects: int
    completion_rate: float
    average_duration: float
    overdue_projects: int


class ModuleStats(BaseModel):
    """模块统计"""
    module_id: str
    module_name: str
    total_items: int
    completed_items: int
    completion_rate: float


# ============ 知识图谱模块 ============
class GraphNode(BaseModel):
    """图谱节点"""
    id: str
    label: str
    type: str  # error, cause, solution, module
    properties: Dict[str, Any] = {}


class GraphEdge(BaseModel):
    """图谱边"""
    source: str
    target: str
    relation: str


class KnowledgeGraph(BaseModel):
    """知识图谱"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]


# ============ 仪表盘模块 ============
class DashboardStats(BaseModel):
    """仪表盘统计"""
    knowledge_count: int
    version_distribution: Dict[str, int]
    recent_updates: List[KnowledgeItem]
    active_projects: int
    completion_rate: float
    system_health: float
    alerts: List[str]
