export default function ProjectDetailLoading() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="relative mb-12 h-72 w-full animate-pulse overflow-hidden rounded-xl bg-gray-200 sm:h-80 dark:bg-neutral-700">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 space-y-2 p-6 sm:p-8">
            <div className="h-3 w-20 rounded bg-gray-300 dark:bg-neutral-600" />
            <div className="h-7 w-3/4 rounded bg-gray-300 dark:bg-neutral-600" />
            <div className="h-4 w-full rounded bg-gray-300 dark:bg-neutral-600" />
            <div className="h-3 w-24 rounded bg-gray-300 dark:bg-neutral-600" />
          </div>
        </div>
      </header>
      <div className="mb-12 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-gray-200 dark:bg-neutral-700"
            style={{ width: `${70 + Math.random() * 30}%` }}
          />
        ))}
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"
          />
        ))}
      </div>
    </article>
  );
}
