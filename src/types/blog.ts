export interface Post {
  id: string;
  rawId: string;
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
}

export interface Category {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  rawId: string;
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
}

export interface ProjectCategory {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
