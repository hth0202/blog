'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { HeartIcon, HeartIconFilled, ShareIcon } from '../../../constants';
import { getProjectById } from '../../../services/notion';
import { Project } from '../../../types/blog';

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
          const fetchedProject = await getProjectById(projectId);
          setProject(fetchedProject || null);
          if (fetchedProject) {
            // Check reaction status from localStorage
            const reactedProjects = JSON.parse(
              localStorage.getItem('reacted_projects') || '[]',
            );
            if (reactedProjects.includes(fetchedProject.id)) {
              setHasReacted(true);
            }

            // Get reaction count from localStorage or initialize it
            const allReactionCounts = JSON.parse(
              localStorage.getItem('reaction_counts') || '{}',
            );
            const currentCount =
              allReactionCounts[`project_${fetchedProject.id}`];
            const initialCount = fetchedProject.views % 20;

            setReactionCount(
              currentCount !== undefined ? currentCount : initialCount,
            );
          }
        } catch (error) {
          console.error('Failed to fetch project:', error);
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
      localStorage.getItem('reacted_projects') || '[]',
    );
    const updatedReactedProjects = newHasReacted
      ? [...reactedProjects, project.id]
      : reactedProjects.filter((id: string) => id !== project.id);
    localStorage.setItem(
      'reacted_projects',
      JSON.stringify(updatedReactedProjects),
    );

    // Update reaction count in localStorage
    const allReactionCounts = JSON.parse(
      localStorage.getItem('reaction_counts') || '{}',
    );
    allReactionCounts[`project_${project.id}`] = newReactionCount;
    localStorage.setItem('reaction_counts', JSON.stringify(allReactionCounts));
  };

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="animate-fade-in py-20 text-center">
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
      <article className="animate-fade-in mx-auto max-w-3xl">
        <header className="mb-8">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="mb-6 h-64 w-full rounded-lg bg-gray-200 object-cover dark:bg-gray-700"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {project.category}
          </div>
          <h1 className="my-2 text-4xl leading-tight font-extrabold">
            {project.name}
          </h1>
          <p className="mt-2 mb-4 text-lg text-gray-600 dark:text-gray-300">
            {project.contentPreview}
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {project.date}
          </div>
        </header>

        <div className="prose dark:prose-invert prose-img:rounded-lg mb-12 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {project.contentPreview}
          </ReactMarkdown>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <button className="flex items-center gap-2 rounded-md border border-gray-300 px-6 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
            <ShareIcon className="h-5 w-5" />
            <span>공유하기</span>
          </button>
          <Link
            href="/projects"
            className="rounded-md bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-700"
          >
            목록으로
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="mb-8 flex flex-col items-center gap-2">
            <h3 className="font-semibold">반응 {reactionCount}개</h3>
            <button
              onClick={handleReactionClick}
              className={`rounded-full border p-3 transition-colors ${
                hasReacted
                  ? 'border-violet-500 text-violet-500'
                  : 'border-gray-300 text-gray-400 hover:border-violet-500 hover:text-violet-500 dark:border-gray-600 dark:text-gray-500 dark:hover:border-violet-400 dark:hover:text-violet-400'
              }`}
              aria-label={hasReacted ? 'Undo reaction' : 'Give a reaction'}
            >
              {hasReacted ? (
                <HeartIconFilled className="h-6 w-6" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          <section aria-labelledby="comments-heading">
            <h2 id="comments-heading" className="mb-4 text-xl font-bold">
              댓글 {Math.floor(project.views / 100)}개
            </h2>
            <div className="space-y-6">
              {/* Mock Comment */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-grow">
                  <div className="font-semibold">사용자 1</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    프로젝트 정말 인상적이네요!
                  </p>
                  <div className="mt-1 text-xs text-gray-400">2일 전</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <textarea
                rows={4}
                placeholder="댓글을 입력하세요..."
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-sm transition-all focus:ring-2 focus:ring-violet-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                aria-label="댓글 작성"
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-md bg-violet-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700">
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
