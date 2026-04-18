"""
图片OCR分析器 - US6 AC6.1

支持从错误截图、界面状态图片中提取关键信息
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class ImageType(Enum):
    """图片类型"""
    ERROR_SCREENSHOT = "error_screenshot"
    UI_STATE = "ui_state"
    LOG_DISPLAY = "log_display"
    CONFIG_SCREEN = "config_screen"
    UNKNOWN = "unknown"


@dataclass
class OcrResult:
    """OCR识别结果"""
    raw_text: str
    extracted_errors: List[str]
    extracted_codes: List[str]
    ui_elements: List[Dict]
    confidence: float
    image_type: ImageType


class OcrAnalyzer:
    """
    OCR分析器
    
    AC6.1: 错误截图OCR识别
    """
    
    # 错误模式
    ERROR_PATTERNS = [
        r'(?:Error|错误|Exception|异常)[:\s]+([^\n]{5,100})',
        r'(?:Failed|失败|Timeout|超时)[:\s]+([^\n]{5,100})',
        r'\[ERROR\]\s*(.+?)(?:\n|$)',
        r'\[WARN\]\s*(.+?)(?:\n|$)',
        r'(?:AUTH|WS|WF|INV|CAT)-\d{3,}',
    ]
    
    # UI元素模式
    UI_PATTERNS = [
        (r'(?:Button|按钮)[:\s]*([^\n]{2,30})', 'button'),
        (r'(?:Field|字段)[:\s]*([^\n]{2,30})', 'field'),
        (r'(?:Tab|页签)[:\s]*([^\n]{2,30})', 'tab'),
        (r'(?:Menu|菜单)[:\s]*([^\n]{2,30})', 'menu'),
        (r'(?:Message|消息)[:\s]*([^\n]{5,50})', 'message'),
    ]
    
    # 错误代码模式
    CODE_PATTERNS = [
        r'\b([A-Z]{2,4}-\d{3,6})\b',  # AUTH-001, WS-404
        r'\bERR[-_](\d+)\b',
        r'HTTP[_-](\d{3})\b',
        r'\b(E\d{4,})\b',
    ]
    
    def __init__(self):
        self.error_patterns = [re.compile(p, re.IGNORECASE) for p in self.ERROR_PATTERNS]
        self.code_patterns = [re.compile(p, re.IGNORECASE) for p in self.CODE_PATTERNS]
    
    def analyze_image(self, image_path: str = None, image_bytes: bytes = None) -> OcrResult:
        """
        分析图片
        
        Args:
            image_path: 图片路径
            image_bytes: 图片字节数据
            
        Returns:
            OCR识别结果
        """
        # 模拟OCR结果（实际应调用OCR服务）
        # 这里根据输入模拟识别过程
        raw_text = self._simulate_ocr(image_path, image_bytes)
        
        # 提取错误信息
        errors = self._extract_errors(raw_text)
        
        # 提取错误代码
        codes = self._extract_codes(raw_text)
        
        # 提取UI元素
        ui_elements = self._extract_ui_elements(raw_text)
        
        # 判断图片类型
        image_type = self._classify_image(raw_text)
        
        # 计算置信度
        confidence = self._calculate_confidence(raw_text, errors, codes)
        
        return OcrResult(
            raw_text=raw_text,
            extracted_errors=errors,
            extracted_codes=codes,
            ui_elements=ui_elements,
            confidence=confidence,
            image_type=image_type
        )
    
    def _simulate_ocr(self, image_path: str = None, image_bytes: bytes = None) -> str:
        """模拟OCR（实际应调用Tesseract/百度OCR等）"""
        # 如果有真实图片路径，可以调用实际OCR服务
        # 这里返回模拟文本
        if image_path:
            return f"[Simulated OCR for {image_path}] Error: Authentication failed - AUTH-001"
        return ""
    
    def _extract_errors(self, text: str) -> List[str]:
        """提取错误信息"""
        errors = []
        for pattern in self.error_patterns:
            matches = pattern.findall(text)
            errors.extend([m.strip() for m in matches if m.strip()])
        return list(set(errors))[:10]  # 最多10个
    
    def _extract_codes(self, text: str) -> List[str]:
        """提取错误代码"""
        codes = []
        for pattern in self.code_patterns:
            matches = pattern.findall(text)
            codes.extend(matches)
        return list(set(codes))[:20]
    
    def _extract_ui_elements(self, text: str) -> List[Dict]:
        """提取UI元素"""
        elements = []
        for pattern, elem_type in self.UI_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                elements.append({
                    "type": elem_type,
                    "value": match.strip(),
                    "confidence": 0.8
                })
        return elements[:15]
    
    def _classify_image(self, text: str) -> ImageType:
        """分类图片类型"""
        text_lower = text.lower()
        
        if any(kw in text_lower for kw in ["error", "错误", "exception", "异常", "failed", "失败"]):
            return ImageType.ERROR_SCREENSHOT
        if any(kw in text_lower for kw in ["button", "按钮", "field", "字段", "tab", "页签"]):
            return ImageType.UI_STATE
        if any(kw in text_lower for kw in ["log", "日志", "stack", "trace", "堆栈"]):
            return ImageType.LOG_DISPLAY
        if any(kw in text_lower for kw in ["config", "配置", "setting", "设置", "xml", "json"]):
            return ImageType.CONFIG_SCREEN
        
        return ImageType.UNKNOWN
    
    def _calculate_confidence(self, text: str, errors: List, codes: List) -> float:
        """计算置信度"""
        if not text:
            return 0.0
        
        score = 0.5  # 基础分
        
        # 有错误信息加分
        score += min(len(errors) * 0.1, 0.3)
        
        # 有错误代码加分
        score += min(len(codes) * 0.05, 0.2)
        
        return min(score, 1.0)
    
    def extract_error_info(self, text: str) -> Dict:
        """提取错误信息摘要"""
        return {
            "errors": self._extract_errors(text),
            "codes": self._extract_codes(text),
            "type": self._classify_image(text).value,
            "severity": self._estimate_severity(text)
        }
    
    def _estimate_severity(self, text: str) -> str:
        """估算严重程度"""
        text_lower = text.lower()
        
        if any(kw in text_lower for kw in ["critical", "严重", "fatal", "致命", "system down"]):
            return "critical"
        if any(kw in text_lower for kw in ["error", "错误", "exception", "异常"]):
            return "error"
        if any(kw in text_lower for kw in ["warn", "警告", "warning"]):
            return "warning"
        if any(kw in text_lower for kw in ["info", "信息", "debug"]):
            return "info"
        
        return "unknown"


# 全局实例
ocr_analyzer = OcrAnalyzer()


__all__ = ["OcrAnalyzer", "ocr_analyzer", "OcrResult", "ImageType"]
