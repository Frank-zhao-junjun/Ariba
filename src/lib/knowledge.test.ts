import assert from 'node:assert/strict';
import test from 'node:test';

import { knowledgeArticles } from './data';
import {
  buildKnowledgeFilterFeedback,
  filterKnowledgeArticles,
} from './knowledge';

test('filterKnowledgeArticles maps category ids to the matching article group', () => {
  const result = filterKnowledgeArticles(knowledgeArticles, {
    searchQuery: '',
    selectedCategory: 'config-guides',
    selectedTags: [],
    bookmarkedOnly: false,
    sortBy: 'views',
  });

  assert.deepEqual(result.map((article) => article.id), ['kb-001']);
});

test('filterKnowledgeArticles combines search, category, tags, bookmark and sort filters', () => {
  const result = filterKnowledgeArticles(knowledgeArticles, {
    searchQuery: 'Ariba',
    selectedCategory: 'integration-guides',
    selectedTags: ['API'],
    bookmarkedOnly: true,
    sortBy: 'title',
  });

  assert.deepEqual(result.map((article) => article.id), ['kb-005']);
});

test('buildKnowledgeFilterFeedback returns visible labels for each active filter', () => {
  assert.deepEqual(
    buildKnowledgeFilterFeedback({
      searchQuery: 'API',
      selectedCategory: 'integration-guides',
      selectedTags: ['API', '接口'],
      bookmarkedOnly: true,
      sortBy: 'title',
    }),
    [
      '搜索: API',
      '分类: 接口指南',
      '标签: API',
      '标签: 接口',
      '仅看收藏',
      '排序: 按标题',
    ]
  );
});