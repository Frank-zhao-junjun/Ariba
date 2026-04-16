import Link from 'next/link';
import {
  Target,
  Plus,
  ChevronRight,
  Calendar,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { projects } from '@/lib/data';
import {
  getProjectDetailHref,
  getProjectStatusBadgeClassName,
  getProjectStatusLabel,
} from '@/lib/projects';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">项目管理</h1>
          <p className="text-muted-foreground mt-1">
            管理所有 Ariba 实施项目，查看项目进度和状态
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={getProjectDetailHref(project.id)} className="block group">
            <Card className="hover:border-[#6366F1]/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-[#6366F1] transition-colors">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('shrink-0', getProjectStatusBadgeClassName(project.status))}
                >
                  {getProjectStatusLabel(project.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 进度 */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">项目进度</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* 项目信息 */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">客户:</span>
                    <span>{project.client}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">团队:</span>
                    <span>{project.teamSize} 人</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">开始:</span>
                    <span>{project.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">截止:</span>
                    <span>{project.endDate}</span>
                  </div>
                </div>

                {/* 团队成员 */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(project.teamSize, 4) }).map((_, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white">
                          {String.fromCharCode(65 + i)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.teamSize > 4 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                        +{project.teamSize - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">查看详情</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* 新建项目卡片 */}
        <Card className="border-dashed hover:border-[#6366F1]/50 hover:bg-muted/50 transition-all cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">创建新项目</p>
            <p className="text-sm text-muted-foreground mt-1">
              开始一个新的 Ariba 实施项目
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
