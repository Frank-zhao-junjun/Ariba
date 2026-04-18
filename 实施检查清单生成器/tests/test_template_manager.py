"""
实施检查清单生成器 - US3 单元测试
测试模板管理器功能
"""

import unittest
import sys
import os
import tempfile
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from template.template_manager import TemplateManager


class TestTemplateManager(unittest.TestCase):
    """测试模板管理器"""
    
    def setUp(self):
        """测试前准备"""
        self.manager = TemplateManager()
    
    def test_manager_initialization(self):
        """测试管理器初始化"""
        self.assertIsNotNone(self.manager)
        self.assertIsNotNone(self.manager.templates)
        self.assertGreaterEqual(len(self.manager.templates), 5)  # 至少5个内置模板
    
    def test_get_all_templates(self):
        """测试获取所有模板"""
        templates = self.manager.get_all_templates()
        
        self.assertIsInstance(templates, list)
        self.assertGreater(len(templates), 0)
        
        for tmpl in templates:
            self.assertIn("id", tmpl)
            self.assertIn("name", tmpl)
            self.assertIn("description", tmpl)
    
    def test_get_template(self):
        """测试获取单个模板"""
        templates = self.manager.get_all_templates()
        template_id = templates[0]["id"]
        
        template = self.manager.get_template(template_id)
        
        self.assertIsNotNone(template)
        self.assertEqual(template["id"], template_id)
    
    def test_get_nonexistent_template(self):
        """测试获取不存在的模板"""
        template = self.manager.get_template("nonexistent-id")
        self.assertIsNone(template)
    
    def test_create_template(self):
        """测试创建模板"""
        new_template = self.manager.create_template(
            name="测试模板",
            description="这是一个测试模板",
            applicable_phases=["requirements_analysis"],
            applicable_modules=["buying"],
            tags=["测试"]
        )
        
        self.assertIsNotNone(new_template)
        self.assertTrue(new_template["id"].startswith("tmpl-"))
        self.assertEqual(new_template["name"], "测试模板")
        self.assertFalse(new_template["is_builtin"])
        self.assertEqual(new_template["usage_count"], 0)
    
    def test_update_template(self):
        """测试更新模板"""
        # 先创建一个模板
        new_template = self.manager.create_template(
            name="待更新模板",
            description="更新前描述",
            applicable_phases=["requirements_analysis"],
            applicable_modules=["buying"]
        )
        
        # 更新
        updated = self.manager.update_template(
            new_template["id"],
            name="已更新模板",
            description="更新后描述"
        )
        
        self.assertIsNotNone(updated)
        self.assertEqual(updated["name"], "已更新模板")
        self.assertEqual(updated["description"], "更新后描述")
    
    def test_cannot_delete_builtin_template(self):
        """测试不能删除内置模板"""
        templates = self.manager.get_all_templates()
        builtin = next((t for t in templates if t["is_builtin"]), None)
        
        if builtin:
            result = self.manager.delete_template(builtin["id"])
            self.assertFalse(result)
    
    def test_delete_custom_template(self):
        """测试删除自定义模板"""
        # 创建自定义模板
        new_template = self.manager.create_template(
            name="可删除模板",
            description="可以删除",
            applicable_phases=["requirements_analysis"],
            applicable_modules=["buying"]
        )
        
        # 删除
        result = self.manager.delete_template(new_template["id"])
        self.assertTrue(result)
        
        # 验证已删除
        self.assertIsNone(self.manager.get_template(new_template["id"]))
    
    def test_duplicate_template(self):
        """测试复制模板"""
        templates = self.manager.get_all_templates()
        template_id = templates[0]["id"]
        
        duplicate = self.manager.duplicate_template(
            template_id,
            new_name="复制的模板"
        )
        
        self.assertIsNotNone(duplicate)
        self.assertEqual(duplicate["name"], "复制的模板")
        self.assertNotEqual(duplicate["id"], template_id)
    
    def test_increment_usage(self):
        """测试增加使用次数"""
        templates = self.manager.get_all_templates()
        template_id = templates[0]["id"]
        
        initial_count = templates[0]["usage_count"]
        
        self.manager.increment_usage(template_id)
        
        updated = self.manager.get_template(template_id)
        self.assertEqual(updated["usage_count"], initial_count + 1)
    
    def test_export_template(self):
        """测试导出模板"""
        templates = self.manager.get_all_templates()
        template_id = templates[0]["id"]
        
        json_export = self.manager.export_template(template_id, "json")
        self.assertIsInstance(json_export, str)
        
        # 验证是有效JSON
        parsed = json.loads(json_export)
        self.assertEqual(parsed["id"], template_id)
    
    def test_export_template_yaml(self):
        """测试YAML导出"""
        templates = self.manager.get_all_templates()
        template_id = templates[0]["id"]
        
        yaml_export = self.manager.export_template(template_id, "yaml")
        self.assertIsInstance(yaml_export, str)
        self.assertIn("id:", yaml_export)
    
    def test_import_template(self):
        """测试导入模板"""
        templates = self.manager.get_all_templates()
        template = templates[0]
        
        # 导出
        export = self.manager.export_template(template["id"])
        
        # 修改ID以避免冲突
        template_copy = json.loads(export)
        template_copy["id"] = "tmpl-imported-001"
        
        # 导入
        imported = self.manager.import_template(
            json.dumps(template_copy),
            overwrite=False
        )
        
        self.assertIsNotNone(imported)
        self.assertEqual(imported["name"], template["name"])
    
    def test_search_templates_by_query(self):
        """测试关键词搜索"""
        results = self.manager.search_templates(query="标准")
        
        self.assertIsInstance(results, list)
        for tmpl in results:
            self.assertTrue(
                "标准" in tmpl["name"] or
                "标准" in tmpl["description"] or
                any("标准" in tag for tag in tmpl.get("tags", []))
            )
    
    def test_search_templates_by_tags(self):
        """测试标签搜索"""
        results = self.manager.search_templates(tags=["SME", "简化"])
        
        self.assertIsInstance(results, list)
        for tmpl in results:
            self.assertTrue(
                any(tag in ["SME", "简化"] for tag in tmpl.get("tags", []))
            )
    
    def test_search_templates_by_modules(self):
        """测试模块搜索"""
        results = self.manager.search_templates(modules=["buying"])
        
        self.assertIsInstance(results, list)
        for tmpl in results:
            self.assertIn("buying", tmpl["applicable_modules"])
    
    def test_search_templates_by_phases(self):
        """测试阶段搜索"""
        results = self.manager.search_templates(phases=["requirements_analysis"])
        
        self.assertIsInstance(results, list)
        for tmpl in results:
            self.assertIn("requirements_analysis", tmpl["applicable_phases"])
    
    def test_get_template_stats(self):
        """测试获取模板统计"""
        stats = self.manager.get_template_stats()
        
        self.assertIn("total_templates", stats)
        self.assertIn("builtin_templates", stats)
        self.assertIn("custom_templates", stats)
        self.assertIn("total_usage", stats)
        
        self.assertEqual(
            stats["total_templates"],
            stats["builtin_templates"] + stats["custom_templates"]
        )


class TestBuiltinTemplates(unittest.TestCase):
    """测试内置模板"""
    
    def test_builtin_templates_exist(self):
        """测试内置模板存在"""
        manager = TemplateManager()
        
        expected_templates = [
            "standard_implementation",
            "quick_implementation",
            "complex_integration",
            "sme_template",
            "manufacturing_industry"
        ]
        
        for tmpl_key in expected_templates:
            self.assertIn(tmpl_key, manager.templates)
            self.assertTrue(manager.templates[tmpl_key]["is_builtin"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
