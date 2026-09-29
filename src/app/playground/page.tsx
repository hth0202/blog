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

type PlaygroundPageProps = {
  searchParams: Promise<{ model?: string; sref?: string; profile?: string }>;
};

export default async function PlaygroundPage({
  searchParams,
}: PlaygroundPageProps) {
  const { model = '', sref = '', profile = '' } = await searchParams;
  const images = await getPlaygroundImagesFromNotion();
  return (
    <PlaygroundGallery
      images={images}
      initialModel={model}
      initialSref={sref}
      initialProfile={profile}
    />
  );
}
