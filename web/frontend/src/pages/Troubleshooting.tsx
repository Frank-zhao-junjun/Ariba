/**
 * 故障排除助手页面
 * 快速查询SAP Ariba常见问题解决方案
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card, Input, Button, Tag, List, Drawer, Rate, Select,
  Row, Col, Empty, Tabs, Badge, Space, Skeleton
} from 'antd'
import {
  SearchOutlined, FilterOutlined, CloseCircleOutlined,
  CheckCircleOutlined, MessageOutlined, BookOutlined,
  ThunderboltOutlined, ClockCircleOutlined, LoadingOutlined
} from '@ant-design/icons'
import { troubleshootingApi } from '@/api'
import type { KnowledgeItem, Module, Version } from '@/types'
import { SearchEmpty, QuickEmpty } from '@/components/common'

const { Search } = Input
const { Option } = Select

export default function Troubleshooting() {
  const [query, setQuery] = useState('')
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const queryClient = useQueryClient()

  // 模块列表查询
  const { data: modulesData, isLoading: modulesLoading } = useQuery<{ data: Module[] }>({
    queryKey: ['modules'],
    queryFn: () => troubleshootingApi.getModules() as any,
  })

  // 版本列表查询
  const { data: versionsData, isLoading: versionsLoading } = useQuery<{ data: Version[] }>({
    queryKey: ['versions'],
    queryFn: () => troubleshootingApi.getVersions() as any,
  })

  // 搜索突变
  const searchMutation = useMutation({
    mutationFn: (params: any) => troubleshootingApi.query(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-results'] })
    },
  })

  const handleSearch = (value: string) => {
    if (!value.trim()) return
    setQuery(value)
    setHasSearched(true)
    searchMutation.mutate({
      query: value,
      version_tags: selectedVersions,
      modules: selectedModules,
      limit: 10,
    })
  }

  const handleFeedback = async (itemId: string, helpful: boolean) => {
    await troubleshootingApi.submitFeedback({
      item_id: itemId,
      query: query,
      helpful,
      comment: '',
    })
  }

  const showDetail = async (item: KnowledgeItem) => {
    const res = await troubleshootingApi.getKnowledge(item.id) as any
    setSelectedItem(res.data)
    setDrawerVisible(true)
  }

  const searchResults = searchMutation.data?.data as KnowledgeItem[] || []
  const isInitialLoading = modulesLoading || versionsLoading

  return (
    <div className="page-container">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title">故障排除助手</h1>
        <p className="page-subtitle">快速查询SAP Ariba常见问题解决方案</p>
      </div>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col flex="auto">
            <Search
              placeholder="输入问题关键词，如：登录失败、审批超时..."
              enterButton={
                <Button type="primary" icon={<SearchOutlined />}>
                  查询
                </Button>
              }
              size="large"
              loading={searchMutation.isPending}
              onSearch={handleSearch}
              allowClear
            />
          </Col>
        </Row>
        
        {/* 筛选区域 */}
        <div style={{ marginTop: 16 }}>
          <FilterOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
          <span style={{ marginRight: 16, color: '#8c8c8c' }}>版本筛选:</span>
          {versionsLoading ? (
            <Skeleton.Input active style={{ width: 300, height: 32 }} />
          ) : (
            <Select
              mode="multiple"
              placeholder="选择版本"
              style={{ width: 300, marginRight: 24 }}
              value={selectedVersions}
              onChange={setSelectedVersions}
              allowClear
              loading={versionsLoading}
            >
              {versionsData?.data?.map((v) => (
                <Option key={v.id} value={v.id}>V{v.name.replace('V', '')}</Option>
              ))}
            </Select>
          )}
          
          <span style={{ marginRight: 16, color: '#8c8c8c' }}>模块筛选:</span>
          {modulesLoading ? (
            <Skeleton.Input active style={{ width: 300, height: 32 }} />
          ) : (
            <Select
              mode="multiple"
              placeholder="选择模块"
              style={{ width: 300 }}
              value={selectedModules}
              onChange={setSelectedModules}
              allowClear
              loading={modulesLoading}
            >
              {modulesData?.data?.map((m) => (
                <Option key={m.id} value={m.id}>{m.name}</Option>
              ))}
            </Select>
          )}
        </div>
      </Card>

      {/* 结果区域 */}
      {searchMutation.isPending ? (
        // 加载状态
        <Card>
          <div style={{ padding: 24 }}>
            {/* 搜索进度指示 */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <LoadingOutlined style={{ fontSize: 36, color: '#1890ff', marginBottom: 16 }} />
              <div
                style={{
                  width: '100%',
                  height: 4,
                  background: '#f0f0f0',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 16,
                  maxWidth: 400,
                  margin: '16px auto',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #1890ff, #69c0ff, #1890ff)',
                    backgroundSize: '200% 100%',
                    animation: 'gradient-moving 1.5s linear infinite',
                    borderRadius: 2,
                  }}
                />
              </div>
              <p style={{ color: '#8c8c8c', marginTop: 12 }}>
                正在智能检索解决方案...
              </p>
            </div>

            {/* 骨架屏结果 */}
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  animation: `fadeIn 0.3s ease-out ${i * 0.1}s both`,
                }}
              >
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        </Card>
      ) : searchResults.length > 0 ? (
        // 搜索结果列表
        <List
          dataSource={searchResults}
          renderItem={(item, index) => (
            <List.Item
              className="fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`,
                padding: '16px 24px',
                borderRadius: 12,
                marginBottom: 8,
                transition: 'all 0.3s',
              }}
              actions={[
                <Button
                  key="helpful"
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleFeedback(item.id, true)}
                  style={{ color: '#52c41a' }}
                >
                  有帮助
                </Button>,
                <Button
                  key="not-helpful"
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleFeedback(item.id, false)}
                  style={{ color: '#8c8c8c' }}
                >
                  不够详细
                </Button>,
                <Button
                  key="detail"
                  type="link"
                  icon={<BookOutlined />}
                  onClick={() => showDetail(item)}
                >
                  详情
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: index === 0 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : index === 1 
                        ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                        : '#8c8c8c',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 18,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}>
                    {index + 1}
                  </div>
                }
                title={
                  <a onClick={() => showDetail(item)} style={{ fontSize: 16, fontWeight: 500 }}>
                    {item.title}
                    <Badge
                      status={index === 0 ? 'success' : index === 1 ? 'processing' : 'default'}
                      text={
                        <span style={{ marginLeft: 8 }}>
                          {index === 0 ? '最佳匹配' : index === 1 ? '高匹配' : `匹配度 ${Math.round((item.score || 0) * 100)}%`}
                        </span>
                      }
                    />
                  </a>
                }
                description={
                  <div>
                    <p style={{ marginBottom: 8, color: '#8c8c8c' }}>{item.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {item.versions.map((v) => (
                        <Tag key={v} color="blue" style={{ borderRadius: 4 }}>V{v}</Tag>
                      ))}
                      <Tag color="purple" style={{ borderRadius: 4 }}>{item.module}</Tag>
                      {item.tags.slice(0, 3).map((t) => (
                        <Tag key={t} style={{ borderRadius: 4 }}>{t}</Tag>
                      ))}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : hasSearched ? (
        // 搜索无结果
        <SearchEmpty keyword={query} onClear={() => {
          setHasSearched(false)
          setQuery('')
        }} />
      ) : (
        // 初始提示
        <Card style={{ borderRadius: 12 }}>
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              animation: 'fadeIn 0.5s ease-out',
            }}
          >
            <div
              style={{
                fontSize: 80,
                marginBottom: 24,
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#262626',
                marginBottom: 8,
              }}
            >
              输入问题开始查询
            </h3>
            <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
              快速获取SAP Ariba常见问题的解决方案
            </p>
            <Space size={16} wrap>
              <Button.Group>
                {['登录异常', '审批超时', '寻源流程', '合同签署'].map((keyword) => (
                  <Button
                    key={keyword}
                    onClick={() => handleSearch(keyword)}
                    style={{ borderRadius: 20 }}
                  >
                    {keyword}
                  </Button>
                ))}
              </Button.Group>
            </Space>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: 20, color: '#52c41a', marginBottom: 4 }} />
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>快速响应</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <BookOutlined style={{ fontSize: 20, color: '#1890ff', marginBottom: 4 }} />
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>海量知识库</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 20, color: '#722ed1', marginBottom: 4 }} />
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>专业解答</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 详情抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOutlined style={{ color: '#1890ff' }} />
            <span>{selectedItem?.title}</span>
          </div>
        }
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedItem && (
          <Tabs
            items={[
              {
                key: 'solution',
                label: '解决方案',
                children: (
                  <div className="fade-in">
                    <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
                      <h4 style={{ marginBottom: 8 }}>问题描述</h4>
                      <p style={{ color: '#8c8c8c' }}>{selectedItem.description}</p>
                    </Card>
                    
                    <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
                      <h4 style={{ marginBottom: 8 }}>解决方案</h4>
                      <pre style={{
                        background: '#f5f5f5',
                        padding: 16,
                        borderRadius: 8,
                        whiteSpace: 'pre-wrap',
                        marginBottom: 16,
                        fontSize: 14,
                        lineHeight: 1.8,
                      }}>
                        {selectedItem.solution}
                      </pre>
                    </Card>

                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ marginBottom: 8 }}>相关标签</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {selectedItem.versions.map((v) => (
                          <Tag color="blue" key={v}>V{v}</Tag>
                        ))}
                        <Tag color="purple">{selectedItem.module}</Tag>
                        {selectedItem.tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: 24 }}>
                      <h4 style={{ marginBottom: 12 }}>这个解答对您有帮助吗？</h4>
                      <Space>
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => {
                            handleFeedback(selectedItem.id, true)
                          }}
                        >
                          有帮助
                        </Button>
                        <Button
                          icon={<CloseCircleOutlined />}
                          onClick={() => {
                            handleFeedback(selectedItem.id, false)
                          }}
                        >
                          需要改进
                        </Button>
                      </Space>
                    </div>
                  </div>
                ),
              },
              {
                key: 'related',
                label: '相关内容',
                children: (
                  <div>
                    <p style={{ color: '#8c8c8c' }}>暂无相关内容</p>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* 动画样式 */}
      <style>{`
        @keyframes gradient-moving {
          0% { width: 0%; left: 0; }
          50% { width: 60%; left: 20%; }
          100% { width: 0%; left: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
