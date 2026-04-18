/**
 * 清单管理页面
 * 实施检查清单的创建、查看和管理
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card, Table, Tag, Button, Progress, Drawer, List,
  Checkbox, Modal, Select, Row, Col, Space, Skeleton, Empty
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, FileTextOutlined, TeamOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { checklistApi } from '@/api'
import type { Project, ChecklistItem, Phase } from '@/types'
import { QuickEmpty, ContentLoading } from '@/components/common'

export default function Checklist() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  // 项目列表查询
  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => checklistApi.listProjects() as any,
    enabled: !projectId,
  })

  // 项目详情查询
  const { data: projectDetailData, isLoading: detailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: () => checklistApi.getProject(projectId!) as any,
    enabled: !!projectId,
  })

  // 更新清单项
  const updateItemMutation = useMutation({
    mutationFn: ({ projectId, itemId, data }: any) =>
      checklistApi.updateItem(projectId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] })
    },
  })

  const projects = projectsData?.data || []
  const projectDetail = projectDetailData?.data

  const handleStatusChange = (itemId: string, checked: boolean) => {
    updateItemMutation.mutate({
      projectId,
      itemId,
      data: { status: checked ? 'completed' : 'pending' },
    })
  }

  // 项目列表表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a
          onClick={() => navigate(`/checklist/${record.id}`)}
          style={{ fontWeight: 500 }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (v) => <Tag color="blue" style={{ borderRadius: 4 }}>V{v}</Tag>,
    },
    {
      title: '进度',
      key: 'progress',
      render: (_, record) => (
        <div style={{ minWidth: 150 }}>
          <Progress
            percent={Math.round(record.completion_rate * 100)}
            size="small"
            format={(p) => `${record.completed_items}/${record.total_items}`}
            strokeColor={{
              '0%': '#1890ff',
              '100%': '#52c41a',
            }}
          />
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          active: { color: 'processing', text: '进行中', icon: <ClockCircleOutlined /> },
          completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
          paused: { color: 'warning', text: '已暂停', icon: <ExclamationCircleOutlined /> },
        }
        const config = map[s] || map.active
        return (
          <Tag color={config.color} icon={config.icon} style={{ borderRadius: 12 }}>
            {config.text}
          </Tag>
        )
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (d) => d ? (
        <span style={{ color: '#8c8c8c' }}>{new Date(d).toLocaleDateString()}</span>
      ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/checklist/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedProject(record)
              setDetailDrawerVisible(true)
            }}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  // 清单项渲染
  const renderChecklistItems = (items: ChecklistItem[]) => {
    if (detailLoading) {
      return (
        <div style={{ padding: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 1 }} style={{ marginBottom: 16 }} />
          ))}
        </div>
      )
    }

    return items.map((item, index) => (
      <List.Item
        key={item.id}
        className="fade-in-up"
        style={{
          animationDelay: `${index * 30}ms`,
          padding: '16px 20px',
          borderRadius: 8,
          marginBottom: 8,
          transition: 'all 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, width: '100%' }}>
          <Checkbox
            checked={item.status === 'completed'}
            onChange={(e) => handleStatusChange(item.id, e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontWeight: 500,
                textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                color: item.status === 'completed' ? '#8c8c8c' : '#262626',
              }}>
                {item.title}
              </span>
              <Tag
                color={item.status === 'completed' ? 'success' : 'default'}
                style={{ borderRadius: 12 }}
              >
                {item.status === 'completed' ? '已完成' : '待完成'}
              </Tag>
            </div>
            {item.description && (
              <p style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 8 }}>
                {item.description}
              </p>
            )}
            {item.responsible && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8c8c8c' }}>
                <TeamOutlined />
                <span>{item.responsible}</span>
              </div>
            )}
          </div>
        </div>
      </List.Item>
    ))
  }

  // 项目列表视图
  if (!projectId) {
    return (
      <div className="page-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">实施检查清单</h1>
            <p className="page-subtitle">管理和跟踪您的SAP Ariba实施项目</p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchProjects()}
              loading={projectsLoading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/projects/new')}
            >
              新建项目
            </Button>
          </Space>
        </div>

        {projectsLoading ? (
          <ContentLoading height={400} />
        ) : projects.length > 0 ? (
          <Card style={{ borderRadius: 12 }}>
            <Table
              columns={columns}
              dataSource={projects}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个项目`,
              }}
              className="fade-in"
            />
          </Card>
        ) : (
          <Card style={{ borderRadius: 12 }}>
            <QuickEmpty
              type="list"
              title="暂无项目"
              description="创建您的第一个SAP Ariba实施检查清单"
              action={{
                text: '新建项目',
                onClick: () => navigate('/projects/new'),
              }}
            />
          </Card>
        )}
      </div>
    )
  }

  // 项目详情视图
  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{projectDetail?.name || '项目详情'}</h1>
          <p className="page-subtitle">
            <Space>
              <Tag color="blue">V{projectDetail?.version}</Tag>
              <span style={{ color: '#8c8c8c' }}>
                {projectDetail?.phases?.length || 0} 个阶段
              </span>
              <span style={{ color: '#8c8c8c' }}>
                {projectDetail?.total_items || 0} 个检查项
              </span>
            </Space>
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchDetail()}
            loading={detailLoading}
          >
            刷新
          </Button>
          <Button onClick={() => navigate('/checklist')}>
            返回列表
          </Button>
        </Space>
      </div>

      {/* 项目进度概览 */}
      {projectDetail && (
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={24}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#1890ff' }}>
                  {Math.round(projectDetail.completion_rate * 100)}%
                </div>
                <div style={{ color: '#8c8c8c' }}>完成进度</div>
                <Progress
                  percent={Math.round(projectDetail.completion_rate * 100)}
                  showInfo={false}
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                  style={{ marginTop: 12 }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#52c41a' }}>
                  {projectDetail.completed_items || 0}
                </div>
                <div style={{ color: '#8c8c8c' }}>已完成</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: '#faad14' }}>
                  {(projectDetail.total_items || 0) - (projectDetail.completed_items || 0)}
                </div>
                <div style={{ color: '#8c8c8c' }}>待完成</div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* 阶段清单 */}
      {detailLoading ? (
        <ContentLoading height={400} />
      ) : (
        projectDetail?.phases?.map((phase: Phase, index: number) => (
          <Card
            key={phase.id}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span>{phase.name}</span>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {phase.items?.length || 0} 项
                </Tag>
              </div>
            }
            style={{ marginBottom: 16, borderRadius: 12 }}
            className="fade-in-up"
          >
            {renderChecklistItems(phase.items || [])}
          </Card>
        ))
      )}

      {/* 编辑项目抽屉 */}
      <Drawer
        title="编辑项目"
        placement="right"
        width={400}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedProject && (
          <div>
            <p>编辑功能开发中...</p>
          </div>
        )}
      </Drawer>
    </div>
  )
}
