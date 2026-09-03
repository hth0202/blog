'use client';

import { useEffect, useState } from 'react';

import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';

const VIDEO_URL =
  'https://smj572sovmyqzr0p.public.blob.vercel-storage.com/260903-video.mp4';
const END_IMAGE_URL = '/260903/end.png';

export function PageContent() {
  const [ended, setEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:flex-row dark:bg-[#1a1a1a]">
      <div className="relative flex min-h-0 flex-[3] items-center justify-center bg-black md:aspect-[9/16] md:flex-none">
        {VIDEO_URL ? (
          <>
            <video
              src={VIDEO_URL}
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              playsInline
              preload="metadata"
              onEnded={() => {
                setEnded(true);
                setIsPlaying(false);
              }}
              onPlay={() => {
                setEnded(false);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              className={`h-full w-full object-contain transition-opacity duration-700 ease-in-out ${
                ended ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {!isPlaying && !ended && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg sm:h-16 sm:w-16">
                  <Play size={26} className="ml-1 fill-gray-900 text-gray-900" />
                </div>
              </div>
            )}
            <Image
              src={END_IMAGE_URL}
              alt="완료 화면"
              fill
              className={`pointer-events-none object-contain transition-opacity duration-700 ease-in-out ${
                ended ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <p className="text-sm text-gray-400">영상 준비 중입니다</p>
        )}
      </div>

      <div className="flex min-h-0 flex-[2] flex-col justify-start gap-4 px-6 pt-10 pb-6 sm:px-10 sm:pt-14 md:flex-1 md:justify-center md:gap-6 md:px-12 md:pt-0 md:pb-[18vh]">
        <h1 className="flex flex-col gap-1 text-3xl leading-tight font-bold tracking-[-0.02em] sm:text-5xl">
          <span className="flex flex-wrap items-end gap-2">
            <span className="rounded-md border-4 border-white bg-[#1E84FF] px-2.5 py-0 font-black text-white">
              진짜
            </span>
            <span className="text-[#18BB68]">하는 기획자</span>
          </span>
          <span>
            <span className="text-[#FDA313]">한태희</span>
            <span className="text-[#F95F65]">입니다</span>
          </span>
        </h1>

        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg md:mt-6 dark:text-gray-300">
          다음과 함께 하고 싶은 마음을 담아 기획과 편집은 직접, 제작은 AI로
          한 자기소개 영상이에요.
          <br />
          저에 대해 더 자세한 이야기는 아래 블로그에서 확인하실 수 있어요.
        </p>

        <a
          href="https://taffy-story.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-indigo-700 md:mt-4 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          taffy-story.com
          <ExternalLink size={17} className="shrink-0" />
        </a>
      </div>
    </div>
  );
}
