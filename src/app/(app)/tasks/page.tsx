'use client';

import { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  User,
  Search,
  MoreHorizontal,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { allTasks, teamMembers } from '@/lib/data';

const statusConfig = {
  pending: { label: '待处理', icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  in_progress: { label: '进行中', icon: Clock, color: 'text-[#3B82F6]', bgColor: 'bg-[#3B82F6]/15' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/15' },
  blocked: { label: '阻塞', icon: AlertCircle, color: 'text-[#EF4444]', bgColor: 'bg-[#EF4444]/15' },
};

const priorityConfig = {
  low: { label: '低', className: 'bg-muted text-muted-foreground' },
  medium: { label: '中', className: 'bg-[#3B82F6]/15 text-[#3B82F6]' },
  high: { label: '高', className: 'bg-[#F59E0B]/15 text-[#F59E0B]' },
  urgent: { label: '紧急', className: 'bg-[#EF4444]/15 text-[#EF4444]' },
};

const categoryLabels: Record<string, string> = {
  config: '配置',
  test: '测试',
  training: '培训',
  document: '文档',
  integration: '集成',
};

// 看板列
const KanbanColumn = ({
  title,
  status,
  tasks,
  color,
}: {
  title: string;
  status: keyof typeof statusConfig;
  tasks: typeof allTasks;
  color: string;
}) => {
  const config = statusConfig[status];

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
          <div
            key={task.id}
            className="p-4 rounded-lg border border-border bg-card hover:border-[#6366F1]/30 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm line-clamp-2">{task.title}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>查看详情</DropdownMenuItem>
                  <DropdownMenuItem>编辑任务</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[#EF4444]">删除任务</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {categoryLabels[task.category]}
              </Badge>
              <Badge className={cn('text-xs', priorityConfig[task.priority].className)}>
                {priorityConfig[task.priority].label}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs">
                    {task.assignee.name.charAt(0)}
                  </div>
                  <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-xs">未分配</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {task.dueDate}
                </div>
              )}
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <Plus className="h-4 w-4 mr-2" />
          添加任务
        </Button>
      </div>
    </div>
  );
};

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 过滤任务
  const filteredTasks = allTasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  // 按状态分组
  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === 'pending'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    blocked: filteredTasks.filter((t) => t.status === 'blocked'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  // 统计数据
  const stats = {
    total: allTasks.length,
    pending: tasksByStatus.pending.length,
    inProgress: tasksByStatus.in_progress.length,
    completed: tasksByStatus.completed.length,
    blocked: tasksByStatus.blocked.length,
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">任务清单</h1>
          <p className="text-muted-foreground mt-1">
            管理所有实施任务，跟踪进度和状态
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建任务
        </Button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-[#6366F1]/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">总任务数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-[#3B82F6]/50 transition-colors">
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
        <Card className="cursor-pointer hover:border-[#10B981]/50 transition-colors">
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
        <Card className="cursor-pointer hover:border-[#EF4444]/50 transition-colors">
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

      {/* 筛选工具栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛选 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

            {/* 优先级筛选 */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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

            {/* 类别筛选 */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

            {/* 视图切换 */}
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
        </CardContent>
      </Card>

      {/* 看板/列表视图 */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="kanban" onClick={() => setViewMode('kanban')}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            看板视图
          </TabsTrigger>
          <TabsTrigger value="list" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4 mr-2" />
            列表视图
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn
              title="待处理"
              status="pending"
              tasks={tasksByStatus.pending}
              color="bg-muted-foreground"
            />
            <KanbanColumn
              title="进行中"
              status="in_progress"
              tasks={tasksByStatus.in_progress}
              color="bg-[#3B82F6]"
            />
            <KanbanColumn
              title="被阻塞"
              status="blocked"
              tasks={tasksByStatus.blocked}
              color="bg-[#EF4444]"
            />
            <KanbanColumn
              title="已完成"
              status="completed"
              tasks={tasksByStatus.completed}
              color="bg-[#10B981]"
            />
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredTasks.map((task) => {
                  const statusInfo = statusConfig[task.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
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
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs">
                            {task.assignee.name.charAt(0)}
                          </div>
                          <span className="text-sm text-muted-foreground hidden sm:inline">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                      <Badge variant="outline" className={cn('text-xs', statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>编辑任务</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-[#EF4444]">删除任务</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
