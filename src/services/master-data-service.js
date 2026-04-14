/**
 * 主数据服务
 * 提供供应商、物料、成本中心等主数据的推荐
 */

const mockData = {
  vendors: [
    { id: 'V001', name: '上海东方电子有限公司', code: 'SHP-V001', category: '电子元器件', isPreferred: true, hasContract: true, isApproved: true },
    { id: 'V002', name: '北京华南物资贸易公司', code: 'BJN-V002', category: '办公用品', isPreferred: true, hasContract: true, isApproved: true },
    { id: 'V003', name: '广州华南机械配件厂', code: 'GZS-V003', category: '机械配件', isPreferred: false, hasContract: false, isApproved: true },
    { id: 'V004', name: '深圳创新科技有限公司', code: 'SZS-V004', category: 'IT设备', isPreferred: true, hasContract: true, isApproved: true },
    { id: 'V005', name: '杭州华东贸易公司', code: 'HZD-V005', category: '办公用品', isPreferred: false, hasContract: false, isApproved: false },
  ],
  materials: [
    { id: 'M001', name: '电子元器件', code: 'MAT-EL-001', category: '电子' },
    { id: 'M002', name: '办公设备', code: 'MAT-OF-001', category: '办公' },
    { id: 'M003', name: 'IT设备及配件', code: 'MAT-IT-001', category: 'IT' },
    { id: 'M004', name: '机械配件', code: 'MAT-MC-001', category: '机械' },
    { id: 'M005', name: '劳保用品', code: 'MAT-SP-001', category: '安全' },
  ],
  costCenters: [
    { id: 'C001', name: '研发部', code: 'CC-RD-001', department: '研发', type: '研发' },
    { id: 'C002', name: '市场部', code: 'CC-MK-001', department: '市场', type: '营销' },
    { id: 'C003', name: '生产部', code: 'CC-PR-001', department: '生产', type: '生产' },
    { id: 'C004', name: '行政管理', code: 'CC-AD-001', department: '行政', type: '管理' },
    { id: 'C005', name: 'IT运维', code: 'CC-IT-001', department: 'IT', type: '运维' },
  ]
};

class MasterDataService {
  async getRecommendedVendors(params) {
    const { category, preferred, amount, limit = 5 } = params || {};
    let vendors = [...mockData.vendors];
    if (category) {
      vendors = vendors.filter(v => v.category.includes(category) || (category && category.includes(v.category)));
    }
    vendors.sort((a, b) => {
      if (a.isPreferred !== b.isPreferred) return b.isPreferred - a.isPreferred;
      if (a.hasContract !== b.hasContract) return b.hasContract - a.hasContract;
      return 0;
    });
    return vendors.slice(0, limit);
  }

  async getRecommendedMaterials(params) {
    const { description, category, limit = 5 } = params || {};
    let materials = [...mockData.materials];
    if (category) {
      materials = materials.filter(m => m.category.includes(category) || (category && category.includes(m.category)));
    }
    return materials.slice(0, limit);
  }

  async getRecommendedCostCenters(params) {
    const { department, project, costType, limit = 3 } = params || {};
    let costCenters = [...mockData.costCenters];
    if (department) {
      costCenters = costCenters.filter(c => c.department.includes(department) || (department && department.includes(c.department)));
    }
    if (costType) {
      costCenters = costCenters.filter(c => c.type.includes(costType) || (costType && costType.includes(c.type)));
    }
    return costCenters.slice(0, limit);
  }

  async searchVendor(keyword) {
    return mockData.vendors.filter(v => v.name.includes(keyword) || v.code.includes(keyword));
  }

  async getVendorDetail(vendorId) {
    return mockData.vendors.find(v => v.id === vendorId);
  }
}

module.exports = new MasterDataService();
