import type { Project } from './data';
import { projects } from './data';

const projectStatusLabels: Record<Project['status'], string> = {
  planning: '规划中',
  in_progress: '进行中',
  completed: '已完成',
  on_hold: '已暂停',
};

const projectStatusBadgeClassNames: Record<Project['status'], string> = {
  planning: 'text-[#F59E0B] border-[#F59E0B]/30',
  in_progress: 'text-[#3B82F6] border-[#3B82F6]/30',
  completed: 'text-[#10B981] border-[#10B981]/30',
  on_hold: 'text-[#EF4444] border-[#EF4444]/30',
};

export function getProjectDetailHref(projectId: string): string {
  return `/projects/${projectId}`;
}

export function getProjectById(projectId: string): Project | null {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function getProjectStatusLabel(status: Project['status']): string {
  return projectStatusLabels[status];
}

export function getProjectStatusBadgeClassName(status: Project['status']): string {
  return projectStatusBadgeClassNames[status];
}

export function getProjectStaticParams(): Array<{ id: string }> {
  return projects.map((project) => ({ id: project.id }));
}