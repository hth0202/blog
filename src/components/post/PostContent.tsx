'use client';

import React, { useState, useMemo } from 'react';

import { PostCard } from '@/components/post';

import { Post, Category } from '@/types/blog';

import { ChevronDownIcon, SearchIcon } from '@/constants';

type SortOrder = 'latest' | 'views' | 'oldest';

interface PostContentProps {
  initialPosts: Post[];
  initialCategories: Category[];
}

export function PostContent({
  initialPosts,
  initialCategories,
}: PostContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTagsOpen, setMobileTagsOpen] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [initialPosts]);

  const handleTagClick = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredPosts = useMemo(() => {
    let filtered = initialPosts;

    if (activeCategory !== 'all') {
      const selectedCategory = initialCategories.find(
        (c) => c.id === activeCategory,
      );
      if (selectedCategory) {
        filtered = filtered.filter(
          (post) => post.category === selectedCategory.name,
        );
      }
    }

    if (activeTags.length > 0) {
      filtered = filtered.filter((post) =>
        activeTags.every((tag) => post.tags.includes(tag)),
      );
    }

    if (searchQuery.trim().length > 1) {
      const condensedQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
      filtered = filtered.filter((post) => {
        const condensedTitle = post.title.toLowerCase().replace(/\s+/g, '');
        const condensedPreview = post.contentPreview
          .toLowerCase()
          .replace(/\s+/g, '');
        return (
          condensedTitle.includes(condensedQuery) ||
          condensedPreview.includes(condensedQuery)
        );
      });
    }

    return filtered;
  }, [
    activeCategory,
    activeTags,
    initialPosts,
    initialCategories,
    searchQuery,
  ]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      switch (sortOrder) {
        case 'views':
          return b.views - a.views;
        case 'oldest':
          return new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime();
        case 'latest':
        default:
          return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
      }
    });
  }, [filteredPosts, sortOrder]);

  const activeCategoryName =
    initialCategories.find((c) => c.id === activeCategory)?.name || '전체보기';

  return (
    <div className="animate-fade-in mx-auto max-w-6xl pt-6 sm:pt-0">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:col-span-1 md:block">
          <div className="sticky top-24">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-neutral-600 dark:text-white">
              카테고리
            </h3>
            <ul className="space-y-2">
              {initialCategories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.id);
                      setActiveTags([]);
                    }}
                    className={`w-full rounded px-2 py-1 text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900 dark:border-neutral-600 dark:text-white">
              태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTags.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-indigo-200 dark:hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">
          <div className="mb-6 border-b border-gray-200 pb-4 dark:border-neutral-600">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              기록
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              PM으로서 배우고 느낀 점을 사유하는 공간입니다
            </p>
          </div>

          {/* Mobile: category horizontal scroll tabs */}
          <div className="-mx-4 mb-3 px-4 md:hidden">
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
              {initialCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveTags([]);
                  }}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: search + tag toggle + sort */}
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <button
              onClick={() => setMobileTagsOpen((v) => !v)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                activeTags.length > 0
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-400/10 dark:text-indigo-300'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-300'
              }`}
            >
              태그
              {activeTags.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {activeTags.length}
                </span>
              )}
            </button>
            <div className="relative flex-shrink-0">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="appearance-none rounded-md border border-gray-300 bg-white py-2 pr-7 pl-3 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="latest">최신순</option>
                <option value="views">조회수 순</option>
                <option value="oldest">오래된 순</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Mobile: tag panel */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
              mobileTagsOpen ? 'mb-4 max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleTagClick(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      activeTags.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100 dark:bg-neutral-700 dark:text-gray-300 dark:ring-neutral-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: search + sort */}
          <div className="mb-6 hidden items-center justify-between gap-4 md:flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="기록 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-gray-500"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-32 appearance-none rounded-md border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="latest">최신순</option>
                <option value="views">조회수 순</option>
                <option value="oldest">오래된 순</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  해당 조건에 맞는 게시글이 없습니다.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
