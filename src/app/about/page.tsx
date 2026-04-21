import { EducationSection } from '@/components/about/EducationSection';
import { NotionRenderer } from '@/components/notion/NotionRenderer';

import { getPageBlocks } from '@/services/notion-api';

import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';

export const metadata: Metadata = {
  title: '소개 | 태피스토리',
  description: '서비스 기획자 겸 PM 태피를 소개합니다',
  alternates: { canonical: `${BASE_URL}/about` },
};

export const revalidate = 300;

function getPlainText(richText: { plain_text: string }[]): string {
  return richText?.map((t) => t.plain_text).join('') ?? '';
}

function splitBlocks(blocks: BlockObjectResponse[]) {
  const sections: Record<string, { start: number; end: number }> = {
    경력: { start: -1, end: blocks.length },
    사이드: { start: -1, end: blocks.length },
    학력: { start: -1, end: blocks.length },
  };

  const keys = Object.keys(sections);

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (
      b.type === 'heading_1' ||
      b.type === 'heading_2' ||
      b.type === 'heading_3'
    ) {
      const text = getPlainText((b as any)[b.type].rich_text);
      for (const key of keys) {
        if (text.includes(key) && sections[key].start === -1) {
          sections[key].start = i;
          // 이전 섹션의 end를 이 인덱스로 마감
          for (const prevKey of keys) {
            if (
              sections[prevKey].start !== -1 &&
              sections[prevKey].end === blocks.length &&
              prevKey !== key
            ) {
              sections[prevKey].end = i;
            }
          }
        }
      }
    }
  }

  // 섹션 시작 인덱스 기준으로 정렬
  const sorted = keys
    .filter((k) => sections[k].start !== -1)
    .sort((a, b) => sections[a].start - sections[b].start);

  // 섹션 사이 노션 블록 조각들 추출
  const result: Array<
    | { type: 'notion'; blocks: BlockObjectResponse[] }
    | { type: string; blocks: BlockObjectResponse[] }
  > = [];
  let cursor = 0;

  for (const key of sorted) {
    const { start, end } = sections[key];
    if (cursor < start + 1) {
      result.push({ type: 'notion', blocks: blocks.slice(cursor, start + 1) });
    }
    result.push({ type: key, blocks: blocks.slice(start + 1, end) });
    cursor = end;
  }

  if (cursor < blocks.length) {
    result.push({ type: 'notion', blocks: blocks.slice(cursor) });
  }

  return result;
}

export default async function AboutPage() {
  const pageId = process.env.NOTION_ABOUT_PAGE_ID;
  const blocks = pageId ? await getPageBlocks(pageId) : [];
  const parts = splitBlocks(blocks as BlockObjectResponse[]);

  return (
    <div className="about-no-indent animate-fade-in mx-auto max-w-5xl pt-6 sm:pt-0">
      <div className="mb-8 border-b border-gray-200 pb-4 dark:border-neutral-600">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          소개
        </h1>
      </div>

      {blocks.length > 0 ? (
        <>
          {parts.map((part, i) => {
            if (part.type === 'notion')
              return (
                <NotionRenderer
                  key={i}
                  blocks={part.blocks}
                  imageColWidth={360}
                  noIndent
                />
              );
            if (part.type === '학력') return <EducationSection key={i} />;
            if (part.type === '경력')
              return (
                <NotionRenderer
                  key={i}
                  blocks={part.blocks}
                  imageColWidth={120}
                  noIndent
                />
              );
            if (part.type === '사이드')
              return (
                <NotionRenderer
                  key={i}
                  blocks={part.blocks}
                  imageColWidth={300}
                  noIndent
                />
              );
          })}
        </>
      ) : (
        <p className="text-gray-500">소개 페이지가 준비 중입니다.</p>
      )}
    </div>
  );
}
