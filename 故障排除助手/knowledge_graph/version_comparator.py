"""
版本差异对比 - US8 AC8.4

支持不同版本间知识的差异对比
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class DiffType(Enum):
    """差异类型"""
    ADDED = "added"           # 新增
    REMOVED = "removed"       # 删除
    MODIFIED = "modified"     # 修改
    UNCHANGED = "unchanged"  # 未变


@dataclass
class VersionDiff:
    """版本差异"""
    diff_type: DiffType
    knowledge_id: str
    title: str
    old_value: Optional[Dict] = None
    new_value: Optional[Dict] = None
    changes: List[str] = None


@dataclass
class VersionComparison:
    """版本对比结果"""
    version_a: str
    version_b: str
    summary: Dict
    diffs: List[VersionDiff]


class VersionComparator:
    """
    版本对比器
    
    AC8.4: 版本差异对比
    """
    
    def compare_versions(
        self,
        knowledge_a: List[Dict],
        knowledge_b: List[Dict],
        version_a: str,
        version_b: str
    ) -> VersionComparison:
        """
        对比两个版本的差异
        
        Args:
            knowledge_a: 版本A的知识
            knowledge_b: 版本B的知识
            version_a: 版本A标签
            version_b: 版本B标签
            
        Returns:
            版本对比结果
        """
        # 构建ID映射
        dict_a = {item.get("id"): item for item in knowledge_a}
        dict_b = {item.get("id"): item for item in knowledge_b}
        
        ids_a = set(dict_a.keys())
        ids_b = set(dict_b.keys())
        
        diffs = []
        
        # 新增的
        for kb_id in ids_b - ids_a:
            if self._has_version(dict_b[kb_id], version_b):
                diffs.append(VersionDiff(
                    diff_type=DiffType.ADDED,
                    knowledge_id=kb_id,
                    title=dict_b[kb_id].get("title", ""),
                    new_value=dict_b[kb_id]
                ))
        
        # 删除的
        for kb_id in ids_a - ids_b:
            if self._has_version(dict_a[kb_id], version_a):
                diffs.append(VersionDiff(
                    diff_type=DiffType.REMOVED,
                    knowledge_id=kb_id,
                    title=dict_a[kb_id].get("title", ""),
                    old_value=dict_a[kb_id]
                ))
        
        # 修改的
        for kb_id in ids_a & ids_b:
            changes = self._compare_items(dict_a[kb_id], dict_b[kb_id])
            if changes:
                diffs.append(VersionDiff(
                    diff_type=DiffType.MODIFIED,
                    knowledge_id=kb_id,
                    title=dict_b[kb_id].get("title", ""),
                    old_value=dict_a[kb_id],
                    new_value=dict_b[kb_id],
                    changes=changes
                ))
        
        # 统计
        summary = {
            "added": len([d for d in diffs if d.diff_type == DiffType.ADDED]),
            "removed": len([d for d in diffs if d.diff_type == DiffType.REMOVED]),
            "modified": len([d for d in diffs if d.diff_type == DiffType.MODIFIED]),
            "total": len(diffs)
        }
        
        return VersionComparison(
            version_a=version_a,
            version_b=version_b,
            summary=summary,
            diffs=diffs
        )
    
    def _has_version(self, item: Dict, version: str) -> bool:
        """检查知识是否属于某版本"""
        versions = item.get("versions", [])
        version_normalized = version.replace("#", "").upper()
        
        for v in versions:
            if version_normalized in v.replace("#", "").upper():
                return True
        return False
    
    def _compare_items(self, item_a: Dict, item_b: Dict) -> List[str]:
        """比较两个知识条目"""
        changes = []
        
        # 比较标题
        if item_a.get("title") != item_b.get("title"):
            changes.append(f"标题: '{item_a.get('title')}' -> '{item_b.get('title')}'")
        
        # 比较描述
        if item_a.get("description") != item_b.get("description"):
            changes.append("描述已修改")
        
        # 比较解决方案
        if item_a.get("solution") != item_b.get("solution"):
            changes.append("解决方案已修改")
        
        # 比较标签
        tags_a = set(item_a.get("tags", []))
        tags_b = set(item_b.get("tags", []))
        if tags_a != tags_b:
            added = tags_b - tags_a
            removed = tags_a - tags_b
            change_parts = []
            if added:
                change_parts.append(f"新增标签: {added}")
            if removed:
                change_parts.append(f"移除标签: {removed}")
            changes.append(", ".join(change_parts))
        
        return changes
    
    def generate_diff_report(self, comparison: VersionComparison) -> str:
        """生成差异报告"""
        lines = [
            "=" * 60,
            f"版本对比报告: {comparison.version_a} vs {comparison.version_b}",
            "=" * 60,
            "",
            "## 统计摘要",
            "-" * 40,
            f"新增: {comparison.summary['added']}",
            f"删除: {comparison.summary['removed']}",
            f"修改: {comparison.summary['modified']}",
            f"总计: {comparison.summary['total']}",
            "",
            "## 详细差异",
            "-" * 40
        ]
        
        for diff in comparison.diffs:
            if diff.diff_type == DiffType.ADDED:
                lines.append(f"\n[+] 新增: {diff.title}")
                lines.append(f"    ID: {diff.knowledge_id}")
            
            elif diff.diff_type == DiffType.REMOVED:
                lines.append(f"\n[-] 删除: {diff.title}")
                lines.append(f"    ID: {diff.knowledge_id}")
            
            elif diff.diff_type == DiffType.MODIFIED:
                lines.append(f"\n[M] 修改: {diff.title}")
                lines.append(f"    ID: {diff.knowledge_id}")
                if diff.changes:
                    for change in diff.changes[:5]:
                        lines.append(f"    - {change}")
        
        lines.append("\n" + "=" * 60)
        return "\n".join(lines)
    
    def get_version_statistics(self, knowledge: List[Dict]) -> Dict:
        """获取版本统计"""
        stats = {}
        
        for item in knowledge:
            for version in item.get("versions", []):
                version = version.upper()
                if version not in stats:
                    stats[version] = {"count": 0, "ids": []}
                stats[version]["count"] += 1
                stats[version]["ids"].append(item.get("id"))
        
        return stats


# 全局实例
version_comparator = VersionComparator()


__all__ = ["VersionComparator", "version_comparator", "VersionDiff", "VersionComparison", "DiffType"]
