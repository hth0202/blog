'use client';

import { useEffect, useRef, useState } from 'react';

import type { TocHeading } from '@/lib/slugify';

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="group fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 xl:block">
      {/* 기본 상태: 가로 바 */}
      <div className="flex flex-col items-end gap-2.5 py-2 transition-opacity duration-150 group-hover:opacity-0">
        {headings.map(({ id, level }) => {
          const isActive = activeId === id;
          return (
            <span
              key={id}
              className={`block h-[2.5px] rounded-full transition-colors ${
                level === 1 ? 'w-7' : level === 2 ? 'w-5' : 'w-3.5'
              } ${
                isActive
                  ? 'bg-gray-600 dark:bg-gray-200'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          );
        })}
      </div>

      {/* 호버 상태: 텍스트 패널 */}
      <nav className="pointer-events-none absolute top-1/2 right-0 max-h-[70vh] w-56 translate-x-2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white/95 p-4 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900/95">
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          목차
        </p>
        <ul className="border-l-2 border-gray-200 dark:border-gray-700">
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`block py-1 text-sm transition-colors ${
                    level === 1 ? 'pl-3' : level === 2 ? 'pl-6' : 'pl-10'
                  } ${
                    isActive
                      ? '-ml-0.5 border-l-2 border-indigo-500 font-bold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
