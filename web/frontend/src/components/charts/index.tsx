import ReactECharts from 'echarts-for-react'

// 饼图配置
export function createPieOption(data: { name: string; value: number }[], colors?: string[]) {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}: {d}%' },
      data,
      color: colors || ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'],
    }],
  }
}

// 柱状图配置
export function createBarOption(xData: string[], yData: number[], color?: string) {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: yData.map((v, i) => ({
        value: v,
        itemStyle: { color: Array.isArray(color) ? color[i] : (color || '#1890ff') }
      })),
      barWidth: '50%',
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  }
}

// 折线图配置
export function createLineOption(xData: string[], yData: number[], color?: string) {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: xData },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      smooth: true,
      data: yData,
      areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
      lineStyle: { color: color || '#1890ff', width: 3 },
      itemStyle: { color: color || '#1890ff' },
    }],
  }
}

// 仪表盘配置
export function createGaugeOption(value: number, name: string) {
  return {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLine: {
        lineStyle: { width: 6, color: [[0.3, '#67bcfa'], [0.7, '#b37feb'], [1, '#ff7875']] },
      },
      pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'] },
      axisTick: { length: 8, lineStyle: { color: 'auto', width: 2 } },
      splitLine: { length: 20, lineStyle: { color: 'auto', width: 5 } },
      axisLabel: { color: '#8c8c8c', fontSize: 12, distance: -60 },
      title: { offsetCenter: [0, '-10%'], fontSize: 14 },
      detail: { fontSize: 24, fontWeight: 'bold', offsetCenter: [0, '-35%'], valueAnimation: true, formatter: '{value}%' },
      data: [{ value, name }],
    }],
  }
}
