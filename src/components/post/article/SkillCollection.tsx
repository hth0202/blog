'use client';

import { useState } from 'react';

import { NotionRichText } from '@/components/notion/NotionRichText';

import type { SkillItem } from '@/services/notion-api';
import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

export function SkillCollection({
  initialItems,
  initialContent = {},
}: {
  initialItems: SkillItem[];
  initialContent?: Record<string, RichTextItemResponse[][]>;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const contentCache = initialContent;

  if (!initialItems.length) return null;

  const CATEGORY_ORDER = [
    '프로젝트 관리',
    'AI',
    '데이터 분석',
    '디자인',
    '문서 작성',
  ];

  const ITEM_ORDER: Record<string, string[]> = {
    '프로젝트 관리': ['Jira', 'Notion', 'Slack'],
    AI: ['Claude', 'Gemini', 'Perplexity', 'ChatGPT'],
    '데이터 분석': ['mySQL', 'Amplitude', 'Python'],
    디자인: ['Figma', 'Photoshop', 'Illustrator'],
    '문서 작성': ['MS Excel', 'Google Sheets', 'MS Word', 'HWP'],
  };

  // 카테고리별 그룹화 후 지정 순서로 정렬
  const seen = new Map<string, SkillItem[]>();
  for (const item of initialItems) {
    const key = item.category || '기타';
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(item);
  }

  // 카테고리 내 항목 순서 정렬
  for (const [cat, items] of seen) {
    const order = ITEM_ORDER[cat];
    if (order) {
      items.sort((a, b) => {
        const ai = order.findIndex((n) =>
          a.title.toLowerCase().includes(n.toLowerCase()),
        );
        const bi = order.findIndex((n) =>
          b.title.toLowerCase().includes(n.toLowerCase()),
        );
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    }
  }

  const groups: { category: string; items: SkillItem[] }[] = [
    ...CATEGORY_ORDER.filter((c) => seen.has(c)).map((c) => ({
      category: c,
      items: seen.get(c)!,
    })),
    ...[...seen.keys()]
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .map((c) => ({ category: c, items: seen.get(c)! })),
  ];

  function handleToggle(itemId: string) {
    const next = new Set(openIds);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setOpenIds(next);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        marginTop: '1.5rem',
        width: '100%',
      }}
    >
      {groups.map(({ category, items: groupItems }) => (
        <div key={category}>
          {/* 카테고리 제목 */}
          <div
            style={{ marginBottom: '1rem' }}
            className="flex items-center gap-4"
          >
            <span className="text-base font-bold whitespace-nowrap text-gray-700 dark:text-gray-200">
              {category}
            </span>
            <div className="flex-1 border-t border-gray-200 dark:border-neutral-700" />
          </div>

          {/* 카드 그리드 */}
          <div
            className="grid grid-cols-1 items-start sm:grid-cols-3"
            style={{ gap: '1rem' }}
          >
            {groupItems.map((item) => {
              const isOpen = openIds.has(item.id);
              const bullets: RichTextItemResponse[][] =
                contentCache[item.id] ?? [];

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={[
                    'cursor-pointer rounded-xl border-2 p-4 transition-colors',
                    isOpen
                      ? 'border-indigo-500 dark:border-indigo-400'
                      : 'border-gray-200 hover:border-indigo-300 dark:border-neutral-700 dark:hover:border-indigo-600',
                  ].join(' ')}
                >
                  {/* 아이콘 + 이름 */}
                  <div className="flex items-center gap-2.5">
                    {item.iconUrl && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white dark:bg-transparent">
                        <img
                          src={item.iconUrl}
                          alt=""
                          className={`h-5 w-5 object-contain${['Notion', 'Perplexity', 'ChatGPT'].some((n) => item.title.includes(n)) ? ' dark:[filter:brightness(0)_invert(1)]' : ''}`}
                        />
                      </div>
                    )}
                    {item.iconEmoji && (
                      <span className="text-xl leading-none">
                        {item.iconEmoji}
                      </span>
                    )}
                    <span className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M6.293 9.293a1 1 0 0 1 1.414 0L12 13.586l4.293-4.293a1 1 0 1 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414Z" />
                    </svg>
                  </div>

                  {/* 토글 콘텐츠 */}
                  {isOpen && (
                    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-neutral-700">
                      {bullets.length > 0 ? (
                        <ul className="space-y-2">
                          {bullets.map((richText, i) => (
                            <li
                              key={i}
                              className="flex items-baseline gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <span className="shrink-0 text-indigo-500">
                                •
                              </span>
                              <span className="text-left break-keep">
                                <NotionRichText items={richText} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          내용이 없습니다.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
