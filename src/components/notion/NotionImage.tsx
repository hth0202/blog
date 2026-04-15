'use client';

import Image from 'next/image';
import { useState } from 'react';

interface NotionImageProps {
  src: string;
  alt: string;
  caption?: string;
  widthStyle: string;
  align?: 'left' | 'mid' | 'right';
}

const ALIGN_STYLE: Record<
  'left' | 'mid' | 'right',
  { margin: string; alignItems: string; textAlign: string }
> = {
  left: { margin: '1.5rem 0',              alignItems: 'flex-start', textAlign: 'left' },
  mid:  { margin: '1.5rem auto',           alignItems: 'center',     textAlign: 'center' },
  right:{ margin: '1.5rem 0 1.5rem auto',  alignItems: 'flex-end',   textAlign: 'right' },
};

export function NotionImage({
  src,
  alt,
  caption,
  widthStyle,
  align = 'mid',
}: NotionImageProps) {
  const [loaded, setLoaded] = useState(false);
  const { margin, alignItems, textAlign } = ALIGN_STYLE[align];

  return (
    <figure
      className="my-6 flex flex-col"
      style={{ width: widthStyle, margin, alignItems }}
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
        <figcaption
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          style={{ textAlign }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
