/**
 * 智能合同分析页面
 */

import React, { useState } from 'react';
import { Card, Button, Table, Tag, Progress, Alert, Input, message } from 'antd';
import { FileTextOutlined, SafetyCertificateOutlined, WarningOutlined } from '@ant-design/icons';
import './contract.css';

const { TextArea } = Input;

const ContractAnalyzer = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  // 分析合同
  const analyzeContract = async (isDemo = false) => {
    if (!isDemo && (!text || text.trim().length < 50)) {
      message.warning('请输入至少50个字符的合同文本');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contract/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: isDemo ? undefined : text,
          filename: isDemo ? '演示合同' : '用户上传'
        })
      });

      if (isDemo) {
        // 演示模式
        const demoResponse = await fetch('/api/contract/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const result = await demoResponse.json();
        if (result.success) {
          setReport(result.data);
          message.success('演示分析完成');
        }
      } else {
        const result = await response.json();
        if (result.success) {
          setReport(result.data);
          message.success('分析完成');
        } else {
          message.error(result.error);
        }
      }
    } catch (error) {
      message.error('分析失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 风险等级颜色
  const getRiskColor = (level) => {
    const colors = { HIGH: 'red', MEDIUM: 'orange', LOW: 'green' };
    return colors[level] || 'default';
  };

  // 渲染分析报告
  const renderReport = () => {
    if (!report) return null;

    const { summary, clauseAnalysis, riskAnalysis, recommendations } = report;

    return (
      <div className="contract-report">
        {/* 概览卡片 */}
        <div className="report-summary">
          <Card title="📊 分析概览" size="small">
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">条款覆盖率</span>
                <Progress percent={summary.clauseCoverage} status="active" />
              </div>
              <div className="summary-item">
                <span className="label">风险评分</span>
                <Tag color={getRiskColor(summary.riskLevel)}>
                  {summary.riskScore}/100 ({summary.riskLevel})
                </Tag>
              </div>
              <div className="summary-item">
                <span className="label">发现条款</span>
                <span>{summary.foundClauses}/{summary.totalClauses} 项</span>
              </div>
              <div className="summary-item">
                <span className="label">风险点</span>
                <Tag color="orange">{summary.totalRisks} 处</Tag>
              </div>
            </div>
          </Card>
        </div>

        {/* 条款分析 */}
        <Card title="📋 条款分析" size="small" className="clause-card">
          <Table
            size="small"
            dataSource={clauseAnalysis.foundClauses}
            rowKey="type"
            pagination={false}
            columns={[
              { title: '条款类型', dataIndex: 'name', key: 'name' },
              { 
                title: '权重', 
                dataIndex: 'weight', 
                key: 'weight',
                render: (w) => <Tag color="blue">{w}x</Tag>
              },
              { 
                title: '上下文', 
                dataIndex: 'contexts', 
                key: 'contexts',
                render: (ctxs) => (
                  <div className="context-preview">
                    {ctxs && ctxs[0] && <span>{ctxs[0].substring(0, 60)}...</span>}
                  </div>
                )
              }
            ]}
          />
          {clauseAnalysis.missingClauses.length > 0 && (
            <Alert
              type="warning"
              message={`缺失条款: ${clauseAnalysis.missingClauses.map(c => c.name).join('、')}`}
              className="missing-alert"
            />
          )}
        </Card>

        {/* 风险分析 */}
        <Card title="⚠️ 风险分析" size="small" className="risk-card">
          {riskAnalysis.risks.length === 0 ? (
            <Alert type="success" message="未发现明显风险点" />
          ) : (
            <Table
              size="small"
              dataSource={riskAnalysis.risks}
              rowKey="keyword"
              pagination={false}
              columns={[
                { 
                  title: '风险类型', 
                  dataIndex: 'keyword', 
                  key: 'keyword',
                  render: (kw) => <Tag color={getRiskColor(riskAnalysis.risks.find(r => r.keyword === kw)?.severity)}>{kw}</Tag>
                },
                { 
                  title: '严重程度', 
                  dataIndex: 'severity', 
                  key: 'severity',
                  render: (s) => <Tag color={getRiskColor(s)}>{s}</Tag>
                },
                { 
                  title: '出现次数', 
                  dataIndex: 'count', 
                  key: 'count',
                  render: (c) => <Tag>{c}次</Tag>
                },
                { 
                  title: '建议', 
                  dataIndex: 'details',
                  key: 'suggestion',
                  render: (details) => {
                    if (Array.isArray(details)) {
                      return details[0]?.suggestion || '-';
                    }
                    return '-';
                  }
                }
              ]}
            />
          )}
        </Card>

        {/* 改进建议 */}
        {recommendations && recommendations.length > 0 && (
          <Card title="💡 改进建议" size="small" className="recommend-card">
            {recommendations.map((rec, idx) => (
              <Alert
                key={idx}
                type={rec.priority === 'HIGH' ? 'error' : 'warning'}
                message={rec.message}
                className="recommend-alert"
              />
            ))}
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="contract-analyzer-page">
      <Card 
        title={<><FileTextOutlined /> 智能合同分析助手</>}
        extra={<Button type="link" onClick={() => analyzeContract(true)}>使用演示</Button>}
      >
        <div className="analyzer-content">
          <div className="input-section">
            <h4>📄 合同文本</h4>
            <TextArea
              rows={12}
              placeholder="请粘贴合同文本内容，支持以下条款识别：
- 合同当事人
- 合同金额与付款条款
- 交付与验收标准
- 质保与违约责任
- 知识产权与保密条款
..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="action-buttons">
              <Button 
                type="primary" 
                loading={loading}
                onClick={() => analyzeContract(false)}
                icon={<SafetyCertificateOutlined />}
              >
                开始分析
              </Button>
            </div>
          </div>

          <div className="report-section">
            {report ? renderReport() : (
              <div className="empty-state">
                <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
                <p>上传合同文本后，系统将自动分析</p>
                <ul>
                  <li>✅ 关键条款提取</li>
                  <li>✅ 风险点识别</li>
                  <li>✅ 改进建议生成</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContractAnalyzer;
