import type { KnowledgeArticle } from './data';

export type KnowledgeSortOption = 'views' | 'date' | 'title';

export interface KnowledgeFilters {
  searchQuery: string;
  selectedCategory: string | null;
  selectedTags: string[];
  bookmarkedOnly: boolean;
  sortBy: KnowledgeSortOption;
}

const knowledgeCategoryLabels: Record<string, string> = {
  'knowledge-graph': '官方知识图谱',
  'best-practices': '最佳实践',
  'config-guides': '配置指南',
  'integration-guides': '接口指南',
  faq: '常见问题解答',
  'enterprise-knowledge': '企业背景知识',
  requirements: '需求文档',
  blueprint: '蓝图设计文档',
  implementation: '实施文档',
  'interface-design': '接口设计文档',
  'interface-prd': '接口开发PRD',
};

const knowledgeSortLabels: Record<KnowledgeSortOption, string> = {
  views: '按热度',
  date: '按更新时间',
  title: '按标题',
};

function getKnowledgeCategoryMatch(selectedCategory: string) {
  const label = knowledgeCategoryLabels[selectedCategory];

  if (!label) {
    return (article: KnowledgeArticle) =>
      article.category === selectedCategory || article.subcategory === selectedCategory;
  }

  return (article: KnowledgeArticle) => article.subcategory === label;
}

export function filterKnowledgeArticles(
  articles: KnowledgeArticle[],
  filters: KnowledgeFilters
): KnowledgeArticle[] {
  const searchQuery = filters.searchQuery.trim().toLowerCase();
  const matchSelectedCategory = filters.selectedCategory
    ? getKnowledgeCategoryMatch(filters.selectedCategory)
    : null;

  return [...articles]
    .filter((article) => {
      if (searchQuery) {
        const matchesSearch =
          article.title.toLowerCase().includes(searchQuery) ||
          article.content.toLowerCase().includes(searchQuery) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        if (!matchesSearch) {
          return false;
        }
      }

      if (matchSelectedCategory && !matchSelectedCategory(article)) {
        return false;
      }

      if (filters.selectedTags.length > 0) {
        const matchesTags = filters.selectedTags.every((tag) => article.tags.includes(tag));

        if (!matchesTags) {
          return false;
        }
      }

      if (filters.bookmarkedOnly && !article.tags.includes('收藏')) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      if (filters.sortBy === 'views') {
        return right.views - left.views;
      }

      if (filters.sortBy === 'date') {
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      }

      return left.title.localeCompare(right.title, 'zh-CN');
    });
}

export function getKnowledgeCategoryLabel(selectedCategory: string): string {
  return knowledgeCategoryLabels[selectedCategory] ?? selectedCategory;
}

export function getKnowledgeSortLabel(sortBy: KnowledgeSortOption): string {
  return knowledgeSortLabels[sortBy];
}

export function getKnowledgeVisibleTags(
  articles: KnowledgeArticle[],
  limit = 8
): string[] {
  const tagCounts = new Map<string, number>();

  articles.forEach((article) => {
    article.tags.forEach((tag) => {
      if (tag === '收藏') {
        return;
      }

      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  return [...tagCounts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0], 'zh-CN');
    })
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function buildKnowledgeFilterFeedback(filters: KnowledgeFilters): string[] {
  const labels: string[] = [];

  if (filters.searchQuery.trim()) {
    labels.push(`搜索: ${filters.searchQuery.trim()}`);
  }

  if (filters.selectedCategory) {
    labels.push(`分类: ${getKnowledgeCategoryLabel(filters.selectedCategory)}`);
  }

  filters.selectedTags.forEach((tag) => {
    labels.push(`标签: ${tag}`);
  });

  if (filters.bookmarkedOnly) {
    labels.push('仅看收藏');
  }

  labels.push(`排序: ${getKnowledgeSortLabel(filters.sortBy)}`);

  return labels;
}