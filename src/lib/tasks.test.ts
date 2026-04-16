import assert from 'node:assert/strict';
import test from 'node:test';

import { allTasks } from './data';
import {
  filterTasks,
  getTaskStats,
  groupTasksByStatus,
} from './tasks';

test('filterTasks combines keyword, status, priority and category filters', () => {
  const filteredTasks = filterTasks(allTasks, {
    searchQuery: '流程',
    statusFilter: 'in_progress',
    priorityFilter: 'high',
    categoryFilter: 'document',
  });

  assert.deepEqual(filteredTasks.map((task) => task.id), ['t-005']);
});

test('groupTasksByStatus groups the filtered tasks for the kanban columns', () => {
  const filteredTasks = filterTasks(allTasks, {
    searchQuery: '',
    statusFilter: 'all',
    priorityFilter: 'high',
    categoryFilter: 'integration',
  });

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(groupTasksByStatus(filteredTasks)).map(([status, tasks]) => [status, tasks.map((task) => task.id)])
    ),
    {
      pending: [],
      in_progress: ['t-010'],
      blocked: [],
      completed: [],
    }
  );
});

test('getTaskStats reflects the filtered result set instead of the full task list', () => {
  const filteredTasks = filterTasks(allTasks, {
    searchQuery: 'ERP',
    statusFilter: 'all',
    priorityFilter: 'all',
    categoryFilter: 'all',
  });

  assert.deepEqual(getTaskStats(filteredTasks), {
    total: 1,
    pending: 0,
    inProgress: 1,
    completed: 0,
    blocked: 0,
  });
});