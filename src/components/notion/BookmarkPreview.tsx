import Image from 'next/image';

import { fetchOgMeta } from '@/lib/og';

export async function BookmarkPreview({ url }: { url: string }) {
  const meta = await fetchOgMeta(url);
  const hasPreview = meta.title || meta.description || meta.image;

  if (!hasPreview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-3 flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60"
      >
        <span className="min-w-0 flex-1 truncate text-indigo-600 dark:text-indigo-400">
          {url}
        </span>
        <span className="shrink-0 text-gray-400">↗</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-3 flex overflow-hidden rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
        {meta.title && (
          <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {meta.title}
          </p>
        )}
        {meta.description && (
          <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {meta.description}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          {meta.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.favicon}
              alt=""
              width={14}
              height={14}
              className="rounded-sm"
            />
          )}
          <span className="truncate text-xs text-gray-400">
            {new URL(url).hostname.replace(/^www\./, '')}
          </span>
        </div>
      </div>
      {meta.image && (
        <div className="relative hidden h-auto w-36 shrink-0 sm:block">
          <Image
            src={meta.image}
            alt={meta.title ?? ''}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </a>
  );
}
