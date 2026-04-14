'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDoubleDownIcon } from '@/constants';

/* -------------------------------------------------------------------------------------------------
 * Animation timing constants (ms)
 * -----------------------------------------------------------------------------------------------*/
const STROKE_DURATION = 1600; // stroke draws over this many ms
const FILL_START = STROKE_DURATION * 0.6; // fill begins while stroke is still finishing
const FILL_DURATION = 1100; // fill reveals over this many ms

/* Block grid for rectangular fill reveal */
const COLS = 16;
const ROWS = 4;
const CELL_W = 75; // 1200 / 16 = 75
const CELL_H = 75; // 300  / 4  = 75

/* -------------------------------------------------------------------------------------------------
 * useAnimateText
 *
 * Time-based animation — plays automatically on mount.
 * Scroll is locked (overflow hidden + touchmove blocked) while the animation runs.
 * After the subtitle appears the lock is released and the scroll indicator shows.
 * -----------------------------------------------------------------------------------------------*/
const useAnimateText = () => {
  const strokeTextRef = useRef<SVGTextElement>(null);
  const fillTextRef = useRef<SVGTextElement>(null);
  const maskRectsRef = useRef<(SVGRectElement | null)[]>([]);
  const thresholdsRef = useRef<number[]>([]);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef(0);

  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(false);
  const [subtitleReady, setSubtitleReadyState] = useState(false);

  useEffect(() => {
    const initialDashOffset = 5000;
    const strokeEl = strokeTextRef.current;
    const wrapperEl = titleWrapperRef.current;
    if (!strokeEl || !wrapperEl) return;

    // Initialise block reveal thresholds — left(태) → right(리) + slight noise
    thresholdsRef.current = Array.from({ length: COLS * ROWS }, (_, i) => {
      const col = i % COLS;
      const base = col / (COLS - 1); // 0 = 왼쪽(태), 1 = 오른쪽(리)
      const noise = (Math.random() - 0.5) * 0.25;
      return Math.max(0, Math.min(1, base + noise));
    });

    const setAllBlocks = (visible: boolean) => {
      const fill = visible ? 'white' : 'black';
      maskRectsRef.current.forEach((r) => r?.setAttribute('fill', fill));
    };

    // Lock scroll by blocking events only — no CSS manipulation,
    // so fixed elements (Header, BottomNav) stay correctly positioned on all browsers.
    const preventWheel = (e: Event) => e.preventDefault();
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (
        [
          ' ',
          'ArrowDown',
          'ArrowUp',
          'PageDown',
          'PageUp',
          'Home',
          'End',
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventWheel, { passive: false });
    window.addEventListener('touchmove', preventTouch, { passive: false });
    window.addEventListener('keydown', preventKeys);

    const unlock = () => {
      window.removeEventListener('wheel', preventWheel);
      window.removeEventListener('touchmove', preventTouch);
      window.removeEventListener('keydown', preventKeys);
    };

    // Initial state — wrapper fully visible so stroke drawing is visible from the start
    wrapperEl.style.opacity = '1';
    strokeEl.style.strokeDashoffset = String(initialDashOffset);
    setAllBlocks(false);

    const startTime = performance.now();
    const TOTAL = FILL_START + FILL_DURATION;

    const tick = (now: number) => {
      const elapsed = now - startTime;

      // Phase 1: stroke draws
      const strokeP = Math.min(elapsed / STROKE_DURATION, 1);
      const strokeFill = Math.pow(strokeP, 1.5);

      // Phase 2: fill reveals block by block (starts while stroke is still finishing)
      const fillP = Math.min(
        Math.max(elapsed - FILL_START, 0) / FILL_DURATION,
        1,
      );
      const colorFill = Math.pow(fillP, 1.5);

      if (strokeTextRef.current) {
        strokeTextRef.current.style.strokeDashoffset = String(
          initialDashOffset * (1 - strokeFill),
        );
      }
      const thresholds = thresholdsRef.current;
      maskRectsRef.current.forEach((rect, i) => {
        rect?.setAttribute(
          'fill',
          thresholds[i] <= colorFill ? 'white' : 'black',
        );
      });

      if (elapsed < TOTAL) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Animation complete — unlock scroll, show subtitle
        unlock();
        setSubtitleReadyState(true);

        // Show indicator after subtitle finishes animating (0.2s delay + 0.8s duration)
        setTimeout(() => {
          setScrollIndicatorVisible(true);

          // Hide indicator once user scrolls away from hero
          const onScroll = () => {
            if (window.scrollY > 50) {
              setScrollIndicatorVisible(false);
              window.removeEventListener('scroll', onScroll);
            }
          };
          window.addEventListener('scroll', onScroll, { passive: true });
        }, 1000);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      unlock();
    };
  }, []);

  return {
    strokeTextRef,
    fillTextRef,
    maskRectsRef,
    titleWrapperRef,
    sectionRef,
    subtitleReady,
    scrollIndicatorVisible,
  };
};

/* -------------------------------------------------------------------------------------------------
 * MainSection
 * -----------------------------------------------------------------------------------------------*/
export function MainSection() {
  const {
    strokeTextRef,
    fillTextRef,
    maskRectsRef,
    titleWrapperRef,
    sectionRef,
    subtitleReady,
    scrollIndicatorVisible,
  } = useAnimateText();

  return (
    <section ref={sectionRef} className="relative h-svh">
      <div className="flex h-full flex-col items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="animate-blob-1 absolute top-0 -left-24 h-72 w-72 rounded-full bg-indigo-200 opacity-40 blur-3xl filter md:h-96 md:w-96 dark:bg-indigo-400 dark:opacity-[0.12]"></div>
          <div className="animate-blob-2 absolute top-0 -right-24 h-72 w-72 rounded-full bg-indigo-200 opacity-40 blur-3xl filter md:h-96 md:w-96 dark:bg-violet-400 dark:opacity-[0.10]"></div>
          <div className="animate-blob-3 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-fuchsia-200 opacity-40 blur-3xl filter md:h-96 md:w-96 dark:bg-fuchsia-400 dark:opacity-[0.10]"></div>
        </div>

        <div className="relative z-10 px-4">
          <div ref={titleWrapperRef}>
            <svg
              viewBox="0 0 1200 300"
              fontSize={200}
              className="title-svg mx-auto w-full max-w-xl md:max-w-[1152px]"
              aria-label="태피스토리"
              overflow="hidden"
            >
              <defs>
                {/* Rectangular block mask — each rect flips black->white independently */}
                <mask id="tapestory-block-mask">
                  {Array.from({ length: COLS * ROWS }, (_, i) => {
                    const col = i % COLS;
                    const row = Math.floor(i / COLS);
                    return (
                      <rect
                        key={i}
                        ref={(el) => {
                          maskRectsRef.current[i] = el;
                        }}
                        x={col * CELL_W}
                        y={row * CELL_H}
                        width={CELL_W}
                        height={CELL_H}
                        fill="black"
                      />
                    );
                  })}
                </mask>
              </defs>

              {/* Layer 1 (bottom): solid fill, revealed block-by-block via rect mask */}
              <text
                ref={fillTextRef}
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                mask="url(#tapestory-block-mask)"
                style={{
                  // eslint-disable-next-line quotes
                  fontFamily: "'Pretendard', sans-serif",
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  fill: '#a78bfa',
                  stroke: 'none',
                }}
              >
                태피스토리
              </text>

              {/* Layer 2 (top): stroke outline, drawn via dashoffset animation */}
              <text
                ref={strokeTextRef}
                className="title-stroke"
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
              >
                태피스토리
              </text>
            </svg>
          </div>

          <div className={subtitleReady ? 'animate-fade-in-up' : 'opacity-0'}>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              서비스 기획자 겸 PM 태피가
              <br className="sm:hidden" /> 엮어가는 성장 기록
              <br />
              솔직한 고민과 인사이트를 나눕니다.
            </p>
          </div>
        </div>

        <div
          className={`absolute bottom-20 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-1000 md:bottom-36 ${scrollIndicatorVisible ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        >
          <div className="animate-bounce-slow text-indigo-300 dark:text-indigo-300">
            <ChevronDoubleDownIcon className="mx-auto h-12 w-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
