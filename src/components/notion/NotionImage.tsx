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
  maxWidth?: number;
  // 로컬 정적 파일처럼 실제 크기를 아는 이미지에만 지정 — Next.js 압축 최적화 적용
  intrinsicSize?: { width: number; height: number };
  // 최초 화면에 바로 보이는 이미지에만 지정 — lazy load 대기 없이 즉시 프리로드
  priority?: boolean;
}

// 모바일 → 데스크탑 반응형 너비
const SIZE_CLASS: Record<'xs' | 's' | 'm' | 'l', string> = {
  xs: 'w-full md:w-[20%]',
  s: 'w-full md:w-[40%]',
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
  maxWidth,
  intrinsicSize,
  priority,
}: NotionImageProps) {
  const [loaded, setLoaded] = useState(false);
  const { figure: figureClass, caption: captionClass } = ALIGN_CLASS[align];

  return (
    <figure
      className={`my-6 flex flex-col ${SIZE_CLASS[size]} ${figureClass}`}
      style={{
        ...marginStyle,
        ...(maxWidth ? { maxWidth: `${maxWidth}px` } : {}),
      }}
    >
      {/* 로딩 중 skeleton — 이미지가 보이지 않아 독자가 그냥 지나치는 것을 방지 */}
      <div className={`relative w-full ${!loaded ? 'min-h-[200px]' : ''}`}>
        {!loaded && (
          <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-700" />
        )}
        {/* width/height=0 + h-auto w-full: 크기 불명 이미지를 반응형으로 표시하는 Next.js 관용구 */}
        <Image
          src={src}
          alt={alt}
          width={intrinsicSize?.width ?? 0}
          height={intrinsicSize?.height ?? 0}
          unoptimized={!intrinsicSize}
          priority={priority}
          // sizes 없으면 Next가 "화면 전체 너비"로 가정해 불필요하게 큰(최대 3840px) 변형을 생성함 —
          // 이 컴포넌트가 쓰이는 영역은 실제로 그렇게 넓게 표시된 적이 없어 상한을 낮게 고정
          sizes={intrinsicSize ? '(min-width: 768px) 500px, 100vw' : undefined}
          className={[
            'h-auto w-full rounded-lg transition-opacity duration-300',
            nobg ? 'mix-blend-multiply dark:mix-blend-normal' : '',
          ]
            .join(' ')
            .trim()}
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
        />
      </div>
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
