/**
 * 项目背景管理 API 路由
 * /api/v1/projects
 */

const express = require('express');
const router = express.Router();
const projectService = require('../services/project');

/**
 * POST /api/v1/projects - 创建项目
 */
router.post('/', (req, res) => {
  try {
    const projectData = req.body;
    
    // 验证必填字段
    if (!projectData.name) {
      return res.status(400).json({ 
        success: false, 
        error: '项目名称不能为空' 
      });
    }
    
    const project = projectService.createProject(projectData);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '创建项目失败: ' + error.message 
    });
  }
});

/**
 * GET /api/v1/projects - 获取项目列表
 */
router.get('/', (req, res) => {
  try {
    const projects = projectService.getProjects();
    
    res.json({
      success: true,
      data: projects,
      total: projects.length
    });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取项目列表失败: ' + error.message 
    });
  }
});

/**
 * GET /api/v1/projects/:id - 获取项目详情
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const project = projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: '项目不存在' 
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '获取项目详情失败: ' + error.message 
    });
  }
});

/**
 * PUT /api/v1/projects/:id - 更新项目
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const project = projectService.updateProject(id, updates);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: '项目不存在' 
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('更新项目失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '更新项目失败: ' + error.message 
    });
  }
});

/**
 * DELETE /api/v1/projects/:id - 删除项目
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = projectService.deleteProject(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: '项目不存在' 
      });
    }
    
    res.json({
      success: true,
      message: '项目删除成功'
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '删除项目失败: ' + error.message 
    });
  }
});

module.exports = router;
