import Link from 'next/link';
import React from 'react';

import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`} className="group block h-full">
      <div className="flex h-full flex-col rounded-lg p-4 transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:bg-gray-50 group-hover:shadow-lg dark:group-hover:bg-gray-800/50 dark:group-hover:shadow-gray-800/60">
        <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-full w-full bg-gray-200 object-cover dark:bg-gray-700"
          />
        </div>
        <div className="flex flex-grow flex-col">
          <h3 className="text-lg font-bold">{project.name}</h3>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            {project.role}
          </p>
          <p className="mt-2 flex-grow text-sm text-gray-600 dark:text-gray-300">
            {project.contentPreview}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
  <div className="flex h-full animate-pulse flex-col p-4">
    <div className="mb-4 aspect-video w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
    <div className="flex flex-grow flex-col">
      <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-3 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-1 h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export default ProjectCard;
