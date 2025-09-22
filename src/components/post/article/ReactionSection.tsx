'use client';

import React, { useState, useEffect } from 'react';

import { HeartIcon, HeartIconFilled } from '@/constants';

interface ReactionSectionProps {
  postId: string;
}

export function ReactionSection({ postId }: ReactionSectionProps) {
  const [hasReacted, setHasReacted] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);

  useEffect(() => {
    // Check reaction status from localStorage
    const reactedPosts = JSON.parse(
      localStorage.getItem('reacted_posts') || '[]',
    );
    if (reactedPosts.includes(postId)) {
      setHasReacted(true);
    }

    // Get reaction count from localStorage or initialize it
    const allReactionCounts = JSON.parse(
      localStorage.getItem('reaction_counts') || '{}',
    );
    const currentCount = allReactionCounts[`post_${postId}`];
    const initialCount = 12; // Default mock count

    setReactionCount(currentCount !== undefined ? currentCount : initialCount);
  }, [postId]);

  const handleReactionClick = () => {
    const newReactionCount = hasReacted ? reactionCount - 1 : reactionCount + 1;
    setReactionCount(newReactionCount);

    const newHasReacted = !hasReacted;
    setHasReacted(newHasReacted);

    // Update reaction status in localStorage
    const reactedPosts = JSON.parse(
      localStorage.getItem('reacted_posts') || '[]',
    );
    const updatedReactedPosts = newHasReacted
      ? [...reactedPosts, postId]
      : reactedPosts.filter((id: string) => id !== postId);
    localStorage.setItem('reacted_posts', JSON.stringify(updatedReactedPosts));

    // Update reaction count in localStorage
    const allReactionCounts = JSON.parse(
      localStorage.getItem('reaction_counts') || '{}',
    );
    allReactionCounts[`post_${postId}`] = newReactionCount;
    localStorage.setItem('reaction_counts', JSON.stringify(allReactionCounts));
  };

  return (
    <div className="mb-8 flex flex-col items-center gap-2">
      <h3 className="font-semibold">반응 {reactionCount}개</h3>
      <button
        onClick={handleReactionClick}
        className={`rounded-full border p-3 transition-colors ${
          hasReacted
            ? 'border-violet-500 text-violet-500'
            : 'border-gray-300 text-gray-400 hover:border-violet-500 hover:text-violet-500 dark:border-gray-600 dark:text-gray-500 dark:hover:border-violet-400 dark:hover:text-violet-400'
        }`}
        aria-label={hasReacted ? 'Undo reaction' : 'Give a reaction'}
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
