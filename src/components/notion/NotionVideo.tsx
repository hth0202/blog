'use client';

import { useEffect, useRef, useState } from 'react';

import type { ReactNode } from 'react';

interface NotionVideoProps {
  src: string;
  caption?: ReactNode;
}

// 뷰포트에 들어오기 전까지 video src를 마운트하지 않음 → 화면 밖 영상이
// 페이지 로드 시점에 한꺼번에 네트워크를 점유하는 것을 방지
export function NotionVideo({ src, caption }: NotionVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={containerRef} className="my-6 flex w-full flex-col items-center">
      {visible ? (
        <video
          src={src}
          controls
          preload="metadata"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="w-full rounded-lg"
        />
      ) : (
        <div className="aspect-video w-full animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-700" />
      )}
      {caption}
    </figure>
  );
}
