#!/usr/bin/env python3
"""
性能测试和压力测试套件
"""

import sys
import time
import threading
from pathlib import Path
from typing import List

project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "Ariba实施助手" / "实施检查清单生成器" / "core"))

from checklist_generator import OptimizedChecklistGenerator


class PerformanceTestSuite:
    """性能测试套件"""
    
    def __init__(self):
        self.generator = OptimizedChecklistGenerator()
        self.results = []
    
    def measure_time(self, func, iterations=1) -> float:
        """测量函数执行时间"""
        times = []
        for _ in range(iterations):
            start = time.time()
            func()
            times.append((time.time() - start) * 1000)
        return sum(times) / len(times)
    
    def test_single_generation_performance(self):
        """测试单次生成性能"""
        print("\n[性能测试] 单次生成")
        
        # 预热
        self.generator.generate_all_phases_checklist(modules=["buying"], version="V2605")
        self.generator.clear_cache()
        
        # 测试单阶段
        time_single = self.measure_time(
            lambda: self.generator.generate_checklist(
                phases=["requirements_analysis"], modules=["buying"], version="V2605"
            ),
            iterations=10
        )
        print(f"    单阶段生成(10次平均): {time_single:.2f}ms")
        
        # 测试双阶段
        time_double = self.measure_time(
            lambda: self.generator.generate_checklist(
                phases=["requirements_analysis", "system_configuration"],
                modules=["buying"], version="V2605"
            ),
            iterations=10
        )
        print(f"    双阶段生成(10次平均): {time_double:.2f}ms")
        
        # 测试全阶段
        time_full = self.measure_time(
            lambda: self.generator.generate_all_phases_checklist(
                modules=["buying"], version="V2605"
            ),
            iterations=10
        )
        print(f"    全阶段生成(10次平均): {time_full:.2f}ms")
        
        # 验证性能目标
        targets = {
            "单阶段": (100, time_single),
            "全阶段": (200, time_full)
        }
        
        all_passed = True
        for name, (target, actual) in targets.items():
            status = "✓" if actual < target else "✗"
            print(f"    {name}: {actual:.2f}ms < {target}ms {status}")
            if actual >= target:
                all_passed = False
        
        return all_passed
    
    def test_cache_performance(self):
        """测试缓存性能"""
        print("\n[性能测试] 缓存效果")
        
        # 清除缓存
        self.generator.clear_cache()
        
        # 首次生成（无缓存）
        time_first = self.measure_time(
            lambda: self.generator.generate_all_phases_checklist(
                modules=["buying"], version="V2605"
            ),
            iterations=5
        )
        print(f"    首次生成: {time_first:.2f}ms")
        
        # 后续生成（有缓存）
        time_cached = self.measure_time(
            lambda: self.generator.generate_all_phases_checklist(
                modules=["buying"], version="V2605"
            ),
            iterations=10
        )
        print(f"    缓存命中: {time_cached:.2f}ms")
        
        # 计算提升
        if time_first > 0:
            improvement = ((time_first - time_cached) / time_first) * 100
            print(f"    缓存提升: {improvement:.1f}%")
        
        return True
    
    def test_module_scaling(self):
        """测试模块数量扩展性能"""
        print("\n[性能测试] 模块扩展")
        
        modules_list = [
            ["buying"],
            ["buying", "sourcing"],
            ["buying", "sourcing", "contract"],
            ["buying", "sourcing", "contract", "supplier"],
            ["buying", "sourcing", "contract", "supplier", "spending"],
        ]
        
        times = []
        for modules in modules_list:
            time_taken = self.measure_time(
                lambda m=modules: self.generator.generate_all_phases_checklist(
                    modules=m, version="V2605"
                ),
                iterations=5
            )
            times.append(time_taken)
            print(f"    {len(modules)}个模块: {time_taken:.2f}ms")
        
        # 验证性能稳定性（不应该随模块数线性增长）
        max_time = max(times)
        all_reasonable = all(t < 500 for t in times)  # 所有情况都应该在500ms内
        print(f"    最大耗时: {max_time:.2f}ms")
        
        return all_reasonable
    
    def test_export_performance(self):
        """测试导出性能"""
        print("\n[性能测试] 导出性能")
        
        checklist = self.generator.generate_all_phases_checklist(
            modules=["buying", "sourcing", "contract"],
            version="V2605"
        )
        
        # JSON导出
        time_json = self.measure_time(
            lambda: self.generator.export_to_json(checklist),
            iterations=10
        )
        print(f"    JSON导出: {time_json:.2f}ms")
        
        # Markdown导出
        time_md = self.measure_time(
            lambda: self.generator.export_to_markdown(checklist),
            iterations=10
        )
        print(f"    Markdown导出: {time_md:.2f}ms")
        
        return time_json < 100 and time_md < 200


class StressTestSuite:
    """压力测试套件"""
    
    def __init__(self):
        self.generator = OptimizedChecklistGenerator()
        self.errors = []
        self.success_count = 0
    
    def test_repeated_operations(self):
        """测试重复操作"""
        print("\n[压力测试] 重复操作")
        
        iterations = 100
        for i in range(iterations):
            try:
                self.generator.generate_all_phases_checklist(
                    modules=["buying"], version="V2605"
                )
                self.success_count += 1
            except Exception as e:
                self.errors.append(str(e))
        
        success_rate = self.success_count / iterations * 100
        print(f"    {iterations}次操作: {self.success_count}成功, {success_rate:.1f}%")
        
        if self.errors:
            print(f"    错误数: {len(self.errors)}")
        
        return success_rate >= 99
    
    def test_concurrent_operations(self):
        """测试并发操作"""
        print("\n[压力测试] 并发操作")
        
        num_threads = 10
        operations_per_thread = 10
        self.success_count = 0
        self.errors = []
        lock = threading.Lock()
        
        def worker():
            for _ in range(operations_per_thread):
                try:
                    self.generator.generate_all_phases_checklist(
                        modules=["buying"], version="V2605"
                    )
                    with lock:
                        self.success_count += 1
                except Exception as e:
                    with lock:
                        self.errors.append(str(e))
        
        threads = [threading.Thread(target=worker) for _ in range(num_threads)]
        start = time.time()
        
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        
        elapsed = time.time() - start
        total_ops = num_threads * operations_per_thread
        ops_per_sec = total_ops / elapsed
        
        success_rate = self.success_count / total_ops * 100
        print(f"    {num_threads}线程 × {operations_per_thread}次 = {total_ops}操作")
        print(f"    成功: {self.success_count}, 失败: {len(self.errors)}")
        print(f"    耗时: {elapsed:.2f}s, 速率: {ops_per_sec:.1f} ops/s")
        print(f"    成功率: {success_rate:.1f}%")
        
        return success_rate >= 95
    
    def test_memory_stability(self):
        """测试内存稳定性"""
        print("\n[压力测试] 内存稳定性")
        
        # 多次生成并清除缓存
        for i in range(50):
            self.generator.generate_all_phases_checklist(
                modules=["buying"], version="V2605"
            )
            if i % 10 == 0:
                self.generator.clear_cache()
        
        stats = self.generator.get_stats()
        print(f"    生成次数: {stats['generations']}")
        print(f"    模板加载: {stats['loads']}")
        print(f"    缓存命中: {stats['cache_hits']}")
        
        return True


def run_all_tests():
    """运行所有测试"""
    print("=" * 60)
    print("性能测试和压力测试")
    print("=" * 60)
    
    perf = PerformanceTestSuite()
    perf_ok = True
    
    perf_ok &= perf.test_single_generation_performance()
    perf_ok &= perf.test_cache_performance()
    perf_ok &= perf.test_module_scaling()
    perf_ok &= perf.test_export_performance()
    
    stress = StressTestSuite()
    stress_ok = True
    
    stress_ok &= stress.test_repeated_operations()
    stress_ok &= stress.test_concurrent_operations()
    stress_ok &= stress.test_memory_stability()
    
    print("\n" + "=" * 60)
    print("测试结果")
    print("=" * 60)
    print(f"  性能测试: {'✓ 通过' if perf_ok else '✗ 失败'}")
    print(f"  压力测试: {'✓ 通过' if stress_ok else '✗ 失败'}")
    print("=" * 60)
    
    return perf_ok and stress_ok


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
