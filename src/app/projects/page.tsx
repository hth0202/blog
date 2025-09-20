"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProjectCard, { ProjectCardSkeleton } from "../../components/ProjectCard";
import { Project, ProjectCategory } from "../../types";
import { getProjects, getProjectCategories } from "../../services/notion";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>("all");
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
        console.error("Failed to fetch projects data:", error);
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
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (activeCategory !== "all") {
      const selectedCategory = categories.find((c) => c.id === activeCategory);
      if (selectedCategory) {
        filtered = filtered.filter(
          (project) => project.category === selectedCategory.name
        );
      }
    }

    if (activeTags.length > 0) {
      filtered = filtered.filter((project) =>
        activeTags.every((tag) => project.tags.includes(tag))
      );
    }

    return filtered;
  }, [activeCategory, activeTags, projects, categories]);

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
          <h1 className="text-3xl font-bold mb-8">작업</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-10">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
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
