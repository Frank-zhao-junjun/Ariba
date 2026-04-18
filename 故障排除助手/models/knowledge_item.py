"""
SAP Ariba 故障知识数据模型
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class KnowledgeItem(BaseModel):
    id: str = Field(..., description="知识条目唯一ID")
    title: str = Field(..., description="故障问题标题")
    description: str = Field(..., description="故障详细描述")
    solution: str = Field(..., description="解决方案")
    category: str = Field(default="08-故障排查", description="所属分类")
    tags: List[str] = Field(default_factory=list, description="标签列表")
    versions: List[str] = Field(default_factory=list, description="适用版本标签")
    source: Optional[str] = Field(None, description="知识来源")
    related_ids: List[str] = Field(default_factory=list, description="关联知识ID")
    created_at: Optional[datetime] = Field(None, description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")
    
    def to_dict(self) -> dict:
        return self.model_dump()
    
    def get_searchable_text(self) -> str:
        parts = [self.title, self.description, self.solution, " ".join(self.tags), self.category]
        return " ".join(parts).lower()


class QueryResult(BaseModel):
    item: KnowledgeItem
    score: float = Field(..., ge=0, le=100, description="匹配得分 0-100")
    match_type: str = Field(default="keyword", description="匹配类型")
    matched_keywords: List[str] = Field(default_factory=list, description="匹配的关键词")


__all__ = ["KnowledgeItem", "QueryResult"]
