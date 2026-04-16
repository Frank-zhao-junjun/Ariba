'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  ChevronRight,
  Crown,
  User,
  Code,
  TestTube,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { teamMembers } from '@/lib/data';

const roleConfig = {
  admin: { label: '管理员', icon: Crown, color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10' },
  manager: { label: '项目经理', icon: Shield, color: 'text-[#6366F1]', bgColor: 'bg-[#6366F1]/10' },
  consultant: { label: '实施顾问', icon: User, color: 'text-[#06B6D4]', bgColor: 'bg-[#06B6D4]/10' },
  developer: { label: '开发工程师', icon: Code, color: 'text-[#8B5CF6]', bgColor: 'bg-[#8B5CF6]/10' },
  tester: { label: '测试工程师', icon: TestTube, color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10' },
} as const;

type RoleKey = keyof typeof roleConfig;

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.role && member.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const activeFilterLabels: string[] = [];
  if (searchQuery) activeFilterLabels.push(`搜索: ${searchQuery}`);
  if (roleFilter !== 'all') {
    const config = roleConfig[roleFilter as RoleKey];
    if (config) activeFilterLabels.push(`角色: ${config.label}`);
  }

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
              <Input
                placeholder="搜索成员姓名或邮箱..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="全部角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                {Object.entries(roleConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activeFilterLabels.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-muted-foreground">当前筛选:</span>
              {activeFilterLabels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
              >
                清除
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 团队统计 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = teamMembers.filter((m) => m.role === key).length;
          const isActive = roleFilter === key;

          return (
            <Card
              key={key}
              className={cn(
                'cursor-pointer hover:border-[#6366F1]/50 transition-colors',
                isActive && 'border-[#6366F1] ring-1 ring-[#6366F1]/20'
              )}
              onClick={() => setRoleFilter(isActive ? 'all' : key)}
            >
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
          <CardTitle className="text-lg">
            团队成员 ({filteredMembers.length}
            {filteredMembers.length !== teamMembers.length && ` / ${teamMembers.length}`})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              没有找到匹配的团队成员
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMembers.map((member) => {
                const config = roleConfig[member.role as RoleKey];
                if (!config) return null;
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
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
