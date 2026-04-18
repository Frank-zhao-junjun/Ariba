#!/usr/bin/env python3
"""
Ariba实施助手 - Web API服务器
基于FastAPI构建
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import uvicorn

from api import (
    troubleshooting_router,
    checklist_router,
    dashboard_router,
    graph_router
)

# 创建FastAPI应用
app = FastAPI(
    title="Ariba实施助手 API",
    description="""
    SAP Ariba 实施助手后端API服务
    
    ## 功能模块
    
    * **故障排除** - 知识查询、语义搜索、反馈提交
    * **清单管理** - 项目创建、清单生成、执行追踪
    * **仪表盘** - 系统概览、统计数据、健康监控
    * **知识图谱** - 关系可视化、版本对比
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(dashboard_router)
app.include_router(troubleshooting_router)
app.include_router(checklist_router)
app.include_router(graph_router)


@app.get("/", tags=["首页"])
async def root():
    """API首页"""
    return {
        "name": "Ariba实施助手 API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/dashboard/health"
    }


@app.get("/health", tags=["健康检查"])
async def health_check():
    """健康检查"""
    return {"status": "healthy", "service": "Ariba Assistant API"}


# 启动命令
if __name__ == "__main__":
    print("\n" + "="*50)
    print("  Ariba实施助手 - Web API Server")
    print("="*50)
    print("\n📚 API文档: http://localhost:8000/docs")
    print("📖 ReDoc文档: http://localhost:8000/redoc")
    print("🏥 健康检查: http://localhost:8000/health")
    print("\n按 Ctrl+C 停止服务\n")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
