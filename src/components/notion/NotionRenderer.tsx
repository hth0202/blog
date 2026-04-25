import { slugify } from '@/lib/slugify';

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

const CALLOUT_BG: Record<string, string> = {
  gray: 'bg-[#f7f7f5] dark:bg-[#2a2a2a]',
  brown: 'bg-[#faf4f1] dark:bg-[#321e14]',
  orange: 'bg-[#fdf4ea] dark:bg-[#33200e]',
  yellow: 'bg-[#fdf8e1] dark:bg-[#302a0d]',
  green: 'bg-[#f0f9ef] dark:bg-[#10261a]',
  blue: 'bg-[#edf6fc] dark:bg-[#0e2130]',
  purple: 'bg-[#f5f1fc] dark:bg-[#1e1130]',
  pink: 'bg-[#fceef9] dark:bg-[#2e1222]',
  red: 'bg-[#fdf0ef] dark:bg-[#2e1110]',
  gray_background: 'bg-[#f7f7f5] dark:bg-[#2a2a2a]',
  brown_background: 'bg-[#faf4f1] dark:bg-[#321e14]',
  orange_background: 'bg-[#fdf4ea] dark:bg-[#33200e]',
  yellow_background: 'bg-[#fdf8e1] dark:bg-[#302a0d]',
  green_background: 'bg-[#f0f9ef] dark:bg-[#10261a]',
  blue_background: 'bg-[#edf6fc] dark:bg-[#0e2130]',
  purple_background: 'bg-[#f5f1fc] dark:bg-[#1e1130]',
  pink_background: 'bg-[#fceef9] dark:bg-[#2e1222]',
  red_background: 'bg-[#fdf0ef] dark:bg-[#2e1110]',
};

const CALLOUT_ICON_COLOR: Record<string, string> = {
  gray: 'text-gray-500',
  brown: 'text-amber-700',
  orange: 'text-orange-500',
  yellow: 'text-yellow-500',
  green: 'text-green-600',
  blue: 'text-blue-500',
  purple: 'n-text-purple',
  pink: 'text-pink-500',
  red: 'text-red-500',
};

const BLOCK_TEXT: Record<string, string> = {
  gray: 'text-gray-400 dark:text-gray-500',
  brown: 'text-amber-700 dark:text-amber-500',
  orange: 'text-orange-500',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  green: 'text-green-600 dark:text-green-400',
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'n-text-purple',
  pink: 'text-pink-500',
  red: 'text-red-500',
};

/** 블록 레벨 color 값 → 배경 CSS 클래스 */
function blockColorClass(color?: string): string {
  if (!color || color === 'default') return '';
  return BLOCK_BG[color] ?? '';
}

/** 블록 레벨 color 값 → 텍스트 CSS 클래스 */
function blockTextColorClass(color?: string): string {
  if (!color || color === 'default' || color.endsWith('_background')) return '';
  return BLOCK_TEXT[color] ?? '';
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

function NotionBlock({
  block,
  imageColWidth,
  noIndent,
}: {
  block: BlockObjectResponse;
  imageColWidth?: number;
  noIndent?: boolean;
}) {
  const children = (block as any).children as BlockObjectResponse[] | undefined;

  switch (block.type) {
    case 'paragraph': {
      if (!block.paragraph.rich_text.length) return <br />;
      const pText = block.paragraph.rich_text
        .map((t: any) => t.plain_text)
        .join('');
      if (/^\[col:[^\]]+\]\s*$/i.test(pText)) return null;
      const pBg = blockColorClass(block.paragraph.color);
      const pTextColor = blockTextColorClass(block.paragraph.color);
      return (
        <>
          <p
            className={`${children ? 'mb-0' : 'mb-4'} leading-relaxed break-keep ${pTextColor || 'text-gray-700 dark:text-gray-300'} ${pBg}`.trim()}
          >
            <NotionRichText items={block.paragraph.rich_text} />
          </p>
          {children && (
            <div className="pl-6 [&>div>ol:first-child]:mt-1 [&>div>ul:first-child]:mt-1">
              <NotionRenderer
                blocks={children}
                imageColWidth={imageColWidth}
                noIndent={noIndent}
              />
            </div>
          )}
        </>
      );
    }

    case 'heading_1': {
      const h1Bg = blockColorClass(block.heading_1.color);
      const h1TextColor = blockTextColorClass(block.heading_1.color);
      const h1Text = block.heading_1.rich_text
        .map((t: any) => t.plain_text)
        .join('');
      return (
        <>
          <h1
            id={slugify(h1Text)}
            className={`mt-10 mb-4 scroll-mt-24 text-3xl font-bold ${h1TextColor || 'text-gray-900 dark:text-white'} ${h1Bg}`.trim()}
          >
            <NotionRichText items={block.heading_1.rich_text} />
          </h1>
          {children && (
            <div className={noIndent ? '' : 'pl-6'}>
              <NotionRenderer
                blocks={children}
                imageColWidth={imageColWidth}
                noIndent={noIndent}
              />
            </div>
          )}
        </>
      );
    }

    case 'heading_2': {
      const h2Bg = blockColorClass(block.heading_2.color);
      const h2TextColor = blockTextColorClass(block.heading_2.color);
      const h2Text = block.heading_2.rich_text
        .map((t: any) => t.plain_text)
        .join('');
      return (
        <>
          <h2
            id={slugify(h2Text)}
            className={`mt-8 mb-3 scroll-mt-24 text-2xl font-semibold ${h2TextColor || 'text-gray-900 dark:text-white'} ${h2Bg}`.trim()}
          >
            <NotionRichText items={block.heading_2.rich_text} />
          </h2>
          {children && (
            <div className={noIndent ? '' : 'pl-6'}>
              <NotionRenderer
                blocks={children}
                imageColWidth={imageColWidth}
                noIndent={noIndent}
              />
            </div>
          )}
        </>
      );
    }

    case 'heading_3': {
      const h3Bg = blockColorClass(block.heading_3.color);
      const h3TextColor = blockTextColorClass(block.heading_3.color);
      const h3Text = block.heading_3.rich_text
        .map((t: any) => t.plain_text)
        .join('');
      return (
        <>
          <h3
            id={slugify(h3Text)}
            className={`mt-6 mb-4 scroll-mt-24 text-xl font-semibold ${h3TextColor || 'text-gray-800 dark:text-gray-100'} ${h3Bg}`.trim()}
          >
            <NotionRichText items={block.heading_3.rich_text} />
          </h3>
          {children && (
            <div className={noIndent ? '' : 'pl-6'}>
              <NotionRenderer
                blocks={children}
                imageColWidth={imageColWidth}
                noIndent={noIndent}
              />
            </div>
          )}
        </>
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

      const sizeMatch = popTag(/\[(xs|s|m|l)\]\s*/i);
      const sizeHint = sizeMatch ? sizeMatch[1].toLowerCase() : 'l';

      const alignMatch = popTag(/\[(left|mid|right)\]\s*/i);
      const alignHint = (alignMatch ? alignMatch[1].toLowerCase() : 'mid') as
        | 'left'
        | 'mid'
        | 'right';

      const nobgMatch = popTag(/\[nobg\]\s*/i);
      const nobg = !!nobgMatch;

      const wMatch = popTag(/\[w:(\d+)\]\s*/i);
      const maxWidth = wMatch ? parseInt(wMatch[1], 10) : undefined;

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
          size={sizeHint as 'xs' | 's' | 'm' | 'l'}
          align={alignHint}
          nobg={nobg}
          marginStyle={Object.keys(margins).length ? margins : undefined}
          maxWidth={maxWidth}
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
            <div className="rounded-t-lg bg-gray-200 px-4 py-1 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
              {lang}
            </div>
          )}
          <pre
            className={`overflow-x-auto bg-gray-100 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100 ${lang && lang !== 'plain text' ? 'rounded-b-lg' : 'rounded-lg'}`}
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
          {children && (
            <NotionRenderer
              blocks={children}
              imageColWidth={imageColWidth}
              noIndent={noIndent}
            />
          )}
        </blockquote>
      );

    case 'callout': {
      const icon = block.callout.icon;
      const calloutColor = block.callout.color;
      // Notion 내장 아이콘의 color 추출 (type === 'icon')
      const builtinIconColor: string | undefined =
        (icon as any)?.type === 'icon' ? (icon as any)?.icon?.color : undefined;
      // 배경: callout.color가 명시된 경우만 색상 적용, default는 흰 배경 + 테두리
      const bgClass =
        calloutColor !== 'default' && CALLOUT_BG[calloutColor]
          ? CALLOUT_BG[calloutColor]
          : 'bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700';
      let iconEl: React.ReactNode;
      if (icon?.type === 'emoji') {
        iconEl = <span className="text-xl leading-none">{icon.emoji}</span>;
      } else if (icon?.type === 'external') {
        iconEl = (
          <img
            src={icon.external.url}
            alt=""
            className="mt-0.5 h-5 w-5 object-contain"
          />
        );
      } else if (icon?.type === 'file') {
        iconEl = (
          <img
            src={icon.file.url}
            alt=""
            className="mt-0.5 h-5 w-5 object-contain"
          />
        );
      } else if ((icon as any)?.type === 'icon') {
        // Notion 내장 SVG 아이콘: 색상 적용한 ✳ 문자로 대체 표시
        const iconTextColor = builtinIconColor
          ? (CALLOUT_ICON_COLOR[builtinIconColor] ?? 'text-gray-500')
          : 'text-gray-500';
        iconEl = (
          <span className={`text-xl leading-none font-bold ${iconTextColor}`}>
            ✳
          </span>
        );
      } else {
        iconEl = <span className="text-xl leading-none">💡</span>;
      }
      return (
        <div className={`my-4 flex gap-3 rounded-lg p-4 ${bgClass}`}>
          <span className="shrink-0">{iconEl}</span>
          <div className="notion-callout-content flex-1 text-gray-700 dark:text-gray-300">
            <NotionRichText items={block.callout.rich_text} />
            {children && (
              <NotionRenderer
                blocks={children}
                imageColWidth={imageColWidth}
                noIndent={noIndent}
              />
            )}
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
              <NotionRenderer
                blocks={children}
                imageColWidth={imageColWidth}
                noIndent={noIndent}
              />
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
            // 단독 단락: "[col:2:3]" 또는 "[col:300px]" 형태
            const mExact = text.match(/^\[col:([^\]]+)\]\s*$/i);
            // 첫 줄 prefix: "[col:2:3]\n내용..." 형태 (Shift+Enter 소프트 줄바꿈)
            const mPrefix = !mExact
              ? text.match(/^\[col:([^\]]+)\][ \t]*\n/i)
              : null;
            const parseColRatio = (val: string) => {
              // "[col:300px]" → "300px 1fr" / "[col:2:3]" → "2fr 3fr"
              if (/^\d+px$/.test(val.trim())) return `${val.trim()} 1fr`;
              return val
                .split(':')
                .map((n: string) => `${n.trim()}fr`)
                .join(' ');
            };
            if (mExact) {
              colRatio = parseColRatio(mExact[1]);
              return { ...col, children: colChildren.slice(1) };
            } else if (mPrefix) {
              colRatio = parseColRatio(mPrefix[1]);
              // rich_text 앞에서 "[col:2:3]\n" 만큼 잘라냄
              const stripLen = mPrefix[0].length;
              const origRichText: any[] = firstBlock.paragraph.rich_text ?? [];
              let remaining = stripLen;
              const newRichText: any[] = [];
              for (const item of origRichText) {
                if (remaining <= 0) {
                  newRichText.push(item);
                  continue;
                }
                const content: string =
                  item.text?.content ?? item.plain_text ?? '';
                if (content.length <= remaining) {
                  remaining -= content.length;
                } else {
                  newRichText.push({
                    ...item,
                    plain_text: content.slice(remaining),
                    text: { ...item.text, content: content.slice(remaining) },
                  });
                  remaining = 0;
                }
              }
              const newFirstBlock = {
                ...firstBlock,
                paragraph: { ...firstBlock.paragraph, rich_text: newRichText },
              };
              return {
                ...col,
                children: [newFirstBlock, ...colChildren.slice(1)],
              };
            }
          }
        }
        return col;
      });

      // 첫 컬럼이 이미지+여백으로만 구성된 경우 → 고정 px 컬럼으로 레이아웃
      // 컨트롤 태그 [xs/s/m/l] 단락 또는 이미지 캡션으로 크기 지정 (기본 120px)
      const isControlTagPara = (b: any) => {
        if (b.type !== 'paragraph') return false;
        const text = (b.paragraph?.rich_text ?? [])
          .map((t: any) => t.plain_text)
          .join('');
        return /^\[(xs|s|m|l)\]\s*$/i.test(text);
      };
      const isEmptyPara = (b: any) => {
        if (b.type !== 'paragraph') return false;
        return (
          (b.paragraph?.rich_text ?? [])
            .map((t: any) => t.plain_text)
            .join('')
            .trim() === ''
        );
      };

      const firstColBlocks: any[] = processedChildren?.[0]
        ? ((processedChildren[0] as any).children ?? [])
        : [];
      const firstColImageBlocks = firstColBlocks.filter(
        (b: any) => b.type === 'image',
      );
      // 첫 컬럼이 이미지+공백+제어태그로만 구성된 2단 레이아웃
      const firstColIsImageCol =
        colCount === 2 &&
        firstColBlocks.length > 0 &&
        firstColImageBlocks.length > 0 &&
        firstColBlocks.every(
          (b: any) =>
            b.type === 'image' || isControlTagPara(b) || isEmptyPara(b),
        );

      // 사이즈 태그로 첫 컬럼 px 결정 (xs=64, s=120, m=200, l=280, 기본=480)
      const getFirstColWidth = (): number => {
        const controlPara = firstColBlocks.find(isControlTagPara);
        if (controlPara) {
          const t = (controlPara.paragraph?.rich_text ?? [])
            .map((x: any) => x.plain_text)
            .join('');
          if (/\[xs\]/i.test(t)) return 64;
          if (/\[s\]/i.test(t)) return 120;
          if (/\[m\]/i.test(t)) return 200;
          if (/\[l\]/i.test(t)) return 280;
        }
        for (const img of firstColImageBlocks) {
          const cap =
            img.image?.caption?.map((c: any) => c.plain_text).join('') ?? '';
          const pxMatch = cap.match(/\[(\d+)px\]/i);
          if (pxMatch) return parseInt(pxMatch[1], 10);
          if (/\[xs\]/i.test(cap)) return 64;
          if (/\[s\]/i.test(cap)) return 120;
          if (/\[m\]/i.test(cap)) return 200;
          if (/\[l\]/i.test(cap)) return 280;
        }
        return 480;
      };
      const firstColWidth = firstColIsImageCol ? getFirstColWidth() : undefined;

      // 모바일: 1단 세로 배치 / 데스크탑: 노션 원본 단 수 유지
      const colClass: Record<number, string> = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-4',
      };
      // 첫 컬럼 이미지 여부로만 판단 — imageColWidth는 크기 힌트로만 사용
      const resolvedIsImageCol = firstColIsImageCol;
      const resolvedWidth =
        firstColIsImageCol && imageColWidth !== undefined
          ? imageColWidth
          : (firstColWidth ?? 480);

      const PREDEFINED_COL_WIDTHS = new Set([
        64, 120, 200, 280, 300, 360, 480, 520, 600,
      ]);
      const imageColClass = (px: number) => {
        if (px === 64) return 'col-image-64';
        if (px === 200) return 'col-image-200';
        if (px === 280) return 'col-image-280';
        if (px === 300) return 'col-image-300';
        if (px === 360) return 'col-image-360';
        if (px === 480) return 'col-image-480';
        if (px === 520) return 'col-image-520';
        if (px === 600) return 'col-image-600';
        return null;
      };
      const resolvedImageColClass = resolvedIsImageCol
        ? imageColClass(resolvedWidth)
        : null;
      const useInlineImageCol =
        resolvedIsImageCol && !PREDEFINED_COL_WIDTHS.has(resolvedWidth);
      const gridClass = resolvedIsImageCol
        ? `grid-cols-1 ${resolvedImageColClass ?? 'col-image-120'}`
        : colRatio
          ? 'grid-cols-1 col-ratio-grid'
          : (colClass[colCount] ?? 'grid-cols-1 md:grid-cols-2');

      return (
        <div
          className={`my-4 overflow-x-hidden${resolvedIsImageCol ? 'pl-4' : ''}`}
        >
          <div
            className={`grid ${resolvedIsImageCol ? 'gap-x-8' : 'gap-x-4'} ${gridClass}`}
            style={
              useInlineImageCol
                ? ({
                    gridTemplateColumns: `${resolvedWidth}px 1fr`,
                  } as React.CSSProperties)
                : !resolvedIsImageCol && colRatio
                  ? ({ '--col-ratio': colRatio } as React.CSSProperties)
                  : undefined
            }
          >
            {processedChildren?.map((col, colIdx) => {
              const colChildren = (col as any).children;
              const blocksToRender =
                resolvedIsImageCol && colIdx === 0
                  ? colChildren?.filter(
                      (b: any) => !isControlTagPara(b) && !isEmptyPara(b),
                    )
                  : colChildren;
              const colDivClass =
                resolvedIsImageCol && colIdx === 0
                  ? 'min-w-0 [&_figure]:!w-full [&_figure]:!mx-0'
                  : 'min-w-0';
              return (
                <div key={col.id} className={colDivClass}>
                  {blocksToRender && (
                    <NotionRenderer
                      blocks={blocksToRender}
                      imageColWidth={imageColWidth}
                      noIndent={noIndent}
                    />
                  )}
                </div>
              );
            })}
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
          <table className="min-w-max border-collapse text-sm text-gray-800 dark:text-gray-200">
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
                          className={[
                            'border border-gray-200 p-2 text-left dark:border-neutral-600',
                            hasRowHeader && ci === 0
                              ? 'w-px bg-gray-50 font-semibold whitespace-nowrap dark:bg-neutral-700 dark:text-gray-100'
                              : '',
                          ]
                            .join(' ')
                            .trim()}
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
          {children && (
            <NotionRenderer
              blocks={children}
              imageColWidth={imageColWidth}
              noIndent={false}
            />
          )}
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

export function NotionRenderer({
  blocks,
  imageColWidth,
  noIndent,
}: {
  blocks: BlockObjectResponse[];
  imageColWidth?: number;
  noIndent?: boolean;
}) {
  const grouped = groupBlocks(blocks);
  let numberedListCounter = 0;

  const content = (
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
                      {listChildren && (
                        <NotionRenderer
                          blocks={listChildren}
                          imageColWidth={imageColWidth}
                          noIndent={false}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            );
          }
          if (item.type === 'numbered_list') {
            const startAt = numberedListCounter + 1;
            numberedListCounter += item.items.length;
            return (
              <ol
                key={i}
                start={startAt}
                className="my-4 list-decimal space-y-2 pl-6 text-gray-700 dark:text-gray-300"
              >
                {item.items.map((block) => {
                  const listChildren = (block as any).children as
                    | BlockObjectResponse[]
                    | undefined;
                  const richText = (block as any).numbered_list_item.rich_text;
                  const allBold =
                    richText.length > 0 &&
                    richText.every((t: any) => t.annotations.bold);
                  return (
                    <li key={block.id} className={allBold ? 'font-bold' : ''}>
                      <NotionRichText items={richText} />
                      {listChildren && (
                        <NotionRenderer
                          blocks={listChildren}
                          imageColWidth={imageColWidth}
                          noIndent={false}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            );
          }
        }
        const blockType = (item as BlockObjectResponse).type;
        if (
          blockType === 'heading_1' ||
          blockType === 'heading_2' ||
          blockType === 'heading_3'
        ) {
          numberedListCounter = 0;
        }

        return (
          <NotionBlock
            key={(item as BlockObjectResponse).id}
            block={item as BlockObjectResponse}
            imageColWidth={imageColWidth}
            noIndent={noIndent}
          />
        );
      })}
    </div>
  );

  return content;
}
