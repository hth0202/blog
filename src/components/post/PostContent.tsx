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
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'latest':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filteredPosts, sortOrder]);

  const activeCategoryName =
    initialCategories.find((c) => c.id === activeCategory)?.name || '전체보기';

  return (
    <div className="animate-fade-in mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-24">
            <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold dark:border-gray-700">
              카테고리
            </h3>
            <ul className="space-y-2">
              {initialCategories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.id);
                      setActiveTags([]); // 카테고리 변경 시 태그 선택 초기화
                    }}
                    className={`w-full rounded px-2 py-1 text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-violet-100 font-bold dark:bg-violet-900/60'
                        : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 mb-4 border-b border-gray-200 pb-2 text-lg font-semibold dark:border-gray-700">
              태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTags.includes(tag)
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
          <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
            <h1 className="text-3xl font-bold">기록</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {activeCategoryName} 카테고리에 대한 설명
            </p>
          </div>

          <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <input
                type="text"
                placeholder="기록 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none sm:w-32 dark:border-gray-600 dark:bg-gray-800"
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
