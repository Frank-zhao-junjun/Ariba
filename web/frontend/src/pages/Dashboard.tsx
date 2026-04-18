/**
 * 仪表盘页面
 * 系统概览和快速入口
 */
import { useQuery } from '@tanstack/react-query'
import { Row, Col, Card, Statistic, List, Tag, Progress, Alert, Spin, Button, Space } from 'antd'
import {
  BookOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  BellOutlined,
  ClockCircleOutlined,
  RightOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/api'
import type { DashboardStats } from '@/types'
import { ContentLoading } from '@/components/common'

export default function Dashboard() {
  const { data: statsData, isLoading, refetch } = useQuery<{ data: DashboardStats }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats() as any,
    refetchInterval: 300000, // 5分钟刷新一次
  })

  const stats = statsData?.data

  if (isLoading) {
    return <ContentLoading height={400} />
  }

  // 版本分布图表配置
  const versionChartOption = {
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
    series: [
      {
        name: '知识分布',
        type: 'pie',
        radius: ['45%', '75%'],
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
        data: stats?.version_distribution
          ? Object.entries(stats.version_distribution).map(([name, value]) => ({
              name: `V${name}`,
              value,
            }))
          : [],
        color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },
    ],
  }

  // 健康度仪表盘配置
  const healthChartOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '90%',
        center: ['50%', '55%'],
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [0.3, '#67bcfa'],
              [0.7, '#b37feb'],
              [1, '#ff7875'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: '#1890ff',
          },
        },
        axisTick: {
          length: 8,
          lineStyle: { color: 'auto', width: 2 },
        },
        splitLine: {
          length: 20,
          lineStyle: { color: 'auto', width: 5 },
        },
        axisLabel: {
          color: '#8c8c8c',
          fontSize: 12,
          distance: -60,
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 14,
          color: '#8c8c8c',
        },
        detail: {
          fontSize: 32,
          fontWeight: 'bold',
          offsetCenter: [0, '-35%'],
          valueAnimation: true,
          formatter: '{value}%',
          color: '#262626',
        },
        data: [{ value: stats?.system_health || 0, name: '系统健康' }],
      },
    ],
  }

  // 快捷入口配置
  const quickActions = [
    {
      icon: <ThunderboltOutlined />,
      title: '快速查询',
      description: '搜索故障解决方案',
      path: '/troubleshooting',
      color: '#1890ff',
      bgColor: '#e6f7ff',
    },
    {
      icon: <ToolOutlined />,
      title: '生成清单',
      description: '创建实施检查清单',
      path: '/projects/new',
      color: '#52c41a',
      bgColor: '#f6ffed',
    },
    {
      icon: <CheckCircleOutlined />,
      title: '查看统计',
      description: '分析实施数据',
      path: '/statistics',
      color: '#faad14',
      bgColor: '#fffbe6',
    },
  ]

  // 最近的清单
  const recentChecklists = [
    { name: '采购流程优化项目', progress: 75, date: '2小时前' },
    { name: '供应商管理实施', progress: 45, date: '1天前' },
    { name: '合同管理模块', progress: 90, date: '2天前' },
  ]

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">仪表盘</h1>
          <p className="page-subtitle">欢迎回来！这里是您的系统概览和快速入口</p>
        </div>
        <Button icon={<ClockCircleOutlined />} onClick={() => refetch()}>
          刷新数据
        </Button>
      </div>

      {/* 告警提示 */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <Alert
          message="系统提示"
          type="warning"
          showIcon
          icon={<BellOutlined />}
          description={
            <List
              size="small"
              dataSource={stats.alerts}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
          closable
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            icon: <BookOutlined />,
            title: '知识库条目',
            value: stats?.total_knowledge || 0,
            suffix: '条',
            color: '#1890ff',
            bgColor: '#e6f7ff',
            trend: '+12%',
            trendUp: true,
          },
          {
            icon: <ProjectOutlined />,
            title: '实施项目',
            value: stats?.total_projects || 0,
            suffix: '个',
            color: '#52c41a',
            bgColor: '#f6ffed',
            trend: '+3',
            trendUp: true,
          },
          {
            icon: <CheckCircleOutlined />,
            title: '已完成任务',
            value: stats?.completed_tasks || 0,
            suffix: '项',
            color: '#722ed1',
            bgColor: '#f9f0ff',
            trend: '+28',
            trendUp: true,
          },
          {
            icon: <HeartOutlined />,
            title: '用户满意度',
            value: stats?.satisfaction || 0,
            suffix: '%',
            color: '#eb2f96',
            bgColor: '#fff0f3',
            trend: '+5%',
            trendUp: true,
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
                  style={{ background: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-title">{stat.title}</div>
                  <div className="stat-card-value">
                    {stat.value}
                    <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 400 }}>
                      {stat.suffix}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {stat.trendUp && (
                      <ArrowUpOutlined style={{ fontSize: 10, color: '#52c41a' }} />
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

      {/* 快捷入口 */}
      <Card
        title={
          <span style={{ fontWeight: 600 }}>
            <ThunderboltOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            快捷入口
          </span>
        }
        style={{ marginBottom: 24, borderRadius: 12 }}
        className="fade-in-up delay-100"
      >
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={8} key={index}>
              <Link to={action.path}>
                <Card
                  hoverable
                  className="hover-lift"
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${action.color}20`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: action.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        color: action.color,
                        transition: 'transform 0.3s',
                      }}
                    >
                      {action.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#262626', marginBottom: 4 }}>
                        {action.title}
                      </div>
                      <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                        {action.description}
                      </div>
                    </div>
                    <RightOutlined style={{ color: '#d9d9d9' }} />
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 知识分布 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                知识库分布
              </span>
            }
            extra={<Link to="/knowledge-graph">查看全部</Link>}
            style={{ borderRadius: 12 }}
            className="fade-in-up delay-200"
          >
            <ReactECharts option={versionChartOption} style={{ height: 300 }} />
          </Card>
        </Col>

        {/* 系统健康度 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <HeartOutlined style={{ marginRight: 8, color: '#eb2f96' }} />
                系统健康度
              </span>
            }
            style={{ borderRadius: 12 }}
            className="fade-in-up delay-300"
          >
            <ReactECharts option={healthChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 最近清单 */}
      <Card
        title={
          <span style={{ fontWeight: 600 }}>
            <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            最近清单
          </span>
        }
        extra={<Link to="/checklist">查看全部</Link>}
        style={{ borderRadius: 12 }}
        className="fade-in-up delay-400"
      >
        <List
          itemLayout="horizontal"
          dataSource={recentChecklists}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Tag color="green" key="status">
                  {item.progress === 100 ? '已完成' : '进行中'}
                </Tag>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: '#e6f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1890ff',
                    }}
                  >
                    {index + 1}
                  </div>
                }
                title={<a href="#">{item.name}</a>}
                description={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Progress
                      percent={item.progress}
                      size="small"
                      style={{ width: 200 }}
                      strokeColor="#52c41a"
                    />
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.date}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
