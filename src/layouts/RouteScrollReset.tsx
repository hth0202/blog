'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 트랙패드/터치 관성 스크롤이 라우트 전환 이후까지 이어져 새 페이지가
// 중간 지점에서 시작된 것처럼 보이는 문제를 막기 위해, 경로가 바뀔 때마다
// 잠깐 동안 매 프레임 스크롤을 최상단으로 스냅시켜 관성을 상쇄한다.
// 데스크탑에서는 overflow를 건드리지 않아 스크롤바 유무로 인한 레이아웃
// 흔들림이 없다. 다만 iOS 등 터치 기기의 관성 스크롤은 네이티브
// 컴포지터가 처리하기 때문에 scrollTo 호출만으로는 멈추지 않는 경우가
// 있어, 터치 기기에서만 락 구간 동안 overflow를 hidden으로 바꿔 진행 중인
// 네이티브 스크롤을 강제로 끊는다(모바일 스크롤바는 오버레이 방식이라
// 레이아웃 폭에 영향이 없어 흔들림 걱정이 없다).
const LOCK_DURATION_MS = 350;

export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;
    const prevOverflow = html.style.overflow;
    if (isTouch) {
      html.style.overflow = 'hidden';
    }

    const restore = () => {
      html.style.scrollBehavior = prevScrollBehavior;
      if (isTouch) {
        html.style.overflow = prevOverflow;
      }
    };

    const start = performance.now();
    let frame = requestAnimationFrame(function snap(now) {
      window.scrollTo(0, 0);
      if (now - start < LOCK_DURATION_MS) {
        frame = requestAnimationFrame(snap);
      } else {
        restore();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      restore();
    };
  }, [pathname]);

  return null;
}
