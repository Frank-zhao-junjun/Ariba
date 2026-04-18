"""
图谱可视化 - US8 AC8.3

支持GraphViz/D3.js格式输出
"""

from typing import Dict, List, Optional
import json


class GraphVisualizer:
    """
    图谱可视化器
    
    AC8.3: 图谱可视化
    """
    
    def to_graphviz(self, graph: "KnowledgeGraph", output_path: str = None) -> str:
        """
        转换为GraphViz格式
        
        Args:
            graph: 知识图谱
            output_path: 输出文件路径
            
        Returns:
            GraphViz DOT语言代码
        """
        lines = [
            "digraph KnowledgeGraph {",
            "  rankdir=LR;",
            "  node [shape=box, style=rounded];",
            "  edge [arrowhead=normal];",
            ""
        ]
        
        # 节点定义
        for node in graph.nodes:
            node_type = node.node_type.value
            
            # 根据类型设置颜色
            color_map = {
                "knowledge": "#3498db",
                "error_code": "#e74c3c",
                "module": "#2ecc71",
                "version": "#9b59b6",
                "symptom": "#f39c12",
                "cause": "#e67e22",
                "solution": "#1abc9c"
            }
            
            color = color_map.get(node_type, "#95a5a6")
            label = node.label.replace('"', '\\"')[:50]
            
            lines.append(f'  "{node.id}" [label="{label}", fillcolor="{color}", style=filled];')
        
        lines.append("")
        
        # 边定义
        for edge in graph.edges:
            edge_type = edge.edge_type.value
            
            style_map = {
                "causes": "solid",
                "solves": "dashed",
                "related_to": "dotted",
                "similar_to": "dashed",
                "part_of": "solid"
            }
            
            style = style_map.get(edge_type, "solid")
            
            lines.append(f'  "{edge.source}" -> "{edge.target}" [label="{edge_type}", style={style}];')
        
        lines.append("}")
        
        dot_code = "\n".join(lines)
        
        if output_path:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(dot_code)
        
        return dot_code
    
    def to_d3_json(self, graph: "KnowledgeGraph") -> Dict:
        """
        转换为D3.js格式
        
        Args:
            graph: 知识图谱
            
        Returns:
            D3.js兼容的JSON数据
        """
        nodes = []
        for node in graph.nodes:
            nodes.append({
                "id": node.id,
                "name": node.label,
                "group": node.node_type.value,
                "properties": node.properties
            })
        
        links = []
        for edge in graph.edges:
            links.append({
                "source": edge.source,
                "target": edge.target,
                "type": edge.edge_type.value,
                "value": edge.weight
            })
        
        return {
            "nodes": nodes,
            "links": links
        }
    
    def to_html(self, graph: "KnowledgeGraph", title: str = "知识图谱") -> str:
        """
        生成交互式HTML
        
        Args:
            graph: 知识图谱
            title: 标题
            
        Returns:
            HTML代码
        """
        d3_data = self.to_d3_json(graph)
        
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{title}</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; overflow: hidden; }}
        .container {{ width: 100vw; height: 100vh; }}
        svg {{ width: 100%; height: 100%; }}
        .node text {{ font-size: 12px; }}
        .link {{ stroke: #999; stroke-opacity: 0.6; }}
        .node circle {{ stroke: #fff; stroke-width: 1.5px; }}
    </style>
</head>
<body>
    <div class="container" id="graph"></div>
    <script>
        const data = {json.dumps(d3_data, ensure_ascii=False)};
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const svg = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));
        
        const link = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke-width", d => Math.sqrt(d.value));
        
        const node = svg.append("g")
            .selectAll("g")
            .data(data.nodes)
            .enter().append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        
        const colors = {{
            knowledge: "#3498db",
            error_code: "#e74c3c",
            module: "#2ecc71",
            version: "#9b59b6"
        }};
        
        node.append("circle")
            .attr("r", 10)
            .attr("fill", d => colors[d.group] || "#95a5a6");
        
        node.append("text")
            .text(d => d.name.substring(0, 20))
            .attr("x", 15)
            .attr("y", 4);
        
        simulation.on("tick", () => {{
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            node.attr("transform", d => `translate(${{d.x}},${{d.y}})`);
        }});
        
        function dragstarted(event) {{
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }}
        
        function dragged(event) {{
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }}
        
        function dragended(event) {{
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }}
    </script>
</body>
</html>"""
        
        return html
    
    def export_json(self, graph: "KnowledgeGraph", output_path: str = None) -> str:
        """导出JSON"""
        data = graph.to_dict()
        json_str = json.dumps(data, ensure_ascii=False, indent=2)
        
        if output_path:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(json_str)
        
        return json_str


# 全局实例
graph_visualizer = GraphVisualizer()


__all__ = ["GraphVisualizer", "graph_visualizer"]
