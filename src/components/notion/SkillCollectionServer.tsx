import { SkillCollection } from '@/components/post/article/SkillCollection';

import { querySkillDatabase } from '@/services/notion-api';

export async function SkillCollectionServer({ dbId }: { dbId: string }) {
  const initialItems = await querySkillDatabase(dbId);
  return <SkillCollection initialItems={initialItems} />;
}
