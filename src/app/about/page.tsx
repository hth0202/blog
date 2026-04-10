import { Suspense } from 'react';

import { NotionContent } from '@/components/post/article';

export const revalidate = 300;

function AboutSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="mt-6 h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-700" />
    </div>
  );
}

async function AboutContent() {
  const pageId = process.env.NOTION_ABOUT_PAGE_ID;
  if (!pageId)
    return <p className="text-gray-500">소개 페이지가 준비 중입니다.</p>;
  return <NotionContent rawId={pageId} />;
}

export default function AboutPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-5xl">
      <div className="mb-8 border-b border-gray-200 pb-4 dark:border-neutral-600">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          소개
        </h1>
      </div>

      <Suspense fallback={<AboutSkeleton />}>
        <AboutContent />
      </Suspense>
    </div>
  );
}
