import React from 'react';

import { Post, Category, Project, ProjectCategory } from './types/blog';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'all', name: '전체보기' },
  { id: 'category-1', name: '카테고리 1' },
  { id: 'category-2', name: '카테고리 2' },
  { id: 'category-3', name: '카테고리 3' },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    category: '카테고리 1',
    title: '첫 번째 블로그 포스트 타이틀',
    date: '2024.07.21',
    contentPreview:
      '첫 번째 포스트의 미리보기 내용입니다. 이 내용은 블로그 목록 페이지에서 보여집니다. 사용자가 흥미를 느낄 수 있도록 작성합니다...',
    tags: ['리액트', '타입스크립트', '웹개발'],
    thumbnailUrl: 'https://picsum.photos/seed/post1/400/300',
    content: `
이것은 첫 번째 블로그 포스트의 전체 내용입니다. 마크다운 형식이나 HTML을 사용하여 풍부한 콘텐츠를 작성할 수 있습니다.

이미지, 코드 블록, 인용문 등 다양한 요소를 포함하여 가독성을 높일 수 있습니다.

![Post content image](https://picsum.photos/seed/post1-content/600/400)

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

글의 나머지 부분은 여기에 계속됩니다. 상세하고 유용한 정보를 제공하는 것이 중요합니다.
    `,
    views: 152,
    status: '발행',
  },
  {
    id: 2,
    category: '카테고리 2',
    title: '두 번째 포스트: 상태 관리에 대하여',
    date: '2024.07.20',
    contentPreview:
      '상태 관리는 모든 프론트엔드 애플리케이션에서 중요한 부분입니다. 이 글에서는 다양한 상태 관리 라이브러리를 비교 분석합니다...',
    tags: ['상태관리', '리덕스', '리코일'],
    thumbnailUrl: 'https://picsum.photos/seed/post2/400/300',
    content: `
두 번째 포스트 본문입니다. 상태 관리에 대한 깊이 있는 내용을 다룹니다.

각 라이브러리의 장단점을 비교하고, 어떤 상황에서 어떤 라이브러리를 선택하는 것이 좋은지에 대한 가이드를 제공합니다.
    `,
    views: 320,
    status: '발행',
  },
  {
    id: 3,
    category: '카테고리 1',
    title: '세 번째 글, UI/UX 디자인 원칙',
    date: '2024.07.19',
    contentPreview:
      '좋은 사용자 경험을 제공하기 위한 UI/UX 디자인의 핵심 원칙들을 알아봅니다. 사용성과 심미성 사이의 균형을 찾는 방법을 논의합니다...',
    tags: ['UI/UX', '디자인', '프론트엔드'],
    thumbnailUrl: 'https://picsum.photos/seed/post3/400/300',
    content: `
세 번째 포스트 본문입니다. UI/UX 디자인 원칙에 대해 설명합니다.

사용자 중심 디자인의 중요성과 실제 프로젝트에 적용하는 방법에 대한 팁을 공유합니다.
    `,
    views: 88,
    status: '발행',
  },
  {
    id: 4,
    category: '카테고리 3',
    title: '네 번째: 백엔드와의 효율적인 협업',
    date: '2024.07.18',
    contentPreview:
      '프론트엔드 개발자로서 백엔드 개발자와 원활하게 소통하고 협업하는 방법에 대한 실용적인 조언을 공유합니다. API 명세의 중요성...',
    tags: ['협업', '백엔드', 'API'],
    thumbnailUrl: 'https://picsum.photos/seed/post4/400/300',
    content: `
네 번째 포스트 본문입니다. 백엔드와의 협업에 대해 이야기합니다.

효율적인 API 설계와 문서화, 그리고 커뮤니케이션 전략에 대해 다룹니다.
    `,
    views: 215,
    status: '발행',
  },
];

export const MOCK_PROJECT_CATEGORIES: ProjectCategory[] = [
  { id: 'all', name: '전체보기' },
  { id: 'project-cat-1', name: '카테고리 1' },
  { id: 'project-cat-2', name: '카테고리 2' },
  { id: 'project-cat-3', name: '카테고리 3' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    category: '카테고리 1',
    name: '프로젝트 A',
    role: 'UX/UI Designer',
    contentPreview: '사용자 중심 디자인으로 앱 리뉴얼.',
    tags: ['Figma', 'UX Research', 'Prototyping'],
    thumbnailUrl: 'https://picsum.photos/seed/proj1/500/400',
    date: '2024.06.15',
    views: 450,
    content: `
프로젝트 A의 상세 설명입니다. 이 프로젝트는 사용자 경험을 개선하기 위해 기존 앱을 리디자인하는 것을 목표로 했습니다.

![Project A content image](https://picsum.photos/seed/proj1-content/600/400)

주요 역할은 UX 리서치, 와이어프레이밍, 프로토타이핑 및 최종 UI 디자인이었습니다. Figma를 사용하여 디자인 시스템을 구축했습니다.
    `,
  },
  {
    id: 2,
    category: '카테고리 2',
    name: '프로젝트 B',
    role: 'Frontend Developer',
    contentPreview: 'React 기반의 인터랙티브 웹사이트 개발.',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    thumbnailUrl: 'https://picsum.photos/seed/proj2/500/400',
    date: '2024.05.20',
    views: 620,
    content: `
React와 TypeScript를 사용하여 인터랙티브한 마케팅 웹사이트를 개발했습니다. Tailwind CSS를 활용하여 빠른 반응형 UI를 구현했습니다.

주요 기능으로는 GSAP를 이용한 스크롤 애니메이션과 사용자 상호작용 기능이 있습니다.
    `,
  },
  {
    id: 3,
    category: '카테고리 3',
    name: '프로젝트 C',
    role: 'Project Manager',
    contentPreview: '애자일 방법론을 적용한 팀 관리.',
    tags: ['Jira', 'Agile', 'Scrum'],
    thumbnailUrl: 'https://picsum.photos/seed/proj3/500/400',
    date: '2024.04.10',
    views: 310,
    content: `
개발팀의 프로젝트 매니저로서 애자일 스크럼 방법론을 도입하여 팀의 생산성을 20% 향상시켰습니다.

Jira를 사용하여 스프린트를 계획하고 백로그를 관리했으며, 정기적인 회고를 통해 팀의 프로세스를 지속적으로 개선했습니다.
    `,
  },
  {
    id: 4,
    category: '카테고리 1',
    name: '프로젝트 D',
    role: 'UX/UI Designer',
    contentPreview: '새로운 디자인 시스템 구축.',
    tags: ['Design System', 'Figma', 'Storybook'],
    thumbnailUrl: 'https://picsum.photos/seed/proj4/500/400',
    date: '2024.03.18',
    views: 580,
    content: `
여러 제품에서 일관된 사용자 경험을 제공하기 위해 새로운 디자인 시스템을 구축했습니다.

Figma에서 컴포넌트를 설계하고, Storybook을 사용하여 개발팀과 협업하여 React 컴포넌트 라이브러리를 만들었습니다.
    `,
  },
  {
    id: 5,
    category: '카테고리 2',
    name: '프로젝트 E',
    role: 'Frontend Developer',
    contentPreview: 'Next.js를 활용한 SSR 웹 애플리케이션.',
    tags: ['Next.js', 'React', 'Vercel'],
    thumbnailUrl: 'https://picsum.photos/seed/proj5/500/400',
    date: '2024.02.25',
    views: 750,
    content: `
Next.js를 사용하여 SEO에 최적화된 서버 사이드 렌더링(SSR) 웹 애플리케이션을 구축했습니다.

Vercel을 통해 CI/CD 파이프라인을 자동화하고, 빠른 성능과 안정적인 서비스를 제공했습니다.
    `,
  },
  {
    id: 6,
    category: '카테고리 3',
    name: '프로젝트 F',
    role: 'Product Owner',
    contentPreview: '신규 서비스 기획 및 로드맵 수립.',
    tags: ['Product', 'Roadmap', 'Strategy'],
    thumbnailUrl: 'https://picsum.photos/seed/proj6/500/400',
    date: '2024.01.30',
    views: 490,
    content: `
신규 B2B SaaS 서비스의 Product Owner로서 시장 조사를 통해 제품 비전을 수립하고, 구체적인 로드맵을 작성했습니다.

고객 인터뷰와 데이터 분석을 기반으로 사용자 스토리를 작성하고, 개발팀과 긴밀하게 협력하여 제품을 성공적으로 출시했습니다.
    `,
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
