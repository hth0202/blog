import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ReactionSection } from '@/components/post';
import { CommentSection, NotionContent, ShareButton, ViewTracker } from '@/components/post/article';

import { getPostMetaById, getPostsFromNotion } from '@/services/notion-api';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPostsFromNotion();
  return posts
    .filter((p) => p.status === '발행')
    .map((p) => ({ postId: p.id }));
}

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

function PostArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="mt-6 h-4 w-full rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-neutral-700" />
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-700" />
    </div>
  );
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;

  const post = await getPostMetaById(postId);
  if (!post) notFound();

  return (
    <>
      <ViewTracker postId={post.id} />
      <article className="animate-fade-in mx-auto max-w-3xl">
        <header className="mb-8">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="mb-6 h-64 w-full rounded-lg bg-gray-100 object-cover dark:bg-neutral-700"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {post.category}
          </div>
          <h1 className="my-2 text-4xl leading-tight font-extrabold text-gray-900 dark:text-white">
            {post.title}
          </h1>
          <p className="mt-2 mb-4 text-lg text-gray-600 dark:text-gray-300">
            {post.contentPreview}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {post.date}
          </div>
        </header>

        <div className="mb-12 max-w-none">
          <Suspense fallback={<PostArticleSkeleton />}>
            <NotionContent rawId={post.rawId} />
          </Suspense>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-indigo-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <ShareButton title={post.title} />
          <Link
            href="/post"
            className="rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            목록으로
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-8 dark:border-neutral-600">
          <ReactionSection postId={post.id} initialLikes={post.likes} />

          <CommentSection postId={post.id} />
        </div>
      </article>
    </>
  );
}
