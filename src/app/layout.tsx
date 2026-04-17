import React from 'react';

import { ThemeProvider } from '@/layouts/ThemeProvider';

import { Header, Footer, BottomNav } from '@/layouts';
import './globals.css';
import 'react-notion-x/src/styles.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: '태피스토리',
  description: '서비스 기획자 겸 PM 태피가 엮어가는 성장 기록',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com',
    siteName: '태피스토리',
    title: '태피스토리',
    description: '서비스 기획자 겸 PM 태피가 엮어가는 성장 기록',
    images: [{ url: '/android-chrome-512x512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: '태피스토리',
    description: '서비스 기획자 겸 PM 태피가 엮어가는 성장 기록',
    images: ['/android-chrome-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const root = document.documentElement;

                  root.classList.remove('dark');

                  if (theme === 'dark') {
                    root.classList.add('dark');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.style.colorScheme = 'light dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="container mx-auto flex-grow px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-8 lg:px-8">
              {children}
            </main>
            <Footer />
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
