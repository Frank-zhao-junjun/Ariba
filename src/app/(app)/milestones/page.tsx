'use client';

import { useMemo, useState } from 'react';
import {
  CheckSquare,
  Clock,
  ChevronRight,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { milestones } from '@/lib/data';
import {
  filterMilestonesByPhase,
  getMilestoneOverallProgress,
  getMilestoneTaskSummary,
  getSelectedMilestone,
  type MilestonePhaseFilter,
} from '@/lib/milestones';

const phaseConfig = {
  all: {
    label: '全部阶段',
    color: '#6366F1',
    bgColor: 'bg-[#6366F1]',
    borderColor: 'border-[#6366F1]/30',
    textColor: 'text-[#6366F1]',
  },
  preparation: {
    label: '准备阶段',
    color: '#6366F1',
    bgColor: 'bg-[#6366F1]',
    borderColor: 'border-[#6366F1]/30',
    textColor: 'text-[#6366F1]',
  },
  blueprint: {
    label: '蓝图设计',
    color: '#8B5CF6',
    bgColor: 'bg-[#8B5CF6]',
    borderColor: 'border-[#8B5CF6]/30',
    textColor: 'text-[#8B5CF6]',
  },
  development: {
    label: '开发配置',
    color: '#06B6D4',
    bgColor: 'bg-[#06B6D4]',
    borderColor: 'border-[#06B6D4]/30',
    textColor: 'text-[#06B6D4]',
  },
  testing: {
    label: '测试验证',
    color: '#F59E0B',
    bgColor: 'bg-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/30',
    textColor: 'text-[#F59E0B]',
  },
  deployment: {
    label: '上线部署',
    color: '#10B981',
    bgColor: 'bg-[#10B981]',
    borderColor: 'border-[#10B981]/30',
    textColor: 'text-[#10B981]',
  },
};

const statusConfig = {
  pending: { label: '待开始', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { label: '进行中', icon: Clock, color: 'text-[#3B82F6]' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'text-[#10B981]' },
  delayed: { label: '已延期', icon: AlertCircle, color: 'text-[#EF4444]' },
};

const priorityConfig = {
  low: { label: '低', className: 'bg-muted text-muted-foreground' },
  medium: { label: '中', className: 'bg-[#3B82F6]/15 text-[#3B82F6]' },
  high: { label: '高', className: 'bg-[#F59E0B]/15 text-[#F59E0B]' },
  urgent: { label: '紧急', className: 'bg-[#EF4444]/15 text-[#EF4444]' },
};

const taskStatusConfig = {
  pending: { label: '待处理', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { label: '进行中', icon: Clock, color: 'text-[#3B82F6]' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'text-[#10B981]' },
  blocked: { label: '阻塞', icon: AlertCircle, color: 'text-[#EF4444]' },
};

export default function MilestonesPage() {
  const [selectedPhase, setSelectedPhase] = useState<MilestonePhaseFilter>('all');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestones[0]?.id ?? '');

  const filteredMilestones = useMemo(
    () => filterMilestonesByPhase(milestones, selectedPhase),
    [selectedPhase]
  );

  const selectedMilestone = useMemo(
    () => getSelectedMilestone(filteredMilestones, selectedMilestoneId),
    [filteredMilestones, selectedMilestoneId]
  );

  const selectedMilestoneTaskSummary = useMemo(
    () => (selectedMilestone ? getMilestoneTaskSummary(selectedMilestone) : null),
    [selectedMilestone]
  );

  const overallProgress = useMemo(
    () => getMilestoneOverallProgress(filteredMilestones),
    [filteredMilestones]
  );

  const phaseFilters = (Object.keys(phaseConfig) as Array<keyof typeof phaseConfig>);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">实施里程碑</h1>
          <p className="text-muted-foreground mt-1">
            跟踪项目各阶段进度，确保实施按计划推进
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            导出报告
          </Button>
          <Button>
            <CheckSquare className="mr-2 h-4 w-4" />
            管理里程碑
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {phaseFilters.map((phase) => {
          const isActive = selectedPhase === phase;
          const phaseInfo = phaseConfig[phase];

          return (
            <Button
              key={phase}
              variant={isActive ? 'secondary' : 'outline'}
              onClick={() => setSelectedPhase(phase as MilestonePhaseFilter)}
              className={cn(isActive && phaseInfo.textColor)}
            >
              {phaseInfo.label}
            </Button>
          );
        })}
      </div>

      {/* 横向时间线 */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* 连接线 */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />

            {/* 阶段节点 */}
            <div className="relative flex justify-between">
              {filteredMilestones.map((milestone, index) => {
                const config = phaseConfig[milestone.phase];
                const isActive = milestone.status === 'in_progress';
                const isCompleted = milestone.status === 'completed';
                const isSelected = selectedMilestone?.id === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <button
                      onClick={() => setSelectedMilestoneId(milestone.id)}
                      className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center transition-all',
                        isCompleted && 'bg-[#10B981] text-white',
                        isActive && `${config.bgColor} text-white shadow-lg`,
                        !isCompleted && !isActive && 'bg-muted text-muted-foreground',
                        isSelected && 'ring-2 ring-offset-2 ring-[#6366F1]/40'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <span className="text-lg font-bold">{index + 1}</span>
                      )}
                    </button>
                    <div className="mt-3 text-center">
                      <p className={cn('text-sm font-medium', isActive && config.textColor)}>
                        {milestone.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {milestone.progress}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-8 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#10B981] transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>项目开始</span>
            <span>整体进度 {overallProgress}%</span>
            <span>项目结束</span>
          </div>
        </CardContent>
      </Card>

      {/* 阶段详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：阶段列表 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">阶段详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredMilestones.map((milestone) => {
              const config = phaseConfig[milestone.phase];
              const isSelected = selectedMilestone?.id === milestone.id;
              const statusInfo = statusConfig[milestone.status];

              return (
                <button
                  key={milestone.id}
                  onClick={() => setSelectedMilestoneId(milestone.id)}
                  className={cn(
                    'w-full p-4 rounded-lg border text-left transition-all',
                    isSelected
                      ? cn(config.borderColor, 'bg-muted/50 shadow-sm')
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white', config.bgColor)}>
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{milestone.name}</span>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', statusInfo.color)}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {milestone.startDate}
                        </span>
                        <span>-</span>
                        <span>{milestone.endDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">完成度</span>
                      <span className="font-medium">{milestone.progress}%</span>
                    </div>
                    <Progress
                      value={milestone.progress}
                      className="h-1.5"
                    />
                  </div>
                </button>
              );
            })}
            {filteredMilestones.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                当前阶段筛选下暂无里程碑。
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧：阶段任务 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{selectedMilestone?.name ?? '暂无里程碑'}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedMilestone?.description ?? '当前筛选下暂无阶段详情。'}
              </p>
            </div>
            {selectedMilestone && (
              <Badge
                variant="outline"
                className={cn(
                  'text-sm',
                  phaseConfig[selectedMilestone.phase].textColor,
                  phaseConfig[selectedMilestone.phase].borderColor
                )}
              >
                {phaseConfig[selectedMilestone.phase].label}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {selectedMilestone && selectedMilestoneTaskSummary ? (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">任务总数</p>
                    <p className="text-lg font-semibold mt-1">{selectedMilestoneTaskSummary.total}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">已完成</p>
                    <p className="text-lg font-semibold mt-1">{selectedMilestoneTaskSummary.completed}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">进行中</p>
                    <p className="text-lg font-semibold mt-1">{selectedMilestoneTaskSummary.inProgress}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">待处理</p>
                    <p className="text-lg font-semibold mt-1">{selectedMilestoneTaskSummary.pending}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">完成率</p>
                    <p className="text-lg font-semibold mt-1">{selectedMilestoneTaskSummary.completionRate}%</p>
                  </div>
                </div>

                <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  任务列表 ({selectedMilestoneTaskSummary.total})
                </TabsTrigger>
                <TabsTrigger value="details">
                  <FileText className="h-4 w-4 mr-2" />
                  阶段信息
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="mt-4">
                <div className="space-y-3">
                  {selectedMilestone.tasks.map((task) => {
                    const taskStatus = taskStatusConfig[task.status];
                    const TaskIcon = taskStatus.icon;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-[#6366F1]/30 transition-colors"
                      >
                        <TaskIcon className={cn('h-5 w-5 shrink-0', taskStatus.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{task.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {task.category === 'config' && '配置'}
                              {task.category === 'test' && '测试'}
                              {task.category === 'training' && '培训'}
                              {task.category === 'document' && '文档'}
                              {task.category === 'integration' && '集成'}
                            </Badge>
                            <Badge
                              className={cn('text-xs', priorityConfig[task.priority].className)}
                            >
                              {priorityConfig[task.priority].label}
                            </Badge>
                          </div>
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-medium">
                              {task.assignee.name.charAt(0)}
                            </div>
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                              {task.assignee.name}
                            </span>
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className={cn('text-xs', taskStatus.color)}
                        >
                          {taskStatus.label}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  添加任务
                </Button>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">开始日期</p>
                    <p className="text-sm font-medium mt-1">{selectedMilestone.startDate}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">结束日期</p>
                    <p className="text-sm font-medium mt-1">{selectedMilestone.endDate}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">任务总数</p>
                    <p className="text-sm font-medium mt-1">{selectedMilestoneTaskSummary.total} 个</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">已完成</p>
                    <p className="text-sm font-medium mt-1">{selectedMilestoneTaskSummary.completed} 个</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">阶段说明</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMilestone.description}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                当前筛选下暂无阶段详情。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
