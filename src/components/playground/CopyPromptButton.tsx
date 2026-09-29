'use client';

import { Copy, Eye } from 'lucide-react';
import { useState } from 'react';

export function CopyPromptButton({
  imageId,
  prompt,
  initialCopies,
  card = false,
  showCount = true,
  views,
}: {
  imageId: string;
  prompt: string;
  initialCopies: number;
  card?: boolean;
  showCount?: boolean;
  views?: number;
}) {
  const [copies, setCopies] = useState(initialCopies);
  const [message, setMessage] = useState('');

  if (!prompt) return null;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      setMessage('복사 실패');
      window.setTimeout(() => setMessage(''), 2000);
      return;
    }

    setMessage('복사됨');
    try {
      const response = await fetch(`/api/playground/${imageId}/copy`, {
        method: 'POST',
      });
      if (response.ok) {
        const result = (await response.json()) as { copies: number };
        setCopies(result.copies);
      }
    } catch {
      // 클립보드 복사는 끝났으므로 복사수 저장 실패를 사용자에게 표시하지 않습니다.
    }
    window.setTimeout(() => setMessage(''), 2000);
  };

  return (
    <>
      {card && (
        <div className="pointer-events-none absolute top-3 left-3 hidden gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 pointer-fine:flex">
          {views !== undefined && (
            <span
              className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur-sm"
              aria-label={`조회수 ${views}회`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {views}
            </span>
          )}
          {showCount && (
            <span
              className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs text-white backdrop-blur-sm"
              aria-label={`프롬프트 복사 ${copies}회`}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              {copies}
            </span>
          )}
        </div>
      )}
      {showCount && !card && (
        <span
          className="inline-flex items-center gap-1 px-1 py-1 text-sm text-gray-500 dark:text-gray-400"
          aria-label={`프롬프트 복사 ${copies}회`}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copies}
        </span>
      )}
      <button
        type="button"
        onClick={copyPrompt}
        className={
          card
            ? 'absolute right-3 bottom-3 hidden items-center gap-1 rounded-full bg-black/45 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-[opacity,background-color] group-hover:opacity-100 hover:bg-black/60 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 pointer-fine:flex'
            : 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-gray-300 dark:hover:text-indigo-300'
        }
        aria-label={message || '프롬프트 복사'}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{message || (card ? '프롬프트 복사' : '복사')}</span>
      </button>
    </>
  );
}
