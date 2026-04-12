export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 border-b border-gray-200 pb-4 dark:border-neutral-600">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      </div>
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700"
          >
            <div className="h-48 animate-pulse bg-gray-200 dark:bg-neutral-700" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
