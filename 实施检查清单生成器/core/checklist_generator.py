"""
实施检查清单生成器 - 核心引擎 (优化版)

优化内容：
1. 模板懒加载 - 按需加载特定阶段模板
2. 模板缓存 - 已加载模板缓存复用
3. 版本过滤优化 - 缓存规范化结果
"""

import json
import uuid
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from enum import Enum
from collections import OrderedDict

# 导入共享的版本工具（如果可用）
try:
    import sys
    from pathlib import Path
    shared_path = Path(__file__).parent.parent / "shared"
    if str(shared_path) not in sys.path:
        sys.path.insert(0, str(shared_path))
    from version_utils import normalize_version
except ImportError:
    def normalize_version(version: str) -> str:
        if not version:
            return ""
        version = version.strip().upper()
        if not version.startswith("#"):
            version = "#" + version
        return version


class ProjectPhase(Enum):
    """项目阶段枚举"""
    REQUIREMENTS_ANALYSIS = "requirements_analysis"
    SYSTEM_CONFIGURATION = "system_configuration"
    DATA_MIGRATION = "data_migration"
    USER_TRAINING = "user_training"
    GO_LIVE_SUPPORT = "go_live_support"


class AribaModule(Enum):
    """Ariba模块枚举"""
    SOURCING = "sourcing"
    CONTRACT = "contract"
    BUYING = "buying"
    SUPPLIER = "supplier"
    SPENDING = "spending"


# ====== 模板定义（延迟加载）======
# 大型模板数据现在放在函数中，按需加载

def _load_requirements_analysis_items():
    """加载需求分析阶段模板"""
    return [
        {"id": "REQ-001", "title": "业务需求调研", "description": "与关键用户访谈，收集业务需求和痛点", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "business"},
        {"id": "REQ-002", "title": "现状流程分析", "description": "绘制当前采购流程，识别改进点", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "business"},
        {"id": "REQ-003", "title": "目标流程设计", "description": "设计未来状态采购流程蓝图", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "business"},
        {"id": "REQ-004", "title": "需求文档编写", "description": "编写详细业务需求文档(BRD)", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "documentation"},
        {"id": "REQ-005", "title": "Ariba模块功能评估", "description": "评估各模块功能与业务需求的匹配度", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "evaluation"},
        {"id": "REQ-006", "title": "集成需求分析", "description": "分析与ERP、财务系统等的集成需求", "modules": ["sourcing", "contract", "buying"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "integration"},
        {"id": "REQ-007", "title": "供应商主数据需求", "description": "分析供应商主数据导入需求和策略", "modules": ["supplier"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "data"},
        {"id": "REQ-008", "title": "支出分析范围定义", "description": "定义支出分析的数据范围和分析维度", "modules": ["spending"], "versions": ["#V2602", "#V2604", "#V2605", "#VNextGen"], "priority": "medium", "category": "analysis"},
        {"id": "REQ-009", "title": "合同管理策略制定", "description": "制定合同生命周期管理策略", "modules": ["contract"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "strategy"},
        {"id": "REQ-010", "title": "寻源流程设计", "description": "设计电子寻源和招标流程", "modules": ["sourcing"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "process"},
    ]

def _load_system_configuration_items():
    """加载系统配置阶段模板"""
    return [
        {"id": "CFG-001", "title": "环境准备", "description": "配置测试环境、演示环境", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "infrastructure"},
        {"id": "CFG-002", "title": "租户基础配置", "description": "配置租户基本参数和货币、时区等", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "configuration"},
        {"id": "CFG-003", "title": "工作流配置", "description": "配置审批工作流和业务规则", "modules": ["buying", "contract"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "workflow"},
        {"id": "CFG-004", "title": "表单和字段配置", "description": "配置采购申请、订单等表单", "modules": ["buying"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "configuration"},
        {"id": "CFG-005", "title": "合同模板配置", "description": "配置合同模板和条款库", "modules": ["contract"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "configuration"},
        {"id": "CFG-006", "title": "寻源事件模板配置", "description": "配置招标模板和评分标准", "modules": ["sourcing"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "configuration"},
        {"id": "CFG-007", "title": "供应商管理配置", "description": "配置供应商准入规则和分级标准", "modules": ["supplier"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "configuration"},
        {"id": "CFG-008", "title": "支出分析维度配置", "description": "配置分析维度、报表和仪表板", "modules": ["spending"], "versions": ["#V2602", "#V2604", "#V2605", "#VNextGen"], "priority": "medium", "category": "configuration"},
        {"id": "CFG-009", "title": "集成中间件配置", "description": "配置与ERP等系统的集成", "modules": ["sourcing", "contract", "buying"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "integration"},
        {"id": "CFG-010", "title": "Joule AI配置", "description": "配置AI助手和智能推荐功能", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#VNextGen"], "priority": "medium", "category": "ai"},
        {"id": "CFG-011", "title": "移动端配置", "description": "配置移动应用和审批通知", "modules": ["buying", "supplier"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "low", "category": "mobile"},
        {"id": "CFG-012", "title": "安全权限配置", "description": "配置角色、权限和数据访问控制", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "security"},
    ]

def _load_data_migration_items():
    """加载数据迁移阶段模板"""
    return [
        {"id": "MIG-001", "title": "数据质量评估", "description": "评估源系统数据质量和完整性", "modules": ["supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "data"},
        {"id": "MIG-002", "title": "数据映射规则制定", "description": "制定源字段与目标字段映射规则", "modules": ["supplier"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "data"},
        {"id": "MIG-003", "title": "供应商主数据迁移", "description": "迁移和验证供应商主数据", "modules": ["supplier"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "data"},
        {"id": "MIG-004", "title": "合同数据迁移", "description": "迁移历史合同数据", "modules": ["contract"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "data"},
        {"id": "MIG-005", "title": "物料目录迁移", "description": "迁移商品目录和价格信息", "modules": ["buying"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "data"},
        {"id": "MIG-006", "title": "支出数据同步", "description": "配置和执行支出数据抽取", "modules": ["spending"], "versions": ["#V2602", "#V2604", "#V2605", "#VNextGen"], "priority": "medium", "category": "data"},
        {"id": "MIG-007", "title": "历史寻源数据迁移", "description": "迁移历史招标和报价数据", "modules": ["sourcing"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "low", "category": "data"},
        {"id": "MIG-008", "title": "数据验证和清洗", "description": "验证迁移数据准确性，执行数据清洗", "modules": ["supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "data"},
        {"id": "MIG-009", "title": "增量数据同步", "description": "配置增量数据同步机制", "modules": ["supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "integration"},
        {"id": "MIG-010", "title": "AI数据增强", "description": "使用AI能力增强供应商和品类数据", "modules": ["supplier", "spending"], "versions": ["#VNextGen"], "priority": "low", "category": "ai"},
    ]

def _load_user_training_items():
    """加载用户培训阶段模板"""
    return [
        {"id": "TRN-001", "title": "培训需求分析", "description": "分析不同用户角色的培训需求", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "training"},
        {"id": "TRN-002", "title": "培训材料开发", "description": "开发用户手册、操作指南和视频教程", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "training"},
        {"id": "TRN-003", "title": "关键用户培训", "description": "培训关键用户和超级用户", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "training"},
        {"id": "TRN-004", "title": "最终用户培训", "description": "培训所有最终用户", "modules": ["buying"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "training"},
        {"id": "TRN-005", "title": "供应商培训", "description": "培训供应商使用供应商门户", "modules": ["supplier"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "training"},
        {"id": "TRN-006", "title": "寻源团队培训", "description": "培训采购寻源团队", "modules": ["sourcing"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "training"},
        {"id": "TRN-007", "title": "合同管理员培训", "description": "培训合同管理员", "modules": ["contract"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "training"},
        {"id": "TRN-008", "title": "报表分析培训", "description": "培训支出分析和报表使用", "modules": ["spending"], "versions": ["#V2602", "#V2604", "#V2605", "#VNextGen"], "priority": "medium", "category": "training"},
        {"id": "TRN-009", "title": "培训考核", "description": "进行用户培训考核", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "assessment"},
        {"id": "TRN-010", "title": "AI助手使用培训", "description": "培训Joule AI助手使用", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#VNextGen"], "priority": "low", "category": "training"},
    ]

def _load_go_live_support_items():
    """加载上线支持阶段模板"""
    return [
        {"id": "GLS-001", "title": "上线准备检查", "description": "执行上线前最终检查清单", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "go_live"},
        {"id": "GLS-002", "title": "数据冻结", "description": "冻结关键数据，执行最终同步", "modules": ["supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "go_live"},
        {"id": "GLS-003", "title": "并行运行", "description": "新旧系统并行运行验证", "modules": ["buying", "contract"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "go_live"},
        {"id": "GLS-004", "title": "切换执行", "description": "执行系统切换，切断旧系统", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "go_live"},
        {"id": "GLS-005", "title": "实时监控", "description": "监控系统运行状态，处理异常", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "support"},
        {"id": "GLS-006", "title": "问题收集和处理", "description": "收集用户反馈，处理问题工单", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "support"},
        {"id": "GLS-007", "title": "知识库更新", "description": "更新FAQ和知识库", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "documentation"},
        {"id": "GLS-008", "title": "上线后评审", "description": "评估上线效果，总结经验教训", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "medium", "category": "review"},
        {"id": "GLS-009", "title": "稳定期监控", "description": "上线后2-4周密切监控", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "support"},
        {"id": "GLS-010", "title": "项目收尾", "description": "完成项目文档，进行项目验收", "modules": ["sourcing", "contract", "buying", "supplier", "spending"], "versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"], "priority": "high", "category": "close"},
    ]


# ====== 阶段元数据定义 ======
PHASE_META = {
    "requirements_analysis": {
        "name": "需求分析阶段",
        "loader": _load_requirements_analysis_items
    },
    "system_configuration": {
        "name": "系统配置阶段",
        "loader": _load_system_configuration_items
    },
    "data_migration": {
        "name": "数据迁移阶段",
        "loader": _load_data_migration_items
    },
    "user_training": {
        "name": "用户培训阶段",
        "loader": _load_user_training_items
    },
    "go_live_support": {
        "name": "上线支持阶段",
        "loader": _load_go_live_support_items
    }
}


# ====== 优化的检查清单生成器 ======
class OptimizedChecklistGenerator:
    """优化版检查清单生成器"""
    
    # 支持的版本列表
    SUPPORTED_VERSIONS = ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"]
    
    def __init__(self):
        """初始化生成器 - 延迟加载模板"""
        self._template_cache: Dict[str, Dict] = {}  # 阶段 -> 模板数据
        self._version_cache: Dict[str, str] = {}    # 原始版本 -> 规范化版本
        self._generated_cache: OrderedDict = OrderedDict()  # 生成结果缓存
        self._stats = {
            "loads": 0,
            "cache_hits": 0,
            "generations": 0
        }
    
    def _load_phase_template(self, phase: str) -> Dict[str, Any]:
        """懒加载阶段模板"""
        # 检查缓存
        if phase in self._template_cache:
            self._stats["cache_hits"] += 1
            return self._template_cache[phase]
        
        self._stats["loads"] += 1
        
        # 加载模板
        loader = PHASE_META.get(phase, {}).get("loader")
        if loader:
            items = loader()
        else:
            items = []
        
        template = {
            "name": PHASE_META.get(phase, {}).get("name", phase),
            "items": items
        }
        
        # 缓存
        self._template_cache[phase] = template
        return template
    
    def _normalize_version_cached(self, version: str) -> str:
        """版本规范化（带缓存）"""
        if version not in self._version_cache:
            self._version_cache[version] = normalize_version(version)
        return self._version_cache[version]
    
    def _generate_cache_key(self, phases: List[str], modules: List[str], version: str) -> str:
        """生成缓存键"""
        return f"{','.join(sorted(phases))}:{','.join(sorted(modules))}:{version}"
    
    def generate_checklist(
        self,
        phases: List[str],
        modules: List[str],
        version: str = "V2605",
        project_name: str = "Ariba实施项目",
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """生成检查清单"""
        self._stats["generations"] += 1
        start_time = time.time()
        
        # 检查缓存
        cache_key = self._generate_cache_key(phases, modules, version)
        if use_cache and cache_key in self._generated_cache:
            return self._generated_cache[cache_key]
        
        checklist_id = str(uuid.uuid4())
        items = []
        
        # 规范化版本
        normalized_version = self._normalize_version_cached(version)
        
        # 按需加载阶段模板
        for phase in phases:
            phase_key = phase if isinstance(phase, str) else phase.value
            phase_data = self._load_phase_template(phase_key)
            
            for item in phase_data["items"]:
                # 版本过滤
                item_versions = [self._normalize_version_cached(v) for v in item["versions"]]
                if normalized_version not in item_versions:
                    continue
                
                # 模块过滤
                if not any(m in item["modules"] for m in modules):
                    continue
                
                items.append({
                    "id": f"{checklist_id[:8]}-{item['id']}",
                    "original_id": item["id"],
                    "title": item["title"],
                    "description": item["description"],
                    "phase": phase_key,
                    "phase_name": phase_data["name"],
                    "module": [m for m in modules if m in item["modules"]],
                    "priority": item["priority"],
                    "category": item["category"],
                    "versions": item["versions"],
                    "status": "not_started",
                    "assignee": None,
                    "start_time": None,
                    "end_time": None,
                    "notes": ""
                })
        
        result = {
            "id": checklist_id,
            "name": project_name,
            "version": version,
            "phases": phases,
            "modules": modules,
            "created_at": datetime.now().isoformat(),
            "items": items,
            "total_items": len(items),
            "completion_rate": 0.0,
            "generated_in_ms": round((time.time() - start_time) * 1000, 2)
        }
        
        # 缓存结果
        if use_cache:
            self._generated_cache[cache_key] = result
            # 限制缓存大小
            while len(self._generated_cache) > 100:
                self._generated_cache.popitem(last=False)
        
        return result
    
    def generate_all_phases_checklist(
        self,
        modules: List[str],
        version: str = "V2605",
        project_name: str = "Ariba实施项目",
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """生成包含所有阶段的标准检查清单"""
        all_phases = [
            ProjectPhase.REQUIREMENTS_ANALYSIS.value,
            ProjectPhase.SYSTEM_CONFIGURATION.value,
            ProjectPhase.DATA_MIGRATION.value,
            ProjectPhase.USER_TRAINING.value,
            ProjectPhase.GO_LIVE_SUPPORT.value
        ]
        return self.generate_checklist(all_phases, modules, version, project_name, use_cache)
    
    def preload_all_templates(self):
        """预加载所有模板"""
        for phase in PHASE_META:
            self._load_phase_template(phase)
    
    def get_stats(self) -> Dict:
        """获取统计信息"""
        return {
            **self._stats,
            "templates_loaded": len(self._template_cache),
            "versions_cached": len(self._version_cache),
            "generations_cached": len(self._generated_cache)
        }
    
    def clear_cache(self):
        """清空缓存"""
        self._template_cache.clear()
        self._generated_cache.clear()
    
    # ====== 导出方法（保持兼容）======
    def export_to_markdown(self, checklist: Dict[str, Any]) -> str:
        """导出检查清单为Markdown格式"""
        md_lines = [
            f"# {checklist['name']}",
            f"",
            f"**版本**: {checklist['version']}",
            f"**创建时间**: {checklist['created_at']}",
            f"**总项目数**: {checklist['total_items']}",
            f"**完成率**: {checklist['completion_rate']:.1%}",
            f"",
            f"## 模块",
            f"- {', '.join(checklist['modules'])}",
            f"",
            f"---",
            f""
        ]
        
        # 按阶段分组
        phase_items = {}
        for item in checklist["items"]:
            phase = item["phase"]
            if phase not in phase_items:
                phase_items[phase] = {"name": item["phase_name"], "items": []}
            phase_items[phase]["items"].append(item)
        
        for phase, phase_data in phase_items.items():
            md_lines.append(f"## {phase_data['name']}")
            md_lines.append("")
            
            priority_order = {"high": 0, "medium": 1, "low": 2}
            sorted_items = sorted(phase_data["items"], key=lambda x: priority_order.get(x["priority"], 3))
            
            for i, item in enumerate(sorted_items, 1):
                status_icon = {"not_started": "⬜", "in_progress": "🔄", "completed": "✅", "verified": "✔️", "blocked": "❌"}.get(item["status"], "⬜")
                
                md_lines.append(f"### {i}. {item['title']} {status_icon}")
                md_lines.append(f"- **ID**: {item['id']}")
                md_lines.append(f"- **描述**: {item['description']}")
                md_lines.append(f"- **优先级**: {item['priority'].upper()}")
                md_lines.append("")
        
        return "\n".join(md_lines)
    
    def export_to_json(self, checklist: Dict[str, Any]) -> str:
        """导出检查清单为JSON格式"""
        return json.dumps(checklist, ensure_ascii=False, indent=2)
    
    def save_to_file(self, checklist: Dict[str, Any], file_path: str, format: str = "json"):
        """保存检查清单到文件"""
        if format == "markdown":
            content = self.export_to_markdown(checklist)
        else:
            content = self.export_to_json(checklist)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)


# ====== 便捷函数（保持兼容）======
def create_generator() -> OptimizedChecklistGenerator:
    """工厂函数：创建检查清单生成器实例"""
    return OptimizedChecklistGenerator()


def generate_standard_checklist(
    modules: List[str],
    version: str = "V2605",
    project_name: str = "Ariba实施项目"
) -> Dict[str, Any]:
    """生成标准检查清单"""
    generator = OptimizedChecklistGenerator()
    return generator.generate_all_phases_checklist(modules, version, project_name)


def generate_phase_checklist(
    phase: str,
    modules: List[str],
    version: str = "V2605"
) -> Dict[str, Any]:
    """生成指定阶段的检查清单"""
    generator = OptimizedChecklistGenerator()
    return generator.generate_checklist([phase], modules, version)


# ====== 保持向后兼容 ======
ChecklistGenerator = OptimizedChecklistGenerator


if __name__ == "__main__":
    import time
    
    print("=" * 60)
    print("清单生成器优化测试")
    print("=" * 60)
    
    # 测试单个阶段加载
    generator = OptimizedChecklistGenerator()
    
    print("\n📊 懒加载测试:")
    print("-" * 40)
    
    # 第一次加载（无缓存）
    start = time.time()
    result1 = generator.generate_checklist(
        ["requirements_analysis"],
        ["buying", "sourcing"],
        "V2605"
    )
    elapsed1 = (time.time() - start) * 1000
    print(f"  首次加载需求分析阶段: {elapsed1:.2f}ms, {result1['total_items']} 项目")
    
    # 第二次加载（有缓存）
    start = time.time()
    result2 = generator.generate_checklist(
        ["requirements_analysis"],
        ["buying", "sourcing"],
        "V2605"
    )
    elapsed2 = (time.time() - start) * 1000
    print(f"  缓存命中: {elapsed2:.2f}ms, {result2['total_items']} 项目")
    
    # 加载其他阶段
    start = time.time()
    result3 = generator.generate_checklist(
        ["system_configuration", "data_migration"],
        ["buying", "sourcing"],
        "V2605"
    )
    elapsed3 = (time.time() - start) * 1000
    print(f"  加载2个新阶段: {elapsed3:.2f}ms, {result3['total_items']} 项目")
    
    # 全阶段生成
    start = time.time()
    result4 = generator.generate_all_phases_checklist(
        ["buying", "sourcing", "contract"],
        "V2605"
    )
    elapsed4 = (time.time() - start) * 1000
    print(f"  全阶段生成: {elapsed4:.2f}ms, {result4['total_items']} 项目")
    
    # 统计信息
    stats = generator.get_stats()
    print("\n📈 统计信息:")
    print("-" * 40)
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    print("\n" + "=" * 60)
    print("✅ 优化验证完成！")
    print("=" * 60)
