'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  // 个人资料表单
  const [profile, setProfile] = useState({
    name: '张实施顾问',
    email: 'zhang.consultant@company.com',
    phone: '138****8888',
    position: '项目经理',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // 通知设置
  const [notifications, setNotifications] = useState({
    taskAssignment: true,
    comments: true,
    milestones: true,
    email: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // 安全设置
  const [twoFactor, setTwoFactor] = useState(false);

  // 系统设置
  const [systemPrefs, setSystemPrefs] = useState({
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    darkMode: false,
    dateFormat: 'YYYY-MM-DD',
  });
  const [systemSaved, setSystemSaved] = useState(false);

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveNotifications = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleSaveSystem = () => {
    setSystemSaved(true);
    setTimeout(() => setSystemSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">系统设置</h1>
          <p className="text-sm text-muted-foreground">管理账户和系统偏好设置</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            安全
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Palette className="h-4 w-4" />
            系统
          </TabsTrigger>
        </TabsList>

        {/* 个人资料 */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">个人资料</CardTitle>
              <CardDescription>管理您的账户信息和个人资料</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    支持 JPG、PNG 格式，最大 2MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">姓名</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">邮箱</label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">手机</label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">职位</label>
                  <Input
                    value={profile.position}
                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                {profileSaved && (
                  <div className="flex items-center gap-2 text-[#10B981] text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    保存成功
                  </div>
                )}
                <div className="flex-1" />
                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  保存更改
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">通知设置</CardTitle>
              <CardDescription>管理您希望接收的通知类型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">任务分配通知</p>
                  <p className="text-sm text-muted-foreground">
                    当有新任务分配给您时发送通知
                  </p>
                </div>
                <Switch
                  checked={notifications.taskAssignment}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, taskAssignment: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">评论通知</p>
                  <p className="text-sm text-muted-foreground">
                    当有人回复您的评论时发送通知
                  </p>
                </div>
                <Switch
                  checked={notifications.comments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, comments: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">里程碑提醒</p>
                  <p className="text-sm text-muted-foreground">
                    里程碑到期前发送提醒
                  </p>
                </div>
                <Switch
                  checked={notifications.milestones}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, milestones: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">邮件通知</p>
                  <p className="text-sm text-muted-foreground">
                    通过邮件接收重要通知
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                {notifSaved && (
                  <div className="flex items-center gap-2 text-[#10B981] text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    保存成功
                  </div>
                )}
                <div className="flex-1" />
                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  保存通知设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">安全设置</CardTitle>
              <CardDescription>管理您的账户安全选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">两步验证</p>
                  <p className="text-sm text-muted-foreground">
                    启用后登录需要输入手机验证码
                  </p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={setTwoFactor}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">当前状态</p>
                  <p className="text-sm text-muted-foreground">
                    {twoFactor ? '两步验证已启用' : '两步验证未启用'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    twoFactor
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {twoFactor ? '已启用' : '未启用'}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 系统设置 */}
        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">系统设置</CardTitle>
              <CardDescription>配置系统级别偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">语言</label>
                <Select
                  value={systemPrefs.language}
                  onValueChange={(value) =>
                    setSystemPrefs({ ...systemPrefs, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">时区</label>
                <Select
                  value={systemPrefs.timezone}
                  onValueChange={(value) =>
                    setSystemPrefs({ ...systemPrefs, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                    <SelectItem value="UTC">世界标准时间 (UTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">深色模式</p>
                  <p className="text-sm text-muted-foreground">
                    切换系统显示主题
                  </p>
                </div>
                <Switch
                  checked={systemPrefs.darkMode}
                  onCheckedChange={(checked) =>
                    setSystemPrefs({ ...systemPrefs, darkMode: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">日期格式</label>
                <Select
                  value={systemPrefs.dateFormat}
                  onValueChange={(value) =>
                    setSystemPrefs({ ...systemPrefs, dateFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">2024-04-15</SelectItem>
                    <SelectItem value="DD/MM/YYYY">15/04/2024</SelectItem>
                    <SelectItem value="MM/DD/YYYY">04/15/2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                {systemSaved && (
                  <div className="flex items-center gap-2 text-[#10B981] text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    保存成功
                  </div>
                )}
                <div className="flex-1" />
                <Button onClick={handleSaveSystem}>
                  <Save className="mr-2 h-4 w-4" />
                  保存系统设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
