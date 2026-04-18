import { Card, Statistic, Tag } from 'antd'
import { ReactNode } from 'react'

// 统计卡片组件
interface StatCardProps {
  title: string
  value: number | string
  prefix?: ReactNode
  suffix?: string
  color?: string
  trend?: number
}

export function StatCard({ title, value, prefix, suffix, color = '#1890ff', trend }: StatCardProps) {
  return (
    <Card bordered={false} style={{ borderLeft: `4px solid ${color}` }}>
      <Statistic
        title={<span style={{ color: '#8c8c8c', fontSize: 14 }}>{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ color, fontSize: 28, fontWeight: 600 }}
      />
      {trend !== undefined && (
        <div style={{ marginTop: 8, fontSize: 12, color: trend >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 较上周
        </div>
      )}
    </Card>
  )
}

// 状态标签
interface StatusTagProps {
  status: string
}

const statusMap: Record<string, { color: string; text: string }> = {
  active: { color: 'processing', text: '进行中' },
  completed: { color: 'success', text: '已完成' },
  paused: { color: 'warning', text: '已暂停' },
  pending: { color: 'default', text: '待处理' },
  in_progress: { color: 'processing', text: '进行中' },
  blocked: { color: 'error', text: '已阻塞' },
}

export function StatusTag({ status }: StatusTagProps) {
  const config = statusMap[status] || { color: 'default', text: status }
  return <Tag color={config.color}>{config.text}</Tag>
}

// 优先级标签
interface PriorityTagProps {
  priority: string
}

const priorityMap: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'blue',
  low: 'green',
}

export function PriorityTag({ priority }: PriorityTagProps) {
  return <Tag color={priorityMap[priority] || 'default'}>{priority}</Tag>
}
