import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

// 路由懒加载 - 按需加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Troubleshooting = lazy(() => import('./pages/Troubleshooting'))
const Checklist = lazy(() => import('./pages/Checklist'))
const ProjectCreate = lazy(() => import('./pages/ProjectCreate'))
const Statistics = lazy(() => import('./pages/Statistics'))
const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph'))

// 骨架屏组件
const PageSkeleton = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    background: '#fafafa',
    borderRadius: '8px'
  }}>
    <Spin size="large" tip="页面加载中..." />
  </div>
)

// 错误边界组件
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{
    padding: '24px',
    textAlign: 'center',
    background: '#fff2f0',
    borderRadius: '8px',
    border: '1px solid #ffccc7'
  }}>
    <h3 style={{ color: '#ff4d4f', marginBottom: '8px' }}>页面加载失败</h3>
    <p style={{ color: '#8c8c8c', fontSize: '14px' }}>
      {error.message || '请刷新页面重试'}
    </p>
  </div>
)

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/checklist/:projectId" element={<Checklist />} />
          <Route path="/projects/new" element={<ProjectCreate />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
