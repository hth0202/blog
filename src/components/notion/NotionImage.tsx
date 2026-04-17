'use client';

import Image from 'next/image';
import { type CSSProperties, useState } from 'react';

interface NotionImageProps {
  src: string;
  alt: string;
  caption?: string;
  size?: 'xs' | 's' | 'm' | 'l';
  align?: 'left' | 'mid' | 'right';
  nobg?: boolean;
  marginStyle?: CSSProperties;
}

// 모바일 → 데스크탑 반응형 너비
const SIZE_CLASS: Record<'xs' | 's' | 'm' | 'l', string> = {
  xs: 'w-1/3 md:w-1/6',
  s: 'w-3/5 md:w-1/3',
  m: 'w-full md:w-[60%]',
  l: 'w-full',
};

const ALIGN_CLASS: Record<
  'left' | 'mid' | 'right',
  { figure: string; caption: string }
> = {
  left: { figure: 'items-start mr-auto', caption: 'text-left' },
  mid: { figure: 'items-center mx-auto', caption: 'text-center' },
  right: { figure: 'items-end ml-auto', caption: 'text-right' },
};

export function NotionImage({
  src,
  alt,
  caption,
  size = 'l',
  align = 'mid',
  nobg = false,
  marginStyle,
}: NotionImageProps) {
  const [loaded, setLoaded] = useState(false);
  const { figure: figureClass, caption: captionClass } = ALIGN_CLASS[align];

  return (
    <figure
      className={`my-6 flex flex-col ${SIZE_CLASS[size]} ${figureClass}`}
      style={marginStyle}
    >
      {/* width/height=0 + h-auto w-full: 크기 불명 이미지를 반응형으로 표시하는 Next.js 관용구 */}
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px"
        className={[
          'h-auto w-full rounded-lg transition-opacity duration-500',
          nobg ? 'mix-blend-multiply dark:mix-blend-normal' : '',
        ]
          .join(' ')
          .trim()}
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
      />
      {caption && (
        <figcaption
          className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${captionClass}`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
