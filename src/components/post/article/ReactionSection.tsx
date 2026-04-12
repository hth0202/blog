'use client';

import { useState, useEffect, useRef } from 'react';

import { HeartIcon, HeartIconFilled } from '@/constants';

interface ReactionSectionProps {
  postId: string;
  initialLikes: number;
}

export function ReactionSection({
  postId,
  initialLikes,
}: ReactionSectionProps) {
  const [hasReacted, setHasReacted] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const pendingRef = useRef(false);

  useEffect(() => {
    try {
      const reactedPosts: string[] = JSON.parse(
        localStorage.getItem('reacted_posts') || '[]',
      );
      setHasReacted(reactedPosts.includes(postId));
    } catch {
      // localStorage 접근 불가 환경 (Safari 사생활 보호 모드 등)
    }
  }, [postId]);

  const handleReactionClick = () => {
    if (pendingRef.current) return;

    const action = hasReacted ? 'remove' : 'add';
    const nextReacted = !hasReacted;
    const nextLikes = action === 'add' ? likes + 1 : Math.max(0, likes - 1);

    // 롤백용으로 현재 값 캡처 (stale closure 방지)
    const prevReacted = hasReacted;
    const prevLikes = likes;

    // 즉시 UI 반영
    setHasReacted(nextReacted);
    setLikes(nextLikes);

    // localStorage 즉시 반영
    let reactedPosts: string[] = [];
    try {
      reactedPosts = JSON.parse(localStorage.getItem('reacted_posts') || '[]');
      const updated =
        action === 'add'
          ? [...reactedPosts, postId]
          : reactedPosts.filter((id) => id !== postId);
      localStorage.setItem('reacted_posts', JSON.stringify(updated));
    } catch {
      // localStorage 접근 불가 환경 무시
    }

    // 백그라운드로 API 호출 (UI 블로킹 없음)
    pendingRef.current = true;
    fetch(`/api/reactions/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
      .then((res) => res.json())
      .then(({ likes: serverLikes }) => {
        if (typeof serverLikes === 'number') setLikes(serverLikes);
      })
      .catch(() => {
        // 실패 시 롤백 — 캡처한 이전 값 사용
        setHasReacted(prevReacted);
        setLikes(prevLikes);
        try {
          localStorage.setItem('reacted_posts', JSON.stringify(reactedPosts));
        } catch {
          // ignore
        }
      })
      .finally(() => {
        pendingRef.current = false;
      });
  };

  return (
    <div className="mb-8 flex flex-col items-center gap-2">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        반응 {likes}개
      </h3>
      <button
        onClick={handleReactionClick}
        className={`rounded-full border p-3 ${
          hasReacted
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-400 dark:border-neutral-600 dark:text-gray-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400'
        }`}
        aria-label={hasReacted ? '반응 취소' : '반응하기'}
      >
        {hasReacted ? (
          <HeartIconFilled className="h-6 w-6" />
        ) : (
          <HeartIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
