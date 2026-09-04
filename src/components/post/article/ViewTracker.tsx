'use client';

import { useEffect } from 'react';

const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24시간

export function ViewTracker({
  postId,
  secret,
}: {
  postId: string;
  secret?: string;
}) {
  useEffect(() => {
    const url = secret
      ? `/api/views/${postId}?secret=${secret}`
      : `/api/views/${postId}`;

    try {
      const key = `viewed_at_${postId}`;
      const lastViewed = Number(localStorage.getItem(key) || 0);
      const now = Date.now();

      if (now - lastViewed < VIEW_COOLDOWN_MS) return;

      localStorage.setItem(key, String(now));

      fetch(url, { method: 'POST' }).catch(() => {});
    } catch {
      // localStorage 접근 불가 환경 (Safari 사생활 보호 모드 등)
      fetch(url, { method: 'POST' }).catch(() => {});
    }
  }, [postId, secret]);

  return null;
}
