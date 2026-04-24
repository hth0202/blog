import { SkillCollection } from '@/components/post/article/SkillCollection';

import { getSkillTextBlocks, querySkillDatabase } from '@/services/notion-api';
import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

export async function SkillCollectionServer({ dbId }: { dbId: string }) {
  const initialItems = await querySkillDatabase(dbId);

  const contentEntries = await Promise.all(
    initialItems.map(async (item) => {
      const blocks = await getSkillTextBlocks(item.id);
      return [item.id, blocks] as const;
    }),
  );
  const initialContent: Record<string, RichTextItemResponse[][]> =
    Object.fromEntries(contentEntries);

  return (
    <SkillCollection
      initialItems={initialItems}
      initialContent={initialContent}
    />
  );
}
