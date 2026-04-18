"""
索引构建器 - US10 AC10.3

多维度索引实现
"""

from typing import List, Dict, Optional, Set
from collections import defaultdict
import re


class IndexBuilder:
    """
    索引构建器
    
    AC10.3: 多维度索引构建
    """
    
    def __init__(self):
        # 倒排索引: 词 -> 文档ID列表
        self.inverted_index: Dict[str, Set[str]] = defaultdict(set)
        
        # 正向索引: 文档ID -> 文档
        self.forward_index: Dict[str, Dict] = {}
        
        # 版本索引: 版本 -> 文档ID列表
        self.version_index: Dict[str, Set[str]] = defaultdict(set)
        
        # 标签索引: 标签 -> 文档ID列表
        self.tag_index: Dict[str, Set[str]] = defaultdict(set)
        
        # 错误代码索引: 代码 -> 文档ID列表
        self.error_code_index: Dict[str, Set[str]] = defaultdict(set)
        
        # N-gram索引
        self.ngram_index: Dict[str, Set[str]] = defaultdict(set)
        self.ngram_size = 3
    
    def build_index(self, knowledge_items: List[Dict]):
        """
        构建索引
        
        Args:
            knowledge_items: 知识条目列表
        """
        for item in knowledge_items:
            self._index_item(item)
    
    def _index_item(self, item: Dict):
        """索引单个条目"""
        kb_id = item.get("id", "")
        if not kb_id:
            return
        
        # 保存正向索引
        self.forward_index[kb_id] = item
        
        # 提取并索引文本
        text = self._extract_text(item)
        tokens = self._tokenize(text)
        
        # 倒排索引
        for token in tokens:
            self.inverted_index[token].add(kb_id)
        
        # N-gram索引
        for token in tokens:
            if len(token) >= self.ngram_size:
                for ngram in self._generate_ngrams(token):
                    self.ngram_index[ngram].add(kb_id)
        
        # 版本索引
        for version in item.get("versions", []):
            self.version_index[version.upper()].add(kb_id)
        
        # 标签索引
        for tag in item.get("tags", []):
            self.tag_index[tag.upper()].add(kb_id)
        
        # 错误代码索引
        codes = self._extract_error_codes(text)
        for code in codes:
            self.error_code_index[code.upper()].add(kb_id)
    
    def _extract_text(self, item: Dict) -> str:
        """提取可索引文本"""
        parts = [
            item.get("title", ""),
            item.get("description", ""),
            item.get("solution", ""),
            " ".join(item.get("tags", []))
        ]
        return " ".join(parts)
    
    def _tokenize(self, text: str) -> List[str]:
        """分词"""
        # 简单分词：中文按字符，英文按单词
        tokens = []
        
        # 英文单词
        english_words = re.findall(r'[a-zA-Z]+', text.lower())
        tokens.extend(english_words)
        
        # 中文字符组合
        chinese_chars = re.findall(r'[\u4e00-\u9fff]+', text)
        for chars in chinese_chars:
            # 2-gram
            for i in range(len(chars) - 1):
                tokens.append(chars[i:i+2])
            tokens.append(chars)  # 整词
        
        return tokens
    
    def _generate_ngrams(self, text: str) -> List[str]:
        """生成N-gram"""
        return [text[i:i+self.ngram_size] for i in range(len(text) - self.ngram_size + 1)]
    
    def _extract_error_codes(self, text: str) -> List[str]:
        """提取错误代码"""
        return re.findall(r'\b([A-Z]{2,4}-\d{3,})\b', text)
    
    def search(self, query: str, version: str = None) -> List[str]:
        """
        索引搜索
        
        Args:
            query: 查询词
            version: 版本过滤
            
        Returns:
            匹配的文档ID列表
        """
        tokens = self._tokenize(query.lower())
        if not tokens:
            return []
        
        # 获取每个token的文档集合
        token_docs = []
        for token in tokens:
            docs = self.inverted_index.get(token, set())
            # 也检查N-gram
            for ngram in self._generate_ngrams(token):
                docs |= self.ngram_index.get(ngram, set())
            token_docs.append(docs)
        
        # 交集（AND搜索）
        result = set.intersection(*token_docs) if token_docs else set()
        
        # 版本过滤
        if version:
            version_docs = self.version_index.get(version.upper(), set())
            result &= version_docs
        
        return list(result)
    
    def search_by_tag(self, tag: str) -> List[str]:
        """按标签搜索"""
        return list(self.tag_index.get(tag.upper(), set()))
    
    def search_by_version(self, version: str) -> List[str]:
        """按版本搜索"""
        return list(self.version_index.get(version.upper(), set()))
    
    def search_by_error_code(self, code: str) -> List[str]:
        """按错误代码搜索"""
        return list(self.error_code_index.get(code.upper(), set()))
    
    def get_stats(self) -> Dict:
        """获取索引统计"""
        return {
            "total_documents": len(self.forward_index),
            "vocabulary_size": len(self.inverted_index),
            "ngram_size": len(self.ngram_index),
            "versions": len(self.version_index),
            "tags": len(self.tag_index),
            "error_codes": len(self.error_code_index)
        }


# 全局实例
index_builder = IndexBuilder()


__all__ = ["IndexBuilder", "index_builder"]
