import { describe, it, expect } from 'vitest'

describe('API模块测试', () => {
  it('应该导出所有API函数', async () => {
    const api = await import('../src/api')
    expect(api.dashboardApi).toBeDefined()
    expect(api.troubleshootingApi).toBeDefined()
    expect(api.checklistApi).toBeDefined()
    expect(api.graphApi).toBeDefined()
  })
})

describe('类型定义测试', () => {
  it('应该正确定义KnowledgeItem', () => {
    const item = {
      id: '1',
      title: '测试标题',
      description: '测试描述',
      solution: '测试解决方案',
      versions: ['2602', '2604'],
      module: 'test',
      tags: ['tag1'],
      related_items: [],
    }
    expect(item.id).toBe('1')
    expect(item.versions).toHaveLength(2)
  })
})
