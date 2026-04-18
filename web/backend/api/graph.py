"""
知识图谱 API路由
"""

from fastapi import APIRouter
from models.schemas import KnowledgeGraph, GraphNode, GraphEdge, BaseResponse

router = APIRouter(prefix="/api/graph", tags=["知识图谱"])


@router.get("/knowledge-graph", response_model=BaseResponse)
async def get_knowledge_graph(version: str = ""):
    """获取知识图谱数据"""
    # 模拟知识图谱数据
    nodes = [
        # 错误节点
        GraphNode(id="e1", label="登录失败", type="error", properties={"count": 45}),
        GraphNode(id="e2", label="审批超时", type="error", properties={"count": 32}),
        GraphNode(id="e3", label="数据同步失败", type="error", properties={"count": 28}),
        
        # 原因节点
        GraphNode(id="c1", label="SSO配置错误", type="cause", properties={"severity": "high"}),
        GraphNode(id="c2", label="网络延迟", type="cause", properties={"severity": "medium"}),
        GraphNode(id="c3", label="权限不足", type="cause", properties={"severity": "high"}),
        
        # 解决方案节点
        GraphNode(id="s1", label="检查SSO配置", type="solution", properties={"success_rate": 0.92}),
        GraphNode(id="s2", label="优化网络", type="solution", properties={"success_rate": 0.85}),
        GraphNode(id="s3", label="更新权限", type="solution", properties={"success_rate": 0.95}),
        
        # 模块节点
        GraphNode(id="m1", label="认证模块", type="module", properties={"stability": 0.98}),
        GraphNode(id="m2", label="工作流引擎", type="module", properties={"stability": 0.95}),
    ]
    
    edges = [
        GraphEdge(source="e1", target="c1", relation="caused_by"),
        GraphEdge(source="e1", target="c2", relation="caused_by"),
        GraphEdge(source="e2", target="c2", relation="caused_by"),
        GraphEdge(source="e2", target="c3", relation="caused_by"),
        GraphEdge(source="e3", target="c3", relation="caused_by"),
        GraphEdge(source="c1", target="s1", relation="resolved_by"),
        GraphEdge(source="c2", target="s2", relation="resolved_by"),
        GraphEdge(source="c3", target="s3", relation="resolved_by"),
        GraphEdge(source="e1", target="m1", relation="belongs_to"),
        GraphEdge(source="e2", target="m2", relation="belongs_to"),
    ]
    
    graph = {
        "nodes": [n.model_dump() for n in nodes],
        "edges": [e.model_dump() for e in edges]
    }
    
    return BaseResponse(success=True, data=graph)


@router.get("/version-comparison", response_model=BaseResponse)
async def compare_versions(version1: str, version2: str):
    """比较两个版本的差异"""
    comparison = {
        "version1": version1,
        "version2": version2,
        "added_knowledge": [
            {"id": "k1", "title": "Joule AI助手配置", "type": "feature"},
            {"id": "k2", "title": "新审批流程", "type": "feature"}
        ],
        "modified_knowledge": [
            {"id": "k3", "title": "SSO配置说明", "change": "enhanced"}
        ],
        "deprecated_knowledge": [
            {"id": "k4", "title": "旧版登录接口", "replacement": "k5"}
        ]
    }
    return BaseResponse(success=True, data=comparison)
