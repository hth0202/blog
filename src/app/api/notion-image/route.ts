import { unstable_cache } from 'next/cache';

import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTNAMES = [
  's3.us-west-2.amazonaws.com',
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3-us-west-2.amazonaws.com',
  'www.notion.so',
];

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

// blockId로 Notion에서 현재 유효한 이미지 S3 URL을 조회 (30분 캐시)
const resolveBlockImageUrl = unstable_cache(
  async (blockId: string): Promise<string | null> => {
    try {
      const block = await notionClient.blocks.retrieve({ block_id: blockId });
      if (!('type' in block)) return null;
      if (block.type === 'image' && block.image.type === 'file') {
        return block.image.file.url;
      }
      return null;
    } catch {
      return null;
    }
  },
  ['notion-block-image-url'],
  { revalidate: 1800 }, // 30분
);

// pageId + field('icon'|'cover')로 Notion 페이지 자산 URL을 조회 (30분 캐시)
const resolvePageAssetUrl = unstable_cache(
  async (pageId: string, field: string): Promise<string | null> => {
    try {
      const page = await notionClient.pages.retrieve({ page_id: pageId });
      if (field === 'icon' && 'icon' in page) {
        const icon = page.icon as any;
        if (icon?.type === 'file') return icon.file.url;
        if (icon?.type === 'external') return icon.external.url;
        // Notion 내장 아이콘 (type: 'icon') — 안정적 CDN URL 반환
        if (icon?.type === 'icon') {
          const { name, color } = icon.icon ?? {};
          if (name) {
            return color
              ? `https://www.notion.so/icons/${name}_${color}.svg`
              : `https://www.notion.so/icons/${name}.svg`;
          }
        }
      }
      if (field === 'cover' && 'cover' in page) {
        if (page.cover?.type === 'file') return page.cover.file.url;
        if (page.cover?.type === 'external') return page.cover.external.url;
      }
      console.warn(
        `[notion-image] unhandled asset: pageId=${pageId} field=${field}`,
        JSON.stringify((page as any)[field]),
      );
      return null;
    } catch (e) {
      console.error(
        `[notion-image] resolvePageAssetUrl failed: pageId=${pageId} field=${field}`,
        e,
      );
      return null;
    }
  },
  ['notion-page-asset-url'],
  { revalidate: 1800 }, // 30분
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const blockId = searchParams.get('blockId');
  const pageId = searchParams.get('pageId');
  const field = searchParams.get('field'); // 'icon' | 'cover'
  const url = searchParams.get('url');

  let imageUrl: string | null = null;

  if (blockId) {
    // blockId 방식: 블로그 본문 이미지 — 요청 시점에 신선한 URL 조회
    imageUrl = await resolveBlockImageUrl(blockId);
    if (!imageUrl) {
      return new NextResponse('Block not found or not a file image', {
        status: 404,
      });
    }
  } else if (pageId && field) {
    // pageId + field 방식: 페이지 아이콘·커버 — 요청 시점에 신선한 URL 조회
    imageUrl = await resolvePageAssetUrl(pageId, field);
    if (!imageUrl) {
      return new NextResponse(`Page ${field} not found or not a file`, {
        status: 404,
      });
    }
  } else if (url) {
    // url 방식: external 이미지 또는 레거시 호환용
    try {
      const decoded = decodeURIComponent(url);
      const hostname = new URL(decoded).hostname;
      if (
        !ALLOWED_HOSTNAMES.some(
          (h) => hostname === h || hostname.endsWith(`.${h}`),
        )
      ) {
        return new NextResponse('Forbidden', { status: 403 });
      }
      imageUrl = decoded;
    } catch {
      return new NextResponse('Invalid url', { status: 400 });
    }
  } else {
    return new NextResponse('Missing blockId, pageId+field, or url parameter', {
      status: 400,
    });
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new NextResponse('Upstream error', { status: 502 });
    }

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        // S3 pre-signed URL 만료(1h) 전에 CDN/브라우저 캐시를 비움 — 50분
        'Cache-Control':
          'public, max-age=3000, s-maxage=3000, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
