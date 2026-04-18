#!/usr/bin/env python3
"""
Ariba实施助手 - 存储适配器
支持文件存储和数据库存储的透明切换
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod

# 导入数据库层
sys.path.insert(0, str(Path(__file__).parent))
from 03_data_access_layer import UnifiedDAL


# ============================================================
# 存储接口定义
# ============================================================

class StorageBackend(ABC):
    """存储后端抽象接口"""
    
    @abstractmethod
    def get_knowledge(self, query: str, limit: int = 10) -> List[Dict]:
        """搜索知识"""
        pass
    
    @abstractmethod
    def get_knowledge_by_id(self, item_id: str) -> Optional[Dict]:
        """获取知识详情"""
        pass
    
    @abstractmethod
    def get_templates(self, category: str = None) -> List[Dict]:
        """获取模板"""
        pass
    
    @abstractmethod
    def get_projects(self) -> List[Dict]:
        """获取项目列表"""
        pass
    
    @abstractmethod
    def get_stats(self) -> Dict:
        """获取统计信息"""
        pass


# ============================================================
# 文件存储实现
# ============================================================

class FileStorageBackend(StorageBackend):
    """文件存储后端"""
    
    def __init__(self, knowledge_base_path: str = None):
        self.knowledge_base = Path(knowledge_base_path or "/app/data/所有对话/主对话/SAP-Ariba")
        self._cache = {}
        self._cache_loaded = False
    
    def _ensure_cache(self):
        """确保缓存已加载"""
        if not self._cache_loaded:
            self._load_cache()
    
    def _load_cache(self):
        """加载知识库到缓存"""
        kb_files = list(self.knowledge_base.rglob("*.md"))
        kb_files = [f for f in kb_files if "scripts" not in str(f)]
        
        for f in kb_files:
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    content = file.read()
                    self._cache[str(f)] = {
                        'id': f.stem,
                        'path': str(f),
                        'title': self._extract_title(content, f.stem),
                        'content': content,
                        'category': f.parent.name,
                        'content_lower': content.lower()
                    }
            except:
                continue
        
        self._cache_loaded = True
    
    def _extract_title(self, content: str, default: str) -> str:
        """提取标题"""
        lines = content.split('\n')
        for line in lines:
            if line.startswith('# '):
                return line[2:].strip()
        return default
    
    def get_knowledge(self, query: str, limit: int = 10) -> List[Dict]:
        """搜索知识"""
        self._ensure_cache()
        
        query_lower = query.lower()
        results = []
        
        for item in self._cache.values():
            if query_lower in item.get('content_lower', ''):
                score = item['content_lower'].count(query_lower)
                results.append({
                    'id': item['id'],
                    'title': item['title'],
                    'description': item['content'][:200],
                    'category': item['category'],
                    'score': score,
                    'source': 'file'
                })
        
        results.sort(key=lambda x: -x['score'])
        return results[:limit]
    
    def get_knowledge_by_id(self, item_id: str) -> Optional[Dict]:
        """获取知识详情"""
        self._ensure_cache()
        
        for item in self._cache.values():
            if item['id'] == item_id:
                return {
                    'id': item['id'],
                    'title': item['title'],
                    'content': item['content'],
                    'category': item['category'],
                    'source': 'file'
                }
        return None
    
    def get_templates(self, category: str = None) -> List[Dict]:
        """获取模板"""
        template_dir = Path("/app/data/所有对话/主对话/Ariba实施助手/实施检查清单生成器/template")
        
        if not template_dir.exists():
            return []
        
        templates = []
        for f in template_dir.rglob("*.json"):
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    templates.extend(data if isinstance(data, list) else [data])
            except:
                continue
        
        if category:
            templates = [t for t in templates if t.get('category') == category]
        
        return templates
    
    def get_projects(self) -> List[Dict]:
        """获取项目列表"""
        return []  # 文件模式下项目在内存中
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        self._ensure_cache()
        
        categories = {}
        for item in self._cache.values():
            cat = item.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1
        
        return {
            'knowledge_count': len(self._cache),
            'categories': categories,
            'storage_type': 'file'
        }


# ============================================================
# 数据库存储实现
# ============================================================

class DatabaseStorageBackend(StorageBackend):
    """数据库存储后端"""
    
    def __init__(self, db_path: str = None):
        self.dal = UnifiedDAL(db_path)
        self.db_path = db_path
    
    def _ensure_db_exists(self):
        """确保数据库存在"""
        if not os.path.exists(self.db_path):
            self.dal.init_all()
    
    def get_knowledge(self, query: str, limit: int = 10) -> List[Dict]:
        """搜索知识"""
        self._ensure_db_exists()
        
        results = self.dal.knowledge.search_knowledge(query, limit=limit)
        
        return [{
            'id': r['id'],
            'title': r['title'],
            'description': r.get('description', '')[:200],
            'category': r['category'],
            'score': 1.0,
            'source': 'database'
        } for r in results]
    
    def get_knowledge_by_id(self, item_id: str) -> Optional[Dict]:
        """获取知识详情"""
        self._ensure_db_exists()
        
        item = self.dal.knowledge.get_knowledge_by_id(item_id)
        
        if item:
            item['source'] = 'database'
            # 更新浏览次数
            self.dal.knowledge.update_view_count(item_id)
        
        return item
    
    def get_templates(self, category: str = None) -> List[Dict]:
        """获取模板"""
        self._ensure_db_exists()
        
        if category:
            return self.dal.checklist.get_templates_by_category(category)
        return self.dal.checklist.get_all_templates()
    
    def get_projects(self) -> List[Dict]:
        """获取项目列表"""
        self._ensure_db_exists()
        return self.dal.project.get_all_projects()
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        self._ensure_db_exists()
        
        stats = self.dal.get_stats()
        stats['storage_type'] = 'database'
        return stats


# ============================================================
# 统一存储工厂
# ============================================================

class StorageFactory:
    """存储工厂"""
    
    _instances = {}
    
    @classmethod
    def get_backend(cls, backend_type: str = None, **kwargs) -> StorageBackend:
        """
        获取存储后端
        
        Args:
            backend_type: 'file', 'database', 或 None (自动选择)
            **kwargs: 传递给后端的参数
        """
        if backend_type is None:
            backend_type = cls._auto_select()
        
        if backend_type not in cls._instances:
            if backend_type == 'file':
                cls._instances[backend_type] = FileStorageBackend(**kwargs)
            elif backend_type == 'database':
                cls._instances[backend_type] = DatabaseStorageBackend(**kwargs)
            else:
                raise ValueError(f"不支持的存储类型: {backend_type}")
        
        return cls._instances[backend_type]
    
    @classmethod
    def _auto_select(cls) -> str:
        """自动选择存储后端"""
        db_path = "/app/data/所有对话/主对话/Ariba实施助手/data/ariba_assistant.db"
        
        # 如果数据库存在且有数据，选择数据库
        if os.path.exists(db_path):
            try:
                import sqlite3
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM knowledge")
                count = cursor.fetchone()[0]
                conn.close()
                
                if count > 100:  # 有足够数据
                    return 'database'
            except:
                pass
        
        return 'file'
    
    @classmethod
    def switch_backend(cls, backend_type: str):
        """切换存储后端"""
        cls._instances.clear()
        return cls.get_backend(backend_type)


# ============================================================
# 使用示例
# ============================================================

if __name__ == "__main__":
    # 获取当前最佳后端
    backend = StorageFactory.get_backend()
    print(f"当前存储类型: {backend.get_stats()['storage_type']}")
    
    # 切换到文件存储
    file_backend = StorageFactory.get_backend('file')
    print(f"文件存储统计: {file_backend.get_stats()}")
    
    # 切换到数据库
    db_backend = StorageFactory.get_backend('database')
    print(f"数据库统计: {db_backend.get_stats()}")
    
    # 测试搜索
    results = backend.get_knowledge("配置")
    print(f"\n搜索'配置'结果: {len(results)} 条")
