'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, MessageSquare, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 预设快捷问题
const quickQuestions = [
  '如何配置采购申请审批流程？',
  'Ariba与SAP ERP集成有哪些方式？',
  '供应商主数据导入的步骤是什么？',
  '如何创建自定义报表？',
  'S2P流程的最佳实践有哪些？',
];

// 模拟AI回复
const mockResponses = [
  `根据Ariba最佳实践，采购申请审批流程的配置步骤如下：

**1. 创建审批工作流**
- 进入管理 → 工作流设计
- 选择"采购申请"作为工作流类型
- 点击"新建工作流"

**2. 配置审批节点**
- 添加审批人（可以是用户、角色或成本中心负责人）
- 设置审批条件（如金额阈值）
- 配置路由规则（顺序审批/会签）

**3. 设置金额阈值规则**
- ¥0-10,000：直接批准
- ¥10,000-50,000：部门经理审批
- ¥50,000+：需要多级审批

**4. 测试验证**
- 使用测试账户模拟提交流程
- 验证各金额段的审批路径

如需更详细的配置文档，我可以为您提供。`,
  `Ariba与SAP ERP的集成主要有以下几种方式：

**1. SAP Cloud Integration (SCI)**
- 推荐用于S/4HANA Cloud
- 支持标准API和IDoc
- 实时或批量同步

**2. MuleSoft Anypoint Platform**
- 适用于异构系统集成
- 可视化流程设计
- 丰富的连接器支持

**3. 平面文件交换**
- 适用于数据量较小的场景
- 支持CSV/XML格式
- 定时任务调度

**4. SAP PI/PO中间件**
- 适用于ECC环境
- 支持复杂映射规则
- 企业级监控

建议根据您的SAP版本和业务需求选择合适的集成方式。`,
  `供应商主数据导入的标准步骤：

**1. 准备导入模板**
- 下载标准Excel模板
- 填写供应商信息字段
- 注意必填项标识

**2. 数据验证**
- 检查数据格式
- 验证税号等唯一标识
- 确保无重复记录

**3. 导入操作**
- 进入供应商管理 → 批量导入
- 上传文件
- 执行导入

**4. 导入后处理**
- 检查错误日志
- 修正失败记录
- 审核新供应商

**注意事项：**
- 首次导入需管理员权限
- 建议先导入少量测试数据
- 保留原始文件备份`,
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `您好！我是 Ariba 实施助手，可以帮助您：

• 解答 Ariba 系统相关问题
• 提供配置指导和最佳实践
• 协助排查实施过程中的问题
• 生成文档和代码示例

请随时向我提问，或使用下方的快捷问题开始。`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question?: string) => {
    const query = question || inputValue.trim();
    if (!query) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI响应（实际项目中应调用LLM API）
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">实施助手</h1>
            <p className="text-sm text-muted-foreground">AI 驱动的智能问答</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30">
          <span className="h-2 w-2 rounded-full bg-[#10B981] mr-2 animate-pulse" />
          在线
        </Badge>
      </div>

      {/* 聊天区域 */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="py-4 border-b shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#6366F1]" />
            对话历史
          </CardTitle>
        </CardHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                {/* 头像 */}
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]'
                      : 'bg-gradient-to-br from-[#06B6D4] to-[#10B981]'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-xs text-white font-medium">我</span>
                  )}
                </div>

                {/* 消息内容 */}
                <div
                  className={cn(
                    'flex-1 max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'assistant'
                      ? 'bg-muted'
                      : 'bg-[#6366F1] text-white'
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => {
                      // 处理markdown格式
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-semibold mt-2 first:mt-0">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      if (line.startsWith('• ')) {
                        return (
                          <p key={i} className="ml-2">
                            {line.replace('• ', '• ')}
                          </p>
                        );
                      }
                      if (line.match(/^\d+\./)) {
                        return (
                          <p key={i} className="ml-2">
                            {line}
                          </p>
                        );
                      }
                      if (line.trim() === '') {
                        return <br key={i} />;
                      }
                      return (
                        <p key={i} className="text-sm">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {/* 操作按钮 */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleCopy(message.content, message.id)}
                      >
                        {copiedId === message.id ? (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            复制
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        有帮助
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        待改进
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 加载状态 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 快捷问题 */}
        {messages.length === 1 && (
          <div className="px-4 pb-4 border-t pt-4 shrink-0">
            <p className="text-xs text-muted-foreground mb-2">快捷问题：</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSend(q)}
                >
                  <Sparkles className="h-3 w-3 mr-1 text-[#6366F1]" />
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 输入框 */}
        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="输入您的问题..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={() => handleSend()} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI助手可以协助解答问题，但重要决策请咨询专业人士
          </p>
        </div>
      </Card>
    </div>
  );
}
