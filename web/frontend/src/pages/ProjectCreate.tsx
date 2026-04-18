/**
 * 新建项目页面
 * 创建SAP Ariba实施检查清单
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Card, Steps, Form, Input, Select, Checkbox, Button,
  Row, Col, Result, Space, Tag, Divider
} from 'antd'
import {
  UserOutlined, BankOutlined, AppstoreOutlined,
  SettingOutlined, CheckOutlined, RocketOutlined,
  TeamOutlined, GlobalOutlined, ApiOutlined
} from '@ant-design/icons'
import { checklistApi } from '@/api'
import { useNotification } from '@/components/common'

const { Option } = Select

const modules = [
  { id: 'sourcing', name: '寻源管理', description: '供应商寻源、招标管理', icon: '🔍' },
  { id: 'contract', name: '合同管理', description: '合同创建、审批、签署', icon: '📝' },
  { id: 'buying', name: '采购到付款', description: '采购申请、订单、发票', icon: '🛒' },
  { id: 'supplier', name: '供应商管理', description: '供应商主数据、绩效', icon: '🏢' },
  { id: 'spending', name: '支出分析', description: '支出分析、报表', icon: '📊' },
]

const industries = [
  { value: 'manufacturing', label: '制造业' },
  { value: 'retail', label: '零售业' },
  { value: 'finance', label: '金融业' },
  { value: 'healthcare', label: '医疗健康' },
  { value: 'technology', label: '科技行业' },
  { value: 'energy', label: '能源行业' },
  { value: 'other', label: '其他' },
]

const companySizes = [
  { value: 'small', label: '小型企业 (< 500人)', icon: '👤' },
  { value: 'medium', label: '中型企业 (500-2000人)', icon: '👥' },
  { value: 'large', label: '大型企业 (2000-10000人)', icon: '🏢' },
  { value: 'enterprise', label: '超大型企业 (> 10000人)', icon: '🏛️' },
]

const integrationLevels = [
  { value: 'level_1', label: 'Level 1 - 独立部署', description: '仅使用核心功能，无系统集成', color: '#8c8c8c' },
  { value: 'level_2', label: 'Level 2 - 基础集成', description: '与ERP系统基本集成', color: '#1890ff' },
  { value: 'level_3', label: 'Level 3 - 中等集成', description: '与多个系统深度集成', color: '#722ed1' },
  { value: 'level_4', label: 'Level 4 - 深度集成', description: '全面集成，自动化流程', color: '#52c41a' },
]

const versions = [
  { value: '2602', label: 'V26.02 (2026年2月)', isNew: false },
  { value: '2604', label: 'V26.04 (2026年4月)', isNew: false },
  { value: '2605', label: 'V26.05 (2026年5月)', isNew: true },
  { value: '2610', label: 'V26.10 (2026年10月)', isNew: false },
]

export default function ProjectCreate() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    company_size: '',
    industry: '',
    existing_systems: [] as string[],
    integration_level: '',
    modules: [] as string[],
    version: '',
  })
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: any) => checklistApi.createProject(data),
    onSuccess: (res: any) => {
      showSuccess('项目创建成功', '正在跳转到项目详情...')
      setCreatedProjectId(res.data?.id || 'demo_project')
      setCurrentStep(4)
    },
    onError: () => {
      showError('项目创建失败', '请稍后重试')
    },
  })

  const steps = [
    { title: '项目信息', icon: <UserOutlined /> },
    { title: '企业信息', icon: <BankOutlined /> },
    { title: '模块选择', icon: <AppstoreOutlined /> },
    { title: '版本与确认', icon: <SettingOutlined /> },
    { title: '完成', icon: <CheckOutlined /> },
  ]

  const canNextStep = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0
      case 1:
        return formData.company_size && formData.industry
      case 2:
        return formData.modules.length > 0
      case 3:
        return formData.version && formData.integration_level
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canNextStep()) {
      if (currentStep === 3) {
        // 提交创建
        createMutation.mutate({
          name: formData.name,
          version: formData.version,
          modules: formData.modules,
          industry: formData.industry,
          company_size: formData.company_size,
          integration_level: formData.integration_level,
          existing_systems: formData.existing_systems,
        })
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                项目基本信息
              </span>
            }
            style={{ borderRadius: 12 }}
          >
            <Form layout="vertical">
              <Form.Item
                label="项目名称"
                required
                rules={[{ required: true, message: '请输入项目名称' }]}
                validateStatus={formData.name.trim().length > 0 ? 'success' : ''}
              >
                <Input
                  placeholder="例如：Ariba实施项目一期"
                  value={formData.name}
                  size="large"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  prefix={<RocketOutlined style={{ color: '#8c8c8c' }} />}
                />
              </Form.Item>
              <Form.Item label="项目描述（可选）">
                <Input.TextArea
                  rows={3}
                  placeholder="简要描述项目目标和范围"
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Form>
          </Card>
        )

      case 1:
        return (
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <BankOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                企业配置信息
              </span>
            }
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item label="企业规模" required>
                  <Select
                    placeholder="选择企业规模"
                    value={formData.company_size}
                    onChange={(v) => setFormData({ ...formData, company_size: v })}
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {companySizes.map((s) => (
                      <Option key={s.value} value={s.value}>
                        <Space>
                          <span>{s.icon}</span>
                          <span>{s.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="所属行业" required>
                  <Select
                    placeholder="选择行业"
                    value={formData.industry}
                    onChange={(v) => setFormData({ ...formData, industry: v })}
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {industries.map((i) => (
                      <Option key={i.value} value={i.value}>{i.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Form.Item label="现有系统集成（可选）">
              <Checkbox.Group
                value={formData.existing_systems}
                onChange={(v) => setFormData({ ...formData, existing_systems: v as string[] })}
              >
                <Space direction="vertical">
                  <Checkbox value="SAP S/4HANA">SAP S/4HANA</Checkbox>
                  <Checkbox value="Oracle ERP">Oracle ERP</Checkbox>
                  <Checkbox value="Microsoft Dynamics">Microsoft Dynamics</Checkbox>
                  <Checkbox value="其他ERP系统">其他ERP系统</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </Card>
        )

      case 2:
        return (
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <AppstoreOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                选择实施模块
              </span>
            }
            extra={<Tag color="blue">已选 {formData.modules.length} 个模块</Tag>}
            style={{ borderRadius: 12 }}
          >
            <Row gutter={[16, 16]}>
              {modules.map((m) => {
                const isSelected = formData.modules.includes(m.id)
                return (
                  <Col xs={24} sm={12} key={m.id}>
                    <Card
                      hoverable
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            modules: formData.modules.filter((id) => id !== m.id),
                          })
                        } else {
                          setFormData({
                            ...formData,
                            modules: [...formData.modules, m.id],
                          })
                        }
                      }}
                      style={{
                        borderRadius: 12,
                        border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        background: isSelected ? '#e6f7ff' : '#fff',
                        transition: 'all 0.3s',
                      }}
                      className={isSelected ? 'hover-lift' : ''}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: isSelected ? '#1890ff' : '#f5f5f5',
                            color: isSelected ? '#fff' : '#8c8c8c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            transition: 'all 0.3s',
                          }}
                        >
                          {m.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.name}</div>
                          <div style={{ fontSize: 13, color: '#8c8c8c' }}>{m.description}</div>
                        </div>
                        {isSelected && (
                          <CheckOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                        )}
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Card>
        )

      case 3:
        return (
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <SettingOutlined style={{ marginRight: 8, color: '#faad14' }} />
                版本与确认
              </span>
            }
            style={{ borderRadius: 12 }}
          >
            <Form.Item label="选择版本" required>
              <Select
                placeholder="选择Ariba版本"
                value={formData.version}
                onChange={(v) => setFormData({ ...formData, version: v })}
                size="large"
                style={{ width: '100%' }}
              >
                {versions.map((v) => (
                  <Option key={v.value} value={v.value}>
                    <Space>
                      <span>{v.label}</span>
                      {v.isNew && <Tag color="green" style={{ borderRadius: 12 }}>最新</Tag>}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item label="集成级别" required>
              <Row gutter={[16, 16]}>
                {integrationLevels.map((level) => {
                  const isSelected = formData.integration_level === level.value
                  return (
                    <Col xs={12} key={level.value}>
                      <Card
                        hoverable
                        onClick={() => setFormData({ ...formData, integration_level: level.value })}
                        style={{
                          borderRadius: 12,
                          border: isSelected ? `2px solid ${level.color}` : '1px solid #f0f0f0',
                          background: isSelected ? `${level.color}10` : '#fff',
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: level.color,
                              marginBottom: 8,
                            }}
                          >
                            {level.label}
                          </div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {level.description}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </Form.Item>
          </Card>
        )

      case 4:
        return (
          <Card style={{ borderRadius: 12 }}>
            <Result
              status="success"
              title="项目创建成功！"
              subTitle={`项目"${formData.name}"已成功创建，正在跳转到项目详情...`}
              extra={[
                <Button
                  type="primary"
                  key="view"
                  onClick={() => navigate(`/checklist/${createdProjectId}`)}
                  icon={<CheckOutlined />}
                >
                  查看项目
                </Button>,
                <Button key="back" onClick={() => navigate('/checklist')}>
                  返回列表
                </Button>,
              ]}
            />
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">新建实施项目</h1>
        <p className="page-subtitle">创建您的SAP Ariba实施检查清单</p>
      </div>

      {/* 步骤指示器 */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Steps
          current={currentStep}
          items={steps}
          size="small"
          onChange={(current) => {
            if (current < currentStep) {
              setCurrentStep(current)
            }
          }}
        />
      </Card>

      {/* 步骤内容 */}
      <div className="fade-in">{renderStepContent()}</div>

      {/* 底部操作栏 */}
      {currentStep < 4 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 200,
            right: 0,
            padding: '16px 24px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 99,
          }}
        >
          <div>
            <Button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              上一步
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>
              步骤 {currentStep + 1} / {steps.length}
            </span>
            <Button
              type="primary"
              onClick={handleNext}
              disabled={!canNextStep()}
              loading={createMutation.isPending}
            >
              {currentStep === 3 ? '创建项目' : '下一步'}
            </Button>
          </div>
        </div>
      )}

      {/* 底部占位 */}
      {currentStep < 4 && <div style={{ height: 100 }} />}
    </div>
  )
}
