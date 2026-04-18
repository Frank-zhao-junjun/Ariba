"""
同义词词典 - 支持中文和SAP Ariba专业术语变体词扩展
"""

# SAP Ariba专业术语同义词
SYNONYM_DICT = {
    # 供应商相关
    "供应商": ["供应商", "供应商", "Vendor", "Supplier", "供货商", "供应方"],
    "供应商注册": ["供应商注册", "供应商申请", "Vendor Registration", "Supplier Registration"],
    "供应商登录": ["供应商登录", "供应商访问", "Vendor Login", "Supplier Login"],
    
    # 采购相关
    "采购申请": ["采购申请", "请购单", "PR", "Purchase Request", "Purchase Requisition", "请购"],
    "采购订单": ["采购订单", "PO", "Purchase Order", "订单"],
    "发票": ["发票", "Invoice", "Bill", "账单"],
    "收货": ["收货", "Receipt", "接收", "到货"],
    
    # 工作流相关
    "审批": ["审批", "Approval", "审核", "approve"],
    "审批流程": ["审批流程", "Approval Workflow", "审批工作流", "审核流程"],
    "审批人": ["审批人", "Approver", "审批者", "审核人"],
    
    # 合同相关
    "合同": ["合同", "Contract", "Agreement", "协议"],
    "合同审批": ["合同审批", "Contract Approval", "合同审核"],
    
    # 登录认证相关
    "登录": ["登录", "Login", "Sign In", "登录", "访问", "log in"],
    "登录失败": ["登录失败", "Login Failed", "无法登录", "登录错误", "无法登录"],
    "密码": ["密码", "Password", "pwd", "口令"],
    "认证": ["认证", "Authentication", "Auth", "身份验证"],
    
    # 错误相关
    "错误": ["错误", "Error", "Err", "故障", "问题", "异常"],
    "失败": ["失败", "Failed", "Error", "无法", "错误"],
    "卡住": ["卡住", "Stuck", "Hang", "停滞", "阻塞"],
    "超时": ["超时", "Timeout", "Time Out", "超时错误"],
    
    # 配置相关
    "配置": ["配置", "Configuration", "Config", "设置"],
    "集成": ["集成", "Integration", "Integrate", "对接"],
    
    # 匹配相关
    "匹配": ["匹配", "Match", "Matching", "比对", "对照"],
    "三向匹配": ["三向匹配", "3-Way Match", "Three-way Match"],
    "两向匹配": ["两向匹配", "2-Way Match", "Two-way Match"],
    
    # 目录相关
    "目录": ["目录", "Catalog", "Item Catalog", "商品目录"],
    "Punchout": ["Punchout", "Punch-Out", "punchout目录", "外部目录"],
    
    # 移动端相关
    "移动": ["移动", "Mobile", "App", "手机", "移动端"],
    "显示": ["显示", "Display", "Show", "界面", "UI"],
}

# 英文到中文的快速映射
ENGLISH_TO_CHINESE = {
    "vendor": "供应商",
    "supplier": "供应商",
    "login": "登录",
    "approval": "审批",
    "invoice": "发票",
    "contract": "合同",
    "catalog": "目录",
    "mobile": "移动",
    "error": "错误",
    "failed": "失败",
    "stuck": "卡住",
    "timeout": "超时",
    "configuration": "配置",
    "integration": "集成",
    "match": "匹配",
}

# 常见错误代码模式
ERROR_CODE_PATTERNS = [
    r'ERR-\d{3,}',       # ERR-001, ERR-12345
    r'ERROR-\d+',        # ERROR-123
    r'E\d{4,}',          # E1234
    r'\d{4}[A-Z]{2,}',   # 1234AB
    r'AF-\d+',           # AF-123 (Ariba Flow)
    r'WS-\d+',           # WS-123 (Web Service)
    r'HTTP-\d{3}',       # HTTP-404, HTTP-500
]


class SynonymExpander:
    """同义词扩展器"""
    
    def __init__(self):
        self.synonym_dict = SYNONYM_DICT.copy()
        self.en2cn = ENGLISH_TO_CHINESE.copy()
    
    def expand_query(self, query: str) -> list:
        """
        扩展查询词，返回所有可能的变体
        
        Args:
            query: 原始查询
            
        Returns:
            扩展后的关键词列表
        """
        query_lower = query.lower()
        expanded = set()
        expanded.add(query_lower)
        
        # 1. 检查是否匹配已知术语
        for canonical, variants in self.synonym_dict.items():
            for variant in variants:
                if variant.lower() in query_lower:
                    # 添加所有变体
                    expanded.add(canonical)
                    expanded.update([v.lower() for v in variants])
        
        # 2. 英中互译
        for eng, cn in self.en2cn.items():
            if eng in query_lower:
                expanded.add(eng)
                expanded.add(cn)
        
        # 3. 分词后扩展
        import re
        words = re.findall(r'[\w]+', query_lower)
        for word in words:
            if word in self.en2cn:
                expanded.add(word)
                expanded.add(self.en2cn[word])
        
        return list(expanded)
    
    def get_canonical_form(self, word: str) -> str:
        """获取词的规范形式"""
        word_lower = word.lower()
        
        for canonical, variants in self.synonym_dict.items():
            if word_lower in [v.lower() for v in variants]:
                return canonical
        
        return word_lower
    
    def find_synonyms(self, word: str) -> list:
        """查找同义词"""
        word_lower = word.lower()
        
        for canonical, variants in self.synonym_dict.items():
            if word_lower in [v.lower() for v in variants]:
                result = [canonical] + [v for v in variants if v.lower() != word_lower]
                return result
        
        return [word]


# 全局实例
synonym_expander = SynonymExpander()


__all__ = ["SynonymExpander", "synonym_expander", "SYNONYM_DICT", "ERROR_CODE_PATTERNS"]
