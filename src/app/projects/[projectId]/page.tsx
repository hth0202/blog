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
  getProjectMetaById,
  getProjectsFromNotion,
} from '@/services/notion-api';

import { extractHeadings } from '@/lib/slugify';

import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProjectMetaById(projectId);
  if (!project) return {};
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';
  const ogImage = project.thumbnailUrl
    ? project.thumbnailUrl.startsWith('/')
      ? `${baseUrl}${project.thumbnailUrl}`
      : project.thumbnailUrl
    : null;
  return {
    title: `${project.name} | 태피스토리`,
    description: project.contentPreview,
    openGraph: {
      title: project.name,
      description: project.contentPreview,
      url: `${baseUrl}/projects/${project.id}`,
      siteName: '태피스토리',
      images: ogImage ? [{ url: ogImage, alt: project.name }] : [],
      type: 'article',
      publishedTime: project.date,
      authors: ['태피'],
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.name,
      description: project.contentPreview,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export async function generateStaticParams() {
  const projects = await getProjectsFromNotion();
  return projects
    .filter((p) => p.status === '발행')
    .map((p) => ({ projectId: p.id }));
}

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ secret?: string }>;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const { secret } = await searchParams;
  const isDraft =
    !!process.env.DRAFT_SECRET && secret === process.env.DRAFT_SECRET;

  const project = await getProjectMetaById(projectId);
  if (!project || (!isDraft && project.status !== '발행')) notFound();

  const blocks = await getPageBlocks(project.rawId);
  const headings = extractHeadings(blocks);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.name,
    description: project.contentPreview,
    image: project.thumbnailUrl,
    datePublished: project.date,
    dateModified: project.date,
    url: `${baseUrl}/projects/${project.id}`,
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
      <ViewTracker postId={project.id} />
      {headings.length > 0 && <TableOfContents headings={headings} />}
      <article className="animate-fade-in mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="relative mb-12 h-72 w-full overflow-hidden rounded-xl bg-gray-900 sm:h-80">
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <div className="mb-2 text-sm font-medium text-white/70">
                {project.category}
              </div>
              <h1 className="mb-2 text-2xl leading-tight font-extrabold text-white drop-shadow-md sm:text-3xl">
                {project.name}
              </h1>
              {project.contentPreview && (
                <p className="mb-3 line-clamp-2 text-sm text-white/80 drop-shadow-sm">
                  {project.contentPreview}
                </p>
              )}
              <div className="text-xs text-white/60">
                {project.date}
                {project.dateEnd && ` ~ ${project.dateEnd}`}
              </div>
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
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-indigo-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <ShareButton title={project.name} />
          <Link
            href="/projects"
            className="rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            목록으로
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-8 dark:border-neutral-600">
          <ReactionSection postId={project.id} initialLikes={project.likes} />

          <CommentSection postId={project.id} />
        </div>
      </article>
    </>
  );
}
