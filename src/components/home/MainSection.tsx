'use client';

import { useEffect, useRef, useState } from 'react';
import { useBoolean } from 'usehooks-ts';

import { ChevronDoubleDownIcon } from '@/constants';

/* -------------------------------------------------------------------------------------------------
 * useAnimateText : 메인 페이지에서 타이틀 애니메이션을 다루는 훅
 * -----------------------------------------------------------------------------------------------*/
const useAnimateText = () => {
  const textRef = useRef<SVGTextElement>(null);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);
  const {
    value: animationComplete,
    setTrue: setAnimationComplete,
    setFalse: setAnimationUncomplete,
  } = useBoolean(false);

  useEffect(() => {
    const animationTriggerScroll = 450; // Animation completes over this scroll distance
    const initialDashOffset = 4000;
    const textEl = textRef.current;
    if (!textEl) return;

    // Set initial state
    textEl.style.strokeDashoffset = String(initialDashOffset);

    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Scroll indicator logic
      if (scrollTop > 50 && scrollIndicatorVisible) {
        setScrollIndicatorVisible(false);
      } else if (scrollTop <= 50 && !scrollIndicatorVisible) {
        setScrollIndicatorVisible(true);
      }

      // Calculate raw progress (0 to 1)
      const rawProgress = Math.min(scrollTop / animationTriggerScroll, 1);

      // Apply a cubic ease-in function: starts slow, accelerates towards the end
      const easedProgress = Math.pow(rawProgress, 3);

      const newDashOffset =
        initialDashOffset - initialDashOffset * easedProgress;

      requestAnimationFrame(() => {
        if (textRef.current) {
          textRef.current.style.strokeDashoffset = String(newDashOffset);
        }
      });

      const isComplete = rawProgress >= 1;
      if (isComplete !== animationComplete) {
        isComplete ? setAnimationComplete() : setAnimationUncomplete();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check in case of reload

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [animationComplete, scrollIndicatorVisible]);

  return { textRef, animationComplete, scrollIndicatorVisible };
};

/* -------------------------------------------------------------------------------------------------
 * MainSection
 * -----------------------------------------------------------------------------------------------*/
export function MainSection() {
  const { textRef, animationComplete, scrollIndicatorVisible } =
    useAnimateText();

  return (
    <section className="relative h-[1550px]">
      {/* Sticky container for the hero content */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <div className="animate-blob-1 absolute top-0 -left-24 h-72 w-72 rounded-full bg-indigo-200 opacity-40 blur-3xl filter md:h-96 md:w-96 dark:bg-indigo-900/50"></div>
          <div className="animate-blob-2 absolute top-0 -right-24 h-72 w-72 rounded-full bg-indigo-200 opacity-40 blur-3xl filter md:h-96 md:w-96 dark:bg-indigo-900/50"></div>
          <div className="animate-blob-3 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-fuchsia-200 opacity-40 blur-3xl filter md:h-96 md:w-96 dark:bg-fuchsia-900/50"></div>
        </div>

        <div className="relative z-10 px-4">
          <div className="animate-fade-in" style={{ opacity: 1 }}>
            <svg
              viewBox="0 0 1200 300"
              className="title-svg mx-auto w-full max-w-xl md:max-w-6xl"
              aria-label="태피스토리"
            >
              <text
                ref={textRef}
                className={`title-stroke ${animationComplete ? 'filled' : ''}`}
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
              >
                태피스토리
              </text>
            </svg>
          </div>
          <div
            className={animationComplete ? 'animate-fade-in-up' : 'opacity-0'}
          >
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              서비스 기획자 겸 PM 태피가 엮어가는 성장 기록
              <br />
              솔직한 고민과 인사이트를 나눕니다.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-20 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-500 ${scrollIndicatorVisible ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        >
          <div className="animate-bounce-slow text-indigo-400 dark:text-indigo-300">
            <ChevronDoubleDownIcon className="mx-auto h-12 w-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
