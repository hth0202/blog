export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 border-b border-gray-200 pb-4 dark:border-neutral-600">
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-gray-200 dark:bg-neutral-700"
            style={{ width: `${70 + Math.floor((i * 13) % 30)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
