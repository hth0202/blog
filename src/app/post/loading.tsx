import { PostCardSkeleton } from '@/components/post';

export default function PostListLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
