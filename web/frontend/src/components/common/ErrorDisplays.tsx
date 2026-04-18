/**
 * 错误提示组件库
 * 提供统一风格的用户友好错误提示
 */
import { Button, Card, Space, Tag, Tooltip } from 'antd'
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  BugOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons'
import React from 'react'

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

// 错误配置
interface ErrorConfig {
  icon: React.ReactNode
  iconColor: string
  title: string
  description: string
  suggestions: string[]
  showRetry: boolean
  showHome: boolean
  helpLink?: {
    text: string
    url: string
  }
}

// 错误配置映射
const errorConfigs: Record<ErrorType, ErrorConfig> = {
  [ErrorType.NETWORK]: {
    icon: <span style={{ fontSize: 64 }}>📡</span>,
    iconColor: '#faad14',
    title: '网络连接失败',
    description: '请检查您的网络连接，确保网络畅通后重试。',
    suggestions: [
      '检查网络线缆是否连接正常',
      '确认Wi-Fi或有线网络是否已连接',
      '尝试刷新页面',
      '等待网络恢复后重试',
    ],
    showRetry: true,
    showHome: true,
    helpLink: {
      text: '网络诊断工具',
      url: '/troubleshooting?keyword=网络连接',
    },
  },
  [ErrorType.SERVER]: {
    icon: <span style={{ fontSize: 64 }}>🛠️</span>,
    iconColor: '#ff4d4f',
    title: '服务器错误',
    description: '服务器遇到了一些问题，我们正在努力修复。请稍后再试。',
    suggestions: [
      '服务器可能正在维护中',
      '请稍等几分钟后重试',
      '如果问题持续，请联系我们',
    ],
    showRetry: true,
    showHome: true,
    helpLink: {
      text: '联系技术支持',
      url: '/help',
    },
  },
  [ErrorType.NOT_FOUND]: {
    icon: <span style={{ fontSize: 64 }}>🔍</span>,
    iconColor: '#8c8c8c',
    title: '页面不存在',
    description: '您访问的页面可能已被删除、移动或从未存在。',
    suggestions: [
      '检查URL是否正确',
      '返回首页重新导航',
      '使用搜索功能查找内容',
    ],
    showRetry: false,
    showHome: true,
  },
  [ErrorType.UNAUTHORIZED]: {
    icon: <span style={{ fontSize: 64 }}>🔐</span>,
    iconColor: '#faad14',
    title: '未登录或登录已过期',
    description: '您需要登录才能访问此内容，请重新登录。',
    suggestions: [
      '点击登录按钮重新认证',
      '检查登录状态是否过期',
      '清除浏览器缓存后重试',
    ],
    showRetry: false,
    showHome: true,
  },
  [ErrorType.FORBIDDEN]: {
    icon: <span style={{ fontSize: 64 }}>🔒</span>,
    iconColor: '#ff4d4f',
    title: '没有访问权限',
    description: '您没有权限访问此内容，请联系管理员获取权限。',
    suggestions: [
      '确认您使用的是正确的账号',
      '联系管理员申请权限',
      '使用有权限的账号登录',
    ],
    showRetry: false,
    showHome: true,
  },
  [ErrorType.VALIDATION]: {
    icon: <span style={{ fontSize: 64 }}>⚠️</span>,
    iconColor: '#faad14',
    title: '数据验证失败',
    description: '提交的数据不符合要求，请检查并修正后重试。',
    suggestions: [
      '检查必填字段是否已填写',
      '确认数据格式是否正确',
      '查看具体的错误提示信息',
    ],
    showRetry: true,
    showHome: false,
  },
  [ErrorType.UNKNOWN]: {
    icon: <span style={{ fontSize: 64 }}>❓</span>,
    iconColor: '#8c8c8c',
    title: '出现了一些问题',
    description: '发生了未预期的错误，请稍后重试或联系技术支持。',
    suggestions: [
      '刷新页面重试',
      '清除浏览器缓存',
      '联系技术支持获取帮助',
    ],
    showRetry: true,
    showHome: true,
    helpLink: {
      text: '报告问题',
      url: '/help/feedback',
    },
  },
}

// 通用错误提示组件
export const ErrorDisplay = ({
  type = ErrorType.UNKNOWN,
  customTitle,
  customDescription,
  onRetry,
  onHome,
  showSuggestions = true,
  showActions = true,
}: {
  type?: ErrorType
  customTitle?: string
  customDescription?: string
  onRetry?: () => void
  onHome?: () => void
  showSuggestions?: boolean
  showActions?: boolean
}) => {
  const config = errorConfigs[type]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* 错误图标 */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 24,
          animation: 'shake 0.5s ease-in-out',
        }}
      >
        {config.icon}
      </div>

      {/* 错误标题 */}
      <h2
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#262626',
          marginBottom: 8,
        }}
      >
        {customTitle || config.title}
      </h2>

      {/* 错误描述 */}
      <p
        style={{
          fontSize: 14,
          color: '#8c8c8c',
          maxWidth: 500,
          marginBottom: showSuggestions && config.suggestions.length > 0 ? 24 : 0,
        }}
      >
        {customDescription || config.description}
      </p>

      {/* 建议列表 */}
      {showSuggestions && config.suggestions.length > 0 && (
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            marginBottom: 24,
            borderRadius: 12,
            background: '#fafafa',
          }}
          bodyStyle={{ padding: 16 }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#262626',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            建议尝试以下步骤：
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              textAlign: 'left',
            }}
          >
            {config.suggestions.map((suggestion, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  color: '#8c8c8c',
                }}
              >
                <span style={{ color: '#1890ff', fontWeight: 600 }}>{index + 1}.</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 操作按钮 */}
      {showActions && (
        <Space size={12} wrap>
          {config.showRetry && onRetry && (
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRetry}
              size="large"
            >
              重试
            </Button>
          )}
          {config.showHome && onHome && (
            <Button icon={<HomeOutlined />} onClick={onHome} size="large">
              返回首页
            </Button>
          )}
          {config.helpLink && (
            <Tooltip title={config.helpLink.url}>
              <Button
                icon={<QuestionCircleOutlined />}
                onClick={() => window.open(config.helpLink!.url, '_blank')}
                size="large"
              >
                {config.helpLink.text}
              </Button>
            </Tooltip>
          )}
        </Space>
      )}

      {/* 动画样式 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}

// API错误提示组件
export const ApiErrorDisplay = ({
  status,
  message,
  onRetry,
}: {
  status?: number
  message?: string
  onRetry?: () => void
}) => {
  let type = ErrorType.UNKNOWN

  switch (status) {
    case 400:
      type = ErrorType.VALIDATION
      break
    case 401:
      type = ErrorType.UNAUTHORIZED
      break
    case 403:
      type = ErrorType.FORBIDDEN
      break
    case 404:
      type = ErrorType.NOT_FOUND
      break
    case 500:
    case 502:
    case 503:
      type = ErrorType.SERVER
      break
    default:
      type = ErrorType.UNKNOWN
  }

  return (
    <ErrorDisplay
      type={type}
      customDescription={message}
      onRetry={onRetry}
      onHome={() => window.location.href = '/'}
    />
  )
}

// 表单错误提示组件
export const FormError = ({
  errors,
  field,
}: {
  errors?: Record<string, string>
  field: string
}) => {
  if (!errors || !errors[field]) return null

  return (
    <div
      style={{
        color: '#ff4d4f',
        fontSize: 12,
        marginTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <ExclamationCircleOutlined />
      {errors[field]}
    </div>
  )
}

// 内联错误提示
export const InlineError = ({
  message,
  onDismiss,
}: {
  message: string
  onDismiss?: () => void
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: '#fff2f0',
      border: '1px solid #ffccc7',
      borderRadius: 8,
      fontSize: 13,
      color: '#ff4d4f',
      animation: 'fadeIn 0.2s ease-out',
    }}
  >
    <CloseCircleOutlined />
    <span style={{ flex: 1 }}>{message}</span>
    {onDismiss && (
      <Button
        type="text"
        size="small"
        icon={<CloseCircleOutlined />}
        onClick={onDismiss}
        style={{ color: '#ff4d4f', padding: 0, height: 'auto' }}
      />
    )}
  </div>
)

// 错误标签（用于列表展示）
export const ErrorTag = ({
  type,
  count,
}: {
  type: 'warning' | 'error' | 'critical'
  count?: number
}) => {
  const configs = {
    warning: { color: '#faad14', text: '警告', bg: '#fffbe6' },
    error: { color: '#ff4d4f', text: '错误', bg: '#fff2f0' },
    critical: { color: '#cf1322', text: '严重', bg: '#fff1f0' },
  }

  const config = configs[type]

  return (
    <Tag
      style={{
        background: config.bg,
        borderColor: config.color,
        color: config.color,
        borderRadius: 12,
      }}
    >
      {config.text}
      {count !== undefined && ` (${count})`}
    </Tag>
  )
}

// 错误统计卡片
export const ErrorSummary = ({
  warnings,
  errors,
  critical,
  onViewAll,
}: {
  warnings: number
  errors: number
  critical: number
  onViewAll?: () => void
}) => {
  const total = warnings + errors + critical

  if (total === 0) return null

  return (
    <Card
      style={{
        borderRadius: 12,
        border: '1px solid #fff2f0',
        background: '#fff2f0',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ExclamationCircleOutlined
            style={{ fontSize: 24, color: '#faad14' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#262626' }}>
              发现 {total} 个问题
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {warnings > 0 && (
                <span style={{ fontSize: 12, color: '#faad14' }}>
                  {warnings} 警告
                </span>
              )}
              {errors > 0 && (
                <span style={{ fontSize: 12, color: '#ff4d4f' }}>
                  {errors} 错误
                </span>
              )}
              {critical > 0 && (
                <span style={{ fontSize: 12, color: '#cf1322' }}>
                  {critical} 严重
                </span>
              )}
            </div>
          </div>
        </div>
        {onViewAll && (
          <Button type="link" onClick={onViewAll}>
            查看详情
          </Button>
        )}
      </div>
    </Card>
  )
}

// 联系支持组件
export const ContactSupport = ({
  title = '需要更多帮助？',
}: {
  title?: string
}) => (
  <Card
    style={{
      borderRadius: 12,
      border: '1px dashed #d9d9d9',
      background: '#fafafa',
    }}
    bodyStyle={{ padding: 24, textAlign: 'center' }}
  >
    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
      {title}
    </div>
    <Space size={16} wrap>
      <Button icon={<MessageOutlined />}>在线客服</Button>
      <Button icon={<PhoneOutlined />}>电话支持</Button>
      <Button icon={<MailOutlined />}>邮件联系</Button>
    </Space>
  </Card>
)

// 导出
export default {
  ErrorType,
  ErrorDisplay,
  ApiErrorDisplay,
  FormError,
  InlineError,
  ErrorTag,
  ErrorSummary,
  ContactSupport,
}
