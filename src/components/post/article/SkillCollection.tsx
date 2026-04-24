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

  // 카테고리별 그룹화 (순서 유지)
  const groups: { category: string; items: SkillItem[] }[] = [];
  const seen = new Map<string, SkillItem[]>();
  for (const item of initialItems) {
    const key = item.category || '기타';
    if (!seen.has(key)) {
      seen.set(key, []);
      groups.push({ category: key, items: seen.get(key)! });
    }
    seen.get(key)!.push(item);
  }

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
            className="grid grid-cols-2 items-start sm:grid-cols-3"
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
                          className="h-5 w-5 object-contain"
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
                    <span
                      className={`text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400`}
                    >
                      ▾
                    </span>
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
