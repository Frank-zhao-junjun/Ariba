'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target,
  CheckSquare,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  Activity,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  projects,
  milestones,
  dashboardStats,
  allTasks,
} from '@/lib/data';
import {
  createInitialDashboardRefreshState,
  formatDashboardUpdateLabel,
  refreshDashboardState,
} from '@/lib/dashboard';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// 任务趋势数据
const taskTrendData = [
  { name: '周一', completed: 2, pending: 8 },
  { name: '周二', completed: 4, pending: 7 },
  { name: '周三', completed: 3, pending: 6 },
  { name: '周四', completed: 5, pending: 5 },
  { name: '周五', completed: 4, pending: 4 },
  { name: '周六', completed: 1, pending: 3 },
  { name: '周日', completed: 0, pending: 3 },
];

// 任务状态分布
const taskDistribution = [
  { name: '已完成', value: dashboardStats.completedTasks, color: '#10B981' },
  { name: '进行中', value: allTasks.filter((t) => t.status === 'in_progress').length, color: '#3B82F6' },
  { name: '待处理', value: dashboardStats.pendingTasks, color: '#9CA3AF' },
  { name: '阻塞', value: dashboardStats.blockedTasks, color: '#EF4444' },
];

// 阶段颜色映射
const phaseColors = {
  preparation: 'bg-[#6366F1]',
  blueprint: 'bg-[#8B5CF6]',
  development: 'bg-[#06B6D4]',
  testing: 'bg-[#F59E0B]',
  deployment: 'bg-[#10B981]',
};

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  iconBg,
  iconColor,
  description,
  trend,
  trendUp,
  onClick,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
}) {
  return (
    <TooltipProvider>
      <Card className="card-hover cursor-pointer relative overflow-hidden" onClick={onClick}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-2">
                <AnimatedNumber value={value} suffix={suffix} />
              </p>
            </div>
            <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', iconBg)}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
          </div>
          {description && (
            <div className="mt-4 flex items-center justify-between">
              {trend && (
                <div className={cn('flex items-center text-sm', trendUp ? 'text-[#10B981]' : 'text-[#EF4444]')}>
                  <TrendingUp className={cn('h-4 w-4 mr-1', !trendUp && 'rotate-180')} />
                  <span>{trend}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground ml-auto">{description}</p>
            </div>
          )}
        </CardContent>
        {/* 状态指示器 */}
        <div className="absolute top-0 right-0 w-2 h-2 m-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
        </div>
      </Card>
    </TooltipProvider>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [refreshState, setRefreshState] = useState(createInitialDashboardRefreshState);

  useEffect(() => {
    setRefreshState((current) => refreshDashboardState(current, new Date()));
  }, []);

  const handleRefresh = () => {
    setRefreshState((current) => refreshDashboardState(current, new Date()));
  };

  const updateLabel = formatDashboardUpdateLabel(refreshState.lastUpdatedAt);

  const recentTasks = allTasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 5);

  const activeMilestones = milestones.filter((m) => m.status === 'in_progress' || m.status === 'pending');

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            欢迎回来，张实施顾问
          </h1>
          <p className="text-muted-foreground mt-1">
            以下是您项目的实时状态概览
            <span className="ml-2 inline-flex items-center text-xs">
              <span className="h-2 w-2 rounded-full bg-[#10B981] mr-1 animate-pulse"></span>
              {updateLabel}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <TooltipUI>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>刷新数据</p>
              </TooltipContent>
            </TooltipUI>
          </TooltipProvider>
          <Button variant="outline" asChild>
            <Link href="/projects">
              <Target className="mr-2 h-4 w-4" />
              查看项目
            </Link>
          </Button>
          <Button asChild>
            <Link href="/tasks">
              <Plus className="mr-2 h-4 w-4" />
              新建任务
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="项目总数"
          value={dashboardStats.totalProjects}
          icon={Target}
          iconBg="bg-[#6366F1]/10"
          iconColor="text-[#6366F1]"
          description={`${dashboardStats.inProgressProjects} 个进行中`}
          trend="+2 本月"
          trendUp={true}
          onClick={() => router.push('/projects')}
        />

        <StatCard
          title="任务完成率"
          value={dashboardStats.overallProgress}
          suffix="%"
          icon={CheckSquare}
          iconBg="bg-[#10B981]/10"
          iconColor="text-[#10B981]"
          onClick={() => router.push('/tasks')}
        />

        <StatCard
          title="待处理任务"
          value={dashboardStats.pendingTasks}
          icon={Clock}
          iconBg="bg-[#F59E0B]/10"
          iconColor="text-[#F59E0B]"
          description={`${dashboardStats.blockedTasks} 个被阻塞`}
          onClick={() => router.push('/tasks')}
        />

        <StatCard
          title="里程碑进度"
          value={milestones.filter((m) => m.status === 'completed').length}
          suffix={`/${milestones.length}`}
          icon={Calendar}
          iconBg="bg-[#06B6D4]/10"
          iconColor="text-[#06B6D4]"
          description={`${dashboardStats.upcomingMilestones} 个即将到期`}
          onClick={() => router.push('/milestones')}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务趋势 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#6366F1]" />
              任务完成趋势
            </CardTitle>
            <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30">
              <Activity className="h-3 w-3 mr-1" />
              本周
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskTrendData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPending)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 任务分布 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#6366F1]" />
              任务状态分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {taskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 下方两栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近任务 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#6366F1]" />
              最近任务
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks" className="text-[#6366F1]">
                查看全部
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-[#6366F1] transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.assignee ? (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] bg-[#6366F1] text-white">
                            {task.assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">未分配</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      task.status === 'in_progress' && 'text-[#3B82F6] border-[#3B82F6]/30',
                      task.status === 'pending' && 'text-muted-foreground',
                      task.status === 'blocked' && 'text-[#EF4444] border-[#EF4444]/30'
                    )}
                  >
                    {task.status === 'in_progress' ? '进行中' : task.status === 'pending' ? '待处理' : '阻塞'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      task.priority === 'high' && 'text-[#F59E0B] border-[#F59E0B]/30',
                      task.priority === 'medium' && 'text-[#3B82F6] border-[#3B82F6]/30',
                      task.priority === 'urgent' && 'text-[#EF4444] border-[#EF4444]/30'
                    )}
                  >
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '紧急'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 里程碑进度 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6366F1]" />
              里程碑进度
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/milestones" className="text-[#6366F1]">
                查看全部
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-4 rounded-lg border border-border hover:border-[#6366F1]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center text-white',
                      phaseColors[milestone.phase]
                    )}
                  >
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{milestone.name}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          milestone.status === 'in_progress' && 'text-[#3B82F6] border-[#3B82F6]/30',
                          milestone.status === 'pending' && 'text-muted-foreground'
                        )}
                      >
                        {milestone.status === 'in_progress' ? '进行中' : '待开始'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {milestone.startDate} - {milestone.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{milestone.progress}%</span>
                  </div>
                </div>
                <Progress value={milestone.progress} className="mt-3 h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{milestone.tasks.length} 个任务</span>
                  <span>{milestone.tasks.filter((t) => t.status === 'completed').length} 已完成</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 项目概览 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-[#6366F1]" />
            项目概览
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects" className="text-[#6366F1]">
              管理项目
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="p-4 rounded-lg border border-border hover:border-[#6366F1]/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm group-hover:text-[#6366F1] transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{project.client}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      project.status === 'in_progress' && 'text-[#3B82F6] border-[#3B82F6]/30',
                      project.status === 'planning' && 'text-[#F59E0B] border-[#F59E0B]/30'
                    )}
                  >
                    {project.status === 'in_progress' ? '进行中' : '规划中'}
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>项目进度</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(project.teamSize, 3) }).map((_, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs bg-[#6366F1] text-white">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.teamSize > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                        +{project.teamSize - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {project.endDate}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
