import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialDashboardRefreshState,
  formatDashboardUpdateLabel,
  refreshDashboardState,
} from './dashboard';

test('createInitialDashboardRefreshState starts without a timestamp to avoid hydration drift', () => {
  assert.deepEqual(createInitialDashboardRefreshState(), {
    lastUpdatedAt: null,
  });
});

test('refreshDashboardState updates only the timestamp field', () => {
  const state = createInitialDashboardRefreshState();
  const refreshedAt = new Date('2026-04-16T09:30:15.000Z');

  assert.deepEqual(refreshDashboardState(state, refreshedAt), {
    lastUpdatedAt: refreshedAt,
  });
});

test('formatDashboardUpdateLabel returns a stable placeholder before client refresh', () => {
  assert.equal(
    formatDashboardUpdateLabel(null),
    '数据更新时间: --:--:--'
  );
});

test('formatDashboardUpdateLabel renders a predictable time string for a refreshed state', () => {
  const refreshedAt = new Date('2026-04-16T09:30:15.000Z');

  assert.equal(
    formatDashboardUpdateLabel(refreshedAt, {
      locale: 'en-GB',
      timeZone: 'UTC',
    }),
    '数据更新时间: 09:30:15'
  );
});