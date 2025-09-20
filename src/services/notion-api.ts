import { format } from 'date-fns';
import { NotionAPI } from 'notion-client';
import { getPageTitle } from 'notion-utils';
import pMap from 'p-map';
import pMemoize from 'p-memoize';

import { DATABASE_ID } from '@/services/database';

import type { Post, Category, Project } from '@/types/blog';
import type { CustomCollectionInstance } from '@/types/notion';

import type { ExtendedRecordMap } from 'notion-types';

// Notion 속성명 상수 관리
const enum PostProperties {
  TITLE = '제목',
  CATEGORY = '카테고리',
  TAGS = '태그',
  DESCRIPTION = '설명',
  VIEWS = '조회수',
  LIKES = '좋아요',
  AUTHOR = '작성자',
  STATUS = '상태',
}

// 프로젝트 속성명 상수 관리
const enum ProjectProperties {
  NAME = '프로젝트명',
  TITLE = '제목',
  CATEGORY = '카테고리',
  ROLE = '역할',
  TAGS = '태그',
  DESCRIPTION = '설명',
  THUMBNAIL = '썸네일',
  VIEWS = '조회수',
  LIKES = '좋아요',
}

export const notion = new NotionAPI({
  authToken: process.env.NOTION_AUTH_TOKEN,
});

// 환경 변수
const NOTION_POST_DATABASE_ID = DATABASE_ID.POST;
const NOTION_PROJECTS_DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID;

/**
 * Notion 페이지의 전체 데이터를 가져오는 함수 (메모이제이션 적용)
 * @param pageId - Notion 페이지 ID
 * @returns ExtendedRecordMap 객체
 */
const _getNotionPage = async (
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

// 메모이제이션 적용된 getNotionPage 함수
export const getNotionPage = pMemoize(_getNotionPage, {
  maxAge: 5 * 60 * 1000, // 5분 캐시
  cacheKey: (arguments_: [string]) => arguments_[0],
});

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
    date: format(new Date(), 'yyyy.MM.dd'),
    contentPreview: '내용을 불러오는 중...',
    tags: [],
    thumbnailUrl: 'https://picsum.photos/400/300',
    content: '내용을 불러오는 중...',
    views: 0,
    status: '백로그',
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
    date: format(new Date(), 'yyyy.MM.dd'),
    content: '내용을 불러오는 중...',
    views: 0,
  };
};

/**
 * Notion 컬렉션 데이터를 가져오는 함수 (메모이제이션 적용)
 * @param databaseId - 데이터베이스 ID
 * @returns CollectionInstance 객체
 */
const _getNotionCollectionData = async (
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

// 메모이제이션 적용된 getNotionCollectionData 함수
export const getNotionCollectionData = pMemoize(_getNotionCollectionData, {
  maxAge: 5 * 60 * 1000, // 5분 캐시
  cacheKey: (arguments_: [string]) => arguments_[0],
});

/**
 * Property ID를 실제 컬럼 이름으로 매핑하는 함수
 * @param collectionData - CollectionInstance 객체
 * @returns Property ID -> 컬럼 이름 매핑 객체
 */
const getPropertyNameMapping = (
  collectionData: CustomCollectionInstance,
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  try {
    // 컬렉션 스키마에서 property 정보 추출
    const collectionId = Object.keys(
      collectionData.recordMap?.collection || {},
    )[0];
    const collection =
      collectionData.recordMap?.collection?.[collectionId]?.value;

    if (collection?.schema) {
      Object.entries(collection.schema).forEach(
        ([propertyId, propertyInfo]: [string, unknown]) => {
          if (
            propertyInfo &&
            typeof propertyInfo === 'object' &&
            'name' in propertyInfo
          ) {
            mapping[propertyId] = (propertyInfo as { name: string }).name;
          }
        },
      );
    }
  } catch (error) {
    console.error('Property 매핑 생성 실패:', error);
  }

  return mapping;
};

/**
 * Property ID를 사용해서 실제 값을 추출하는 함수
 * @param properties - 블록의 properties 객체
 * @param propertyMapping - Property ID -> 이름 매핑
 * @param targetName - 찾고자 하는 컬럼 이름
 * @returns 추출된 값
 */
const getPropertyValue = (
  properties: Record<string, unknown>,
  propertyMapping: Record<string, string>,
  targetName: string,
): unknown => {
  // 1. 매핑을 통해 Property ID 찾기
  const propertyId = Object.keys(propertyMapping).find(
    (id) => propertyMapping[id].toLowerCase() === targetName.toLowerCase(),
  );

  if (propertyId && properties[propertyId]) {
    return properties[propertyId];
  }

  // 2. 직접 이름으로 찾기 (fallback)
  const directMatch =
    properties[targetName] || properties[targetName.toLowerCase()];
  if (directMatch) {
    return directMatch;
  }

  return null;
};

/**
 * 개별 페이지에서 썸네일 URL을 추출하는 함수 (메모이제이션 적용)
 * @param pageId - 페이지 ID
 * @param defaultSize - 기본 이미지 크기 (예: '400/300')
 * @returns 썸네일 URL 또는 기본 이미지 URL
 */
const _getThumbnailFromPage = async (
  pageId: string,
  defaultSize = '400/300',
): Promise<string> => {
  try {
    // 개별 페이지 정보를 가져옴
    const pageData = await notion.getPage(pageId);

    if (pageData?.block?.[pageId]?.value?.format) {
      const format = pageData.block[pageId].value.format;

      // 1. page_cover 확인
      if (format.page_cover) {
        console.warn('✅ 썸네일 사용: ', format.page_cover);
        return format.page_cover;
      }

      // 2. page_icon 확인 (이미지인 경우)
      if (
        format.page_icon &&
        typeof format.page_icon === 'string' &&
        format.page_icon.startsWith('http')
      ) {
        console.warn('✅ 썸네일 사용: ', format.page_icon);
        return format.page_icon;
      }
    }

    console.warn('❌ 개별 페이지에서 썸네일을 찾을 수 없음');
    return `https://picsum.photos/${defaultSize}`;
  } catch (error) {
    console.error('개별 페이지 정보 가져오기 실패:', error);
    return `https://picsum.photos/${defaultSize}`;
  }
};

// 메모이제이션 적용된 썸네일 가져오기 함수
const getThumbnailFromPage = pMemoize(_getThumbnailFromPage, {
  maxAge: 10 * 60 * 1000, // 10분 캐시
  cacheKey: (arguments_: [string, string?]) =>
    `${arguments_[0]}-${arguments_[1] || '400/300'}`,
});

/**
 * 여러 페이지를 병렬로 가져오는 함수 (메모이제이션 적용)
 * @param pageIds - 페이지 ID 배열
 * @returns ExtendedRecordMap 배열
 */
const _getMultiplePages = async (
  pageIds: string[],
): Promise<(ExtendedRecordMap | null)[]> => {
  return pMap(
    pageIds,
    async (pageId: string) => {
      try {
        return await notion.getPage(pageId);
      } catch (error) {
        console.error(`페이지 ${pageId} 가져오기 실패:`, error);
        return null;
      }
    },
    {
      concurrency: 6, // 동시 실행 개수 제한
    },
  );
};

// 메모이제이션 적용된 다중 페이지 가져오기 함수
export const getMultiplePages = pMemoize(_getMultiplePages, {
  maxAge: 3 * 60 * 1000, // 3분 캐시
  cacheKey: (arguments_: [string[]]) => arguments_[0].sort().join(','),
});

/**
 * Notion 컬렉션 데이터를 Post 배열로 변환하는 함수
 * @param collectionData - CollectionInstance 객체
 * @returns Post 배열
 */
export const transformCollectionToPosts = async (
  collectionData: CustomCollectionInstance,
): Promise<Post[]> => {
  try {
    // Property ID -> 컬럼 이름 매핑 생성
    const propertyMapping = getPropertyNameMapping(collectionData);

    // 실제 데이터 구조에 맞게 수정: allBlockIds 배열 사용
    const blockIds: string[] =
      collectionData.allBlockIds ||
      Object.keys(collectionData.recordMap?.block || {});

    if (!blockIds || blockIds.length === 0) {
      return [];
    }

    // p-map을 사용한 병렬 처리로 성능 개선
    const posts = await pMap(
      blockIds,
      async (blockId: string) => {
        const block = collectionData.recordMap?.block?.[blockId]?.value;
        if (!block || block.type !== 'page') return null;

        try {
          const properties = (block.properties || {}) as Record<
            string,
            unknown
          >;

          // 제목 추출 (상수 사용)
          const titleProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              PostProperties.TITLE,
            ) ||
            properties.title ||
            [];
          const title =
            Array.isArray(titleProperty) && titleProperty[0]
              ? titleProperty[0][0] || '제목 없음'
              : '제목 없음';

          // 카테고리 추출 (상수 사용)
          const categoryProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              PostProperties.CATEGORY,
            ) ||
            properties.Category ||
            [];
          const category =
            Array.isArray(categoryProperty) && categoryProperty[0]
              ? categoryProperty[0][0] || '기타'
              : '기타';

          // 날짜 추출 (상수 사용)
          const date = format(new Date(block.last_edited_time), 'yyyy.MM.dd');

          // 태그 추출 (상수 사용)
          const tagsProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              PostProperties.TAGS,
            ) ||
            properties.Tags ||
            [];
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

          // 설명을 contentPreview로 사용 (상수 사용)
          const descriptionProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              PostProperties.DESCRIPTION,
            ) || [];
          const contentPreview =
            Array.isArray(descriptionProperty) && descriptionProperty[0]
              ? descriptionProperty[0][0] || `${title}의 미리보기 내용입니다...`
              : `${title}의 미리보기 내용입니다...`;

          // 썸네일 URL 추출 (개별 페이지에서)
          const thumbnailUrl = await getThumbnailFromPage(blockId);

          // 조회수 추출 (상수 사용)
          const viewsProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              PostProperties.VIEWS,
            ) ||
            properties.Views ||
            [];
          const views =
            Array.isArray(viewsProperty) && viewsProperty[0]
              ? parseInt(viewsProperty[0][0]) || 0
              : 0;

          // 상태 추출
          const statusProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              PostProperties.STATUS,
            ) || [];
          const status =
            Array.isArray(statusProperty) && statusProperty[0]
              ? statusProperty[0][0] || '백로그'
              : '백로그';

          const post: Post = {
            id: parseInt(blockId.replace(/-/g, '').slice(-8), 16),
            category,
            title,
            date,
            contentPreview,
            tags,
            thumbnailUrl,
            content: `${title}의 전체 내용입니다...`,
            views,
            status,
          };

          return post;
        } catch (blockError) {
          console.error(`블록 ${blockId} 변환 실패:`, blockError);
          return null;
        }
      },
      {
        concurrency: 4, // 동시 실행 개수 제한
      },
    );

    // null 값 필터링
    const validPosts = posts.filter((post): post is Post => post !== null);

    return validPosts.sort(
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
    const posts = await transformCollectionToPosts(collectionData);

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
export const transformCollectionToProjects = async (
  collectionData: CustomCollectionInstance,
): Promise<Project[]> => {
  try {
    // Property ID -> 컬럼 이름 매핑 생성
    const propertyMapping = getPropertyNameMapping(collectionData);

    // 실제 데이터 구조에 맞게 수정: allBlockIds 배열 사용
    const blockIds: string[] =
      collectionData.allBlockIds ||
      Object.keys(collectionData.recordMap?.block || {});

    if (!blockIds || blockIds.length === 0) {
      return [];
    }

    // p-map을 사용한 병렬 처리로 성능 개선
    const projects = await pMap(
      blockIds,
      async (blockId: string) => {
        const block = collectionData.recordMap?.block?.[blockId]?.value;
        if (!block || block.type !== 'page') return null;

        try {
          // 페이지 속성들 추출 (타입 안전하게)
          const properties = (block.properties || {}) as Record<
            string,
            unknown
          >;

          // 프로젝트명 추출 (상수 사용)
          const nameProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.NAME,
            ) ||
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.TITLE,
            ) ||
            properties.Name ||
            [];
          const name =
            Array.isArray(nameProperty) && nameProperty[0]
              ? nameProperty[0][0] || '프로젝트명 없음'
              : '프로젝트명 없음';

          // 카테고리 추출 (상수 사용)
          const categoryProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.CATEGORY,
            ) ||
            properties.Category ||
            [];
          const category =
            Array.isArray(categoryProperty) && categoryProperty[0]
              ? categoryProperty[0][0] || '기타'
              : '기타';

          // 역할 추출 (상수 사용)
          const roleProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.ROLE,
            ) ||
            properties.Role ||
            [];
          const role =
            Array.isArray(roleProperty) && roleProperty[0]
              ? roleProperty[0][0] || '역할 없음'
              : '역할 없음';

          // 날짜 추출 (상수 사용)
          const date = format(new Date(block.last_edited_time), 'yyyy.MM.dd');

          // 태그 추출 (상수 사용)
          const tagsProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.TAGS,
            ) ||
            properties.Tags ||
            [];
          const tags: string[] = [];
          if (
            Array.isArray(tagsProperty) &&
            tagsProperty[0] &&
            tagsProperty[0][0]
          ) {
            const tagIds = tagsProperty[0][0].split(',');
            tags.push(...tagIds.filter(Boolean));
          }

          // 설명을 contentPreview로 사용 (상수 사용)
          const descriptionProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.DESCRIPTION,
            ) || [];
          const contentPreview =
            Array.isArray(descriptionProperty) && descriptionProperty[0]
              ? descriptionProperty[0][0] || `${name}의 미리보기 내용입니다...`
              : `${name}의 미리보기 내용입니다...`;

          // 썸네일 URL 추출 (개별 페이지에서)
          const thumbnailUrl = await getThumbnailFromPage(blockId, '500/400');

          // 조회수 추출 (상수 사용)
          const viewsProperty =
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.VIEWS,
            ) ||
            getPropertyValue(
              properties,
              propertyMapping,
              ProjectProperties.LIKES,
            ) ||
            properties.Views ||
            [];
          const views =
            Array.isArray(viewsProperty) && viewsProperty[0]
              ? parseInt(viewsProperty[0][0]) || 0
              : 0;

          const project: Project = {
            id: parseInt(blockId.replace(/-/g, '').slice(-8), 16),
            category,
            name,
            role,
            contentPreview,
            tags,
            thumbnailUrl,
            date,
            content: `${name}의 전체 내용입니다...`,
            views,
          };

          return project;
        } catch (blockError) {
          console.error(`프로젝트 블록 ${blockId} 변환 실패:`, blockError);
          return null;
        }
      },
      {
        concurrency: 4, // 동시 실행 개수 제한
      },
    );

    // null 값 필터링
    const validProjects = projects.filter(
      (project): project is Project => project !== null,
    );

    return validProjects.sort(
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
    const projects = await transformCollectionToProjects(collectionData);

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
