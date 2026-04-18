/**
 * 快捷操作组件库
 * 提供键盘快捷键、快捷菜单等快捷操作功能
 */
import { useEffect, useCallback, useState } from 'react'
import { Modal, List, Tag, Space, Tooltip } from 'antd'
import {
  DashboardOutlined,
  BugOutlined,
  CheckSquareOutlined,
  PlusOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  SearchOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

// 快捷键配置类型
interface ShortcutConfig {
  key: string
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  description: string
  icon?: React.ReactNode
  action: () => void
  enabled?: boolean
}

// 快捷键分类
interface ShortcutCategory {
  title: string
  shortcuts: ShortcutConfig[]
}

// 全局快捷键Hook
export const useGlobalShortcuts = (
  shortcuts: ShortcutConfig[],
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的快捷键
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      shortcuts.forEach((shortcut) => {
        const modifiersMatch = shortcut.modifiers?.every((mod) => {
          switch (mod) {
            case 'ctrl':
              return e.ctrlKey
            case 'alt':
              return e.altKey
            case 'shift':
              return e.shiftKey
            case 'meta':
              return e.metaKey
            default:
              return true
          }
        })

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          modifiersMatch !== false &&
          (shortcut.enabled !== false)
        ) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

// 快捷键显示格式化
export const formatShortcut = (shortcut: ShortcutConfig): string => {
  const mods = shortcut.modifiers || []
  const parts: string[] = []

  if (mods.includes('ctrl') || mods.includes('meta')) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
  }
  if (mods.includes('alt')) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt')
  }
  if (mods.includes('shift')) {
    parts.push('⇧')
  }

  // 特殊键映射
  const keyMap: Record<string, string> = {
    esc: 'Esc',
    enter: '↵',
    backspace: '⌫',
    delete: '⌦',
    tab: '⇥',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    space: 'Space',
    '/': '/',
    '.': '.',
    ',': ',',
    n: 'N',
    k: 'K',
    r: 'R',
    f: 'F',
    s: 'S',
  }

  parts.push(keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase())

  return parts.join(' + ')
}

// 快捷键说明弹窗组件
export const ShortcutHelpModal = ({
  visible,
  onClose,
  categories,
}: {
  visible: boolean
  onClose: () => void
  categories: ShortcutCategory[]
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⌨️</span>
          <span>键盘快捷键</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: '0 24px 24px' }}>
        {categories.map((category, index) => (
          <div key={index} style={{ marginBottom: index < categories.length - 1 ? 24 : 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#262626',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              {category.title}
            </div>
            <List
              size="small"
              dataSource={category.shortcuts}
              renderItem={(shortcut) => (
                <List.Item
                  style={{
                    padding: '8px 0',
                    borderBottom: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Space>
                    {shortcut.icon}
                    <span style={{ color: '#8c8c8c' }}>{shortcut.description}</span>
                  </Space>
                  <Tag
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {formatShortcut(shortcut)}
                  </Tag>
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    </Modal>
  )
}

// 快捷操作菜单组件
export const QuickActions = ({
  actions,
  trigger,
}: {
  actions: Array<{
    key: string
    icon: React.ReactNode
    label: string
    shortcut?: ShortcutConfig
    onClick: () => void
    disabled?: boolean
  }>
  trigger?: React.ReactNode
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <div onClick={() => setVisible(true)}>{trigger}</div>
      <Modal
        title="快捷操作"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
        centered
      >
        <List
          dataSource={actions}
          renderItem={(action) => (
            <List.Item
              style={{
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.5 : 1,
              }}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick()
                  setVisible(false)
                }
              }}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#e6f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1890ff',
                    }}
                  >
                    {action.icon}
                  </div>
                }
                title={action.label}
                description={
                  action.shortcut && (
                    <Tag style={{ fontSize: 11, padding: '0 4px' }}>
                      {formatShortcut(action.shortcut)}
                    </Tag>
                  )
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}

// 快捷键提示组件（显示在界面元素上）
export const ShortcutHint = ({
  shortcut,
  position = 'right',
}: {
  shortcut: ShortcutConfig
  position?: 'top' | 'right' | 'bottom' | 'left'
}) => {
  const tooltipContent = (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 4 }}>{shortcut.description}</div>
      <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}>{formatShortcut(shortcut)}</Tag>
    </div>
  )

  const positionMap = {
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
  }

  return (
    <Tooltip title={tooltipContent} placement={positionMap[position]}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 需要包裹的目标元素 */}
      </div>
    </Tooltip>
  )
}

// 快捷键提示Hook（用于显示全局提示）
export const useShortcutHint = () => {
  const [hint, setHint] = useState<{
    key: string
    message: string
  } | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // 显示提示
      const shortcutDescriptions: Record<string, string> = {
        '?': '打开快捷键说明',
        '/': '聚焦搜索框',
        n: '新建项目',
        k: '打开命令面板',
        r: '刷新页面',
        f: '切换全屏',
        '.': '切换侧边栏',
      }

      if (e.key === '?' || e.shiftKey && e.key === '/') {
        setHint({ key: '?', message: shortcutDescriptions['?'] })
        setTimeout(() => setHint(null), 3000)
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        setHint({ key: '/', message: shortcutDescriptions['/'] })
        setTimeout(() => setHint(null), 3000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return hint
}

// 快捷操作Hook
export const useQuickActions = (navigate: (path: string) => void) => {
  const shortcuts: ShortcutCategory[] = [
    {
      title: '导航',
      shortcuts: [
        {
          key: '1',
          modifiers: ['alt'],
          description: '打开仪表盘',
          icon: <DashboardOutlined />,
          action: () => navigate('/dashboard'),
        },
        {
          key: '2',
          modifiers: ['alt'],
          description: '打开故障排除',
          icon: <BugOutlined />,
          action: () => navigate('/troubleshooting'),
        },
        {
          key: '3',
          modifiers: ['alt'],
          description: '打开清单管理',
          icon: <CheckSquareOutlined />,
          action: () => navigate('/checklist'),
        },
        {
          key: '4',
          modifiers: ['alt'],
          description: '打开统计分析',
          icon: <BarChartOutlined />,
          action: () => navigate('/statistics'),
        },
      ],
    },
    {
      title: '常用操作',
      shortcuts: [
        {
          key: 'n',
          modifiers: ['ctrl'],
          description: '新建项目',
          icon: <PlusOutlined />,
          action: () => navigate('/projects/new'),
        },
        {
          key: '/',
          description: '聚焦搜索框',
          icon: <SearchOutlined />,
          action: () => {
            const searchInput = document.querySelector(
              'input[placeholder*="输入问题"]'
            ) as HTMLInputElement
            searchInput?.focus()
          },
        },
        {
          key: 'r',
          modifiers: ['ctrl'],
          description: '刷新页面',
          icon: <ReloadOutlined />,
          action: () => window.location.reload(),
        },
        {
          key: 'f',
          modifiers: ['ctrl'],
          description: '切换全屏',
          icon: <FullscreenOutlined />,
          action: () => {
            if (document.fullscreenElement) {
              document.exitFullscreen()
            } else {
              document.documentElement.requestFullscreen()
            }
          },
        },
      ],
    },
    {
      title: '帮助',
      shortcuts: [
        {
          key: '?',
          description: '显示快捷键说明',
          icon: <QuestionCircleOutlined />,
          action: () => {
            // 触发快捷键说明弹窗
            const event = new CustomEvent('show-shortcut-help')
            document.dispatchEvent(event)
          },
        },
        {
          key: '.',
          modifiers: ['ctrl'],
          description: '切换侧边栏',
          icon: <SettingOutlined />,
          action: () => {
            // 触发侧边栏切换
            const event = new CustomEvent('toggle-sidebar')
            document.dispatchEvent(event)
          },
        },
      ],
    },
  ]

  // 转换为平面快捷键列表
  const flatShortcuts = shortcuts.flatMap((cat) => cat.shortcuts)

  return {
    shortcuts,
    flatShortcuts,
  }
}

// 导出
export default {
  useGlobalShortcuts,
  formatShortcut,
  ShortcutHelpModal,
  QuickActions,
  ShortcutHint,
  useShortcutHint,
  useQuickActions,
}
