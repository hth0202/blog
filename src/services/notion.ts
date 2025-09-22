import {
  getPostsFromNotion,
  getPostByIdFromNotion,
  getCategoriesFromNotion,
  getProjectsFromNotion,
  getProjectByIdFromNotion,
} from './notion-api';
import { Post, Category, Project, ProjectCategory } from '../types/blog';

export const getPosts = async (): Promise<Post[]> => {
  try {
    return await getPostsFromNotion();
  } catch (error) {
    console.error('포스트 목록 조회 실패:', error);
    return [];
  }
};

export const getPostById = async (id: string): Promise<Post | undefined> => {
  try {
    return await getPostByIdFromNotion(id);
  } catch (error) {
    console.error('포스트 조회 실패:', error);
    return undefined;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    return await getCategoriesFromNotion();
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return [{ id: 'all', name: '전체보기' }];
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    return await getProjectsFromNotion();
  } catch (error) {
    console.error('프로젝트 목록 조회 실패:', error);
    return [];
  }
};

export const getProjectById = async (
  id: string,
): Promise<Project | undefined> => {
  try {
    return await getProjectByIdFromNotion(id);
  } catch (error) {
    console.error('프로젝트 조회 실패:', error);
    return undefined;
  }
};

export const getProjectCategories = async (): Promise<ProjectCategory[]> => {
  try {
    const projects = await getProjectsFromNotion();
    const categorySet = new Set<string>();

    projects.forEach((project) => {
      if (project.category && project.category !== '기타') {
        categorySet.add(project.category);
      }
    });

    const categories: ProjectCategory[] = [
      { id: 'all', name: '전체보기' },
      ...Array.from(categorySet).map((category) => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
      })),
    ];

    return categories;
  } catch (error) {
    console.error('프로젝트 카테고리 조회 실패:', error);
    return [{ id: 'all', name: '전체보기' }];
  }
};
