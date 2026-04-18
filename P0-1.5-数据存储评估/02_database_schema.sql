-- ============================================================
-- Ariba实施助手 - SQLite数据库Schema设计
-- 版本: 1.0.0
-- 日期: 2026-04-18
-- ============================================================

-- 启用外键约束
PRAGMA foreign_keys = ON;

-- ============================================================
-- 知识表 (knowledge)
-- 存储所有知识点
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    solution TEXT,
    category TEXT NOT NULL,
    tags TEXT,  -- JSON数组存储
    versions TEXT,  -- JSON数组存储
    source TEXT,
    module TEXT,
    related_items TEXT,  -- JSON数组存储关联ID
    priority INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 知识表索引
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_created ON knowledge(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_updated ON knowledge(updated_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_module ON knowledge(module);

-- 全文搜索虚拟表
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
    title,
    content,
    description,
    solution,
    tags,
    content='knowledge',
    content_rowid='rowid'
);

-- ============================================================
-- 版本表 (versions)
-- 存储SAP Ariba版本信息
-- ============================================================
CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_tag TEXT UNIQUE NOT NULL,  -- 如 2602, 2604, 2605
    version_name TEXT,  -- 如 "Spring 2026"
    release_date TEXT,
    end_of_support TEXT,
    compatibility TEXT,  -- JSON数组
    deprecated INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_versions_tag ON versions(version_tag);
CREATE INDEX IF NOT EXISTS idx_versions_deprecated ON versions(deprecated);

-- ============================================================
-- 清单模板表 (checklist_templates)
-- 存储实施检查清单模板
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    items TEXT NOT NULL,  -- JSON数组存储清单项
    version_range TEXT,  -- 如 "2602-2605"
    phase_count INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON checklist_templates(category);

-- ============================================================
-- 项目表 (projects)
-- 存储用户创建的实施项目
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL,
    modules TEXT,  -- JSON数组
    status TEXT DEFAULT 'active',  -- active, completed, archived
    owner_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);

-- ============================================================
-- 清单项表 (checklist_items)
-- 存储项目中的清单项
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    phase_id TEXT NOT NULL,
    phase_name TEXT NOT NULL,
    module_id TEXT,
    module_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',  -- pending, in_progress, completed, skipped
    priority TEXT DEFAULT 'medium',  -- low, medium, high
    assignee TEXT,
    due_date TEXT,
    notes TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_project ON checklist_items(project_id);
CREATE INDEX IF NOT EXISTS idx_items_phase ON checklist_items(phase_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON checklist_items(status);

-- ============================================================
-- 搜索索引表 (search_index)
-- 预构建的搜索索引，提升查询性能
-- ============================================================
CREATE TABLE IF NOT EXISTS search_index (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    knowledge_id TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    field TEXT DEFAULT 'content',  -- title, content, tags
    FOREIGN KEY (knowledge_id) REFERENCES knowledge(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_search_keyword ON search_index(keyword);
CREATE INDEX IF NOT EXISTS idx_search_knowledge ON search_index(knowledge_id);

-- ============================================================
-- 用户反馈表 (feedback)
-- 存储用户反馈
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    knowledge_id TEXT,
    feedback_type TEXT NOT NULL,  -- helpful, not_helpful, suggestion
    content TEXT,
    rating INTEGER,
    user_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (knowledge_id) REFERENCES knowledge(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_knowledge ON feedback(knowledge_id);

-- ============================================================
-- 操作日志表 (audit_log)
-- 用于数据变更追踪和回滚
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
    old_data TEXT,  -- JSON
    new_data TEXT,  -- JSON
    user_id TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_log(created_at);

-- ============================================================
-- 视图定义
-- ============================================================

-- 知识统计视图
CREATE VIEW IF NOT EXISTS v_knowledge_stats AS
SELECT 
    category,
    COUNT(*) as total,
    SUM(view_count) as total_views,
    AVG(view_count) as avg_views,
    MAX(updated_at) as last_updated
FROM knowledge
GROUP BY category;

-- 项目进度视图
CREATE VIEW IF NOT EXISTS v_project_progress AS
SELECT 
    p.id,
    p.name,
    p.version,
    COUNT(c.id) as total_items,
    SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_items,
    ROUND(AVG(CASE WHEN c.status = 'completed' THEN 1.0 ELSE 0.0 END) * 100, 1) as completion_rate
FROM projects p
LEFT JOIN checklist_items c ON p.id = c.project_id
GROUP BY p.id;

-- ============================================================
-- 触发器定义
-- ============================================================

-- 更新updated_at触发器
CREATE TRIGGER IF NOT EXISTS tr_knowledge_updated 
AFTER UPDATE ON knowledge
BEGIN
    UPDATE knowledge SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_projects_updated 
AFTER UPDATE ON projects
BEGIN
    UPDATE projects SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_items_updated 
AFTER UPDATE ON checklist_items
BEGIN
    UPDATE checklist_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- 审计日志触发器
CREATE TRIGGER IF NOT EXISTS tr_knowledge_audit_insert
AFTER INSERT ON knowledge
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, new_data)
    VALUES ('knowledge', NEW.id, 'INSERT', json_object(
        'title', NEW.title,
        'category', NEW.category,
        'created_at', NEW.created_at
    ));
END;

CREATE TRIGGER IF NOT EXISTS tr_knowledge_audit_update
AFTER UPDATE ON knowledge
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
    VALUES ('knowledge', NEW.id, 'UPDATE', json_object(
        'title', OLD.title,
        'category', OLD.category,
        'view_count', OLD.view_count
    ), json_object(
        'title', NEW.title,
        'category', NEW.category,
        'view_count', NEW.view_count
    ));
END;

CREATE TRIGGER IF NOT EXISTS tr_knowledge_audit_delete
AFTER DELETE ON knowledge
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_data)
    VALUES ('knowledge', OLD.id, 'DELETE', json_object(
        'title', OLD.title,
        'category', OLD.category
    ));
END;
