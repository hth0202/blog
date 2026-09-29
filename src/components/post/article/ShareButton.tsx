'use client';

import { useState } from 'react';

import { ShareIcon } from '@/constants';

export function ShareButton({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 사용자가 취소한 경우 무시
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center rounded-md border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-800 ${compact ? 'gap-1.5 px-3 py-1.5 text-sm' : 'gap-2 px-6 py-2'}`}
    >
      <ShareIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      <span>{copied ? '복사됨!' : '공유하기'}</span>
    </button>
  );
}
