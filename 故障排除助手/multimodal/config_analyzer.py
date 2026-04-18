"""
配置文件分析器 - US6 AC6.3

支持XML、JSON、properties配置文件语法校验
"""

import re
import json
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum


class ConfigType(Enum):
    XML = "xml"
    JSON = "json"
    PROPERTIES = "properties"
    YAML = "yaml"
    UNKNOWN = "unknown"


@dataclass
class ConfigIssue:
    """配置问题"""
    issue_type: str  # error, warning, info
    line: Optional[int]
    message: str
    suggestion: str
    severity: str  # high, medium, low


@dataclass
class ConfigAnalysisResult:
    """配置分析结果"""
    config_type: ConfigType
    is_valid: bool
    issues: List[ConfigIssue]
    parsed_config: Optional[Any]
    summary: str
    recommendations: List[str]


class ConfigAnalyzer:
    """
    配置文件分析器
    
    AC6.3: 配置文件语法校验
    """
    
    def __init__(self):
        self.issues = []
    
    def analyze(self, config_content: str, config_type: ConfigType = None) -> ConfigAnalysisResult:
        """
        分析配置文件
        
        Args:
            config_content: 配置文件内容
            config_type: 配置文件类型
            
        Returns:
            分析结果
        """
        if config_type is None:
            config_type = self._detect_config_type(config_content)
        
        self.issues = []
        parsed_config = None
        
        try:
            if config_type == ConfigType.JSON:
                parsed_config = self._analyze_json(config_content)
            elif config_type == ConfigType.XML:
                parsed_config = self._analyze_xml(config_content)
            elif config_type == ConfigType.PROPERTIES:
                parsed_config = self._analyze_properties(config_content)
            else:
                self._add_issue("error", None, "未知配置文件类型", "请指定正确的配置文件类型", "high")
        except Exception as e:
            self._add_issue("error", None, f"解析错误: {str(e)}", "检查配置文件格式", "high")
        
        is_valid = all(issue.issue_type != "error" for issue in self.issues)
        summary = self._generate_summary(config_type, is_valid)
        recommendations = self._generate_recommendations()
        
        return ConfigAnalysisResult(
            config_type=config_type,
            is_valid=is_valid,
            issues=self.issues.copy(),
            parsed_config=parsed_config,
            summary=summary,
            recommendations=recommendations
        )
    
    def _detect_config_type(self, content: str) -> ConfigType:
        """检测配置类型"""
        content_stripped = content.strip()
        
        if content_stripped.startswith('{') or content_stripped.startswith('['):
            return ConfigType.JSON
        if content_stripped.startswith('<?xml') or content_stripped.startswith('<'):
            return ConfigType.XML
        if '\n' in content and '=' in content and not content_stripped.startswith('<'):
            return ConfigType.PROPERTIES
        if content_stripped.startswith('---') or ': ' in content:
            return ConfigType.YAML
        
        return ConfigType.UNKNOWN
    
    def _analyze_json(self, content: str) -> dict:
        """分析JSON配置"""
        lines = content.split('\n')
        
        try:
            config = json.loads(content)
        except json.JSONDecodeError as e:
            self._add_issue("error", e.lineno, f"JSON语法错误: {e.msg}", "检查JSON格式", "high")
            raise
        
        # 检查常见问题
        self._check_json_common_issues(config, lines)
        
        return config
    
    def _check_json_common_issues(self, config: dict, lines: List[str]):
        """检查JSON常见问题"""
        # 检查敏感配置
        sensitive_keys = ['password', 'secret', 'token', 'key', 'credential']
        
        def check_dict(d: dict, path: str = ""):
            for key, value in d.items():
                current_path = f"{path}.{key}" if path else key
                
                # 敏感信息检查
                if any(sk in key.lower() for sk in sensitive_keys):
                    if isinstance(value, str) and value and not value.startswith('*'):
                        self._add_issue("warning", None, 
                            f"发现敏感配置项: {current_path}",
                            "建议使用环境变量或加密存储",
                            "medium")
                
                # 空值检查
                if value is None:
                    self._add_issue("info", None,
                        f"配置项 {current_path} 值为null",
                        "确认是否有意为空",
                        "low")
                
                # 递归检查
                if isinstance(value, dict):
                    check_dict(value, current_path)
                elif isinstance(value, list):
                    for i, item in enumerate(value):
                        if isinstance(item, dict):
                            check_dict(item, f"{current_path}[{i}]")
        
        check_dict(config)
    
    def _analyze_xml(self, content: str) -> ET.Element:
        """分析XML配置"""
        try:
            root = ET.fromstring(content)
        except ET.ParseError as e:
            self._add_issue("error", e.lineno if hasattr(e, 'lineno') else None,
                f"XML解析错误: {str(e)}",
                "检查XML标签是否正确闭合",
                "high")
            raise
        
        self._check_xml_common_issues(root)
        return root
    
    def _check_xml_common_issues(self, element: ET.Element, path: str = ""):
        """检查XML常见问题"""
        current_path = f"{path}/{element.tag}"
        
        # 检查重复属性
        if len(element.attrib) != len(set(element.attrib.keys())):
            self._add_issue("warning", None,
                f"XML元素 {current_path} 有重复属性",
                "移除重复属性",
                "medium")
        
        # 检查空文本
        if element.text and not element.text.strip():
            self._add_issue("info", None,
                f"XML元素 {current_path} 只有空白文本",
                "确认是否有意为空",
                "low")
        
        # 递归检查子元素
        for child in element:
            self._check_xml_common_issues(child, current_path)
    
    def _analyze_properties(self, content: str) -> dict:
        """分析properties配置"""
        config = {}
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            line = line.strip()
            
            # 跳过注释和空行
            if not line or line.startswith('#') or line.startswith('!'):
                continue
            
            # 处理多行值
            if line.endswith('\\'):
                # 继续到下一行
                continue
            
            # 解析 key=value
            if '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()
            elif ':' in line:
                key, value = line.split(':', 1)
                config[key.strip()] = value.strip()
            else:
                self._add_issue("warning", i,
                    f"无法解析的配置行: {line[:50]}",
                    "格式应为 key=value 或 key:value",
                    "low")
        
        # 检查常见问题
        self._check_properties_common_issues(config)
        
        return config
    
    def _check_properties_common_issues(self, config: dict):
        """检查properties常见问题"""
        # 检查重复键
        # (properties通常不支持重复键，这里不检查)
        
        # 检查URL配置
        url_patterns = ['url', 'endpoint', 'host', 'server', 'connection']
        for key in config:
            key_lower = key.lower()
            if any(p in key_lower for p in url_patterns):
                value = config[key]
                if not value.startswith('http') and not value.startswith('${'):
                    self._add_issue("warning", None,
                        f"配置项 {key} 可能需要完整URL",
                        f"当前值: {value[:50]}",
                        "low")
    
    def _add_issue(self, issue_type: str, line: Optional[int], message: str, suggestion: str, severity: str):
        """添加问题"""
        self.issues.append(ConfigIssue(
            issue_type=issue_type,
            line=line,
            message=message,
            suggestion=suggestion,
            severity=severity
        ))
    
    def _generate_summary(self, config_type: ConfigType, is_valid: bool) -> str:
        """生成摘要"""
        error_count = sum(1 for i in self.issues if i.issue_type == "error")
        warning_count = sum(1 for i in self.issues if i.issue_type == "warning")
        
        status = "有效" if is_valid else "无效"
        return f"{config_type.value.upper()}配置{status}，发现{error_count}个错误，{warning_count}个警告"
    
    def _generate_recommendations(self) -> List[str]:
        """生成建议"""
        recommendations = []
        
        high_severity = [i for i in self.issues if i.severity == "high"]
        if high_severity:
            recommendations.append("存在高严重性问题，请优先修复")
        
        # 特定建议
        has_sensitive = any("敏感" in i.message for i in self.issues)
        if has_sensitive:
            recommendations.append("建议使用环境变量或密钥管理服务存储敏感配置")
        
        if not recommendations:
            recommendations.append("配置检查通过，无需修改")
        
        return recommendations[:3]


# 全局实例
config_analyzer = ConfigAnalyzer()


__all__ = ["ConfigAnalyzer", "config_analyzer", "ConfigType", "ConfigIssue", "ConfigAnalysisResult"]
