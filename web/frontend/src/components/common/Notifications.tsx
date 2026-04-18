/**
 * 通知提示组件库
 * 提供统一风格的消息提示和通知
 */
import { message, notification, Modal } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import React from 'react'

// 消息类型配置
const messageConfig = {
  success: {
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    className: 'message-success',
  },
  error: {
    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    className: 'message-error',
  },
  warning: {
    icon: <WarningOutlined style={{ color: '#faad14' }} />,
    className: 'message-warning',
  },
  info: {
    icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    className: 'message-info',
  },
}

// 消息通知Hook
export const useNotification = () => {
  const showMessage = (
    type: 'success' | 'error' | 'warning' | 'info',
    content: string,
    duration = 3
  ) => {
    const config = messageConfig[type]
    message.config({
      top: 80,
      duration,
      maxCount: 3,
    })
    message[type]({
      content: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {config.icon}
          {content}
        </span>
      ),
      className: config.className,
    })
  }

  const showSuccess = (content: string, duration?: number) =>
    showMessage('success', content, duration)
  const showError = (content: string, duration?: number) =>
    showMessage('error', content, duration)
  const showWarning = (content: string, duration?: number) =>
    showMessage('warning', content, duration)
  const showInfo = (content: string, duration?: number) =>
    showMessage('info', content, duration)

  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string,
    duration = 4.5
  ) => {
    const iconMap = {
      success: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      error: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
      warning: <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />,
      info: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
    }

    notification[type]({
      message: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
      ),
      description: description ? (
        <span style={{ color: '#8c8c8c' }}>{description}</span>
      ) : undefined,
      icon: iconMap[type],
      placement: 'topRight',
      duration,
      style: {
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    })
  }

  const confirm = (
    title: string,
    content: string,
    onOk: () => void,
    onCancel?: () => void
  ) => {
    Modal.confirm({
      title: (
        <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
      ),
      content: (
        <span style={{ color: '#8c8c8c' }}>{content}</span>
      ),
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { type: 'primary' },
      cancelButtonProps: { danger: false },
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      onOk,
      onCancel,
    })
  }

  return {
    // 消息提示
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // 通知提醒
    showNotification,
    // 确认对话框
    confirm,
  }
}

// Toast消息组件（轻量级提示）
export const Toast = ({
  type,
  message: msg,
  visible,
  onClose,
}: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  visible: boolean
  onClose: () => void
}) => {
  if (!visible) return null

  const config = {
    success: { bg: '#f6ffed', border: '#52c41a', icon: '✓' },
    error: { bg: '#fff2f0', border: '#ff4d4f', icon: '✕' },
    warning: { bg: '#fffbe6', border: '#faad14', icon: '!' },
    info: { bg: '#e6f7ff', border: '#1890ff', icon: 'i' },
  }[type]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 8,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: config.border,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        {config.icon}
      </span>
      <span style={{ color: '#262626' }}>{msg}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#8c8c8c',
          padding: 4,
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// 操作成功提示
export const SuccessToast = ({
  message: msg,
  description,
}: {
  message: string
  description?: string
}) => {
  notification.success({
    message: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
        <span>{msg}</span>
      </div>
    ),
    description,
    duration: 2,
    placement: 'topRight',
  })
}

// 操作失败提示
export const ErrorToast = ({
  message: msg,
  description,
  showRetry,
  onRetry,
}: {
  message: string
  description?: string
  showRetry?: boolean
  onRetry?: () => void
}) => {
  notification.error({
    message: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        <span>{msg}</span>
      </div>
    ),
    description,
    duration: 4.5,
    placement: 'topRight',
  })
}

// 导出
export default {
  useNotification,
  Toast,
  SuccessToast,
  ErrorToast,
}
