'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  BookOpen,
  Bot,
  Settings,
  Wrench,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '项目管理', href: '/projects', icon: Target },
  { name: '里程碑', href: '/milestones', icon: CheckSquare },
  { name: '任务清单', href: '/tasks', icon: CheckSquare },
  { name: '知识库', href: '/knowledge', icon: BookOpen },
  { name: '文档模板', href: '/templates', icon: FileText },
  { name: '团队协作', href: '/team', icon: Users },
  { name: '实施助手', href: '/assistant', icon: Bot },
  { name: '运维中心', href: '/operations', icon: Wrench },
  { name: '系统设置', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const Icon = item.icon;

    const content = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
          collapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{item.name}</span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo区域 */}
      <div className={cn(
        'h-16 flex items-center border-b border-sidebar-border shrink-0',
        collapsed ? 'justify-center px-2' : 'px-4 gap-3'
      )}>
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-white"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-sidebar-foreground truncate">
              Ariba 实施助手
            </span>
            <span className="text-xs text-muted-foreground">
              项目管理平台
            </span>
          </div>
        )}
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* 折叠按钮 */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 px-3',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && <span className="text-sm text-muted-foreground">收起</span>}
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </aside>
  );
}
