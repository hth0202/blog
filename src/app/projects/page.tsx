import { ProjectsContent } from '@/components/project/ProjectsContent';

import { getProjectsFromNotion } from '@/services/notion-api';

import { ProjectCategory } from '@/types/blog';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '작업 | 태피스토리',
  description: '태피가 참여한 서비스 기획 및 PM 작업물 모음',
};

export const revalidate = 300;

async function getProjectsData() {
  try {
    const allProjects = await getProjectsFromNotion();
    const projects = allProjects.filter((p) => p.status === '발행');

    const categorySet = new Set<string>();
    projects.forEach((project) => {
      if (project.category && project.category !== '기타') {
        categorySet.add(project.category);
      }
    });

    const categories: ProjectCategory[] = [
      { id: 'all', name: '전체보기' },
      ...Array.from(categorySet).map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
      })),
    ];

    return { projects, categories };
  } catch (error) {
    console.error('프로젝트 데이터 가져오기 실패:', error);
    return { projects: [], categories: [{ id: 'all', name: '전체보기' }] };
  }
}

export default async function ProjectsPage() {
  const { projects, categories } = await getProjectsData();

  return (
    <ProjectsContent
      initialProjects={projects}
      initialCategories={categories}
    />
  );
}
