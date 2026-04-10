'use client';

import React, { useState, useMemo } from 'react';

import { ProjectCard } from '@/components/project';

import { Project, ProjectCategory } from '@/types/blog';

interface ProjectsContentProps {
  initialProjects: Project[];
  initialCategories: ProjectCategory[];
}

export function ProjectsContent({
  initialProjects,
  initialCategories,
}: ProjectsContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [mobileTagsOpen, setMobileTagsOpen] = useState(false);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialProjects.forEach((project) => {
      project.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [initialProjects]);

  const handleTagClick = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredProjects = useMemo(() => {
    let filtered = initialProjects;

    if (activeCategory !== 'all') {
      const selectedCategory = initialCategories.find(
        (c) => c.id === activeCategory,
      );
      if (selectedCategory) {
        filtered = filtered.filter(
          (project) => project.category === selectedCategory.name,
        );
      }
    }

    if (activeTags.length > 0) {
      filtered = filtered.filter((project) =>
        activeTags.every((tag) => project.tags.includes(tag)),
      );
    }

    return filtered;
  }, [activeCategory, activeTags, initialProjects, initialCategories]);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl">
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
              작업
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              작업 탭 설명을 여기에 입력하세요.
            </p>
          </div>

          {/* Mobile: category horizontal scroll tabs */}
          <div className="-mx-4 mb-3 px-4 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
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

          {/* Mobile: tag toggle */}
          {allTags.length > 0 && (
            <div className="mb-4 md:hidden">
              <button
                onClick={() => setMobileTagsOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
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
            </div>
          )}

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  해당 조건에 맞는 프로젝트가 없습니다.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
