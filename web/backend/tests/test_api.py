"""
后端API测试
"""
import pytest
from httpx import AsyncClient
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))


@pytest.mark.asyncio
async def test_root():
    """测试根路径"""
    from api_server import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert "Ariba实施助手" in response.json()["name"]


@pytest.mark.asyncio
async def test_health():
    """测试健康检查"""
    from api_server import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_dashboard_stats():
    """测试仪表盘统计"""
    from api_server import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "knowledge_count" in data["data"]


@pytest.mark.asyncio
async def test_troubleshooting_query():
    """测试故障查询"""
    from api_server import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/troubleshooting/query", json={
            "query": "登录异常",
            "limit": 5
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


@pytest.mark.asyncio
async def test_projects_list():
    """测试项目列表"""
    from api_server import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/checklist/projects")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


@pytest.mark.asyncio
async def test_knowledge_graph():
    """测试知识图谱"""
    from api_server import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/graph/knowledge-graph")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data["data"]
        assert "edges" in data["data"]
