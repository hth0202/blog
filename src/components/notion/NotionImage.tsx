'use client';

import Image from 'next/image';
import { useState } from 'react';

interface NotionImageProps {
  src: string;
  alt: string;
  caption?: string;
  widthStyle: string;
}

export function NotionImage({ src, alt, caption, widthStyle }: NotionImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      className="my-6 flex flex-col items-center"
      style={{ width: widthStyle, margin: '1.5rem auto' }}
    >
      {/* width/height=0 + h-auto w-full: 크기 불명 이미지를 반응형으로 표시하는 Next.js 관용구 */}
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px"
        className="h-auto w-full rounded-lg transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
