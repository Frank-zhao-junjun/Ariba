"""
统计分析引擎 (US5)
提供完成率统计、延迟分析、健康度评分和报告生成功能
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum


class HealthLevel(Enum):
    """健康等级"""
    EXCELLENT = "excellent"      # 90-100
    GOOD = "good"                # 75-89
    FAIR = "fair"                # 60-74
    NEEDS_IMPROVEMENT = "needs_improvement"  # 40-59
    CRITICAL = "critical"        # 0-39


class AnalyticsEngine:
    """统计分析引擎"""
    
    def __init__(self):
        """初始化分析引擎"""
        self.historical_data = {}  # 历史数据存储
    
    def calculate_completion_stats(
        self,
        checklist: Dict[str, Any],
        track_records: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        计算完成率统计
        
        Args:
            checklist: 检查清单
            track_records: 追踪记录
        
        Returns:
            完成率统计
        """
        total_items = len(checklist.get("items", []))
        
        if total_items == 0:
            return self._empty_completion_stats()
        
        # 统计各状态数量
        status_counts = {
            "not_started": 0,
            "in_progress": 0,
            "completed": 0,
            "verified": 0,
            "blocked": 0
        }
        
        phase_stats = {}
        module_stats = {}
        priority_stats = {"high": {}, "medium": {}, "low": {}}
        category_stats = {}
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = track_records.get(record_key, {}) if track_records else {}
            status = record.get("status", "not_started")
            
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # 按阶段统计
            phase = item.get("phase", "unknown")
            if phase not in phase_stats:
                phase_stats[phase] = {
                    "name": item.get("phase_name", phase),
                    "total": 0,
                    "completed": 0,
                    "in_progress": 0,
                    "blocked": 0,
                    "not_started": 0
                }
            phase_stats[phase]["total"] += 1
            phase_stats[phase][status] = phase_stats[phase].get(status, 0) + 1
            
            # 按模块统计
            modules = item.get("module", [])
            for module in modules:
                if module not in module_stats:
                    module_stats[module] = {
                        "total": 0,
                        "completed": 0,
                        "in_progress": 0,
                        "blocked": 0
                    }
                module_stats[module]["total"] += 1
                module_stats[module][status] = module_stats[module].get(status, 0) + 1
            
            # 按优先级统计
            priority = item.get("priority", "medium")
            if priority not in priority_stats:
                priority_stats[priority] = {
                    "total": 0,
                    "completed": 0,
                    "completion_rate": 0.0
                }
            if "total" not in priority_stats[priority]:
                priority_stats[priority]["total"] = 0
                priority_stats[priority]["completed"] = 0
                priority_stats[priority]["completion_rate"] = 0.0
            priority_stats[priority]["total"] += 1
            if status in ["completed", "verified"]:
                priority_stats[priority]["completed"] += 1
            
            # 按类别统计
            category = item.get("category", "other")
            if category not in category_stats:
                category_stats[category] = {
                    "total": 0,
                    "completed": 0
                }
            category_stats[category]["total"] += 1
            if status in ["completed", "verified"]:
                category_stats[category]["completed"] += 1
        
        # 计算完成率
        completed_count = status_counts["completed"] + status_counts["verified"]
        overall_completion_rate = completed_count / total_items
        
        # 计算各维度完成率
        for phase in phase_stats.values():
            phase["completion_rate"] = (
                (phase["completed"] + phase.get("verified", 0)) / phase["total"]
                if phase["total"] > 0 else 0.0
            )
        
        for module in module_stats.values():
            module["completion_rate"] = (
                (module["completed"] + module.get("verified", 0)) / module["total"]
                if module["total"] > 0 else 0.0
            )
        
        for priority in priority_stats.values():
            priority["completion_rate"] = (
                priority["completed"] / priority["total"]
                if priority["total"] > 0 else 0.0
            )
        
        for category in category_stats.values():
            category["completion_rate"] = (
                category["completed"] / category["total"]
                if category["total"] > 0 else 0.0
            )
        
        return {
            "total_items": total_items,
            "overall_completion_rate": overall_completion_rate,
            "overall_completion_percentage": round(overall_completion_rate * 100, 1),
            "status_distribution": status_counts,
            "status_percentages": {
                status: round(count / total_items * 100, 1)
                for status, count in status_counts.items()
            },
            "phase_stats": phase_stats,
            "module_stats": module_stats,
            "priority_stats": priority_stats,
            "category_stats": category_stats,
            "completed_items": completed_count,
            "remaining_items": total_items - completed_count
        }
    
    def _empty_completion_stats(self) -> Dict[str, Any]:
        """返回空的完成率统计"""
        return {
            "total_items": 0,
            "overall_completion_rate": 0.0,
            "overall_completion_percentage": 0.0,
            "status_distribution": {},
            "status_percentages": {},
            "phase_stats": {},
            "module_stats": {},
            "priority_stats": {},
            "category_stats": {},
            "completed_items": 0,
            "remaining_items": 0
        }
    
    def analyze_delays(
        self,
        checklist: Dict[str, Any],
        track_records: Dict[str, Any] = None,
        expected_end_date: datetime = None
    ) -> Dict[str, Any]:
        """
        延迟分析
        
        Args:
            checklist: 检查清单
            track_records: 追踪记录
            expected_end_date: 预期结束日期
        
        Returns:
            延迟分析结果
        """
        if expected_end_date is None:
            expected_end_date = datetime.now()
        
        overdue_items = []
        at_risk_items = []
        potential_delays = []
        
        for item in checklist["items"]:
            record_key = f"{checklist['id']}:{item['id']}"
            record = track_records.get(record_key, {}) if track_records else {}
            status = record.get("status", "not_started")
            
            # 已完成或已验证的跳过
            if status in ["completed", "verified"]:
                continue
            
            # 获取计划结束时间（如果有）
            planned_end = None
            if record.get("end_time"):
                planned_end = datetime.fromisoformat(record["end_time"])
            
            # 超期项
            if planned_end and planned_end < expected_end_date:
                days_overdue = (expected_end_date - planned_end).days
                overdue_items.append({
                    "id": item["id"],
                    "title": item["title"],
                    "phase": item.get("phase_name"),
                    "priority": item.get("priority"),
                    "assignee": record.get("assignee"),
                    "planned_end": planned_end.isoformat(),
                    "days_overdue": days_overdue,
                    "status": status
                })
            
            # 高优先级未开始项（风险项）
            elif status == "not_started" and item.get("priority") == "high":
                at_risk_items.append({
                    "id": item["id"],
                    "title": item["title"],
                    "phase": item.get("phase_name"),
                    "priority": item.get("priority"),
                    "assignee": record.get("assignee"),
                    "status": status,
                    "risk_reason": "高优先级项尚未开始"
                })
            
            # 进行中超过预估时间的项
            elif status == "in_progress":
                start_time = record.get("start_time")
                if start_time:
                    start = datetime.fromisoformat(start_time)
                    duration_minutes = record.get("duration_minutes", 0)
                    
                    # 预估标准：高优先级项不超过3天，中优先级不超过5天，低优先级不超过7天
                    max_duration = {
                        "high": 3 * 24 * 60,
                        "medium": 5 * 24 * 60,
                        "low": 7 * 24 * 60
                    }.get(item.get("priority", "medium"), 5 * 24 * 60)
                    
                    if duration_minutes > max_duration:
                        days_elapsed = duration_minutes / (24 * 60)
                        potential_delays.append({
                            "id": item["id"],
                            "title": item["title"],
                            "phase": item.get("phase_name"),
                            "priority": item.get("priority"),
                            "assignee": record.get("assignee"),
                            "status": status,
                            "days_elapsed": round(days_elapsed, 1),
                            "max_days": max_duration / (24 * 60),
                            "risk_reason": f"进行中时间({days_elapsed:.1f}天)超过预估({max_duration/(24*60)}天)"
                        })
        
        # 按超期天数排序
        overdue_items.sort(key=lambda x: x["days_overdue"], reverse=True)
        
        return {
            "overdue_items": overdue_items,
            "overdue_count": len(overdue_items),
            "at_risk_items": at_risk_items,
            "at_risk_count": len(at_risk_items),
            "potential_delays": potential_delays,
            "potential_delay_count": len(potential_delays),
            "total_at_risk": len(overdue_items) + len(at_risk_items) + len(potential_delays),
            "delay_rate": (
                (len(overdue_items) + len(potential_delays)) / len(checklist.get("items", []))
                if checklist.get("items") else 0.0
            )
        }
    
    def calculate_health_score(
        self,
        checklist: Dict[str, Any],
        track_records: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        计算项目健康度评分
        
        评分模型:
        - 完成率: 40%
        - 进度符合度: 20%
        - 阻塞项处理: 20%
        - 风险项占比: 20%
        
        Args:
            checklist: 检查清单
            track_records: 追踪记录
        
        Returns:
            健康度评分
        """
        total_items = len(checklist.get("items", []))
        
        if total_items == 0:
            return {
                "health_score": 100,
                "health_level": HealthLevel.EXCELLENT.value,
                "details": {},
                "recommendations": ["暂无数据"]
            }
        
        # 1. 完成率得分 (40分)
        completion_stats = self.calculate_completion_stats(checklist, track_records)
        completion_rate = completion_stats["overall_completion_rate"]
        completion_score = completion_rate * 40
        
        # 2. 进度符合度得分 (20分)
        # 基于预期时间线评估实际进度
        expected_completion_rate = self._calculate_expected_progress(checklist)
        progress_variance = completion_rate - expected_completion_rate
        
        if progress_variance >= 0:
            # 进度超前或符合预期
            progress_score = 20
        else:
            # 进度滞后
            progress_score = max(0, 20 * (1 + progress_variance))
        
        # 3. 阻塞项处理得分 (20分)
        blocked_count = completion_stats["status_distribution"].get("blocked", 0)
        blocked_ratio = blocked_count / total_items
        
        # 阻塞项越少越好
        if blocked_ratio == 0:
            blocked_score = 20
        elif blocked_ratio <= 0.05:
            blocked_score = 15
        elif blocked_ratio <= 0.1:
            blocked_score = 10
        else:
            blocked_score = max(0, 10 - (blocked_ratio - 0.1) * 50)
        
        # 4. 风险项占比得分 (20分)
        high_priority_items = completion_stats["priority_stats"].get("high", {})
        high_total = high_priority_items.get("total", 0)
        high_completed = high_priority_items.get("completed", 0)
        
        if high_total == 0:
            risk_score = 20
        else:
            high_completion_rate = high_completed / high_total
            risk_score = high_completion_rate * 20
        
        # 总分
        total_score = completion_score + progress_score + blocked_score + risk_score
        
        # 确定健康等级
        if total_score >= 90:
            health_level = HealthLevel.EXCELLENT.value
        elif total_score >= 75:
            health_level = HealthLevel.GOOD.value
        elif total_score >= 60:
            health_level = HealthLevel.FAIR.value
        elif total_score >= 40:
            health_level = HealthLevel.NEEDS_IMPROVEMENT.value
        else:
            health_level = HealthLevel.CRITICAL.value
        
        return {
            "health_score": round(total_score, 1),
            "health_level": health_level,
            "max_score": 100,
            "details": {
                "completion_score": {
                    "value": round(completion_score, 1),
                    "max": 40,
                    "rate": completion_rate
                },
                "progress_score": {
                    "value": round(progress_score, 1),
                    "max": 20,
                    "variance": round(progress_variance, 3)
                },
                "blocked_score": {
                    "value": round(blocked_score, 1),
                    "max": 20,
                    "blocked_count": blocked_count
                },
                "risk_score": {
                    "value": round(risk_score, 1),
                    "max": 20,
                    "high_priority_completion": high_completion_rate if high_total > 0 else 1.0
                }
            },
            "recommendations": self._generate_health_recommendations(
                total_score, health_level,
                completion_stats, blocked_count, progress_variance
            )
        }
    
    def _calculate_expected_progress(self, checklist: Dict[str, Any]) -> float:
        """计算预期完成率"""
        # 简化模型：根据清单创建时间计算
        created_at = checklist.get("created_at")
        if not created_at:
            return 0.0
        
        created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        now = datetime.now()
        
        # 假设总工期为60天
        total_days = 60
        elapsed_days = (now - created.replace(tzinfo=None)).days
        
        if elapsed_days < 0:
            return 0.0
        
        return min(1.0, elapsed_days / total_days)
    
    def _generate_health_recommendations(
        self,
        score: float,
        level: str,
        completion_stats: Dict[str, Any],
        blocked_count: int,
        progress_variance: float
    ) -> List[str]:
        """生成健康度改进建议"""
        recommendations = []
        
        if level == HealthLevel.EXCELLENT.value:
            recommendations.append("项目进展优秀，继续保持当前节奏")
            recommendations.append("关注细节，确保交付质量")
        elif level == HealthLevel.GOOD.value:
            recommendations.append("项目整体良好，可适当加速")
            recommendations.append("关注落后于预期的阶段")
        elif level == HealthLevel.FAIR.value:
            recommendations.append("项目进度需要关注，建议增加资源投入")
            recommendations.append("识别瓶颈项并优先处理")
        elif level == HealthLevel.NEEDS_IMPROVEMENT.value:
            recommendations.append("项目存在较大风险，需要立即采取行动")
            recommendations.append("建议召开项目复盘会议，分析滞后原因")
            recommendations.append("考虑调整项目范围或延长工期")
        else:
            recommendations.append("项目状态危急，建议立即升级至高层管理")
            recommendations.append("进行紧急项目评审，制定Recovery计划")
            recommendations.append("可能需要引入外部资源支援")
        
        # 针对性建议
        if blocked_count > 0:
            recommendations.append(f"注意：当前有{blocked_count}个受阻项，建议优先解决")
        
        if progress_variance < -0.2:
            recommendations.append("进度明显落后于预期，需要分析原因并调整计划")
        
        completion_rate = completion_stats.get("overall_completion_rate", 0)
        if completion_rate < 0.3:
            recommendations.append("完成率偏低，建议增加每日站会频率")
        
        return recommendations
    
    def generate_analytics_report(
        self,
        checklist: Dict[str, Any],
        track_records: Dict[str, Any] = None,
        format: str = "markdown"
    ) -> str:
        """
        生成统计分析报告
        
        Args:
            checklist: 检查清单
            track_records: 追踪记录
            format: 报告格式
        
        Returns:
            报告内容
        """
        # 计算各项指标
        completion_stats = self.calculate_completion_stats(checklist, track_records)
        delay_analysis = self.analyze_delays(checklist, track_records)
        health_score = self.calculate_health_score(checklist, track_records)
        
        if format == "json":
            return json.dumps({
                "checklist_id": checklist["id"],
                "checklist_name": checklist["name"],
                "generated_at": datetime.now().isoformat(),
                "completion_stats": completion_stats,
                "delay_analysis": delay_analysis,
                "health_score": health_score
            }, ensure_ascii=False, indent=2)
        
        # Markdown格式
        lines = [
            f"# {checklist['name']} - 统计分析报告",
            "",
            f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "---",
            "",
            "## 项目健康度",
            "",
            f"### 健康评分: {health_score['health_score']}/100",
            ""
        ]
        
        # 健康等级颜色指示
        level_emojis = {
            HealthLevel.EXCELLENT.value: "🟢",
            HealthLevel.GOOD.value: "🟡",
            HealthLevel.FAIR.value: "🟠",
            HealthLevel.NEEDS_IMPROVEMENT.value: "🔴",
            HealthLevel.CRITICAL.value: "⚠️"
        }
        level_names = {
            HealthLevel.EXCELLENT.value: "优秀",
            HealthLevel.GOOD.value: "良好",
            HealthLevel.FAIR.value: "一般",
            HealthLevel.NEEDS_IMPROVEMENT.value: "需改进",
            HealthLevel.CRITICAL.value: "严重问题"
        }
        
        emoji = level_emojis.get(health_score["health_level"], "⚪")
        level_name = level_names.get(health_score["health_level"], "未知")
        lines.append(f"{emoji} **健康等级**: {level_name}")
        lines.append("")
        
        lines.append("#### 评分详情")
        for key, detail in health_score["details"].items():
            lines.append(f"- **{key}**: {detail['value']}/{detail['max']}")
        lines.append("")
        
        lines.append("#### 改进建议")
        for rec in health_score["recommendations"]:
            lines.append(f"- {rec}")
        
        lines.extend([
            "",
            "---",
            "",
            "## 完成率统计",
            "",
            f"- **总体完成率**: {completion_stats['overall_completion_percentage']:.1f}%",
            f"- **已完成**: {completion_stats['completed_items']}项",
            f"- **剩余**: {completion_stats['remaining_items']}项",
            ""
        ])
        
        # 状态分布
        lines.append("### 状态分布")
        lines.append("")
        status_names = {
            "completed": "已完成",
            "verified": "已验证",
            "in_progress": "进行中",
            "blocked": "受阻",
            "not_started": "未开始"
        }
        
        for status, count in completion_stats["status_distribution"].items():
            pct = completion_stats["status_percentages"].get(status, 0)
            name = status_names.get(status, status)
            bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
            lines.append(f"- {name}: {bar} {pct:.1f}% ({count})")
        
        # 阶段统计
        lines.extend([
            "",
            "### 各阶段完成率",
            ""
        ])
        
        for phase, stats in completion_stats.get("phase_stats", {}).items():
            pct = stats.get("completion_rate", 0) * 100
            name = stats.get("name", phase)
            lines.append(f"- **{name}**: {pct:.1f}% ({stats['completed']}/{stats['total']})")
        
        # 延迟分析
        lines.extend([
            "",
            "---",
            "",
            "## 延迟分析",
            ""
        ])
        
        lines.append(f"- **超期项目**: {delay_analysis['overdue_count']}项")
        lines.append(f"- **高风险项目**: {delay_analysis['at_risk_count']}项")
        lines.append(f"- **潜在延迟**: {delay_analysis['potential_delay_count']}项")
        lines.append("")
        
        if delay_analysis["overdue_items"]:
            lines.append("### 超期项目列表")
            for item in delay_analysis["overdue_items"][:5]:
                lines.append(
                    f"- {item['title']}: 超期{item['days_overdue']}天 "
                    f"(责任人: {item.get('assignee', '未分配')})"
                )
        
        if delay_analysis["at_risk_items"]:
            lines.extend(["", "### 高风险项目"])
            for item in delay_analysis["at_risk_items"][:5]:
                lines.append(f"- {item['title']}: {item['risk_reason']}")
        
        return "\n".join(lines)
    
    def generate_chart_data(
        self,
        checklist: Dict[str, Any],
        track_records: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        生成图表数据
        
        Returns:
            图表数据（可用于ECharts等可视化库）
        """
        completion_stats = self.calculate_completion_stats(checklist, track_records)
        
        return {
            "completion_gauge": {
                "value": completion_stats["overall_completion_percentage"],
                "name": "完成率"
            },
            "status_pie": {
                "data": [
                    {"name": "已完成", "value": completion_stats["status_distribution"].get("completed", 0)},
                    {"name": "已验证", "value": completion_stats["status_distribution"].get("verified", 0)},
                    {"name": "进行中", "value": completion_stats["status_distribution"].get("in_progress", 0)},
                    {"name": "受阻", "value": completion_stats["status_distribution"].get("blocked", 0)},
                    {"name": "未开始", "value": completion_stats["status_distribution"].get("not_started", 0)}
                ]
            },
            "phase_bar": {
                "phases": [
                    stats.get("name", phase)
                    for phase, stats in completion_stats.get("phase_stats", {}).items()
                ],
                "completion_rates": [
                    stats.get("completion_rate", 0) * 100
                    for stats in completion_stats.get("phase_stats", {}).values()
                ]
            },
            "module_bar": {
                "modules": list(completion_stats.get("module_stats", {}).keys()),
                "completion_rates": [
                    stats.get("completion_rate", 0) * 100
                    for stats in completion_stats.get("module_stats", {}).values()
                ]
            }
        }


def create_analytics_engine() -> AnalyticsEngine:
    """工厂函数：创建分析引擎实例"""
    return AnalyticsEngine()


if __name__ == "__main__":
    # 示例使用
    from core.checklist_generator import ChecklistGenerator
    from tracking.tracking_engine import TrackingEngine, ItemStatus
    
    # 创建测试数据
    generator = ChecklistGenerator()
    checklist = generator.generate_all_phases_checklist(
        modules=["sourcing", "buying", "supplier"],
        version="V2605"
    )
    
    tracker = TrackingEngine()
    
    # 模拟一些进度
    for i, item in enumerate(checklist["items"][:20]):
        status = [
            "completed", "completed", "in_progress",
            "completed", "blocked", "not_started",
            "completed", "in_progress", "completed",
            "not_started", "completed", "verified",
            "completed", "in_progress", "completed",
            "not_started", "completed", "in_progress",
            "completed", "verified"
        ][i % 20]
        
        tracker.update_item_status(
            checklist["id"],
            item["id"],
            status,
            assignee=f"user{i % 3 + 1}"
        )
    
    # 分析引擎
    engine = AnalyticsEngine()
    
    # 完成率统计
    stats = engine.calculate_completion_stats(checklist, tracker.track_records)
    print(f"完成率: {stats['overall_completion_percentage']:.1f}%")
    
    # 健康度评分
    health = engine.calculate_health_score(checklist, tracker.track_records)
    print(f"健康评分: {health['health_score']}/100 ({health['health_level']})")
    
    # 延迟分析
    delays = engine.analyze_delays(checklist, tracker.track_records)
    print(f"超期项: {delays['overdue_count']}, 高风险: {delays['at_risk_count']}")
    
    # 生成报告
    report = engine.generate_analytics_report(checklist, tracker.track_records)
    print("\n报告预览:")
    print(report[:1500])
