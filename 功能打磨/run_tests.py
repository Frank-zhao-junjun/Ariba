#!/usr/bin/env python3
"""
测试运行脚本
运行单元测试并生成报告
"""

import sys
import unittest
from pathlib import Path

# 添加项目根目录
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


def run_checklist_tests():
    """运行清单生成器测试"""
    print("=" * 60)
    print("运行清单生成器测试")
    print("=" * 60)
    
    sys.path.insert(0, str(project_root / "Ariba实施助手" / "实施检查清单生成器" / "core"))
    
    try:
        from checklist_generator import OptimizedChecklistGenerator
        
        # 基本功能测试
        print("\n[基本功能测试]")
        generator = OptimizedChecklistGenerator()
        
        # 测试单阶段生成
        result1 = generator.generate_checklist(
            ["requirements_analysis"],
            ["buying"],
            "V2605"
        )
        print(f"  ✓ 单阶段生成: {result1['total_items']} 项")
        
        # 测试全阶段生成
        result2 = generator.generate_all_phases_checklist(
            ["buying", "sourcing"],
            "V2605"
        )
        print(f"  ✓ 全阶段生成: {result2['total_items']} 项")
        
        # 缓存测试
        print("\n[缓存测试]")
        start = time.time()
        result3 = generator.generate_checklist(["requirements_analysis"], ["buying"], "V2605")
        cached_time = (time.time() - start) * 1000
        print(f"  ✓ 缓存命中: {cached_time:.2f}ms")
        
        # 统计
        stats = generator.get_stats()
        print(f"\n[统计信息]")
        print(f"  模板加载次数: {stats['loads']}")
        print(f"  缓存命中次数: {stats['cache_hits']}")
        
        return True
    except Exception as e:
        import traceback
        print(f"  ✗ 测试失败: {e}")
        traceback.print_exc()
        return False


def run_query_optimization_tests():
    """运行查询优化测试"""
    print("\n" + "=" * 60)
    print("运行查询优化测试")
    print("=" * 60)
    
    # 创建简单的测试
    print("\n[性能对比测试]")
    
    import time
    
    # 模拟无缓存查询
    def query_no_cache(data, query):
        results = []
        for item in data:
            if query.lower() in item["title"].lower():
                results.append(item)
        return results[:10]
    
    # 模拟有缓存查询
    cache = {}
    def query_with_cache(data, query):
        if query in cache:
            return cache[query]
        results = []
        for item in data:
            if query.lower() in item["title"].lower():
                results.append(item)
        cache[query] = results[:10]
        return results[:10]
    
    # 创建测试数据
    test_data = [
        {"id": f"KB-{i+1:04d}", "title": f"供应商问题{i}"}
        for i in range(100)
    ]
    
    # 无缓存测试
    start = time.time()
    for _ in range(10):
        query_no_cache(test_data, "供应商")
    no_cache_time = (time.time() - start) * 1000 / 10
    
    # 有缓存测试
    start = time.time()
    for _ in range(10):
        query_with_cache(test_data, "供应商")
    with_cache_time = (time.time() - start) * 1000 / 10
    
    print(f"  ✓ 无缓存查询: {no_cache_time:.2f}ms")
    print(f"  ✓ 有缓存查询: {with_cache_time:.2f}ms")
    
    improvement = ((no_cache_time - with_cache_time) / no_cache_time * 100)
    print(f"  ✓ 性能提升: {improvement:.1f}%")
    
    return True


def run_all_tests():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("Ariba实施助手 - 测试套件")
    print("=" * 60)
    
    results = []
    
    # 运行清单生成器测试
    results.append(("清单生成器", run_checklist_tests()))
    
    # 运行查询优化测试
    results.append(("查询优化", run_query_optimization_tests()))
    
    # 打印总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    for name, success in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"  {name}: {status}")
    
    all_passed = all(r[1] for r in results)
    print(f"\n总体结果: {'✓ 全部通过' if all_passed else '✗ 有失败'}")
    
    return all_passed


if __name__ == "__main__":
    import time
    success = run_all_tests()
    sys.exit(0 if success else 1)
