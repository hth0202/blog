import { querySkillDatabase } from '@/services/notion-api';
import { SkillCollection } from '@/components/post/article/SkillCollection';

export async function SkillCollectionServer({ dbId }: { dbId: string }) {
  const initialItems = await querySkillDatabase(dbId);
  return <SkillCollection initialItems={initialItems} />;
}
