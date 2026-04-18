#!/usr/bin/env python3
"""
Ariba实施助手 - 数据访问层 (DAL)
提供统一的数据库操作接口
"""

import sqlite3
import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from contextlib import contextmanager
import hashlib

class DatabaseConfig:
    """数据库配置"""
    DEFAULT_PATH = "./Ariba实施助手/data/ariba_assistant.db"
    
    @classmethod
    def get_connection(cls, db_path: str = None) -> sqlite3.Connection:
        """获取数据库连接"""
        path = db_path or cls.DEFAULT_PATH
        os.makedirs(os.path.dirname(path), exist_ok=True)
        conn = sqlite3.connect(path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA synchronous = NORMAL")
        return conn


@contextmanager
def get_db_cursor(db_path: str = None):
    """数据库连接上下文管理器"""
    conn = DatabaseConfig.get_connection(db_path)
    try:
        cursor = conn.cursor()
        yield cursor, conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


class KnowledgeDAL:
    """知识数据访问层"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path
        self.schema_path = Path(__file__).parent / "02_database_schema.sql"
    
    def init_database(self):
        """初始化数据库"""
        with open(self.schema_path, 'r', encoding='utf-8') as f:
            schema = f.read()
        
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.executescript(schema)
        
        return True
    
    def insert_knowledge(self, item: Dict[str, Any]) -> str:
        """插入知识点"""
        item_id = item.get('id') or self._generate_id(item)
        
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("""
                INSERT INTO knowledge (
                    id, title, content, description, solution,
                    category, tags, versions, source, module,
                    related_items, priority, view_count, like_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item_id,
                item.get('title', ''),
                item.get('content', ''),
                item.get('description', ''),
                item.get('solution', ''),
                item.get('category', '未分类'),
                json.dumps(item.get('tags', []), ensure_ascii=False),
                json.dumps(item.get('versions', []), ensure_ascii=False),
                item.get('source', ''),
                item.get('module', ''),
                json.dumps(item.get('related_items', []), ensure_ascii=False),
                item.get('priority', 0),
                item.get('view_count', 0),
                item.get('like_count', 0)
            ))
        
        return item_id
    
    def batch_insert_knowledge(self, items: List[Dict[str, Any]]) -> int:
        """批量插入知识点"""
        count = 0
        with get_db_cursor(self.db_path) as (cursor, conn):
            for item in items:
                try:
                    item_id = item.get('id') or self._generate_id(item)
                    cursor.execute("""
                        INSERT OR REPLACE INTO knowledge (
                            id, title, content, description, solution,
                            category, tags, versions, source, module,
                            related_items, priority
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        item_id,
                        item.get('title', ''),
                        item.get('content', ''),
                        item.get('description', ''),
                        item.get('solution', ''),
                        item.get('category', '未分类'),
                        json.dumps(item.get('tags', []), ensure_ascii=False),
                        json.dumps(item.get('versions', []), ensure_ascii=False),
                        item.get('source', ''),
                        item.get('module', ''),
                        json.dumps(item.get('related_items', []), ensure_ascii=False),
                        item.get('priority', 0)
                    ))
                    count += 1
                except Exception as e:
                    print(f"插入失败: {e}")
                    continue
        
        return count
    
    def search_knowledge(
        self, 
        query: str, 
        category: str = None,
        version: str = None,
        limit: int = 20
    ) -> List[Dict]:
        """搜索知识点"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            sql = """
                SELECT k.*, highlight(knowledge_fts, 0, '<mark>', '</mark>') as highlighted_title,
                       highlight(knowledge_fts, 1, '<mark>', '</mark>') as highlighted_content
                FROM knowledge k
                JOIN knowledge_fts fts ON k.rowid = fts.rowid
                WHERE knowledge_fts MATCH ?
            """
            params = [query + '*']  # 前缀搜索
            
            if category:
                sql += " AND k.category = ?"
                params.append(category)
            
            if version:
                sql += " AND k.versions LIKE ?"
                params.append(f'%{version}%')
            
            sql += " ORDER BY rank LIMIT ?"
            params.append(limit)
            
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]
    
    def get_knowledge_by_id(self, item_id: str) -> Optional[Dict]:
        """获取知识点详情"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("SELECT * FROM knowledge WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            
            if row:
                return dict(row)
            return None
    
    def get_all_knowledge(self, limit: int = 1000, offset: int = 0) -> List[Dict]:
        """获取所有知识点"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute(
                "SELECT * FROM knowledge ORDER BY updated_at DESC LIMIT ? OFFSET ?",
                (limit, offset)
            )
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def update_view_count(self, item_id: str):
        """更新浏览次数"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute(
                "UPDATE knowledge SET view_count = view_count + 1 WHERE id = ?",
                (item_id,)
            )
    
    def delete_knowledge(self, item_id: str) -> bool:
        """删除知识点"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("DELETE FROM knowledge WHERE id = ?", (item_id,))
            return cursor.rowcount > 0
    
    def get_knowledge_count(self) -> int:
        """获取知识点总数"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("SELECT COUNT(*) FROM knowledge")
            return cursor.fetchone()[0]
    
    def _generate_id(self, item: Dict) -> str:
        """生成唯一ID"""
        content = f"{item.get('title', '')}{item.get('category', '')}{datetime.now().isoformat()}"
        return hashlib.md5(content.encode()).hexdigest()[:12]


class ChecklistDAL:
    """清单数据访问层"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path
    
    def insert_template(self, template: Dict[str, Any]) -> str:
        """插入清单模板"""
        template_id = template.get('id') or self._generate_id(template)
        
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("""
                INSERT INTO checklist_templates (
                    id, name, category, description, items, version_range
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                template_id,
                template.get('name', ''),
                template.get('category', ''),
                template.get('description', ''),
                json.dumps(template.get('items', []), ensure_ascii=False),
                template.get('version_range', '')
            ))
        
        return template_id
    
    def batch_insert_templates(self, templates: List[Dict[str, Any]]) -> int:
        """批量插入模板"""
        count = 0
        with get_db_cursor(self.db_path) as (cursor, conn):
            for template in templates:
                try:
                    template_id = template.get('id') or self._generate_id(template)
                    items = template.get('items', [])
                    cursor.execute("""
                        INSERT OR REPLACE INTO checklist_templates (
                            id, name, category, description, items, 
                            version_range, phase_count, total_items
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        template_id,
                        template.get('name', ''),
                        template.get('category', ''),
                        template.get('description', ''),
                        json.dumps(items, ensure_ascii=False),
                        template.get('version_range', ''),
                        len(set(item.get('phase_id') for item in items)),
                        len(items)
                    ))
                    count += 1
                except Exception as e:
                    print(f"模板插入失败: {e}")
                    continue
        
        return count
    
    def get_templates_by_category(self, category: str) -> List[Dict]:
        """按分类获取模板"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute(
                "SELECT * FROM checklist_templates WHERE category = ?",
                (category,)
            )
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def get_all_templates(self) -> List[Dict]:
        """获取所有模板"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("SELECT * FROM checklist_templates ORDER BY category")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]


class ProjectDAL:
    """项目数据访问层"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path
    
    def create_project(self, project: Dict[str, Any]) -> str:
        """创建项目"""
        project_id = project.get('id') or self._generate_id(project)
        
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("""
                INSERT INTO projects (id, name, description, version, modules, status)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                project_id,
                project.get('name', ''),
                project.get('description', ''),
                project.get('version', '2605'),
                json.dumps(project.get('modules', []), ensure_ascii=False),
                project.get('status', 'active')
            ))
            
            # 插入清单项
            items = project.get('items', [])
            for item in items:
                self._insert_checklist_item(cursor, project_id, item)
        
        return project_id
    
    def _insert_checklist_item(self, cursor, project_id: str, item: Dict):
        """插入清单项"""
        item_id = item.get('id') or hashlib.md5(
            f"{project_id}{item.get('title', '')}{datetime.now().isoformat()}".encode()
        ).hexdigest()[:12]
        
        cursor.execute("""
            INSERT INTO checklist_items (
                id, project_id, phase_id, phase_name, module_id, module_name,
                title, description, status, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_id,
            project_id,
            item.get('phase_id', ''),
            item.get('phase_name', ''),
            item.get('module_id', ''),
            item.get('module_name', ''),
            item.get('title', ''),
            item.get('description', ''),
            item.get('status', 'pending'),
            item.get('priority', 'medium')
        ))
    
    def get_project_progress(self, project_id: str) -> Dict:
        """获取项目进度"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("""
                SELECT 
                    p.*,
                    COUNT(c.id) as total_items,
                    SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_items
                FROM projects p
                LEFT JOIN checklist_items c ON p.id = c.project_id
                WHERE p.id = ?
                GROUP BY p.id
            """, (project_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_all_projects(self) -> List[Dict]:
        """获取所有项目"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            cursor.execute("""
                SELECT p.*, 
                    COUNT(c.id) as total_items,
                    SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed_items
                FROM projects p
                LEFT JOIN checklist_items c ON p.id = c.project_id
                GROUP BY p.id
                ORDER BY p.updated_at DESC
            """)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def update_item_status(self, item_id: str, status: str) -> bool:
        """更新清单项状态"""
        with get_db_cursor(self.db_path) as (cursor, conn):
            completed_at = datetime.now().isoformat() if status == 'completed' else None
            cursor.execute("""
                UPDATE checklist_items 
                SET status = ?, completed_at = ?
                WHERE id = ?
            """, (status, completed_at, item_id))
            return cursor.rowcount > 0
    
    def _generate_id(self, project: Dict) -> str:
        """生成项目ID"""
        content = f"{project.get('name', '')}{datetime.now().isoformat()}"
        return f"proj_{hashlib.md5(content.encode()).hexdigest()[:12]}"


# 导出统一的数据库访问类
class UnifiedDAL:
    """统一数据访问层"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path
        self.knowledge = KnowledgeDAL(db_path)
        self.checklist = ChecklistDAL(db_path)
        self.project = ProjectDAL(db_path)
    
    def init_all(self):
        """初始化所有表"""
        return self.knowledge.init_database()
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            'knowledge_count': self.knowledge.get_knowledge_count(),
            'templates_count': len(self.checklist.get_all_templates()),
            'projects_count': len(self.project.get_all_projects())
        }
