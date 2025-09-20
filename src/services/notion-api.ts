import { NotionAPI } from 'notion-client';
import { getPageTitle, parsePageId } from 'notion-utils';

import type { Post, Category, Project } from '@/types/blog';
import type { CustomCollectionInstance } from '@/types/notion';

import type { ExtendedRecordMap } from 'notion-types';

export const notion = new NotionAPI({
  authToken: process.env.NOTION_AUTH_TOKEN,
});

// 환경 변수
const NOTION_POST_DATABASE_ID = parsePageId(
  process.env.NOTION_DATABASE_POST_LINK,
);
const NOTION_PROJECTS_DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID;

/**
 * Notion 페이지의 전체 데이터를 가져오는 함수
 * @param pageId - Notion 페이지 ID
 * @returns ExtendedRecordMap 객체
 */
export const getNotionPage = async (
  pageId: string,
): Promise<ExtendedRecordMap | null> => {
  try {
    if (!pageId) {
      console.warn('페이지 ID가 제공되지 않았습니다.');
      return null;
    }

    const recordMap = await notion.getPage(pageId);
    return recordMap;
  } catch (error) {
    console.error('Notion 페이지 조회 실패:', error);
    return null;
  }
};

/**
 * 간단한 페이지 제목 추출 함수
 * @param recordMap - ExtendedRecordMap
 * @param _pageId - 페이지 ID (현재 사용하지 않음)
 * @returns 페이지 제목
 */
export const extractPageTitle = (
  recordMap: ExtendedRecordMap,
  _pageId: string,
): string => {
  try {
    // getPageTitle은 recordMap만 받는 것 같으므로 수정
    const title = getPageTitle(recordMap) || '제목 없음';
    return title;
  } catch (error) {
    console.error('제목 추출 실패:', error);
    return '제목 없음';
  }
};

/**
 * 기본 Post 객체 생성 함수
 * @param pageId - 페이지 ID
 * @param title - 제목
 * @returns Post 객체
 */
export const createBasicPost = (pageId: string, title: string): Post => {
  return {
    id: parseInt(pageId.replace(/-/g, '').slice(-8), 16),
    category: '기타',
    title,
    date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    contentPreview: '내용을 불러오는 중...',
    tags: [],
    thumbnailUrl: 'https://picsum.photos/400/300',
    content: '내용을 불러오는 중...',
    views: 0,
  };
};

/**
 * 기본 Project 객체 생성 함수
 * @param pageId - 페이지 ID
 * @param name - 프로젝트명
 * @returns Project 객체
 */
export const createBasicProject = (pageId: string, name: string): Project => {
  return {
    id: parseInt(pageId.replace(/-/g, '').slice(-8), 16),
    category: '기타',
    name,
    role: '역할 없음',
    contentPreview: '내용을 불러오는 중...',
    tags: [],
    thumbnailUrl: 'https://picsum.photos/500/400',
    date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    content: '내용을 불러오는 중...',
    views: 0,
  };
};

/**
 * Notion 컬렉션 데이터를 가져오는 함수
 * @param databaseId - 데이터베이스 ID
 * @returns CollectionInstance 객체
 */
export const getNotionCollectionData = async (
  databaseId: string,
): Promise<CustomCollectionInstance | null> => {
  try {
    if (!databaseId) {
      console.warn('데이터베이스 ID가 제공되지 않았습니다.');
      return null;
    }

    // 먼저 데이터베이스 페이지를 가져와서 컬렉션 정보 추출
    const recordMap = await notion.getPage(databaseId, {
      fetchCollections: true,
    });

    if (!recordMap || !recordMap.collection) {
      console.warn('컬렉션을 찾을 수 없습니다.');
      return null;
    }

    // 첫 번째 컬렉션과 컬렉션 뷰 찾기
    const collectionId = Object.keys(recordMap.collection)[0];
    const collectionViewId = Object.keys(recordMap.collection_view || {})[0];

    if (!collectionId || !collectionViewId) {
      console.warn('컬렉션 ID 또는 뷰 ID를 찾을 수 없습니다.');
      return null;
    }

    // 컬렉션 데이터 가져오기
    const collectionData = await notion.getCollectionData(
      collectionId,
      collectionViewId,
      recordMap.collection_view?.[collectionViewId]?.value,
      {
        limit: 100,
      },
    );

    return collectionData;
  } catch (error) {
    console.error('Notion 컬렉션 데이터 조회 실패:', error);
    return null;
  }
};

/**
 * Notion 컬렉션 데이터를 Post 배열로 변환하는 함수
 * @param collectionData - CollectionInstance 객체
 * @returns Post 배열
 */
export const transformCollectionToPosts = (
  collectionData: CustomCollectionInstance,
): Post[] => {
  try {
    const posts: Post[] = [];

    // 실제 데이터 구조에 맞게 수정: allBlockIds 배열 사용
    const blockIds: string[] =
      collectionData.allBlockIds ||
      Object.keys(collectionData.recordMap?.block || {});

    if (!blockIds || blockIds.length === 0) {
      return posts;
    }

    blockIds.forEach((blockId: string) => {
      const block = collectionData.recordMap?.block?.[blockId]?.value;
      if (!block || block.type !== 'page') return;

      try {
        const properties = (block.properties || {}) as Record<string, unknown>;

        // 제목 추출
        const titleProperty = properties.title || properties.Name || [];
        const title =
          Array.isArray(titleProperty) && titleProperty[0]
            ? titleProperty[0][0] || '제목 없음'
            : '제목 없음';

        // 카테고리 추출
        const categoryProperty =
          properties.Category || properties.category || [];
        const category =
          Array.isArray(categoryProperty) && categoryProperty[0]
            ? categoryProperty[0][0] || '기타'
            : '기타';

        // 날짜 추출
        const dateProperty = properties.Date || properties.date || [];
        const dateValue =
          Array.isArray(dateProperty) && dateProperty[0] && dateProperty[0][1]
            ? dateProperty[0][1][0][1].start_date
            : null;
        const date = dateValue
          ? new Date(dateValue).toISOString().split('T')[0].replace(/-/g, '.')
          : new Date(block.created_time)
              .toISOString()
              .split('T')[0]
              .replace(/-/g, '.');

        // 태그 추출
        const tagsProperty = properties.Tags || properties.tags || [];
        const tags: string[] = [];
        if (
          Array.isArray(tagsProperty) &&
          tagsProperty[0] &&
          tagsProperty[0][0]
        ) {
          const tagIds = tagsProperty[0][0].split(',');
          // 실제 태그 이름은 컬렉션 스키마에서 가져와야 하지만, 일단 ID 사용
          tags.push(...tagIds.filter(Boolean));
        }

        // 썸네일 URL 추출
        const thumbnailProperty =
          properties.Thumbnail || properties.thumbnail || [];
        const thumbnailUrl =
          Array.isArray(thumbnailProperty) && thumbnailProperty[0]
            ? thumbnailProperty[0][0] || 'https://picsum.photos/400/300'
            : 'https://picsum.photos/400/300';

        // 조회수 추출
        const viewsProperty = properties.Views || properties.views || [];
        const views =
          Array.isArray(viewsProperty) && viewsProperty[0]
            ? parseInt(viewsProperty[0][0]) || 0
            : 0;

        const post: Post = {
          id: parseInt(blockId.replace(/-/g, '').slice(-8), 16),
          category,
          title,
          date,
          contentPreview: `${title}의 미리보기 내용입니다...`,
          tags,
          thumbnailUrl,
          content: `${title}의 전체 내용입니다...`,
          views,
        };

        posts.push(post);
      } catch (blockError) {
        console.error(`블록 ${blockId} 변환 실패:`, blockError);
      }
    });

    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch (error) {
    console.error('컬렉션 데이터 변환 실패:', error);
    return [];
  }
};

/**
 * Notion 데이터베이스에서 포스트 목록을 가져오는 함수 (개선된 버전)
 * @param databaseId - 데이터베이스 ID (선택사항)
 * @returns Post 배열
 */
export const getPostsFromNotion = async (
  databaseId?: string,
): Promise<Post[]> => {
  try {
    const targetDatabaseId = databaseId || NOTION_POST_DATABASE_ID;

    if (!targetDatabaseId) {
      console.warn('NOTION_DATABASE_ID가 설정되지 않았습니다.');
      return [];
    }

    // 컬렉션 데이터 가져오기
    const collectionData = await getNotionCollectionData(targetDatabaseId);

    if (!collectionData) {
      console.warn('컬렉션 데이터를 가져올 수 없습니다.');
      return [];
    }

    // 컬렉션 데이터를 Post 배열로 변환
    const posts = transformCollectionToPosts(collectionData);

    console.warn(`Notion에서 ${posts.length}개의 포스트를 가져왔습니다.`);
    return posts;
  } catch (error) {
    console.error('Notion에서 포스트 가져오기 실패:', error);
    return [];
  }
};

/**
 * Notion 컬렉션 데이터를 Project 배열로 변환하는 함수
 * @param collectionData - CollectionInstance 객체
 * @returns Project 배열
 */
export const transformCollectionToProjects = (
  collectionData: CustomCollectionInstance,
): Project[] => {
  try {
    const projects: Project[] = [];

    // 실제 데이터 구조에 맞게 수정: allBlockIds 배열 사용
    const blockIds: string[] =
      collectionData.allBlockIds ||
      Object.keys(collectionData.recordMap?.block || {});

    if (!blockIds || blockIds.length === 0) {
      return projects;
    }

    blockIds.forEach((blockId: string) => {
      const block = collectionData.recordMap?.block?.[blockId]?.value;
      if (!block || block.type !== 'page') return;

      try {
        // 페이지 속성들 추출 (타입 안전하게)
        const properties = (block.properties || {}) as Record<string, unknown>;

        // 프로젝트명 추출
        const nameProperty =
          properties.Name || properties.name || properties.title || [];
        const name =
          Array.isArray(nameProperty) && nameProperty[0]
            ? nameProperty[0][0] || '프로젝트명 없음'
            : '프로젝트명 없음';

        // 카테고리 추출
        const categoryProperty =
          properties.Category || properties.category || [];
        const category =
          Array.isArray(categoryProperty) && categoryProperty[0]
            ? categoryProperty[0][0] || '기타'
            : '기타';

        // 역할 추출
        const roleProperty = properties.Role || properties.role || [];
        const role =
          Array.isArray(roleProperty) && roleProperty[0]
            ? roleProperty[0][0] || '역할 없음'
            : '역할 없음';

        // 날짜 추출
        const dateProperty = properties.Date || properties.date || [];
        const dateValue =
          Array.isArray(dateProperty) && dateProperty[0] && dateProperty[0][1]
            ? dateProperty[0][1][0][1].start_date
            : null;
        const date = dateValue
          ? new Date(dateValue).toISOString().split('T')[0].replace(/-/g, '.')
          : new Date(block.created_time)
              .toISOString()
              .split('T')[0]
              .replace(/-/g, '.');

        // 태그 추출
        const tagsProperty = properties.Tags || properties.tags || [];
        const tags: string[] = [];
        if (
          Array.isArray(tagsProperty) &&
          tagsProperty[0] &&
          tagsProperty[0][0]
        ) {
          const tagIds = tagsProperty[0][0].split(',');
          tags.push(...tagIds.filter(Boolean));
        }

        // 썸네일 URL 추출
        const thumbnailProperty =
          properties.Thumbnail || properties.thumbnail || [];
        const thumbnailUrl =
          Array.isArray(thumbnailProperty) && thumbnailProperty[0]
            ? thumbnailProperty[0][0] || 'https://picsum.photos/500/400'
            : 'https://picsum.photos/500/400';

        // 조회수 추출
        const viewsProperty = properties.Views || properties.views || [];
        const views =
          Array.isArray(viewsProperty) && viewsProperty[0]
            ? parseInt(viewsProperty[0][0]) || 0
            : 0;

        const project: Project = {
          id: parseInt(blockId.replace(/-/g, '').slice(-8), 16),
          category,
          name,
          role,
          contentPreview: `${name}의 미리보기 내용입니다...`,
          tags,
          thumbnailUrl,
          date,
          content: `${name}의 전체 내용입니다...`,
          views,
        };

        projects.push(project);
      } catch (blockError) {
        console.error(`프로젝트 블록 ${blockId} 변환 실패:`, blockError);
      }
    });

    return projects.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch (error) {
    console.error('프로젝트 컬렉션 데이터 변환 실패:', error);
    return [];
  }
};

/**
 * Notion 데이터베이스에서 프로젝트 목록을 가져오는 함수 (개선된 버전)
 * @param databaseId - 프로젝트 데이터베이스 ID (선택사항)
 * @returns Project 배열
 */
export const getProjectsFromNotion = async (
  databaseId?: string,
): Promise<Project[]> => {
  try {
    const targetDatabaseId = databaseId || NOTION_PROJECTS_DATABASE_ID;

    if (!targetDatabaseId) {
      console.warn('NOTION_PROJECTS_DATABASE_ID가 설정되지 않았습니다.');
      return [];
    }

    // 컬렉션 데이터 가져오기
    const collectionData = await getNotionCollectionData(targetDatabaseId);

    if (!collectionData) {
      console.warn('프로젝트 컬렉션 데이터를 가져올 수 없습니다.');
      return [];
    }

    // 컬렉션 데이터를 Project 배열로 변환
    const projects = transformCollectionToProjects(collectionData);

    console.warn(`Notion에서 ${projects.length}개의 프로젝트를 가져왔습니다.`);
    return projects;
  } catch (error) {
    console.error('Notion에서 프로젝트 가져오기 실패:', error);
    return [];
  }
};

/**
 * Notion에서 특정 포스트를 ID로 가져오는 함수
 * @param postId - 포스트 ID (숫자 또는 Notion 페이지 ID)
 * @returns Post 객체 또는 undefined
 */
export const getPostByIdFromNotion = async (
  postId: number | string,
): Promise<Post | undefined> => {
  try {
    if (typeof postId === 'number') {
      const posts = await getPostsFromNotion();
      return posts.find((post) => post.id === postId);
    }

    const recordMap = await notion.getPage(postId);
    if (!recordMap) {
      return undefined;
    }

    const title = extractPageTitle(recordMap, postId);
    return createBasicPost(postId, title);
  } catch (error) {
    console.error('Notion에서 포스트 가져오기 실패:', error);
    return undefined;
  }
};

/**
 * Notion에서 특정 프로젝트를 ID로 가져오는 함수
 * @param projectId - 프로젝트 ID (숫자 또는 Notion 페이지 ID)
 * @returns Project 객체 또는 undefined
 */
export const getProjectByIdFromNotion = async (
  projectId: number | string,
): Promise<Project | undefined> => {
  try {
    if (typeof projectId === 'number') {
      const projects = await getProjectsFromNotion();
      return projects.find((project) => project.id === projectId);
    }

    const recordMap = await notion.getPage(projectId);
    if (!recordMap) {
      return undefined;
    }

    const name = extractPageTitle(recordMap, projectId);
    return createBasicProject(projectId, name);
  } catch (error) {
    console.error('Notion에서 프로젝트 가져오기 실패:', error);
    return undefined;
  }
};

/**
 * Notion 데이터베이스에서 카테고리 목록을 추출하는 함수
 * @param databaseId - 데이터베이스 ID (선택사항)
 * @returns Category 배열
 */
export const getCategoriesFromNotion = async (
  databaseId?: string,
): Promise<Category[]> => {
  try {
    const posts = await getPostsFromNotion(databaseId);
    const categorySet = new Set<string>();

    posts.forEach((post) => {
      if (post.category && post.category !== '기타') {
        categorySet.add(post.category);
      }
    });

    const categories: Category[] = [
      { id: 'all', name: '전체보기' },
      ...Array.from(categorySet).map((category) => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
      })),
    ];

    return categories;
  } catch (error) {
    console.error('Notion에서 카테고리 가져오기 실패:', error);
    return [];
  }
};
