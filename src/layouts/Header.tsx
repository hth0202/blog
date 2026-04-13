'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { SunIcon, MoonIcon } from '../constants';
import { useThemeContext } from './ThemeProvider';

const NAV_LINKS = [
  { href: '/', label: '처음 화면' },
  { href: '/post', label: '기록' },
  { href: '/projects', label: '작업' },
  { href: '/about', label: '소개' },
];

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeContext();
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === '/'
      ? pathname === '/'
      : pathname === path || pathname.startsWith(`${path}/`);

  const navLinkClass = (path: string) =>
    `text-sm transition-colors ${
      isActive(path)
        ? 'font-bold text-indigo-600 dark:text-indigo-300'
        : 'font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm dark:bg-[#1a1a1a]/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-neutral-600">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
            태피스토리
          </Link>

          <div className="flex items-center space-x-6">
            {/* Desktop nav */}
            <nav className="hidden items-center space-x-6 md:flex">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className={navLinkClass(href)}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800"
              aria-label={`현재 테마: ${theme === 'light' ? '라이트' : '다크'}. 클릭하여 전환.`}
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
