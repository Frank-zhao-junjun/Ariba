"""US8: 知识图谱构建 - 单元测试"""
import unittest
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from knowledge_graph import (
    KnowledgeGraphBuilder, graph_builder,
    KnowledgeGraph, GraphNode, NodeType, EdgeType,
    GraphVisualizer, graph_visualizer,
    VersionComparator, version_comparator, DiffType
)


class TestKnowledgeGraphBuilder(unittest.TestCase):
    def setUp(self):
        self.builder = KnowledgeGraphBuilder()
        self.sample_data = [
            {"id": "KBE-001", "title": "供应商登录失败", "description": "无法登录", "solution": "检查密码", "tags": ["#登录"], "versions": ["#V2602"], "related_ids": ["KBE-002"]},
            {"id": "KBE-002", "title": "审批卡住", "description": "审批流程卡住", "solution": "检查代理", "tags": ["#审批"], "versions": ["#V2602"], "related_ids": []},
            {"id": "KBE-003", "title": "发票匹配", "description": "匹配失败", "solution": "核对数量", "tags": ["#发票"], "versions": ["#V2605"], "related_ids": []}
        ]
    
    def test_ac8_1_build_graph(self):
        """AC8.1: 构建图谱"""
        graph = self.builder.build_from_knowledge(self.sample_data)
        self.assertIsInstance(graph, KnowledgeGraph)
        self.assertGreater(len(graph.nodes), 0)
    
    def test_ac8_1_node_types(self):
        """AC8.1: 节点类型"""
        graph = self.builder.build_from_knowledge(self.sample_data)
        node_types = set(n.node_type for n in graph.nodes)
        self.assertIn(NodeType.KNOWLEDGE, node_types)
    
    def test_ac8_2_add_edges(self):
        """AC8.2: 添加边"""
        graph = self.builder.build_from_knowledge(self.sample_data)
        self.assertGreater(len(graph.edges), 0)
    
    def test_ac8_2_related_relations(self):
        """AC8.2: 关联关系"""
        graph = self.builder.build_from_knowledge(self.sample_data)
        edge_types = [e.edge_type for e in graph.edges]
        self.assertIn(EdgeType.RELATED_TO, edge_types)
    
    def test_get_neighbors(self):
        """获取邻居节点"""
        graph = self.builder.build_from_knowledge(self.sample_data)
        neighbors = graph.get_neighbors("KBE-001")
        self.assertIsInstance(neighbors, list)


class TestGraphVisualizer(unittest.TestCase):
    def setUp(self):
        self.visualizer = graph_visualizer
        self.builder = KnowledgeGraphBuilder()
        self.sample_data = [
            {"id": "KBE-001", "title": "测试", "description": "", "solution": "", "tags": [], "versions": [], "related_ids": []}
        ]
        self.graph = self.builder.build_from_knowledge(self.sample_data)
    
    def test_ac8_3_graphviz(self):
        """AC8.3: GraphViz输出"""
        dot = self.visualizer.to_graphviz(self.graph)
        self.assertIn("digraph", dot)
        self.assertIn("KBE-001", dot)
    
    def test_ac8_3_d3_json(self):
        """AC8.3: D3.js格式"""
        data = self.visualizer.to_d3_json(self.graph)
        self.assertIn("nodes", data)
        self.assertIn("links", data)
    
    def test_ac8_3_html(self):
        """AC8.3: HTML输出"""
        html = self.visualizer.to_html(self.graph)
        self.assertIn("<html>", html)
        self.assertIn("d3", html)


class TestVersionComparator(unittest.TestCase):
    def setUp(self):
        self.comparator = version_comparator
        self.data_a = [
            {"id": "KBE-001", "title": "V1知识", "description": "v1", "solution": "s1", "tags": ["#t1"], "versions": ["#V2602"]},
            {"id": "KBE-002", "title": "V1知识2", "description": "v1", "solution": "s1", "tags": [], "versions": ["#V2602"]}
        ]
        self.data_b = [
            {"id": "KBE-001", "title": "V2知识", "description": "v2", "solution": "s2", "tags": ["#t1", "#t2"], "versions": ["#V2605"]},
            {"id": "KBE-003", "title": "新增", "description": "new", "solution": "", "tags": [], "versions": ["#V2605"]}
        ]
    
    def test_ac8_4_compare(self):
        """AC8.4: 版本对比"""
        result = self.comparator.compare_versions(self.data_a, self.data_b, "#V2602", "#V2605")
        self.assertIn("added", result.summary)
        self.assertIn("modified", result.summary)
    
    def test_ac8_4_diff_report(self):
        """AC8.4: 差异报告"""
        result = self.comparator.compare_versions(self.data_a, self.data_b, "#V2602", "#V2605")
        report = self.comparator.generate_diff_report(result)
        self.assertIn("版本对比报告", report)
    
    def test_statistics(self):
        """版本统计"""
        stats = self.comparator.get_version_statistics(self.data_a)
        self.assertIn("#V2602", stats)


if __name__ == "__main__":
    unittest.main()
