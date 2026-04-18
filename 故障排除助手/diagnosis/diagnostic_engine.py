"""
故障诊断引擎 - US3核心模块
"""
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class SymptomType(Enum):
    """症状类型"""
    LOGIN_FAILURE = "login_failure"
    APPROVAL_STUCK = "approval_stuck"
    MATCHING_FAILURE = "matching_failure"
    TIMEOUT = "timeout"
    INTEGRATION_ERROR = "integration_error"
    UI_ISSUE = "ui_issue"
    DATA_ERROR = "data_error"
    SYSTEM = "system"


class CauseCategory(Enum):
    AUTHENTICATION = "authentication"
    CONFIGURATION = "configuration"
    INTEGRATION = "integration"
    WORKFLOW = "workflow"
    DATA_QUALITY = "data_quality"
    NETWORK = "network"
    PERMISSION = "permission"
    SYSTEM = "system"


@dataclass
class DiagnosticStep:
    step_id: str
    title: str
    description: str
    action: str
    expected_result: str
    check_condition: str
    is_critical: bool = False


@dataclass
class DiagnosisResult:
    symptom: str
    possible_causes: List[Dict] = field(default_factory=list)
    diagnostic_steps: List[DiagnosticStep] = field(default_factory=list)
    solution_steps: List[str] = field(default_factory=list)
    recommendation: str = ""
    needs_support: bool = False
    confidence: float = 0.0


class DiagnosticTree:
    SYMPTOM_CAUSES = {
        SymptomType.LOGIN_FAILURE: [
            {"cause": "密码错误或过期", "category": CauseCategory.AUTHENTICATION, "confidence": 0.8},
            {"cause": "账户未激活", "category": CauseCategory.AUTHENTICATION, "confidence": 0.7},
            {"cause": "SSO配置错误", "category": CauseCategory.CONFIGURATION, "confidence": 0.6},
        ],
        SymptomType.APPROVAL_STUCK: [
            {"cause": "审批人未设置代理", "category": CauseCategory.WORKFLOW, "confidence": 0.8},
            {"cause": "审批规则冲突", "category": CauseCategory.CONFIGURATION, "confidence": 0.6},
            {"cause": "工作流配置错误", "category": CauseCategory.WORKFLOW, "confidence": 0.7},
        ],
        SymptomType.MATCHING_FAILURE: [
            {"cause": "PO数量与收货不一致", "category": CauseCategory.DATA_QUALITY, "confidence": 0.9},
            {"cause": "价格差异超限", "category": CauseCategory.DATA_QUALITY, "confidence": 0.7},
        ],
        SymptomType.TIMEOUT: [
            {"cause": "网络延迟", "category": CauseCategory.NETWORK, "confidence": 0.6},
            {"cause": "服务端响应慢", "category": CauseCategory.SYSTEM, "confidence": 0.5},
        ],
        SymptomType.INTEGRATION_ERROR: [
            {"cause": "ERP连接断开", "category": CauseCategory.INTEGRATION, "confidence": 0.8},
            {"cause": "API配置错误", "category": CauseCategory.CONFIGURATION, "confidence": 0.7},
        ],
        SymptomType.SYSTEM: [
            {"cause": "系统繁忙", "category": CauseCategory.SYSTEM, "confidence": 0.5},
            {"cause": "未知错误", "category": CauseCategory.SYSTEM, "confidence": 0.3},
        ],
    }
    
    CAUSE_STEPS = {
        "密码错误或过期": [
            DiagnosticStep("S1", "检查密码状态", "确认密码是否过期", "要求重置密码", "重置成功", "是否知道当前密码"),
            DiagnosticStep("S2", "发送密码重置邮件", "通过管理员发送重置链接", "重置邮件已发送", "收到邮件", "是否有管理员权限"),
        ],
        "账户未激活": [
            DiagnosticStep("S1", "检查账户状态", "查看供应商账户状态", "登录管理控制台", "状态显示Active", "是否为管理员"),
        ],
        "审批人未设置代理": [
            DiagnosticStep("S1", "检查代理设置", "查看审批人代理配置", "在用户设置中查看", "找到代理人", "是否为审批人"),
            DiagnosticStep("S2", "手动重新分配", "管理员重新分配审批", "使用工作流管理工具", "审批已重新分配", "是否有管理权限"),
        ],
        "PO数量与收货不一致": [
            DiagnosticStep("S1", "核对PO数量", "对比订单和收货数量", "在订单详情中查看", "数量一致或已识别差异", "是否可访问订单"),
        ],
    }
    
    DECISION_GUIDANCE = {
        "需要联系支持": "建议创建SAP支持工单",
        "需要配置变更": "需要系统管理员修改配置",
        "自助解决": "按照上述步骤操作即可解决",
    }


class DiagnosticEngine:
    def __init__(self, knowledge_base: List[Dict] = None):
        self.knowledge_base = knowledge_base or []
        self.diagnostic_tree = DiagnosticTree()
    
    def diagnose(self, symptom: str, context: Dict = None) -> DiagnosisResult:
        context = context or {}
        symptom_type = self._classify_symptom(symptom)
        possible_causes = self._get_possible_causes(symptom_type)
        possible_causes = self._adjust_with_context(possible_causes, context)
        diagnostic_steps = self._generate_steps(possible_causes)
        solution_steps = self._generate_solution_steps(possible_causes)
        recommendation, needs_support = self._make_recommendation(possible_causes, diagnostic_steps)
        confidence = sum(c["confidence"] for c in possible_causes) / len(possible_causes) if possible_causes else 0
        
        return DiagnosisResult(
            symptom=symptom,
            possible_causes=possible_causes,
            diagnostic_steps=diagnostic_steps,
            solution_steps=solution_steps,
            recommendation=recommendation,
            needs_support=needs_support,
            confidence=confidence
        )
    
    def _classify_symptom(self, symptom: str) -> SymptomType:
        symptom_lower = symptom.lower()
        
        if any(kw in symptom_lower for kw in ["登录", "login", "认证"]):
            return SymptomType.LOGIN_FAILURE
        if any(kw in symptom_lower for kw in ["审批", "approval"]):
            if any(kw in symptom_lower for kw in ["卡住", "stuck"]):
                return SymptomType.APPROVAL_STUCK
        if any(kw in symptom_lower for kw in ["匹配", "match"]):
            return SymptomType.MATCHING_FAILURE
        if any(kw in symptom_lower for kw in ["超时", "timeout"]):
            return SymptomType.TIMEOUT
        if any(kw in symptom_lower for kw in ["集成", "integration"]):
            return SymptomType.INTEGRATION_ERROR
        
        return SymptomType.SYSTEM
    
    def _get_possible_causes(self, symptom_type: SymptomType) -> List[Dict]:
        return [c.copy() for c in self.diagnostic_tree.SYMPTOM_CAUSES.get(symptom_type, [])]
    
    def _adjust_with_context(self, causes: List[Dict], context: Dict) -> List[Dict]:
        version = context.get("version", "")
        if "#VNextGen" in version or "NextGen" in version:
            for cause in causes:
                if cause["category"] == CauseCategory.CONFIGURATION:
                    cause["confidence"] *= 1.2
        causes.sort(key=lambda x: x["confidence"], reverse=True)
        return causes
    
    def _generate_steps(self, causes: List[Dict]) -> List[DiagnosticStep]:
        steps = []
        for cause in causes[:3]:
            cause_name = cause["cause"]
            if cause_name in self.diagnostic_tree.CAUSE_STEPS:
                for template in self.diagnostic_tree.CAUSE_STEPS[cause_name]:
                    steps.append(template)
        return steps
    
    def _generate_solution_steps(self, causes: List[Dict]) -> List[str]:
        solutions = []
        for cause in causes:
            cause_name = cause["cause"]
            if cause_name in self.diagnostic_tree.CAUSE_STEPS:
                for step in self.diagnostic_tree.CAUSE_STEPS[cause_name]:
                    if step.action not in solutions:
                        solutions.append(step.action)
        return solutions
    
    def _make_recommendation(self, causes: List[Dict], steps: List[DiagnosticStep]) -> Tuple[str, bool]:
        if not steps:
            return self.diagnostic_tree.DECISION_GUIDANCE["需要联系支持"], True
        if len(steps) > 5 or (causes and causes[0]["confidence"] < 0.5):
            return self.diagnostic_tree.DECISION_GUIDANCE["需要联系支持"], True
        return self.diagnostic_tree.DECISION_GUIDANCE["自助解决"], False
    
    def get_diagnostic_flow(self, symptom: str) -> Dict:
        result = self.diagnose(symptom)
        return {
            "symptom": result.symptom,
            "steps": [{"id": i, "condition": c["cause"]} for i, c in enumerate(result.possible_causes[:3])]
        }


def create_diagnostic_engine(knowledge_base: List[Dict] = None) -> DiagnosticEngine:
    return DiagnosticEngine(knowledge_base)


__all__ = ["DiagnosticEngine", "create_diagnostic_engine", "DiagnosisResult", "DiagnosticStep", "SymptomType", "CauseCategory"]
