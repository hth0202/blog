import { PlaygroundGallery } from '@/components/playground/PlaygroundGallery';

import { getPlaygroundImagesFromNotion } from '@/services/notion-api';

import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';

export const metadata: Metadata = {
  title: '놀이터 | 태피스토리',
  description: '태피의 이미지와 프롬프트를 모은 갤러리',
  alternates: { canonical: `${BASE_URL}/playground` },
};

export const revalidate = 300;

// 필터 파라미터(?sref= 등)는 갤러리가 브라우저에서 읽는다. 서버에서 읽으면 요청마다
// 렌더링되는 페이지가 되어, Notion 조회 실패 시 직전 페이지를 유지할 수 없다
export default async function PlaygroundPage() {
  const images = await getPlaygroundImagesFromNotion();
  return <PlaygroundGallery images={images} />;
}
