/**
 * 布局组件
 * 包含侧边栏、头部、面包屑和用户菜单
 */
import { useState, useEffect } from 'react'
import { Layout as AntLayout, Menu, theme, Dropdown, Avatar, Badge, Tooltip } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  BugOutlined,
  CheckSquareOutlined,
  PlusCircleOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  KeyboardOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { BreadcrumbNav } from '../common'

const { Header, Sider, Content } = AntLayout

// 菜单配置
const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/troubleshooting', icon: <BugOutlined />, label: '故障排除' },
  { key: '/checklist', icon: <CheckSquareOutlined />, label: '清单管理' },
  { key: '/projects/new', icon: <PlusCircleOutlined />, label: '新建项目' },
  { key: '/statistics', icon: <BarChartOutlined />, label: '统计分析' },
  { key: '/knowledge-graph', icon: <ApartmentOutlined />, label: '知识图谱' },
]

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken()

  // 监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + . 切换侧边栏
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault()
        setCollapsed((prev) => !prev)
      }
      // F11 切换全屏
      if (e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      }
      // Esc 退出全屏
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setIsFullscreen(false)
  }

  // 暗色模式切换（预留）
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
    // TODO: 实现暗色模式主题切换
  }

  // 刷新页面
  const handleRefresh = () => {
    window.location.reload()
  }

  // 用户菜单配置
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: '帮助与反馈',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  // 通知菜单配置
  const notificationMenuItems: MenuProps['items'] = [
    {
      key: 'header',
      label: (
        <div style={{ fontWeight: 600, padding: '8px 0' }}>通知中心</div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'empty',
      label: (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#8c8c8c' }}>
          暂无新通知
        </div>
      ),
    },
  ]

  // 快捷操作菜单
  const quickActionItems: MenuProps['items'] = [
    {
      key: 'shortcuts',
      label: (
        <div style={{ fontWeight: 500, padding: '4px 0' }}>
          <KeyboardOutlined style={{ marginRight: 8 }} />
          快捷键说明
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'shortcut-1',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>新建项目</span>
          <span style={{ color: '#8c8c8c' }}>Ctrl+N</span>
        </div>
      ),
    },
    {
      key: 'shortcut-2',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>搜索</span>
          <span style={{ color: '#8c8c8c' }}>Ctrl+K</span>
        </div>
      ),
    },
    {
      key: 'shortcut-3',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>切换侧边栏</span>
          <span style={{ color: '#8c8c8c' }}>Ctrl+.</span>
        </div>
      ),
    },
    {
      key: 'shortcut-4',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>全屏模式</span>
          <span style={{ color: '#8c8c8c' }}>F11</span>
        </div>
      ),
    },
  ]

  // 获取当前页面标题
  const getPageTitle = () => {
    const item = menuItems.find((m) => m.key === location.pathname)
    return item?.label || '仪表盘'
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        trigger={null}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #f0f0f0',
          zIndex: 100,
        }}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: colorPrimary,
                transition: 'transform 0.3s',
                transform: collapsed ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              A
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: colorPrimary,
                }}
              >
                A
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#262626',
                  whiteSpace: 'nowrap',
                }}
              >
                Ariba助手
              </span>
            </div>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
          inlineCollapsed={collapsed}
        />

        {/* 底部收起按钮 */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tooltip title={collapsed ? '展开菜单' : '收起菜单'} placement="right">
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                cursor: 'pointer',
                background: '#f5f5f5',
                transition: 'all 0.3s',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="#8c8c8c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
      </Sider>

      {/* 主内容区 */}
      <AntLayout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
        }}
      >
        {/* 头部 */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          {/* 左侧：面包屑 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <BreadcrumbNav />
          </div>

          {/* 右侧：操作按钮 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 快捷操作 */}
            <Dropdown menu={{ items: quickActionItems }} trigger={['click']}>
              <Tooltip title="快捷键说明">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <KeyboardOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
                </div>
              </Tooltip>
            </Dropdown>

            {/* 全屏切换 */}
            <Tooltip title={isFullscreen ? '退出全屏' : '全屏模式'}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onClick={toggleFullscreen}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {isFullscreen ? (
                  <FullscreenExitOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
                ) : (
                  <FullscreenOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
                )}
              </div>
            </Tooltip>

            {/* 刷新 */}
            <Tooltip title="刷新页面">
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onClick={handleRefresh}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <ReloadOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
              </div>
            </Tooltip>

            {/* 通知 */}
            <Dropdown
              menu={{ items: notificationMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip title="通知">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Badge count={0} size="small">
                    <BellOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
                  </Badge>
                </div>
              </Tooltip>
            </Dropdown>

            {/* 分隔线 */}
            <div
              style={{
                width: 1,
                height: 24,
                background: '#f0f0f0',
                margin: '0 8px',
              }}
            />

            {/* 用户菜单 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Avatar
                  size={32}
                  style={{
                    background: colorPrimary,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  管
                </Avatar>
                <span
                  style={{
                    fontSize: 14,
                    color: '#262626',
                    fontWeight: 500,
                  }}
                >
                  管理员
                </span>
              </div>
            </Dropdown>

            {/* 版本信息 */}
            <span
              style={{
                fontSize: 12,
                color: '#8c8c8c',
                padding: '4px 8px',
                background: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              V26.05
            </span>
          </div>
        </Header>

        {/* 内容区 */}
        <Content style={{ margin: 0, background: '#f0f2f5' }}>{children}</Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
