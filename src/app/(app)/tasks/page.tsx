'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  LayoutGrid,
  List,
  Search,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allTasks, type Task } from '@/lib/data';
import {
  buildTaskFilterFeedback,
  filterTasks,
  getTaskStats,
  groupTasksByStatus,
} from '@/lib/tasks';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: '待处理', icon: Clock, color: 'text-muted-foreground' },
  in_progress: { label: '进行中', icon: Clock, color: 'text-[#3B82F6]' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'text-[#10B981]' },
  blocked: { label: '阻塞', icon: AlertCircle, color: 'text-[#EF4444]' },
};

const priorityConfig = {
  low: { label: '低', className: 'bg-muted text-muted-foreground' },
  medium: { label: '中', className: 'bg-[#3B82F6]/15 text-[#3B82F6]' },
  high: { label: '高', className: 'bg-[#F59E0B]/15 text-[#F59E0B]' },
  urgent: { label: '紧急', className: 'bg-[#EF4444]/15 text-[#EF4444]' },
};

const categoryLabels: Record<Task['category'], string> = {
  config: '配置',
  test: '测试',
  training: '培训',
  document: '文档',
  integration: '集成',
};

function KanbanColumn({
  title,
  tasks,
  color,
}: {
  title: string;
  tasks: Task[];
  color: string;
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('h-3 w-3 rounded-full', color)} />
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 rounded-lg border border-border bg-card">
            <p className="font-medium text-sm line-clamp-2">{task.title}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {categoryLabels[task.category]}
              </Badge>
              <Badge className={cn('text-xs', priorityConfig[task.priority].className)}>
                {priorityConfig[task.priority].label}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
              {task.assignee ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs shrink-0">
                    {task.assignee.name.charAt(0)}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{task.assignee.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-xs">未分配</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Calendar className="h-3 w-3" />
                  {task.dueDate}
                </div>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            当前筛选下暂无任务。
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Task['category'] | 'all'>('all');

  const filteredTasks = useMemo(
    () =>
      filterTasks(allTasks, {
        searchQuery,
        statusFilter,
        priorityFilter,
        categoryFilter,
      }),
    [searchQuery, statusFilter, priorityFilter, categoryFilter]
  );

  const tasksByStatus = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);
  const stats = useMemo(() => getTaskStats(filteredTasks), [filteredTasks]);

  const activeFilters = useMemo(
    () =>
      buildTaskFilterFeedback({
        searchQuery,
        statusFilter,
        priorityFilter,
        categoryFilter,
      }),
    [searchQuery, statusFilter, priorityFilter, categoryFilter]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">任务清单</h1>
          <p className="text-muted-foreground mt-1">管理所有实施任务，跟踪进度和状态</p>
        </div>
        <Badge variant="outline">当前结果 {stats.total} 项</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">当前结果</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">进行中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">已完成</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.blocked}</p>
                <p className="text-xs text-muted-foreground">被阻塞</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Task['status'] | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="blocked">阻塞</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Task['priority'] | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                <SelectItem value="urgent">紧急</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as Task['category'] | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem value="config">配置</SelectItem>
                <SelectItem value="test">测试</SelectItem>
                <SelectItem value="training">培训</SelectItem>
                <SelectItem value="document">文档</SelectItem>
                <SelectItem value="integration">集成</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 border-t border-border/60 pt-4">
            <span className="text-sm text-muted-foreground">当前筛选</span>
            {activeFilters.length > 0 ? (
              activeFilters.map((filterLabel) => (
                <Badge key={filterLabel} variant="secondary">
                  {filterLabel}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">全部任务</Badge>
            )}
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                清空筛选
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="kanban">
            <LayoutGrid className="h-4 w-4 mr-2" />
            看板视图
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            列表视图
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn title="待处理" tasks={tasksByStatus.pending} color="bg-muted-foreground" />
            <KanbanColumn title="进行中" tasks={tasksByStatus.in_progress} color="bg-[#3B82F6]" />
            <KanbanColumn title="被阻塞" tasks={tasksByStatus.blocked} color="bg-[#EF4444]" />
            <KanbanColumn title="已完成" tasks={tasksByStatus.completed} color="bg-[#10B981]" />
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {filteredTasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredTasks.map((task) => {
                    const statusInfo = statusConfig[task.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <StatusIcon className={cn('h-5 w-5 shrink-0', statusInfo.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{task.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[task.category]}
                            </Badge>
                            <Badge className={cn('text-xs', priorityConfig[task.priority].className)}>
                              {priorityConfig[task.priority].label}
                            </Badge>
                          </div>
                        </div>
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs shrink-0">
                              {task.assignee.name.charAt(0)}
                            </div>
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">未分配</span>
                        )}
                        <Badge variant="outline" className={cn('text-xs', statusInfo.color)}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">当前筛选下暂无任务。</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
