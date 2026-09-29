'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronDownIcon } from '@/constants';

import type { PlaygroundImage } from '@/types/blog';

import { CopyPromptButton } from './CopyPromptButton';

type SortOrder = 'views' | 'latest' | 'copies';
const PAGE_SIZE = 30;

const getImageDimensions = (ratio: string) => {
  const [width = 1, height = 1] = ratio.split(':').map(Number);
  return width > 0 && height > 0
    ? { width: width * 400, height: height * 400 }
    : { width: 1200, height: 1200 };
};

export function PlaygroundGallery({
  images,
  initialSref = '',
  initialProfile = '',
  initialModel = '',
}: {
  images: PlaygroundImage[];
  initialSref?: string;
  initialProfile?: string;
  initialModel?: string;
}) {
  const [sref, setSref] = useState(initialSref);
  const [profile, setProfile] = useState(initialProfile);
  const [model, setModel] = useState(initialModel);
  const [sort, setSort] = useState<SortOrder>('views');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [columnCount, setColumnCount] = useState(2);
  const galleryRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const srefs = useMemo(
    () =>
      [
        ...new Set(
          images.flatMap((image) => image.meta.srefs.map((item) => item.value)),
        ),
      ].sort(),
    [images],
  );
  const profiles = useMemo(
    () => [...new Set(images.flatMap((image) => image.meta.profiles))].sort(),
    [images],
  );
  const models = useMemo(
    () => [...new Set(images.map((image) => image.meta.model))].sort(),
    [images],
  );

  const visibleImages = useMemo(
    () =>
      images
        .filter(
          (image) =>
            (!sref || image.meta.srefs.some((item) => item.value === sref)) &&
            (!profile || image.meta.profiles.includes(profile)) &&
            (!model || image.meta.model === model),
        )
        .sort((a, b) =>
          sort === 'latest'
            ? b.isoDate.localeCompare(a.isoDate)
            : sort === 'copies'
              ? b.copies - a.copies || b.isoDate.localeCompare(a.isoDate)
              : b.views - a.views || b.isoDate.localeCompare(a.isoDate),
        ),
    [images, sref, profile, model, sort],
  );
  const hasImages = visibleImages.length > 0;
  const hasFilters = Boolean(sref || profile || model);
  const displayedImages = visibleImages.slice(0, visibleCount);
  const hasMore = displayedImages.length < visibleImages.length;

  useEffect(() => {
    if (!galleryRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setColumnCount(
        width >= 1120 ? 5 : width >= 900 ? 4 : width >= 640 ? 3 : 2,
      );
    });
    observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, [hasImages]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sref, profile, model, sort]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, visibleImages.length),
          );
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, visibleImages.length]);

  const columns = Array.from(
    { length: columnCount },
    () => [] as PlaygroundImage[],
  );
  const columnHeights = Array<number>(columnCount).fill(0);
  displayedImages.forEach((image) => {
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    const { width, height } = getImageDimensions(image.meta.ratio);
    columns[shortestColumn].push(image);
    columnHeights[shortestColumn] += height / width;
  });
  const priorityImageIds = new Set(
    displayedImages.slice(0, columnCount).map((image) => image.id),
  );

  const clearFilters = () => {
    setSref('');
    setProfile('');
    setModel('');
  };

  const selectClass =
    'min-w-0 w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm font-normal tracking-normal text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white';

  return (
    <section className="animate-fade-in mx-auto w-full max-w-6xl pt-6 pb-16 sm:pt-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          놀이터
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          AI로 이것저것 실험해 보고 있어요
        </p>
      </div>

      <div className="mb-7">
        <span className="inline-block rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white">
          이미지
        </span>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3">
          <label className="block min-w-0 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400">
            SREF
            <span className="relative mt-2 block">
              <select
                value={sref}
                onChange={(event) => setSref(event.target.value)}
                className={selectClass}
              >
                <option value="">모든 SREF</option>
                {srefs.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </span>
          </label>
          <label className="block min-w-0 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400">
            프로필
            <span className="relative mt-2 block">
              <select
                value={profile}
                onChange={(event) => setProfile(event.target.value)}
                className={selectClass}
              >
                <option value="">모든 프로필</option>
                {profiles.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </span>
          </label>
          <label className="block min-w-0 text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400">
            모델
            <span className="relative mt-2 block">
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className={selectClass}
              >
                <option value="">모든 모델</option>
                {models.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </span>
          </label>
        </div>
        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs whitespace-nowrap text-gray-500 underline underline-offset-4 hover:text-indigo-600 focus:outline-none dark:text-gray-400 dark:hover:text-indigo-300"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
        <p aria-live="polite">이미지 {visibleImages.length}개</p>
        <div className="relative">
          <select
            aria-label="정렬 기준"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOrder)}
            className="appearance-none bg-transparent py-1 pr-5 pl-1 text-sm text-gray-600 hover:text-indigo-600 focus:outline-none dark:text-gray-300 dark:hover:text-indigo-300"
          >
            <option value="views">조회수 순</option>
            <option value="latest">최신 순</option>
            <option value="copies">복사수 순</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      {hasImages ? (
        <>
          <div ref={galleryRef} className="flex items-start gap-3 sm:gap-4">
            {columns.map((column, index) => (
              <div
                key={index}
                className="min-w-0 flex-1 space-y-3 sm:space-y-4"
              >
                {column.map((image) => (
                  <article
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800"
                  >
                    <Link
                      href={`/playground/${image.id}`}
                      className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      aria-label={`${image.title} 상세 보기`}
                    >
                      {image.imageUrl.startsWith('/') ? (
                        <Image
                          src={image.imageUrl}
                          alt={image.title}
                          {...getImageDimensions(image.meta.ratio)}
                          sizes="(min-width: 1280px) 220px, (min-width: 900px) 25vw, (min-width: 640px) 33vw, 50vw"
                          priority={priorityImageIds.has(image.id)}
                          className="block h-auto w-full"
                        />
                      ) : (
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          loading={
                            priorityImageIds.has(image.id) ? 'eager' : 'lazy'
                          }
                          className="block h-auto w-full"
                        />
                      )}
                    </Link>
                    <CopyPromptButton
                      imageId={image.id}
                      prompt={image.prompt}
                      initialCopies={image.copies}
                      views={image.views}
                      card
                    />
                  </article>
                ))}
              </div>
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
          )}
        </>
      ) : (
        <p className="py-20 text-center text-gray-500 dark:text-gray-400">
          {images.length
            ? '조건에 맞는 이미지가 없습니다.'
            : '발행된 이미지가 없습니다.'}
        </p>
      )}
    </section>
  );
}
