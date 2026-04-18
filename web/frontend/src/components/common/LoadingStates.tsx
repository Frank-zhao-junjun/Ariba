/**
 * 加载状态组件库
 * 提供统一风格的加载状态展示
 */
import { Spin, Skeleton, Card, Space, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import React from 'react'

// 自定义加载指示器
const customSpinIndicator = (
  <LoadingOutlined style={{ fontSize: 36, color: '#1890ff' }} spin />
)

// 全屏加载
export const FullPageLoading = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f0f2f5',
      gap: 16,
    }}
  >
    <Spin indicator={customSpinIndicator} size="large" />
    <span style={{ color: '#8c8c8c', fontSize: 14 }}>页面加载中...</span>
  </div>
)

// 内容区加载
export const ContentLoading = ({ height = 400 }: { height?: number }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height,
    }}
  >
    <Spin indicator={customSpinIndicator} size="large" />
  </div>
)

// 卡片加载骨架
export const CardSkeleton = ({ count = 3 }: { count?: number }) => (
  <Space direction="vertical" size={16} style={{ width: '100%' }}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} style={{ borderRadius: 12 }}>
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </Card>
    ))}
  </Space>
)

// 列表加载骨架
export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        style={{
          display: 'flex',
          gap: 12,
          padding: 16,
          background: '#fff',
          borderRadius: 8,
        }}
      >
        <Skeleton.Avatar active size="small" />
        <div style={{ flex: 1 }}>
          <Skeleton.Input active style={{ width: '60%', height: 16 }} />
          <Skeleton.Input active style={{ width: '40%', height: 12, marginTop: 8 }} />
        </div>
      </div>
    ))}
  </div>
)

// 统计卡片骨架
export const StatCardsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: 16,
    }}
  >
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Skeleton.Avatar active size={48} shape="square" />
          <div style={{ flex: 1 }}>
            <Skeleton.Input active style={{ width: '40%', height: 14 }} />
            <Skeleton.Input active style={{ width: '60%', height: 24, marginTop: 8 }} />
          </div>
        </div>
      </Card>
    ))}
  </div>
)

// 图表加载骨架
export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <Card style={{ borderRadius: 12 }}>
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s infinite',
        borderRadius: 8,
      }}
    >
      <Spin indicator={customSpinIndicator} />
    </div>
  </Card>
)

// 按钮加载状态
export const ButtonLoading = ({ children, loading, ...props }: any) => (
  <Button {...props}>
    {loading ? <Spin size="small" indicator={<LoadingOutlined spin />} /> : children}
  </Button>
)

// 渐变进度条加载
export const ProgressLoading = () => (
  <div
    style={{
      width: '100%',
      height: 4,
      background: '#f0f0f0',
      borderRadius: 2,
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    <div
      style={{
        position: 'absolute',
        height: '100%',
        background: 'linear-gradient(90deg, #1890ff, #69c0ff, #1890ff)',
        backgroundSize: '200% 100%',
        animation: 'gradient-moving 1.5s linear infinite',
        borderRadius: 2,
      }}
    />
    <style>{`
      @keyframes gradient-moving {
        0% { width: 0%; left: 0; }
        50% { width: 60%; left: 20%; }
        100% { width: 0%; left: 100%; }
      }
    `}</style>
  </div>
)

// 加载文本
export const LoadingText = ({ text = '加载中...' }: { text?: string }) => (
  <span
    style={{
      color: '#8c8c8c',
      fontSize: 14,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <LoadingOutlined spin /> {text}
  </span>
)

// 导出
export default {
  FullPageLoading,
  ContentLoading,
  CardSkeleton,
  ListSkeleton,
  StatCardsSkeleton,
  ChartSkeleton,
  ButtonLoading,
  ProgressLoading,
  LoadingText,
}
