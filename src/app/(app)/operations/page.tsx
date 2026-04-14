'use client';

import { useState } from 'react';
import {
  Wrench,
  Activity,
  Server,
  Database,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Download,
  Search,
  Filter,
  Bell,
  Settings,
  HardDrive,
  Wifi,
  Cpu,
  MemoryStick,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { systemStatus } from '@/lib/data';

const statusConfig = {
  healthy: { label: '正常', icon: CheckCircle2, color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10' },
  warning: { label: '警告', icon: AlertTriangle, color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10' },
  error: { label: '异常', icon: AlertTriangle, color: 'text-[#EF4444]', bgColor: 'bg-[#EF4444]/10' },
  offline: { label: '离线', icon: Server, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

const logLevelConfig = {
  info: { label: '信息', color: 'text-[#3B82F6]', bgColor: 'bg-[#3B82F6]/10' },
  warning: { label: '警告', color: 'text-[#F59E0B]', bgColor: 'bg-[#F59E0B]/10' },
  error: { label: '错误', color: 'text-[#EF4444]', bgColor: 'bg-[#EF4444]/10' },
  success: { label: '成功', color: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10' },
};

// 模拟系统指标历史数据
const metricsHistory = [
  { time: '00:00', cpu: 32, memory: 58, disk: 35, network: 15 },
  { time: '04:00', cpu: 28, memory: 55, disk: 35, network: 12 },
  { time: '08:00', cpu: 45, memory: 62, disk: 37, network: 28 },
  { time: '12:00', cpu: 52, memory: 68, disk: 38, network: 35 },
  { time: '16:00', cpu: 48, memory: 65, disk: 38, network: 30 },
  { time: '20:00', cpu: 38, memory: 60, disk: 38, network: 22 },
];

// 模拟告警记录
const alerts = [
  { id: 1, service: 'API Gateway', message: '响应时间超过阈值', level: 'warning', time: '10分钟前' },
  { id: 2, service: 'Database', message: '连接池使用率较高', level: 'info', time: '30分钟前' },
  { id: 3, service: 'Integration', message: 'SAP接口调用失败', level: 'error', time: '2小时前' },
  { id: 4, service: 'Network', message: '带宽使用率下降', level: 'info', time: '4小时前' },
];

export default function OperationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState<string>('all');

  const overallHealth = systemStatus.services.filter((s) => s.status === 'healthy').length;
  const totalServices = systemStatus.services.length;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#10B981] flex items-center justify-center">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">运维中心</h1>
            <p className="text-sm text-muted-foreground">系统监控与运维管理</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新状态
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 系统健康概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">系统状态</p>
                <p className="text-3xl font-bold mt-2">
                  {overallHealth}/{totalServices}
                </p>
                <p className="text-xs text-muted-foreground mt-1">正常服务</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU 使用率</p>
                <p className="text-3xl font-bold mt-2">{systemStatus.metrics.cpu}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {systemStatus.metrics.cpu < 50 ? '运行良好' : '负载较高'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-[#6366F1]" />
              </div>
            </div>
            <Progress value={systemStatus.metrics.cpu} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">内存使用</p>
                <p className="text-3xl font-bold mt-2">{systemStatus.metrics.memory}%</p>
                <p className="text-xs text-muted-foreground mt-1">可用 15.2 GB</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                <MemoryStick className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
            <Progress value={systemStatus.metrics.memory} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">磁盘使用</p>
                <p className="text-3xl font-bold mt-2">{systemStatus.metrics.disk}%</p>
                <p className="text-xs text-muted-foreground mt-1">可用 2.1 TB</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
            <Progress value={systemStatus.metrics.disk} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* 服务状态 */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">
            <Server className="h-4 w-4 mr-2" />
            服务状态
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-2" />
            性能指标
          </TabsTrigger>
          <TabsTrigger value="logs">
            <AlertTriangle className="h-4 w-4 mr-2" />
            运维日志
          </TabsTrigger>
        </TabsList>

        {/* 服务状态 */}
        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">服务健康检查</CardTitle>
              <CardDescription>实时监控系统各组件状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemStatus.services.map((service) => {
                  const config = statusConfig[service.status as keyof typeof statusConfig];
                  const Icon = config.icon;

                  return (
                    <div
                      key={service.name}
                      className="p-4 rounded-lg border border-border hover:border-[#6366F1]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                            <Icon className={cn('h-5 w-5', config.color)} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{service.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              最后检查: {service.lastCheck}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', config.color, config.bgColor)}
                          >
                            {config.label}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">可用率</span>
                          <span className="font-medium">{service.uptime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 性能指标 */}
        <TabsContent value="metrics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  CPU 使用趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricsHistory.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground w-12">{m.time}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500"
                          style={{ width: `${m.cpu}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{m.cpu}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  内存使用趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricsHistory.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground w-12">{m.time}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#06B6D4] to-[#10B981] transition-all duration-500"
                          style={{ width: `${m.memory}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{m.memory}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  磁盘 I/O
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-[#F59E0B]">{systemStatus.metrics.disk}%</div>
                  <p className="text-sm text-muted-foreground mt-2">当前使用率</p>
                  <div className="mt-4">
                    <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      状态正常
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  网络流量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-[#06B6D4]">{systemStatus.metrics.network} MB/s</div>
                  <p className="text-sm text-muted-foreground mt-2">当前带宽</p>
                  <div className="mt-4 flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">入站</p>
                      <p className="text-sm font-medium">42 MB/s</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">出站</p>
                      <p className="text-sm font-medium">28 MB/s</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 运维日志 */}
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">运维日志</CardTitle>
                <CardDescription>系统运行日志和告警记录</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="日志级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="info">信息</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                    <SelectItem value="error">错误</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">级别</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>消息</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemStatus.logs.map((log) => {
                    const config = logLevelConfig[log.level as keyof typeof logLevelConfig];
                    const Icon = config ? AlertTriangle : Clock;

                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={cn('text-xs', config?.color, config?.bgColor)}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.timestamp}
                        </TableCell>
                        <TableCell className="text-sm">{log.message}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 告警记录 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                告警记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const config = logLevelConfig[alert.level as keyof typeof logLevelConfig];

                  return (
                    <div
                      key={alert.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                        <AlertTriangle className={cn('h-5 w-5', config.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{alert.service}</h4>
                          <Badge className={cn('text-xs', config.color, config.bgColor)}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {alert.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      <Button variant="outline" size="sm" className="h-8">
                        处理
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
