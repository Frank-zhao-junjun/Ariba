"""
监控仪表盘 - US7 AC7.4

可视化监控数据
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class DashboardWidget:
    """仪表盘组件"""
    widget_type: str  # chart, metric, alert_list, status
    title: str
    data: Dict
    config: Dict


@dataclass
class Dashboard:
    """仪表盘"""
    name: str
    widgets: List[DashboardWidget]
    last_updated: datetime


class DashboardGenerator:
    """
    仪表盘生成器
    
    AC7.4: 监控仪表盘可视化
    """
    
    def __init__(self):
        self.widgets = []
    
    def add_metric_widget(self, title: str, metric_name: str, value: float, unit: str = "", trend: str = "stable") -> DashboardWidget:
        """添加指标组件"""
        return DashboardWidget(
            widget_type="metric",
            title=title,
            data={"value": value, "unit": unit, "trend": trend, "metric": metric_name},
            config={}
        )
    
    def add_chart_widget(self, title: str, chart_type: str, data: List[Dict]) -> DashboardWidget:
        """添加图表组件"""
        return DashboardWidget(
            widget_type="chart",
            title=title,
            data={"chart_type": chart_type, "data_points": data},
            config={"type": chart_type}
        )
    
    def add_alert_widget(self, title: str, alerts: List[Dict]) -> DashboardWidget:
        """添加告警列表组件"""
        return DashboardWidget(
            widget_type="alert_list",
            title=title,
            data={"alerts": alerts},
            config={}
        )
    
    def add_status_widget(self, title: str, status: str, details: Dict = None) -> DashboardWidget:
        """添加状态组件"""
        return DashboardWidget(
            widget_type="status",
            title=title,
            data={"status": status, "details": details or {}},
            config={}
        )
    
    def generate_dashboard(
        self,
        metrics_summary: Dict,
        anomalies: List[Dict],
        alerts: List[Dict],
        system_status: str = "healthy"
    ) -> Dashboard:
        """生成完整仪表盘"""
        widgets = []
        
        # 系统状态
        widgets.append(self.add_status_widget("系统状态", system_status))
        
        # 关键指标
        if "queries" in metrics_summary:
            q = metrics_summary["queries"]
            widgets.append(self.add_metric_widget(
                "查询次数", "queries", q.get("sum", 0), "次/5min"
            ))
        
        if "error_rate" in metrics_summary:
            er = metrics_summary["error_rate"]
            widgets.append(self.add_metric_widget(
                "错误率", "error_rate", er.get("value", 0) * 100, "%"
            ))
        
        if "query_latency" in metrics_summary:
            lat = metrics_summary["query_latency"]
            widgets.append(self.add_metric_widget(
                "平均延迟", "latency", lat.get("avg", 0), "ms"
            ))
        
        # 异常列表
        if anomalies:
            widgets.append(self.add_alert_widget(
                f"活跃异常 ({len(anomalies)})",
                anomalies[:5]
            ))
        
        # 告警列表
        if alerts:
            alert_data = [
                {"level": a.get("level", "info"), "title": a.get("title", ""), "message": a.get("message", "")}
                for a in alerts[:5]
            ]
            widgets.append(self.add_alert_widget(
                f"最近告警 ({len(alerts)})",
                alert_data
            ))
        
        return Dashboard(
            name="Ariba故障排除助手监控",
            widgets=widgets,
            last_updated=datetime.now()
        )
    
    def generate_html(self, dashboard: Dashboard) -> str:
        """生成HTML仪表盘"""
        html_parts = [
            "<!DOCTYPE html>",
            "<html><head>",
            "<meta charset='utf-8'>",
            "<title>Ariba故障排除助手 - 监控仪表盘</title>",
            "<style>",
            "body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }",
            ".dashboard { max-width: 1200px; margin: 0 auto; }",
            ".header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }",
            ".widgets { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }",
            ".widget { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }",
            ".widget-title { font-size: 14px; color: #666; margin-bottom: 10px; }",
            ".metric-value { font-size: 36px; font-weight: bold; color: #2c3e50; }",
            ".metric-unit { font-size: 14px; color: #999; }",
            ".status { display: inline-block; padding: 4px 12px; border-radius: 4px; }",
            ".status-healthy { background: #27ae60; color: white; }",
            ".status-warning { background: #f39c12; color: white; }",
            ".status-error { background: #e74c3c; color: white; }",
            ".alert { padding: 10px; margin: 5px 0; border-radius: 4px; background: #ecf0f1; }",
            ".alert-error { background: #fadbd8; }",
            ".alert-warning { background: #fdebd0; }",
            ".alert-info { background: #d6eaf8; }",
            "</style></head><body>",
            "<div class='dashboard'>",
            "<div class='header'>",
            f"<h1>Ariba故障排除助手监控</h1>",
            f"<p>最后更新: {dashboard.last_updated.strftime('%Y-%m-%d %H:%M:%S')}</p>",
            "</div>",
            "<div class='widgets'>"
        ]
        
        for widget in dashboard.widgets:
            html_parts.append(f"<div class='widget'>")
            html_parts.append(f"<div class='widget-title'>{widget.title}</div>")
            
            if widget.widget_type == "metric":
                value = widget.data.get("value", 0)
                unit = widget.data.get("unit", "")
                trend = widget.data.get("trend", "stable")
                html_parts.append(f"<div class='metric-value'>{value:.1f}</div>")
                html_parts.append(f"<div class='metric-unit'>{unit} ({trend})</div>")
            
            elif widget.widget_type == "status":
                status = widget.data.get("status", "unknown")
                status_class = f"status-{status}"
                html_parts.append(f"<span class='status {status_class}'>{status.upper()}</span>")
            
            elif widget.widget_type == "alert_list":
                for alert in widget.data.get("alerts", []):
                    level = alert.get("level", "info")
                    html_parts.append(f"<div class='alert alert-{level}'>")
                    html_parts.append(f"<strong>{alert.get('title', '')}</strong><br>")
                    html_parts.append(f"{alert.get('message', '')}")
                    html_parts.append("</div>")
            
            html_parts.append("</div>")
        
        html_parts.extend([
            "</div></div></body></html>"
        ])
        
        return "\n".join(html_parts)


# 全局实例
dashboard_generator = DashboardGenerator()


__all__ = ["DashboardGenerator", "dashboard_generator", "Dashboard", "DashboardWidget"]
