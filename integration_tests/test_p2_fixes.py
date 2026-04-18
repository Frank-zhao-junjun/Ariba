#!/usr/bin/env python3
"""
P2缺陷修复验证测试
验证DEF-TC3.3和DEF-TC6.2的修复效果
"""

import sys
import json
import time
import traceback
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

# 路径配置
BASE_DIR = Path(__file__).parent.parent
CHECKLIST_DIR = BASE_DIR / "实施检查清单生成器"
SHARED_DIR = BASE_DIR / "shared"

# 测试结果
test_results = {
    "timestamp": datetime.now().isoformat(),
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}


def log_result(name: str, status: str, details: str = ""):
    """记录测试结果"""
    test_results["total"] += 1
    if status == "PASS":
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
    
    test_results["tests"].append({
        "name": name,
        "status": status,
        "details": details
    })
    
    symbol = "✅" if status == "PASS" else "❌"
    print(f"  {symbol} {name}: {status}")
    if details:
        print(f"     {details}")


def test_def_tc33_recommendation_engine_params():
    """测试DEF-TC3.3：推荐引擎参数类型匹配"""
    print("\n" + "="*60)
    print("测试DEF-TC3.3：推荐引擎参数类型匹配")
    print("="*60)
    
    try:
        # 动态导入推荐引擎
        sys.path.insert(0, str(CHECKLIST_DIR / "recommendation"))
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "recommendation_engine",
            CHECKLIST_DIR / "recommendation" / "recommendation_engine.py"
        )
        rec_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(rec_mod)
        
        engine = rec_mod.RecommendationEngine()
        
        # 测试数据
        profile = {
            "company_size": {"value": "large_enterprise"},
            "industry": {"value": "manufacturing"},
            "integration": {"value": "level_3"}
        }
        
        # 测试1：使用新参数名调用
        try:
            result = engine.recommend_checklist_items(
                profile=profile,
                existing_items=[]
            )
            log_result("新参数名调用(profile=, existing_items=)", "PASS",
                      f"推荐{len(result.get('recommended_additions', []))}项")
        except TypeError as e:
            log_result("新参数名调用(profile=, existing_items=)", "FAIL", str(e))
            return False
        
        # 测试2：使用旧参数名调用（向后兼容）
        try:
            result = engine.recommend_checklist_items(
                project_profile=profile,
                base_checklist=[]
            )
            log_result("旧参数名调用(project_profile=, base_checklist=)", "PASS",
                      f"推荐{len(result.get('recommended_additions', []))}项")
        except TypeError as e:
            log_result("旧参数名调用(project_profile=, base_checklist=)", "FAIL", str(e))
            return False
        
        # 测试3：位置参数调用
        try:
            result = engine.recommend_checklist_items(profile, [])
            log_result("位置参数调用", "PASS",
                      f"推荐{len(result.get('recommended_additions', []))}项")
        except TypeError as e:
            log_result("位置参数调用", "FAIL", str(e))
            return False
        
        # 测试4：空参数防御
        try:
            result = engine.recommend_checklist_items()
            log_result("空参数防御", "PASS", "正确处理空参数")
        except Exception as e:
            log_result("空参数防御", "FAIL", str(e))
            return False
        
        return True
        
    except Exception as e:
        print(f"  ❌ 测试失败: {str(e)}")
        traceback.print_exc()
        return False


def test_def_tc62_version_tag_consistency():
    """测试DEF-TC6.2：版本标签格式一致性"""
    print("\n" + "="*60)
    print("测试DEF-TC6.2：版本标签格式一致性")
    print("="*60)
    
    all_passed = True
    
    try:
        # 导入共享版本工具
        sys.path.insert(0, str(SHARED_DIR))
        from version_utils import normalize_version, SUPPORTED_VERSIONS
        
        # 测试1：验证共享工具存在
        if SHARED_DIR.exists():
            log_result("共享版本工具存在", "PASS", f"路径: {SHARED_DIR}")
        else:
            log_result("共享版本工具存在", "FAIL", f"路径不存在: {SHARED_DIR}")
            all_passed = False
        
        # 测试2：验证统一版本格式
        test_cases = [
            ("V2605", "#V2605"),
            ("#V2605", "#V2605"),
            ("v2605", "#V2605"),
            ("2605", "#V2605"),
            ("VNextGen", "#VNEXTGEN"),
            ("Classic", "#VCLASSIC"),
        ]
        
        for input_ver, expected in test_cases:
            result = normalize_version(input_ver)
            if result == expected:
                log_result(f"规范化'{input_ver}'", "PASS", f"→ {result}")
            else:
                log_result(f"规范化'{input_ver}'", "FAIL", f"期望{expected}，实际{result}")
                all_passed = False
        
        # 测试3：验证清单生成器使用统一格式
        try:
            sys.path.insert(0, str(CHECKLIST_DIR / "core"))
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "checklist_generator",
                CHECKLIST_DIR / "core" / "checklist_generator.py"
            )
            cg_mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(cg_mod)
            
            cg = cg_mod.ChecklistGenerator()
            versions = cg.SUPPORTED_VERSIONS
            
            # 检查是否都使用#V格式
            all_hashed = all(v.startswith("#V") for v in versions)
            if all_hashed:
                log_result("清单生成器版本格式统一", "PASS", f"所有版本: {versions}")
            else:
                log_result("清单生成器版本格式统一", "FAIL", f"发现问题: {versions}")
                all_passed = False
                
        except Exception as e:
            log_result("清单生成器版本格式检查", "FAIL", str(e))
            all_passed = False
        
        # 测试4：验证版本过滤功能兼容新旧格式
        try:
            sys.path.insert(0, str(CHECKLIST_DIR / "core"))
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "checklist_generator",
                CHECKLIST_DIR / "core" / "checklist_generator.py"
            )
            cg_mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(cg_mod)
            
            cg = cg_mod.ChecklistGenerator()
            
            # 使用V2605格式生成
            checklist1 = cg.generate_checklist(
                phases=["requirements_analysis"],
                modules=["sourcing"],
                version="V2605"
            )
            
            # 使用#V2605格式生成
            checklist2 = cg.generate_checklist(
                phases=["requirements_analysis"],
                modules=["sourcing"],
                version="#V2605"
            )
            
            if checklist1["total_items"] == checklist2["total_items"] and checklist1["total_items"] > 0:
                log_result("版本过滤格式兼容", "PASS",
                          f"两种格式均生成{checklist1['total_items']}项")
            else:
                log_result("版本过滤格式兼容", "FAIL",
                          f"V2605:{checklist1['total_items']}项, #V2605:{checklist2['total_items']}项")
                all_passed = False
                
        except Exception as e:
            log_result("版本过滤格式兼容测试", "FAIL", str(e))
            all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"  ❌ 测试失败: {str(e)}")
        traceback.print_exc()
        return False


def test_regression_integration():
    """回归测试：确保修复不影响其他功能"""
    print("\n" + "="*60)
    print("回归测试：功能完整性检查")
    print("="*60)
    
    all_passed = True
    
    try:
        # 测试清单生成器基础功能
        sys.path.insert(0, str(CHECKLIST_DIR / "core"))
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "checklist_generator",
            CHECKLIST_DIR / "core" / "checklist_generator.py"
        )
        cg_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cg_mod)
        
        cg = cg_mod.ChecklistGenerator()
        
        # 测试各版本生成
        for version in ["V2505", "V2602", "V2604", "V2605"]:
            try:
                checklist = cg.generate_checklist(
                    phases=["requirements_analysis"],
                    modules=["sourcing"],
                    version=version
                )
                if checklist["total_items"] > 0:
                    log_result(f"版本{version}清单生成", "PASS",
                              f"生成{checklist['total_items']}项")
                else:
                    log_result(f"版本{version}清单生成", "FAIL", "生成0项")
                    all_passed = False
            except Exception as e:
                log_result(f"版本{version}清单生成", "FAIL", str(e))
                all_passed = False
        
        # 测试推荐引擎基础功能
        sys.path.insert(0, str(CHECKLIST_DIR / "recommendation"))
        spec = importlib.util.spec_from_file_location(
            "recommendation_engine",
            CHECKLIST_DIR / "recommendation" / "recommendation_engine.py"
        )
        rec_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(rec_mod)
        
        engine = rec_mod.RecommendationEngine()
        
        # 测试项目特征分析
        try:
            profile = engine.analyze_project_profile(
                company_size="large_enterprise",
                industry="manufacturing",
                existing_systems=["SAP S/4HANA"],
                integration_level="level_3"
            )
            if profile and "company_size" in profile:
                log_result("项目特征分析", "PASS", "功能正常")
            else:
                log_result("项目特征分析", "FAIL", "返回异常")
                all_passed = False
        except Exception as e:
            log_result("项目特征分析", "FAIL", str(e))
            all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"  ❌ 测试失败: {str(e)}")
        traceback.print_exc()
        return False


def main():
    """主函数"""
    print("="*60)
    print("  P2缺陷修复验证测试")
    print(f"  时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # 执行测试
    test_def_tc33_recommendation_engine_params()
    test_def_tc62_version_tag_consistency()
    test_regression_integration()
    
    # 输出总结
    print("\n" + "="*60)
    print("  测试总结")
    print("="*60)
    
    passed = test_results["passed"]
    total = test_results["total"]
    failed = test_results["failed"]
    rate = (passed / total * 100) if total > 0 else 0
    
    print(f"\n  总测试数: {total}")
    print(f"  通过: {passed} ✅")
    print(f"  失败: {failed} ❌")
    print(f"  通过率: {rate:.1f}%")
    
    if rate >= 95:
        print("\n  🎉 测试通过！P2缺陷修复成功！")
        return True
    else:
        print("\n  ⚠️  测试未通过，请检查失败的测试项")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
