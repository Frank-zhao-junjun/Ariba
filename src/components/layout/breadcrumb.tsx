'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Target,
  CheckSquare,
  BookOpen,
  FileText,
  Users,
  Bot,
  Wrench,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 面包屑配置
interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: '首页' }],
  '/projects': [{ label: '首页', href: '/' }, { label: '项目管理' }],
  '/milestones': [{ label: '首页', href: '/' }, { label: '里程碑追踪' }],
  '/tasks': [{ label: '首页', href: '/' }, { label: '任务清单' }],
  '/knowledge': [{ label: '首页', href: '/' }, { label: '知识库' }],
  '/knowledge/standard': [{ label: '首页', href: '/' }, { label: '知识库', href: '/knowledge' }, { label: '标准知识库' }],
  '/knowledge/project': [{ label: '首页', href: '/' }, { label: '知识库', href: '/knowledge' }, { label: '项目知识库' }],
  '/templates': [{ label: '首页', href: '/' }, { label: '文档模板' }],
  '/team': [{ label: '首页', href: '/' }, { label: '团队协作' }],
  '/assistant': [{ label: '首页', href: '/' }, { label: '实施助手' }],
  '/operations': [{ label: '首页', href: '/' }, { label: '运维中心' }],
  '/settings': [{ label: '首页', href: '/' }, { label: '系统设置' }],
};

export function Breadcrumb() {
  const pathname = usePathname();

  // 精确匹配或模糊匹配
  let breadcrumbs = routeBreadcrumbs[pathname];

  // 如果没有精确匹配，尝试模糊匹配
  if (!breadcrumbs) {
    for (const [route, items] of Object.entries(routeBreadcrumbs)) {
      if (pathname.startsWith(route) && route !== '/') {
        breadcrumbs = [...items, { label: '详情' }];
        break;
      }
    }
  }

  // 默认面包屑
  if (!breadcrumbs) {
    breadcrumbs = [{ label: '首页', href: '/' }, { label: '当前位置' }];
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
