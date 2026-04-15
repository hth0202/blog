import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

// 텍스트 색상 (Tailwind 클래스)
const TEXT_COLOR: Record<string, string> = {
  gray: 'text-gray-500 dark:text-gray-400',
  brown: 'text-amber-700 dark:text-amber-500',
  orange: 'text-orange-500',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  green: 'text-green-600 dark:text-green-400',
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
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

/** \n이 포함된 텍스트를 <br>로 분리해 렌더링 */
function renderWithLineBreaks(text: string, className?: string) {
  const parts = text.split('\n');
  return parts.map((part, idx) => (
    <span key={idx} className={className}>
      {part}
      {idx < parts.length - 1 && <br />}
    </span>
  ));
}

export function NotionRichText({ items }: { items: RichTextItemResponse[] }) {
  return (
    <>
      {items.map((item, i) => {
        const { bold, italic, strikethrough, underline, code, color } =
          item.annotations;
        const text = item.plain_text;
        const href = item.href;

        const isBgColor = color.endsWith('_background');
        const bgClass = isBgColor ? (BG_CLASS[color] ?? '') : '';
        const textColorClass =
          !isBgColor && color !== 'default' ? (TEXT_COLOR[color] ?? '') : '';

        if (code) {
          return (
            <code
              key={i}
              className={`rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-indigo-600 dark:bg-neutral-800 dark:text-indigo-400 ${textColorClass}`}
            >
              {text}
            </code>
          );
        }

        const spanClasses = [
          bold ? 'font-bold' : '',
          italic ? 'italic' : '',
          strikethrough ? 'line-through' : '',
          underline ? 'underline' : '',
          textColorClass,
          bgClass,
        ]
          .filter(Boolean)
          .join(' ');

        if (href) {
          return (
            <a
              key={i}
              href={href}
              className={`underline hover:text-indigo-600 dark:hover:text-indigo-400 ${spanClasses}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {renderWithLineBreaks(text)}
            </a>
          );
        }

        return <span key={i}>{renderWithLineBreaks(text, spanClasses || undefined)}</span>;
      })}
    </>
  );
}
