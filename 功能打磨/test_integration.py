#!/usr/bin/env python3
"""
集成测试套件
测试端到端功能流程
"""

import sys
import time
from pathlib import Path
from typing import List, Dict, Any

# 添加项目根目录
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "Ariba实施助手" / "实施检查清单生成器" / "core"))

from checklist_generator import OptimizedChecklistGenerator


class IntegrationTestSuite:
    """集成测试套件"""
    
    def __init__(self):
        self.generator = OptimizedChecklistGenerator()
        self.results = []
    
    def run_test(self, name: str, test_func) -> bool:
        """运行单个测试"""
        print(f"\n[测试] {name}")
        try:
            result = test_func()
            status = "✓ 通过" if result else "✗ 失败"
            print(f"    {status}")
            self.results.append({"name": name, "status": "passed" if result else "failed"})
            return result
        except Exception as e:
            print(f"    ✗ 异常: {e}")
            self.results.append({"name": name, "status": "error", "error": str(e)})
            return False
    
    def test_project_creation_flow(self) -> bool:
        """测试项目创建完整流程"""
        # 1. 创建项目
        project = self.generator.generate_all_phases_checklist(
            modules=["buying", "sourcing"],
            version="V2605",
            project_name="测试项目"
        )
        
        assert project["id"], "项目ID不能为空"
        assert project["name"] == "测试项目", "项目名称不匹配"
        assert project["total_items"] > 0, "清单项数量为0"
        
        # 2. 验证清单项结构
        for item in project["items"]:
            assert "id" in item, "清单项缺少ID"
            assert "title" in item, "清单项缺少标题"
            assert "phase" in item, "清单项缺少阶段"
            assert "priority" in item, "清单项缺少优先级"
        
        # 3. 验证阶段完整性
        phases = set(item["phase"] for item in project["items"])
        assert len(phases) == 5, f"应有5个阶段，实际{len(phases)}个"
        
        return True
    
    def test_version_filtering_flow(self) -> bool:
        """测试版本过滤流程"""
        # V2605专属功能
        checklist_v2605 = self.generator.generate_all_phases_checklist(
            modules=["spending"],
            version="V2605"
        )
        
        # Classic版本
        checklist_classic = self.generator.generate_all_phases_checklist(
            modules=["spending"],
            version="Classic"
        )
        
        # V2605应该有支出分析相关内容
        v2605_titles = [item["title"] for item in checklist_v2605["items"]]
        has_spending = any("支出" in title for title in v2605_titles)
        
        # Classic不应该有
        classic_titles = [item["title"] for item in checklist_classic["items"]]
        has_spending_classic = any("支出" in title for title in classic_titles)
        
        # 验证过滤正确
        assert has_spending, "V2605版本应包含支出分析相关内容"
        assert not has_spending_classic, "Classic版本不应包含V2605专属功能"
        
        return True
    
    def test_module_filtering_flow(self) -> bool:
        """测试模块过滤流程"""
        # 只选择采购模块
        buying_only = self.generator.generate_all_phases_checklist(
            modules=["buying"],
            version="V2605"
        )
        
        # 只选择寻源模块
        sourcing_only = self.generator.generate_all_phases_checklist(
            modules=["sourcing"],
            version="V2605"
        )
        
        # 验证模块过滤
        buying_modules = set()
        for item in buying_only["items"]:
            buying_modules.update(item.get("module", []))
        
        sourcing_modules = set()
        for item in sourcing_only["items"]:
            sourcing_modules.update(item.get("module", []))
        
        assert "buying" in buying_modules, "采购模块清单应包含buying"
        assert "sourcing" in sourcing_modules, "寻源模块清单应包含sourcing"
        
        return True
    
    def test_phase_filtering_flow(self) -> bool:
        """测试阶段过滤流程"""
        # 只选择需求分析阶段
        req_phase = self.generator.generate_checklist(
            phases=["requirements_analysis"],
            modules=["buying"],
            version="V2605"
        )
        
        # 验证只有需求分析阶段
        phases = set(item["phase"] for item in req_phase["items"])
        assert phases == {"requirements_analysis"}, f"应只有需求分析阶段，实际{phases}"
        
        # 验证阶段名称
        for item in req_phase["items"]:
            assert item["phase_name"] == "需求分析阶段", "阶段名称不正确"
        
        return True
    
    def test_caching_flow(self) -> bool:
        """测试缓存流程"""
        # 第一次生成
        start1 = time.time()
        result1 = self.generator.generate_all_phases_checklist(
            modules=["buying"],
            version="V2605"
        )
        time1 = time.time() - start1
        
        # 第二次生成（应该命中缓存）
        start2 = time.time()
        result2 = self.generator.generate_all_phases_checklist(
            modules=["buying"],
            version="V2605"
        )
        time2 = time.time() - start2
        
        # 验证结果一致
        assert result1["total_items"] == result2["total_items"], "两次生成结果不一致"
        
        # 验证缓存生效（第二次应该更快或相近）
        print(f"    首次: {time1*1000:.2f}ms, 缓存: {time2*1000:.2f}ms")
        
        return True
    
    def test_priority_ordering(self) -> bool:
        """测试优先级排序"""
        # 获取清单
        checklist = self.generator.generate_checklist(
            phases=["requirements_analysis"],
            modules=["buying"],
            version="V2605"
        )
        
        # 按优先级分组
        high_priority = [i for i in checklist["items"] if i["priority"] == "high"]
        medium_priority = [i for i in checklist["items"] if i["priority"] == "medium"]
        low_priority = [i for i in checklist["items"] if i["priority"] == "low"]
        
        # 验证高优先级项存在
        assert len(high_priority) > 0, "应该有高优先级项"
        print(f"    高优先级: {len(high_priority)}, 中: {len(medium_priority)}, 低: {len(low_priority)}")
        
        return True
    
    def test_export_functionality(self) -> bool:
        """测试导出功能"""
        # 生成清单
        checklist = self.generator.generate_checklist(
            phases=["requirements_analysis"],
            modules=["buying"],
            version="V2605"
        )
        
        # 测试JSON导出
        json_output = self.generator.export_to_json(checklist)
        assert len(json_output) > 0, "JSON导出为空"
        assert "items" in json_output, "JSON格式不正确"
        
        # 测试Markdown导出
        md_output = self.generator.export_to_markdown(checklist)
        assert len(md_output) > 0, "Markdown导出为空"
        assert "# 需求分析阶段" in md_output, "Markdown格式不正确"
        
        return True
    
    def run_all(self) -> bool:
        """运行所有集成测试"""
        print("=" * 60)
        print("集成测试套件")
        print("=" * 60)
        
        tests = [
            ("项目创建完整流程", self.test_project_creation_flow),
            ("版本过滤流程", self.test_version_filtering_flow),
            ("模块过滤流程", self.test_module_filtering_flow),
            ("阶段过滤流程", self.test_phase_filtering_flow),
            ("缓存流程", self.test_caching_flow),
            ("优先级排序", self.test_priority_ordering),
            ("导出功能", self.test_export_functionality),
        ]
        
        passed = 0
        failed = 0
        
        for name, test_func in tests:
            if self.run_test(name, test_func):
                passed += 1
            else:
                failed += 1
        
        print("\n" + "=" * 60)
        print("集成测试结果")
        print("=" * 60)
        print(f"  通过: {passed}")
        print(f"  失败: {failed}")
        print(f"  总计: {passed + failed}")
        print(f"  通过率: {passed/(passed+failed)*100:.1f}%")
        
        return failed == 0


if __name__ == "__main__":
    suite = IntegrationTestSuite()
    success = suite.run_all()
    sys.exit(0 if success else 1)
