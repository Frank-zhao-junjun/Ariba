import type { Milestone } from './data';

export type MilestonePhaseFilter = Milestone['phase'] | 'all';

export interface MilestoneTaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  completionRate: number;
}

export function filterMilestonesByPhase(
  milestones: Milestone[],
  selectedPhase: MilestonePhaseFilter
): Milestone[] {
  if (selectedPhase === 'all') {
    return milestones;
  }

  return milestones.filter((milestone) => milestone.phase === selectedPhase);
}

export function getSelectedMilestone(
  milestones: Milestone[],
  selectedMilestoneId: string
): Milestone | null {
  return milestones.find((milestone) => milestone.id === selectedMilestoneId) ?? milestones[0] ?? null;
}

export function getMilestoneTaskSummary(milestone: Milestone): MilestoneTaskSummary {
  const total = milestone.tasks.length;
  const completed = milestone.tasks.filter((task) => task.status === 'completed').length;
  const inProgress = milestone.tasks.filter((task) => task.status === 'in_progress').length;
  const pending = milestone.tasks.filter((task) => task.status === 'pending').length;
  const blocked = milestone.tasks.filter((task) => task.status === 'blocked').length;

  return {
    total,
    completed,
    inProgress,
    pending,
    blocked,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getMilestoneOverallProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) {
    return 0;
  }

  const totalProgress = milestones.reduce((sum, milestone) => sum + milestone.progress, 0);
  return Math.round(totalProgress / milestones.length);
}