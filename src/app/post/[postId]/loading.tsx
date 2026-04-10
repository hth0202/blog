export default function PostDetailLoading() {
  return (
    <article className="mx-auto max-w-3xl animate-pulse">
      <header className="mb-8">
        <div className="mb-6 h-64 w-full rounded-lg bg-gray-200 dark:bg-neutral-700" />
        <div className="mb-2 h-4 w-20 rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="my-2 h-10 w-3/4 rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="mb-4 h-6 w-full rounded bg-gray-200 dark:bg-neutral-700" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-neutral-700" />
      </header>
      <div className="mb-12 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-gray-200 dark:bg-neutral-700"
            style={{ width: `${85 + Math.random() * 15}%` }}
          />
        ))}
      </div>
    </article>
  );
}
