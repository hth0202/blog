import React from "react";
import Link from "next/link";
import { Project } from "../types";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`} className="group block h-full">
      <div className="flex flex-col h-full p-4 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-all duration-300 ease-in-out group-hover:shadow-lg dark:group-hover:shadow-gray-800/60 group-hover:-translate-y-1">
        <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg">
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-full object-cover bg-gray-200 dark:bg-gray-700"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="text-lg font-bold">{project.name}</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {project.role}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex-grow">
            {project.contentPreview}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
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
  <div className="animate-pulse flex flex-col h-full p-4">
    <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="flex flex-col flex-grow">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default ProjectCard;
