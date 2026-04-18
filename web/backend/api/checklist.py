"""
清单管理 API路由
"""

from fastapi import APIRouter, HTTPException
from models.schemas import (
    CreateProjectRequest, Checklist, ChecklistItem,
    ProjectStats, ModuleStats, BaseResponse, ProjectProfile
)
from typing import List, Dict
import sys
from pathlib import Path
import json
from datetime import datetime

router = APIRouter(prefix="/api/checklist", tags=["清单管理"])

# 模拟数据存储
_projects_db: Dict[str, Checklist] = {}


def load_demo_checklist():
    """加载演示清单数据"""
    parent_dir = str(Path(__file__).parent.parent.parent.parent)
    try:
        path = Path(parent_dir) / "实施检查清单生成器" / "fixtures" / "demo_checklist.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return None


@router.post("/projects", response_model=BaseResponse)
async def create_project(request: CreateProjectRequest):
    """创建新项目"""
    try:
        # 尝试使用ChecklistGenerator
        try:
            parent_dir = str(Path(__file__).parent.parent.parent.parent)
            sys.path.insert(0, parent_dir + "/实施检查清单生成器")
            from core.checklist_generator import ChecklistGenerator
            
            generator = ChecklistGenerator()
            checklist = generator.generate_all_phases_checklist(
                modules=request.modules,
                version=request.version,
                project_name=request.name
            )
            
            return BaseResponse(
                success=True,
                message="项目创建成功",
                data=checklist
            )
        except ImportError:
            pass
        
        # 返回模拟数据
        project_id = f"proj_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        mock_checklist = {
            "id": project_id,
            "name": f"{request.name} - 清单",
            "project_name": request.name,
            "version": request.version,
            "phases": [
                {"id": "phase_1", "name": "项目准备", "description": "项目启动和准备阶段", "order": 1},
                {"id": "phase_2", "name": "需求分析", "description": "业务需求收集和分析", "order": 2},
                {"id": "phase_3", "name": "系统配置", "description": "系统参数配置", "order": 3},
                {"id": "phase_4", "name": "测试验证", "description": "功能测试和验证", "order": 4},
                {"id": "phase_5", "name": "上线部署", "description": "生产环境部署", "order": 5}
            ],
            "items": [
                {
                    "id": "item_1",
                    "phase_id": "phase_1",
                    "phase_name": "项目准备",
                    "module_id": "core",
                    "module_name": "核心模块",
                    "title": "成立项目团队",
                    "description": "组建实施团队，确定关键角色",
                    "status": "pending",
                    "priority": "high",
                    "assignee": None,
                    "due_date": None,
                    "notes": ""
                }
            ],
            "total_items": 25,
            "completed_items": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        _projects_db[project_id] = mock_checklist
        
        return BaseResponse(
            success=True,
            message="项目创建成功（模拟数据）",
            data=mock_checklist
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects", response_model=BaseResponse)
async def list_projects():
    """获取项目列表"""
    projects = list(_projects_db.values())
    if not projects:
        # 返回示例数据
        projects = [
            {
                "id": "proj_demo_1",
                "name": "Ariba实施项目Alpha",
                "project_name": "Alpha公司实施",
                "version": "2605",
                "total_items": 50,
                "completed_items": 15,
                "completion_rate": 0.30,
                "status": "active",
                "created_at": "2026-03-01T10:00:00Z",
                "updated_at": "2026-04-15T14:30:00Z"
            },
            {
                "id": "proj_demo_2",
                "name": "Ariba实施项目Beta",
                "project_name": "Beta公司部署",
                "version": "2604",
                "total_items": 35,
                "completed_items": 28,
                "completion_rate": 0.80,
                "status": "active",
                "created_at": "2026-02-15T09:00:00Z",
                "updated_at": "2026-04-14T16:45:00Z"
            }
        ]
    return BaseResponse(success=True, data=projects)


@router.get("/projects/{project_id}", response_model=BaseResponse)
async def get_project(project_id: str):
    """获取项目详情"""
    if project_id in _projects_db:
        return BaseResponse(success=True, data=_projects_db[project_id])
    
    # 返回模拟数据
    demo_data = load_demo_checklist()
    if demo_data:
        return BaseResponse(success=True, data=demo_data)
    
    return BaseResponse(
        success=True,
        data={
            "id": project_id,
            "name": f"项目 {project_id}",
            "project_name": "演示项目",
            "version": "2605",
            "phases": [
                {"id": "phase_1", "name": "项目准备", "description": "", "order": 1},
                {"id": "phase_2", "name": "需求分析", "description": "", "order": 2},
                {"id": "phase_3", "name": "系统配置", "description": "", "order": 3},
                {"id": "phase_4", "name": "测试验证", "description": "", "order": 4},
                {"id": "phase_5", "name": "上线部署", "description": "", "order": 5}
            ],
            "items": [],
            "total_items": 25,
            "completed_items": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    )


@router.patch("/projects/{project_id}/items/{item_id}", response_model=BaseResponse)
async def update_item(project_id: str, item_id: str, update_data: dict):
    """更新清单项状态"""
    return BaseResponse(
        success=True,
        message=f"清单项 {item_id} 已更新"
    )


@router.get("/stats", response_model=BaseResponse)
async def get_stats():
    """获取统计数据"""
    stats = {
        "total_projects": 5,
        "active_projects": 3,
        "completed_projects": 2,
        "completion_rate": 0.65,
        "average_duration": 45.5,
        "overdue_projects": 1,
        "module_stats": [
            {"module_id": "sourcing", "module_name": "寻源管理", "total_items": 100, "completed_items": 75, "completion_rate": 0.75},
            {"module_id": "buying", "module_name": "采购到付款", "total_items": 80, "completed_items": 60, "completion_rate": 0.75},
            {"module_id": "contract", "module_name": "合同管理", "total_items": 50, "completed_items": 40, "completion_rate": 0.80}
        ]
    }
    return BaseResponse(success=True, data=stats)


@router.get("/recommendations", response_model=BaseResponse)
async def get_recommendations(profile: str = ""):
    """获取推荐项"""
    recommendations = {
        "risk_level": "medium",
        "risk_score": 65,
        "recommended_additions": [
            {"module_id": "sourcing", "title": "供应商资格预审", "reason": "制造业高风险"},
            {"module_id": "buying", "title": "审批流程定制", "reason": "大型企业需要"}
        ],
        "timeline_estimate": "12-16周"
    }
    return BaseResponse(success=True, data=recommendations)
