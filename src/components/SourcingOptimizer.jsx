/**
 * AI寻源场景优化器 - 前端组件
 * 多维度评分可视化界面
 */

import React, { useState, useEffect } from 'react';

/**
 * 寻源场景优化器主组件
 */
export const SourcingOptimizer = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/sourcing-optimizer/scenarios');
      const data = await response.json();
      if (data.success) {
        setScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('加载场景失败:', error);
    }
  };

  return (
    <div className="sourcing-optimizer">
      <header className="so-header">
        <h1>🎯 AI寻源场景优化器</h1>
        <p className="subtitle">智能多维度评分 · TCO总拥有成本 · 最优方案推荐</p>
      </header>

      <div className="so-content">
        <aside className="so-sidebar">
          <CreateScenarioForm onCreated={loadScenarios} />
          <ScenarioList 
            scenarios={scenarios} 
            selected={selectedScenario}
            onSelect={setSelectedScenario}
          />
        </aside>

        <main className="so-main">
          {selectedScenario ? (
            <ScenarioDetail 
              scenario={selectedScenario}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onRefresh={loadScenarios}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      <style>{styles}</style>
    </div>
  );
};

/**
 * 创建场景表单
 */
const CreateScenarioForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    purchaseReqId: '',
    items: [{ materialId: 'M001', quantity: 100 }],
    supplierIds: ['sup-001', 'sup-002', 'sup-003'],
    weightConfig: { price: 30, quality: 30, delivery: 20, risk: 20 }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/sourcing-optimizer/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        alert('寻源场景创建成功！');
        setFormData({
          name: '',
          purchaseReqId: '',
          items: [{ materialId: 'M001', quantity: 100 }],
          supplierIds: ['sup-001', 'sup-002', 'sup-003'],
          weightConfig: { price: 30, quality: 30, delivery: 20, risk: 20 }
        });
        onCreated();
      }
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h3>📊 新建寻源场景</h3>
      
      <div className="form-group">
        <label>场景名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="例如: 2026Q2电子元器件采购"
          required
        />
      </div>

      <div className="form-group">
        <label>采购申请ID</label>
        <input
          type="text"
          value={formData.purchaseReqId}
          onChange={(e) => setFormData({...formData, purchaseReqId: e.target.value})}
          placeholder="PR-2026-00123"
        />
      </div>

      <div className="form-group">
        <label>物料数量</label>
        <input
          type="number"
          value={formData.items[0].quantity}
          onChange={(e) => setFormData({
            ...formData, 
            items: [{ ...formData.items[0], quantity: parseInt(e.target.value) }]
          })}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>评分权重配置</label>
        <div className="weight-config">
          {Object.entries(formData.weightConfig).map(([key, value]) => (
            <div key={key} className="weight-item">
              <span>{getWeightLabel(key)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setFormData({
                  ...formData,
                  weightConfig: {
                    ...formData.weightConfig,
                    [key]: parseInt(e.target.value)
                  }
                })}
              />
              <span className="weight-value">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? '⏳ 创建中...' : '🚀 创建并分析'}
      </button>
    </form>
  );
};

/**
 * 场景列表
 */
const ScenarioList = ({ scenarios, selected, onSelect }) => {
  if (scenarios.length === 0) {
    return (
      <div className="scenario-list empty">
        <p>暂无寻源场景</p>
        <p className="hint">创建第一个场景开始分析</p>
      </div>
    );
  }

  return (
    <div className="scenario-list">
      <h3>📋 寻源场景列表</h3>
      {scenarios.map(scenario => (
        <div
          key={scenario.id}
          className={`scenario-card ${selected?.id === scenario.id ? 'active' : ''}`}
          onClick={() => onSelect(scenario)}
        >
          <div className="scenario-name">{scenario.name}</div>
          <div className="scenario-meta">
            <span className="status-badge" data-status={scenario.status}>
              {getStatusLabel(scenario.status)}
            </span>
            <span className="date">{formatDate(scenario.createdAt)}</span>
          </div>
          {scenario.recommendations && (
            <div className="recommended-badge">
              ⭐ 推荐: {scenario.recommendations.recommended?.supplierName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * 场景详情
 */
const ScenarioDetail = ({ scenario, activeTab, setActiveTab, onRefresh }) => {
  const [scores, setScores] = useState(scenario.scores || []);
  const [sensitivity, setSensitivity] = useState(null);
  const [tco, setTco] = useState(null);

  const loadScores = async () => {
    try {
      const response = await fetch(`/api/sourcing-optimizer/scenarios/${scenario.id}/scores`);
      const data = await response.json();
      if (data.success) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error('加载评分失败:', error);
    }
  };

  const loadSensitivity = async () => {
    try {
      const response = await fetch(`/api/sourcing-optimizer/scenarios/${scenario.id}/sensitivity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceFluctuation: [-20, 20] })
      });
      const data = await response.json();
      if (data.success) {
        setSensitivity(data.sensitivity);
      }
    } catch (error) {
      console.error('加载敏感性分析失败:', error);
    }
  };

  const loadTCO = async () => {
    try {
      const response = await fetch(`/api/sourcing-optimizer/scenarios/${scenario.id}/tco`);
      const data = await response.json();
      if (data.success) {
        setTco(data.tco);
      }
    } catch (error) {
      console.error('加载TCO失败:', error);
    }
  };

  const handleAdopt = async (supplierId) => {
    try {
      const response = await fetch(`/api/sourcing-optimizer/scenarios/${scenario.id}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendedScenarioId: supplierId })
      });
      const data = await response.json();
      if (data.success) {
        alert('推荐方案已采纳！');
        onRefresh();
      }
    } catch (error) {
      console.error('采纳失败:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'sensitivity' && !sensitivity) loadSensitivity();
    if (activeTab === 'tco' && !tco) loadTCO();
  }, [activeTab]);

  return (
    <div className="scenario-detail">
      <div className="detail-header">
        <h2>{scenario.name}</h2>
        <span className="status-badge" data-status={scenario.status}>
          {getStatusLabel(scenario.status)}
        </span>
      </div>

      <nav className="detail-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 评分概览
        </button>
        <button 
          className={activeTab === 'sensitivity' ? 'active' : ''}
          onClick={() => setActiveTab('sensitivity')}
        >
          📈 敏感性分析
        </button>
        <button 
          className={activeTab === 'tco' ? 'active' : ''}
          onClick={() => setActiveTab('tco')}
        >
          💰 TCO成本
        </button>
      </nav>

      <div className="detail-content">
        {activeTab === 'overview' && (
          <ScoreOverview 
            scores={scores} 
            onAdopt={handleAdopt}
            recommendations={scenario.recommendations}
          />
        )}
        {activeTab === 'sensitivity' && sensitivity && (
          <SensitivityAnalysis data={sensitivity} />
        )}
        {activeTab === 'tco' && tco && (
          <TCOTable data={tco} />
        )}
      </div>
    </div>
  );
};

/**
 * 评分概览
 */
const ScoreOverview = ({ scores, onAdopt, recommendations }) => {
  if (!scores || scores.length === 0) {
    return <div className="loading">加载评分数据...</div>;
  }

  return (
    <div className="score-overview">
      {/* 推荐方案高亮 */}
      {recommendations?.recommended && (
        <div className="recommended-section">
          <h3>🏆 智能推荐最优方案</h3>
          <div className="recommended-card">
            <div className="rec-header">
              <span className="supplier-name">{recommendations.recommended.supplierName}</span>
              <span className="total-score">
                综合得分: {recommendations.recommended.totalScore}
              </span>
            </div>
            <div className="rec-breakdown">
              <ScoreBar label="价格" value={recommendations.recommended.breakdown.priceScore} />
              <ScoreBar label="质量" value={recommendations.recommended.breakdown.qualityScore} />
              <ScoreBar label="交期" value={recommendations.recommended.breakdown.deliveryScore} />
              <ScoreBar label="风险" value={recommendations.recommended.breakdown.riskScore} />
            </div>
            <div className="rec-reason">{recommendations.recommended.reason}</div>
            <button 
              className="btn-adopt"
              onClick={() => onAdopt(recommendations.recommended.supplierId)}
            >
              ✅ 采纳此推荐
            </button>
          </div>
        </div>
      )}

      {/* 所有方案对比 */}
      <div className="comparison-section">
        <h3>📊 供应商评分对比</h3>
        <table className="score-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>供应商</th>
              <th>总分</th>
              <th>价格</th>
              <th>质量</th>
              <th>交期</th>
              <th>风险</th>
              <th>推荐</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {scores.map(score => (
              <tr key={score.supplierId} className={score.recommendation === 'adopt' ? 'recommended-row' : ''}>
                <td><span className="rank">#{score.rank}</span></td>
                <td>{score.supplierName}</td>
                <td><strong>{score.totalScore}</strong></td>
                <td>{score.breakdown.priceScore}</td>
                <td>{score.breakdown.qualityScore}</td>
                <td>{score.breakdown.deliveryScore}</td>
                <td>{score.breakdown.riskScore}</td>
                <td>
                  <span className={`badge ${score.recommendation}`}>
                    {getRecommendationLabel(score.recommendation)}
                  </span>
                </td>
                <td>
                  {score.recommendation === 'adopt' && (
                    <button className="btn-small" onClick={() => onAdopt(score.supplierId)}>
                      采纳
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 分数条
 */
const ScoreBar = ({ label, value }) => (
  <div className="score-bar">
    <span className="bar-label">{label}</span>
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${value}%` }}></div>
    </div>
    <span className="bar-value">{value.toFixed(1)}</span>
  </div>
);

/**
 * 敏感性分析
 */
const SensitivityAnalysis = ({ data }) => (
  <div className="sensitivity-analysis">
    <h3>📈 价格敏感性分析</h3>
    <p className="insight">{data.insight}</p>
    
    {data.stableRange && (
      <div className="stable-range">
        最优方案稳定区间: ±{Math.min(Math.abs(data.stableRange.start), Math.abs(data.stableRange.end))}%
      </div>
    )}

    <div className="sensitivity-chart">
      {/* 简化的ASCII图表 */}
      <div className="chart-legend">
        {data.sensitivityData[0]?.rankings.map((s, i) => (
          <span key={s.supplierId} className={`legend-item color-${i}`}>
            {s.supplierName}
          </span>
        ))}
      </div>
      <div className="chart-content">
        {data.sensitivityData.map((d, i) => (
          <div key={i} className="chart-row">
            <span className="fluctuation">{d.fluctuation > 0 ? '+' : ''}{d.fluctuation}%</span>
            <div className="bars">
              {d.rankings.slice(0, 3).map((r, j) => (
                <div 
                  key={r.supplierId}
                  className={`bar color-${j}`}
                  style={{ height: `${r.totalScore / 2}%` }}
                  title={`${r.supplierName}: ${r.totalScore}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * TCO表格
 */
const TCOTable = ({ data }) => (
  <div className="tco-report">
    <h3>💰 总拥有成本(TCO)分析</h3>
    <p className="savings-summary">
      最佳供应商: <strong>{data.bestSupplier}</strong> | 
      潜在节约总额: <strong>¥{data.totalSavingsPotential.toLocaleString()}</strong>
    </p>

    <table className="tco-table">
      <thead>
        <tr>
          <th>供应商</th>
          <th>采购成本</th>
          <th>运输成本</th>
          <th>质量成本</th>
          <th>持有成本</th>
          <th>风险成本</th>
          <th>总TCO</th>
          <th>差距</th>
        </tr>
      </thead>
      <tbody>
        {data.suppliers.map(s => (
          <tr key={s.supplierId}>
            <td>
              {s.supplierName}
              {s.rank === 1 && <span className="best-badge">最优</span>}
            </td>
            <td>¥{s.tco.purchaseCost.toLocaleString()}</td>
            <td>¥{s.tco.shippingCost.toLocaleString()}</td>
            <td>¥{s.tco.qualityCost.toLocaleString()}</td>
            <td>¥{s.tco.inventoryCost.toLocaleString()}</td>
            <td>¥{s.tco.riskCost.toLocaleString()}</td>
            <td><strong>¥{s.tco.totalTCO.toLocaleString()}</strong></td>
            <td className={s.savings > 0 ? 'negative' : 'neutral'}>
              {s.savings > 0 ? '+' : ''}{s.savingsPercent}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * 空状态
 */
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">🎯</div>
    <h3>开始智能寻源分析</h3>
    <p>创建寻源场景，系统将自动进行多维度评分和TCO计算</p>
    <ul className="feature-list">
      <li>📊 多维度供应商评分</li>
      <li>💰 总拥有成本(TCO)分析</li>
      <li>🤖 AI智能推荐最优方案</li>
      <li>📈 价格敏感性分析</li>
    </ul>
  </div>
);

// 辅助函数
const getWeightLabel = (key) => {
  const labels = { price: '价格', quality: '质量', delivery: '交期', risk: '风险' };
  return labels[key] || key;
};

const getStatusLabel = (status) => {
  const labels = {
    pending: '待分析',
    scored: '已评分',
    adopted: '已采纳'
  };
  return labels[status] || status;
};

const getRecommendationLabel = (rec) => {
  const labels = { adopt: '推荐', consider: '考虑', reject: '不推荐' };
  return labels[rec] || rec;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// CSS样式
const styles = `
.sourcing-optimizer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.so-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
}

.so-header h1 { margin: 0; font-size: 24px; }
.so-header .subtitle { margin: 5px 0 0; opacity: 0.9; }

.so-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.so-sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.so-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.create-form h3, .scenario-list h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.weight-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.weight-item span:first-child {
  width: 50px;
}

.weight-item input[type="range"] {
  flex: 1;
}

.weight-value {
  width: 35px;
  text-align: right;
  color: #667eea;
  font-weight: 600;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.scenario-card {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-card:hover { border-color: #667eea; }
.scenario-card.active { border-color: #667eea; background: #f8f9ff; }

.scenario-name { font-weight: 600; margin-bottom: 5px; }
.scenario-meta { display: flex; justify-content: space-between; font-size: 12px; }

.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.status-badge[data-status="pending"] { background: #fff3cd; color: #856404; }
.status-badge[data-status="scored"] { background: #d4edda; color: #155724; }
.status-badge[data-status="adopted"] { background: #cce5ff; color: #004085; }

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.detail-tabs button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.recommended-section {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 1px solid #667eea30;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.recommended-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.supplier-name { font-size: 18px; font-weight: 700; color: #333; }
.total-score { font-size: 24px; font-weight: 700; color: #667eea; }

.rec-breakdown { margin: 15px 0; }

.score-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.bar-label { width: 40px; font-size: 13px; color: #666; }
.bar-track { flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 4px; }
.bar-value { width: 40px; text-align: right; font-weight: 600; font-size: 13px; }

.rec-reason {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  margin: 15px 0;
}

.btn-adopt {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.comparison-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.score-table, .tco-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.score-table th, .tco-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
}

.score-table td, .tco-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.rank {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
}

.badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
}

.badge.adopt { background: #d4edda; color: #155724; }
.badge.consider { background: #fff3cd; color: #856404; }
.badge.reject { background: #f8d7da; color: #721c24; }

.recommended-row {
  background: #f8f9ff;
}

.btn-small {
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon { font-size: 64px; margin-bottom: 20px; }
.feature-list {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.feature-list li {
  padding: 8px;
  color: #888;
}
`;

export default SourcingOptimizer;
