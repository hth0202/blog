'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 트랙패드 관성 스크롤이 라우트 전환 이후까지 이어져 새 페이지가
// 중간 지점에서 시작된 것처럼 보이는 문제를 막기 위해, 경로가 바뀔 때마다
// 잠깐 동안 매 프레임 스크롤을 최상단으로 스냅시켜 관성을 상쇄한다.
// overflow를 건드리지 않아 스크롤바 유무로 인한 레이아웃 흔들림이 없다.
const LOCK_DURATION_MS = 350;

export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    const start = performance.now();
    let frame = requestAnimationFrame(function snap(now) {
      window.scrollTo(0, 0);
      if (now - start < LOCK_DURATION_MS) {
        frame = requestAnimationFrame(snap);
      } else {
        html.style.scrollBehavior = prevScrollBehavior;
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      html.style.scrollBehavior = prevScrollBehavior;
    };
  }, [pathname]);

  return null;
}
