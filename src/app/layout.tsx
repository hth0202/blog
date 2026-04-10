import React from 'react';

import { ThemeProvider } from '@/layouts/ThemeProvider';

import { Header, Footer } from '@/layouts';
import './globals.css';
import 'react-notion-x/src/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <title>태피스토리</title>
        <meta
          name="description"
          content="서비스 기획자 겸 PM 태피가 엮어가는 성장 기록"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
      <body className="min-h-screen transition-colors duration-300">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="container mx-auto flex-grow px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
