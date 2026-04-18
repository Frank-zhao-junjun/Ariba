# web/ 目录 - 辅助服务（可选扩展）

> ⚠️ **注意**: 此目录包含的是**辅助/遗留子系统**，不是项目的主前端。
> 
> **主系统**位于项目根目录的 `src/`，是一个完整的 Next.js 16 + React 19 应用。

## 目录定位

```
项目根目录/
├── src/                    ← 主系统（Next.js 前端）⭐ 推荐使用
│   ├── app/               # 项目管理、知识库、AI助手等
│   └── lib/               # 业务逻辑 + 模拟数据
│
└── web/                   ← 辅助服务（本目录）可选扩展
    ├── backend/           # FastAPI 后端服务
    └── frontend/          # 遗留 React + Vite 前端（不建议使用）
```

## 使用场景

### 场景1：仅使用主系统（推荐）
```bash
cd /项目根目录
pnpm install
pnpm dev
# 访问 http://localhost:5000
```
主系统已包含完整的前端界面和模拟数据，可独立运行。

### 场景2：需要 FastAPI 辅助服务（可选）
当你需要以下功能时，可以启动辅助服务：
- 故障排除智能诊断 API
- 检查清单生成 API
- 知识图谱查询 API

```bash
cd /项目根目录/web/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api_server.py
# API 文档 http://localhost:8000/docs
```

## web/backend/ 结构

```
web/backend/
├── api/                   # API 路由
│   ├── troubleshooting.py # 故障排除
│   ├── checklist.py       # 检查清单
│   ├── dashboard.py       # 仪表板数据
│   └── graph.py           # 知识图谱
├── models/                # 数据模型
├── tests/                 # 测试
├── api_server.py          # 服务入口
└── requirements.txt       # 依赖
```

## web/frontend/ 说明（遗留）

`web/frontend/` 是一个独立的 React + Vite + Ant Design 前端项目，
**与主系统（Next.js）是平行关系，不是替代关系**。

由于主系统（`src/`）功能更完善、维护更活跃，
建议优先使用主系统，此遗留前端仅作参考。

## Docker 使用

辅助服务可通过 Docker Compose 与主系统一起启动：

```bash
# 开发环境 - 同时启动主系统和辅助服务
docker-compose -f docker-compose.dev.yml up

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

## 开发历史

此目录最初是作为一个完整前后端系统开发的，
后来项目架构演进，主前端迁移到了根目录的 Next.js。

保留此目录的原因：
1. FastAPI 后端仍作为可选扩展服务使用
2. 部分功能（故障排除、知识图谱）仍在此维护
3. 遗留前端代码可供参考

## 相关文档

- [项目根目录 README](../README.md) - 主系统文档
- [API文档](./docs/API文档.md)
- [.ralph 开发日志](./.ralph/)

## License

MIT
