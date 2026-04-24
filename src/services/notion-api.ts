import { Client } from '@notionhq/client';
import { format } from 'date-fns';
import { unstable_cache } from 'next/cache';
import { NotionToMarkdown } from 'notion-to-md';

import type { Post, Category, Project, Comment } from '@/types/blog';

import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

// 개발 중엔 캐시 끔 (새로고침하면 즉시 반영), 배포 후엔 자동으로 켜짐
const IS_DEV = process.env.NODE_ENV === 'development';
const TTL = (seconds: number): number | false => (IS_DEV ? false : seconds);

// 개발: 캐시 없이 원본 함수 그대로, 프로덕션: unstable_cache로 감쌈
function devCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string[],
  opts: { revalidate: number | false; tags: string[] },
): T {
  if (IS_DEV) return fn;
  return unstable_cache(fn, key, opts) as T;
}

// 공식 API 클라이언트
const notionClient = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

// 마크다운 변환기 (필요 시 사용)
const n2m = new NotionToMarkdown({ notionClient });

const NOTION_POST_DATABASE_ID = process.env.NOTION_DATABASE_POST_LINK || '';
const NOTION_PROJECTS_DATABASE_ID =
  process.env.NOTION_PROJECTS_DATABASE_ID || '';

// ─── 커버 이미지 추출 ────────────────────────────────────────────────────────

const extractCoverUrl = (
  cover: {
    type: string;
    external?: { url: string };
    file?: { url: string };
  } | null,
  pageId: string,
  fallback = 'https://picsum.photos/400/300',
): string => {
  if (!cover) return fallback;
  if (cover.type === 'external' && cover.external?.url)
    return cover.external.url;
  // file 타입: pageId 전달 → 프록시가 요청 시점에 신선한 URL 조회 (S3 만료 없음)
  if (cover.type === 'file')
    return `/api/notion-image?pageId=${pageId}&field=cover`;
  return fallback;
};

// ─── 페이지 본문 (공식 API → 블록 배열) ──────────────────────────────────────

const _getPageBlocks = async (
  pageId: string,
): Promise<BlockObjectResponse[]> => {
  if (!pageId) return [];
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notionClient.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    const validBlocks = response.results.filter(
      (b): b is BlockObjectResponse => 'type' in b,
    );
    blocks.push(...validBlocks);
    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  // has_children인 블록은 재귀적으로 children fetch
  // child_database / child_page는 별도 컴포넌트에서 처리하므로 제외
  // 개별 자식 fetch 실패는 해당 블록만 children 없이 처리 (전체 실패 방지)
  await Promise.all(
    blocks
      .filter(
        (b) =>
          b.has_children &&
          b.type !== 'child_database' &&
          b.type !== 'child_page',
      )
      .map(async (block) => {
        try {
          const children = await _getPageBlocks(block.id);
          (block as any).children = children;
        } catch (err) {
          console.error(
            `[getPageBlocks] 자식 블록 조회 실패 blockId=${block.id}:`,
            err,
          );
        }
      }),
  );

  return blocks;
};

export const getPageBlocks = devCache(_getPageBlocks, ['notion-blocks'], {
  revalidate: TTL(300),
  tags: ['notion-blocks'],
});

// ─── 스킬 DB 쿼리 (서버사이드 프리페치용) ────────────────────────────────────

export interface SkillItem {
  id: string;
  title: string;
  category: string;
  iconUrl: string | null;
  iconEmoji: string | null;
}

const _querySkillDatabase = async (dbId: string): Promise<SkillItem[]> => {
  try {
    const response = await notionClient.databases.query({
      database_id: dbId,
      page_size: 100,
    });

    return response.results
      .filter(
        (page): page is typeof page & { properties: Record<string, unknown> } =>
          'properties' in page,
      )
      .map((page) => {
        const props = page.properties as Record<string, any>;

        const titleProp = Object.values(props).find(
          (p: any) => p.type === 'title',
        );
        const title: string =
          titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '';

        const selectProp = Object.values(props).find(
          (p: any) => p.type === 'select',
        );
        const category: string = selectProp?.select?.name ?? '';

        const pageObj = page as any;
        let iconUrl: string | null = null;
        let iconEmoji: string | null = null;

        if (pageObj.icon) {
          if (pageObj.icon.type === 'emoji') {
            iconEmoji = pageObj.icon.emoji;
          } else if (
            pageObj.icon.type === 'file' ||
            pageObj.icon.type === 'external'
          ) {
            // file/external 모두 프록시로 라우팅:
            // file URL은 S3 서명 URL이라 1시간 후 만료됨 → 프록시가 요청 시점에 신선한 URL 재조회
            // external URL도 Notion 내부 S3 서명 URL일 수 있어 동일하게 처리
            iconUrl = `/api/notion-image?pageId=${page.id}&field=icon`;
          } else if (pageObj.icon.type === 'icon') {
            // Notion 내장 아이콘 라이브러리 (2023+ API) — 프록시로 라우팅해 에러 추적
            iconUrl = `/api/notion-image?pageId=${page.id}&field=icon`;
          }
        }

        return { id: page.id, title, category, iconUrl, iconEmoji };
      });
  } catch (error) {
    console.error('스킬 DB 조회 실패:', error);
    return [];
  }
};

export const querySkillDatabase = devCache(
  _querySkillDatabase,
  ['notion-skill-db'],
  { revalidate: TTL(300), tags: ['notion-blocks'] },
);

const _getSkillTextBlocks = async (
  pageId: string,
): Promise<RichTextItemResponse[][]> => {
  try {
    const response = await notionClient.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    return response.results
      .filter(
        (block): block is typeof block & { type: string } => 'type' in block,
      )
      .flatMap((block: any) => {
        const type: string = block.type;
        if (
          !['bulleted_list_item', 'numbered_list_item', 'paragraph'].includes(
            type,
          )
        )
          return [];
        const richText: RichTextItemResponse[] = block[type]?.rich_text ?? [];
        const hasText = richText.some((t: any) => t.plain_text);
        return hasText ? [richText] : [];
      });
  } catch {
    return [];
  }
};

export const getSkillTextBlocks = devCache(
  _getSkillTextBlocks,
  ['notion-skill-text'],
  { revalidate: TTL(600), tags: ['notion-blocks'] },
);

// ─── 페이지 본문 (공식 API → 마크다운 변환) ──────────────────────────────────

const _getPageMarkdown = async (pageId: string): Promise<string | null> => {
  try {
    if (!pageId) return null;
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    return n2m.toMarkdownString(mdBlocks)?.parent ?? null;
  } catch (error) {
    console.error('Notion 페이지 마크다운 변환 실패:', error);
    return null;
  }
};

export const getPageMarkdown = devCache(_getPageMarkdown, ['notion-markdown'], {
  revalidate: TTL(300),
  tags: ['notion-markdown'],
});

// ─── 공식 API: 포스트 목록 ────────────────────────────────────────────────────

const extractText = (richText: { plain_text: string }[]): string =>
  richText?.map((t) => t.plain_text).join('') || '';

const _getPostsFromNotion = async (databaseId?: string): Promise<Post[]> => {
  const targetId = databaseId || NOTION_POST_DATABASE_ID;
  if (!targetId) {
    console.warn('NOTION_DATABASE_POST_LINK이 설정되지 않았습니다.');
    return [];
  }

  try {
    const response = await notionClient.databases.query({
      database_id: targetId,
      sorts: [{ property: '날짜', direction: 'descending' }],
    });

    const posts: Post[] = response.results
      .filter(
        (page): page is typeof page & { properties: Record<string, unknown> } =>
          'properties' in page,
      )
      .map((page) => {
        const props = page.properties as Record<string, any>;

        const title =
          props['제목']?.type === 'title'
            ? extractText(
                (
                  props['제목'] as unknown as {
                    title: { plain_text: string }[];
                  }
                ).title,
              )
            : '제목 없음';

        const category =
          props['카테고리']?.type === 'select'
            ? ((props['카테고리'] as { select: { name: string } | null }).select
                ?.name ?? '기타')
            : '기타';

        const notionDate =
          props['날짜']?.type === 'date'
            ? (
                props['날짜'] as {
                  date: { start: string; end: string | null } | null;
                }
              ).date
            : null;
        const rawDate = notionDate?.start ?? null;
        const rawDateEnd = notionDate?.end ?? null;
        const date = rawDate
          ? format(new Date(rawDate), 'yyyy.MM.dd')
          : format(new Date(), 'yyyy.MM.dd');
        const dateEnd = rawDateEnd
          ? format(new Date(rawDateEnd), 'yyyy.MM.dd')
          : undefined;

        const tags =
          props['태그']?.type === 'multi_select'
            ? (
                (props['태그'] as { multi_select: { name: string }[] })
                  .multi_select ?? []
              ).map((t) => t.name)
            : [];

        const contentPreview =
          props['설명']?.type === 'rich_text'
            ? extractText(
                (props['설명'] as { rich_text: { plain_text: string }[] })
                  .rich_text,
              ) || `${title}의 미리보기 내용입니다...`
            : `${title}의 미리보기 내용입니다...`;

        const status =
          props['상태']?.type === 'status'
            ? (((props['상태'] as { status: { name: string } | null }).status
                ?.name as Post['status']) ?? '백로그')
            : props['상태']?.type === 'select'
              ? (((props['상태'] as { select: { name: string } | null }).select
                  ?.name as Post['status']) ?? '백로그')
              : '백로그';

        const views =
          props['조회수']?.type === 'number'
            ? ((props['조회수'] as { number: number | null }).number ?? 0)
            : 0;

        const likes =
          props['좋아요']?.type === 'number'
            ? ((props['좋아요'] as { number: number | null }).number ?? 0)
            : 0;

        const thumbnailUrl = extractCoverUrl(
          (
            page as {
              cover?: {
                type: string;
                external?: { url: string };
                file?: { url: string };
              } | null;
            }
          ).cover ?? null,
          page.id,
        );

        return {
          id: page.id.replace(/-/g, ''),
          rawId: page.id,
          title,
          category,
          date,
          isoDate: rawDate ?? new Date().toISOString(),
          tags,
          contentPreview,
          status,
          views,
          likes,
          thumbnailUrl,
        } satisfies Post;
      });

    return posts;
  } catch (error) {
    console.error('Notion에서 포스트 가져오기 실패:', error);
    return [];
  }
};

export const getPostsFromNotion = devCache(
  _getPostsFromNotion,
  ['notion-posts'],
  { revalidate: TTL(60), tags: ['notion-posts'] },
);

// ─── 공식 API: 프로젝트 목록 ──────────────────────────────────────────────────

const _getProjectsFromNotion = async (
  databaseId?: string,
): Promise<Project[]> => {
  const targetId = databaseId || NOTION_PROJECTS_DATABASE_ID;
  if (!targetId) {
    console.warn('NOTION_PROJECTS_DATABASE_ID가 설정되지 않았습니다.');
    return [];
  }

  try {
    const response = await notionClient.databases.query({
      database_id: targetId,
      sorts: [{ property: '날짜', direction: 'descending' }],
    });

    const projects: Project[] = response.results
      .filter(
        (page): page is typeof page & { properties: Record<string, unknown> } =>
          'properties' in page,
      )
      .map((page) => {
        const props = page.properties as Record<string, any>;

        const name =
          props['제목']?.type === 'title'
            ? extractText(
                (
                  props['제목'] as unknown as {
                    title: { plain_text: string }[];
                  }
                ).title,
              )
            : '제목 없음';

        const category =
          props['카테고리']?.type === 'select'
            ? ((props['카테고리'] as { select: { name: string } | null }).select
                ?.name ?? '기타')
            : '기타';

        const role =
          props['역할']?.type === 'select'
            ? ((props['역할'] as { select: { name: string } | null }).select
                ?.name ?? '')
            : props['역할']?.type === 'rich_text'
              ? extractText(
                  (props['역할'] as { rich_text: { plain_text: string }[] })
                    .rich_text,
                )
              : '';

        const notionDate =
          props['날짜']?.type === 'date'
            ? (
                props['날짜'] as {
                  date: { start: string; end: string | null } | null;
                }
              ).date
            : null;
        const rawDate = notionDate?.start ?? null;
        const rawDateEnd = notionDate?.end ?? null;
        const date = rawDate
          ? format(new Date(rawDate), 'yyyy.MM.dd')
          : format(new Date(), 'yyyy.MM.dd');
        const dateEnd = rawDateEnd
          ? format(new Date(rawDateEnd), 'yyyy.MM.dd')
          : undefined;

        const tags =
          props['태그']?.type === 'multi_select'
            ? (
                (props['태그'] as { multi_select: { name: string }[] })
                  .multi_select ?? []
              ).map((t) => t.name)
            : [];

        const contentPreview =
          props['설명']?.type === 'rich_text'
            ? extractText(
                (props['설명'] as { rich_text: { plain_text: string }[] })
                  .rich_text,
              ) || ''
            : '';

        const views =
          props['조회수']?.type === 'number'
            ? ((props['조회수'] as { number: number | null }).number ?? 0)
            : 0;

        const likes =
          props['좋아요']?.type === 'number'
            ? ((props['좋아요'] as { number: number | null }).number ?? 0)
            : 0;

        const status =
          props['상태']?.type === 'status'
            ? (((props['상태'] as { status: { name: string } | null }).status
                ?.name as Project['status']) ?? '백로그')
            : props['상태']?.type === 'select'
              ? (((props['상태'] as { select: { name: string } | null }).select
                  ?.name as Project['status']) ?? '백로그')
              : '백로그';

        const thumbnailUrl = extractCoverUrl(
          (
            page as {
              cover?: {
                type: string;
                external?: { url: string };
                file?: { url: string };
              } | null;
            }
          ).cover ?? null,
          page.id,
          'https://picsum.photos/500/400',
        );

        return {
          id: page.id.replace(/-/g, ''),
          rawId: page.id,
          name,
          category,
          role,
          date,
          dateEnd,
          tags,
          contentPreview,
          views,
          likes,
          status,
          thumbnailUrl,
        } satisfies Project;
      });

    return projects;
  } catch (error) {
    console.error('Notion에서 프로젝트 가져오기 실패:', error);
    return [];
  }
};

export const getProjectsFromNotion = devCache(
  _getProjectsFromNotion,
  ['notion-projects'],
  { revalidate: TTL(60), tags: ['notion-projects'] },
);

// ─── 단일 포스트 메타 조회 ────────────────────────────────────────────────────

const _getPostMetaById = async (postId: string): Promise<Post | undefined> => {
  try {
    const rawId = postId.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      '$1-$2-$3-$4-$5',
    );

    const page = await notionClient.pages.retrieve({ page_id: rawId });
    if (!('properties' in page)) return undefined;

    const props = page.properties as Record<string, any>;

    const status =
      props['상태']?.type === 'status'
        ? (((props['상태'] as { status: { name: string } | null }).status
            ?.name as Post['status']) ?? '백로그')
        : props['상태']?.type === 'select'
          ? (((props['상태'] as { select: { name: string } | null }).select
              ?.name as Post['status']) ?? '백로그')
          : '백로그';

    const title =
      props['제목']?.type === 'title'
        ? (props['제목'] as { title: { plain_text: string }[] }).title
            .map((t) => t.plain_text)
            .join('')
        : '제목 없음';

    const category =
      props['카테고리']?.type === 'select'
        ? ((props['카테고리'] as { select: { name: string } | null }).select
            ?.name ?? '기타')
        : '기타';

    const rawDate =
      props['날짜']?.type === 'date'
        ? ((props['날짜'] as { date: { start: string } | null }).date?.start ??
          null)
        : null;
    const date = rawDate
      ? format(new Date(rawDate), 'yyyy.MM.dd')
      : format(new Date(), 'yyyy.MM.dd');

    const tags =
      props['태그']?.type === 'multi_select'
        ? (
            (props['태그'] as { multi_select: { name: string }[] })
              .multi_select ?? []
          ).map((t) => t.name)
        : [];

    const contentPreview =
      props['설명']?.type === 'rich_text'
        ? (props['설명'] as { rich_text: { plain_text: string }[] }).rich_text
            .map((t) => t.plain_text)
            .join('') || ''
        : '';

    const views =
      props['조회수']?.type === 'number'
        ? ((props['조회수'] as { number: number | null }).number ?? 0)
        : 0;

    const likes =
      props['좋아요']?.type === 'number'
        ? ((props['좋아요'] as { number: number | null }).number ?? 0)
        : 0;

    const thumbnailUrl = extractCoverUrl(
      (
        page as {
          cover?: {
            type: string;
            external?: { url: string };
            file?: { url: string };
          } | null;
        }
      ).cover ?? null,
      rawId,
    );

    return {
      id: postId,
      rawId,
      title,
      category,
      date,
      isoDate: rawDate ?? new Date().toISOString(),
      tags,
      contentPreview,
      status,
      views,
      likes,
      thumbnailUrl,
    };
  } catch (error: any) {
    if (error?.status === 404 || error?.code === 'object_not_found') {
      return undefined;
    }
    console.error('Notion에서 포스트 메타 가져오기 실패:', error);
    throw error;
  }
};

export const getPostMetaById = devCache(
  _getPostMetaById,
  ['notion-post-meta'],
  { revalidate: TTL(300), tags: ['notion-post-meta'] },
);

// ─── 단일 프로젝트 메타 조회 ──────────────────────────────────────────────────

const _getProjectMetaById = async (
  projectId: string,
): Promise<Project | undefined> => {
  try {
    const rawId = projectId.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      '$1-$2-$3-$4-$5',
    );

    const page = await notionClient.pages.retrieve({ page_id: rawId });
    if (!('properties' in page)) return undefined;

    const props = page.properties as Record<string, any>;

    const name =
      props['제목']?.type === 'title'
        ? extractText(
            (props['제목'] as unknown as { title: { plain_text: string }[] })
              .title,
          )
        : '제목 없음';

    const category =
      props['카테고리']?.type === 'select'
        ? ((props['카테고리'] as { select: { name: string } | null }).select
            ?.name ?? '기타')
        : '기타';

    const role =
      props['역할']?.type === 'select'
        ? ((props['역할'] as { select: { name: string } | null }).select
            ?.name ?? '')
        : props['역할']?.type === 'rich_text'
          ? extractText(
              (props['역할'] as { rich_text: { plain_text: string }[] })
                .rich_text,
            )
          : '';

    const notionDate =
      props['날짜']?.type === 'date'
        ? (
            props['날짜'] as {
              date: { start: string; end: string | null } | null;
            }
          ).date
        : null;
    const rawDate = notionDate?.start ?? null;
    const rawDateEnd = notionDate?.end ?? null;
    const date = rawDate
      ? format(new Date(rawDate), 'yyyy.MM.dd')
      : format(new Date(), 'yyyy.MM.dd');
    const dateEnd = rawDateEnd
      ? format(new Date(rawDateEnd), 'yyyy.MM.dd')
      : undefined;

    const tags =
      props['태그']?.type === 'multi_select'
        ? (
            (props['태그'] as { multi_select: { name: string }[] })
              .multi_select ?? []
          ).map((t) => t.name)
        : [];

    const contentPreview =
      props['설명']?.type === 'rich_text'
        ? extractText(
            (props['설명'] as { rich_text: { plain_text: string }[] })
              .rich_text,
          ) || ''
        : '';

    const views =
      props['조회수']?.type === 'number'
        ? ((props['조회수'] as { number: number | null }).number ?? 0)
        : 0;

    const likes =
      props['좋아요']?.type === 'number'
        ? ((props['좋아요'] as { number: number | null }).number ?? 0)
        : 0;

    const status =
      props['상태']?.type === 'status'
        ? (((props['상태'] as { status: { name: string } | null }).status
            ?.name as Project['status']) ?? '백로그')
        : props['상태']?.type === 'select'
          ? (((props['상태'] as { select: { name: string } | null }).select
              ?.name as Project['status']) ?? '백로그')
          : '백로그';

    const thumbnailUrl = extractCoverUrl(
      (
        page as {
          cover?: {
            type: string;
            external?: { url: string };
            file?: { url: string };
          } | null;
        }
      ).cover ?? null,
      rawId,
      'https://picsum.photos/500/400',
    );

    return {
      id: projectId,
      rawId,
      name,
      category,
      role,
      date,
      dateEnd,
      tags,
      contentPreview,
      views,
      likes,
      status,
      thumbnailUrl,
    } satisfies Project;
  } catch (error: any) {
    if (error?.status === 404 || error?.code === 'object_not_found') {
      return undefined;
    }
    console.error('Notion에서 프로젝트 메타 가져오기 실패:', error);
    throw error;
  }
};

export const getProjectMetaById = devCache(
  _getProjectMetaById,
  ['notion-project-meta'],
  { revalidate: TTL(300), tags: ['notion-project-meta'] },
);

// ─── 댓글 ────────────────────────────────────────────────────────────────────

const AUTHOR_PREFIX = '[작성자: ';

export const getPageComments = async (pageId: string): Promise<Comment[]> => {
  try {
    const response = await notionClient.comments.list({ block_id: pageId });
    return response.results.map((comment) => {
      const text = comment.rich_text.map((t) => t.plain_text).join('');
      const match = text.match(/^\[작성자: (.+?)\]\n([\s\S]*)$/);
      return {
        id: comment.id,
        author: match ? match[1] : '익명',
        content: match ? match[2] : text,
        createdAt: comment.created_time,
      };
    });
  } catch (error) {
    console.error('Notion 댓글 조회 실패:', error);
    return [];
  }
};

export const createPageComment = async (
  pageId: string,
  author: string,
  content: string,
): Promise<void> => {
  await notionClient.comments.create({
    parent: { page_id: pageId },
    rich_text: [
      {
        text: {
          content: `${AUTHOR_PREFIX}${author}]\n${content}`,
        },
      },
    ],
  });
};

// ─── 카테고리 목록 ────────────────────────────────────────────────────────────

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

    return [
      { id: 'all', name: '전체보기' },
      ...Array.from(categorySet).map((category) => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
      })),
    ];
  } catch (error) {
    console.error('Notion에서 카테고리 가져오기 실패:', error);
    return [];
  }
};
