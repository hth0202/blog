import React from 'react';

const EMAIL = 'hhth0202@gmail.com';
const GITHUB_URL = 'https://github.com/hth0202';

const linkClass =
  'transition-colors hover:text-gray-600 dark:hover:text-gray-300';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="hidden bg-gray-100 md:block dark:bg-[#1a1a1a]">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-8 text-xs text-gray-400 sm:px-6 lg:px-8 dark:text-gray-500">
        <a href={`mailto:${EMAIL}`} className={linkClass}>
          {EMAIL}
        </a>
        <span aria-hidden>|</span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          GitHub
        </a>
        <span aria-hidden>|</span>
        <span>
          © {year === 2026 ? '2026' : `2026–${year}`} 태피, All Rights
          Reserved.
        </span>
      </div>
    </footer>
  );
};
