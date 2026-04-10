import { getPageBlocks } from '@/services/notion-api';
import { NotionRenderer } from '@/components/notion/NotionRenderer';

interface NotionContentProps {
  rawId: string;
}

export async function NotionContent({ rawId }: NotionContentProps) {
  const blocks = await getPageBlocks(rawId);
  if (!blocks.length) {
    return (
      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
        내용을 불러올 수 없습니다.
      </p>
    );
  }
  return <NotionRenderer blocks={blocks} />;
}
