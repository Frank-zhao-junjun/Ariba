// API响应类型
export interface BaseResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// 分页类型
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ============ 故障排除模块 ============
export interface KnowledgeItem {
  id: string
  title: string
  description: string
  solution: string
  versions: string[]
  module: string
  tags: string[]
  related_items: string[]
  score?: number
  created_at?: string
  updated_at?: string
}

export interface QueryRequest {
  query: string
  version_tags: string[]
  modules: string[]
  limit?: number
}

export interface Module {
  id: string
  name: string
  description: string
}

export interface Version {
  id: string
  name: string
  release_date: string
}

// ============ 清单管理模块 ============
export interface Phase {
  id: string
  name: string
  description: string
  order: number
}

export interface ChecklistItem {
  id: string
  phase_id: string
  phase_name: string
  module_id: string
  module_name: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  due_date?: string
  notes?: string
}

export interface Checklist {
  id: string
  name: string
  project_name: string
  version: string
  phases: Phase[]
  items: ChecklistItem[]
  total_items: number
  completed_items: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  project_name: string
  version: string
  total_items: number
  completed_items: number
  completion_rate: number
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

export interface ProjectProfile {
  company_size: 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  existing_systems: string[]
  integration_level: 'level_1' | 'level_2' | 'level_3' | 'level_4'
}

// ============ 统计模块 ============
export interface DashboardStats {
  knowledge_count: number
  version_distribution: Record<string, number>
  recent_updates: KnowledgeItem[]
  active_projects: number
  completion_rate: number
  system_health: number
  alerts: string[]
}

export interface ModuleStats {
  module_id: string
  module_name: string
  total_items: number
  completed_items: number
  completion_rate: number
}

export interface ProjectStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  completion_rate: number
  average_duration: number
  overdue_projects: number
  module_stats: ModuleStats[]
}

// ============ 知识图谱模块 ============
export interface GraphNode {
  id: string
  label: string
  type: 'error' | 'cause' | 'solution' | 'module'
  properties: Record<string, any>
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
