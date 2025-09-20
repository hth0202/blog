'use client';

import React from 'react';

import { useTheme } from '@/hooks/useTheme';

import { Header, Footer } from '@/layouts';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, toggleTheme] = useTheme();

  return (
    <html lang="ko" className={theme}>
      <head>
        <title>태피스토리</title>
        <meta
          name="description"
          content="서비스 기획자 겸 PM 태피가 엮어가는 성장 기록"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                    // light 또는 system 모드: CSS prefers-color-scheme이 자동 처리
                    root.style.colorScheme = 'light dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <Header theme={theme} toggleTheme={toggleTheme} />
          <main className="container mx-auto flex-grow px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
