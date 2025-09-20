import React from "react";
import Link from "next/link";
import { Post } from "../types";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link href={`/blog/${post.id}`} className="block group">
      <div className="flex flex-col sm:flex-row items-start gap-6 p-4 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-all duration-300 ease-in-out w-full group-hover:shadow-lg dark:group-hover:shadow-gray-800/60 group-hover:-translate-y-1">
        <div className="flex-shrink-0">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full sm:w-36 h-36 object-cover rounded-md bg-gray-200 dark:bg-gray-700"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {post.category}
          </span>
          <h3 className="text-xl font-bold my-1">{post.title}</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {post.date}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
            {post.contentPreview}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
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
  <div className="flex flex-col sm:flex-row items-start gap-6 p-4 w-full animate-pulse">
    <div className="flex-shrink-0 w-full sm:w-36 h-36 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    <div className="flex flex-col flex-grow w-full">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default PostCard;
