/**
 * 错误边界组件
 * 优雅处理组件渲染错误
 */
import { Button, Card, Result } from 'antd'
import { CloseCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// 错误边界类组件
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    // 调用错误回调
    this.props.onError?.(error, errorInfo)
    // 可选：记录错误日志
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      // 默认错误展示
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            padding: 24,
          }}
        >
          <Card
            style={{
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                fontSize: 64,
                color: '#ff4d4f',
                marginBottom: 16,
                animation: 'shake 0.5s ease-in-out',
              }}
            >
              <CloseCircleOutlined />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#262626' }}>
              页面出现了一些问题
            </h2>
            <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
             抱歉，页面在渲染时遇到了错误，请尝试刷新页面或返回首页
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <div
                style={{
                  textAlign: 'left',
                  padding: 16,
                  background: '#fff2f0',
                  borderRadius: 8,
                  marginBottom: 24,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                <div style={{ color: '#cf1322', fontWeight: 600, marginBottom: 8 }}>
                  Error: {error.message}
                </div>
                <div style={{ color: '#8c8c8c', whiteSpace: 'pre-wrap' }}>
                  {errorInfo?.componentStack}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button icon={<ReloadOutlined />} onClick={this.handleReload}>
                刷新页面
              </Button>
              <Button type="primary" icon={<HomeOutlined />} onClick={this.handleGoHome}>
                返回首页
              </Button>
            </div>
          </Card>
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
              20%, 40%, 60%, 80% { transform: translateX(4px); }
            }
          `}</style>
        </div>
      )
    }

    return children
  }
}

// 带导航的刷新按钮
const RefreshButton = ({ message }: { message?: string }) => {
  const navigate = useNavigate()
  return (
    <Button
      type="primary"
      icon={<ReloadOutlined />}
      onClick={() => {
        navigate(0)
      }}
    >
      {message || '重试'}
    </Button>
  )
}

// API错误展示
export const ApiError = ({
  message,
  status,
  onRetry,
}: {
  message?: string
  status?: number
  onRetry?: () => void
}) => {
  const getErrorConfig = () => {
    switch (status) {
      case 401:
        return {
          title: '未登录或登录已过期',
          description: '请重新登录后再试',
          icon: '🔐',
        }
      case 403:
        return {
          title: '没有访问权限',
          description: '您没有权限访问此内容',
          icon: '🔒',
        }
      case 404:
        return {
          title: '内容不存在',
          description: '请求的内容可能已被删除或移动',
          icon: '📭',
        }
      case 500:
        return {
          title: '服务器错误',
          description: '服务器出现了一些问题，请稍后重试',
          icon: '🛠️',
        }
      default:
        return {
          title: '请求失败',
          description: message || '网络连接出现问题，请检查网络后重试',
          icon: '⚠️',
        }
    }
  }

  const config = getErrorConfig()

  return (
    <Result
      status="error"
      icon={<span style={{ fontSize: 64 }}>{config.icon}</span>}
      title={config.title}
      subTitle={config.description}
      extra={
        onRetry ? (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            重新加载
          </Button>
        ) : undefined
      }
      style={{
        padding: '48px 24px',
        background: '#fff',
        borderRadius: 12,
      }}
    />
  )
}

// 网络错误展示
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
  <Result
    status="warning"
    icon={<span style={{ fontSize: 64 }}>📡</span>}
    title="网络连接失败"
    subTitle="请检查您的网络连接后重试"
    extra={
      onRetry ? (
        <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
          重试连接
        </Button>
      ) : undefined
    }
    style={{
      padding: '48px 24px',
      background: '#fff',
      borderRadius: 12,
    }}
  />
)

// 页面级错误边界（用于包裹整个页面）
export const PageErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
)

// 组件级错误边界
export const ComponentErrorBoundary = ({
  children,
  fallback,
  onError,
}: {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}) => (
  <ErrorBoundary fallback={fallback} onError={onError}>
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary
