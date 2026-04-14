// 项目数据模型和模拟数据

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  progress: number;
  manager: string;
  teamSize: number;
}

export interface Milestone {
  id: string;
  name: string;
  phase: 'preparation' | 'blueprint' | 'development' | 'testing' | 'deployment';
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'config' | 'test' | 'training' | 'document' | 'integration';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: TeamMember;
  dueDate?: string;
  milestoneId?: string;
  tags?: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'consultant' | 'developer' | 'tester';
  avatar?: string;
  email: string;
}

export interface Comment {
  id: string;
  author: TeamMember;
  content: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
}

// 模拟团队成员
export const teamMembers: TeamMember[] = [
  { id: '1', name: '张实施顾问', role: 'manager', email: 'zhang.consultant@company.com' },
  { id: '2', name: '李技术专家', role: 'consultant', email: 'li.consultant@company.com' },
  { id: '3', name: '王开发工程师', role: 'developer', email: 'wang.dev@company.com' },
  { id: '4', name: '刘测试工程师', role: 'tester', email: 'liu.tester@company.com' },
  { id: '5', name: '陈项目经理', role: 'admin', email: 'chen.pm@company.com' },
];

// 模拟项目数据
export const projects: Project[] = [
  {
    id: 'proj-001',
    name: '华润集团 Ariba 项目',
    description: '华润集团采购数字化转型项目一期',
    client: '华润集团',
    status: 'in_progress',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    progress: 45,
    manager: '张实施顾问',
    teamSize: 8,
  },
  {
    id: 'proj-002',
    name: '中石化 Ariba SLP',
    description: '中石化寻源到付款解决方案实施',
    client: '中国石化',
    status: 'in_progress',
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    progress: 28,
    manager: '李技术专家',
    teamSize: 6,
  },
  {
    id: 'proj-003',
    name: '平安科技合同管理',
    description: 'Ariba Contracts 合同管理模块实施',
    client: '平安科技',
    status: 'planning',
    startDate: '2024-04-01',
    endDate: '2024-09-30',
    progress: 10,
    manager: '王开发工程师',
    teamSize: 5,
  },
];

// 模拟里程碑数据
export const milestones: Milestone[] = [
  {
    id: 'ms-001',
    name: '项目准备',
    phase: 'preparation',
    description: '项目启动、团队组建、环境准备',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    progress: 100,
    status: 'completed',
    tasks: [
      { id: 't-001', title: '项目启动会', category: 'document', status: 'completed', priority: 'high', comments: [], createdAt: '2024-01-15', updatedAt: '2024-01-15' },
      { id: 't-002', title: '环境搭建', category: 'config', status: 'completed', priority: 'medium', comments: [], createdAt: '2024-01-16', updatedAt: '2024-01-20' },
      { id: 't-003', title: '需求调研', category: 'document', status: 'completed', priority: 'high', comments: [], createdAt: '2024-01-17', updatedAt: '2024-02-10' },
    ],
  },
  {
    id: 'ms-002',
    name: '蓝图设计',
    phase: 'blueprint',
    description: '业务流程设计、方案确认、蓝图评审',
    startDate: '2024-02-16',
    endDate: '2024-03-31',
    progress: 85,
    status: 'in_progress',
    tasks: [
      { id: 't-004', title: '主数据梳理', category: 'document', status: 'completed', priority: 'high', comments: [], createdAt: '2024-02-16', updatedAt: '2024-02-28' },
      { id: 't-005', title: '流程设计', category: 'document', status: 'in_progress', priority: 'high', assignee: teamMembers[1], comments: [], createdAt: '2024-02-20', updatedAt: '2024-03-15' },
      { id: 't-006', title: '集成方案设计', category: 'integration', status: 'in_progress', priority: 'medium', assignee: teamMembers[2], comments: [], createdAt: '2024-02-22', updatedAt: '2024-03-10' },
      { id: 't-007', title: '蓝图评审会', category: 'document', status: 'pending', priority: 'high', comments: [], createdAt: '2024-02-25', updatedAt: '2024-02-25' },
    ],
  },
  {
    id: 'ms-003',
    name: '开发配置',
    phase: 'development',
    description: '系统配置、功能开发、接口开发',
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    progress: 35,
    status: 'in_progress',
    tasks: [
      { id: 't-008', title: '基础配置', category: 'config', status: 'completed', priority: 'medium', comments: [], createdAt: '2024-04-01', updatedAt: '2024-04-15' },
      { id: 't-009', title: '采购流程配置', category: 'config', status: 'in_progress', priority: 'high', assignee: teamMembers[1], comments: [], createdAt: '2024-04-05', updatedAt: '2024-04-20' },
      { id: 't-010', title: 'ERP接口开发', category: 'integration', status: 'in_progress', priority: 'high', assignee: teamMembers[2], comments: [], createdAt: '2024-04-08', updatedAt: '2024-04-25' },
      { id: 't-011', title: '报表开发', category: 'config', status: 'pending', priority: 'medium', comments: [], createdAt: '2024-04-10', updatedAt: '2024-04-10' },
    ],
  },
  {
    id: 'ms-004',
    name: '测试验证',
    phase: 'testing',
    description: '单元测试、集成测试、UAT测试',
    startDate: '2024-06-01',
    endDate: '2024-06-20',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 't-012', title: '测试用例编写', category: 'test', status: 'pending', priority: 'medium', comments: [], createdAt: '2024-05-15', updatedAt: '2024-05-15' },
      { id: 't-013', title: '系统测试', category: 'test', status: 'pending', priority: 'high', comments: [], createdAt: '2024-05-20', updatedAt: '2024-05-20' },
      { id: 't-014', title: 'UAT测试', category: 'test', status: 'pending', priority: 'high', comments: [], createdAt: '2024-06-01', updatedAt: '2024-06-01' },
    ],
  },
  {
    id: 'ms-005',
    name: '上线部署',
    phase: 'deployment',
    description: '数据迁移、系统上线、运维支持',
    startDate: '2024-06-21',
    endDate: '2024-06-30',
    progress: 0,
    status: 'pending',
    tasks: [
      { id: 't-015', title: '数据准备', category: 'document', status: 'pending', priority: 'high', comments: [], createdAt: '2024-06-01', updatedAt: '2024-06-01' },
      { id: 't-016', title: '数据迁移', category: 'config', status: 'pending', priority: 'high', comments: [], createdAt: '2024-06-15', updatedAt: '2024-06-15' },
      { id: 't-017', title: '系统上线', category: 'config', status: 'pending', priority: 'urgent', comments: [], createdAt: '2024-06-21', updatedAt: '2024-06-21' },
    ],
  },
];

// 所有任务列表
export const allTasks: Task[] = milestones.flatMap((m) => m.tasks);

// 模拟知识库数据
export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'kb-001',
    title: 'Ariba采购申请审批流程配置指南',
    category: 'standard',
    subcategory: '配置指南',
    content: '本文档详细介绍了如何在Ariba中配置采购申请审批流程...',
    tags: ['采购申请', '审批流程', '配置'],
    author: 'SAP官方',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-15',
    views: 1256,
  },
  {
    id: 'kb-002',
    title: 'Ariba与SAP ERP集成最佳实践',
    category: 'standard',
    subcategory: '最佳实践',
    content: '集成是Ariba实施中最关键的环节之一...',
    tags: ['集成', 'ERP', '最佳实践'],
    author: 'SAP官方',
    createdAt: '2024-01-12',
    updatedAt: '2024-03-20',
    views: 987,
  },
  {
    id: 'kb-003',
    title: '供应商主数据管理规范',
    category: 'project',
    subcategory: '企业背景知识',
    content: '根据华润集团供应商管理要求...',
    tags: ['供应商', '主数据'],
    author: '张实施顾问',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-10',
    views: 345,
  },
  {
    id: 'kb-004',
    title: '寻源到付款(S2P)业务流程蓝图',
    category: 'project',
    subcategory: '蓝图设计文档',
    content: '本文档定义了华润集团S2P端到端业务流程...',
    tags: ['S2P', '流程', '蓝图'],
    author: '李技术专家',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-25',
    views: 567,
  },
  {
    id: 'kb-005',
    title: 'Ariba API接口开发文档',
    category: 'standard',
    subcategory: '接口指南',
    content: 'Ariba提供丰富的RESTful API支持...',
    tags: ['API', '开发', '接口'],
    author: 'SAP官方',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-18',
    views: 1567,
  },
];

// 文档模板
export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'tmpl-001',
    name: '业务需求文档(BRD)',
    category: '需求文档',
    description: '用于描述业务需求和功能要求的标准化模板',
    content: '# 业务需求文档\n\n## 1. 文档信息\n- 项目名称：\n- 文档版本：\n- 创建日期：\n- 作者：\n\n## 2. 业务背景\n\n## 3. 业务需求\n\n## 4. 功能需求\n\n## 5. 非功能需求\n\n## 6. 验收标准',
  },
  {
    id: 'tmpl-002',
    name: '功能需求规格说明书',
    category: '需求文档',
    description: '详细描述功能需求的规格说明书模板',
    content: '# 功能需求规格说明书\n\n## 1. 功能概述\n\n## 2. 功能详细描述\n\n## 3. 用户界面要求\n\n## 4. 数据要求\n\n## 5. 业务规则\n\n## 6. 接口要求',
  },
  {
    id: 'tmpl-003',
    name: '测试用例模板',
    category: '测试用例',
    description: '标准化测试用例编写模板',
    content: '# 测试用例\n\n| 用例编号 | 功能点 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |',
  },
  {
    id: 'tmpl-004',
    name: '培训材料模板',
    category: '培训材料',
    description: '用户培训材料编写模板',
    content: '# 用户培训手册\n\n## 1. 培训目标\n\n## 2. 培训对象\n\n## 3. 培训内容\n\n## 4. 操作指南\n\n## 5. 常见问题',
  },
  {
    id: 'tmpl-005',
    name: '周报模板',
    category: '汇报模板',
    description: '项目周报填写模板',
    content: '# 项目周报\n\n## 基本信息\n- 项目名称：\n- 报告周期：\n- 报告人：\n\n## 本周工作完成情况\n\n## 下周工作计划\n\n## 问题与风险\n\n## 资源需求',
  },
];

// 系统统计数据
export const dashboardStats = {
  totalProjects: 3,
  inProgressProjects: 2,
  totalTasks: 17,
  completedTasks: 5,
  pendingTasks: 8,
  blockedTasks: 1,
  overallProgress: 45,
  upcomingMilestones: 2,
  recentActivities: [
    { id: 1, type: 'task_completed', content: '王开发工程师完成了「基础配置」任务', time: '30分钟前' },
    { id: 2, type: 'comment', content: '李技术专家在「流程设计」任务下添加了评论', time: '1小时前' },
    { id: 3, type: 'milestone', content: '「项目准备」里程碑已完成', time: '2小时前' },
    { id: 4, type: 'task_assigned', content: '「集成方案设计」任务分配给王开发工程师', time: '3小时前' },
  ],
};

// 运维状态数据
export const systemStatus = {
  services: [
    { name: 'Ariba Network', status: 'healthy', uptime: '99.9%', lastCheck: '刚刚' },
    { name: 'SAP Integration', status: 'healthy', uptime: '99.5%', lastCheck: '刚刚' },
    { name: 'Database', status: 'healthy', uptime: '99.99%', lastCheck: '刚刚' },
    { name: 'API Gateway', status: 'warning', uptime: '98.5%', lastCheck: '5分钟前' },
  ],
  logs: [
    { id: 1, level: 'info', message: '系统健康检查完成', timestamp: '2024-04-15 10:30:00' },
    { id: 2, level: 'warning', message: 'API响应时间略长', timestamp: '2024-04-15 10:25:00' },
    { id: 3, level: 'info', message: '备份任务执行成功', timestamp: '2024-04-15 02:00:00' },
    { id: 4, level: 'error', message: '接口调用失败重试', timestamp: '2024-04-15 09:45:00' },
  ],
  metrics: {
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 28,
  },
};
