# Ralph技术决策记录

## 决策1: 前端框架选择
**日期**: 2026-04-17
**选项分析**:
| 框架 | 优点 | 缺点 |
|------|------|------|
| React+TS+Vite | 类型安全、生态丰富、构建快 | 学习曲线 |
| Vue+TS | 简单易学、单文件组件 | 生态相对较小 |
| Next.js | SSR/SSG支持、SEO友好 | 复杂度过高 |

**决策**: React + TypeScript + Vite
**理由**: 
1. 与现有Python后端解耦，独立部署
2. TypeScript提供类型安全，减少运行时错误
3. Vite构建速度快，开发体验好
4. Ant Design组件库支持完善

## 决策2: UI组件库选择
**选项**: Ant Design 5 vs Material-UI
**决策**: Ant Design 5
**理由**:
1. 企业级应用风格，符合B端产品定位
2. 中文文档完善
3. 组件丰富，覆盖表格、表单、图表等
4. 主题定制灵活

## 决策3: 后端框架选择
**选项**: FastAPI vs Flask vs Django
**决策**: FastAPI
**理由**:
1. 原生Python，与现有代码集成方便
2. 自动OpenAPI文档生成
3. 异步支持，性能优异
4. Pydantic数据验证
5. 类型提示与前端TypeScript对应

## 决策4: 图表库选择
**选项**: ECharts vs Recharts vs Ant Design Charts
**决策**: ECharts 5
**理由**:
1. 图表类型丰富（折线、饼图、雷达、K线等）
2. 大数据量性能好
3. 知识图谱可视化支持好
4. 主题定制灵活

## 决策5: 状态管理方案
**选项**: Redux Toolkit vs Zustand vs React Query
**决策**: Zustand + React Query组合
**理由**:
1. Zustand轻量级，API简洁
2. React Query处理服务端状态
3. 减少样板代码
