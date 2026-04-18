"""
查询引擎优化测试
测试优化后的查询性能
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import time
import random

# 导入优化后的查询引擎
from Ariba实施助手.故障排除助手.core.query_engine import create_optimized_query_engine
from Ariba实施助手.故障排除助手.models.knowledge_item import KnowledgeItem

# 创建测试数据
def create_test_knowledge_base(size=100):
    """创建测试知识库"""
    items = []
    categories = ["network", "database", "authentication", "integration", "configuration"]
    versions = ["#V2505", "#V2602", "#V2604"]
    
    topics = [
        "登录失败", "网络连接", "数据库超时", "API错误", "配置问题",
        "权限不足", "同步异常", "证书错误", "服务不可用", "响应超时",
        "数据导入", "用户创建", "审批流程", "采购订单", "供应商管理"
    ]
    
    for i in range(size):
        topic = random.choice(topics)
        items.append({
            "id": f"KB-{i+1:04d}",
            "title": f"{topic}问题排查",
            "description": f"这是关于{topic}的详细描述，包含错误代码和解决步骤。问题可能由多种原因引起。",
            "solution": f"解决{topic}问题的方法：1. 检查网络连接 2. 验证配置 3. 重启服务 4. 清除缓存",
            "tags": [f"{topic}", "troubleshooting", categories[i % len(categories)]],
            "versions": [versions[i % len(versions)]],
            "category": categories[i % len(categories)],
            "related_ids": [f"KB-{(i+1) % size + 1:04d}"]
        })
    
    return items

def run_performance_test():
    """运行性能测试"""
    print("=" * 60)
    print("查询引擎优化性能测试")
    print("=" * 60)
    
    # 测试不同规模的知识库
    sizes = [50, 100, 200]
    
    for size in sizes:
        print(f"\n📊 知识库规模: {size} 条记录")
        print("-" * 40)
        
        # 创建测试数据
        test_data = create_test_knowledge_base(size)
        
        # 初始化引擎（第一次会有初始化开销）
        print("🔄 初始化查询引擎...")
        engine = create_optimized_query_engine(test_data)
        
        # 测试查询
        test_queries = [
            "登录失败",
            "网络连接问题",
            "数据库超时",
            "API错误",
            "配置问题"
        ]
        
        print("\n📈 查询性能测试:")
        print("-" * 40)
        
        total_time_no_cache = 0
        total_time_with_cache = 0
        
        # 第一次查询（无缓存）
        print("\n[首次查询 - 无缓存]")
        for query in test_queries[:3]:
            start = time.time()
            results = engine.search(query, limit=10, use_cache=False)
            elapsed = (time.time() - start) * 1000
            total_time_with_cache += elapsed
            print(f"  查询 '{query}': {elapsed:.2f}ms, 找到 {len(results)} 条结果")
        
        # 第二次查询（有缓存）
        print("\n[第二次查询 - 有缓存]")
        for query in test_queries:
            start = time.time()
            results = engine.search(query, limit=10, use_cache=True)
            elapsed = (time.time() - start) * 1000
            total_time_with_cache += elapsed
            print(f"  查询 '{query}': {elapsed:.2f}ms, 找到 {len(results)} 条结果")
        
        # 打印统计信息
        stats = engine.get_statistics()
        perf = stats.get("performance", {})
        
        print("\n📊 性能统计:")
        print("-" * 40)
        print(f"  总查询次数: {perf.get('queries', 0)}")
        print(f"  缓存命中: {perf.get('cache_hits', 0)}")
        print(f"  缓存未命中: {perf.get('cache_misses', 0)}")
        print(f"  缓存命中率: {perf.get('cache_hit_rate', 0)}%")
        print(f"  平均查询时间: {perf.get('avg_query_time_ms', 0)}ms")
        
        # 版本过滤测试
        print("\n🔍 版本过滤测试:")
        print("-" * 40)
        start = time.time()
        results = engine.search("问题", version_tags=["#V2602"], limit=10)
        elapsed = (time.time() - start) * 1000
        print(f"  版本过滤查询: {elapsed:.2f}ms, 找到 {len(results)} 条结果")
        
        # 清空缓存后再次测试
        print("\n🗑️ 清空缓存后测试:")
        print("-" * 40)
        engine.clear_cache()
        start = time.time()
        results = engine.search("登录失败", limit=10)
        elapsed = (time.time() - start) * 1000
        print(f"  清空缓存后首次查询: {elapsed:.2f}ms")
        
    print("\n" + "=" * 60)
    print("测试完成!")
    print("=" * 60)

if __name__ == "__main__":
    run_performance_test()
