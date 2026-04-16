import assert from 'node:assert/strict';
import test from 'node:test';

import { milestones } from './data';
import {
  filterMilestonesByPhase,
  getMilestoneTaskSummary,
  getSelectedMilestone,
} from './milestones';

test('filterMilestonesByPhase returns only milestones from the selected phase', () => {
  assert.deepEqual(
    filterMilestonesByPhase(milestones, 'development').map((milestone) => milestone.id),
    ['ms-003']
  );
});

test('getSelectedMilestone falls back to the first filtered milestone when the previous selection is excluded', () => {
  const filteredMilestones = filterMilestonesByPhase(milestones, 'testing');

  assert.equal(getSelectedMilestone(filteredMilestones, 'ms-001')?.id, 'ms-004');
});

test('getMilestoneTaskSummary reports task counts and completion rate from mock data', () => {
  assert.deepEqual(getMilestoneTaskSummary(milestones[1]), {
    total: 4,
    completed: 1,
    inProgress: 2,
    pending: 1,
    blocked: 0,
    completionRate: 25,
  });
});