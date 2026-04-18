"""
知识准确性验证器 - US9 AC9.1

验证知识与官方文档的一致性
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import re


@dataclass
class ValidationResult:
    """验证结果"""
    knowledge_id: str
    is_valid: bool
    issues: List[str]
    warnings: List[str]
    suggestions: List[str]
    verified_at: datetime


@dataclass
class ValidationReport:
    """验证报告"""
    total_checked: int
    valid_count: int
    invalid_count: int
    results: List[ValidationResult]
    summary: Dict


class KnowledgeValidator:
    """
    知识验证器
    
    AC9.1: 知识准确性校验
    """
    
    # 验证规则
    RULES = {
        "required_fields": ["id", "title", "description", "solution"],
        "title_min_length": 5,
        "title_max_length": 200,
        "solution_min_length": 10,
        "valid_tags": ["#供应商", "#登录", "#审批", "#发票", "#合同", "#目录", "#集成", "#预算"],
        "valid_versions": ["#V2505", "#V2602", "#V2604", "#V2605", "#VNextGen", "#VClassic"]
    }
    
    # 已知正确的官方信息（模拟）
    OFFICIAL_DOCS = {
        "AUTH-001": {"title": "供应商认证失败", "description": "包含SSO配置或密码问题"},
        "WS-404": {"title": "Web服务端点不可用", "description": "检查集成配置"},
        "invoice_matching": {"keywords": ["PO", "收货", "数量", "金额"]}
    }
    
    def __init__(self):
        self.validation_history: List[ValidationResult] = []
    
    def validate_knowledge(self, knowledge: Dict) -> ValidationResult:
        """
        验证单条知识
        
        Args:
            knowledge: 知识条目
            
        Returns:
            验证结果
        """
        issues = []
        warnings = []
        suggestions = []
        
        knowledge_id = knowledge.get("id", "unknown")
        
        # 1. 必填字段检查
        for field in self.RULES["required_fields"]:
            if field not in knowledge or not knowledge[field]:
                issues.append(f"缺少必填字段: {field}")
        
        # 2. 标题长度检查
        title = knowledge.get("title", "")
        if title:
            if len(title) < self.RULES["title_min_length"]:
                issues.append(f"标题过短 ({len(title)}字符)，建议至少{self.RULES['title_min_length']}字符")
            if len(title) > self.RULES["title_max_length"]:
                warnings.append(f"标题过长 ({len(title)}字符)，建议不超过{self.RULES['title_max_length']}字符")
        else:
            issues.append("标题为空")
        
        # 3. 解决方案长度检查
        solution = knowledge.get("solution", "")
        if solution and len(solution) < self.RULES["solution_min_length"]:
            warnings.append(f"解决方案过于简单 ({len(solution)}字符)，建议详细说明")
        
        # 4. 版本标签检查
        versions = knowledge.get("versions", [])
        for version in versions:
            version_normalized = version.upper()
            if version_normalized not in [v.upper() for v in self.RULES["valid_versions"]]:
                warnings.append(f"未知版本标签: {version}")
        
        # 5. 与官方文档对比（如果有）
        self._verify_with_official(knowledge, issues, warnings, suggestions)
        
        # 6. 错误代码验证
        self._validate_error_codes(knowledge, warnings)
        
        # 7. 关联性检查
        related_ids = knowledge.get("related_ids", [])
        if not related_ids:
            suggestions.append("建议添加关联知识以提高导航性")
        
        # 8. 标签质量检查
        tags = knowledge.get("tags", [])
        if len(tags) < 2:
            suggestions.append("建议添加更多标签以提高搜索覆盖率")
        
        is_valid = len(issues) == 0
        
        result = ValidationResult(
            knowledge_id=knowledge_id,
            is_valid=is_valid,
            issues=issues,
            warnings=warnings,
            suggestions=suggestions,
            verified_at=datetime.now()
        )
        
        self.validation_history.append(result)
        return result
    
    def _verify_with_official(self, knowledge: Dict, issues: List, warnings: List, suggestions: List):
        """与官方文档对比"""
        title = knowledge.get("title", "")
        description = knowledge.get("description", "")
        
        # 检查是否匹配已知官方信息
        for key, official_info in self.OFFICIAL_DOCS.items():
            if key.replace("_", " ") in title.lower() or key.replace("_", " ") in description.lower():
                official_title = official_info.get("title", "")
                if official_title and official_title not in title:
                    warnings.append(f"可能需要包含官方标题: '{official_title}'")
                
                official_keywords = official_info.get("keywords", [])
                content = title + " " + description
                missing_keywords = [kw for kw in official_keywords if kw not in content]
                if missing_keywords:
                    suggestions.append(f"建议包含: {', '.join(missing_keywords)}")
    
    def _validate_error_codes(self, knowledge: Dict, warnings: List):
        """验证错误代码"""
        content = knowledge.get("title", "") + " " + knowledge.get("description", "")
        codes = re.findall(r'\b([A-Z]{2,4}-\d{3,})\b', content)
        
        # 检查错误代码是否在解决方案中有对应说明
        solution = knowledge.get("solution", "")
        for code in codes:
            if code not in solution:
                warnings.append(f"提到错误代码 {code} 但解决方案中未说明")
    
    def validate_batch(self, knowledge_list: List[Dict]) -> ValidationReport:
        """
        批量验证
        
        Args:
            knowledge_list: 知识列表
            
        Returns:
            验证报告
        """
        results = [self.validate_knowledge(kb) for kb in knowledge_list]
        
        valid_count = sum(1 for r in results if r.is_valid)
        invalid_count = len(results) - valid_count
        
        return ValidationReport(
            total_checked=len(results),
            valid_count=valid_count,
            invalid_count=invalid_count,
            results=results,
            summary={
                "valid_rate": valid_count / len(results) if results else 0,
                "common_issues": self._get_common_issues(results),
                "common_suggestions": self._get_common_suggestions(results)
            }
        )
    
    def _get_common_issues(self, results: List[ValidationResult]) -> List[Dict]:
        """获取常见问题"""
        issue_counts = {}
        for result in results:
            for issue in result.issues:
                issue_counts[issue] = issue_counts.get(issue, 0) + 1
        
        return [
            {"issue": k, "count": v}
            for k, v in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
    
    def _get_common_suggestions(self, results: List[ValidationResult]) -> List[Dict]:
        """获取常见建议"""
        suggestion_counts = {}
        for result in results:
            for suggestion in result.suggestions:
                suggestion_counts[suggestion] = suggestion_counts.get(suggestion, 0) + 1
        
        return [
            {"suggestion": k, "count": v}
            for k, v in sorted(suggestion_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]


# 全局实例
knowledge_validator = KnowledgeValidator()


__all__ = ["KnowledgeValidator", "knowledge_validator", "ValidationResult", "ValidationReport"]
