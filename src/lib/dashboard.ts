export interface DashboardRefreshState {
  lastUpdatedAt: Date | null;
}

interface DashboardLabelOptions {
  locale?: string;
  timeZone?: string;
}

const DASHBOARD_TIME_PLACEHOLDER = '--:--:--';

export function createInitialDashboardRefreshState(): DashboardRefreshState {
  return {
    lastUpdatedAt: null,
  };
}

export function refreshDashboardState(
  state: DashboardRefreshState,
  refreshedAt: Date
): DashboardRefreshState {
  return {
    ...state,
    lastUpdatedAt: refreshedAt,
  };
}

export function formatDashboardUpdateLabel(
  lastUpdatedAt: Date | null,
  { locale = 'zh-CN', timeZone }: DashboardLabelOptions = {}
): string {
  if (!lastUpdatedAt) {
    return `数据更新时间: ${DASHBOARD_TIME_PLACEHOLDER}`;
  }

  return `数据更新时间: ${lastUpdatedAt.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  })}`;
}