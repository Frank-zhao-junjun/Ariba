"""
解决方案推荐引擎 - US4核心模块

功能：
- 关联知识推荐
- 相似案例匹配
- 文档链接跳转
- 最佳实践提示
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
import re


@dataclass
class RelatedKnowledge:
    """关联知识"""
    id: str
    title: str
    similarity: float
    relevance_score: float
    category: str
    tags: List[str]
    is_faq: bool = False
    is_best_practice: bool = False


@dataclass
class SimilarCase:
    """相似案例"""
    case_id: str
    title: str
    symptoms: str
    solution_summary: str
    similarity_score: float
    resolution_time: str
    resolution_type: str


@dataclass
class DocumentLink:
    """文档链接"""
    title: str
    url: str
    doc_type: str  # config_guide, api_doc, best_practice, video
    description: str
    relevance: float


@dataclass
class BestPractice:
    """最佳实践"""
    title: str
    description: str
    steps: List[str]
    benefits: List[str]
    applicable_versions: List[str]


@dataclass
class RecommendationResult:
    """推荐结果"""
    related_knowledge: List[RelatedKnowledge] = field(default_factory=list)
    similar_cases: List[SimilarCase] = field(default_factory=list)
    document_links: List[DocumentLink] = field(default_factory=list)
    best_practices: List[BestPractice] = field(default_factory=list)
    summary: str = ""


class RecommendationEngine:
    """
    解决方案推荐引擎
    
    AC4.1: 推荐3-5个相关知识点
    AC4.2: 相似案例匹配度评分
    AC4.3: 官方文档直接跳转
    AC4.4: 最佳实践提示
    """
    
    # 官方文档URL映射
    DOC_URLS = {
        "供应商登录": {
            "admin_guide": "https://help.sap.com/docs/ariba/procurement/administration",
            "sso_config": "https://help.sap.com/docs/ariba/procurement/sso-configuration",
        },
        "审批": {
            "workflow_guide": "https://help.sap.com/docs/ariba/procurement/approval-workflows",
            "config": "https://help.sap.com/docs/ariba/procurement/workflow-configuration",
        },
        "发票": {
            "invoice_guide": "https://help.sap.com/docs/ariba/procurement/invoice-management",
            "matching": "https://help.sap.com/docs/ariba/procurement/three-way-match",
        },
        "集成": {
            "integration_guide": "https://help.sap.com/docs/ariba/procurement/integration",
            "api_doc": "https://developer.ariba.com/api",
        },
    }
    
    # 最佳实践库
    BEST_PRACTICES = {
        "供应商登录": BestPractice(
            title="供应商账户安全最佳实践",
            description="确保供应商账户安全和顺畅访问的推荐配置",
            steps=[
                "启用强密码策略",
                "配置SSO集成",
                "设置密码过期策略",
                "启用双因素认证"
            ],
            benefits=["提高安全性", "减少登录问题", "合规性增强"],
            applicable_versions=["#V2602", "#V2605", "#VNextGen"]
        ),
        "审批": BestPractice(
            title="高效审批流程设计",
            description="优化审批流程，减少瓶颈",
            steps=[
                "合理设置审批层级",
                "配置审批人代理",
                "使用条件审批规则",
                "设置超时提醒"
            ],
            benefits=["缩短审批时间", "减少卡单", "提升效率"],
            applicable_versions=["#V2602", "#V2604", "#V2605", "#VNextGen"]
        ),
        "发票匹配": BestPractice(
            title="发票自动化匹配",
            description="减少发票匹配错误和手动处理",
            steps=[
                "标准化PO格式",
                "配置自动匹配规则",
                "设置差异容差",
                "启用异常自动路由"
            ],
            benefits=["减少错误", "提高效率", "加快付款"],
            applicable_versions=["#V2604", "#V2605"]
        ),
    }
    
    # FAQ模板
    FAQ_TEMPLATES = {
        "登录": [
            "供应商首次登录需要哪些步骤？",
            "如何重置供应商密码？",
            "SSO登录失败如何排查？"
        ],
        "审批": [
            "为什么审批时间很长？",
            "如何设置审批代理？",
            "如何跳过某个审批节点？"
        ],
        "发票": [
            "发票匹配失败怎么处理？",
            "如何申请2-way匹配？",
            "发票状态在哪里查看？"
        ]
    }
    
    def __init__(self, knowledge_base: List[Dict] = None, case_history: List[Dict] = None):
        self.knowledge_base = knowledge_base or []
        self.case_history = case_history or []
    
    def recommend(
        self,
        query: str,
        current_item: Dict = None,
        version: str = None,
        limit: int = 5
    ) -> RecommendationResult:
        """
        生成推荐结果
        
        Args:
            query: 当前问题查询
            current_item: 当前查看的知识条目
            version: 当前版本
            limit: 推荐数量
            
        Returns:
            推荐结果
        """
        result = RecommendationResult()
        
        # AC4.1: 相关知识推荐
        result.related_knowledge = self._recommend_related_knowledge(query, current_item, limit)
        
        # AC4.2: 相似案例匹配
        result.similar_cases = self._find_similar_cases(query, limit)
        
        # AC4.3: 文档链接
        result.document_links = self._get_document_links(query, version)
        
        # AC4.4: 最佳实践
        result.best_practices = self._get_best_practices(query, version)
        
        # 生成摘要
        result.summary = self._generate_summary(result)
        
        return result
    
    def _recommend_related_knowledge(
        self,
        query: str,
        current_item: Dict,
        limit: int
    ) -> List[RelatedKnowledge]:
        """AC4.1: 推荐相关知识"""
        recommendations = []
        query_lower = query.lower()
        
        # 提取查询关键词
        keywords = re.findall(r'[\w]+', query_lower)
        
        for item in self.knowledge_base:
            if current_item and item.get("id") == current_item.get("id"):
                continue
            
            # 计算相似度
            item_text = f"{item.get('title', '')} {item.get('description', '')} {item.get('solution', '')}"
            item_text_lower = item_text.lower()
            
            match_count = sum(1 for kw in keywords if kw in item_text_lower)
            similarity = match_count / len(keywords) if keywords else 0
            
            # 关联度评分
            relevance = 0.0
            if item.get("related_ids"):
                if current_item and current_item.get("id") in item.get("related_ids"):
                    relevance += 0.3
            
            # 标签匹配
            item_tags = [t.lower() for t in item.get("tags", [])]
            for kw in keywords:
                if any(kw in tag for tag in item_tags):
                    relevance += 0.2
            
            total_score = similarity * 0.5 + relevance
            
            if total_score > 0:
                is_faq = any(faq_kw in item.get("title", "").lower() for faq_kw in ["如何", "怎么", "why", "how"])
                is_bp = any(bp_kw in item.get("tags", []) for bp_kw in ["#最佳实践", "#FAQ"])
                
                recommendations.append(RelatedKnowledge(
                    id=item.get("id", ""),
                    title=item.get("title", ""),
                    similarity=similarity,
                    relevance_score=total_score,
                    category=item.get("category", ""),
                    tags=item.get("tags", []),
                    is_faq=is_faq,
                    is_best_practice=is_bp
                ))
        
        # 排序并返回top N
        recommendations.sort(key=lambda x: x.relevance_score, reverse=True)
        return recommendations[:limit]
    
    def _find_similar_cases(self, query: str, limit: int) -> List[SimilarCase]:
        """AC4.2: 相似案例匹配"""
        if not self.case_history:
            # 使用知识库模拟案例
            return self._find_similar_from_knowledge(query, limit)
        
        similar = []
        query_lower = query.lower()
        keywords = set(re.findall(r'[\w]+', query_lower))
        
        for case in self.case_history:
            case_text = f"{case.get('symptoms', '')} {case.get('solution', '')}"
            case_keywords = set(re.findall(r'[\w]+', case_text.lower()))
            
            # Jaccard相似度
            intersection = keywords & case_keywords
            union = keywords | case_keywords
            similarity = len(intersection) / len(union) if union else 0
            
            if similarity > 0.1:
                similar.append(SimilarCase(
                    case_id=case.get("id", ""),
                    title=case.get("title", ""),
                    symptoms=case.get("symptoms", ""),
                    solution_summary=case.get("solution_summary", ""),
                    similarity_score=similarity,
                    resolution_time=case.get("resolution_time", ""),
                    resolution_type=case.get("resolution_type", "已解决")
                ))
        
        similar.sort(key=lambda x: x.similarity_score, reverse=True)
        return similar[:limit]
    
    def _find_similar_from_knowledge(self, query: str, limit: int) -> List[SimilarCase]:
        """从知识库中找相似案例"""
        similar = []
        query_lower = query.lower()
        
        for item in self.knowledge_base[:10]:  # 限制搜索范围
            item_text = f"{item.get('title', '')} {item.get('solution', '')}".lower()
            
            # 简单相似度
            keywords = set(re.findall(r'[\w]+', query_lower))
            item_keywords = set(re.findall(r'[\w]+', item_text))
            intersection = keywords & item_keywords
            similarity = len(intersection) / max(len(keywords), 1)
            
            if similarity > 0.2:
                similar.append(SimilarCase(
                    case_id=item.get("id", ""),
                    title=f"[相似] {item.get('title', '')}",
                    symptoms=item.get("description", ""),
                    solution_summary=item.get("solution", "")[:200],
                    similarity_score=similarity,
                    resolution_time="< 1小时",
                    resolution_type="知识库方案"
                ))
        
        return similar[:limit]
    
    def _get_document_links(self, query: str, version: str = None) -> List[DocumentLink]:
        """AC4.3: 获取官方文档链接"""
        links = []
        query_lower = query.lower()
        
        # 匹配相关文档
        for key, doc_urls in self.DOC_URLS.items():
            if key in query_lower:
                for doc_type, url in doc_urls.items():
                    links.append(DocumentLink(
                        title=self._get_doc_title(key, doc_type),
                        url=url,
                        doc_type=doc_type,
                        description=f"{key}相关{self._get_doc_type_desc(doc_type)}",
                        relevance=0.9 if key in query_lower else 0.5
                    ))
        
        # 通用文档
        if not links:
            links.append(DocumentLink(
                title="SAP Ariba 采购管理帮助中心",
                url="https://help.sap.com/docs/ariba/procurement",
                doc_type="general",
                description="SAP Ariba采购管理官方文档",
                relevance=0.5
            ))
        
        links.sort(key=lambda x: x.relevance, reverse=True)
        return links[:3]
    
    def _get_doc_title(self, topic: str, doc_type: str) -> str:
        titles = {
            ("供应商登录", "admin_guide"): "Ariba管理指南 - 供应商管理",
            ("供应商登录", "sso_config"): "SSO配置指南",
            ("审批", "workflow_guide"): "审批工作流配置指南",
            ("审批", "config"): "工作流设计最佳实践",
            ("发票", "invoice_guide"): "发票管理指南",
            ("发票", "matching"): "三向匹配配置",
            ("集成", "integration_guide"): "系统集成指南",
            ("集成", "api_doc"): "API开发文档",
        }
        return titles.get((topic, doc_type), f"{topic} - {doc_type}")
    
    def _get_doc_type_desc(self, doc_type: str) -> str:
        descs = {
            "admin_guide": "管理员配置",
            "sso_config": "单点登录",
            "workflow_guide": "工作流指南",
            "config": "配置指南",
            "invoice_guide": "发票处理",
            "matching": "匹配规则",
            "integration_guide": "集成配置",
            "api_doc": "接口文档"
        }
        return descs.get(doc_type, doc_type)
    
    def _get_best_practices(self, query: str, version: str = None) -> List[BestPractice]:
        """AC4.4: 获取最佳实践"""
        practices = []
        query_lower = query.lower()
        
        for key, practice in self.BEST_PRACTICES.items():
            if key in query_lower:
                # 检查版本适用性
                if version:
                    if any(v in version.upper() for v in practice.applicable_versions):
                        practices.append(practice)
                else:
                    practices.append(practice)
        
        # 如果没有匹配的，返回通用最佳实践
        if not practices:
            practices.append(self.BEST_PRACTICES.get("审批", None))
        
        return [p for p in practices if p][:2]
    
    def _generate_summary(self, result: RecommendationResult) -> str:
        """生成推荐摘要"""
        parts = []
        
        if result.related_knowledge:
            parts.append(f"为您推荐{len(result.related_knowledge)}篇相关知识")
        
        if result.similar_cases:
            parts.append(f"发现{len(result.similar_cases)}个相似案例")
        
        if result.document_links:
            parts.append(f"提供{len(result.document_links)}个官方文档链接")
        
        if result.best_practices:
            parts.append(f"包含{len(result.best_practices)}项最佳实践")
        
        return " | ".join(parts) if parts else "暂无推荐内容"


def create_recommendation_engine(
    knowledge_base: List[Dict] = None,
    case_history: List[Dict] = None
) -> RecommendationEngine:
    """创建推荐引擎"""
    return RecommendationEngine(knowledge_base, case_history)


__all__ = [
    "RecommendationEngine",
    "create_recommendation_engine",
    "RelatedKnowledge",
    "SimilarCase",
    "DocumentLink",
    "BestPractice",
    "RecommendationResult"
]
