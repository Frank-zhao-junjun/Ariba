"""多模态融合引擎"""
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime

from .ocr_analyzer import OcrAnalyzer, OcrResult, ImageType
from .log_analyzer import LogAnalyzer, LogAnalysisResult, LogLevel
from .config_analyzer import ConfigAnalyzer, ConfigType


@dataclass
class MultimodalInput:
    image_path: Optional[str] = None
    image_bytes: Optional[bytes] = None
    log_content: Optional[str] = None
    config_content: Optional[str] = None
    config_type: Optional[ConfigType] = None
    additional_context: Dict = field(default_factory=dict)


@dataclass
class FusionResult:
    timestamp: str
    error_codes: List[str] = field(default_factory=list)
    error_patterns: List[str] = field(default_factory=list)
    severity: str = "unknown"
    root_cause_hypothesis: List[str] = field(default_factory=list)
    affected_modules: List[str] = field(default_factory=list)
    recommended_actions: List[str] = field(default_factory=list)
    confidence: float = 0.0
    raw_results: Dict = field(default_factory=dict)


class MultimodalFusionEngine:
    CODE_MODULE_MAP = {
        "AUTH": "认证", "WS": "集成", "WF": "审批", "INV": "发票", "CAT": "目录"
    }
    
    def __init__(self):
        self.ocr_analyzer = OcrAnalyzer()
        self.log_analyzer = LogAnalyzer()
        self.config_analyzer = ConfigAnalyzer()
    
    def analyze(self, input_data: MultimodalInput) -> FusionResult:
        results = {}
        all_error_codes = []
        all_errors = []
        affected_modules = set()
        
        if input_data.image_path or input_data.image_bytes:
            ocr_result = self.ocr_analyzer.analyze_image(input_data.image_path, input_data.image_bytes)
            results["image"] = {"type": ocr_result.image_type.value, "errors": ocr_result.extracted_errors, "codes": ocr_result.extracted_codes}
            all_error_codes.extend(ocr_result.extracted_codes)
            all_errors.extend(ocr_result.extracted_errors)
        
        if input_data.log_content:
            log_result = self.log_analyzer.analyze_log(input_data.log_content)
            results["log"] = {"type": log_result.log_type.value, "error_count": log_result.error_count, "codes": log_result.error_codes}
            all_error_codes.extend(log_result.error_codes)
            affected_modules.update(self._identify_affected_modules(all_error_codes))
        
        if input_data.config_content:
            config_result = self.config_analyzer.analyze(input_data.config_content, input_data.config_type)
            results["config"] = {"is_valid": config_result.is_valid}
            if not config_result.is_valid:
                all_errors.append("配置文件存在语法错误")
        
        error_patterns = self._identify_error_patterns(all_errors)
        severity = self._assess_severity(all_error_codes, all_errors)
        root_causes = self._hypothesize_root_causes(error_patterns)
        actions = self._generate_actions(error_patterns, severity)
        confidence = self._calculate_confidence(results)
        
        return FusionResult(
            timestamp=datetime.now().isoformat(),
            error_codes=list(set(all_error_codes)),
            error_patterns=error_patterns,
            severity=severity,
            root_cause_hypothesis=root_causes,
            affected_modules=list(affected_modules),
            recommended_actions=actions,
            confidence=confidence,
            raw_results=results
        )
    
    def _identify_error_patterns(self, errors: List[str]) -> List[str]:
        patterns = []
        text = " ".join(errors).lower()
        if any(kw in text for kw in ["auth", "login", "认证"]): patterns.append("认证失败模式")
        if any(kw in text for kw in ["ws", "integration", "集成"]): patterns.append("集成错误模式")
        return patterns if patterns else ["未知错误模式"]
    
    def _identify_affected_modules(self, codes: List[str]) -> set:
        modules = set()
        for code in codes:
            for prefix, module in self.CODE_MODULE_MAP.items():
                if prefix in code.upper():
                    modules.add(module)
        return modules
    
    def _assess_severity(self, codes: List[str], errors: List[str]) -> str:
        text = " ".join(errors).lower()
        if any(s in text for s in ["critical", "严重", "fatal"]): return "critical"
        if any(s in text for s in ["error", "错误"]): return "medium"
        return "low"
    
    def _hypothesize_root_causes(self, patterns: List[str]) -> List[str]:
        causes = []
        if "认证失败模式" in patterns:
            causes.append("可能原因：密码过期或SSO配置错误")
        if "集成错误模式" in patterns:
            causes.append("可能原因：目标系统连接超时")
        return causes if causes else ["建议收集更多诊断信息"]
    
    def _generate_actions(self, patterns: List[str], severity: str) -> List[str]:
        if severity == "critical":
            return ["1. 立即联系SAP支持团队", "2. 检查系统监控告警"]
        return ["1. 查看详细错误日志", "2. 按照知识库方案排查"]
    
    def _calculate_confidence(self, results: Dict) -> float:
        confidence = 0.0
        if "image" in results: confidence += 0.3
        if "log" in results: confidence += 0.4
        if "config" in results: confidence += 0.2
        return min(confidence, 1.0)
    
    def generate_diagnostic_report(self, input_data: MultimodalInput) -> str:
        result = self.analyze(input_data)
        lines = ["=" * 60, "多模态故障诊断报告", "=" * 60,
                 f"时间: {result.timestamp}", f"严重程度: {result.severity.upper()}",
                 f"置信度: {result.confidence:.0%}", "", "-" * 60, "错误代码", "-" * 60]
        for code in result.error_codes[:10]: lines.append(f"  - {code}")
        lines.extend(["", "-" * 60, "推荐操作", "-" * 60])
        for action in result.recommended_actions: lines.append(f"  {action}")
        lines.append("=" * 60)
        return "\n".join(lines)


fusion_engine = MultimodalFusionEngine()
__all__ = ["MultimodalFusionEngine", "fusion_engine", "MultimodalInput", "FusionResult"]
