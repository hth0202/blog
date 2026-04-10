import { NotionRichText } from './NotionRichText';
import { SkillCollectionServer } from './SkillCollectionServer';

import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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
    case 'paragraph':
      if (!block.paragraph.rich_text.length) return <br />;
      return (
        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          <NotionRichText items={block.paragraph.rich_text} />
        </p>
      );

    case 'heading_1':
      return (
        <h1 className="mt-10 mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          <NotionRichText items={block.heading_1.rich_text} />
        </h1>
      );

    case 'heading_2':
      return (
        <h2 className="mt-8 mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
          <NotionRichText items={block.heading_2.rich_text} />
        </h2>
      );

    case 'heading_3':
      return (
        <h3 className="mt-6 mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
          <NotionRichText items={block.heading_3.rich_text} />
        </h3>
      );

    case 'image': {
      const imgSrc =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url;
      const caption = block.image.caption;
      const captionText = caption?.map((c) => c.plain_text).join('') || '';

      // 캡션 앞의 [small] / [medium] / [large] 힌트로 크기 제어
      const sizeMatch = captionText.match(/^\[(small|medium|large)\]\s*/i);
      const sizeHint = sizeMatch ? sizeMatch[1].toLowerCase() : 'large';
      const displayCaption = sizeMatch
        ? captionText.slice(sizeMatch[0].length)
        : captionText;
      const widthStyle =
        sizeHint === 'small' ? '33%' : sizeHint === 'medium' ? '60%' : '100%';

      return (
        <figure
          className="my-6 flex flex-col items-center"
          style={{ width: widthStyle, margin: '1.5rem auto' }}
        >
          <img
            src={imgSrc}
            alt={displayCaption}
            className="w-full rounded-lg"
          />
          {displayCaption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {displayCaption}
            </figcaption>
          )}
        </figure>
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

    case 'column_list':
      return (
        <div
          className="my-4 grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${children?.length || 2}, 1fr)`,
          }}
        >
          {children?.map((col) => (
            <div key={col.id}>
              {(col as any).children && (
                <NotionRenderer blocks={(col as any).children} />
              )}
            </div>
          ))}
        </div>
      );

    case 'column':
      // column은 column_list 안에서 처리됨
      return null;

    case 'table': {
      if (!children) return null;
      const hasColumnHeader = block.table.has_column_header;
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm text-gray-800 dark:text-gray-200">
            <tbody>
              {children.map((row, idx) => {
                if (row.type !== 'table_row') return null;
                const cells = row.table_row.cells;
                return (
                  <tr
                    key={row.id}
                    className={
                      hasColumnHeader && idx === 0
                        ? 'bg-gray-50 font-semibold dark:bg-neutral-700 dark:text-gray-100'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-800/40'
                    }
                  >
                    {cells.map((cell, ci) => {
                      const Tag = hasColumnHeader && idx === 0 ? 'th' : 'td';
                      return (
                        <Tag
                          key={ci}
                          className="border border-gray-200 p-2 text-left dark:border-neutral-600"
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

    default:
      return null;
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
