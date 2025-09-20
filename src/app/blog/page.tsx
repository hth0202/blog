"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronDownIcon, SearchIcon } from "../../constants";
import PostCard, { PostCardSkeleton } from "../../components/PostCard";
import { Post, Category } from "../../types";
import { getPosts, getCategories } from "../../services/notion";

type SortOrder = "latest" | "views" | "oldest";

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedPosts, fetchedCategories] = await Promise.all([
          getPosts(),
          getCategories(),
        ]);
        setPosts(fetchedPosts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch blog data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const handleTagClick = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (activeCategory !== "all") {
      const selectedCategory = categories.find((c) => c.id === activeCategory);
      if (selectedCategory) {
        filtered = filtered.filter(
          (post) => post.category === selectedCategory.name
        );
      }
    }

    if (activeTags.length > 0) {
      filtered = filtered.filter((post) =>
        activeTags.every((tag) => post.tags.includes(tag))
      );
    }

    if (searchQuery.trim().length > 1) {
      const condensedQuery = searchQuery.toLowerCase().replace(/\s+/g, "");
      filtered = filtered.filter((post) => {
        const condensedTitle = post.title.toLowerCase().replace(/\s+/g, "");
        const condensedPreview = post.contentPreview
          .toLowerCase()
          .replace(/\s+/g, "");
        const condensedContent = post.content.toLowerCase().replace(/\s+/g, "");
        return (
          condensedTitle.includes(condensedQuery) ||
          condensedPreview.includes(condensedQuery) ||
          condensedContent.includes(condensedQuery)
        );
      });
    }

    return filtered;
  }, [activeCategory, activeTags, posts, categories, searchQuery]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      switch (sortOrder) {
        case "views":
          return b.views - a.views;
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "latest":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filteredPosts, sortOrder]);

  const activeCategoryName =
    categories.find((c) => c.id === activeCategory)?.name || "전체보기";

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              카테고리
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(category.id);
                      setActiveTags([]); // 카테고리 변경 시 태그 선택 초기화
                    }}
                    className={`w-full text-left px-2 py-1 rounded transition-colors ${
                      activeCategory === category.id
                        ? "bg-violet-100 dark:bg-violet-900/60 font-bold"
                        : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    activeTags.includes(tag)
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold">기록</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {activeCategoryName} 카테고리에 대한 설명
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <input
                type="text"
                placeholder="기록 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="appearance-none w-full sm:w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="latest">최신순</option>
                <option value="views">조회수 순</option>
                <option value="oldest">오래된 순</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))
            ) : sortedPosts.length > 0 ? (
              sortedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-16">
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
