import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Select, Tag, Button, Spin, Drawer, Descriptions, Empty } from 'antd'
import { ReloadOutlined, ZoomInOutlined, ZoomOutOutlined, FullscreenOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { graphApi } from '@/api'
import type { GraphNode, GraphEdge, KnowledgeGraph } from '@/types'

const { Option } = Select

// 节点颜色映射
const nodeColors: Record<string, string> = {
  error: '#ff4d4f',
  cause: '#faad14',
  solution: '#52c41a',
  module: '#1890ff',
}

const nodeLabels: Record<string, string> = {
  error: '错误',
  cause: '原因',
  solution: '解决方案',
  module: '模块',
}

export default function KnowledgeGraph() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts>()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [version, setVersion] = useState('')

  const { data: graphData, isLoading } = useQuery<{ data: KnowledgeGraph }>({
    queryKey: ['knowledge-graph', version],
    queryFn: () => graphApi.getKnowledgeGraph(version) as any,
  })

  useEffect(() => {
    if (!chartRef.current || !graphData?.data) return

    const chart = echarts.init(chartRef.current)
    chartInstance.current = chart

    const graph = graphData.data

    // 转换为ECharts需要的格式
    const nodes = graph.nodes.map(node => ({
      id: node.id,
      name: node.label,
      category: node.type,
      value: node.properties?.count || 1,
      itemStyle: { color: nodeColors[node.type] || '#8c8c8c' },
      symbolSize: node.type === 'error' ? 50 : node.type === 'solution' ? 40 : 30,
    }))

    const edges = graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      lineStyle: { color: '#d9d9d9', width: 1, curveness: 0.2 },
    }))

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `<b>${params.data.name}</b><br/>类型: ${nodeLabels[params.data.category] || params.data.category}`
          }
          return `关系: ${params.data.source} → ${params.data.target}`
        },
      },
      legend: [{
        data: Object.keys(nodeColors).map(k => ({ name: nodeLabels[k] || k, icon: 'circle' })),
        bottom: 10,
        textStyle: { fontSize: 12 },
      }],
      animation: true,
      series: [{
        type: 'graph',
        layout: 'force',
        force: {
          repulsion: 200,
          edgeLength: 100,
          layoutAnimation: true,
        },
        roam: true,
        draggable: true,
        label: { show: true, position: 'right', formatter: '{b}', fontSize: 12 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
        categories: Object.keys(nodeColors).map(k => ({ name: nodeLabels[k] || k })),
        data: nodes,
        links: edges,
        lineStyle: { curveness: 0.2 },
      }],
    }

    chart.setOption(option)

    // 点击事件
    chart.on('click', (params: any) => {
      if (params.dataType === 'node') {
        const node = graph.nodes.find(n => n.id === params.data.id)
        if (node) {
          setSelectedNode(node)
          setDrawerVisible(true)
        }
      }
    })

    // 响应式
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [graphData])

  const handleZoom = (type: 'in' | 'out') => {
    if (chartInstance.current) {
      const action = type === 'in' ? 'dataZoom' : 'dataZoom'
      chartInstance.current.dispatchAction({ type, ratio: type === 'in' ? 1.2 : 0.8 })
    }
  }

  const handleFullscreen = () => {
    if (chartRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        chartRef.current.requestFullscreen()
      }
    }
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">知识图谱</h1>
        <p className="page-subtitle">故障知识关联可视化分析</p>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ marginRight: 8 }}>版本筛选:</span>
            <Select placeholder="选择版本" style={{ width: 150 }} value={version} onChange={setVersion} allowClear>
              <Option value="2602">V26.02</Option>
              <Option value="2604">V26.04</Option>
              <Option value="2605">V26.05</Option>
            </Select>
          </div>
          <div>
            <Button icon={<ZoomOutOutlined />} onClick={() => handleZoom('out')} style={{ marginRight: 8 }} />
            <Button icon={<ZoomInOutlined />} onClick={() => handleZoom('in')} style={{ marginRight: 8 }} />
            <Button icon={<FullscreenOutlined />} onClick={handleFullscreen} />
          </div>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          {Object.entries(nodeColors).map(([type, color]) => (
            <Col key={type} span={6}>
              <Tag color={color}>{nodeLabels[type] || type}</Tag>
            </Col>
          ))}
        </Row>

        <div ref={chartRef} style={{ height: 500, width: '100%', background: '#fafafa', borderRadius: 8 }}>
          {(!graphData?.data?.nodes || graphData.data.nodes.length === 0) && (
            <Empty description="暂无图谱数据" style={{ paddingTop: 200 }} />
          )}
        </div>
      </Card>

      <Drawer title="节点详情" placement="right" width={400} open={drawerVisible} onClose={() => setDrawerVisible(false)}>
        {selectedNode && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="名称">{selectedNode.label}</Descriptions.Item>
            <Descriptions.Item label="类型">{nodeLabels[selectedNode.type] || selectedNode.type}</Descriptions.Item>
            {selectedNode.properties && Object.entries(selectedNode.properties).map(([k, v]) => (
              <Descriptions.Item key={k} label={k}>{String(v)}</Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
