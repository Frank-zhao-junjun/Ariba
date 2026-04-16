import assert from 'node:assert/strict';
import test from 'node:test';

import { createAssistantMessage } from './assistant';

test('createAssistantMessage uses the injected id and timestamp', () => {
  const timestamp = new Date('2026-04-16T09:00:00.000Z');

  const message = createAssistantMessage({
    role: 'user',
    content: '如何配置采购申请审批流程？',
    timestamp,
    idGenerator: () => 'msg-user-001',
  });

  assert.deepEqual(message, {
    id: 'msg-user-001',
    role: 'user',
    content: '如何配置采购申请审批流程？',
    timestamp,
  });
});

test('createAssistantMessage returns a non-empty id by default', () => {
  const timestamp = new Date('2026-04-16T09:05:00.000Z');

  const message = createAssistantMessage({
    role: 'assistant',
    content: '已收到问题。',
    timestamp,
  });

  assert.equal(message.role, 'assistant');
  assert.equal(message.content, '已收到问题。');
  assert.equal(message.timestamp, timestamp);
  assert.equal(typeof message.id, 'string');
  assert.notEqual(message.id.length, 0);
});