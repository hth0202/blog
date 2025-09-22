import Link from 'next/link';
import React from 'react';

import type { Post } from '@/types/blog';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link href={`/post/${post.id}`} className="group block">
      <div className="flex w-full flex-col items-start gap-6 rounded-lg p-4 transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:bg-gray-50 group-hover:shadow-lg sm:flex-row dark:group-hover:bg-gray-800/50 dark:group-hover:shadow-gray-800/60">
        <div className="flex-shrink-0">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="h-36 w-full rounded-md bg-gray-200 object-cover sm:w-36 dark:bg-gray-700"
          />
        </div>
        <div className="flex flex-grow flex-col">
          <span className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.category}
            </span>
            {post.status !== '발행' && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {post.status}
              </span>
            )}
          </span>

          <h3 className="my-1 text-xl font-bold">{post.title}</h3>
          <span className="mb-2 text-xs text-gray-400 dark:text-gray-500">
            {post.date}
          </span>
          <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-600 dark:text-gray-300">
            {post.contentPreview}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
    <div className="h-36 w-full flex-shrink-0 rounded-md bg-gray-200 sm:w-36 dark:bg-gray-700"></div>
    <div className="flex w-full flex-grow flex-col">
      <div className="mb-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-4 h-4 w-1/5 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-1 h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);
