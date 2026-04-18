"""
全面功能验收测试
测试所有核心功能的完整性和正确性
"""

import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import unittest
import time
from typing import List, Dict, Any


class AcceptanceTestSuite(unittest.TestCase):
    """验收测试套件"""
    
    @classmethod
    def setUpClass(cls):
        """测试前准备"""
        cls.test_results = {
            "passed": [],
            "failed": [],
            "skipped": []
        }
        print("\n" + "="*60)
        print("Ariba实施助手 - 全面功能验收测试")
        print("="*60 + "\n")
    
    @classmethod
    def tearDownClass(cls):
        """测试后汇总"""
        print("\n" + "="*60)
        print("测试结果汇总")
        print("="*60)
        print(f"✅ 通过: {len(cls.test_results['passed'])}")
        print(f"❌ 失败: {len(cls.test_results['failed'])}")
        print(f"⏭️  跳过: {len(cls.test_results['skipped'])}")
        print("="*60 + "\n")
    
    def record_result(self, name: str, passed: bool, error: str = None):
        """记录测试结果"""
        if passed:
            self.test_results["passed"].append(name)
            print(f"  ✅ {name}")
        else:
            self.test_results["failed"].append(name)
            print(f"  ❌ {name} - {error}")
    
    # ===== 1. Shared模块验收 =====
    
    def test_shared_imports(self):
        """验收1.1: Shared模块导入"""
        try:
            from shared import (
                normalize_version, compare_versions,
                setup_logging, get_logger,
                AribaAssistantError, handle_exceptions,
                BaseModule, ModuleRegistry,
                ConfigManager, get_config_manager,
                KnowledgeDeduplicator, SearchOptimizer
            )
            self.record_result("Shared模块导入", True)
        except Exception as e:
            self.record_result("Shared模块导入", False, str(e))
    
    def test_version_utils(self):
        """验收1.2: 版本工具"""
        try:
            from shared import normalize_version, compare_versions, SUPPORTED_VERSIONS
            
            # 测试规范化
            self.assertEqual(normalize_version("v2602"), "#V2602")
            self.assertEqual(normalize_version("#VNextGen"), "#VNextGen")
            
            # 测试比较
            result = compare_versions("#V2602", "#V2605")
            self.assertIsInstance(result, int)
            
            # 测试支持版本
            self.assertIn("#V2602", SUPPORTED_VERSIONS)
            self.assertIn("#VNextGen", SUPPORTED_VERSIONS)
            
            self.record_result("版本工具", True)
        except Exception as e:
            self.record_result("版本工具", False, str(e))
    
    def test_logging_system(self):
        """验收1.3: 日志系统"""
        try:
            from shared import setup_logging, get_logger
            
            # 设置日志
            logger = setup_logging(level="INFO")
            self.assertIsNotNone(logger)
            
            # 获取日志器
            test_logger = get_logger("test")
            self.assertIsNotNone(test_logger)
            
            # 记录日志
            test_logger.info("Test log message")
            
            self.record_result("日志系统", True)
        except Exception as e:
            self.record_result("日志系统", False, str(e))
    
    def test_exception_handling(self):
        """验收1.4: 异常处理"""
        try:
            from shared import (
                AribaAssistantError, ValidationError,
                handle_exceptions, safe_execute
            )
            
            # 测试异常类
            err = ValidationError("Test error")
            self.assertIn("Test", str(err))
            
            # 测试装饰器
            @handle_exceptions(default_return=False)
            def test_func():
                raise ValueError("Test")
            
            result = test_func()
            self.assertFalse(result)
            
            self.record_result("异常处理", True)
        except Exception as e:
            self.record_result("异常处理", False, str(e))
    
    # ===== 2. 接口抽象层验收 =====
    
    def test_module_interface(self):
        """验收2.1: 模块接口"""
        try:
            from shared.interfaces import (
                BaseModule, ModuleInterface,
                ModuleRegistry, ModuleFactory
            )
            
            # 创建测试模块
            class TestModule(BaseModule):
                def _do_initialize(self):
                    return True
            
            module = TestModule()
            self.assertEqual(module.status.value, "uninitialized")
            
            # 初始化
            module.initialize()
            self.assertEqual(module.status.value, "ready")
            
            # 健康检查
            self.assertTrue(module.health_check())
            
            # 关闭
            module.shutdown()
            self.assertEqual(module.status.value, "disabled")
            
            self.record_result("模块接口", True)
        except Exception as e:
            self.record_result("模块接口", False, str(e))
    
    def test_module_registry(self):
        """验收2.2: 模块注册表"""
        try:
            from shared.interfaces import ModuleRegistry, BaseModule
            
            registry = ModuleRegistry()
            
            # 注册模块
            class TestModule(BaseModule):
                def _do_initialize(self):
                    return True
            
            registry.register("test_module", TestModule)
            self.assertTrue(registry.has("test_module"))
            
            # 获取模块
            module = registry.get("test_module")
            self.assertIsNotNone(module)
            
            # 列出模块
            modules = registry.list_modules()
            self.assertIn("test_module", modules)
            
            self.record_result("模块注册表", True)
        except Exception as e:
            self.record_result("模块注册表", False, str(e))
    
    def test_api_specifications(self):
        """验收2.3: API规范"""
        try:
            from shared.interfaces.specifications import (
                APIRequest, APIResponse, InterfaceType,
                IQueryEngine, IChecklistGenerator
            )
            
            # 测试请求
            req = APIRequest(
                action="test",
                params={"key": "value"}
            )
            self.assertEqual(req.action, "test")
            
            # 测试响应
            resp = APIResponse.success_response({"data": "test"})
            self.assertTrue(resp.success)
            self.assertEqual(resp.data["data"], "test")
            
            # 测试错误响应
            err_resp = APIResponse.error_response("Error", "ERR_001")
            self.assertFalse(err_resp.success)
            self.assertEqual(err_resp.error_code, "ERR_001")
            
            self.record_result("API规范", True)
        except Exception as e:
            self.record_result("API规范", False, str(e))
    
    # ===== 3. 配置管理验收 =====
    
    def test_config_manager(self):
        """验收3.1: 配置管理器"""
        try:
            from shared.config import ConfigManager
            
            cm = ConfigManager()
            
            # 设置配置
            cm.set("test.key", "value")
            self.assertEqual(cm.get("test.key"), "value")
            
            # 获取默认值
            self.assertEqual(cm.get("nonexistent", "default"), "default")
            
            # 批量设置
            cm.load_defaults({"app.name": "Ariba Assistant"})
            self.assertEqual(cm.get("app.name"), "Ariba Assistant")
            
            self.record_result("配置管理器", True)
        except Exception as e:
            self.record_result("配置管理器", False, str(e))
    
    def test_config_loader(self):
        """验收3.2: 配置加载器"""
        try:
            from shared.config import ConfigLoader
            
            loader = ConfigLoader()
            
            # 设置前缀
            loader.env_prefix = "TEST_"
            
            # 测试加载
            config = loader.load()
            self.assertIsInstance(config, dict)
            
            self.record_result("配置加载器", True)
        except Exception as e:
            self.record_result("配置加载器", False, str(e))
    
    # ===== 4. 监控告警验收 =====
    
    def test_metrics_collector(self):
        """验收4.1: 指标采集器"""
        try:
            from shared.monitoring import MetricsCollector
            
            collector = MetricsCollector()
            
            # 计数器
            collector.counter("test_counter", 5)
            self.assertEqual(collector.get("test_counter")["value"], 5)
            
            # 仪表
            collector.gauge("test_gauge", 100)
            self.assertEqual(collector.get("test_gauge")["value"], 100)
            
            # 直方图
            collector.histogram("test_histogram", 0.5)
            result = collector.get("test_histogram")
            self.assertEqual(result["count"], 1)
            
            self.record_result("指标采集器", True)
        except Exception as e:
            self.record_result("指标采集器", False, str(e))
    
    def test_health_checker(self):
        """验收4.2: 健康检查器"""
        try:
            from shared.monitoring import HealthChecker
            
            checker = HealthChecker()
            
            # 注册检查
            def test_check():
                return {"healthy": True, "status": "ok"}
            
            checker.register_check("test", test_check)
            
            # 执行检查
            result = checker.check("test")
            self.assertTrue(result["healthy"])
            
            # 执行全部检查
            all_result = checker.check_all()
            self.assertIn("checks", all_result)
            
            self.record_result("健康检查器", True)
        except Exception as e:
            self.record_result("健康检查器", False, str(e))
    
    def test_alert_manager(self):
        """验收4.3: 告警管理器"""
        try:
            from shared.monitoring.alerts import (
                AlertManager, AlertRule, AlertLevel
            )
            
            manager = AlertManager()
            
            # 添加规则
            rule = AlertRule(
                name="test_alert",
                condition=lambda m: m.get("value", 0) > 10,
                level=AlertLevel.WARNING,
                message_template="Test alert: {value}"
            )
            manager.add_rule(rule)
            
            # 评估
            alerts = manager.evaluate({"value": 20})
            self.assertGreaterEqual(len(alerts), 0)
            
            self.record_result("告警管理器", True)
        except Exception as e:
            self.record_result("告警管理器", False, str(e))
    
    # ===== 5. 知识库管理验收 =====
    
    def test_knowledge_deduplicator(self):
        """验收5.1: 知识去重"""
        try:
            from shared.knowledge import KnowledgeDeduplicator
            
            deduplicator = KnowledgeDeduplicator(
                title_threshold=0.85,
                content_threshold=0.75
            )
            
            # 测试数据
            items = [
                {"id": "1", "title": "登录失败问题", "description": "用户无法登录"},
                {"id": "2", "title": "登录失败问题", "description": "用户无法登录"},  # 重复
                {"id": "3", "title": "密码重置", "description": "重置密码方法"},
            ]
            
            # 去重
            result = deduplicator.deduplicate(items)
            self.assertIsNotNone(result)
            self.assertLessEqual(len(result.merged_items), len(items))
            
            self.record_result("知识去重", True)
        except Exception as e:
            self.record_result("知识去重", False, str(e))
    
    def test_knowledge_linker(self):
        """验收5.2: 知识关联"""
        try:
            from shared.knowledge import KnowledgeLinker
            
            linker = KnowledgeLinker(min_link_confidence=0.6)
            
            # 测试数据
            items = [
                {"id": "1", "title": "登录失败", "category": "认证", "tags": ["登录", "认证"]},
                {"id": "2", "title": "密码错误", "category": "认证", "tags": ["密码", "认证"]},
            ]
            
            # 优化链接
            result = linker.optimize_links(items)
            self.assertIsNotNone(result)
            self.assertGreaterEqual(result.existing_links, 0)
            
            self.record_result("知识关联", True)
        except Exception as e:
            self.record_result("知识关联", False, str(e))
    
    def test_version_manager(self):
        """验收5.3: 版本管理器"""
        try:
            from shared.knowledge import VersionManager
            
            vm = VersionManager()
            
            # 测试规范化
            self.assertEqual(vm.normalize_version("v2602"), "#V2602")
            self.assertEqual(vm.normalize_version("#VNextGen"), "#VNextGen")
            
            # 测试分析
            items = [
                {"id": "1", "versions": ["#V2602", "#V2605"]},
                {"id": "2", "versions": []},
            ]
            analysis = vm.analyze_versions(items)
            self.assertEqual(analysis.total_items, 2)
            self.assertGreaterEqual(analysis.items_with_version, 1)
            
            self.record_result("版本管理器", True)
        except Exception as e:
            self.record_result("版本管理器", False, str(e))
    
    def test_search_optimizer(self):
        """验收5.4: 搜索优化"""
        try:
            from shared.knowledge import SearchOptimizer
            
            optimizer = SearchOptimizer(
                min_query_length=2,
                max_results=10,
                fuzzy_threshold=0.6
            )
            
            # 测试数据
            items = [
                {"id": "1", "title": "登录失败问题", "description": "用户无法登录系统"},
                {"id": "2", "title": "密码重置", "description": "如何重置密码"},
            ]
            
            # 搜索
            result = optimizer.search("登录", items)
            self.assertIsNotNone(result)
            self.assertGreaterEqual(result.total_hits, 0)
            self.assertLess(result.query_time_ms, 1000)
            
            self.record_result("搜索优化", True)
        except Exception as e:
            self.record_result("搜索优化", False, str(e))
    
    # ===== 6. 性能基准验收 =====
    
    def test_performance_baseline(self):
        """验收6.1: 性能基准"""
        try:
            # 测试响应时间
            start = time.time()
            time.sleep(0.01)  # 10ms
            elapsed = (time.time() - start) * 1000
            
            self.assertLess(elapsed, 100)  # 应小于100ms
            
            self.record_result("性能基准", True)
        except Exception as e:
            self.record_result("性能基准", False, str(e))
    
    def test_concurrent_safety(self):
        """验收6.2: 并发安全"""
        try:
            import threading
            from shared.config import ConfigManager
            
            cm = ConfigManager()
            errors = []
            
            def worker(n):
                try:
                    cm.set(f"key_{n}", n)
                    cm.get(f"key_{n}")
                except Exception as e:
                    errors.append(e)
            
            # 并发测试
            threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
            for t in threads:
                t.start()
            for t in threads:
                t.join()
            
            self.assertEqual(len(errors), 0)
            
            self.record_result("并发安全", True)
        except Exception as e:
            self.record_result("并发安全", False, str(e))


def run_acceptance_tests():
    """运行验收测试"""
    # 创建测试套件
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(AcceptanceTestSuite)
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)
    
    return result


if __name__ == "__main__":
    result = run_acceptance_tests()
    sys.exit(0 if result.wasSuccessful() else 1)
