import { Eye } from 'lucide-react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import { CopyPromptButton } from '@/components/playground/CopyPromptButton';
import { ShareButton, ViewTracker } from '@/components/post/article';

import { getPlaygroundImagesFromNotion } from '@/services/notion-api';

import type { Metadata } from 'next';

export const revalidate = 300;

type DetailProps = { params: Promise<{ imageId: string }> };

const optionColors: Record<string, string> = {
  ar: 'text-sky-700/70 dark:text-sky-300/70',
  exp: 'text-violet-700/70 dark:text-violet-300/70',
  hd: 'text-orange-700/70 dark:text-orange-300/70',
  niji: 'text-amber-700/70 dark:text-amber-300/70',
  profile: 'text-emerald-700/70 dark:text-emerald-300/70',
  sref: 'text-rose-700/70 dark:text-rose-300/70',
  stylize: 'text-violet-700/70 dark:text-violet-300/70',
  v: 'text-amber-700/70 dark:text-amber-300/70',
};

function PromptText({ prompt }: { prompt: string }) {
  let option = '';

  return prompt.split(/(\s+)/).map((token, index) => {
    if (/^--[a-z]+$/i.test(token)) option = token.slice(2).toLowerCase();
    return (
      <span
        key={index}
        className={
          option
            ? (optionColors[option] ??
              'text-indigo-700/70 dark:text-indigo-300/70')
            : undefined
        }
      >
        {token}
      </span>
    );
  });
}

export async function generateMetadata({
  params,
}: DetailProps): Promise<Metadata> {
  const { imageId } = await params;
  const image = (await getPlaygroundImagesFromNotion()).find(
    (item) => item.slug === imageId || item.id === imageId,
  );
  if (!image) return {};
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';
  const imageUrl = image.imageUrl.startsWith('/')
    ? `${baseUrl}${image.imageUrl}`
    : image.imageUrl;

  return {
    title: `${image.title} | 놀이터 | 태피스토리`,
    description: image.prompt.slice(0, 160),
    alternates: { canonical: `${baseUrl}/playground/${image.slug}` },
    openGraph: { images: [{ url: imageUrl, alt: image.title }] },
  };
}

export default async function PlaygroundDetailPage({ params }: DetailProps) {
  const { imageId } = await params;
  const image = (await getPlaygroundImagesFromNotion()).find(
    (item) => item.slug === imageId || item.id === imageId,
  );
  if (!image) notFound();
  // 예전 id 주소로 들어오면 번호 주소로 옮긴다.
  if (imageId !== image.slug) permanentRedirect(`/playground/${image.slug}`);

  const rows = [
    {
      label: '모델',
      value: (
        <Link
          href={{ pathname: '/playground', query: { model: image.meta.model } }}
          className="underline decoration-gray-300 underline-offset-4 hover:text-indigo-600 dark:decoration-neutral-600 dark:hover:text-indigo-300"
        >
          {image.meta.model}
        </Link>
      ),
    },
    {
      label: 'SREF',
      value: image.meta.srefs.length ? (
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          {image.meta.srefs.map((sref) => (
            <Link
              key={sref.value}
              href={{ pathname: '/playground', query: { sref: sref.value } }}
              className="underline decoration-gray-300 underline-offset-4 hover:text-indigo-600 dark:decoration-neutral-600 dark:hover:text-indigo-300"
            >
              {sref.value}
              {sref.weight ? ` ×${sref.weight}` : ''}
            </Link>
          ))}
        </span>
      ) : (
        ''
      ),
    },
    {
      label: '프로필',
      value: image.meta.profiles.length ? (
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          {image.meta.profiles.map((profile) => (
            <Link
              key={profile}
              href={{ pathname: '/playground', query: { profile } }}
              className="underline decoration-gray-300 underline-offset-4 hover:text-indigo-600 dark:decoration-neutral-600 dark:hover:text-indigo-300"
            >
              {profile}
            </Link>
          ))}
        </span>
      ) : (
        ''
      ),
    },
    {
      label: '포맷',
      value: [
        image.meta.ratio,
        image.meta.stylize && `Stylize ${image.meta.stylize}`,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    { label: '등록일', value: image.date },
  ].filter((row) => row.value);

  return (
    <article className="animate-fade-in mx-auto w-full max-w-6xl pb-16">
      <ViewTracker postId={image.id} />
      <h1 className="sr-only">{image.title}</h1>
      <div className="mb-6">
        <Link
          href="/playground"
          className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300"
        >
          ← 놀이터
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] lg:gap-12">
        <div className="flex items-start justify-center lg:justify-end">
          <img
            src={image.imageUrl}
            alt={image.title}
            className="block h-auto max-h-[calc(100svh-13rem)] w-auto max-w-full rounded-xl"
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl bg-gray-50 p-5 sm:p-6 dark:bg-neutral-800">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400">
                원본 프롬프트
              </h2>
              <div className="flex items-center gap-2">
                <CopyPromptButton
                  imageId={image.id}
                  prompt={image.prompt}
                  initialCopies={image.copies}
                  showCount={false}
                />
              </div>
            </div>
            <p className="font-mono text-sm leading-7 [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-gray-700 dark:text-gray-200">
              <PromptText prompt={image.prompt || '프롬프트가 없습니다.'} />
            </p>
          </section>

          <dl className="mt-8 border-t border-gray-200 dark:border-neutral-700">
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-gray-200 py-4 text-sm dark:border-neutral-700"
              >
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="break-words text-gray-800 dark:text-gray-100">
                  {value}
                </dd>
              </div>
            ))}
            <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-gray-200 py-4 text-sm dark:border-neutral-700">
              <dt className="text-gray-500 dark:text-gray-400">조회수</dt>
              <dd className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <Eye className="h-4 w-4" aria-hidden="true" />
                {image.views}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-end">
            <ShareButton title={image.title} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
