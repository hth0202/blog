"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { HeartIcon, HeartIconFilled, ShareIcon } from "../../../constants";
import { getProjectById } from "../../../services/notion";
import { Project } from "../../../types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [hasReacted, setHasReacted] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const fetchedProject = await getProjectById(Number(projectId));
          setProject(fetchedProject || null);
          if (fetchedProject) {
            // Check reaction status from localStorage
            const reactedProjects = JSON.parse(
              localStorage.getItem("reacted_projects") || "[]"
            );
            if (reactedProjects.includes(fetchedProject.id)) {
              setHasReacted(true);
            }

            // Get reaction count from localStorage or initialize it
            const allReactionCounts = JSON.parse(
              localStorage.getItem("reaction_counts") || "{}"
            );
            const currentCount =
              allReactionCounts[`project_${fetchedProject.id}`];
            const initialCount = fetchedProject.views % 20;

            setReactionCount(
              currentCount !== undefined ? currentCount : initialCount
            );
          }
        } catch (error) {
          console.error("Failed to fetch project:", error);
          setProject(null);
        }
      }
    };
    fetchProject();
  }, [projectId]);

  const handleReactionClick = () => {
    if (!project) return;

    const newReactionCount = hasReacted ? reactionCount - 1 : reactionCount + 1;
    setReactionCount(newReactionCount);

    const newHasReacted = !hasReacted;
    setHasReacted(newHasReacted);

    // Update reaction status in localStorage
    const reactedProjects = JSON.parse(
      localStorage.getItem("reacted_projects") || "[]"
    );
    const updatedReactedProjects = newHasReacted
      ? [...reactedProjects, project.id]
      : reactedProjects.filter((id: number) => id !== project.id);
    localStorage.setItem(
      "reacted_projects",
      JSON.stringify(updatedReactedProjects)
    );

    // Update reaction count in localStorage
    const allReactionCounts = JSON.parse(
      localStorage.getItem("reaction_counts") || "{}"
    );
    allReactionCounts[`project_${project.id}`] = newReactionCount;
    localStorage.setItem("reaction_counts", JSON.stringify(allReactionCounts));
  };

  if (project === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="text-2xl font-bold">프로젝트를 찾을 수 없습니다.</h1>
        <Link
          href="/projects"
          className="mt-4 inline-block text-violet-500 hover:underline"
        >
          프로젝트 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <article className="max-w-3xl mx-auto animate-fade-in">
        <header className="mb-8">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-64 object-cover rounded-lg bg-gray-200 dark:bg-gray-700 mb-6"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {project.category}
          </div>
          <h1 className="text-4xl font-extrabold my-2 leading-tight">
            {project.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 mb-4">
            {project.contentPreview}
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {project.date}
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none mb-12 prose-img:rounded-lg">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {project.content}
          </ReactMarkdown>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ShareIcon className="w-5 h-5" />
            <span>공유하기</span>
          </button>
          <Link
            href="/projects"
            className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            목록으로
          </Link>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col items-center gap-2 mb-8">
            <h3 className="font-semibold">반응 {reactionCount}개</h3>
            <button
              onClick={handleReactionClick}
              className={`p-3 rounded-full border transition-colors ${
                hasReacted
                  ? "border-violet-500 text-violet-500"
                  : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-violet-500 dark:hover:border-violet-400 hover:text-violet-500 dark:hover:text-violet-400"
              }`}
              aria-label={hasReacted ? "Undo reaction" : "Give a reaction"}
            >
              {hasReacted ? (
                <HeartIconFilled className="w-6 h-6" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
            </button>
          </div>

          <section aria-labelledby="comments-heading">
            <h2 id="comments-heading" className="text-xl font-bold mb-4">
              댓글 {Math.floor(project.views / 100)}개
            </h2>
            <div className="space-y-6">
              {/* Mock Comment */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="font-semibold">사용자 1</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    프로젝트 정말 인상적이네요!
                  </p>
                  <div className="text-xs text-gray-400 mt-1">2일 전</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <textarea
                rows={4}
                placeholder="댓글을 입력하세요..."
                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                aria-label="댓글 작성"
              />
              <div className="flex justify-end mt-2">
                <button className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm font-semibold">
                  댓글 달기
                </button>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
