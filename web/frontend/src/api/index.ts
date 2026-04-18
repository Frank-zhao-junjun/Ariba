import axios from 'axios'
import type { BaseResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data as BaseResponse,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// ============ Dashboard API ============
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getHealth: () => api.get('/dashboard/health'),
  getActivity: (limit?: number) => api.get('/dashboard/activity', { params: { limit } }),
}

// ============ Troubleshooting API ============
export const troubleshootingApi = {
  query: (params: {
    query: string
    version_tags?: string[]
    modules?: string[]
    limit?: number
  }) => api.post('/troubleshooting/query', params),
  
  getKnowledge: (itemId: string) => api.get(`/troubleshooting/knowledge/${itemId}`),
  
  submitFeedback: (params: {
    item_id: string
    query: string
    helpful: boolean
    comment?: string
  }) => api.post('/troubleshooting/feedback', params),
  
  getModules: () => api.get('/troubleshooting/modules'),
  
  getVersions: () => api.get('/troubleshooting/versions'),
}

// ============ Checklist API ============
export const checklistApi = {
  listProjects: () => api.get('/checklist/projects'),
  
  getProject: (projectId: string) => api.get(`/checklist/projects/${projectId}`),
  
  createProject: (params: {
    name: string
    profile: {
      company_size: string
      industry: string
      existing_systems: string[]
      integration_level: string
    }
    modules: string[]
    version: string
    template_id?: string
  }) => api.post('/checklist/projects', params),
  
  updateItem: (projectId: string, itemId: string, data: any) => 
    api.patch(`/checklist/projects/${projectId}/items/${itemId}`, data),
  
  getStats: () => api.get('/checklist/stats'),
  
  getRecommendations: (profile?: string) => 
    api.get('/checklist/recommendations', { params: { profile } }),
}

// ============ Knowledge Graph API ============
export const graphApi = {
  getKnowledgeGraph: (version?: string) => 
    api.get('/graph/knowledge-graph', { params: { version } }),
  
  compareVersions: (version1: string, version2: string) =>
    api.get('/graph/version-comparison', { params: { version1, version2 } }),
}

export default api
