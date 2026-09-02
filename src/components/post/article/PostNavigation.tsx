import Link from 'next/link';

import type { Post } from '@/types/blog';

import { ChevronLeftIcon, ChevronRightIcon } from '@/constants';

type NavPost = Pick<Post, 'id' | 'title'>;

interface PostNavigationProps {
  prevPost: NavPost | null;
  nextPost: NavPost | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <>
      <nav
        className="mb-4 hidden gap-4 sm:grid sm:grid-cols-3"
        aria-label="이전 글 다음 글"
      >
        {prevPost && (
          <Link
            href={`/post/${prevPost.id}`}
            className="group flex flex-col gap-1 rounded-lg p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <ChevronLeftIcon className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400 transition-colors group-hover:text-indigo-600 dark:text-indigo-400/80 dark:group-hover:text-indigo-300" />
              이전 글
            </span>
            <span className="line-clamp-2 text-sm font-medium break-keep text-gray-700 dark:text-gray-300">
              {prevPost.title}
            </span>
          </Link>
        )}

        {nextPost && (
          <Link
            href={`/post/${nextPost.id}`}
            className="group flex flex-col items-end gap-1 rounded-lg p-4 text-right transition-colors hover:bg-gray-50 sm:col-start-3 dark:hover:bg-neutral-800"
          >
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              다음 글
              <ChevronRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400 transition-colors group-hover:text-indigo-600 dark:text-indigo-400/80 dark:group-hover:text-indigo-300" />
            </span>
            <span className="line-clamp-2 text-sm font-medium break-keep text-gray-700 dark:text-gray-300">
              {nextPost.title}
            </span>
          </Link>
        )}
      </nav>

      <nav
        className="mb-0 divide-y divide-gray-200 sm:hidden dark:divide-neutral-600"
        aria-label="이전 글 다음 글"
      >
        {prevPost && (
          <Link
            href={`/post/${prevPost.id}`}
            className="group flex items-start gap-4 py-3 transition-colors"
          >
            <span className="flex-shrink-0 pt-0.5 text-xs text-gray-500 transition-colors group-hover:text-indigo-600 group-active:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400 dark:group-active:text-indigo-400">
              이전 글
            </span>
            <span className="line-clamp-2 text-sm font-medium break-keep text-gray-700 transition-colors group-hover:text-indigo-600 group-active:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400 dark:group-active:text-indigo-400">
              {prevPost.title}
            </span>
          </Link>
        )}

        {nextPost && (
          <Link
            href={`/post/${nextPost.id}`}
            className="group flex items-start gap-4 py-3 transition-colors"
          >
            <span className="flex-shrink-0 pt-0.5 text-xs text-gray-500 transition-colors group-hover:text-indigo-600 group-active:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400 dark:group-active:text-indigo-400">
              다음 글
            </span>
            <span className="line-clamp-2 text-sm font-medium break-keep text-gray-700 transition-colors group-hover:text-indigo-600 group-active:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400 dark:group-active:text-indigo-400">
              {nextPost.title}
            </span>
          </Link>
        )}
      </nav>
    </>
  );
}
