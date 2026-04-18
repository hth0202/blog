import Link from 'next/link';
import { notFound } from 'next/navigation';

import { NotionRenderer } from '@/components/notion/NotionRenderer';
import { TableOfContents } from '@/components/notion/TableOfContents';
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

import { extractHeadings } from '@/lib/slugify';

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
      publishedTime: post.date,
      authors: ['태피'],
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.contentPreview,
      images: post.thumbnailUrl ? [post.thumbnailUrl] : [],
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
  searchParams: Promise<{ secret?: string }>;
}

export default async function PostDetailPage({
  params,
  searchParams,
}: PostDetailPageProps) {
  const { postId } = await params;
  const { secret } = await searchParams;
  const isDraft =
    process.env.DRAFT_SECRET && secret === process.env.DRAFT_SECRET;

  const post = await getPostMetaById(postId);
  if (!post || (!isDraft && post.status !== '발행')) notFound();

  const blocks = await getPageBlocks(post.rawId);
  const headings = extractHeadings(blocks);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.contentPreview,
    image: post.thumbnailUrl,
    datePublished: post.date,
    dateModified: post.date,
    url: `${baseUrl}/post/${post.id}`,
    author: {
      '@type': 'Person',
      name: '태피',
      url: `${baseUrl}/about`,
    },
    publisher: {
      '@type': 'Person',
      name: '태피스토리',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker postId={post.id} />
      {headings.length > 0 && <TableOfContents headings={headings} />}
      <article className="animate-fade-in mx-auto max-w-3xl">
        <header className="mb-8">
          {/* 커버 히어로: 이미지를 배경으로 하고 텍스트를 위에 오버레이 */}
          <div className="relative mb-12 h-72 w-full overflow-hidden rounded-xl bg-gray-900 sm:h-80">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="h-full w-full object-cover opacity-45"
            />
            {/* 텍스트 가독성을 위한 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            {/* 텍스트 콘텐츠 */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <div className="mb-2 text-sm font-medium text-white/70">
                {post.category}
              </div>
              <h1 className="mb-2 text-2xl leading-tight font-extrabold text-white drop-shadow-md sm:text-3xl">
                {post.title}
              </h1>
              {post.contentPreview && (
                <p className="mb-3 line-clamp-2 text-sm text-white/80 drop-shadow-sm">
                  {post.contentPreview}
                </p>
              )}
              <div className="text-xs text-white/60">{post.date}</div>
            </div>
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
