'use client';

import { useEffect, useRef, useState } from 'react';

export function PdfViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const pdf = await pdfjsLib.getDocument(src).promise;
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.display = 'block';

          await page.render({ canvasContext: ctx, viewport }).promise;

          if (!cancelled && containerRef.current) {
            containerRef.current.appendChild(canvas);

            // 첫 페이지 렌더 후 실제 표시 높이로 컨테이너 높이 고정
            if (pageNum === 1) {
              const h = canvas.getBoundingClientRect().height;
              if (h > 0) wrapperRef.current!.style.height = `${h}px`;
            }
          }
        }

        if (!cancelled) setStatus('done');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    render();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
      {status === 'loading' && (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          PDF 불러오는 중…
        </div>
      )}
      {status === 'error' && (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          PDF를 불러올 수 없습니다
        </div>
      )}
      <div ref={wrapperRef} className="overflow-y-auto">
        <div ref={containerRef} />
      </div>
    </div>
  );
}
