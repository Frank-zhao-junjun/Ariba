import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getProjectById,
  getProjectDetailHref,
} from './projects';

test('getProjectDetailHref builds a stable detail route', () => {
  assert.equal(getProjectDetailHref('proj-001'), '/projects/proj-001');
});

test('getProjectById returns the core project detail for a known id', () => {
  assert.deepEqual(
    getProjectById('proj-001'),
    {
      id: 'proj-001',
      name: '华润集团 Ariba 项目',
      description: '华润集团采购数字化转型项目一期',
      client: '华润集团',
      status: 'in_progress',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 45,
      manager: '张实施顾问',
      teamSize: 8,
    }
  );
});

test('getProjectById returns null for an unknown id', () => {
  assert.equal(getProjectById('proj-999'), null);
});