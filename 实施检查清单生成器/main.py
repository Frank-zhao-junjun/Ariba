#!/usr/bin/env python3
"""
实施检查清单生成器 - 主入口文件

提供命令行界面和API接口
"""

import sys
import json
import argparse
from datetime import datetime

# 导入各模块
from core.checklist_generator import ChecklistGenerator
from recommendation.recommendation_engine import RecommendationEngine
from template.template_manager import TemplateManager
from tracking.tracking_engine import TrackingEngine, ItemStatus
from analytics.analytics_engine import AnalyticsEngine


def print_header(title):
    """打印标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def demo_basic_generation():
    """演示基础清单生成"""
    print_header("US1: 基础清单生成演示")
    
    generator = ChecklistGenerator()
    
    # 生成标准清单
    checklist = generator.generate_all_phases_checklist(
        modules=["sourcing", "contract", "buying", "supplier", "spending"],
        version="V2605",
        project_name="演示Ariba实施项目"
    )
    
    print(f"✓ 生成清单: {checklist['name']}")
    print(f"✓ 总项目数: {checklist['total_items']}")
    print(f"✓ 版本: {checklist['version']}")
    print(f"✓ 阶段数: {len(checklist['phases'])}")
    
    # 按阶段统计
    phase_counts = {}
    for item in checklist["items"]:
        phase = item["phase_name"]
        phase_counts[phase] = phase_counts.get(phase, 0) + 1
    
    print("\n各阶段项目数:")
    for phase, count in phase_counts.items():
        print(f"  - {phase}: {count}")
    
    return checklist


def demo_recommendation():
    """演示智能推荐"""
    print_header("US2: 智能推荐演示")
    
    engine = RecommendationEngine()
    
    # 分析项目特征
    profile = engine.analyze_project_profile(
        company_size="large_enterprise",
        industry="manufacturing",
        existing_systems=["SAP S/4HANA", "Oracle EBS"],
        integration_level="level_3"
    )
    
    print(f"✓ 企业规模: {profile['company_size']['description']}")
    print(f"✓ 行业: {profile['industry']['description']}")
    print(f"✓ 集成: {profile['integration']['description']}")
    
    # 风险评估
    risk = engine.assess_risk_level(
        company_size="large_enterprise",
        industry="manufacturing",
        integration_level="level_3",
        has_historical_data=True
    )
    
    print(f"\n风险评估:")
    print(f"  等级: {risk['risk_level'].upper()}")
    print(f"  评分: {risk['risk_score']}/{risk['max_score']}")
    
    # 推荐项
    recommendations = engine.recommend_checklist_items(profile, [])
    print(f"\n推荐新增项: {len(recommendations['recommended_additions'])}项")
    
    return profile, risk, recommendations


def demo_template_management():
    """演示模板管理"""
    print_header("US3: 模板管理演示")
    
    manager = TemplateManager()
    
    # 获取所有模板
    templates = manager.get_all_templates()
    print(f"✓ 模板总数: {len(templates)}")
    
    # 分类统计
    builtin = sum(1 for t in templates if t["is_builtin"])
    custom = sum(1 for t in templates if not t["is_builtin"])
    print(f"  - 内置模板: {builtin}")
    print(f"  - 自定义模板: {custom}")
    
    # 列出内置模板
    print("\n内置模板:")
    for tmpl in templates[:5]:
        print(f"  - {tmpl['name']} (使用: {tmpl['usage_count']}次)")
    
    # 统计信息
    stats = manager.get_template_stats()
    print(f"\n模板统计:")
    print(f"  - 最常用: {stats['most_used']}")
    print(f"  - 总使用次数: {stats['total_usage']}")
    
    return manager


def demo_tracking(checklist):
    """演示执行追踪"""
    print_header("US4: 执行追踪演示")
    
    tracker = TrackingEngine()
    
    # 模拟执行进度
    print("模拟执行进度...")
    
    for i, item in enumerate(checklist["items"][:10]):
        if i < 3:
            status = ItemStatus.COMPLETED.value
        elif i < 5:
            status = ItemStatus.IN_PROGRESS.value
        elif i < 6:
            status = ItemStatus.BLOCKED.value
        else:
            status = ItemStatus.NOT_STARTED.value
        
        tracker.update_item_status(
            checklist["id"],
            item["id"],
            status,
            assignee=f"user{i%3 + 1}"
        )
    
    # 获取进度
    progress = tracker.get_checklist_progress(checklist)
    
    print(f"\n执行进度:")
    print(f"  - 完成率: {progress['completion_rate']:.1%}")
    print(f"  - 已完成: {progress['completed_items'] + progress['verified_items']}")
    print(f"  - 进行中: {progress['in_progress_items']}")
    print(f"  - 受阻: {progress['blocked_items']}")
    print(f"  - 未开始: {progress['not_started_items']}")
    
    # 获取受阻项
    blocked = tracker.get_blocked_items(checklist)
    if blocked:
        print(f"\n受阻项目:")
        for item in blocked[:3]:
            print(f"  - {item['title']}")
    
    return tracker


def demo_analytics(checklist, tracker):
    """演示统计分析"""
    print_header("US5: 统计分析演示")
    
    analytics = AnalyticsEngine()
    
    # 完成率统计
    stats = analytics.calculate_completion_stats(checklist, tracker.track_records)
    print(f"\n完成率统计:")
    print(f"  - 总体完成率: {stats['overall_completion_percentage']:.1f}%")
    print(f"  - 已完成: {stats['completed_items']}项")
    print(f"  - 剩余: {stats['remaining_items']}项")
    
    # 健康度评分
    health = analytics.calculate_health_score(checklist, tracker.track_records)
    print(f"\n健康度评分: {health['health_score']}/100")
    print(f"  等级: {health['health_level'].upper()}")
    
    # 延迟分析
    delays = analytics.analyze_delays(checklist, tracker.track_records)
    print(f"\n延迟分析:")
    print(f"  - 超期项: {delays['overdue_count']}")
    print(f"  - 高风险项: {delays['at_risk_count']}")
    
    # 图表数据
    chart_data = analytics.generate_chart_data(checklist, tracker.track_records)
    print(f"\n图表数据已生成 (可用于ECharts可视化)")
    
    return analytics


def demo_full_workflow():
    """演示完整工作流程"""
    print_header("完整工作流程演示")
    
    # 1. 创建清单
    generator = ChecklistGenerator()
    checklist = generator.generate_all_phases_checklist(
        modules=["sourcing", "buying", "supplier"],
        version="V2605",
        project_name="完整工作流程演示"
    )
    print(f"1. 生成检查清单: {checklist['total_items']}项")
    
    # 2. 应用推荐
    engine = RecommendationEngine()
    recommendations = engine.recommend_checklist_items(
        {"company_size": {"value": "large_enterprise", "timeline_factor": 1.5},
         "industry": {"value": "manufacturing", "focus_areas": ["supplier"]},
         "integration": {"value": "level_3", "description": "多系统集成"}},
        checklist["items"]
    )
    print(f"2. 应用智能推荐: +{len(recommendations['recommended_additions'])}项")
    
    # 3. 执行追踪
    tracker = TrackingEngine()
    for i, item in enumerate(checklist["items"][:15]):
        status = [ItemStatus.COMPLETED.value] * 5 + [ItemStatus.IN_PROGRESS.value] * 3 + [ItemStatus.BLOCKED.value] * 2 + [ItemStatus.NOT_STARTED.value] * 5
        tracker.update_item_status(checklist["id"], item["id"], status[i])
    
    progress = tracker.get_checklist_progress(checklist)
    print(f"3. 执行追踪: 完成率{progress['completion_rate']:.1%}")
    
    # 4. 统计分析
    analytics = AnalyticsEngine()
    health = analytics.calculate_health_score(checklist, tracker.track_records)
    print(f"4. 健康度评分: {health['health_score']}/100 ({health['health_level']})")
    
    # 5. 生成报告
    report = analytics.generate_analytics_report(checklist, tracker.track_records)
    print(f"5. 生成分析报告: {len(report)}字符")
    
    print("\n✓ 完整工作流程演示完成!")


def run_tests():
    """运行测试"""
    import unittest
    
    print_header("运行单元测试")
    
    # 导入测试模块
    from tests import (
        test_checklist_generator,
        test_recommendation_engine,
        test_template_manager,
        test_tracking_engine,
        test_analytics_engine
    )
    
    # 创建测试套件
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromModule(test_checklist_generator))
    suite.addTests(loader.loadTestsFromModule(test_recommendation_engine))
    suite.addTests(loader.loadTestsFromModule(test_template_manager))
    suite.addTests(loader.loadTestsFromModule(test_tracking_engine))
    suite.addTests(loader.loadTestsFromModule(test_analytics_engine))
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Ariba实施检查清单生成器")
    parser.add_argument(
        "--demo",
        choices=["all", "basic", "recommendation", "template", "tracking", "analytics", "workflow"],
        default="all",
        help="选择演示模块"
    )
    parser.add_argument("--test", action="store_true", help="运行测试")
    parser.add_argument("--output", type=str, help="输出文件路径")
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("  Ariba实施检查清单生成器 v1.0.0")
    print("  实施顾问的智能助手")
    print("="*60)
    
    if args.test:
        success = run_tests()
        sys.exit(0 if success else 1)
    
    checklist = None
    
    if args.demo in ["all", "basic"]:
        checklist = demo_basic_generation()
    
    if args.demo in ["all", "recommendation"]:
        demo_recommendation()
    
    if args.demo in ["all", "template"]:
        demo_template_management()
    
    if args.demo in ["all", "tracking"]:
        if checklist is None:
            generator = ChecklistGenerator()
            checklist = generator.generate_all_phases_checklist(
                modules=["sourcing", "buying"],
                version="V2605"
            )
        demo_tracking(checklist)
    
    if args.demo in ["all", "analytics"]:
        if checklist is None:
            generator = ChecklistGenerator()
            checklist = generator.generate_all_phases_checklist(
                modules=["sourcing", "buying"],
                version="V2605"
            )
        tracker = TrackingEngine()
        demo_analytics(checklist, tracker)
    
    if args.demo == "workflow":
        demo_full_workflow()
    
    if args.output and checklist:
        generator = ChecklistGenerator()
        output_file = args.output
        format = "markdown" if output_file.endswith(".md") else "json"
        generator.save_to_file(checklist, output_file, format)
        print(f"\n✓ 清单已保存到: {output_file}")
    
    print("\n" + "="*60)
    print("  演示完成!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
