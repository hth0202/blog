import { format } from 'date-fns';
import { unstable_cache } from 'next/cache';
import { NotionToMarkdown } from 'notion-to-md';
import { cache } from 'react';

import { DATABASE_ID } from '@/services/database';

import type {
  Post,
  Category,
  Project,
  PlaygroundImage,
  Comment,
} from '@/types/blog';

import { parseMidjourneyPrompt } from '@/lib/midjourney';
import { createNotionClient } from '@/lib/notion-client';
import { getNotionFileId } from '@/lib/notion-file-id';

import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

// 공식 API 클라이언트
const notionClient = createNotionClient();

// ─── 목록 캐시 ───────────────────────────────────────────────────────────────
//
// 목록 조회가 Notion 요청 제한(429) 등으로 실패하면 예전에는 빈 목록을 돌려줬고,
// 그 결과가 ISR로 캐시돼 "게시글이 없습니다" 화면이 떴다. 이제 목록 함수는 실패 시
// 오류를 던지고, 이 캐시가 직전에 성공한 목록을 계속 쓴다. 캐시도 없을 때 실패하면
// 오류가 페이지까지 올라가 Next.js가 직전에 생성된 페이지를 그대로 유지한다.
// 요청이 몰려도 목록마다 5분에 한 번만 Notion을 부른다.
// /api/revalidate가 NOTION_LIST_TAG를 비워 새 글을 바로 반영한다.
export const NOTION_LIST_TAG = 'notion-lists';

const cacheNotionList = <Args extends unknown[], Result>(
  fetcher: (...args: Args) => Promise<Result>,
  key: string,
) =>
  unstable_cache(fetcher, [key], {
    revalidate: 300,
    tags: [NOTION_LIST_TAG],
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
  // file 타입: 프록시가 Notion 파일 ID(v)로 Blob에 저장한 사본을 서빙한다
  // (만료되는 S3 URL을 페이지에 넣지 않고, 요청 시점에 Notion을 부르지 않음)
  if (cover.type === 'file') {
    const fileId = cover.file?.url ? getNotionFileId(cover.file.url) : null;
    return `/api/notion-image?pageId=${pageId}&field=cover${fileId ? `&v=${fileId}` : ''}`;
  }
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
  // 자식 fetch 실패는 그대로 던진다 — 내용이 빠진 본문이 캐시되지 않게
  await Promise.all(
    blocks
      .filter(
        (b) =>
          b.has_children &&
          b.type !== 'child_database' &&
          b.type !== 'child_page',
      )
      .map(async (block) => {
        (block as any).children = await _getPageBlocks(block.id);
      }),
  );

  return blocks;
};

export const getPageBlocks = cache(_getPageBlocks);

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
          } else if (pageObj.icon.type === 'file') {
            // 업로드 파일 아이콘의 S3 presigned URL은 약 1시간 뒤 만료됨.
            // about 페이지는 ISR(revalidate=300)로 정적 캐싱되는데 트래픽이
            // 뜸하면 재생성이 늦어져 만료된 URL이 오래 박제될 수 있으므로,
            // /api/notion-image 프록시를 경유한다. 이 프록시는 첫 요청 때만
            // Notion을 조회하고 그 결과를 Vercel Blob에 영구 캐시하므로,
            // 이후로는 S3 만료와 전혀 무관해진다 (src/lib/notion-image-cache.ts).
            iconUrl = `/api/notion-image?pageId=${page.id}&field=icon`;
          } else if (pageObj.icon.type === 'external') {
            // 외부 URL은 만료되지 않으므로 직접 사용
            iconUrl = pageObj.icon.external.url;
          } else if (pageObj.icon.type === 'icon') {
            // Notion 내장 아이콘 라이브러리: www.notion.so는 봇 방어(Cloudflare)가
            // 걸려 있어 서버발 프록시 fetch가 502로 막힘 → 브라우저가 직접 요청하도록 URL 그대로 사용
            const { name, color } = pageObj.icon.icon ?? {};
            iconUrl = name
              ? color
                ? `https://www.notion.so/icons/${name}_${color}.svg`
                : `https://www.notion.so/icons/${name}.svg`
              : null;
          }
        }

        return { id: page.id, title, category, iconUrl, iconEmoji };
      });
  } catch (error) {
    console.error('스킬 DB 조회 실패:', error);
    throw error;
  }
};

export const querySkillDatabase = cache(_querySkillDatabase);

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
  } catch (error) {
    console.error(`스킬 본문 조회 실패: pageId=${pageId}`, error);
    throw error;
  }
};

export const getSkillTextBlocks = cache(_getSkillTextBlocks);

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

export const getPageMarkdown = cache(_getPageMarkdown);

// ─── 공식 API: 포스트 목록 ────────────────────────────────────────────────────

// 'AI 차단' 체크박스. 속성이 없는 DB에서는 false로 처리한다.
const extractBlockAI = (props: Record<string, any>): boolean =>
  props['AI 차단']?.type === 'checkbox'
    ? (props['AI 차단'] as { checkbox: boolean }).checkbox
    : false;

// 'ID'(고유 ID) 번호를 주소로 쓴다. 속성이 없으면 페이지 id로 대체한다.
const extractSlug = (props: Record<string, any>, id: string): string =>
  props['ID']?.type === 'unique_id' && props['ID'].unique_id?.number != null
    ? String(props['ID'].unique_id.number)
    : id;

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
          slug: extractSlug(props, page.id.replace(/-/g, '')),
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
          blockAI: extractBlockAI(props),
        } satisfies Post;
      });

    return posts;
  } catch (error) {
    console.error('Notion에서 포스트 가져오기 실패:', error);
    throw error;
  }
};

export const getPostsFromNotion = cache(
  cacheNotionList(_getPostsFromNotion, 'notion-posts'),
);

// 초안 미리보기용: 캐시 없이 바로 조회한다
export const getPostsFromNotionUncached = cache(_getPostsFromNotion);

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
          slug: extractSlug(props, page.id.replace(/-/g, '')),
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
          blockAI: extractBlockAI(props),
        } satisfies Project;
      });

    return projects;
  } catch (error) {
    console.error('Notion에서 프로젝트 가져오기 실패:', error);
    throw error;
  }
};

export const getProjectsFromNotion = cache(
  cacheNotionList(_getProjectsFromNotion, 'notion-projects'),
);

// 초안 미리보기용: 캐시 없이 바로 조회한다
export const getProjectsFromNotionUncached = cache(_getProjectsFromNotion);

const _getPlaygroundImagesFromNotion = async (): Promise<PlaygroundImage[]> => {
  const images: PlaygroundImage[] = [];
  let cursor: string | undefined;

  try {
    do {
      const response = await notionClient.databases.query({
        database_id: DATABASE_ID.PLAYGROUND,
        page_size: 100,
        filter: {
          and: [
            { property: '상태', status: { equals: '발행' } },
            { property: '카테고리', select: { equals: '이미지' } },
          ],
        },
        ...(cursor ? { start_cursor: cursor } : {}),
      });

      for (const page of response.results) {
        if (
          !('properties' in page) ||
          !('cover' in page) ||
          !page.cover ||
          !('created_time' in page)
        )
          continue;
        const props = page.properties as Record<
          string,
          {
            type: string;
            title?: { plain_text: string }[];
            rich_text?: { plain_text: string }[];
            date?: { start: string } | null;
            number?: number | null;
          }
        >;
        const imageUrl = extractCoverUrl(page.cover, page.id, '');
        if (!imageUrl) continue;

        const promptProperty = props['프롬프트'] ?? props['설명'];
        const prompt =
          promptProperty?.type === 'rich_text'
            ? extractText(promptProperty.rich_text ?? [])
            : '';
        const rawDate =
          props['날짜']?.type === 'date'
            ? (props['날짜'].date?.start ?? page.created_time)
            : page.created_time;

        images.push({
          id: page.id.replace(/-/g, ''),
          slug: extractSlug(props, page.id.replace(/-/g, '')),
          title:
            (props['제목']?.type === 'title'
              ? extractText(props['제목'].title ?? [])
              : '') || '이미지',
          category: '이미지',
          imageUrl,
          prompt,
          date: format(new Date(rawDate), 'yyyy.MM.dd'),
          isoDate: rawDate,
          views:
            props['조회수']?.type === 'number'
              ? (props['조회수'].number ?? 0)
              : 0,
          copies:
            props['복사수']?.type === 'number'
              ? (props['복사수'].number ?? 0)
              : 0,
          meta: parseMidjourneyPrompt(prompt),
        });
      }

      cursor = response.has_more
        ? (response.next_cursor ?? undefined)
        : undefined;
    } while (cursor);
  } catch (error) {
    // 실패를 빈 목록으로 캐시하지 않도록 그대로 던진다
    console.error('놀이터 이미지 가져오기 실패:', error);
    throw error;
  }

  return images;
};

export const getPlaygroundImagesFromNotion = cache(
  cacheNotionList(_getPlaygroundImagesFromNotion, 'notion-playground-images'),
);

// 안전한 전체 갱신(services/revalidate.ts)이 캐시 없이 조회할 때 쓴다
export const getPlaygroundImagesFromNotionUncached = cache(
  _getPlaygroundImagesFromNotion,
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
      slug: extractSlug(props, postId),
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
      blockAI: extractBlockAI(props),
    };
  } catch (error: any) {
    if (error?.status === 404 || error?.code === 'object_not_found') {
      return undefined;
    }
    console.error('Notion에서 포스트 메타 가져오기 실패:', error);
    throw error;
  }
};

export const getPostMetaById = cache(_getPostMetaById);

// ─── 주소(번호 또는 페이지 id)로 조회 ─────────────────────────────────────────

// 숫자 주소는 'ID' 번호로 페이지를 찾아 32자리 id를 돌려준다.
const findIdBySlug = async (
  databaseId: string,
  slug: string,
): Promise<string | undefined> => {
  if (!/^\d+$/.test(slug)) return slug;
  if (!databaseId) return undefined;
  const response = await notionClient.databases.query({
    database_id: databaseId,
    filter: { property: 'ID', unique_id: { equals: Number(slug) } },
    page_size: 1,
  });
  return response.results[0]?.id.replace(/-/g, '');
};

export const getPostMetaBySlug = cache(
  async (slug: string): Promise<Post | undefined> => {
    const id = await findIdBySlug(NOTION_POST_DATABASE_ID, slug);
    return id ? getPostMetaById(id) : undefined;
  },
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
      slug: extractSlug(props, projectId),
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
      blockAI: extractBlockAI(props),
    } satisfies Project;
  } catch (error: any) {
    if (error?.status === 404 || error?.code === 'object_not_found') {
      return undefined;
    }
    console.error('Notion에서 프로젝트 메타 가져오기 실패:', error);
    throw error;
  }
};

export const getProjectMetaById = cache(_getProjectMetaById);

export const getProjectMetaBySlug = cache(
  async (slug: string): Promise<Project | undefined> => {
    const id = await findIdBySlug(NOTION_PROJECTS_DATABASE_ID, slug);
    return id ? getProjectMetaById(id) : undefined;
  },
);

// ─── 페이지 발행 상태 확인 (포스트/프로젝트 공용) ──────────────────────────────

export async function isPagePublished(rawId: string): Promise<boolean> {
  try {
    const page = await notionClient.pages.retrieve({ page_id: rawId });
    if (!('properties' in page)) return false;
    const statusProp = (page.properties as Record<string, any>)['상태'];
    const name =
      statusProp?.type === 'status'
        ? statusProp.status?.name
        : statusProp?.type === 'select'
          ? statusProp.select?.name
          : undefined;
    return name === '발행';
  } catch {
    return false;
  }
}

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
