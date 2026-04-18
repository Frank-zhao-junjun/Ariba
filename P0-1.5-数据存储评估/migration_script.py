#!/usr/bin/env python3
"""
Ariba实施助手 - 数据迁移脚本
从文件系统迁移到SQLite数据库
"""

import os
import sys
import json
import time
import shutil
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))
from 03_data_access_layer import UnifiedDAL, get_db_cursor

# 配置路径
PROJECT_ROOT = Path("/app/data/所有对话/主对话/Ariba实施助手")
KNOWLEDGE_BASE = Path("/app/data/所有对话/主对话/SAP-Ariba")
BACKUP_DIR = PROJECT_ROOT / "backup_before_migration"
DB_PATH = str(PROJECT_ROOT / "data" / "ariba_assistant.db")

class MigrationManager:
    """迁移管理器"""
    
    def __init__(self):
        self.dal = UnifiedDAL(DB_PATH)
        self.stats = {
            'start_time': None,
            'end_time': None,
            'knowledge_migrated': 0,
            'templates_migrated': 0,
            'projects_migrated': 0,
            'errors': []
        }
    
    def run_migration(self, dry_run: bool = False) -> Dict:
        """执行迁移"""
        print("=" * 60)
        print("Ariba实施助手 - 数据迁移")
        print("=" * 60)
        
        self.stats['start_time'] = datetime.now().isoformat()
        
        if dry_run:
            print("\n⚠️ 演练模式 - 不会实际执行迁移\n")
        else:
            # 1. 创建备份
            print("\n📦 步骤1: 创建数据备份...")
            self._create_backup()
            
            # 2. 初始化数据库
            print("\n🗄️ 步骤2: 初始化数据库...")
            self._init_database()
        
        # 3. 迁移知识库
        print("\n📚 步骤3: 迁移知识库...")
        self._migrate_knowledge(dry_run)
        
        # 4. 迁移清单模板
        print("\n📋 步骤4: 迁移清单模板...")
        self._migrate_templates(dry_run)
        
        # 5. 迁移项目数据
        print("\n📁 步骤5: 迁移项目数据...")
        self._migrate_projects(dry_run)
        
        # 6. 验证数据完整性
        print("\n✅ 步骤6: 验证数据完整性...")
        self._verify_data(dry_run)
        
        self.stats['end_time'] = datetime.now().isoformat()
        
        # 生成报告
        self._generate_report(dry_run)
        
        return self.stats
    
    def _create_backup(self):
        """创建数据备份"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = BACKUP_DIR / timestamp
        
        try:
            # 备份知识库
            kb_backup = backup_path / "knowledge_base"
            if KNOWLEDGE_BASE.exists():
                shutil.copytree(KNOWLEDGE_BASE, kb_backup)
                print(f"   ✅ 知识库已备份: {kb_backup}")
            
            # 备份清单生成器模板
            template_backup = backup_path / "templates"
            template_dir = PROJECT_ROOT / "实施检查清单生成器" / "template"
            if template_dir.exists():
                shutil.copytree(template_dir, template_backup)
                print(f"   ✅ 模板已备份: {template_backup}")
            
            print(f"   ✅ 备份完成: {backup_path}")
        except Exception as e:
            print(f"   ❌ 备份失败: {e}")
            self.stats['errors'].append(f"备份失败: {e}")
    
    def _init_database(self):
        """初始化数据库"""
        try:
            os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
            self.dal.init_all()
            print("   ✅ 数据库初始化完成")
        except Exception as e:
            print(f"   ❌ 数据库初始化失败: {e}")
            self.stats['errors'].append(f"数据库初始化失败: {e}")
            raise
    
    def _migrate_knowledge(self, dry_run: bool):
        """迁移知识库"""
        kb_files = list(KNOWLEDGE_BASE.rglob("*.md"))
        kb_files = [f for f in kb_files if "scripts" not in str(f) and f.stat().st_size > 100]
        
        print(f"   发现 {len(kb_files)} 个知识文件")
        
        if dry_run:
            print(f"   演练模式: 将迁移 {len(kb_files)} 个文件")
            self.stats['knowledge_migrated'] = len(kb_files)
            return
        
        # 解析并批量迁移
        batch_size = 100
        for i in range(0, len(kb_files), batch_size):
            batch = kb_files[i:i+batch_size]
            items = []
            
            for f in batch:
                try:
                    item = self._parse_knowledge_file(f)
                    if item:
                        items.append(item)
                except Exception as e:
                    self.stats['errors'].append(f"解析失败 {f}: {e}")
                    continue
            
            if items:
                count = self.dal.knowledge.batch_insert_knowledge(items)
                self.stats['knowledge_migrated'] += count
                print(f"   已迁移 {self.stats['knowledge_migrated']}/{len(kb_files)}")
        
        # 重建全文搜索索引
        self._rebuild_fts_index()
    
    def _parse_knowledge_file(self, file_path: Path) -> Dict:
        """解析知识文件"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取元信息
        category = file_path.parent.name
        if category == "SAP-Ariba":
            category = file_path.stem
        
        # 简单解析标题（假设第一个#开头的是标题）
        lines = content.split('\n')
        title = file_path.stem
        for line in lines:
            if line.startswith('# '):
                title = line[2:].strip()
                break
        
        return {
            'id': file_path.stem[:50],  # 确保ID长度合适
            'title': title,
            'content': content,
            'description': content[:500] if len(content) > 500 else content,
            'category': category,
            'tags': self._extract_tags(content),
            'versions': self._extract_versions(content),
            'source': 'file_migration'
        }
    
    def _extract_tags(self, content: str) -> List[str]:
        """提取标签"""
        import re
        tags = re.findall(r'#(\w+)', content)
        return list(set(tags))[:10]  # 最多10个标签
    
    def _extract_versions(self, content: str) -> List[str]:
        """提取版本号"""
        import re
        versions = re.findall(r'\b2\d{3}\b', content)
        return list(set(versions))[:5]  # 最多5个版本
    
    def _rebuild_fts_index(self):
        """重建全文搜索索引"""
        try:
            with get_db_cursor(DB_PATH) as (cursor, conn):
                # 清空现有索引
                cursor.execute("DELETE FROM knowledge_fts")
                
                # 重新构建索引
                cursor.execute("""
                    INSERT INTO knowledge_fts(rowid, title, content, description, solution, tags)
                    SELECT rowid, title, content, description, solution, tags FROM knowledge
                """)
                
                print("   ✅ 全文搜索索引已重建")
        except Exception as e:
            print(f"   ⚠️ 索引重建失败: {e}")
            self.stats['errors'].append(f"索引重建失败: {e}")
    
    def _migrate_templates(self, dry_run: bool):
        """迁移清单模板"""
        template_dir = PROJECT_ROOT / "实施检查清单生成器" / "template"
        
        if not template_dir.exists():
            print("   ⚠️ 模板目录不存在，跳过")
            return
        
        template_files = list(template_dir.rglob("*.json"))
        print(f"   发现 {len(template_files)} 个模板文件")
        
        if dry_run:
            self.stats['templates_migrated'] = len(template_files)
            return
        
        # 迁移模板
        for tf in template_files:
            try:
                with open(tf, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                templates = data if isinstance(data, list) else [data]
                count = self.dal.checklist.batch_insert_templates(templates)
                self.stats['templates_migrated'] += count
            except Exception as e:
                self.stats['errors'].append(f"模板迁移失败 {tf}: {e}")
        
        print(f"   ✅ 已迁移 {self.stats['templates_migrated']} 个模板")
    
    def _migrate_projects(self, dry_run: bool):
        """迁移项目数据"""
        # 检查现有项目数据
        project_data_dir = PROJECT_ROOT / "实施检查清单生成器" / "backup_storage"
        
        if not project_data_dir.exists():
            print("   ⚠️ 项目数据目录不存在，跳过")
            return
        
        print(f"   ✅ 项目数据结构已准备就绪")
        self.stats['projects_migrated'] = 0  # 当前项目数据在内存中
    
    def _verify_data(self, dry_run: bool):
        """验证数据完整性"""
        if dry_run:
            return
        
        try:
            stats = self.dal.get_stats()
            print(f"\n   📊 数据统计:")
            print(f"   - 知识点: {stats['knowledge_count']}")
            print(f"   - 模板: {stats['templates_count']}")
            print(f"   - 项目: {stats['projects_count']}")
            
            # 抽样验证
            samples = self.dal.knowledge.get_all_knowledge(limit=3)
            if samples:
                print(f"\n   📝 抽样验证:")
                for s in samples:
                    print(f"   - [{s['id'][:8]}] {s['title'][:40]}...")
        except Exception as e:
            print(f"   ❌ 验证失败: {e}")
            self.stats['errors'].append(f"验证失败: {e}")
    
    def _generate_report(self, dry_run: bool):
        """生成迁移报告"""
        report = f"""# 数据迁移报告

> 迁移时间: {self.stats['start_time']} - {self.stats['end_time']}
> 模式: {"演练" if dry_run else "实际迁移"}

## 迁移统计

| 类型 | 数量 |
|------|------|
| 知识点 | {self.stats['knowledge_migrated']} |
| 模板 | {self.stats['templates_migrated']} |
| 项目 | {self.stats['projects_migrated']} |

## 错误记录

"""
        if self.stats['errors']:
            for err in self.stats['errors'][:10]:  # 只显示前10个错误
                report += f"- {err}\n"
        else:
            report += "无错误记录 ✅\n"
        
        report += f"""
## 数据库位置

```
{DB_PATH}
```

## 备份位置

```
{BACKUP_DIR}
```

"""
        report_path = PROJECT_ROOT / "P0-1.5-数据存储评估" / "迁移报告.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n📄 报告已保存: {report_path}")


def rollback():
    """回滚迁移"""
    print("\n⚠️ 回滚功能需要手动执行:")
    print(f"1. 删除数据库: rm {DB_PATH}")
    print(f"2. 从 {BACKUP_DIR} 恢复数据")
    print("3. 恢复文件存储模式")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="数据迁移工具")
    parser.add_argument("--dry-run", action="store_true", help="演练模式")
    parser.add_argument("--rollback", action="store_true", help="回滚")
    args = parser.parse_args()
    
    if args.rollback:
        rollback()
    else:
        manager = MigrationManager()
        stats = manager.run_migration(dry_run=args.dry_run)
        
        print("\n" + "=" * 60)
        print("迁移完成!")
        print("=" * 60)
        print(f"\n知识点: {stats['knowledge_migrated']}")
        print(f"模板: {stats['templates_migrated']}")
        print(f"错误: {len(stats['errors'])}")
