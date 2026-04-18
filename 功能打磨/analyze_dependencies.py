"""
模块依赖分析工具
分析Ariba实施助手项目中各模块之间的依赖关系
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

class DependencyAnalyzer:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.modules: Dict[str, ModuleInfo] = {}
        self.dependencies: Dict[str, Set[str]] = defaultdict(set)
        self.reverse_deps: Dict[str, Set[str]] = defaultdict(set)
        
    def scan_modules(self):
        """扫描所有Python模块"""
        patterns = ['**/故障排除助手/**/*.py', '**/实施检查清单生成器/**/*.py', 
                    '**/shared/**/*.py', '**/web/backend/**/*.py']
        
        for pattern in patterns:
            for file in self.root_dir.glob(pattern):
                if file.name == '__init__.py' or file.name.startswith('test_'):
                    continue
                module_name = self._get_module_name(file)
                if module_name:
                    self.modules[module_name] = ModuleInfo(
                        name=module_name,
                        path=file,
                        module_type=self._get_module_type(file)
                    )
    
    def _get_module_name(self, file: Path) -> str:
        """获取模块名称"""
        rel_path = file.relative_to(self.root_dir)
        parts = list(rel_path.parts[:-1]) + [file.stem]
        # 过滤掉根目录
        parts = [p for p in parts if p not in ['Ariba实施助手', '故障排除助手', '实施检查清单生成器', 'web']]
        return '.'.join(parts) if parts else file.stem
    
    def _get_module_type(self, file: Path) -> str:
        """获取模块类型"""
        path_str = str(file)
        if '故障排除助手' in path_str:
            return 'troubleshooting'
        elif '实施检查清单生成器' in path_str:
            return 'checklist'
        elif 'shared' in path_str:
            return 'shared'
        elif 'web/backend' in path_str:
            return 'api'
        return 'unknown'
    
    def analyze_imports(self):
        """分析模块间的导入关系"""
        import_pattern = re.compile(r'^(?:from|import)\s+([\w.]+)', re.MULTILINE)
        
        for module_name, module_info in self.modules.items():
            try:
                content = module_info.path.read_text(encoding='utf-8')
                imports = import_pattern.findall(content)
                
                for imp in imports:
                    # 标准化导入路径
                    normalized = self._normalize_import(imp, module_name)
                    if normalized and normalized in self.modules:
                        self.dependencies[module_name].add(normalized)
                        self.reverse_deps[normalized].add(module_name)
            except Exception as e:
                print(f"Error analyzing {module_name}: {e}")
    
    def _normalize_import(self, import_str: str, current_module: str) -> str:
        """标准化导入路径"""
        # 移除 .. 和 . 引用
        parts = import_str.replace('..', '').replace('.', '')
        
        # 处理相对导入
        if import_str.startswith('.'):
            current_parts = current_module.split('.')[:-1]
            rel_parts = import_str.strip('.').split('.')
            combined = current_parts + rel_parts
            return '.'.join([p for p in combined if p])
        
        return parts
    
    def generate_report(self) -> str:
        """生成依赖分析报告"""
        report = ["# 模块依赖分析报告\n"]
        report.append(f"**分析时间**: {self._get_timestamp()}\n")
        report.append(f"**模块总数**: {len(self.modules)}\n")
        
        # 统计各类型模块
        type_counts = defaultdict(int)
        for m in self.modules.values():
            type_counts[m.module_type] += 1
        report.append("\n## 模块类型分布\n")
        for mtype, count in sorted(type_counts.items()):
            report.append(f"- {mtype}: {count}")
        
        # 高耦合模块
        report.append("\n## 高耦合模块 (入度 > 5)\n")
        high_coupling = [(name, len(deps)) for name, deps in self.dependencies.items() if len(deps) > 5]
        for name, count in sorted(high_coupling, key=lambda x: -x[1]):
            report.append(f"- {name}: {count} 个依赖")
        
        # 被依赖最多的模块
        report.append("\n## 被依赖最多的模块 (出度 > 5)\n")
        most_used = [(name, len(deps)) for name, deps in self.reverse_deps.items() if len(deps) > 5]
        for name, count in sorted(most_used, key=lambda x: -x[1]):
            report.append(f"- {name}: 被 {count} 个模块依赖")
        
        # 循环依赖检测
        report.append("\n## 循环依赖检测\n")
        cycles = self._detect_cycles()
        if cycles:
            for cycle in cycles:
                report.append(f"- {' -> '.join(cycle)}")
        else:
            report.append("- 未检测到循环依赖 ✓")
        
        # 依赖矩阵
        report.append("\n## 模块依赖矩阵\n")
        for module_name in sorted(self.modules.keys()):
            deps = self.dependencies.get(module_name, set())
            if deps:
                report.append(f"\n### {module_name}\n")
                report.append(f"依赖: {', '.join(sorted(deps))}")
        
        return '\n'.join(report)
    
    def _detect_cycles(self) -> List[List[str]]:
        """检测循环依赖"""
        visited = set()
        rec_stack = set()
        cycles = []
        
        def dfs(node, path):
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in self.dependencies.get(node, set()):
                if neighbor not in visited:
                    dfs(neighbor, path.copy())
                elif neighbor in rec_stack:
                    cycle_start = path.index(neighbor)
                    cycles.append(path[cycle_start:] + [neighbor])
            
            rec_stack.remove(node)
        
        for module in self.modules:
            if module not in visited:
                dfs(module, [])
        
        return cycles
    
    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


class ModuleInfo:
    def __init__(self, name: str, path: Path, module_type: str):
        self.name = name
        self.path = path
        self.module_type = module_type


if __name__ == '__main__':
    import sys
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    analyzer = DependencyAnalyzer(root)
    analyzer.scan_modules()
    analyzer.analyze_imports()
    report = analyzer.generate_report()
    
    # 保存报告
    output_file = Path(root) / '功能打磨' / 'P2-7.1-模块依赖分析报告.md'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(report, encoding='utf-8')
    print(f"报告已生成: {output_file}")
    print(report)
