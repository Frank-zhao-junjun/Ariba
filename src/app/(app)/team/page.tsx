'use client';

import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  MoreHorizontal,
  ChevronRight,
  Crown,
  User,
  Code,
  TestTube,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { teamMembers } from '@/lib/data';

const roleConfig = {
  admin: { label: '管理员', icon: Crown, color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10' },
  manager: { label: '项目经理', icon: Shield, color: 'text-[#6366F1]', bgColor: 'bg-[#6366F1]/10' },
  consultant: { label: '实施顾问', icon: User, color: 'text-[#06B6D4]', bgColor: 'bg-[#06B6D4]/10' },
  developer: { label: '开发工程师', icon: Code, color: 'text-[#8B5CF6]', bgColor: 'bg-[#8B5CF6]/10' },
  tester: { label: '测试工程师', icon: TestTube, color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10' },
};

const roleLabels = {
  admin: '管理员',
  manager: '项目经理',
  consultant: '实施顾问',
  developer: '开发工程师',
  tester: '测试工程师',
};

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">团队协作</h1>
          <p className="text-muted-foreground mt-1">
            管理项目团队成员和权限
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加成员
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索成员..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              全部角色
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 团队统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = teamMembers.filter((m) => m.role === key).length;

          return (
            <Card key={key} className="cursor-pointer hover:border-[#6366F1]/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 成员列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">团队成员 ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {teamMembers.map((member) => {
              const config = roleConfig[member.role];
              const RoleIcon = config.icon;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-lg">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge className={cn('text-xs', config.color, config.bgColor)}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>查看详情</DropdownMenuItem>
                      <DropdownMenuItem>分配任务</DropdownMenuItem>
                      <DropdownMenuItem>发送消息</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>编辑权限</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">移除成员</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
