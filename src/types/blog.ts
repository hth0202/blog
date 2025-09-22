import { ExtendedRecordMap } from 'notion-types';

export interface Post {
  id: string;
  rawId: string;
  category: string;
  title: string;
  date: string;
  contentPreview: string;
  tags: string[];
  thumbnailUrl: string;
  views: number;
  status: '백로그' | '임시저장' | '발행';
  recordMap?: ExtendedRecordMap;
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
  views: number;
  recordMap?: ExtendedRecordMap;
}

export interface ProjectCategory {
  id: string;
  name: string;
}
