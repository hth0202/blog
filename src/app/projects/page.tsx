'use client';

import React, { useState, useMemo, useEffect } from 'react';

import { ProjectCard, ProjectCardSkeleton } from '@/components/project';

import { getProjects, getProjectCategories } from '@/services/notion';

import { Project, ProjectCategory } from '@/types/blog';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedProjects, fetchedCategories] = await Promise.all([
          getProjects(),
          getProjectCategories(),
        ]);
        setProjects(fetchedProjects);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch projects data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((project) => {
      project.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [projects]);

  const handleTagClick = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (activeCategory !== 'all') {
      const selectedCategory = categories.find((c) => c.id === activeCategory);
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
  }, [activeCategory, activeTags, projects, categories]);

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
              {categories.map((category) => (
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
          <h1 className="mb-8 text-3xl font-bold">작업</h1>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))
            ) : filteredProjects.length > 0 ? (
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
