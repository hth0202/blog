'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import React, { useEffect, useRef, useState } from 'react';

import type { Comment } from '@/types/blog';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments/${postId}`);
      if (!res.ok) throw new Error('댓글을 불러오지 못했습니다.');
      const data: Comment[] = await res.json();
      setComments(data);
    } catch {
      setError('댓글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/comments/${postId}`);
        if (cancelled) return;
        if (!res.ok) throw new Error('댓글을 불러오지 못했습니다.');
        const data: Comment[] = await res.json();
        if (!cancelled) setComments(data);
      } catch {
        if (!cancelled) setError('댓글을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const author = authorRef.current?.value.trim() ?? '';
    const content = contentRef.current?.value.trim() ?? '';

    if (!author || !content) {
      setError('이름과 댓글 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          content,
          website: honeypotRef.current?.value ?? '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '댓글 등록에 실패했습니다.');
        return;
      }

      if (authorRef.current) authorRef.current.value = '';
      if (contentRef.current) contentRef.current.value = '';
      await fetchComments();
    } catch {
      setError('댓글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="mb-4 text-xl font-bold text-gray-900 dark:text-white"
      >
        댓글 {loading ? '' : `${comments.length}개`}
      </h2>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700" />
              <div className="flex-grow space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          첫 번째 댓글을 남겨보세요.
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-400/25">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                  {comment.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-grow">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {comment.author}
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                  {comment.content}
                </p>
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm', {
                    locale: ko,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        {/* Honeypot: 사람은 보이지 않으므로 항상 비어 있어야 함 */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        />
        <input
          ref={authorRef}
          type="text"
          placeholder="이름"
          maxLength={50}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500"
          aria-label="이름"
        />
        <textarea
          ref={contentRef}
          rows={4}
          placeholder="댓글을 입력하세요..."
          maxLength={1000}
          className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500"
          aria-label="댓글 작성"
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '댓글 달기'}
          </button>
        </div>
      </form>
    </section>
  );
}
