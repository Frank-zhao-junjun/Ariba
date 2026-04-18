#!/usr/bin/env python3
"""
Ariba实施助手 - 性能测试对比
对比文件存储 vs 数据库存储的性能
"""

import os
import sys
import time
import json
import random
import statistics
from pathlib import Path
from typing import List, Dict, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, str(Path(__file__).parent))
from 03_data_access_layer import UnifiedDAL, get_db_cursor

# 配置
PROJECT_ROOT = Path("/app/data/所有对话/主对话/Ariba实施助手")
KNOWLEDGE_BASE = Path("/app/data/所有对话/主对话/SAP-Ariba")
DB_PATH = str(PROJECT_ROOT / "data" / "ariba_assistant.db")

class PerformanceTester:
    """性能测试器"""
    
    def __init__(self):
        self.results = {
            'file_storage': {},
            'database_storage': {},
            'comparison': {}
        }
        self.test_data = []
        self._prepare_test_data()
    
    def _prepare_test_data(self):
        """准备测试数据"""
        # 加载知识库文件
        kb_files = list(KNOWLEDGE_BASE.rglob("*.md"))
        kb_files = [f for f in kb_files if "scripts" not in str(f) and f.stat().st_size > 100][:200]
        
        for f in kb_files:
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    content = file.read()
                    self.test_data.append({
                        'path': str(f),
                        'content': content,
                        'title': f.stem,
                        'category': f.parent.name
                    })
            except:
                continue
    
    def test_file_storage_load(self, iterations: int = 10) -> Dict:
        """测试文件存储加载性能"""
        times = []
        
        for _ in range(iterations):
            start = time.time()
            loaded = []
            for item in self.test_data:
                loaded.append({
                    'title': item['title'],
                    'content': item['content'],
                    'category': item['category']
                })
            elapsed = (time.time() - start) * 1000
            times.append(elapsed)
        
        return {
            'avg_ms': statistics.mean(times),
            'min_ms': min(times),
            'max_ms': max(times),
            'std_ms': statistics.stdev(times) if len(times) > 1 else 0,
            'iterations': iterations
        }
    
    def test_file_storage_search(self, queries: List[str], iterations: int = 5) -> Dict:
        """测试文件存储搜索性能"""
        all_results = {q: [] for q in queries}
        
        for _ in range(iterations):
            for query in queries:
                start = time.time()
                results = [d for d in self.test_data if query in d.get('content', '')]
                elapsed = (time.time() - start) * 1000
                all_results[query].append(elapsed)
        
        avg_times = {q: statistics.mean(times) for q, times in all_results.items()}
        
        return {
            'avg_ms': statistics.mean(list(avg_times.values())),
            'by_query': avg_times,
            'iterations': iterations
        }
    
    def test_file_storage_concurrent(self, num_threads: List[int] = [1, 2, 4, 8]) -> Dict:
        """测试文件存储并发性能"""
        results = {}
        
        for num in num_threads:
            times = []
            
            def load_file(file_info):
                start = time.time()
                with open(file_info['path'], 'r', encoding='utf-8') as f:
                    return (time.time() - start) * 1000
            
            for _ in range(3):  # 重复测试
                start = time.time()
                with ThreadPoolExecutor(max_workers=num) as executor:
                    futures = [executor.submit(load_file, d) for d in self.test_data[:50]]
                    list(as_completed(futures))
                total = (time.time() - start) * 1000
                times.append(total)
            
            results[f'{num}_threads'] = {
                'avg_ms': statistics.mean(times),
                'throughput': len(self.test_data[:50]) / (statistics.mean(times) / 1000)
            }
        
        return results
    
    def test_database_load(self, iterations: int = 10) -> Dict:
        """测试数据库加载性能"""
        dal = UnifiedDAL(DB_PATH)
        times = []
        
        for _ in range(iterations):
            start = time.time()
            items = dal.knowledge.get_all_knowledge(limit=500)
            elapsed = (time.time() - start) * 1000
            times.append(elapsed)
        
        return {
            'avg_ms': statistics.mean(times),
            'min_ms': min(times),
            'max_ms': max(times),
            'std_ms': statistics.stdev(times) if len(times) > 1 else 0,
            'items_loaded': len(items) if times else 0,
            'iterations': iterations
        }
    
    def test_database_search(self, queries: List[str], iterations: int = 5) -> Dict:
        """测试数据库搜索性能"""
        dal = UnifiedDAL(DB_PATH)
        all_results = {q: [] for q in queries}
        
        for _ in range(iterations):
            for query in queries:
                try:
                    start = time.time()
                    results = dal.knowledge.search_knowledge(query, limit=20)
                    elapsed = (time.time() - start) * 1000
                    all_results[query].append(elapsed)
                except Exception as e:
                    all_results[query].append(0)
        
        avg_times = {q: statistics.mean(times) for q, times in all_results.items()}
        
        return {
            'avg_ms': statistics.mean(list(avg_times.values())),
            'by_query': avg_times,
            'iterations': iterations
        }
    
    def test_database_fts(self, queries: List[str], iterations: int = 5) -> Dict:
        """测试数据库全文搜索"""
        times = []
        
        for _ in range(iterations):
            for query in queries:
                start = time.time()
                with get_db_cursor(DB_PATH) as (cursor, conn):
                    cursor.execute("""
                        SELECT k.*, highlight(knowledge_fts, 0, '<mark>', '</mark>') as title_hl
                        FROM knowledge k
                        JOIN knowledge_fts fts ON k.rowid = fts.rowid
                        WHERE knowledge_fts MATCH ?
                        LIMIT 20
                    """, (query + '*',))
                    results = cursor.fetchall()
                elapsed = (time.time() - start) * 1000
                times.append(elapsed)
        
        return {
            'avg_ms': statistics.mean(times),
            'min_ms': min(times),
            'max_ms': max(times),
            'iterations': iterations
        }
    
    def test_database_concurrent(self, num_threads: List[int] = [1, 2, 4, 8]) -> Dict:
        """测试数据库并发性能"""
        results = {}
        
        for num in num_threads:
            times = []
            
            def db_query():
                dal = UnifiedDAL(DB_PATH)
                start = time.time()
                dal.knowledge.get_all_knowledge(limit=50)
                return (time.time() - start) * 1000
            
            for _ in range(3):
                start = time.time()
                with ThreadPoolExecutor(max_workers=num) as executor:
                    futures = [executor.submit(db_query) for _ in range(10)]
                    list(as_completed(futures))
                total = (time.time() - start) * 1000
                times.append(total)
            
            results[f'{num}_threads'] = {
                'avg_ms': statistics.mean(times),
                'throughput': 10 / (statistics.mean(times) / 1000)
            }
        
        return results
    
    def run_comparison(self) -> Dict:
        """运行完整性能对比"""
        print("=" * 60)
        print("Ariba实施助手 - 性能对比测试")
        print("=" * 60)
        
        queries = ["配置", "API", "实施", "故障", "版本"]
        
        # 1. 加载性能测试
        print("\n📂 测试文件存储加载...")
        file_load = self.test_file_storage_load()
        print(f"   平均: {file_load['avg_ms']:.2f}ms")
        
        print("\n🗄️ 测试数据库加载...")
        db_load = self.test_database_load()
        print(f"   平均: {db_load['avg_ms']:.2f}ms")
        
        # 2. 搜索性能测试
        print("\n🔍 测试文件存储搜索...")
        file_search = self.test_file_storage_search(queries)
        print(f"   平均: {file_search['avg_ms']:.2f}ms")
        
        print("\n🔍 测试数据库搜索...")
        db_search = self.test_database_search(queries)
        print(f"   平均: {db_search['avg_ms']:.2f}ms")
        
        # 3. 全文搜索测试
        print("\n📝 测试数据库FTS...")
        db_fts = self.test_database_fts(queries)
        print(f"   平均: {db_fts['avg_ms']:.2f}ms")
        
        # 4. 并发性能测试
        print("\n⚡ 测试并发性能...")
        file_concurrent = self.test_file_storage_concurrent()
        db_concurrent = self.test_database_concurrent()
        
        # 汇总结果
        self.results = {
            'file_storage': {
                'load': file_load,
                'search': file_search,
                'concurrent': file_concurrent
            },
            'database_storage': {
                'load': db_load,
                'search': db_search,
                'fts': db_fts,
                'concurrent': db_concurrent
            },
            'comparison': {
                'load_speedup': file_load['avg_ms'] / db_load['avg_ms'] if db_load['avg_ms'] > 0 else 0,
                'search_speedup': file_search['avg_ms'] / db_search['avg_ms'] if db_search['avg_ms'] > 0 else 0,
                'recommendation': self._get_recommendation(file_load, file_search, db_load, db_search)
            }
        }
        
        self._generate_report()
        
        return self.results
    
    def _get_recommendation(self, file_load, file_search, db_load, db_search) -> str:
        """根据测试结果给出建议"""
        load_ratio = file_load['avg_ms'] / db_load['avg_ms'] if db_load['avg_ms'] > 0 else 1
        search_ratio = file_search['avg_ms'] / db_search['avg_ms'] if db_search['avg_ms'] > 0 else 1
        
        if load_ratio < 1 and search_ratio < 1:
            return "文件存储更优 - 保持现有方案"
        elif load_ratio > 1.5 and search_ratio > 1.5:
            return "数据库更优 - 建议迁移"
        else:
            return "两者性能相近 - 可根据扩展性需求选择"
    
    def _generate_report(self):
        """生成性能报告"""
        comp = self.results['comparison']
        file_load = self.results['file_storage']['load']
        db_load = self.results['database_storage']['load']
        file_search = self.results['file_storage']['search']
        db_search = self.results['database_storage']['search']
        file_conc = self.results['file_storage']['concurrent']
        db_conc = self.results['database_storage']['concurrent']
        
        report = f"""# 性能对比报告

> 生成时间: {time.strftime("%Y-%m-%d %H:%M:%S")}

---

## 📊 性能对比摘要

| 指标 | 文件存储 | 数据库 | 胜出 |
|------|----------|--------|------|
| 加载性能 | {file_load['avg_ms']:.2f}ms | {db_load['avg_ms']:.2f}ms | {"文件" if file_load['avg_ms'] < db_load['avg_ms'] else "数据库"} |
| 搜索性能 | {file_search['avg_ms']:.2f}ms | {db_search['avg_ms']:.2f}ms | {"文件" if file_search['avg_ms'] < db_search['avg_ms'] else "数据库"} |
| 加载加速比 | - | {comp['load_speedup']:.2f}x | - |
| 搜索加速比 | - | {comp['search_speedup']:.2f}x | - |

**建议**: {comp['recommendation']}

---

## 📂 加载性能详情

### 文件存储
| 指标 | 数值 |
|------|------|
| 平均时间 | {file_load['avg_ms']:.2f}ms |
| 最小时间 | {file_load['min_ms']:.2f}ms |
| 最大时间 | {file_load['max_ms']:.2f}ms |
| 标准差 | {file_load['std_ms']:.2f}ms |

### 数据库
| 指标 | 数值 |
|------|------|
| 平均时间 | {db_load['avg_ms']:.2f}ms |
| 最小时间 | {db_load['min_ms']:.2f}ms |
| 最大时间 | {db_load['max_ms']:.2f}ms |
| 标准差 | {db_load['std_ms']:.2f}ms |
| 加载条目 | {db_load['items_loaded']} |

---

## 🔍 搜索性能详情

### 文件存储
| 查询词 | 耗时(ms) |
|--------|----------|
"""
        for q, t in file_search['by_query'].items():
            report += f"| {q} | {t:.2f} |\n"
        
        report += f"""
**平均**: {file_search['avg_ms']:.2f}ms

### 数据库 (FTS)
| 查询词 | 耗时(ms) |
|--------|----------|
"""
        for q, t in db_search['by_query'].items():
            report += f"| {q} | {t:.2f} |\n"
        
        report += f"""
**平均**: {db_search['avg_ms']:.2f}ms

### 数据库原生FTS
| 指标 | 数值 |
|------|------|
| 平均时间 | {self.results['database_storage']['fts']['avg_ms']:.2f}ms |
| 最小时间 | {self.results['database_storage']['fts']['min_ms']:.2f}ms |
| 最大时间 | {self.results['database_storage']['fts']['max_ms']:.2f}ms |

---

## ⚡ 并发性能详情

### 文件存储
| 并发数 | 耗时(ms) | 吞吐量(items/s) |
|--------|----------|-----------------|
"""
        for threads, data in file_conc.items():
            report += f"| {threads.replace('_threads', '')} | {data['avg_ms']:.2f} | {data['throughput']:.1f} |\n"
        
        report += f"""
### 数据库
| 并发数 | 耗时(ms) | 吞吐量(queries/s) |
|--------|----------|-------------------|
"""
        for threads, data in db_conc.items():
            report += f"| {threads.replace('_threads', '')} | {data['avg_ms']:.2f} | {data['throughput']:.1f} |\n"
        
        report += f"""
---

## 📈 结论

{comp['recommendation']}

### 选择建议

1. **选择文件存储的场景**:
   - 数据量小（<1000个文件）
   - 主要使用场景是全文搜索
   - 不需要复杂的关系查询
   - 希望简化部署和备份

2. **选择数据库的场景**:
   - 数据量大或快速增长
   - 需要复杂的数据关系管理
   - 需要事务支持和数据一致性保证
   - 需要更好的并发性能

---

*本报告由系统自动生成*
"""
        
        report_path = PROJECT_ROOT / "P0-1.5-数据存储评估" / "性能对比报告.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n📄 报告已保存: {report_path}")


if __name__ == "__main__":
    tester = PerformanceTester()
    results = tester.run_comparison()
    
    print("\n" + "=" * 60)
    print("测试完成!")
    print("=" * 60)
    print(f"\n建议: {results['comparison']['recommendation']}")
