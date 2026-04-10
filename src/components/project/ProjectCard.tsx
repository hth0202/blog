import Link from 'next/link';
import React from 'react';

import type { Project } from '@/types/blog';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-lg dark:border-neutral-700 dark:group-hover:shadow-neutral-800/60">
        <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-grow flex-col p-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{project.name}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {project.contentPreview}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProjectCardSkeleton: React.FC = () => (
  <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700">
    <div className="aspect-square w-full bg-gray-100 dark:bg-neutral-800"></div>
    <div className="flex flex-grow flex-col p-4">
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="mb-1 h-4 w-full rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="mb-3 h-4 w-5/6 rounded bg-gray-100 dark:bg-neutral-700"></div>
      <div className="flex flex-wrap gap-1.5">
        <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-neutral-700"></div>
        <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-neutral-700"></div>
        <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-neutral-700"></div>
      </div>
    </div>
  </div>
);
