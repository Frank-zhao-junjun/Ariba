import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  FolderOpen,
  Target,
  User,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  getProjectById,
  getProjectStaticParams,
  getProjectStatusBadgeClassName,
  getProjectStatusLabel,
} from '@/lib/projects';

export function generateStaticParams() {
  return getProjectStaticParams();
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6366F1]/10">
          <Icon className="h-5 w-5 text-[#6366F1]" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-base font-medium mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <Button variant="ghost" asChild className="-ml-3 w-fit">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <Badge
                variant="outline"
                className={cn('shrink-0', getProjectStatusBadgeClassName(project.status))}
              >
                {getProjectStatusLabel(project.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">{project.description}</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/tasks">
            <Target className="mr-2 h-4 w-4" />
            查看关联任务
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="客户" value={project.client} icon={Building2} />
        <SummaryCard title="项目经理" value={project.manager} icon={User} />
        <SummaryCard title="团队规模" value={`${project.teamSize} 人`} icon={Users} />
        <SummaryCard title="项目编号" value={project.id} icon={FolderOpen} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>项目总览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">当前进度</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  开始日期
                </div>
                <p className="text-base font-medium">{project.startDate}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  计划截止
                </div>
                <p className="text-base font-medium">{project.endDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>实施摘要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">项目描述</p>
              <p className="text-sm leading-6 mt-2">{project.description}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">当前状态</p>
              <p className="text-sm font-medium mt-2">{getProjectStatusLabel(project.status)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">建议动作</p>
              <p className="text-sm leading-6 mt-2">
                从这里继续跟进项目里程碑、任务与知识资产，避免项目列表停留在只读状态。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}