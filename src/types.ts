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

// Notion API 관련 타입들
export interface NotionDatabaseProperty {
  id: string;
  name: string;
  type: string;
}

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  url: string;
}

export interface NotionDatabase {
  id: string;
  title: Array<{
    type: string;
    text: {
      content: string;
    };
  }>;
  properties: Record<string, NotionDatabaseProperty>;
  created_time: string;
  last_edited_time: string;
}
