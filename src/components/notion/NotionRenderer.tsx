import { NotionImage } from './NotionImage';
import { NotionRichText } from './NotionRichText';
import { SkillCollectionServer } from './SkillCollectionServer';

import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type React from 'react';

const BLOCK_BG: Record<string, string> = {
  gray_background: 'n-bg-gray',
  brown_background: 'n-bg-brown',
  orange_background: 'n-bg-orange',
  yellow_background: 'n-bg-yellow',
  green_background: 'n-bg-green',
  blue_background: 'n-bg-blue',
  purple_background: 'n-bg-purple',
  pink_background: 'n-bg-pink',
  red_background: 'n-bg-red',
};

/** 블록 레벨 color 값 → CSS 클래스 */
function blockColorClass(color?: string): string {
  if (!color || color === 'default') return '';
  return BLOCK_BG[color] ?? '';
}

// 연속된 리스트 항목을 그룹으로 묶기
type GroupedBlock =
  | BlockObjectResponse
  | { type: 'bulleted_list'; items: BlockObjectResponse[] }
  | { type: 'numbered_list'; items: BlockObjectResponse[] };

function groupBlocks(blocks: BlockObjectResponse[]): GroupedBlock[] {
  const result: GroupedBlock[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === 'bulleted_list_item') {
      const group: BlockObjectResponse[] = [];
      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        group.push(blocks[i]);
        i++;
      }
      result.push({ type: 'bulleted_list', items: group });
    } else if (block.type === 'numbered_list_item') {
      const group: BlockObjectResponse[] = [];
      while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
        group.push(blocks[i]);
        i++;
      }
      result.push({ type: 'numbered_list', items: group });
    } else {
      result.push(block);
      i++;
    }
  }

  return result;
}

function NotionBlock({ block }: { block: BlockObjectResponse }) {
  const children = (block as any).children as BlockObjectResponse[] | undefined;

  switch (block.type) {
    case 'paragraph': {
      if (!block.paragraph.rich_text.length) return <br />;
      const pBg = blockColorClass(block.paragraph.color);
      return (
        <p
          className={`mb-4 leading-relaxed text-gray-700 dark:text-gray-300 ${pBg}`.trim()}
        >
          <NotionRichText items={block.paragraph.rich_text} />
        </p>
      );
    }

    case 'heading_1': {
      const h1Bg = blockColorClass(block.heading_1.color);
      return (
        <h1
          className={`mt-10 mb-4 text-3xl font-bold text-gray-900 dark:text-white ${h1Bg}`.trim()}
        >
          <NotionRichText items={block.heading_1.rich_text} />
        </h1>
      );
    }

    case 'heading_2': {
      const h2Bg = blockColorClass(block.heading_2.color);
      return (
        <h2
          className={`mt-8 mb-3 text-2xl font-semibold text-gray-900 dark:text-white ${h2Bg}`.trim()}
        >
          <NotionRichText items={block.heading_2.rich_text} />
        </h2>
      );
    }

    case 'heading_3': {
      const h3Bg = blockColorClass(block.heading_3.color);
      return (
        <h3
          className={`mt-6 mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100 ${h3Bg}`.trim()}
        >
          <NotionRichText items={block.heading_3.rich_text} />
        </h3>
      );
    }

    case 'image': {
      // file 타입: blockId 전달 → proxy가 요청 시점에 Notion에서 신선한 URL 조회
      // external 타입: URL 직접 사용 (만료 없음)
      const imgSrc =
        block.image.type === 'file'
          ? `/api/notion-image?blockId=${block.id}`
          : block.image.external.url;
      const caption = block.image.caption;
      const captionText = caption?.map((c) => c.plain_text).join('') || '';

      // 캡션 태그로 크기·정렬·여백·배경 제어
      // 지원 태그: [s/m/l] [left/mid/right] [nobg] [mt:N] [mb:N] [ml:N] [mr:N]
      let remaining = captionText;

      const popTag = (pattern: RegExp) => {
        const m = remaining.match(pattern);
        if (m) remaining = remaining.slice(m.index! + m[0].length).trimStart();
        return m;
      };

      const sizeMatch = popTag(/\[(s|m|l)\]\s*/i);
      const sizeHint = sizeMatch ? sizeMatch[1].toLowerCase() : 'l';

      const alignMatch = popTag(/\[(left|mid|right)\]\s*/i);
      const alignHint = (alignMatch ? alignMatch[1].toLowerCase() : 'mid') as
        | 'left'
        | 'mid'
        | 'right';

      const nobgMatch = popTag(/\[nobg\]\s*/i);
      const nobg = !!nobgMatch;

      const margins: Record<string, string> = {};
      for (const dir of ['mt', 'mb', 'ml', 'mr'] as const) {
        const m = popTag(new RegExp(`\\[${dir}:(\\d+)\\]\\s*`, 'i'));
        if (m) {
          const prop = {
            mt: 'marginTop',
            mb: 'marginBottom',
            ml: 'marginLeft',
            mr: 'marginRight',
          }[dir];
          margins[prop] = `${m[1]}px`;
        }
      }

      const displayCaption = remaining;

      return (
        <NotionImage
          src={imgSrc}
          alt={displayCaption}
          caption={displayCaption || undefined}
          size={sizeHint as 's' | 'm' | 'l'}
          align={alignHint}
          nobg={nobg}
          marginStyle={Object.keys(margins).length ? margins : undefined}
        />
      );
    }

    case 'code': {
      const lang = block.code.language;
      const code = block.code.rich_text.map((t) => t.plain_text).join('');
      const caption = block.code.caption;
      return (
        <div className="my-4">
          {lang && lang !== 'plain text' && (
            <div className="rounded-t-lg bg-gray-700 px-4 py-1 text-xs text-gray-300">
              {lang}
            </div>
          )}
          <pre
            className={`overflow-x-auto bg-gray-900 p-4 text-sm text-gray-100 ${lang && lang !== 'plain text' ? 'rounded-b-lg' : 'rounded-lg'}`}
          >
            <code>{code}</code>
          </pre>
          {caption?.length > 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <NotionRichText items={caption} />
            </p>
          )}
        </div>
      );
    }

    case 'quote':
      return (
        <blockquote className="my-4 border-l-4 border-indigo-400 pl-4 text-gray-600 italic dark:text-gray-400">
          <NotionRichText items={block.quote.rich_text} />
          {children && <NotionRenderer blocks={children} />}
        </blockquote>
      );

    case 'callout': {
      const icon = block.callout.icon;
      const iconContent = icon?.type === 'emoji' ? icon.emoji : '💡';
      return (
        <div className="my-4 flex gap-3 rounded-lg bg-gray-50 p-4 dark:bg-neutral-800/60">
          <span className="text-xl leading-relaxed">{iconContent}</span>
          <div className="flex-1 text-gray-700 dark:text-gray-300">
            <NotionRichText items={block.callout.rich_text} />
            {children && <NotionRenderer blocks={children} />}
          </div>
        </div>
      );
    }

    case 'divider':
      return <hr className="my-8 border-gray-200 dark:border-neutral-700" />;

    case 'toggle':
      return (
        <details className="my-3 rounded-lg border border-gray-200 dark:border-neutral-700">
          <summary className="cursor-pointer p-4 font-medium text-gray-800 marker:text-indigo-500 dark:text-gray-200">
            <NotionRichText items={block.toggle.rich_text} />
          </summary>
          {children && (
            <div className="border-t border-gray-200 p-4 dark:border-neutral-700">
              <NotionRenderer blocks={children} />
            </div>
          )}
        </details>
      );

    case 'child_database':
      return <SkillCollectionServer dbId={block.id} />;

    case 'column_list': {
      const colCount = children?.length || 2;

      // 어느 컬럼이든 첫 번째 블록에서 [col:N:M] 태그 감지
      // 예: [col:1:2] → 1fr 2fr (이미지 컬럼 1/3, 본문 컬럼 2/3)
      // 이미지가 첫 블록인 컬럼은 건너뛰고, 본문 컬럼 첫 줄에 태그를 두면 됨
      // 태그 단락은 렌더링에서 제거
      let colRatio: string | undefined;
      const processedChildren = children?.map((col) => {
        const colChildren: any[] = (col as any).children ?? [];
        if (!colRatio && colChildren.length > 0) {
          const firstBlock = colChildren[0];
          if (firstBlock.type === 'paragraph') {
            const text =
              firstBlock.paragraph?.rich_text
                ?.map((t: any) => t.plain_text)
                .join('') ?? '';
            const m = text.match(/^\[col:([\d:]+)\]\s*$/i);
            if (m) {
              colRatio = m[1]
                .split(':')
                .map((n: string) => `${n}fr`)
                .join(' ');
              return { ...col, children: colChildren.slice(1) };
            }
          }
        }
        return col;
      });

      // 모바일: 1단 세로 배치 / 데스크탑: 노션 원본 단 수 유지
      const colClass: Record<number, string> = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-4',
      };
      const gridClass = colRatio
        ? 'grid-cols-1 col-ratio-grid'
        : (colClass[colCount] ?? 'grid-cols-1 md:grid-cols-2');

      return (
        <div className="my-4 overflow-x-hidden">
          <div
            className={`grid gap-4 ${gridClass}`}
            style={
              colRatio
                ? ({ '--col-ratio': colRatio } as React.CSSProperties)
                : undefined
            }
          >
            {processedChildren?.map((col) => (
              <div key={col.id}>
                {(col as any).children && (
                  <NotionRenderer blocks={(col as any).children} />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'column':
      // column은 column_list 안에서 처리됨
      return null;

    case 'table': {
      if (!children) return null;
      const hasColumnHeader = block.table.has_column_header; // 첫 번째 행 헤더
      const hasRowHeader = block.table.has_row_header; // 첫 번째 열 헤더
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm text-gray-800 dark:text-gray-200">
            <tbody>
              {children.map((row, idx) => {
                if (row.type !== 'table_row') return null;
                const cells = row.table_row.cells;
                const isHeaderRow = hasColumnHeader && idx === 0;
                return (
                  <tr
                    key={row.id}
                    className={
                      isHeaderRow
                        ? 'bg-gray-50 font-semibold dark:bg-neutral-700 dark:text-gray-100'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-800/40'
                    }
                  >
                    {cells.map((cell, ci) => {
                      const isHeaderCell =
                        isHeaderRow || (hasRowHeader && ci === 0);
                      const Tag = isHeaderCell ? 'th' : 'td';
                      return (
                        <Tag
                          key={ci}
                          className={`border border-gray-200 p-2 text-left dark:border-neutral-600${
                            hasRowHeader && ci === 0 && !isHeaderRow
                              ? 'bg-gray-50 font-semibold dark:bg-neutral-700 dark:text-gray-100'
                              : ''
                          }`}
                        >
                          <NotionRichText items={cell} />
                        </Tag>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case 'numbered_list_item':
    case 'bulleted_list_item':
      // groupBlocks()에서 처리 — 단독으로 오는 경우 방어용
      return (
        <li className="text-gray-700 dark:text-gray-300">
          <NotionRichText
            items={
              block.type === 'bulleted_list_item'
                ? block.bulleted_list_item.rich_text
                : block.numbered_list_item.rich_text
            }
          />
          {children && <NotionRenderer blocks={children} />}
        </li>
      );

    case 'bookmark':
    case 'link_preview': {
      const url =
        block.type === 'bookmark' ? block.bookmark.url : block.link_preview.url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60"
        >
          <span className="min-w-0 flex-1 truncate text-indigo-600 dark:text-indigo-400">
            {url}
          </span>
          <span className="shrink-0 text-gray-400">↗</span>
        </a>
      );
    }

    case 'embed': {
      const url = block.embed.url;
      const isYouTube = /youtube\.com|youtu\.be/.test(url);
      if (isYouTube) {
        const videoId = url.match(
          /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
        )?.[1];
        if (videoId) {
          return (
            <div className="my-4 aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          );
        }
      }
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60"
        >
          <span className="min-w-0 flex-1 truncate text-indigo-600 dark:text-indigo-400">
            {url}
          </span>
          <span className="shrink-0 text-gray-400">↗</span>
        </a>
      );
    }

    case 'video': {
      const src =
        block.video.type === 'file'
          ? block.video.file.url
          : block.video.external.url;
      const isYouTube = /youtube\.com|youtu\.be/.test(src);
      if (isYouTube) {
        const videoId = src.match(
          /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/,
        )?.[1];
        if (videoId) {
          return (
            <div className="my-4 aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          );
        }
      }
      return <video src={src} controls className="my-4 w-full rounded-lg" />;
    }

    case 'audio': {
      const src =
        block.audio.type === 'file'
          ? block.audio.file.url
          : block.audio.external.url;
      return <audio src={src} controls className="my-4 w-full" />;
    }

    case 'file': {
      const url =
        block.file.type === 'file'
          ? block.file.file.url
          : block.file.external.url;
      const name = block.file.name || url.split('/').pop() || '파일 다운로드';
      return (
        <a
          href={url}
          download
          className="my-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800/60"
        >
          <span>📎</span>
          <span>{name}</span>
        </a>
      );
    }

    default: {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[NotionRenderer] 미지원 블록 타입:', block.type);
      }
      return null;
    }
  }
}

export function NotionRenderer({ blocks }: { blocks: BlockObjectResponse[] }) {
  const grouped = groupBlocks(blocks);

  return (
    <div className="notion-content">
      {grouped.map((item, i) => {
        if ('items' in item) {
          if (item.type === 'bulleted_list') {
            return (
              <ul
                key={i}
                className="my-4 list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300"
              >
                {item.items.map((block) => {
                  const listChildren = (block as any).children as
                    | BlockObjectResponse[]
                    | undefined;
                  return (
                    <li key={block.id}>
                      <NotionRichText
                        items={(block as any).bulleted_list_item.rich_text}
                      />
                      {listChildren && <NotionRenderer blocks={listChildren} />}
                    </li>
                  );
                })}
              </ul>
            );
          }
          if (item.type === 'numbered_list') {
            return (
              <ol
                key={i}
                className="my-4 list-decimal space-y-2 pl-6 text-gray-700 dark:text-gray-300"
              >
                {item.items.map((block) => {
                  const listChildren = (block as any).children as
                    | BlockObjectResponse[]
                    | undefined;
                  return (
                    <li key={block.id}>
                      <NotionRichText
                        items={(block as any).numbered_list_item.rich_text}
                      />
                      {listChildren && <NotionRenderer blocks={listChildren} />}
                    </li>
                  );
                })}
              </ol>
            );
          }
        }
        return (
          <NotionBlock
            key={(item as BlockObjectResponse).id}
            block={item as BlockObjectResponse}
          />
        );
      })}
    </div>
  );
}
