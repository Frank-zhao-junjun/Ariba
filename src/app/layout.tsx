import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Ariba 项目实施助手',
    template: '%s | Ariba 实施助手',
  },
  description:
    'Ariba 项目实施助手是一款专为企业 SAP Ariba 实施项目设计的全方位管理平台，涵盖项目管理、知识库、AI助手等核心功能。',
  keywords: [
    'Ariba',
    'SAP Ariba',
    '项目实施',
    '采购管理',
    'SRM',
    '实施助手',
    '项目管理',
    '知识库',
  ],
  authors: [{ name: 'Ariba实施团队' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Ariba 项目实施助手',
    description:
      '专为企业SAP Ariba实施项目设计的全方位管理平台',
    siteName: 'Ariba 实施助手',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
