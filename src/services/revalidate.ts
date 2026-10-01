import { revalidatePath, revalidateTag } from 'next/cache';

import {
  NOTION_LIST_TAG,
  getPlaygroundImagesFromNotionUncached,
  getPostsFromNotionUncached,
  getProjectsFromNotionUncached,
} from '@/services/notion-api';

// revalidatePath로 캐시를 비우면, 다음 방문 때 그 자리에서 페이지를 새로 만든다.
// 이때 Notion이 실패하면 직전 페이지가 아니라 오류 화면이 나간다. 그래서 캐시를
// 비우기 전에 목록을 실제로 받아와 보고, 하나라도 실패하면 비우지 않는다.
export async function revalidateAllIfNotionHealthy(): Promise<boolean> {
  try {
    await Promise.all([
      getPostsFromNotionUncached(),
      getProjectsFromNotionUncached(),
      getPlaygroundImagesFromNotionUncached(),
    ]);
  } catch (error) {
    console.error('Notion 응답 실패로 캐시 갱신을 건너뜀:', error);
    return false;
  }
  revalidateTag(NOTION_LIST_TAG);
  revalidatePath('/', 'layout');
  return true;
}
