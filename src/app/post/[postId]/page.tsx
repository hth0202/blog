import Link from 'next/link';
import { notFound } from 'next/navigation';

import { NotionRenderer } from '@/components/notion/NotionRenderer';
import { ReactionSection } from '@/components/post';
import {
  CommentSection,
  ShareButton,
  ViewTracker,
} from '@/components/post/article';

import {
  getPageBlocks,
  getPostMetaById,
  getPostsFromNotion,
} from '@/services/notion-api';

import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getPostMetaById(postId);
  if (!post) return {};
  return {
    title: `${post.title} | 태피스토리`,
    description: post.contentPreview,
    openGraph: {
      title: post.title,
      description: post.contentPreview,
      images: post.thumbnailUrl ? [{ url: post.thumbnailUrl }] : [],
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPostsFromNotion();
  return posts
    .filter((p) => p.status === '발행')
    .map((p) => ({ postId: p.id }));
}

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;

  const post = await getPostMetaById(postId);
  if (!post) notFound();

  const blocks = await getPageBlocks(post.rawId);

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
          {blocks.length > 0 ? (
            <NotionRenderer blocks={blocks} />
          ) : (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              내용을 불러올 수 없습니다.
            </p>
          )}
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
