/**
 * 面包屑导航组件
 * 提供统一风格的面包屑导航
 */
import { Breadcrumb, Dropdown, Button } from 'antd'
import type { MenuProps } from 'antd'
import {
  HomeOutlined,
  RightOutlined,
  DashboardOutlined,
  BugOutlined,
  CheckSquareOutlined,
  PlusCircleOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// 路由配置
const routeConfig: Record<string, { label: string; icon?: React.ReactNode; parent?: string }> = {
  '/dashboard': { label: '仪表盘', icon: <DashboardOutlined /> },
  '/troubleshooting': { label: '故障排除', icon: <BugOutlined /> },
  '/checklist': { label: '清单管理', icon: <CheckSquareOutlined /> },
  '/projects/new': { label: '新建项目', icon: <PlusCircleOutlined />, parent: '/projects' },
  '/projects': { label: '项目列表', icon: <PlusCircleOutlined /> },
  '/statistics': { label: '统计分析', icon: <BarChartOutlined /> },
  '/knowledge-graph': { label: '知识图谱', icon: <ApartmentOutlined /> },
}

// 面包屑导航组件
export const BreadcrumbNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 解析当前路径
  const pathSnippets = location.pathname.split('/').filter((i) => i)

  const items = pathSnippets.map((_, index) => {
    const url = '/' + pathSnippets.slice(0, index + 1).join('/')
    const config = routeConfig[url]

    return {
      key: url,
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {config?.icon}
          {config?.label || url}
        </span>
      ),
    }
  })

  if (items.length === 0) {
    return null
  }

  return (
    <Breadcrumb
      separator={<RightOutlined style={{ fontSize: 10, color: '#d9d9d9' }} />}
      style={{
        marginBottom: 16,
      }}
      items={[
        {
          key: 'home',
          title: (
            <span
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                color: '#8c8c8c',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8c8c8c')}
            >
              <HomeOutlined />
              首页
            </span>
          ),
        },
        ...items.map((item, index) => ({
          ...item,
          onClick: () => {
            if (index < items.length - 1) {
              navigate(item.key)
            }
          },
          style: {
            cursor: index < items.length - 1 ? 'pointer' : 'default',
            color: index < items.length - 1 ? '#8c8c8c' : '#262626',
            fontWeight: index === items.length - 1 ? 500 : 400,
          },
        })),
      ]}
    />
  )
}

// 快速面包屑（简单版本）
export const SimpleBreadcrumb = ({
  paths,
}: {
  paths: Array<{ label: string; path?: string }>
}) => (
  <Breadcrumb
    separator={<RightOutlined style={{ fontSize: 10, color: '#d9d9d9' }} />}
    items={[
      {
        title: (
          <span style={{ color: '#8c8c8c' }}>首页</span>
        ),
      },
      ...paths.map((p, i) => ({
        key: i,
        title: p.path ? (
          <span style={{ color: '#8c8c8c' }}>{p.label}</span>
        ) : (
          <span style={{ color: '#262626', fontWeight: 500 }}>{p.label}</span>
        ),
      })),
    ]}
  />
)

// 页面标题面包屑（带操作按钮）
export const PageHeaderWithBreadcrumb = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; path?: string }>
}) => (
  <div
    className="page-header"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    }}
  >
    <div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <SimpleBreadcrumb paths={breadcrumbs} />
      )}
      <h1
        className="page-title"
        style={{
          marginTop: breadcrumbs && breadcrumbs.length > 0 ? 0 : 0,
          marginBottom: subtitle ? 8 : 0,
        }}
      >
        {title}
      </h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {actions && (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {actions}
      </div>
    )}
  </div>
)

// 导出
export default BreadcrumbNav
