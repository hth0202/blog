import React from 'react';

import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

// 텍스트 색상 (Tailwind 클래스)
const TEXT_COLOR: Record<string, string> = {
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

// 배경 색상 → globals.css .n-bg-* 클래스 (light/dark 대응)
const BG_CLASS: Record<string, string> = {
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

/** \n이 포함된 텍스트를 <br>로 분리해 렌더링, 줄 앞 공백은 nbsp로 변환 */
function renderWithLineBreaks(text: string, className?: string) {
  const parts = text.split('\n');
  return parts.map((part, idx) => {
    const leading = part.match(/^( +)/)?.[1] ?? '';
    const rest = part.slice(leading.length);
    const nbsp = '\u00A0'.repeat(leading.length);
    const hasBr = idx < parts.length - 1;

    // 내용 없는 파트는 span 없이 <br>만 렌더링 (배경색 박스 방지)
    if (!leading && !rest) {
      return hasBr ? <br key={idx} /> : null;
    }

    if (!className) {
      return (
        <React.Fragment key={idx}>
          {nbsp}
          {rest}
          {hasBr && <br />}
        </React.Fragment>
      );
    }

    return (
      <span key={idx} className={className}>
        {nbsp}
        {rest}
        {hasBr && <br />}
      </span>
    );
  });
}

/** 단일 RichTextItemResponse를 렌더링 (plain_text 교체 가능) */
function renderItem(
  item: RichTextItemResponse,
  key: string | number,
  overrideText?: string,
): React.ReactNode {
  const { bold, italic, strikethrough, underline, code, color } =
    item.annotations;
  const text = overrideText ?? item.plain_text;
  const href = item.href;

  // 완전히 빈 텍스트는 렌더링 생략 (배경색 박스 방지)
  if (!text) return null;

  const isBgColor = color.endsWith('_background');
  const bgClass = isBgColor ? (BG_CLASS[color] ?? '') : '';
  const textColorClass =
    !isBgColor && color !== 'default' ? (TEXT_COLOR[color] ?? '') : '';

  if (code) {
    return (
      <code
        key={key}
        className={`rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400 ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''} ${textColorClass}`}
      >
        {text}
      </code>
    );
  }

  const spanClasses = [
    bold ? 'font-bold' : '',
    italic ? 'italic' : '',
    strikethrough ? 'line-through' : '',
    underline ? 'notion-underline' : '',
    textColorClass,
    bgClass,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a
        key={key}
        href={href}
        className={`underline hover:text-indigo-600 dark:hover:text-indigo-400 ${spanClasses}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {renderWithLineBreaks(text)}
      </a>
    );
  }

  return (
    <span key={key} className={spanClasses || undefined}>
      {renderWithLineBreaks(text, spanClasses || undefined)}
    </span>
  );
}

export function NotionRichText({ items }: { items: RichTextItemResponse[] }) {
  const nodes: React.ReactNode[] = [];

  // 전체 텍스트에서 " | " 위치 탐색 (item 경계 무관)
  const combined = items.map((i) => i.plain_text).join('');
  const pipePositions: number[] = [];
  let searchFrom = 0;
  while (true) {
    const idx = combined.indexOf(' | ', searchFrom);
    if (idx === -1) break;
    pipePositions.push(idx);
    searchFrom = idx + 3;
  }

  if (pipePositions.length === 0) {
    // 파이프 없음 — 기존 렌더링
    items.forEach((item, i) => nodes.push(renderItem(item, i)));
    return <>{nodes}</>;
  }

  // 분할 지점 계산
  const cutSet = new Set([0, combined.length]);
  for (const ps of pipePositions) {
    cutSet.add(ps);
    cutSet.add(ps + 3);
  }
  const cuts = [...cutSet].sort((a, b) => a - b);

  // 각 item의 [시작, 끝] 오프셋
  const itemOffsets: [number, number][] = [];
  let off = 0;
  for (const item of items) {
    itemOffsets.push([off, off + item.plain_text.length]);
    off += item.plain_text.length;
  }

  // 세그먼트별 렌더링
  let key = 0;
  for (let si = 0; si < cuts.length - 1; si++) {
    const segStart = cuts[si];
    const segEnd = cuts[si + 1];
    const segText = combined.slice(segStart, segEnd);
    if (!segText) continue;

    if (segText === ' | ') {
      nodes.push(
        <React.Fragment key={`pipe-${key++}`}>
          <span className="hidden md:inline"> | </span>
          <br className="md:hidden" aria-hidden="true" />
        </React.Fragment>,
      );
      continue;
    }

    // 이 세그먼트를 덮는 item(들) 찾아 렌더링
    for (let ii = 0; ii < items.length; ii++) {
      const [iStart, iEnd] = itemOffsets[ii];
      if (iEnd <= segStart || iStart >= segEnd) continue;
      const overlapText = combined.slice(
        Math.max(iStart, segStart),
        Math.min(iEnd, segEnd),
      );
      if (!overlapText) continue;
      nodes.push(renderItem(items[ii], key++, overlapText));
    }
  }

  return <>{nodes}</>;
}
