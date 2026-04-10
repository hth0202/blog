'use client';

import { useEffect } from 'react';

const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24시간

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `viewed_at_${postId}`;
    const lastViewed = Number(localStorage.getItem(key) || 0);
    const now = Date.now();

    if (now - lastViewed < VIEW_COOLDOWN_MS) return;

    localStorage.setItem(key, String(now));

    fetch(`/api/views/${postId}`, { method: 'POST' }).catch(() => {});
  }, [postId]);

  return null;
}
