import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './styles/global.css'

// 优化的QueryClient配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 失败重试次数
      retry: 2,
      // 数据新鲜时间：10分钟（比之前的5分钟更长，减少重复请求）
      staleTime: 10 * 60 * 1000,
      // 垃圾回收时间：30分钟
      gcTime: 30 * 60 * 1000,
      // 重复请求时间间隔：2秒（防止快速重复请求）
      refetchOnWindowFocus: false,  // 禁用窗口聚焦时自动刷新
      // 网络恢复时自动刷新
      refetchOnReconnect: 'always',
    },
    mutations: {
      // 突变操作失败重试次数
      retry: 1,
    },
  },
})

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN} theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
