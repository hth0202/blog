import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SunIcon, MoonIcon } from "../constants";

interface HeaderProps {
  theme: "light" | "dark" | "system";
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const pathname = usePathname();

  const navLinkClass = (path: string) =>
    `text-sm font-medium ${
      pathname === path
        ? "text-violet-600 dark:text-violet-400"
        : "text-gray-500 dark:text-gray-400"
    } hover:text-violet-600 dark:hover:text-violet-400 transition-colors`;

  return (
    <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              태피스토리
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className={navLinkClass("/")}>
                처음 화면
              </Link>
              <Link href="/blog" className={navLinkClass("/blog")}>
                기록
              </Link>
              <Link href="/projects" className={navLinkClass("/projects")}>
                작업
              </Link>
              <Link href="/about" className={navLinkClass("/about")}>
                소개
              </Link>
            </nav>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Current theme: ${theme}. Click to cycle themes.`}
              title={`Current: ${theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}`}
            >
              {theme === "system" ? (
                <div className="h-5 w-5 relative">
                  <SunIcon className="h-5 w-5 absolute opacity-50" />
                  <MoonIcon className="h-5 w-5 absolute opacity-50 translate-x-1" />
                </div>
              ) : theme === "light" ? (
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

export default Header;
