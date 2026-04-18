"""日志分析器"""
import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class LogLevel(Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    FATAL = "FATAL"


class LogType(Enum):
    ARIBA_APPLICATION = "ariba_application"
    ARIBA_SYSTEM = "ariba_system"
    INTEGRATION_LOG = "integration_log"
    AUDIT_LOG = "audit_log"
    SECURITY_LOG = "security_log"
    CUSTOM = "custom"


@dataclass
class LogEntry:
    timestamp: str
    level: LogLevel
    source: str
    message: str
    error_code: Optional[str] = None
    stack_trace: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict = field(default_factory=dict)


@dataclass
class LogAnalysisResult:
    log_type: LogType
    total_entries: int
    error_count: int
    warn_count: int
    critical_errors: List[Dict]
    error_codes: List[str]
    time_range: Tuple[str, str]
    summary: str
    recommendations: List[str]


class LogAnalyzer:
    LOG_PATTERNS = {
        LogType.ARIBA_APPLICATION: [
            r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[([\w]+)\]\s+\[([\w.]+)\]\s+(.+)',
        ],
        LogType.ARIBA_SYSTEM: [
            r'\[(\d{4}-\d{2}-\d{2})\]\s+<(\w+)>\s+(\w+):\s+(.+)',
        ],
    }
    ERROR_CODE_PATTERN = r'\b([A-Z]{2,4}-\d{3,}|ERR[-_]\d+|E\d{4,}|HTTP[_-]\d{3})\b'
    
    def __init__(self):
        self.patterns = {}
        for lt, pl in self.LOG_PATTERNS.items():
            self.patterns[lt] = [re.compile(p) for p in pl]
    
    def analyze_log(self, log_content: str, log_type: LogType = None) -> LogAnalysisResult:
        if log_type is None:
            log_type = self._detect_log_type(log_content)
        
        entries = self._parse_log_entries(log_content, log_type)
        error_count = sum(1 for e in entries if e.level == LogLevel.ERROR)
        warn_count = sum(1 for e in entries if e.level == LogLevel.WARN)
        critical_errors = self._extract_critical_errors(entries)
        error_codes = self._extract_all_error_codes(entries)
        time_range = self._get_time_range(entries)
        summary = self._generate_summary(entries, error_count, warn_count)
        recommendations = self._generate_recommendations(entries, error_codes)
        
        return LogAnalysisResult(
            log_type=log_type, total_entries=len(entries),
            error_count=error_count, warn_count=warn_count,
            critical_errors=critical_errors, error_codes=error_codes,
            time_range=time_range, summary=summary, recommendations=recommendations
        )
    
    def _detect_log_type(self, content: str) -> LogType:
        content_lower = content.lower()
        if "ariba" in content_lower and "application" in content_lower:
            return LogType.ARIBA_APPLICATION
        if "integration" in content_lower:
            return LogType.INTEGRATION_LOG
        return LogType.ARIBA_SYSTEM
    
    def _parse_log_entries(self, content: str, log_type: LogType) -> List[LogEntry]:
        entries = []
        for line in content.split('\n'):
            line = line.strip()
            if not line or not self._looks_like_log_line(line):
                continue
            
            entries.append(LogEntry(
                timestamp="", level=self._detect_level(line),
                source="unknown", message=line
            ))
        return entries
    
    def _looks_like_log_line(self, line: str) -> bool:
        return any(re.search(p, line, re.IGNORECASE) for p in [
            r'\d{4}[-/]\d{2}', r'(?:ERROR|WARN|INFO|DEBUG)'
        ])
    
    def _detect_level(self, line: str) -> LogLevel:
        line_upper = line.upper()
        if "ERROR" in line_upper: return LogLevel.ERROR
        if "WARN" in line_upper: return LogLevel.WARN
        if "INFO" in line_upper: return LogLevel.INFO
        return LogLevel.DEBUG
    
    def _extract_critical_errors(self, entries: List[LogEntry]) -> List[Dict]:
        return [{
            "timestamp": e.timestamp, "level": e.level.value,
            "source": e.source, "message": e.message[:200],
            "error_code": e.error_code
        } for e in entries if e.level in [LogLevel.ERROR, LogLevel.FATAL]][:20]
    
    def _extract_all_error_codes(self, entries: List[LogEntry]) -> List[str]:
        codes = set()
        for e in entries:
            found = re.findall(self.ERROR_CODE_PATTERN, e.message)
            codes.update(found)
        return list(codes)[:50]
    
    def _get_time_range(self, entries: List[LogEntry]) -> Tuple[str, str]:
        timestamps = [e.timestamp for e in entries if e.timestamp]
        return (min(timestamps), max(timestamps)) if timestamps else ("", "")
    
    def _generate_summary(self, entries: List[LogEntry], error_count: int, warn_count: int) -> str:
        total = len(entries)
        if total == 0: return "日志为空"
        return f"共{total}条日志，{error_count}条错误，{warn_count}条警告"
    
    def _generate_recommendations(self, entries: List[LogEntry], error_codes: List[str]) -> List[str]:
        recs = []
        if any("AUTH" in c for c in error_codes):
            recs.append("检测到认证相关错误，建议检查SSO配置")
        if any("WS" in c for c in error_codes):
            recs.append("检测到Web服务错误，建议检查集成配置")
        return recs if recs else ["未发现严重问题"]


log_analyzer = LogAnalyzer()
__all__ = ["LogAnalyzer", "log_analyzer", "LogEntry", "LogLevel", "LogType", "LogAnalysisResult"]
