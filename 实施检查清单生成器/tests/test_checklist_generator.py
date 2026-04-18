"""
实施检查清单生成器 - US1 单元测试
测试基础清单生成功能
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.checklist_generator import (
    ChecklistGenerator,
    ProjectPhase,
    AribaModule
)


class TestChecklistGenerator(unittest.TestCase):
    """测试检查清单生成器"""
    
    def setUp(self):
        """测试前准备"""
        self.generator = ChecklistGenerator()
    
    def test_generator_initialization(self):
        """测试生成器初始化"""
        self.assertIsNotNone(self.generator)
        self.assertIsNotNone(self.generator.checklist_templates)
        self.assertEqual(len(self.generator.checklist_templates), 5)  # 5个阶段
    
    def test_generate_checklist_basic(self):
        """测试基本清单生成"""
        checklist = self.generator.generate_checklist(
            phases=[ProjectPhase.REQUIREMENTS_ANALYSIS.value],
            modules=[AribaModule.SOURCING.value, AribaModule.BUYING.value],
            version="V2605",
            project_name="测试项目"
        )
        
        self.assertIsNotNone(checklist)
        self.assertEqual(checklist["name"], "测试项目")
        self.assertEqual(checklist["version"], "V2605")
        self.assertEqual(len(checklist["phases"]), 1)
        self.assertEqual(len(checklist["modules"]), 2)
        self.assertGreater(checklist["total_items"], 0)
    
    def test_generate_all_phases_checklist(self):
        """测试生成所有阶段清单"""
        checklist = self.generator.generate_all_phases_checklist(
            modules=["sourcing", "buying", "supplier"],
            version="V2605"
        )
        
        self.assertEqual(len(checklist["phases"]), 5)
        self.assertGreater(checklist["total_items"], 20)
    
    def test_version_filtering(self):
        """测试版本过滤"""
        # VNextGen特有项
        checklist_nextgen = self.generator.generate_checklist(
            phases=[ProjectPhase.SYSTEM_CONFIGURATION.value],
            modules=["sourcing", "buying"],
            version="VNextGen"
        )
        
        # V2605不应有NextGen特有项
        checklist_v2605 = self.generator.generate_checklist(
            phases=[ProjectPhase.SYSTEM_CONFIGURATION.value],
            modules=["sourcing", "buying"],
            version="V2605"
        )
        
        # NextGen版本应该有更多项
        self.assertGreaterEqual(
            checklist_nextgen["total_items"],
            checklist_v2605["total_items"]
        )
    
    def test_module_filtering(self):
        """测试模块过滤"""
        # 只选spending模块
        checklist = self.generator.generate_checklist(
            phases=[ProjectPhase.REQUIREMENTS_ANALYSIS.value],
            modules=["spending"],
            version="V2605"
        )
        
        # 所有项都应该包含spending模块
        for item in checklist["items"]:
            self.assertIn("spending", item["module"])
    
    def test_export_to_markdown(self):
        """测试Markdown导出"""
        checklist = self.generator.generate_checklist(
            phases=[ProjectPhase.REQUIREMENTS_ANALYSIS.value],
            modules=["buying"],
            version="V2605"
        )
        
        md_output = self.generator.export_to_markdown(checklist)
        
        self.assertIsInstance(md_output, str)
        self.assertIn("#", md_output)
        self.assertIn(checklist["name"], md_output)
        self.assertIn("优先级", md_output)
    
    def test_export_to_json(self):
        """测试JSON导出"""
        checklist = self.generator.generate_checklist(
            phases=[ProjectPhase.REQUIREMENTS_ANALYSIS.value],
            modules=["buying"],
            version="V2605"
        )
        
        json_output = self.generator.export_to_json(checklist)
        
        self.assertIsInstance(json_output, str)
        # 验证是有效JSON
        import json
        parsed = json.loads(json_output)
        self.assertEqual(parsed["id"], checklist["id"])
    
    def test_save_and_load(self):
        """测试文件保存和加载"""
        import tempfile
        import os
        
        checklist = self.generator.generate_checklist(
            phases=[ProjectPhase.REQUIREMENTS_ANALYSIS.value],
            modules=["buying"],
            version="V2605"
        )
        
        # 保存
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_path = f.name
        
        try:
            self.generator.save_to_file(checklist, temp_path, "json")
            
            # 加载
            loaded = self.generator.load_from_file(temp_path)
            
            self.assertEqual(loaded["id"], checklist["id"])
            self.assertEqual(loaded["name"], checklist["name"])
            self.assertEqual(loaded["total_items"], checklist["total_items"])
        finally:
            os.unlink(temp_path)


class TestProjectPhases(unittest.TestCase):
    """测试项目阶段枚举"""
    
    def test_phase_values(self):
        """测试阶段枚举值"""
        self.assertEqual(ProjectPhase.REQUIREMENTS_ANALYSIS.value, "requirements_analysis")
        self.assertEqual(ProjectPhase.SYSTEM_CONFIGURATION.value, "system_configuration")
        self.assertEqual(ProjectPhase.DATA_MIGRATION.value, "data_migration")
        self.assertEqual(ProjectPhase.USER_TRAINING.value, "user_training")
        self.assertEqual(ProjectPhase.GO_LIVE_SUPPORT.value, "go_live_support")
    
    def test_all_phases_covered(self):
        """测试所有阶段都有清单模板"""
        generator = ChecklistGenerator()
        for phase in ProjectPhase:
            self.assertIn(phase.value, generator.checklist_templates)


class TestAribaModules(unittest.TestCase):
    """测试Ariba模块枚举"""
    
    def test_module_values(self):
        """测试模块枚举值"""
        self.assertEqual(AribaModule.SOURCING.value, "sourcing")
        self.assertEqual(AribaModule.CONTRACT.value, "contract")
        self.assertEqual(AribaModule.BUYING.value, "buying")
        self.assertEqual(AribaModule.SUPPLIER.value, "supplier")
        self.assertEqual(AribaModule.SPENDING.value, "spending")


if __name__ == "__main__":
    unittest.main(verbosity=2)
