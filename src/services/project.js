/**
 * 项目背景管理服务
 * 提供项目的增删改查功能
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/projects.json');

// 确保数据目录存在
const ensureDataDir = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 确保数据文件存在
const ensureDataFile = () => {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ projects: [] }, null, 2), 'utf8');
  }
};

// 读取所有项目
const getAllProjects = () => {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data).projects;
};

// 保存项目列表
const saveProjects = (projects) => {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
};

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * 创建项目
 */
const createProject = (projectData) => {
  const projects = getAllProjects();
  const now = new Date().toISOString();
  
  const newProject = {
    id: generateId(),
    ...projectData,
    createdAt: now,
    updatedAt: now
  };
  
  projects.push(newProject);
  saveProjects(projects);
  
  return newProject;
};

/**
 * 获取所有项目
 */
const getProjects = () => {
  return getAllProjects();
};

/**
 * 根据ID获取项目
 */
const getProjectById = (id) => {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
};

/**
 * 更新项目
 */
const updateProject = (id, updates) => {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }
  
  projects[index] = {
    ...projects[index],
    ...updates,
    id: projects[index].id,
    createdAt: projects[index].createdAt,
    updatedAt: new Date().toISOString()
  };
  
  saveProjects(projects);
  return projects[index];
};

/**
 * 删除项目
 */
const deleteProject = (id) => {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    return false;
  }
  
  projects.splice(index, 1);
  saveProjects(projects);
  return true;
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
