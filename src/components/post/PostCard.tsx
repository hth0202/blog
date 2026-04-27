import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import type { Post } from '@/types/blog';

interface PostCardProps {
  post: Post;
  secret?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, secret }) => {
  const href = secret
    ? `/post/${post.id}?secret=${secret}`
    : `/post/${post.id}`;
  return (
    <Link href={href} className="group block">
      <div className="flex w-full flex-col items-start gap-6 rounded-lg p-4 transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:bg-gray-50 group-hover:shadow-lg sm:flex-row dark:group-hover:bg-neutral-800/50 dark:group-hover:shadow-neutral-800/60">
        <div className="relative aspect-square w-full flex-shrink-0 sm:aspect-auto sm:h-36 sm:w-36">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            sizes="(min-width: 640px) 144px, 100vw"
            unoptimized
            className="rounded-md bg-gray-100 object-cover opacity-80 dark:bg-neutral-700 dark:opacity-70"
          />
        </div>
        <div className="flex flex-grow flex-col">
          <span className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.category}
            </span>
            {post.status !== '발행' && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-indigo-200">
                {post.status}
              </span>
            )}
          </span>

          <h3 className="my-1 text-xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h3>
          <span className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            {post.date}
          </span>
          <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-600 dark:text-gray-300">
            {post.contentPreview}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-indigo-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export const PostCardSkeleton: React.FC = () => (
  <div className="flex w-full animate-pulse flex-col items-start gap-6 p-4 sm:flex-row">
    <div className="h-48 w-full flex-shrink-0 rounded-md bg-gray-100 sm:h-36 sm:w-36 dark:bg-neutral-700"></div>
    <div className="flex w-full flex-grow flex-col">
      <div className="mb-2 h-4 w-1/4 rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="mb-4 h-4 w-1/5 rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="mb-1 h-4 w-full rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-neutral-700"></div>
        <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-neutral-700"></div>
      </div>
    </div>
  </div>
);
