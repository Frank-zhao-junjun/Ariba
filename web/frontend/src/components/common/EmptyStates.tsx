/**
 * 空状态组件库
 * 提供统一风格的无数据/空结果展示
 */
import { Button, Space } from 'antd'
import {
  InboxOutlined,
  SearchOutlined,
  FileTextOutlined,
  TeamOutlined,
  DatabaseOutlined,
  WarningOutlined,
  CloudServerOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons'
import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    text: string
    onClick: () => void
  }
  secondaryAction?: {
    text: string
    onClick: () => void
  }
  size?: 'small' | 'default' | 'large'
}

// 预设空状态配置
export const EmptyStateConfig = {
  // 通用
  default: {
    icon: <InboxOutlined />,
    title: '暂无数据',
    description: '当前没有可显示的内容',
  },
  // 搜索无结果
  search: {
    icon: <SearchOutlined />,
    title: '未找到相关结果',
    description: '请尝试更换关键词或调整筛选条件',
  },
  // 列表为空
  list: {
    icon: <FileTextOutlined />,
    title: '列表为空',
    description: '暂无任何记录',
  },
  // 用户相关
  users: {
    icon: <TeamOutlined />,
    title: '暂无用户',
    description: '当前没有用户数据',
  },
  // 数据相关
  data: {
    icon: <DatabaseOutlined />,
    title: '暂无数据',
    description: '请先添加数据',
  },
  // 警告
  warning: {
    icon: <WarningOutlined />,
    title: '暂无信息',
    description: '当前没有需要处理的事项',
  },
  // 服务器
  server: {
    icon: <CloudServerOutlined />,
    title: '服务器错误',
    description: '请稍后重试',
  },
  // 文件夹
  folder: {
    icon: <FolderOpenOutlined />,
    title: '文件夹为空',
    description: '此文件夹中没有任何文件',
  },
}

// 通用空状态组件
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'default',
}: EmptyStateProps) => {
  const sizeConfig = {
    small: { iconSize: 48, titleSize: 14, descSize: 12, padding: 24 },
    default: { iconSize: 64, titleSize: 16, descSize: 14, padding: 48 },
    large: { iconSize: 80, titleSize: 18, descSize: 16, padding: 64 },
  }

  const config = sizeConfig[size]

  return (
    <div
      className="empty-state fade-in-up"
      style={{
        padding: config.padding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: config.iconSize,
          color: '#d9d9d9',
          marginBottom: 16,
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: config.titleSize,
          fontWeight: 500,
          color: '#262626',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: config.descSize,
            color: '#8c8c8c',
            maxWidth: 400,
            marginBottom: action || secondaryAction ? 24 : 0,
          }}
        >
          {description}
        </div>
      )}
      {(action || secondaryAction) && (
        <Space size={12}>
          {action && (
            <Button type="primary" onClick={action.onClick}>
              {action.text}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick}>{secondaryAction.text}</Button>
          )}
        </Space>
      )}
    </div>
  )
}

// 快速空状态（使用预设配置）
export const QuickEmpty = ({
  type,
  customTitle,
  customDescription,
  action,
  size,
}: {
  type: keyof typeof EmptyStateConfig
  customTitle?: string
  customDescription?: string
  action?: { text: string; onClick: () => void }
  size?: 'small' | 'default' | 'large'
}) => {
  const config = EmptyStateConfig[type]
  return (
    <EmptyState
      icon={config.icon}
      title={customTitle || config.title}
      description={customDescription || config.description}
      action={action}
      size={size}
    />
  )
}

// 搜索无结果
export const SearchEmpty = ({
  keyword,
  onClear,
}: {
  keyword?: string
  onClear?: () => void
}) => (
  <EmptyState
    icon={<SearchOutlined />}
    title={keyword ? `未找到"${keyword}"相关结果` : '未找到相关结果'}
    description="请尝试以下方法："
    action={onClear ? { text: '清除搜索', onClick: onClear } : undefined}
    size="large"
  />
)

// 带建议的空状态
export const EmptyWithSuggestions = ({
  icon = <InboxOutlined />,
  title,
  description,
  suggestions,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  suggestions?: string[]
  action?: { text: string; onClick: () => void }
}) => (
  <div className="empty-state fade-in-up">
    <div className="empty-state-icon" style={{ animation: 'float 3s ease-in-out infinite' }}>
      {icon}
    </div>
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-description">{description}</p>}
    {suggestions && suggestions.length > 0 && (
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '16px 0',
          textAlign: 'left',
          color: '#8c8c8c',
          fontSize: 14,
        }}
      >
        {suggestions.map((s, i) => (
          <li key={i} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#1890ff' }}>•</span> {s}
          </li>
        ))}
      </ul>
    )}
    {action && (
      <Button type="primary" onClick={action.onClick} style={{ marginTop: 16 }}>
        {action.text}
      </Button>
    )}
  </div>
)

// 导出
export default EmptyState
