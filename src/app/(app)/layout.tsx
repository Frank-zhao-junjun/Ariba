'use client';

import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ToastProvider } from '@/components/layout/toast';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <Header sidebarCollapsed={sidebarCollapsed} />
          <main
            className={`pt-16 min-h-screen transition-all duration-300 ${
              sidebarCollapsed ? 'pl-16' : 'pl-64'
            }`}
          >
            {/* 面包屑导航 */}
            <div className="px-6 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm">
              <Breadcrumb />
            </div>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
