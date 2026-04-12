import { NotionRenderer } from '@/components/notion/NotionRenderer';

import { getPageBlocks } from '@/services/notion-api';

export const revalidate = 300;

export default async function AboutPage() {
  const pageId = process.env.NOTION_ABOUT_PAGE_ID;

  const blocks = pageId ? await getPageBlocks(pageId) : [];

  return (
    <div className="animate-fade-in mx-auto max-w-5xl">
      <div className="mb-8 border-b border-gray-200 pb-4 dark:border-neutral-600">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          소개
        </h1>
      </div>

      {blocks.length > 0 ? (
        <NotionRenderer blocks={blocks} />
      ) : (
        <p className="text-gray-500">소개 페이지가 준비 중입니다.</p>
      )}
    </div>
  );
}
