import {
  MOCK_POSTS,
  MOCK_CATEGORIES,
  MOCK_PROJECTS,
  MOCK_PROJECT_CATEGORIES,
} from '../constants';
import { Post, Category, Project, ProjectCategory } from '../types/blog';

// Simulate network delay to mimic real API calls
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getPosts = async (): Promise<Post[]> => {
  await delay(500);
  // In a real scenario, you would fetch this from your backend endpoint which calls the Notion API
  return MOCK_POSTS.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

export const getPostById = async (id: number): Promise<Post | undefined> => {
  await delay(300);
  return MOCK_POSTS.find((p) => p.id === id);
};

export const getCategories = async (): Promise<Category[]> => {
  await delay(200);
  return MOCK_CATEGORIES;
};

export const getProjects = async (): Promise<Project[]> => {
  await delay(500);
  return MOCK_PROJECTS.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
};

export const getProjectById = async (
  id: number,
): Promise<Project | undefined> => {
  await delay(300);
  return MOCK_PROJECTS.find((p) => p.id === id);
};

export const getProjectCategories = async (): Promise<ProjectCategory[]> => {
  await delay(200);
  return MOCK_PROJECT_CATEGORIES;
};
