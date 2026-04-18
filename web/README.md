# Ariba实施助手 Web界面

为SAP Ariba实施助手开发的完整Web用户界面。

## 功能模块

| 模块 | 描述 | 路由 |
|------|------|------|
| 仪表盘 | 系统概览、知识统计、项目状态 | `/dashboard` |
| 故障排除 | 知识查询、解决方案搜索 | `/troubleshooting` |
| 清单管理 | 项目列表、清单查看 | `/checklist` |
| 项目创建 | 4步向导创建项目 | `/projects/new` |
| 统计分析 | 完成率、趋势分析 | `/statistics` |
| 知识图谱 | 故障关系可视化 | `/knowledge-graph` |

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design 5 + ECharts 5
- **后端**: FastAPI + Uvicorn + Pydantic

## 快速开始

### 后端

```bash
cd backend
pip install -r requirements.txt
python api_server.py
```

服务运行在 http://localhost:8000

### 前端

```bash
cd frontend
npm install
npm run dev
```

服务运行在 http://localhost:3000

## 文档

- [API文档](./docs/API文档.md)
- [部署指南](./docs/部署指南.md)
- [用户手册](./docs/用户手册.md)
- [开发指南](./docs/开发指南.md)

## 项目结构

```
web/
├── frontend/          # React前端项目
│   ├── src/
│   │   ├── api/       # API调用
│   │   ├── components/ # 组件库
│   │   └── pages/     # 页面
│   └── package.json
├── backend/            # FastAPI后端
│   ├── api/           # API路由
│   ├── models/        # 数据模型
│   └── api_server.py
├── docs/              # 文档
└── .ralph/            # Ralph开发日志
```

## 开发日志

详见 [.ralph](./.ralph/) 目录

## License

MIT
