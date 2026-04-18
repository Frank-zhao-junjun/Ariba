"""
清单执行追踪引擎 (US4)
提供清单项状态管理、时间记录、责任分配和进度可视化功能
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum


class ItemStatus(Enum):
    """清单项状态"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"
    BLOCKED = "blocked"


class TrackingEngine:
    """执行追踪引擎"""
    
    def __init__(self):
        """初始化追踪引擎"""
        self.track_records = {}  # 追踪记录
        self.assignees = {}  # 责任人列表
    
    def update_item_status(
        self,
        checklist_id: str,
        item_id: str,
        new_status: str,
        notes: str = None,
        assignee: str = None
    ) -> Dict[str, Any]:
        """
        更新清单项状态
        
        Args:
            checklist_id: 检查清单ID
            item_id: 清单项ID
            new_status: 新状态
            notes: 备注
            assignee: 责任人
        
        Returns:
            更新结果
        """
        # 验证状态值
        try:
            status = ItemStatus(new_status)
        except ValueError:
            return {"success": False, "error": f"无效的状态值: {new_status}"}
        
        # 获取记录键
        record_key = f"{checklist_id}:{item_id}"
        
        # 获取或创建记录
        if record_key not in self.track_records:
            self.track_records[record_key] = {
                "checklist_id": checklist_id,
                "item_id": item_id,
                "status": ItemStatus.NOT_STARTED.value,
                "start_time": None,
                "end_time": None,
                "duration_minutes": 0,
                "assignee": None,
                "notes": "",
                "history": []
            }
        
        record = self.track_records[record_key]
        old_status = record["status"]
        
        # 状态变更处理
        now = datetime.now()
        if status == ItemStatus.IN_PROGRESS and record["start_time"] is None:
            record["start_time"] = now.isoformat()
        elif status in [ItemStatus.COMPLETED, ItemStatus.VERIFIED]:
            record["end_time"] = now.isoformat()
            if record["start_time"]:
                start = datetime.fromisoformat(record["start_time"])
                record["duration_minutes"] = int((now - start).total_seconds() / 60)
        
        # 更新状态
        record["status"] = status.value
        
        # 添加历史记录
        record["history"].append({
            "timestamp": now.isoformat(),
            "old_status": old_status,
            "new_status": status.value,
            "notes": notes
        })
        
        # 更新备注
        if notes:
            record["notes"] = notes
        
        # 更新责任人
        if assignee:
            record["assignee"] = assignee
            self.assignees[assignee] = assignee
        
        return {
            "success": True,
            "record": record,
            "old_status": old_status,
            "new_status": status.value
        }
    
    def assign_items(
        self,
        checklist_id: str,
        item_ids: List[str],
        assignee: str
    ) -> Dict[str, Any]:
        """
        批量分配责任人
        
        Args:
            checklist_id: 检查清单ID
            item_ids: 清单项ID列表
            assignee: 责任人
        
        Returns:
            分配结果
        """
        results = []
        for item_id in item_ids:
            record_key = f"{checklist_id}:{item_id}"
            
            if record_key not in self.track_records:
                self.track_records[record_key] = {
                    "checklist_id": checklist_id,
                    "item_id": item_id,
                    "status": ItemStatus.NOT_STARTED.value,
                    "start_time": None,
                    "end_time": None,
                    "duration_minutes": 0,
                    "assignee": None,
                    "notes": "",
                    "history": []
                }
            
            self.track_records[record_key]["assignee"] = assignee
            results.append({
                "item_id": item_id,
                "assignee": assignee
            })
        
        self.assignees[assignee] = assignee
        
        return {
            "success": True,
            "assigned_count": len(results),
            "assignee": assignee,
            "items": results
        }
    
    def get_item_record(
        self,
        checklist_id: str,
        item_id: str
    ) -> Optional[Dict[str, Any]]:
        """获取清单项追踪记录"""
        record_key = f"{checklist_id}:{item_id}"
        return self.track_records.get(record_key)
    
    def get_checklist_progress(
        self,
        checklist: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        计算检查清单进度
        
        Args:
            checklist: 检查清单
        
        Returns:
            进度信息
        """
        total_items = len(checklist.get("items", []))
        
        if total_items == 0:
            return {
                "total_items": 0,
                "completed_items": 0,
                "in_progress_items": 0,
                "blocked_items": 0,
                "not_started_items": 0,
                "completion_rate": 0.0,
                "verified_items": 0,
                "phase_progress": {},
                "module_progress": {}
            }
        
        # 统计状态
        status_counts = {
            ItemStatus.NOT_STARTED.value: 0,
            ItemStatus.IN_PROGRESS.value: 0,
            ItemStatus.COMPLETED.value: 0,
            ItemStatus.VERIFIED.value: 0,
            ItemStatus.BLOCKED.value: 0
        }
        
        # 按阶段统计
        phase_progress = {}
        
        # 按模块统计
        module_progress = {}
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = self.track_records.get(record_key, {})
            status = record.get("status", ItemStatus.NOT_STARTED.value)
            
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # 阶段进度
            phase = item.get("phase", "unknown")
            if phase not in phase_progress:
                phase_progress[phase] = {
                    "total": 0,
                    "completed": 0,
                    "in_progress": 0,
                    "blocked": 0
                }
            phase_progress[phase]["total"] += 1
            if status == ItemStatus.COMPLETED.value:
                phase_progress[phase]["completed"] += 1
            elif status == ItemStatus.IN_PROGRESS.value:
                phase_progress[phase]["in_progress"] += 1
            elif status == ItemStatus.BLOCKED.value:
                phase_progress[phase]["blocked"] += 1
            
            # 模块进度
            modules = item.get("module", [])
            for module in modules:
                if module not in module_progress:
                    module_progress[module] = {
                        "total": 0,
                        "completed": 0
                    }
                module_progress[module]["total"] += 1
                if status == ItemStatus.COMPLETED.value:
                    module_progress[module]["completed"] += 1
        
        # 计算完成率（completed + verified 视为完成）
        completed_count = status_counts[ItemStatus.COMPLETED.value] + status_counts[ItemStatus.VERIFIED.value]
        completion_rate = completed_count / total_items if total_items > 0 else 0.0
        
        # 计算各阶段完成率
        for phase, stats in phase_progress.items():
            stats["completion_rate"] = (
                stats["completed"] / stats["total"] if stats["total"] > 0 else 0.0
            )
        
        # 计算各模块完成率
        for module, stats in module_progress.items():
            stats["completion_rate"] = (
                stats["completed"] / stats["total"] if stats["total"] > 0 else 0.0
            )
        
        return {
            "total_items": total_items,
            "completed_items": status_counts[ItemStatus.COMPLETED.value],
            "verified_items": status_counts[ItemStatus.VERIFIED.value],
            "in_progress_items": status_counts[ItemStatus.IN_PROGRESS.value],
            "blocked_items": status_counts[ItemStatus.BLOCKED.value],
            "not_started_items": status_counts[ItemStatus.NOT_STARTED.value],
            "completion_rate": completion_rate,
            "phase_progress": phase_progress,
            "module_progress": module_progress
        }
    
    def generate_gantt_data(
        self,
        checklist: Dict[str, Any],
        start_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """
        生成甘特图数据
        
        Args:
            checklist: 检查清单
            start_date: 开始日期
        
        Returns:
            甘特图数据列表
        """
        if start_date is None:
            start_date = datetime.now()
        
        gantt_items = []
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = self.track_records.get(record_key, {})
            
            # 计算计划开始和结束时间
            phase_order = [
                "requirements_analysis",
                "system_configuration",
                "data_migration",
                "user_training",
                "go_live_support"
            ]
            phase = item.get("phase", "unknown")
            phase_index = phase_order.index(phase) if phase in phase_order else 0
            
            # 默认每个阶段2周
            plan_start = start_date + timedelta(days=phase_index * 14)
            plan_end = plan_start + timedelta(days=7)  # 每项7天
            
            # 实际时间
            actual_start = None
            actual_end = None
            
            if record.get("start_time"):
                actual_start = datetime.fromisoformat(record["start_time"])
            if record.get("end_time"):
                actual_end = datetime.fromisoformat(record["end_time"])
            
            gantt_items.append({
                "id": item["id"],
                "title": item["title"],
                "phase": item.get("phase_name", phase),
                "priority": item.get("priority", "medium"),
                "status": record.get("status", ItemStatus.NOT_STARTED.value),
                "assignee": record.get("assignee"),
                "plan_start": plan_start.isoformat(),
                "plan_end": plan_end.isoformat(),
                "actual_start": actual_start.isoformat() if actual_start else None,
                "actual_end": actual_end.isoformat() if actual_end else None,
                "progress": self._calculate_item_progress(record.get("status", "not_started"))
            })
        
        return gantt_items
    
    def _calculate_item_progress(self, status: str) -> float:
        """计算单项进度百分比"""
        progress_map = {
            ItemStatus.NOT_STARTED.value: 0.0,
            ItemStatus.IN_PROGRESS.value: 0.5,
            ItemStatus.COMPLETED.value: 0.9,
            ItemStatus.VERIFIED.value: 1.0,
            ItemStatus.BLOCKED.value: 0.25
        }
        return progress_map.get(status, 0.0)
    
    def get_blocked_items(
        self,
        checklist: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """获取受阻的清单项"""
        blocked = []
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = self.track_records.get(record_key, {})
            
            if record.get("status") == ItemStatus.BLOCKED.value:
                blocked.append({
                    **item,
                    "assignee": record.get("assignee"),
                    "notes": record.get("notes"),
                    "blocked_since": record.get("history", [{}])[-1].get("timestamp") if record.get("history") else None
                })
        
        return blocked
    
    def get_overdue_items(
        self,
        checklist: Dict[str, Any],
        due_date: datetime = None
    ) -> List[Dict[str, Any]]:
        """
        获取超期清单项
        
        Args:
            checklist: 检查清单
            due_date: 截止日期
        
        Returns:
            超期项列表
        """
        if due_date is None:
            due_date = datetime.now()
        
        overdue = []
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = self.track_records.get(record_key, {})
            
            status = record.get("status", ItemStatus.NOT_STARTED.value)
            
            # 只检查未完成且有截止日期的项
            if status in [ItemStatus.COMPLETED.value, ItemStatus.VERIFIED.value]:
                continue
            
            if record.get("end_time"):
                item_end = datetime.fromisoformat(record["end_time"])
                if item_end < due_date:
                    overdue.append({
                        **item,
                        "assignee": record.get("assignee"),
                        "status": status,
                        "due_date": record["end_time"],
                        "days_overdue": (due_date - item_end).days
                    })
        
        return overdue
    
    def get_assignee_workload(
        self,
        checklist: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        获取责任人工作量统计
        
        Args:
            checklist: 检查清单
        
        Returns:
            工作量统计
        """
        workload = {}
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = self.track_records.get(record_key, {})
            assignee = record.get("assignee")
            
            if not assignee:
                continue
            
            if assignee not in workload:
                workload[assignee] = {
                    "total_items": 0,
                    "completed_items": 0,
                    "in_progress_items": 0,
                    "blocked_items": 0,
                    "total_duration_minutes": 0,
                    "items": []
                }
            
            status = record.get("status", ItemStatus.NOT_STARTED.value)
            
            workload[assignee]["total_items"] += 1
            workload[assignee]["total_duration_minutes"] += record.get("duration_minutes", 0)
            workload[assignee]["items"].append({
                "id": item["id"],
                "title": item["title"],
                "phase": item.get("phase_name"),
                "status": status
            })
            
            if status == ItemStatus.COMPLETED.value or status == ItemStatus.VERIFIED.value:
                workload[assignee]["completed_items"] += 1
            elif status == ItemStatus.IN_PROGRESS.value:
                workload[assignee]["in_progress_items"] += 1
            elif status == ItemStatus.BLOCKED.value:
                workload[assignee]["blocked_items"] += 1
        
        # 计算完成率
        for stats in workload.values():
            stats["completion_rate"] = (
                stats["completed_items"] / stats["total_items"]
                if stats["total_items"] > 0 else 0.0
            )
            stats["avg_duration_per_item"] = (
                stats["total_duration_minutes"] / stats["completed_items"]
                if stats["completed_items"] > 0 else 0
            )
        
        return workload
    
    def export_progress_report(
        self,
        checklist: Dict[str, Any],
        format: str = "markdown"
    ) -> str:
        """
        导出进度报告
        
        Args:
            checklist: 检查清单
            format: 报告格式
        
        Returns:
            报告内容
        """
        progress = self.get_checklist_progress(checklist)
        blocked = self.get_blocked_items(checklist)
        overdue = self.get_overdue_items(checklist)
        workload = self.get_assignee_workload(checklist)
        
        if format == "json":
            return json.dumps({
                "checklist_id": checklist["id"],
                "checklist_name": checklist["name"],
                "generated_at": datetime.now().isoformat(),
                "progress": progress,
                "blocked_items": blocked,
                "overdue_items": overdue,
                "assignee_workload": workload
            }, ensure_ascii=False, indent=2)
        
        # Markdown格式
        lines = [
            f"# {checklist['name']} - 进度报告",
            "",
            f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "---",
            "",
            "## 总体进度",
            "",
            f"- **总项目数**: {progress['total_items']}",
            f"- **完成率**: {progress['completion_rate']:.1%}",
            f"- **已完成**: {progress['completed_items']}",
            f"- **已验证**: {progress['verified_items']}",
            f"- **进行中**: {progress['in_progress_items']}",
            f"- **受阻**: {progress['blocked_items']}",
            f"- **未开始**: {progress['not_started_items']}",
            "",
            "## 状态分布",
            ""
        ]
        
        # 进度条
        total = progress['total_items']
        if total > 0:
            completed = progress['completed_items'] + progress['verified_items']
            in_progress = progress['in_progress_items']
            blocked = progress['blocked_items']
            
            bar_length = 40
            filled = int(bar_length * completed / total)
            in_progress_filled = int(bar_length * in_progress / total)
            blocked_filled = int(bar_length * blocked / total)
            
            bar = "[" + "=" * filled + " " * (bar_length - filled) + "]"
            lines.append(f"```")
            lines.append(f"进度: {bar} {progress['completion_rate']:.1%}")
            lines.append(f"```")
        
        lines.extend([
            "",
            "## 阶段进度",
            ""
        ])
        
        for phase, stats in progress.get("phase_progress", {}).items():
            phase_name = phase.replace("_", " ").title()
            lines.append(
                f"- **{phase_name}**: {stats['completion_rate']:.1%} "
                f"({stats['completed']}/{stats['total']})"
            )
        
        if blocked:
            lines.extend([
                "",
                "## 受阻项目",
                ""
            ])
            for item in blocked:
                lines.append(
                    f"- {item['title']} - "
                    f"责任人: {item.get('assignee', '未分配')} - "
                    f"备注: {item.get('notes', '无')}"
                )
        
        if overdue:
            lines.extend([
                "",
                "## 超期项目",
                ""
            ])
            for item in overdue:
                lines.append(
                    f"- {item['title']} - "
                    f"超期: {item['days_overdue']}天 - "
                    f"责任人: {item.get('assignee', '未分配')}"
                )
        
        if workload:
            lines.extend([
                "",
                "## 责任人工作量",
                ""
            ])
            for assignee, stats in workload.items():
                lines.append(
                    f"- **{assignee}**: "
                    f"{stats['completed_items']}/{stats['total_items']} 完成 "
                    f"({stats['completion_rate']:.1%}), "
                    f"耗时: {stats['total_duration_minutes']}分钟"
                )
        
        return "\n".join(lines)


def create_tracking_engine() -> TrackingEngine:
    """工厂函数：创建追踪引擎实例"""
    return TrackingEngine()


if __name__ == "__main__":
    # 示例使用
    from core.checklist_generator import ChecklistGenerator
    
    # 创建测试清单
    generator = ChecklistGenerator()
    checklist = generator.generate_all_phases_checklist(
        modules=["sourcing", "buying", "supplier"],
        version="V2605",
        project_name="测试项目"
    )
    
    # 创建追踪引擎
    tracker = TrackingEngine()
    
    # 更新几个项的状态
    for i, item in enumerate(checklist["items"][:5]):
        status = [
            ItemStatus.COMPLETED.value,
            ItemStatus.IN_PROGRESS.value,
            ItemStatus.NOT_STARTED.value,
            ItemStatus.BLOCKED.value,
            ItemStatus.COMPLETED.value
        ][i]
        tracker.update_item_status(
            checklist["id"],
            item["id"],
            status,
            assignee=f"user{i+1}"
        )
    
    # 获取进度
    progress = tracker.get_checklist_progress(checklist)
    print("进度信息:")
    print(f"  总项目: {progress['total_items']}")
    print(f"  完成率: {progress['completion_rate']:.1%}")
    print(f"  受阻项: {progress['blocked_items']}")
    
    # 获取受阻项
    blocked = tracker.get_blocked_items(checklist)
    print(f"\n受阻项: {len(blocked)}")
    for item in blocked:
        print(f"  - {item['title']}")
    
    # 导出报告
    report = tracker.export_progress_report(checklist)
    print("\n报告预览（前1000字符）:")
    print(report[:1000])
