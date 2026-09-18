import { highlightCode } from '@/lib/highlight-code';

import { NotionRichText } from './NotionRichText';

import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

export async function CodeBlock({
  language,
  richText,
  caption,
}: {
  language: string;
  richText: RichTextItemResponse[];
  caption: RichTextItemResponse[];
}) {
  const hasLangLabel = language && language !== 'plain text';
  const code = richText.map((t) => t.plain_text).join('');
  const html = await highlightCode(
    code,
    language,
    hasLangLabel ? 'rounded-b-lg' : 'rounded-lg',
  );

  return (
    <div className="my-4">
      {hasLangLabel && (
        <div className="rounded-t-lg bg-gray-200 px-4 py-1 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
          {language}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {caption?.length > 0 && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <NotionRichText items={caption} />
        </p>
      )}
    </div>
  );
}
