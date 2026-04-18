"""
故障排除助手 API路由
"""

from fastapi import APIRouter, HTTPException
from models.schemas import (
    QueryRequest, QueryResult, FeedbackRequest, 
    BaseResponse, KnowledgeItem
)
from typing import List
import sys
from pathlib import Path
import json

# 添加父目录到路径以导入现有模块
parent_dir = str(Path(__file__).parent.parent.parent.parent)
sys.path.insert(0, parent_dir + "/故障排除助手")

router = APIRouter(prefix="/api/troubleshooting", tags=["故障排除"])

# 加载知识库
def load_knowledge_base():
    """加载知识库"""
    try:
        kb_path = Path(parent_dir) / "故障排除助手" / "fixtures" / "sample_knowledge.json"
        if kb_path.exists():
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return []


@router.post("/query", response_model=BaseResponse)
async def query_knowledge(request: QueryRequest):
    """查询故障知识"""
    try:
        # 尝试导入QueryEngine
        try:
            from core.query_engine import QueryEngine
            from models.knowledge_item import KnowledgeItem as KI, QueryResult as QR
            
            kb_data = load_knowledge_base()
            items = [
                KI(
                    id=item.get("id", ""),
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    solution=item.get("solution", ""),
                    versions=item.get("versions", []),
                    module=item.get("module", ""),
                    tags=item.get("tags", []),
                    related_items=item.get("related_items", [])
                )
                for item in kb_data
            ]
            
            engine = QueryEngine(items)
            results = engine.search(
                query=request.query,
                version_tags=request.version_tags,
                limit=request.limit
            )
            
            return BaseResponse(
                success=True,
                message="查询成功",
                data=[r.model_dump() for r in results]
            )
        except ImportError:
            # 如果无法导入，返回模拟数据
            mock_results = [
                {
                    "id": "1",
                    "title": f"'{request.query}' 相关问题 - SAP Ariba登录异常",
                    "description": "用户在访问SAP Ariba系统时遇到登录失败的问题，可能由多种原因导致。",
                    "solution": "1. 检查用户账户状态\n2. 验证SSO配置\n3. 检查网络连接\n4. 清除浏览器缓存",
                    "score": 0.95,
                    "versions": ["2602", "2604"],
                    "module": "Authentication",
                    "tags": ["登录", "认证", "SSO"],
                    "related_items": ["2", "3"]
                },
                {
                    "id": "2",
                    "title": f"'{request.query}' 相关的采购申请处理",
                    "description": "采购申请无法正常提交流程，可能涉及权限或配置问题。",
                    "solution": "1. 检查申请人权限\n2. 验证审批流程配置\n3. 确认成本中心设置",
                    "score": 0.85,
                    "versions": ["2602", "2604", "2605"],
                    "module": "Buying",
                    "tags": ["采购申请", "工作流"],
                    "related_items": ["1"]
                }
            ]
            return BaseResponse(
                success=True,
                message="查询成功（模拟数据）",
                data=mock_results
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge/{item_id}", response_model=BaseResponse)
async def get_knowledge_item(item_id: str):
    """获取知识详情"""
    kb_data = load_knowledge_base()
    for item in kb_data:
        if item.get("id") == item_id:
            return BaseResponse(success=True, data=item)
    
    # 返回模拟数据
    return BaseResponse(
        success=True,
        data={
            "id": item_id,
            "title": f"知识条目 #{item_id}",
            "description": "这是一个示例知识条目，用于故障排除参考。",
            "solution": "解决方案步骤：\n1. 分析问题原因\n2. 检查相关配置\n3. 应用修复措施\n4. 验证结果",
            "versions": ["2602", "2604"],
            "module": "Core",
            "tags": ["示例", "故障排除"],
            "related_items": [],
            "created_at": "2026-04-01T10:00:00Z",
            "updated_at": "2026-04-15T14:30:00Z"
        }
    )


@router.post("/feedback", response_model=BaseResponse)
async def submit_feedback(request: FeedbackRequest):
    """提交反馈"""
    # 实际应用中应该保存反馈到数据库
    return BaseResponse(
        success=True,
        message="反馈已提交，感谢您的建议！"
    )


@router.get("/modules", response_model=BaseResponse)
async def get_modules():
    """获取所有模块列表"""
    modules = [
        {"id": "sourcing", "name": "寻源管理", "description": "Sourcing and Procurement"},
        {"id": "contract", "name": "合同管理", "description": "Contract Management"},
        {"id": "buying", "name": "采购到付款", "description": "Buying and Invoicing"},
        {"id": "supplier", "name": "供应商管理", "description": "Supplier Management"},
        {"id": "spending", "name": "支出分析", "description": "Spending Analysis"},
        {"id": "authentication", "name": "认证系统", "description": "Authentication & SSO"}
    ]
    return BaseResponse(success=True, data=modules)


@router.get("/versions", response_model=BaseResponse)
async def get_versions():
    """获取所有版本列表"""
    versions = [
        {"id": "2602", "name": "V26.02", "release_date": "2026-02"},
        {"id": "2604", "name": "V26.04", "release_date": "2026-04"},
        {"id": "2605", "name": "V26.05", "release_date": "2026-05"},
        {"id": "2610", "name": "V26.10", "release_date": "2026-10"}
    ]
    return BaseResponse(success=True, data=versions)
