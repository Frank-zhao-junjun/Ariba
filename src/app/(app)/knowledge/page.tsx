'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Code,
  Lightbulb,
  HelpCircle,
  Clock,
  Eye,
  ChevronRight,
  Bookmark,
  FolderOpen,
  Layers,
  Settings,
  Building2,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  BookmarkCheck,
  ExternalLink,
  RefreshCw,
  Tag,
  User,
  Download,
  Upload,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { knowledgeArticles, documentTemplates } from '@/lib/data';
import {
  buildKnowledgeFilterFeedback,
  filterKnowledgeArticles,
  getKnowledgeSortLabel,
  getKnowledgeVisibleTags,
  type KnowledgeSortOption,
} from '@/lib/knowledge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 标准知识库分类
const standardCategories = [
  {
    id: 'knowledge-graph',
    name: '官方知识图谱',
    description: 'Ariba模块关系和架构知识',
    icon: Layers,
    color: 'from-[#6366F1] to-[#8B5CF6]',
    count: 24,
    articles: [
      { title: 'Ariba采购模块架构图', type: '架构图', views: 1234 },
      { title: 'S2P端到端流程图谱', type: '流程图', views: 987 },
      { title: '合同管理模块关系', type: '模块图', views: 654 },
    ],
  },
  {
    id: 'best-practices',
    name: '最佳实践',
    description: '各行业实施经验和案例',
    icon: Lightbulb,
    color: 'from-[#F59E0B] to-[#EF4444]',
    count: 36,
    articles: [
      { title: '制造业采购数字化转型案例', type: '案例', views: 2345 },
      { title: '快消行业供应商管理最佳实践', type: '实践', views: 1876 },
      { title: '大型企业Ariba实施避坑指南', type: '指南', views: 1543 },
    ],
  },
  {
    id: 'config-guides',
    name: '配置指南',
    description: '各模块详细配置步骤',
    icon: Settings,
    color: 'from-[#06B6D4] to-[#10B981]',
    count: 48,
    articles: [
      { title: '采购申请审批流配置', type: '配置', views: 3456 },
      { title: '供应商主数据导入配置', type: '配置', views: 2876 },
      { title: '合同模板配置指南', type: '配置', views: 2134 },
    ],
  },
  {
    id: 'integration-guides',
    name: '接口指南',
    description: 'API文档和集成方案',
    icon: Code,
    color: 'from-[#8B5CF6] to-[#EC4899]',
    count: 32,
    articles: [
      { title: 'Ariba API快速入门', type: 'API', views: 4567 },
      { title: 'SAP ERP集成方案', type: '集成', views: 3456 },
      { title: 'Web Service开发指南', type: '开发', views: 2789 },
    ],
  },
  {
    id: 'faq',
    name: '常见问题解答',
    description: '实施过程中的常见问题',
    icon: HelpCircle,
    color: 'from-[#10B981] to-[#06B6D4]',
    count: 56,
    articles: [
      { title: '许可证相关问题汇总', type: 'FAQ', views: 5678 },
      { title: '性能优化常见问题', type: 'FAQ', views: 4234 },
      { title: '集成失败排查指南', type: 'FAQ', views: 3567 },
    ],
  },
];

// 项目知识库分类
const projectCategories = [
  { id: 'enterprise-knowledge', name: '企业背景知识', description: '客户企业信息和业务背景', icon: Building2, count: 8 },
  { id: 'requirements', name: '需求文档', description: '业务需求和功能需求', icon: FileText, count: 12 },
  { id: 'blueprint', name: '蓝图设计文档', description: '业务流程和设计方案', icon: Layers, count: 6 },
  { id: 'implementation', name: '实施文档', description: '实施过程记录和总结', icon: BookOpen, count: 15 },
  { id: 'interface-design', name: '接口设计文档', description: '接口方案和技术设计', icon: Code, count: 9 },
  { id: 'interface-prd', name: '接口开发PRD', description: '接口需求和开发规范', icon: FileText, count: 7 },
];

// 文档模板分类
const templateCategories = [
  { id: 'requirements', name: '需求文档', count: 2, icon: FileText, color: 'text-[#6366F1]' },
  { id: 'testing', name: '测试用例', count: 1, icon: Layers, color: 'text-[#06B6D4]' },
  { id: 'training', name: '培训材料', count: 1, icon: BookOpen, color: 'text-[#8B5CF6]' },
  { id: 'reporting', name: '汇报模板', count: 1, icon: FileText, color: 'text-[#F59E0B]' },
];

type ViewMode = 'grid' | 'list';

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<KnowledgeSortOption>('views');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const visibleTags = useMemo(
    () => getKnowledgeVisibleTags(knowledgeArticles),
    []
  );

  const filteredArticles = useMemo(() => {
    return filterKnowledgeArticles(knowledgeArticles, {
      searchQuery,
      selectedCategory,
      selectedTags,
      bookmarkedOnly,
      sortBy,
    });
  }, [searchQuery, selectedCategory, selectedTags, bookmarkedOnly, sortBy]);

  const filteredStandardArticles = useMemo(
    () => filteredArticles.filter((article) => article.category === 'standard'),
    [filteredArticles]
  );

  const filteredProjectArticles = useMemo(
    () => filteredArticles.filter((article) => article.category === 'project'),
    [filteredArticles]
  );

  const activeFilterLabels = useMemo(
    () =>
      buildKnowledgeFilterFeedback({
        searchQuery,
        selectedCategory,
        selectedTags,
        bookmarkedOnly,
        sortBy,
      }),
    [searchQuery, selectedCategory, selectedTags, bookmarkedOnly, sortBy]
  );

  const hasNonDefaultFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== null ||
    selectedTags.length > 0 ||
    bookmarkedOnly ||
    sortBy !== 'views';

  const toggleSelectedTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  const toggleSelectedCategory = (categoryId: string) => {
    setSelectedCategory((current) => (current === categoryId ? null : categoryId));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTags([]);
    setBookmarkedOnly(false);
    setSortBy('views');
  };

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
          <Button variant="outline" onClick={() => setBookmarkedOnly(!bookmarkedOnly)}>
            <BookmarkCheck className={cn('mr-2 h-4 w-4', bookmarkedOnly && 'text-[#F59E0B]')} />
            我的收藏
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            导入
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            上传文档
          </Button>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* 搜索框 */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="搜索知识库..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11"
                />
              </div>

              {/* 排序 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SortAsc className="h-4 w-4" />
                    {getKnowledgeSortLabel(sortBy)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('views')}>按热度</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>按更新时间</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('title')}>按标题</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 视图切换 */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Tag className="mr-1 h-4 w-4" />
                标签筛选
              </span>
              {visibleTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
              {hasNonDefaultFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                  清空筛选
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Filter className="mr-1 h-4 w-4" />
                当前筛选
              </span>
              {activeFilterLabels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
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
          <div className={cn('grid gap-4 mb-8', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {standardCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={cn(
                    'cursor-pointer hover:border-[#6366F1]/50 hover:shadow-lg transition-all group overflow-hidden',
                    selectedCategory === category.id && 'border-[#6366F1] ring-1 ring-[#6366F1]'
                  )}
                  onClick={() => toggleSelectedCategory(category.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', category.color)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="outline" className="text-xs ml-2">
                            {category.count} 篇
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* 热门文章预览 */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">热门文章</p>
                      <div className="space-y-2">
                        {category.articles.slice(0, 2).map((article, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate flex-1">{article.title}</span>
                            <span className="text-muted-foreground shrink-0">{article.views}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        查看全部
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 知识文章列表 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                知识文章
                <Badge variant="secondary">{filteredStandardArticles.length}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  同步
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                filteredStandardArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStandardArticles.map((article) => (
                      <div
                        key={article.id}
                        className="p-4 rounded-lg border border-border hover:border-[#6366F1]/30 hover:bg-muted/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="h-10 w-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-[#6366F1]" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Bookmark className="h-4 w-4 mr-2" />
                                收藏
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                新窗口打开
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                下载
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h4 className="font-medium text-sm mt-3 group-hover:text-[#6366F1] transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {article.content}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {article.subcategory}
                          </Badge>
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" />
                            {article.updatedAt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                    当前筛选下暂无标准知识文章。
                  </div>
                )
              ) : (
                filteredStandardArticles.length > 0 ? (
                  <div className="divide-y divide-border">
                    {filteredStandardArticles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-[#6366F1]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm group-hover:text-[#6366F1] transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {article.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {article.subcategory}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                    当前筛选下暂无标准知识文章。
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 项目知识库 */}
        <TabsContent value="project" className="mt-6">
          <div className={cn('grid gap-4 mb-8', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {projectCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={cn(
                    'cursor-pointer hover:border-[#6366F1]/50 hover:shadow-lg transition-all group',
                    selectedCategory === category.id && 'border-[#6366F1] ring-1 ring-[#6366F1]'
                  )}
                  onClick={() => toggleSelectedCategory(category.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="outline" className="text-xs ml-2">
                            {category.count} 篇
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        查看全部
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 项目知识文章 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                项目知识
                <Badge variant="secondary">{filteredProjectArticles.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                上传文档
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredProjectArticles.length > 0 ? (
                filteredProjectArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#6366F1]/30 hover:bg-muted/50 transition-all cursor-pointer group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center shrink-0">
                      <Layers className="h-5 w-5 text-[#06B6D4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium group-hover:text-[#6366F1] transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {article.subcategory}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </span>
                        <span className="text-xs text-muted-foreground">{article.author}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#6366F1] transition-colors shrink-0" />
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                  当前筛选下暂无项目知识文章。
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 文档模板 */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {templateCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:border-[#6366F1]/50 hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-5">
                    <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4', category.color, 'bg-current bg-opacity-10')}>
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
            {documentTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:border-[#6366F1]/30 hover:shadow-lg transition-all cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-[#6366F1]" />
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
                        <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto">
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
