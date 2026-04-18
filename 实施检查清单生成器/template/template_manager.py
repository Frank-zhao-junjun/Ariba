"""
清单模板管理器 (US3)
提供模板的创建、存储、版本管理和导入导出功能
"""

import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any


class TemplateManager:
    """清单模板管理器"""
    
    def __init__(self):
        """初始化模板管理器"""
        self.templates = self._load_builtin_templates()
        self.template_metadata = {}
    
    def _load_builtin_templates(self) -> Dict[str, Any]:
        """加载内置模板"""
        return {
            "standard_implementation": {
                "id": "tmpl-standard-001",
                "name": "标准实施模板",
                "name_en": "Standard Implementation Template",
                "description": "适用于一般性Ariba实施项目的标准模板，包含所有核心阶段和清单项",
                "version": "1.0.0",
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z",
                "usage_count": 156,
                "applicable_phases": [
                    "requirements_analysis",
                    "system_configuration",
                    "data_migration",
                    "user_training",
                    "go_live_support"
                ],
                "applicable_modules": [
                    "sourcing", "contract", "buying", "supplier", "spending"
                ],
                "tags": ["标准", "通用", "完整"],
                "is_builtin": True,
                "checklist_config": {
                    "include_all_phases": True,
                    "include_all_modules": True,
                    "priority_filter": ["high", "medium", "low"],
                    "version_recommendation": "V2605"
                }
            },
            "quick_implementation": {
                "id": "tmpl-quick-001",
                "name": "快速实施模板",
                "name_en": "Quick Implementation Template",
                "description": "适用于标准化、快速交付项目，精简清单项聚焦关键步骤",
                "version": "1.0.0",
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z",
                "usage_count": 89,
                "applicable_phases": [
                    "requirements_analysis",
                    "system_configuration",
                    "go_live_support"
                ],
                "applicable_modules": ["buying", "sourcing"],
                "tags": ["快速", "精简", "SME"],
                "is_builtin": True,
                "checklist_config": {
                    "include_all_phases": False,
                    "priority_filter": ["high"],
                    "version_recommendation": "V2605"
                }
            },
            "complex_integration": {
                "id": "tmpl-complex-001",
                "name": "复杂集成模板",
                "name_en": "Complex Integration Template",
                "description": "适用于多系统集成项目，包含额外的集成相关清单项",
                "version": "1.0.0",
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z",
                "usage_count": 67,
                "applicable_phases": [
                    "requirements_analysis",
                    "system_configuration",
                    "data_migration",
                    "user_training",
                    "go_live_support"
                ],
                "applicable_modules": [
                    "sourcing", "contract", "buying", "supplier", "spending"
                ],
                "tags": ["复杂", "集成", "ERP"],
                "is_builtin": True,
                "checklist_config": {
                    "include_all_phases": True,
                    "include_all_modules": True,
                    "include_integration_items": True,
                    "priority_filter": ["high", "medium", "low"],
                    "version_recommendation": "V2605"
                }
            },
            "sme_template": {
                "id": "tmpl-sme-001",
                "name": "中小企业模板",
                "name_en": "SME Template",
                "description": "适用于中小企业，简化流程降低复杂度",
                "version": "1.0.0",
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z",
                "usage_count": 134,
                "applicable_phases": [
                    "requirements_analysis",
                    "system_configuration",
                    "user_training",
                    "go_live_support"
                ],
                "applicable_modules": ["buying", "sourcing", "supplier"],
                "tags": ["SME", "简化", "中小企业"],
                "is_builtin": True,
                "checklist_config": {
                    "include_all_phases": False,
                    "simplified_workflow": True,
                    "priority_filter": ["high"],
                    "version_recommendation": "V2605"
                }
            },
            "manufacturing_industry": {
                "id": "tmpl-mfg-001",
                "name": "制造业专用模板",
                "name_en": "Manufacturing Industry Template",
                "description": "针对制造业的专用模板，包含供应商质量管理、物料清单管理等特殊清单项",
                "version": "1.0.0",
                "created_at": "2026-01-15T10:00:00Z",
                "updated_at": "2026-01-15T10:00:00Z",
                "usage_count": 45,
                "applicable_phases": [
                    "requirements_analysis",
                    "system_configuration",
                    "data_migration",
                    "user_training",
                    "go_live_support"
                ],
                "applicable_modules": ["supplier", "sourcing", "buying"],
                "tags": ["制造业", "工业", "供应链"],
                "is_builtin": True,
                "industry_focus": "manufacturing",
                "checklist_config": {
                    "include_all_phases": True,
                    "include_industry_items": True,
                    "priority_filter": ["high", "medium", "low"],
                    "version_recommendation": "V2605"
                }
            }
        }
    
    def get_all_templates(self) -> List[Dict[str, Any]]:
        """获取所有模板列表"""
        return [
            {
                "id": tmpl["id"],
                "name": tmpl["name"],
                "name_en": tmpl.get("name_en", ""),
                "description": tmpl["description"],
                "version": tmpl["version"],
                "usage_count": tmpl["usage_count"],
                "applicable_phases": tmpl["applicable_phases"],
                "applicable_modules": tmpl["applicable_modules"],
                "tags": tmpl["tags"],
                "is_builtin": tmpl["is_builtin"],
                "created_at": tmpl["created_at"],
                "updated_at": tmpl["updated_at"]
            }
            for tmpl in self.templates.values()
        ]
    
    def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """获取指定模板详情"""
        return self.templates.get(template_id)
    
    def create_template(
        self,
        name: str,
        description: str,
        applicable_phases: List[str],
        applicable_modules: List[str],
        tags: List[str] = None,
        checklist_config: Dict[str, Any] = None,
        name_en: str = None
    ) -> Dict[str, Any]:
        """
        创建新模板
        
        Args:
            name: 模板名称
            description: 模板描述
            applicable_phases: 适用阶段
            applicable_modules: 适用模块
            tags: 标签
            checklist_config: 清单配置
            name_en: 英文名称
        
        Returns:
            创建的模板
        """
        template_id = f"tmpl-{uuid.uuid4().hex[:8]}"
        
        template = {
            "id": template_id,
            "name": name,
            "name_en": name_en or "",
            "description": description,
            "version": "1.0.0",
            "created_at": datetime.now().isoformat() + "Z",
            "updated_at": datetime.now().isoformat() + "Z",
            "usage_count": 0,
            "applicable_phases": applicable_phases,
            "applicable_modules": applicable_modules,
            "tags": tags or [],
            "is_builtin": False,
            "checklist_config": checklist_config or {}
        }
        
        self.templates[template_id] = template
        return template
    
    def update_template(
        self,
        template_id: str,
        **updates
    ) -> Optional[Dict[str, Any]]:
        """
        更新模板
        
        Returns:
            更新后的模板，失败返回None
        """
        if template_id not in self.templates:
            return None
        
        template = self.templates[template_id]
        
        # 不允许修改内置模板的某些字段
        if template["is_builtin"]:
            protected_fields = ["id", "created_at", "is_builtin"]
            updates = {k: v for k, v in updates.items() if k not in protected_fields}
        
        # 更新字段
        for key, value in updates.items():
            if key not in ["id", "created_at"]:
                template[key] = value
        
        template["updated_at"] = datetime.now().isoformat() + "Z"
        
        # 更新版本号
        if "version" in updates:
            template["version"] = updates["version"]
        else:
            version_parts = template["version"].split(".")
            version_parts[-1] = str(int(version_parts[-1]) + 1)
            template["version"] = ".".join(version_parts)
        
        return template
    
    def delete_template(self, template_id: str) -> bool:
        """删除模板"""
        if template_id not in self.templates:
            return False
        
        template = self.templates[template_id]
        if template["is_builtin"]:
            return False  # 不能删除内置模板
        
        del self.templates[template_id]
        return True
    
    def duplicate_template(
        self,
        template_id: str,
        new_name: str = None
    ) -> Optional[Dict[str, Any]]:
        """
        复制模板创建新版本
        
        Returns:
            新模板，失败返回None
        """
        original = self.get_template(template_id)
        if not original:
            return None
        
        return self.create_template(
            name=new_name or f"{original['name']} (副本)",
            name_en=f"{original.get('name_en', '')} (Copy)" if original.get('name_en') else None,
            description=original["description"],
            applicable_phases=original["applicable_phases"],
            applicable_modules=original["applicable_modules"],
            tags=original["tags"].copy(),
            checklist_config=original["checklist_config"].copy()
        )
    
    def increment_usage(self, template_id: str) -> bool:
        """增加模板使用次数"""
        if template_id not in self.templates:
            return False
        
        self.templates[template_id]["usage_count"] += 1
        return True
    
    def export_template(self, template_id: str, format: str = "json") -> Optional[str]:
        """
        导出模板
        
        Args:
            template_id: 模板ID
            format: 导出格式 (json/yaml)
        
        Returns:
            导出内容
        """
        template = self.get_template(template_id)
        if not template:
            return None
        
        if format == "yaml":
            return self._to_yaml(template)
        else:
            return json.dumps(template, ensure_ascii=False, indent=2)
    
    def _to_yaml(self, data: Dict[str, Any], indent: int = 0) -> str:
        """简单dict转yaml"""
        lines = []
        prefix = "  " * indent
        
        for key, value in data.items():
            if isinstance(value, dict):
                lines.append(f"{prefix}{key}:")
                lines.append(self._to_yaml(value, indent + 1))
            elif isinstance(value, list):
                lines.append(f"{prefix}{key}:")
                for item in value:
                    if isinstance(item, dict):
                        lines.append(f"{prefix}  -")
                        lines.append(self._to_yaml(item, indent + 2))
                    else:
                        lines.append(f"{prefix}  - {item}")
            else:
                lines.append(f"{prefix}{key}: {value}")
        
        return "\n".join(lines)
    
    def import_template(
        self,
        content: str,
        format: str = "json",
        overwrite: bool = False
    ) -> Dict[str, Any]:
        """
        导入模板
        
        Args:
            content: 模板内容
            format: 格式 (json/yaml)
            overwrite: 是否覆盖已存在的模板
        
        Returns:
            导入的模板
        """
        if format == "yaml":
            template = self._from_yaml(content)
        else:
            template = json.loads(content)
        
        # 检查是否已存在
        if template["id"] in self.templates:
            if overwrite:
                self.templates[template["id"]] = template
            else:
                # 生成新ID
                template["id"] = f"tmpl-{uuid.uuid4().hex[:8]}"
                template["is_builtin"] = False
        
        template["is_builtin"] = False  # 导入的模板都不是内置的
        self.templates[template["id"]] = template
        return template
    
    def _from_yaml(self, content: str) -> Dict[str, Any]:
        """简单yaml转dict"""
        # 简化实现，仅处理简单格式
        result = {}
        lines = content.strip().split("\n")
        
        i = 0
        while i < len(lines):
            line = lines[i]
            if not line.strip() or line.strip().startswith("#"):
                i += 1
                continue
            
            if ":" in line:
                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip()
                
                if not value:
                    # 可能是嵌套对象
                    i += 1
                    nested = {}
                    while i < len(lines) and lines[i].startswith("  "):
                        sub_content = "\n".join(lines[i:])
                        nested = self._from_yaml(sub_content)
                        break
                    result[key] = nested
                elif value.startswith("[") and value.endswith("]"):
                    # 列表
                    items = [s.strip().strip("'\"") for s in value[1:-1].split(",")]
                    result[key] = items
                else:
                    # 字符串值
                    result[key] = value.strip("'\"")
            
            i += 1
        
        return result
    
    def search_templates(
        self,
        query: str = None,
        tags: List[str] = None,
        modules: List[str] = None,
        phases: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        搜索模板
        
        Args:
            query: 搜索关键词
            tags: 标签筛选
            modules: 模块筛选
            phases: 阶段筛选
        
        Returns:
            匹配的模板列表
        """
        results = []
        
        for template in self.templates.values():
            # 关键词匹配
            if query:
                query_lower = query.lower()
                if not (
                    query_lower in template["name"].lower() or
                    query_lower in template["description"].lower() or
                    any(query_lower in tag.lower() for tag in template["tags"])
                ):
                    continue
            
            # 标签筛选
            if tags:
                if not any(tag in template["tags"] for tag in tags):
                    continue
            
            # 模块筛选
            if modules:
                if not any(m in template["applicable_modules"] for m in modules):
                    continue
            
            # 阶段筛选
            if phases:
                if not any(p in template["applicable_phases"] for p in phases):
                    continue
            
            results.append(template)
        
        return results
    
    def get_template_stats(self) -> Dict[str, Any]:
        """获取模板统计信息"""
        templates = list(self.templates.values())
        
        return {
            "total_templates": len(templates),
            "builtin_templates": sum(1 for t in templates if t["is_builtin"]),
            "custom_templates": sum(1 for t in templates if not t["is_builtin"]),
            "total_usage": sum(t["usage_count"] for t in templates),
            "most_used": max(
                templates,
                key=lambda t: t["usage_count"]
            )["name"] if templates else None
        }


def create_template_manager() -> TemplateManager:
    """工厂函数：创建模板管理器实例"""
    return TemplateManager()


if __name__ == "__main__":
    # 示例使用
    manager = TemplateManager()
    
    # 获取所有模板
    templates = manager.get_all_templates()
    print(f"共 {len(templates)} 个模板:")
    for tmpl in templates:
        print(f"  - {tmpl['name']} (使用次数: {tmpl['usage_count']})")
    
    # 搜索模板
    results = manager.search_templates(tags=["标准", "通用"])
    print(f"\n搜索'标准/通用'标签: {len(results)} 个结果")
    
    # 创建自定义模板
    custom = manager.create_template(
        name="自定义快速模板",
        description="基于标准模板的快速定制版本",
        applicable_phases=["requirements_analysis", "system_configuration"],
        applicable_modules=["buying"],
        tags=["自定义", "快速"]
    )
    print(f"\n创建自定义模板: {custom['id']}")
    
    # 导出模板
    export = manager.export_template("tmpl-standard-001")
    print(f"\n导出模板JSON (前500字符):")
    print(export[:500])
