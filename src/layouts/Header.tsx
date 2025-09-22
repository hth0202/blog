import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { SunIcon, MoonIcon } from '../constants';

interface HeaderProps {
  theme: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const pathname = usePathname();

  const navLinkClass = (path: string) =>
    `text-sm font-medium ${
      pathname === path
        ? 'text-indigo-600 dark:text-indigo-400'
        : 'text-gray-500 dark:text-gray-400'
    } hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              태피스토리
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden items-center space-x-6 md:flex">
              <Link href="/" className={navLinkClass('/')}>
                처음 화면
              </Link>
              <Link href="/post" className={navLinkClass('/post')}>
                기록
              </Link>
              <Link href="/projects" className={navLinkClass('/projects')}>
                작업
              </Link>
              <Link href="/about" className={navLinkClass('/about')}>
                소개
              </Link>
            </nav>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label={`Current theme: ${theme}. Click to cycle themes.`}
              title={`Current: ${theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}`}
            >
              {theme === 'system' ? (
                <div className="relative h-5 w-5">
                  <SunIcon className="absolute h-5 w-5 opacity-50" />
                  <MoonIcon className="absolute h-5 w-5 translate-x-1 opacity-50" />
                </div>
              ) : theme === 'light' ? (
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
