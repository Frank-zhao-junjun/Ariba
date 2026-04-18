/**
 * 统计分析页面
 * 项目完成情况和趋势分析
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Statistic, Table, Progress, Tag, Button, Space } from 'antd'
import {
  ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, AlertOutlined,
  ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { checklistApi } from '@/api'
import { ContentLoading, ChartSkeleton } from '@/components/common'

export default function Statistics() {
  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['checklist-stats'],
    queryFn: () => checklistApi.getStats() as any,
    refetchInterval: 300000,
  })

  const stats = statsData?.data

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">统计分析</h1>
          <p className="page-subtitle">项目完成情况和趋势分析</p>
        </div>
        <ContentLoading height={400} />
      </div>
    )
  }

  // 项目完成率饼图
  const completionPieOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#f0f0f0',
      textStyle: { color: '#262626' },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#8c8c8c', fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3,
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        color: '#8c8c8c',
        fontSize: 12,
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 15,
        lineStyle: { color: '#d9d9d9' },
      },
      data: [
        { value: stats?.completed_projects || 0, name: '已完成', itemStyle: { color: '#52c41a' } },
        { value: (stats?.active_projects || 0) - (stats?.overdue_projects || 0), name: '进行中', itemStyle: { color: '#1890ff' } },
        { value: stats?.overdue_projects || 0, name: '已逾期', itemStyle: { color: '#ff4d4f' } },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
        },
      },
    }],
  }

  // 模块完成率柱状图
  const moduleBarOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#f0f0f0',
      textStyle: { color: '#262626' },
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#8c8c8c', fontSize: 12 },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: stats?.module_stats?.map((m: any) => m.module_name) || [],
      axisLabel: { color: '#8c8c8c', fontSize: 12 },
      axisLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    series: [{
      name: '完成率',
      type: 'bar',
      data: stats?.module_stats?.map((m: any) => ({
        value: Math.round(m.completion_rate * 100),
        itemStyle: {
          color: m.completion_rate >= 0.8 ? '#52c41a' : m.completion_rate >= 0.5 ? '#faad14' : '#ff4d4f',
          borderRadius: [4, 4, 0, 0],
        }
      })) || [],
      barWidth: '40%',
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      animationDelay: (idx: number) => idx * 100,
    }],
  }

  // 完成率趋势图
  const trendLineOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#f0f0f0',
      textStyle: { color: '#262626' },
    },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'],
      axisLabel: { color: '#8c8c8c' },
      axisLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    series: [{
      name: '完成率',
      type: 'line',
      smooth: true,
      data: [10, 25, 35, 50, 65, 80],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0)' }
          ],
        }
      },
      lineStyle: { color: '#1890ff', width: 3 },
      itemStyle: { color: '#1890ff' },
      animationDuration: 2000,
      animationEasing: 'cubicOut',
    }],
  }

  const moduleColumns = [
    {
      title: '模块',
      dataIndex: 'module_name',
      key: 'module_name',
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: '总项数',
      dataIndex: 'total_items',
      key: 'total_items',
      align: 'center' as const,
    },
    {
      title: '已完成',
      dataIndex: 'completed_items',
      key: 'completed_items',
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>{val}</span>
      ),
    },
    {
      title: '完成率',
      key: 'rate',
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Progress
          percent={Math.round(r.completion_rate * 100)}
          size="small"
          strokeColor={{
            '0%': '#1890ff',
            '100%': '#52c41a',
          }}
        />
      ),
    },
    {
      title: '状态',
      key: 'status',
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Tag
          color={r.completion_rate >= 0.8 ? 'success' : r.completion_rate >= 0.5 ? 'warning' : 'error'}
          style={{ borderRadius: 12 }}
        >
          {r.completion_rate >= 0.8 ? '优秀' : r.completion_rate >= 0.5 ? '进行中' : '需关注'}
        </Tag>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">统计分析</h1>
          <p className="page-subtitle">项目完成情况和趋势分析</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          刷新数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: '总项目数',
            value: stats?.total_projects || 0,
            prefix: <ProjectOutlined />,
            color: '#1890ff',
            trend: '+3',
            trendUp: true,
          },
          {
            title: '进行中',
            value: stats?.active_projects || 0,
            prefix: <ClockCircleOutlined />,
            color: '#722ed1',
            trend: '+1',
            trendUp: true,
          },
          {
            title: '已完成',
            value: stats?.completed_projects || 0,
            prefix: <CheckCircleOutlined />,
            color: '#52c41a',
            trend: '+2',
            trendUp: true,
          },
          {
            title: '已逾期',
            value: stats?.overdue_projects || 0,
            prefix: <AlertOutlined />,
            color: '#ff4d4f',
            trend: '-1',
            trendUp: false,
          },
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className="stat-card fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="stat-card-with-icon">
                <div
                  className="stat-card-icon"
                  style={{
                    background: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  {stat.prefix}
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-title">{stat.title}</div>
                  <div className="stat-card-value">{stat.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {stat.trendUp ? (
                      <ArrowUpOutlined style={{ fontSize: 10, color: '#52c41a' }} />
                    ) : (
                      <ArrowDownOutlined style={{ fontSize: 10, color: '#ff4d4f' }} />
                    )}
                    <span style={{ fontSize: 12, color: stat.trendUp ? '#52c41a' : '#ff4d4f' }}>
                      {stat.trend}
                    </span>
                    <span style={{ fontSize: 12, color: '#bfbfbf' }}>较上月</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 项目完成率 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                项目完成率
              </span>
            }
            style={{ borderRadius: 12, height: '100%' }}
            className="fade-in-up delay-100"
          >
            <ReactECharts option={completionPieOption} style={{ height: 280 }} />
          </Card>
        </Col>

        {/* 模块完成率 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <ProjectOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                各模块完成率
              </span>
            }
            style={{ borderRadius: 12, height: '100%' }}
            className="fade-in-up delay-200"
          >
            <ReactECharts option={moduleBarOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      {/* 趋势分析 */}
      <Card
        title={
          <span style={{ fontWeight: 600 }}>
            <ClockCircleOutlined style={{ marginRight: 8, color: '#722ed1' }} />
            完成率趋势
          </span>
        }
        style={{ marginBottom: 24, borderRadius: 12 }}
        className="fade-in-up delay-300"
      >
        <ReactECharts option={trendLineOption} style={{ height: 300 }} />
      </Card>

      {/* 模块详情表格 */}
      <Card
        title={
          <span style={{ fontWeight: 600 }}>
            <ProjectOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            模块详情
          </span>
        }
        style={{ borderRadius: 12 }}
        className="fade-in-up delay-400"
      >
        <Table
          columns={moduleColumns}
          dataSource={stats?.module_stats || []}
          rowKey="module_name"
          pagination={false}
          className="fade-in"
        />
      </Card>
    </div>
  )
}
