'use client';

import { useState } from 'react';

import { ShareIcon } from '@/constants';

export function ShareButton({ title }: { title: string }) {
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
      className="flex items-center gap-2 rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-800"
    >
      <ShareIcon className="h-5 w-5" />
      <span>{copied ? '복사됨!' : '공유하기'}</span>
    </button>
  );
}
