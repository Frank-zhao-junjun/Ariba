"""
错误代码解析器
"""
import re
from typing import List, Dict, Optional


class ErrorCodeParser:
    """错误代码解析器"""
    
    def __init__(self):
        self.error_patterns = [
            r'([A-Z]{2,6}-\d{3,6})',    # AUTH-001, WS-404
            r'ERR[-_](\d{3,6})',          # ERR-001
            r'E(\d{4,6})',                # E1234
        ]
        self.compiled_patterns = [re.compile(p, re.IGNORECASE) for p in self.error_patterns]
    
    def extract_error_codes(self, text: str) -> List[str]:
        """从文本中提取错误代码"""
        error_codes = set()
        
        for pattern in self.compiled_patterns:
            matches = pattern.findall(text)
            for match in matches:
                if isinstance(match, tuple):
                    code = match[0] if match[0] else ""
                else:
                    code = match
                
                if code:
                    code = self._normalize_code(code)
                    if code:
                        error_codes.add(code)
        
        return list(error_codes)
    
    def _normalize_code(self, code: str) -> Optional[str]:
        """标准化错误代码"""
        code = code.strip().upper().replace("_", "-")
        
        if re.match(r'^[A-Z]{2,6}-\d+$', code):
            return code
        if re.match(r'^E\d{4,}$', code):
            return code
        
        return None
    
    def classify_error(self, error_code: str) -> Dict:
        """分类错误代码"""
        error_code = error_code.upper()
        prefix = re.match(r'^([A-Z]+)', error_code)
        
        categories = {
            "AUTH": {"category": "AUTH", "description": "认证授权错误"},
            "WS": {"category": "WS", "description": "Web服务集成错误"},
            "WF": {"category": "WF", "description": "工作流错误"},
            "INV": {"category": "INV", "description": "发票处理错误"},
            "CAT": {"category": "CAT", "description": "目录错误"},
        }
        
        if prefix:
            prefix_str = prefix.group(1)
            for cat_id, cat_info in categories.items():
                if cat_info["category"] == prefix_str:
                    return {**cat_info, "is_known": error_code in ["AUTH-001", "WS-404"]}
        
        return {"category": "UNKNOWN", "description": "未知错误", "is_known": False}
    
    def get_error_knowledge(self, error_code: str) -> Optional[Dict]:
        """获取错误知识"""
        knowledge_map = {
            "AUTH-001": {"title": "供应商认证失败", "solution": "检查SSO配置"},
            "WS-404": {"title": "Web服务端点不可用", "solution": "检查集成配置"},
        }
        return knowledge_map.get(error_code.upper())


error_parser = ErrorCodeParser()

__all__ = ["ErrorCodeParser", "error_parser"]
