'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        페이지를 불러올 수 없습니다
      </h2>
      <p className="mb-6 text-gray-500 dark:text-gray-400">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
      >
        다시 시도
      </button>
    </div>
  );
}
