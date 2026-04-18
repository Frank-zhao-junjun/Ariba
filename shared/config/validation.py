"""
配置验证与热更新
提供配置验证和运行时热更新功能
"""

from typing import Any, Dict, List, Optional, Callable, Union, Type
from dataclasses import dataclass, field
from enum import Enum
import time
import threading
import json
import hashlib
from pathlib import Path
from collections import defaultdict


class ValidationLevel(Enum):
    """验证级别"""
    STRICT = "strict"      # 严格模式
    WARNING = "warning"    # 警告模式
    PERMISSIVE = "permissive"  # 宽松模式


@dataclass
class ValidationError:
    """验证错误"""
    key: str
    message: str
    expected: Optional[Any] = None
    actual: Optional[Any] = None


@dataclass
class ValidationResult:
    """验证结果"""
    valid: bool
    errors: List[ValidationError] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    
    def add_error(self, error: ValidationError) -> None:
        """添加错误"""
        self.errors.append(error)
        self.valid = False
    
    def add_warning(self, warning: str) -> None:
        """添加警告"""
        self.warnings.append(warning)


class ConfigValidator:
    """配置验证器"""
    
    def __init__(self, level: ValidationLevel = ValidationLevel.STRICT):
        self.level = level
        self._rules: Dict[str, Callable[[Any], bool]] = {}
    
    def add_rule(self, key: str, validator: Callable[[Any], bool]) -> None:
        """
        添加验证规则
        
        Args:
            key: 配置键
            validator: 验证函数, 返回True表示通过
        """
        self._rules[key] = validator
    
    def validate_type(self, key: str, value: Any, expected_type: Type) -> bool:
        """验证类型"""
        return isinstance(value, expected_type)
    
    def validate_range(
        self, 
        key: str, 
        value: Union[int, float], 
        min_val: Optional[Union[int, float]] = None,
        max_val: Optional[Union[int, float]] = None
    ) -> bool:
        """验证数值范围"""
        if min_val is not None and value < min_val:
            return False
        if max_val is not None and value > max_val:
            return False
        return True
    
    def validate_choice(self, key: str, value: Any, choices: List[Any]) -> bool:
        """验证选项"""
        return value in choices
    
    def validate_pattern(self, key: str, value: str, pattern: str) -> bool:
        """验证正则表达式"""
        import re
        return bool(re.match(pattern, value))
    
    def validate(self, config: Dict[str, Any]) -> ValidationResult:
        """执行验证"""
        result = ValidationResult(valid=True)
        
        for key, validator in self._rules.items():
            if key in config:
                value = config[key]
                try:
                    if not validator(value):
                        result.add_error(ValidationError(
                            key=key,
                            message=f"Validation failed for {key}",
                            actual=value
                        ))
                except Exception as e:
                    result.add_error(ValidationError(
                        key=key,
                        message=str(e),
                        actual=value
                    ))
        
        return result


class ConfigHotReloader:
    """配置热更新器"""
    
    def __init__(self, config_manager):
        self._config_manager = config_manager
        self._file_watchers: Dict[str, Dict] = {}
        self._change_callbacks: List[Callable] = []
        self._last_modified: Dict[str, float] = {}
        self._running = False
        self._watch_thread: Optional[threading.Thread] = None
        self._lock = threading.RLock()
    
    def watch_file(
        self,
        path: Union[str, Path],
        callback: Optional[Callable[[str, Any], None]] = None,
        poll_interval: float = 1.0
    ) -> None:
        """
        监视文件变化
        
        Args:
            path: 文件路径
            callback: 变更回调函数
            poll_interval: 轮询间隔(秒)
        """
        path = str(path)
        self._file_watchers[path] = {
            "callback": callback,
            "poll_interval": poll_interval,
            "last_hash": self._get_file_hash(path)
        }
    
    def add_callback(self, callback: Callable) -> None:
        """添加变更回调"""
        self._change_callbacks.append(callback)
    
    def start(self) -> None:
        """启动监视"""
        if self._running:
            return
        
        self._running = True
        self._watch_thread = threading.Thread(target=self._watch_loop, daemon=True)
        self._watch_thread.start()
    
    def stop(self) -> None:
        """停止监视"""
        self._running = False
        if self._watch_thread:
            self._watch_thread.join(timeout=2)
    
    def check_changes(self) -> List[str]:
        """手动检查变更"""
        changed = []
        
        for path, watcher in list(self._file_watchers.items()):
            current_hash = self._get_file_hash(path)
            if current_hash != watcher.get("last_hash"):
                changed.append(path)
                watcher["last_hash"] = current_hash
                
                # 触发回调
                callback = watcher.get("callback")
                if callback:
                    try:
                        callback(path, self._load_file(path))
                    except Exception:
                        pass
                
                # 触发全局回调
                for cb in self._change_callbacks:
                    try:
                        cb(path, self._load_file(path))
                    except Exception:
                        pass
        
        return changed
    
    def _watch_loop(self) -> None:
        """监视循环"""
        while self._running:
            try:
                self.check_changes()
                
                # 按最短间隔休眠
                min_interval = min(
                    w.get("poll_interval", 1.0)
                    for w in self._file_watchers.values()
                ) if self._file_watchers else 1.0
                
                time.sleep(min_interval)
            except Exception:
                pass
    
    def _get_file_hash(self, path: str) -> Optional[str]:
        """获取文件哈希"""
        try:
            p = Path(path)
            if not p.exists():
                return None
            
            content = p.read_bytes()
            return hashlib.md5(content).hexdigest()
        except Exception:
            return None
    
    def _load_file(self, path: str) -> Dict:
        """加载文件"""
        p = Path(path)
        suffix = p.suffix.lower()
        
        if suffix in ['.yaml', '.yml']:
            import yaml
            with open(p, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        elif suffix == '.json':
            with open(p, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        return {}


class ConfigChangeDetector:
    """配置变更检测器"""
    
    def __init__(self):
        self._snapshots: Dict[str, Dict] = {}
        self._history: List[Dict] = []
        self._max_history = 100
    
    def take_snapshot(self, namespace: str, config: Dict) -> None:
        """拍摄快照"""
        snapshot = {
            "timestamp": time.time(),
            "namespace": namespace,
            "config": config.copy()
        }
        
        self._snapshots[namespace] = snapshot
        self._history.append(snapshot)
        
        # 限制历史长度
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history:]
    
    def detect_changes(self, namespace: str, current: Dict) -> Dict[str, Any]:
        """
        检测配置变更
        
        Returns:
            {
                "changed": [...],
                "added": [...],
                "removed": [...]
            }
        """
        previous = self._snapshots.get(namespace, {}).get("config", {})
        
        previous_keys = set(previous.keys())
        current_keys = set(current.keys())
        
        return {
            "changed": list(previous_keys & current_keys),
            "added": list(current_keys - previous_keys),
            "removed": list(previous_keys - current_keys)
        }
    
    def get_history(self, namespace: Optional[str] = None, limit: int = 10) -> List[Dict]:
        """获取变更历史"""
        history = self._history
        
        if namespace:
            history = [h for h in history if h.get("namespace") == namespace]
        
        return history[-limit:]
    
    def rollback(self, namespace: str, index: int = -1) -> Optional[Dict]:
        """
        回滚到历史快照
        
        Args:
            namespace: 命名空间
            index: 历史索引, -1表示上一个
            
        Returns:
            回滚的配置
        """
        namespace_history = [h for h in self._history if h.get("namespace") == namespace]
        
        if not namespace_history:
            return None
        
        # 获取目标快照
        target = namespace_history[index]
        return target.get("config")


# ===== 预定义验证规则 =====

def create_default_validator() -> ConfigValidator:
    """创建默认验证器"""
    validator = ConfigValidator(ValidationLevel.STRICT)
    
    # 数值范围
    validator.add_rule("cache_ttl", lambda v: isinstance(v, int) and 0 < v <= 86400)
    validator.add_rule("max_results", lambda v: isinstance(v, int) and 0 < v <= 100)
    validator.add_rule("similarity_threshold", lambda v: isinstance(v, (int, float)) and 0 <= v <= 1)
    
    # 布尔值
    validator.add_rule("debug", lambda v: isinstance(v, bool))
    validator.add_rule("cache_enabled", lambda v: isinstance(v, bool))
    
    # 字符串
    validator.add_rule("log_level", lambda v: v in ["DEBUG", "INFO", "WARNING", "ERROR"])
    validator.add_rule("environment", lambda v: v in ["development", "testing", "staging", "production"])
    
    return validator
