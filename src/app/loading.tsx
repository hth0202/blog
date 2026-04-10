import { PostCardSkeleton } from '@/components/post';

export default function HomeLoading() {
  return (
    <div className="-mt-16">
      <div className="h-screen" />
      <div className="relative z-10 bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
          <section>
            <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
