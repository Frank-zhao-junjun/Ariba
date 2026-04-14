'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  FileText,
  Code,
  Lightbulb,
  HelpCircle,
  Star,
  Clock,
  Eye,
  ChevronRight,
  Bookmark,
  FolderOpen,
  Layers,
  Settings,
  Users,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { knowledgeArticles, documentTemplates } from '@/lib/data';

const categoryIcons: Record<string, React.ElementType> = {
  配置指南: Settings,
  最佳实践: Lightbulb,
  接口指南: Code,
  FAQ: HelpCircle,
  企业背景知识: Building2,
  需求文档: FileText,
  蓝图设计文档: Layers,
  实施文档: BookOpen,
  接口设计文档: Code,
  接口开发PRD: FileText,
};

// 文档模板分类
const templateCategories = [
  { id: '需求文档', name: '需求文档', count: 2, icon: FileText, color: 'text-[#6366F1]' },
  { id: '测试用例', name: '测试用例', count: 1, icon: Layers, color: 'text-[#06B6D4]' },
  { id: '培训材料', name: '培训材料', count: 1, icon: BookOpen, color: 'text-[#8B5CF6]' },
  { id: '汇报模板', name: '汇报模板', count: 1, icon: FileText, color: 'text-[#F59E0B]' },
];

// 标准知识库分类
const standardCategories = [
  {
    id: 'knowledge-graph',
    name: '官方知识图谱',
    description: 'Ariba模块关系和架构知识',
    icon: Layers,
    color: 'from-[#6366F1] to-[#8B5CF6]',
    count: 24,
  },
  {
    id: 'best-practices',
    name: '最佳实践',
    description: '各行业实施经验和案例',
    icon: Lightbulb,
    color: 'from-[#F59E0B] to-[#EF4444]',
    count: 36,
  },
  {
    id: 'config-guides',
    name: '配置指南',
    description: '各模块详细配置步骤',
    icon: Settings,
    color: 'from-[#06B6D4] to-[#10B981]',
    count: 48,
  },
  {
    id: 'integration-guides',
    name: '接口指南',
    description: 'API文档和集成方案',
    icon: Code,
    color: 'from-[#8B5CF6] to-[#EC4899]',
    count: 32,
  },
  {
    id: 'faq',
    name: '常见问题解答',
    description: '实施过程中的常见问题',
    icon: HelpCircle,
    color: 'from-[#10B981] to-[#06B6D4]',
    count: 56,
  },
];

// 项目知识库分类
const projectCategories = [
  {
    id: 'enterprise-knowledge',
    name: '企业背景知识',
    description: '客户企业信息和业务背景',
    icon: Building2,
    count: 8,
  },
  {
    id: 'requirements',
    name: '需求文档',
    description: '业务需求和功能需求',
    icon: FileText,
    count: 12,
  },
  {
    id: 'blueprint',
    name: '蓝图设计文档',
    description: '业务流程和设计方案',
    icon: Layers,
    count: 6,
  },
  {
    id: 'implementation',
    name: '实施文档',
    description: '实施过程记录和总结',
    icon: BookOpen,
    count: 15,
  },
  {
    id: 'interface-design',
    name: '接口设计文档',
    description: '接口方案和技术设计',
    icon: Code,
    count: 9,
  },
  {
    id: 'interface-prd',
    name: '接口开发PRD',
    description: '接口需求和开发规范',
    icon: FileText,
    count: 7,
  },
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 过滤知识文章
  const filteredArticles = knowledgeArticles.filter((article) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    if (selectedCategory) {
      return article.category === selectedCategory || article.subcategory === selectedCategory;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">知识库</h1>
          <p className="text-muted-foreground mt-1">
            统一管理标准知识和项目知识，沉淀实施经验
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bookmark className="mr-2 h-4 w-4" />
            我的收藏
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            上传文档
          </Button>
        </div>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="搜索知识库..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard" className="gap-2">
            <BookOpen className="h-4 w-4" />
            标准知识库
          </TabsTrigger>
          <TabsTrigger value="project" className="gap-2">
            <Layers className="h-4 w-4" />
            项目知识库
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            文档模板
          </TabsTrigger>
        </TabsList>

        {/* 标准知识库 */}
        <TabsContent value="standard" className="mt-6">
          {/* 知识分类卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {standardCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={cn(
                    'cursor-pointer hover:border-[#6366F1]/50 hover:shadow-lg transition-all group overflow-hidden',
                    selectedCategory === category.id && 'border-[#6366F1] ring-1 ring-[#6366F1]'
                  )}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  }
                >
                  <CardContent className="p-5">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                        category.color
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <Badge variant="outline" className="text-xs">
                        {category.count} 篇
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#6366F1] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 知识文章列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                知识文章
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredArticles
                .filter((a) => a.category === 'standard')
                .map((article) => {
                  const Icon = categoryIcons[article.subcategory || '配置指南'] || BookOpen;
                  return (
                    <div
                      key={article.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#6366F1]/30 hover:bg-muted/50 transition-all cursor-pointer group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-[#6366F1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium group-hover:text-[#6366F1] transition-colors">
                            {article.title}
                          </h4>
                          <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {article.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.subcategory}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{article.author}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#6366F1] transition-colors shrink-0" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 项目知识库 */}
        <TabsContent value="project" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {projectCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:border-[#6366F1]/50 hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-5">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <Badge variant="outline" className="text-xs">
                        {category.count} 篇
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#6366F1] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 项目知识文章 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                项目知识
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredArticles
                .filter((a) => a.category === 'project')
                .map((article) => {
                  const Icon = categoryIcons[article.subcategory || '企业背景知识'] || Building2;
                  return (
                    <div
                      key={article.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#6366F1]/30 hover:bg-muted/50 transition-all cursor-pointer group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-[#06B6D4]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium group-hover:text-[#6366F1] transition-colors">
                            {article.title}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {article.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {article.subcategory}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{article.author}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#6366F1] transition-colors shrink-0" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 文档模板 */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {templateCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:border-[#6366F1]/50 hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-5">
                    <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4', category.color, 'bg-opacity-10')}>
                      <Icon className={cn('h-6 w-6', category.color)} />
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.count} 个模板
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 模板列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documentTemplates.map((template) => {
              const CategoryIcon = templateCategories.find(
                (c) => c.id === template.category
              )?.icon || FileText;
              const categoryColor = templateCategories.find(
                (c) => c.id === template.category
              )?.color;

              return (
                <Card
                  key={template.id}
                  className="hover:border-[#6366F1]/30 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', categoryColor?.replace('text-', 'bg-'), 'bg-opacity-10')}>
                        <CategoryIcon className={cn('h-6 w-6', categoryColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium group-hover:text-[#6366F1] transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs">
                            预览
                          </Button>
                          <Button size="sm" className="h-7 text-xs">
                            使用
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
