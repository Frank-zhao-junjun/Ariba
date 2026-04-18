/**
 * 通用组件库导出
 * 统一导出所有通用UI组件
 */
export * from './LoadingStates'
export * from './EmptyStates'
export * from './ErrorBoundary'
export * from './ErrorDisplays'
export * from './Notifications'
export * from './Breadcrumb'
export * from './Shortcuts'

// 统一导出
import { FullPageLoading, ContentLoading, CardSkeleton, ListSkeleton } from './LoadingStates'
import { EmptyState, QuickEmpty, SearchEmpty } from './EmptyStates'
import { ApiError, NetworkError } from './ErrorBoundary'
import { ErrorDisplay, ApiErrorDisplay, FormError, InlineError, ErrorSummary } from './ErrorDisplays'
import { useNotification } from './Notifications'
import { BreadcrumbNav, PageHeaderWithBreadcrumb } from './Breadcrumb'
import { useGlobalShortcuts, formatShortcut, ShortcutHelpModal, useQuickActions } from './Shortcuts'

export const CommonComponents = {
  // 加载状态
  FullPageLoading,
  ContentLoading,
  CardSkeleton,
  ListSkeleton,
  // 空状态
  EmptyState,
  QuickEmpty,
  SearchEmpty,
  // 错误处理
  ApiError,
  NetworkError,
  ErrorDisplay,
  ApiErrorDisplay,
  FormError,
  InlineError,
  ErrorSummary,
  // 通知
  useNotification,
  // 面包屑
  BreadcrumbNav,
  PageHeaderWithBreadcrumb,
  // 快捷键
  useGlobalShortcuts,
  formatShortcut,
  ShortcutHelpModal,
  useQuickActions,
}

export default CommonComponents
