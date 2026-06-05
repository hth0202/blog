'use client';

import dynamic from 'next/dynamic';

const PdfViewer = dynamic(
  () => import('./PdfViewer').then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="my-4 flex h-40 items-center justify-center rounded-lg border border-gray-200 text-sm text-gray-400 dark:border-neutral-700">
        PDF 불러오는 중…
      </div>
    ),
  },
);

export function PdfViewerLoader({ src }: { src: string }) {
  return <PdfViewer src={src} />;
}
