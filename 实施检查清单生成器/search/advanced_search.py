#!/usr/bin/env python3
"""
US15: 高级搜索与过滤
实现全文搜索、高级过滤、保存筛选条件、搜索历史和导出功能
"""

import json
import uuid
import re
import csv
import io
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, field, asdict
from collections import defaultdict
import logging
from functools import lru_cache

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FilterOperator(Enum):
    """过滤操作符"""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_OR_EQUAL = "greater_or_equal"
    LESS_OR_EQUAL = "less_or_equal"
    IN_LIST = "in_list"
    NOT_IN_LIST = "not_in_list"
    BETWEEN = "between"
    IS_NULL = "is_null"
    IS_NOT_NULL = "is_not_null"


class SortOrder(Enum):
    """排序顺序"""
    ASC = "asc"
    DESC = "desc"


class ExportFormat(Enum):
    """导出格式"""
    JSON = "json"
    CSV = "csv"
    EXCEL = "excel"  # 简化的Excel格式


@dataclass
class FilterCondition:
    """过滤条件"""
    field: str                          # 字段名
    operator: str                       # 操作符
    value: Any                          # 比较值
    value2: Optional[Any] = None        # BETWEEN操作的第二个值
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'FilterCondition':
        return cls(**data)
    
    def evaluate(self, item: Dict) -> bool:
        """评估条件是否满足"""
        field_value = self._get_nested_value(item, self.field)
        
        if self.operator == FilterOperator.EQUALS.value:
            return field_value == self.value
        elif self.operator == FilterOperator.NOT_EQUALS.value:
            return field_value != self.value
        elif self.operator == FilterOperator.CONTAINS.value:
            return self.value in str(field_value) if field_value else False
        elif self.operator == FilterOperator.NOT_CONTAINS.value:
            return self.value not in str(field_value) if field_value else True
        elif self.operator == FilterOperator.STARTS_WITH.value:
            return str(field_value).startswith(self.value) if field_value else False
        elif self.operator == FilterOperator.ENDS_WITH.value:
            return str(field_value).endswith(self.value) if field_value else False
        elif self.operator == FilterOperator.GREATER_THAN.value:
            return field_value > self.value if field_value else False
        elif self.operator == FilterOperator.LESS_THAN.value:
            return field_value < self.value if field_value else False
        elif self.operator == FilterOperator.GREATER_OR_EQUAL.value:
            return field_value >= self.value if field_value else False
        elif self.operator == FilterOperator.LESS_OR_EQUAL.value:
            return field_value <= self.value if field_value else False
        elif self.operator == FilterOperator.IN_LIST.value:
            return field_value in self.value if field_value else False
        elif self.operator == FilterOperator.NOT_IN_LIST.value:
            return field_value not in self.value if field_value else False
        elif self.operator == FilterOperator.BETWEEN.value:
            return self.value <= field_value <= self.value2 if field_value else False
        elif self.operator == FilterOperator.IS_NULL.value:
            return field_value is None or field_value == ""
        elif self.operator == FilterOperator.IS_NOT_NULL.value:
            return field_value is not None and field_value != ""
        
        return False
    
    def _get_nested_value(self, data: Dict, path: str) -> Any:
        """获取嵌套字段值"""
        keys = path.split('.')
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value


@dataclass
class SearchQuery:
    """搜索查询"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    keywords: str = ""                 # 搜索关键词
    filters: List[Dict] = field(default_factory=list)  # 过滤条件
    filter_logic: str = "AND"           # AND/OR
    sort_by: str = "relevance"          # 排序字段
    sort_order: str = SortOrder.DESC.value
    page: int = 1                       # 页码
    page_size: int = 20                # 每页大小
    data_type: str = "all"              # 数据类型：all/checklist/template/project
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'SearchQuery':
        return cls(**data)


@dataclass
class SearchResult:
    """搜索结果"""
    query_id: str = ""
    total_count: int = 0
    page: int = 1
    page_size: int = 20
    results: List[Dict] = field(default_factory=list)
    facets: Dict[str, Dict] = field(default_factory=dict)  # 分面统计
    search_time_ms: float = 0
    scored: bool = False
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @property
    def total_pages(self) -> int:
        return (self.total_count + self.page_size - 1) // self.page_size if self.page_size > 0 else 0
    
    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages
    
    @property
    def has_prev(self) -> bool:
        return self.page > 1


@dataclass
class SearchHistory:
    """搜索历史"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    query: str = ""
    filters: List[Dict] = field(default_factory=list)
    data_type: str = "all"
    result_count: int = 0
    searched_at: str = field(default_factory=lambda: datetime.now().isoformat())
    user_id: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'SearchHistory':
        return cls(**data)


@dataclass
class SavedFilter:
    """保存的筛选条件"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    filters: List[Dict] = field(default_factory=list)
    filter_logic: str = "AND"
    data_type: str = "all"
    is_default: bool = False
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    usage_count: int = 0
    user_id: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'SavedFilter':
        return cls(**data)


class InvertedIndex:
    """倒排索引"""
    
    def __init__(self):
        self.index: Dict[str, Dict[str, List[int]]] = {}  # term -> {doc_id -> [positions]}
        self.document_count = 0
    
    def add_document(self, doc_id: str, text: str):
        """添加文档到索引"""
        terms = self._tokenize(text)
        
        for position, term in enumerate(terms):
            if term not in self.index:
                self.index[term] = {}
            if doc_id not in self.index[term]:
                self.index[term][doc_id] = []
            self.index[term][doc_id].append(position)
        
        self.document_count += 1
    
    def search(self, query: str) -> Dict[str, float]:
        """搜索并返回文档ID和相关性分数"""
        query_terms = self._tokenize(query)
        scores: Dict[str, float] = defaultdict(float)
        
        for term in query_terms:
            if term in self.index:
                # TF-IDF 计算
                doc_count = len(self.index[term])
                idf = self._calculate_idf(doc_count)
                
                for doc_id, positions in self.index[term].items():
                    tf = len(positions)
                    scores[doc_id] += tf * idf
        
        return dict(scores)
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        # 中英文分词：提取所有连续的字母数字组合
        tokens = re.findall(r'[\w]+', text.lower())
        # 去除停用词（仅英文）
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'of', 'in', 'to', 'for', 'and', 'or'}
        return [t for t in tokens if t not in stop_words and len(t) >= 1]
    
    def _calculate_idf(self, doc_count: int) -> float:
        """计算IDF"""
        return 1.0 / (1.0 + doc_count) if doc_count > 0 else 0.0


class AdvancedSearch:
    """
    高级搜索引擎
    支持全文搜索、多条件过滤、分面统计、结果排序和导出
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        """初始化搜索引擎"""
        self.storage_path = storage_path
        self.inverted_index = InvertedIndex()
        self.documents: Dict[str, Dict] = {}  # doc_id -> document
        self.search_history: List[SearchHistory] = []
        self.saved_filters: List[SavedFilter] = []
        self.stats: Dict[str, Any] = {
            'total_searches': 0,
            'total_results': 0,
            'popular_queries': defaultdict(int)
        }
        
        # 加载数据
        self._load_data()
    
    def _load_data(self):
        """加载数据"""
        if not self.storage_path:
            return
        
        import os
        os.makedirs(self.storage_path, exist_ok=True)
        
        try:
            with open(f"{self.storage_path}/search_history.json", 'r') as f:
                self.search_history = [SearchHistory.from_dict(h) for h in json.load(f)]
        except FileNotFoundError:
            pass
        
        try:
            with open(f"{self.storage_path}/saved_filters.json", 'r') as f:
                self.saved_filters = [SavedFilter.from_dict(f) for f in json.load(f)]
        except FileNotFoundError:
            pass
        
        try:
            with open(f"{self.storage_path}/search_stats.json", 'r') as f:
                self.stats = json.load(f)
                self.stats['popular_queries'] = defaultdict(int, self.stats.get('popular_queries', {}))
        except FileNotFoundError:
            pass
    
    def _save_data(self):
        """保存数据"""
        if not self.storage_path:
            return
        
        import os
        os.makedirs(self.storage_path, exist_ok=True)
        
        # 保存搜索历史（限制大小）
        history = self.search_history[-100:]
        with open(f"{self.storage_path}/search_history.json", 'w') as f:
            json.dump([h.to_dict() for h in history], f, indent=2)
        
        with open(f"{self.storage_path}/saved_filters.json", 'w') as f:
            json.dump([f.to_dict() for f in self.saved_filters], f, indent=2)
        
        with open(f"{self.storage_path}/search_stats.json", 'w') as f:
            json.dump(self.stats, f, indent=2)
    
    # ==================== 数据管理 ====================
    
    def index_document(self, doc_id: str, document: Dict):
        """索引文档"""
        self.documents[doc_id] = document
        
        # 提取可搜索文本
        searchable_text = self._extract_searchable_text(document)
        self.inverted_index.add_document(doc_id, searchable_text)
    
    def index_documents(self, documents: List[Dict], id_field: str = "id"):
        """批量索引文档"""
        for doc in documents:
            doc_id = str(doc.get(id_field, str(uuid.uuid4())))
            self.index_document(doc_id, doc)
    
    def _extract_searchable_text(self, document: Dict) -> str:
        """从文档提取可搜索文本"""
        text_parts = []
        
        # 常用搜索字段
        search_fields = ['title', 'name', 'description', 'content', 'summary']
        
        for field in search_fields:
            if field in document:
                value = document[field]
                if isinstance(value, str):
                    text_parts.append(value)
                elif isinstance(value, list):
                    text_parts.extend(str(v) for v in value)
        
        # 添加其他字符串字段
        for key, value in document.items():
            if isinstance(value, str) and len(value) < 200:
                text_parts.append(value)
        
        return " ".join(text_parts)
    
    def remove_document(self, doc_id: str):
        """移除文档"""
        if doc_id in self.documents:
            del self.documents[doc_id]
    
    def update_document(self, doc_id: str, document: Dict):
        """更新文档"""
        self.index_document(doc_id, document)
    
    # ==================== 搜索 ====================
    
    def search(self, query: SearchQuery) -> SearchResult:
        """执行搜索"""
        start_time = datetime.now()
        
        # 收集匹配的文档ID
        matched_ids = set(self.documents.keys())
        
        # 关键词搜索
        if query.keywords:
            scores = self.inverted_index.search(query.keywords)
            if scores:
                matched_ids = set(scores.keys())
            else:
                matched_ids = set()
        
        # 应用过滤条件
        if query.filters:
            conditions = [FilterCondition.from_dict(f) for f in query.filters]
            filtered_ids = set()
            
            for doc_id in matched_ids:
                doc = self.documents.get(doc_id, {})
                
                if query.filter_logic == "AND":
                    if all(c.evaluate(doc) for c in conditions):
                        filtered_ids.add(doc_id)
                else:  # OR
                    if any(c.evaluate(doc) for c in conditions):
                        filtered_ids.add(doc_id)
            
            matched_ids = filtered_ids
        
        # 排序
        sorted_ids = self._sort_results(matched_ids, query, query.keywords)
        
        # 分页
        total_count = len(sorted_ids)
        start_idx = (query.page - 1) * query.page_size
        end_idx = start_idx + query.page_size
        page_ids = sorted_ids[start_idx:end_idx]
        
        # 构建结果
        results = []
        for doc_id in page_ids:
            doc = self.documents.get(doc_id, {}).copy()
            doc['_doc_id'] = doc_id
            results.append(doc)
        
        # 计算分面统计
        facets = self._calculate_facets(matched_ids, query.data_type)
        
        # 计算搜索时间
        search_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # 记录搜索历史
        self._record_search(query, total_count)
        
        return SearchResult(
            query_id=query.id,
            total_count=total_count,
            page=query.page,
            page_size=query.page_size,
            results=results,
            facets=facets,
            search_time_ms=search_time,
            scored=bool(query.keywords)
        )
    
    def _sort_results(
        self,
        doc_ids: set,
        query: SearchQuery,
        keywords: str
    ) -> List[str]:
        """排序结果"""
        if not doc_ids:
            return []
        
        if query.sort_by == "relevance" and keywords:
            # 按相关性排序
            scores = self.inverted_index.search(keywords)
            return sorted(doc_ids, key=lambda x: scores.get(x, 0), reverse=True)
        elif query.sort_by == "created_at":
            # 按创建时间排序
            return sorted(
                doc_ids,
                key=lambda x: self.documents.get(x, {}).get('created_at', ''),
                reverse=(query.sort_order == SortOrder.DESC.value)
            )
        elif query.sort_by == "updated_at":
            # 按更新时间排序
            return sorted(
                doc_ids,
                key=lambda x: self.documents.get(x, {}).get('updated_at', ''),
                reverse=(query.sort_order == SortOrder.DESC.value)
            )
        elif query.sort_by == "title":
            # 按标题排序
            return sorted(
                doc_ids,
                key=lambda x: self.documents.get(x, {}).get('title', '').lower(),
                reverse=(query.sort_order == SortOrder.DESC.value)
            )
        else:
            return sorted(doc_ids)
    
    def _calculate_facets(self, doc_ids: set, data_type: str) -> Dict[str, Dict]:
        """计算分面统计"""
        facets = {}
        
        # 状态分面
        status_counts = defaultdict(int)
        for doc_id in doc_ids:
            doc = self.documents.get(doc_id, {})
            status = doc.get('status', 'unknown')
            status_counts[status] += 1
        facets['status'] = dict(status_counts)
        
        # 模块分面
        module_counts = defaultdict(int)
        for doc_id in doc_ids:
            doc = self.documents.get(doc_id, {})
            module = doc.get('module', 'unknown')
            module_counts[module] += 1
        facets['module'] = dict(module_counts)
        
        # 阶段分面
        phase_counts = defaultdict(int)
        for doc_id in doc_ids:
            doc = self.documents.get(doc_id, {})
            phase = doc.get('phase_name', 'unknown')
            phase_counts[phase] += 1
        facets['phase'] = dict(phase_counts)
        
        return facets
    
    def _record_search(self, query: SearchQuery, result_count: int):
        """记录搜索历史"""
        self.stats['total_searches'] += 1
        self.stats['total_results'] += result_count
        
        if query.keywords:
            self.stats['popular_queries'][query.keywords] += 1
        
        if query.keywords or query.filters:
            history = SearchHistory(
                query=query.keywords,
                filters=query.filters,
                data_type=query.data_type,
                result_count=result_count
            )
            self.search_history.append(history)
            self._save_data()
    
    # ==================== 高级过滤 ====================
    
    def create_filter(
        self,
        field: str,
        operator: str,
        value: Any,
        value2: Optional[Any] = None
    ) -> FilterCondition:
        """创建过滤条件"""
        return FilterCondition(
            field=field,
            operator=operator,
            value=value,
            value2=value2
        )
    
    def apply_filters(
        self,
        filters: List[FilterCondition],
        logic: str = "AND"
    ) -> List[str]:
        """应用过滤条件，返回匹配的文档ID"""
        matched_ids = set(self.documents.keys())
        
        for doc_id in list(matched_ids):
            doc = self.documents.get(doc_id, {})
            
            if logic == "AND":
                if not all(f.evaluate(doc) for f in filters):
                    matched_ids.discard(doc_id)
            else:  # OR
                if not any(f.evaluate(doc) for f in filters):
                    matched_ids.discard(doc_id)
        
        return list(matched_ids)
    
    # ==================== 保存的筛选条件 ====================
    
    def save_filter(
        self,
        name: str,
        filters: List[FilterCondition],
        filter_logic: str = "AND",
        description: str = "",
        data_type: str = "all"
    ) -> SavedFilter:
        """保存筛选条件"""
        saved = SavedFilter(
            name=name,
            description=description,
            filters=[f.to_dict() for f in filters],
            filter_logic=filter_logic,
            data_type=data_type
        )
        self.saved_filters.append(saved)
        self._save_data()
        return saved
    
    def get_saved_filters(self, data_type: Optional[str] = None) -> List[SavedFilter]:
        """获取保存的筛选条件"""
        if data_type:
            return [f for f in self.saved_filters if f.data_type == data_type or f.data_type == "all"]
        return self.saved_filters
    
    def apply_saved_filter(self, filter_id: str) -> Optional[SavedFilter]:
        """应用保存的筛选条件"""
        for saved in self.saved_filters:
            if saved.id == filter_id:
                saved.usage_count += 1
                saved.updated_at = datetime.now().isoformat()
                self._save_data()
                return saved
        return None
    
    def delete_saved_filter(self, filter_id: str) -> bool:
        """删除保存的筛选条件"""
        self.saved_filters = [f for f in self.saved_filters if f.id != filter_id]
        self._save_data()
        return True
    
    # ==================== 搜索历史 ====================
    
    def get_search_history(
        self,
        limit: int = 20,
        user_id: Optional[str] = None
    ) -> List[SearchHistory]:
        """获取搜索历史"""
        history = self.search_history
        
        if user_id:
            history = [h for h in history if h.user_id == user_id]
        
        return history[-limit:]
    
    def clear_search_history(self, user_id: Optional[str] = None):
        """清除搜索历史"""
        if user_id:
            self.search_history = [
                h for h in self.search_history if h.user_id != user_id
            ]
        else:
            self.search_history = []
        self._save_data()
    
    # ==================== 导出 ====================
    
    def export_results(
        self,
        results: List[Dict],
        format: str = ExportFormat.JSON.value,
        include_fields: Optional[List[str]] = None
    ) -> str:
        """导出搜索结果"""
        if format == ExportFormat.JSON.value:
            return self._export_json(results, include_fields)
        elif format == ExportFormat.CSV.value:
            return self._export_csv(results, include_fields)
        elif format == ExportFormat.EXCEL.value:
            return self._export_excel(results, include_fields)
        else:
            return self._export_json(results, include_fields)
    
    def _export_json(self, results: List[Dict], include_fields: Optional[List[str]]) -> str:
        """导出为JSON"""
        if include_fields:
            filtered_results = []
            for r in results:
                filtered = {k: v for k, v in r.items() if k in include_fields}
                filtered_results.append(filtered)
            return json.dumps(filtered_results, ensure_ascii=False, indent=2)
        return json.dumps(results, ensure_ascii=False, indent=2)
    
    def _export_csv(self, results: List[Dict], include_fields: Optional[List[str]]) -> str:
        """导出为CSV"""
        if not results:
            return ""
        
        output = io.StringIO()
        fieldnames = include_fields or list(results[0].keys())
        fieldnames = [f for f in fieldnames if not f.startswith('_')]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for r in results:
            row = {k: v for k, v in r.items() if k in fieldnames}
            # 处理复杂对象
            for k, v in row.items():
                if isinstance(v, (dict, list)):
                    row[k] = json.dumps(v, ensure_ascii=False)
            writer.writerow(row)
        
        return output.getvalue()
    
    def _export_excel(self, results: List[Dict], include_fields: Optional[List[str]]) -> str:
        """导出为简化的Excel格式（CSV变体）"""
        # 实际上Excel导出会返回XLSX格式的base64，这里简化为返回CSV
        return self._export_csv(results, include_fields)
    
    # ==================== 统计 ====================
    
    def get_stats(self) -> Dict:
        """获取搜索统计"""
        return {
            'total_searches': self.stats['total_searches'],
            'total_results': self.stats['total_results'],
            'indexed_documents': len(self.documents),
            'saved_filters': len(self.saved_filters),
            'search_history_count': len(self.search_history),
            'popular_queries': dict(sorted(
                self.stats['popular_queries'].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
        }
    
    def get_suggestions(self, prefix: str, limit: int = 10) -> List[str]:
        """获取搜索建议（自动补全）"""
        suggestions = set()
        
        # 从索引获取建议
        for term in self.inverted_index.index:
            if term.startswith(prefix.lower()):
                suggestions.add(term)
        
        # 从搜索历史获取建议
        for history in self.search_history[-50:]:
            if history.query and history.query.lower().startswith(prefix.lower()):
                suggestions.add(history.query)
        
        return sorted(list(suggestions))[:limit]
