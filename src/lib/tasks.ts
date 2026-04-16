import type { Task } from './data';

export interface TaskFilters {
  searchQuery: string;
  statusFilter: Task['status'] | 'all';
  priorityFilter: Task['priority'] | 'all';
  categoryFilter: Task['category'] | 'all';
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
}

const taskStatusLabels: Record<Task['status'], string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  blocked: '阻塞',
};

const taskPriorityLabels: Record<Task['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const taskCategoryLabels: Record<Task['category'], string> = {
  config: '配置',
  test: '测试',
  training: '培训',
  document: '文档',
  integration: '集成',
};

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const searchQuery = filters.searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) {
      return false;
    }

    if (filters.statusFilter !== 'all' && task.status !== filters.statusFilter) {
      return false;
    }

    if (filters.priorityFilter !== 'all' && task.priority !== filters.priorityFilter) {
      return false;
    }

    if (filters.categoryFilter !== 'all' && task.category !== filters.categoryFilter) {
      return false;
    }

    return true;
  });
}

export function groupTasksByStatus(tasks: Task[]): Record<Task['status'], Task[]> {
  return {
    pending: tasks.filter((task) => task.status === 'pending'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    blocked: tasks.filter((task) => task.status === 'blocked'),
    completed: tasks.filter((task) => task.status === 'completed'),
  };
}

export function getTaskStats(tasks: Task[]): TaskStats {
  const groupedTasks = groupTasksByStatus(tasks);

  return {
    total: tasks.length,
    pending: groupedTasks.pending.length,
    inProgress: groupedTasks.in_progress.length,
    completed: groupedTasks.completed.length,
    blocked: groupedTasks.blocked.length,
  };
}

export function buildTaskFilterFeedback(filters: TaskFilters): string[] {
  const labels: string[] = [];

  if (filters.searchQuery.trim()) {
    labels.push(`搜索: ${filters.searchQuery.trim()}`);
  }

  if (filters.statusFilter !== 'all') {
    labels.push(`状态: ${taskStatusLabels[filters.statusFilter]}`);
  }

  if (filters.priorityFilter !== 'all') {
    labels.push(`优先级: ${taskPriorityLabels[filters.priorityFilter]}`);
  }

  if (filters.categoryFilter !== 'all') {
    labels.push(`类别: ${taskCategoryLabels[filters.categoryFilter]}`);
  }

  return labels;
}