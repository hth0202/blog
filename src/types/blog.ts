export interface Post {
  id: number;
  category: string;
  title: string;
  date: string;
  contentPreview: string;
  tags: string[];
  thumbnailUrl: string;
  content: string;
  views: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Project {
  id: number;
  category: string;
  name: string;
  role: string;
  contentPreview: string;
  tags: string[];
  thumbnailUrl: string;
  date: string;
  content: string;
  views: number;
}

export interface ProjectCategory {
  id: string;
  name: string;
}
