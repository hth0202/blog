import { notFound } from 'next/navigation';

import { ProjectsContent } from '@/components/project/ProjectsContent';

import { getProjectsFromNotion } from '@/services/notion-api';

import { ProjectCategory } from '@/types/blog';

export const revalidate = 10;

interface DraftPageProps {
  searchParams: Promise<{ secret?: string }>;
}

async function getProjectsData() {
  try {
    const allProjects = await getProjectsFromNotion();

    const categorySet = new Set<string>();
    allProjects.forEach((project) => {
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

    return { projects: allProjects, categories };
  } catch (error) {
    console.error('프로젝트 데이터 가져오기 실패:', error);
    return { projects: [], categories: [{ id: 'all', name: '전체보기' }] };
  }
}

export default async function ProjectsDraftPage({
  searchParams,
}: DraftPageProps) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const { secret } = await searchParams;

  if (!process.env.DRAFT_SECRET || secret !== process.env.DRAFT_SECRET) {
    notFound();
  }

  const { projects, categories } = await getProjectsData();

  return (
    <ProjectsContent
      initialProjects={projects}
      initialCategories={categories}
      secret={secret}
    />
  );
}
