export interface Post {
  id: string;
  rawId: string;
  slug: string; // 주소용: Notion 'ID' 번호, 없으면 id

  category: string;
  title: string;
  date: string; // 표시용: yyyy.MM.dd
  isoDate: string; // 정렬용: ISO 8601
  contentPreview: string;
  tags: string[];
  thumbnailUrl: string;
  views: number;
  likes: number;
  status: '백로그' | '임시저장' | '발행';
  blockAI?: boolean; // AI 크롤러 수집 차단 여부
}

export interface Category {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  rawId: string;
  slug: string; // 주소용: Notion 'ID' 번호, 없으면 id

  category: string;
  name: string;
  role: string;
  contentPreview: string;
  tags: string[];
  thumbnailUrl: string;
  date: string;
  dateEnd?: string;
  views: number;
  likes: number;
  status: '백로그' | '임시저장' | '발행';
  blockAI?: boolean; // AI 크롤러 수집 차단 여부
}

export interface ProjectCategory {
  id: string;
  name: string;
}

export interface PlaygroundImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  prompt: string;
  date: string;
  isoDate: string;
  views: number;
  copies: number;
  meta: import('@/lib/midjourney').MidjourneyMeta;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
