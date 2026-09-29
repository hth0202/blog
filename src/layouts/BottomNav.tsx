'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/post',
    label: '기록',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
      </svg>
    ),
  },
  {
    href: '/projects',
    label: '작업',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/playground',
    label: '놀이터',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M9.5 2h5" />
        <path d="M10.5 2v6.2L4.8 18.6A2.3 2.3 0 0 0 6.8 22h10.4a2.3 2.3 0 0 0 2-3.4L13.5 8.2V2" />
        <path d="M7 15h10" />
        <path d="M19 1.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: '소개',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white/90 backdrop-blur-sm md:hidden dark:border-neutral-700 dark:bg-[#1a1a1a]/90">
      <ul className="flex h-16 items-stretch">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400'
                }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
