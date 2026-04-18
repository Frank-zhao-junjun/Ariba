"""US6: 多模态故障分析"""
import unittest
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from multimodal import (
    OcrAnalyzer, LogAnalyzer, LogLevel, LogType,
    ConfigAnalyzer, ConfigType,
    MultimodalFusionEngine, MultimodalInput
)


class TestOcrAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = OcrAnalyzer()
    
    def test_ac6_1_extract_errors(self):
        text = "Error: Authentication failed - AUTH-001"
        errors = self.analyzer._extract_errors(text)
        self.assertGreater(len(errors), 0)
    
    def test_ac6_1_extract_codes(self):
        text = "System error WS-404 detected"
        codes = self.analyzer._extract_codes(text)
        self.assertIn("WS-404", codes)
    
    def test_ac6_1_confidence(self):
        text = "Error AUTH-001 occurred"
        confidence = self.analyzer._calculate_confidence(text, ["Error"], ["AUTH-001"])
        self.assertGreater(confidence, 0.5)


class TestLogAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = LogAnalyzer()
    
    def test_ac6_2_analyze(self):
        log = "2026-04-17 10:30:00 ERROR Authentication failed"
        result = self.analyzer.analyze_log(log)
        self.assertIsNotNone(result)
        self.assertGreater(result.error_count, 0)
    
    def test_ac6_2_extract_codes(self):
        entries = [type('E', (), {'error_code': 'AUTH-001', 'message': 'ERROR AUTH-001', 'timestamp': '', 'level': LogLevel.ERROR, 'source': '', 'stack_trace': None, 'user_id': None, 'session_id': None, 'metadata': {}})()]
        codes = self.analyzer._extract_all_error_codes(entries)
        self.assertIn("AUTH-001", codes)


class TestConfigAnalyzer(unittest.TestCase):
    def setUp(self):
        self.analyzer = ConfigAnalyzer()
    
    def test_ac6_3_json_valid(self):
        config = '{"name": "test", "value": 123}'
        result = self.analyzer.analyze(config, ConfigType.JSON)
        self.assertTrue(result.is_valid)
    
    def test_ac6_3_json_invalid(self):
        config = '{"name": "test", value: 123}'
        result = self.analyzer.analyze(config, ConfigType.JSON)
        self.assertFalse(result.is_valid)


class TestMultimodalFusion(unittest.TestCase):
    def setUp(self):
        self.engine = MultimodalFusionEngine()
    
    def test_ac6_4_fusion_log(self):
        input_data = MultimodalInput(log_content="ERROR AUTH-001 login failed")
        result = self.engine.analyze(input_data)
        self.assertIsInstance(result.severity, str)
    
    def test_ac6_4_confidence(self):
        input_data = MultimodalInput(log_content="ERROR AUTH-001")
        result = self.engine.analyze(input_data)
        self.assertGreaterEqual(result.confidence, 0)
        self.assertLessEqual(result.confidence, 1)
    
    def test_report_generation(self):
        input_data = MultimodalInput(log_content="ERROR AUTH-001 login failed")
        report = self.engine.generate_diagnostic_report(input_data)
        self.assertIn("诊断报告", report)


if __name__ == "__main__":
    unittest.main()
