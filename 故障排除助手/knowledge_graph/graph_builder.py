"""
知识图谱构建器 - US8

构建知识点关联网络
"""

from typing import List, Dict, Optional, Set, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json
import re


class NodeType(Enum):
    """节点类型"""
    KNOWLEDGE = "knowledge"           # 知识点
    SYMPTOM = "symptom"             # 症状
    CAUSE = "cause"                 # 原因
    SOLUTION = "solution"           # 解决方案
    MODULE = "module"               # 模块
    VERSION = "version"             # 版本
    ERROR_CODE = "error_code"       # 错误代码


class EdgeType(Enum):
    """边类型"""
    CAUSES = "causes"               # 导致
    SOLVES = "solves"               # 解决
    RELATED_TO = "related_to"        # 相关
    REQUIRES = "requires"           # 需要
    PART_OF = "part_of"             # 属于
    EVOLVED_FROM = "evolved_from"   # 版本演进
    SIMILAR_TO = "similar_to"       # 相似


@dataclass
class GraphNode:
    """图节点"""
    id: str
    label: str
    node_type: NodeType
    properties: Dict = field(default_factory=dict)
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "label": self.label,
            "type": self.node_type.value,
            "properties": self.properties,
            "metadata": self.metadata
        }


@dataclass
class GraphEdge:
    """图边"""
    source: str
    target: str
    edge_type: EdgeType
    weight: float = 1.0
    properties: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return {
            "source": self.source,
            "target": self.target,
            "type": self.edge_type.value,
            "weight": self.weight,
            "properties": self.properties
        }


@dataclass
class KnowledgeGraph:
    """知识图谱"""
    nodes: List[GraphNode] = field(default_factory=list)
    edges: List[GraphEdge] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    
    def add_node(self, node: GraphNode):
        self.nodes.append(node)
    
    def add_edge(self, edge: GraphEdge):
        self.edges.append(edge)
    
    def get_node(self, node_id: str) -> Optional[GraphNode]:
        for node in self.nodes:
            if node.id == node_id:
                return node
        return None
    
    def get_neighbors(self, node_id: str) -> List[GraphNode]:
        neighbors = []
        neighbor_ids = set()
        
        for edge in self.edges:
            if edge.source == node_id:
                neighbor_ids.add(edge.target)
            elif edge.target == node_id:
                neighbor_ids.add(edge.source)
        
        for node in self.nodes:
            if node.id in neighbor_ids:
                neighbors.append(node)
        
        return neighbors
    
    def get_connected_components(self) -> List[Set[str]]:
        """获取连通分量"""
        graph = {}
        for edge in self.edges:
            if edge.source not in graph:
                graph[edge.source] = set()
            if edge.target not in graph:
                graph[edge.target] = set()
            graph[edge.source].add(edge.target)
            graph[edge.target].add(edge.source)
        
        visited = set()
        components = []
        
        def dfs(node: str, component: Set):
            visited.add(node)
            component.add(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    dfs(neighbor, component)
        
        for node in graph:
            if node not in visited:
                component = set()
                dfs(node, component)
                components.append(component)
        
        return components
    
    def to_dict(self) -> Dict:
        return {
            "nodes": [n.to_dict() for n in self.nodes],
            "edges": [e.to_dict() for e in self.edges],
            "metadata": self.metadata
        }


class KnowledgeGraphBuilder:
    """
    知识图谱构建器
    
    AC8.1: 知识图谱数据结构
    AC8.2: 关联关系自动提取
    """
    
    def __init__(self):
        self.graph = KnowledgeGraph()
        self.knowledge_cache: Dict[str, Dict] = {}
    
    def build_from_knowledge(self, knowledge_items: List[Dict]) -> KnowledgeGraph:
        """
        从知识库构建图谱
        
        Args:
            knowledge_items: 知识条目列表
            
        Returns:
            知识图谱
        """
        self.graph = KnowledgeGraph()
        
        # 1. 添加所有知识点节点
        for item in knowledge_items:
            self._add_knowledge_node(item)
        
        # 2. 提取并添加关联关系
        for item in knowledge_items:
            self._extract_relations(item, knowledge_items)
        
        # 3. 添加模块节点
        self._add_module_nodes()
        
        # 4. 添加版本节点
        self._add_version_nodes()
        
        # 更新元数据
        self.graph.metadata = {
            "created_at": datetime.now().isoformat(),
            "node_count": len(self.graph.nodes),
            "edge_count": len(self.graph.edges)
        }
        
        return self.graph
    
    def _add_knowledge_node(self, item: Dict):
        """添加知识节点"""
        node = GraphNode(
            id=item.get("id", ""),
            label=item.get("title", ""),
            node_type=NodeType.KNOWLEDGE,
            properties={
                "description": item.get("description", ""),
                "solution": item.get("solution", ""),
                "tags": item.get("tags", []),
                "versions": item.get("versions", [])
            },
            metadata={
                "category": item.get("category", ""),
                "source": item.get("source", "")
            }
        )
        
        self.graph.add_node(node)
        self.knowledge_cache[node.id] = item
        
        # 添加错误代码节点
        for code in self._extract_error_codes(item.get("title", "") + " " + item.get("description", "")):
            self._add_error_code_node(code)
    
    def _add_error_code_node(self, code: str):
        """添加错误代码节点"""
        # 检查是否已存在
        for node in self.graph.nodes:
            if node.id == code:
                return
        
        node = GraphNode(
            id=code,
            label=code,
            node_type=NodeType.ERROR_CODE,
            properties={"code": code}
        )
        self.graph.add_node(node)
    
    def _extract_error_codes(self, text: str) -> List[str]:
        """提取错误代码"""
        pattern = r'\b([A-Z]{2,4}-\d{3,})\b'
        return list(set(re.findall(pattern, text)))
    
    def _extract_relations(self, item: Dict, all_items: List[Dict]):
        """AC8.2: 提取关联关系"""
        item_id = item.get("id", "")
        related_ids = item.get("related_ids", [])
        
        # 添加相关关系
        for related_id in related_ids:
            edge = GraphEdge(
                source=item_id,
                target=related_id,
                edge_type=EdgeType.RELATED_TO,
                weight=0.8
            )
            self.graph.add_edge(edge)
        
        # 标签相似关系
        item_tags = set(t.lower() for t in item.get("tags", []))
        for other in all_items:
            if other.get("id") == item_id:
                continue
            
            other_tags = set(t.lower() for t in other.get("tags", []))
            common_tags = item_tags & other_tags
            
            if len(common_tags) >= 2:  # 至少2个共同标签
                # 检查是否已有边
                exists = any(
                    (e.source == item_id and e.target == other.get("id")) or
                    (e.source == other.get("id") and e.target == item_id)
                    for e in self.graph.edges
                )
                
                if not exists:
                    edge = GraphEdge(
                        source=item_id,
                        target=other.get("id", ""),
                        edge_type=EdgeType.SIMILAR_TO,
                        weight=len(common_tags) / max(len(item_tags), 1)
                    )
                    self.graph.add_edge(edge)
        
        # 解决方案-问题关系
        if item.get("solution"):
            solution_text = item.get("solution", "").lower()
            for other in all_items:
                if other.get("id") == item_id:
                    continue
                
                problem_text = (other.get("title", "") + " " + other.get("description", "")).lower()
                
                # 检查解决方案是否与其他问题相关
                if any(kw in solution_text for kw in problem_text.split()[:10]):
                    edge = GraphEdge(
                        source=item_id,
                        target=other.get("id", ""),
                        edge_type=EdgeType.SOLVES,
                        weight=0.5
                    )
                    self.graph.add_edge(edge)
    
    def _add_module_nodes(self):
        """添加模块节点"""
        modules = set()
        
        for node in self.graph.nodes:
            category = node.metadata.get("category", "")
            if category:
                # 从分类提取模块
                module_name = category.split("-")[0].strip() if "-" in category else category
                if module_name:
                    modules.add(module_name)
        
        # 添加模块节点和关系
        for module in modules:
            module_node = GraphNode(
                id=f"module_{module}",
                label=module,
                node_type=NodeType.MODULE,
                properties={"name": module}
            )
            self.graph.add_node(module_node)
            
            # 连接知识节点
            for node in self.graph.nodes:
                if node.node_type == NodeType.KNOWLEDGE:
                    if module in node.metadata.get("category", ""):
                        edge = GraphEdge(
                            source=module_node.id,
                            target=node.id,
                            edge_type=EdgeType.PART_OF,
                            weight=1.0
                        )
                        self.graph.add_edge(edge)
    
    def _add_version_nodes(self):
        """添加版本节点"""
        versions = set()
        
        for node in self.graph.nodes:
            if node.node_type == NodeType.KNOWLEDGE:
                for v in node.properties.get("versions", []):
                    versions.add(v)
        
        for version in versions:
            version_node = GraphNode(
                id=f"version_{version}",
                label=version,
                node_type=NodeType.VERSION,
                properties={"version": version}
            )
            self.graph.add_node(version_node)
            
            # 连接知识节点
            for node in self.graph.nodes:
                if node.node_type == NodeType.KNOWLEDGE:
                    if version in node.properties.get("versions", []):
                        edge = GraphEdge(
                            source=version_node.id,
                            target=node.id,
                            edge_type=EdgeType.PART_OF,
                            weight=1.0
                        )
                        self.graph.add_edge(edge)
    
    def find_path(self, source_id: str, target_id: str) -> Optional[List[str]]:
        """查找两点间的最短路径"""
        if source_id == target_id:
            return [source_id]
        
        # BFS
        visited = {source_id}
        queue = [(source_id, [source_id])]
        
        while queue:
            current, path = queue.pop(0)
            
            for edge in self.graph.edges:
                neighbor = None
                if edge.source == current:
                    neighbor = edge.target
                elif edge.target == current:
                    neighbor = edge.source
                
                if neighbor and neighbor not in visited:
                    new_path = path + [neighbor]
                    if neighbor == target_id:
                        return new_path
                    
                    visited.add(neighbor)
                    queue.append((neighbor, new_path))
        
        return None
    
    def get_subgraph(self, node_ids: List[str]) -> KnowledgeGraph:
        """获取子图"""
        subgraph = KnowledgeGraph()
        node_id_set = set(node_ids)
        
        # 添加相关节点
        for node in self.graph.nodes:
            if node.id in node_id_set:
                subgraph.add_node(node)
        
        # 添加相关边
        for edge in self.graph.edges:
            if edge.source in node_id_set and edge.target in node_id_set:
                subgraph.add_edge(edge)
        
        return subgraph


# 全局实例
graph_builder = KnowledgeGraphBuilder()


__all__ = [
    "KnowledgeGraphBuilder", "graph_builder",
    "KnowledgeGraph", "GraphNode", "GraphEdge",
    "NodeType", "EdgeType"
]
