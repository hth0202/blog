import React from 'react';

import { Project, ProjectCategory } from './types/blog';

export const MOCK_PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'all', name: '전체보기' },
  { id: 'project-cat-1', name: '카테고리 1' },
  { id: 'project-cat-2', name: '카테고리 2' },
  { id: 'project-cat-3', name: '카테고리 3' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    rawId: '1',
    category: '카테고리 1',
    name: '프로젝트 A',
    role: 'UX/UI Designer',
    contentPreview: '사용자 중심 디자인으로 앱 리뉴얼.',
    tags: ['Figma', 'UX Research', 'Prototyping'],
    thumbnailUrl: 'https://picsum.photos/seed/proj1/500/400',
    date: '2024.06.15',
    views: 450,
  },
  {
    id: '2',
    rawId: '2',
    category: '카테고리 2',
    name: '프로젝트 B',
    role: 'Frontend Developer',
    contentPreview: 'React 기반의 인터랙티브 웹사이트 개발.',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    thumbnailUrl: 'https://picsum.photos/seed/proj2/500/400',
    date: '2024.05.20',
    views: 620,
  },
  {
    id: '3',
    rawId: '3',
    category: '카테고리 3',
    name: '프로젝트 C',
    role: 'Project Manager',
    contentPreview: '애자일 방법론을 적용한 팀 관리.',
    tags: ['Jira', 'Agile', 'Scrum'],
    thumbnailUrl: 'https://picsum.photos/seed/proj3/500/400',
    date: '2024.04.10',
    views: 310,
  },
  {
    id: '4',
    rawId: '4',
    category: '카테고리 1',
    name: '프로젝트 D',
    role: 'UX/UI Designer',
    contentPreview: '새로운 디자인 시스템 구축.',
    tags: ['Design System', 'Figma', 'Storybook'],
    thumbnailUrl: 'https://picsum.photos/seed/proj4/500/400',
    date: '2024.03.18',
    views: 580,
  },
  {
    id: '5',
    rawId: '5',
    category: '카테고리 2',
    name: '프로젝트 E',
    role: 'Frontend Developer',
    contentPreview: 'Next.js를 활용한 SSR 웹 애플리케이션.',
    tags: ['Next.js', 'React', 'Vercel'],
    thumbnailUrl: 'https://picsum.photos/seed/proj5/500/400',
    date: '2024.02.25',
    views: 750,
  },
  {
    id: '6',
    rawId: '6',
    category: '카테고리 3',
    name: '프로젝트 F',
    role: 'Product Owner',
    contentPreview: '신규 서비스 기획 및 로드맵 수립.',
    tags: ['Product', 'Roadmap', 'Strategy'],
    thumbnailUrl: 'https://picsum.photos/seed/proj6/500/400',
    date: '2024.01.30',
    views: 490,
  },
];

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

export const HeartIconFilled: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12"
    />
  </svg>
);

export const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export const ChevronDoubleDownIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
    />
  </svg>
);
