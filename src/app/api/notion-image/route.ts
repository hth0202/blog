import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTNAMES = [
  's3.us-west-2.amazonaws.com',
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3-us-west-2.amazonaws.com',
  'www.notion.so',
];

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

// blockId로 Notion에서 현재 유효한 이미지 S3 URL을 실시간 조회
async function resolveBlockImageUrl(blockId: string): Promise<string | null> {
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
}

// pageId + field('icon'|'cover')로 Notion 페이지 자산 URL을 실시간 조회
async function resolvePageAssetUrl(
  pageId: string,
  field: string,
): Promise<string | null> {
  try {
    const page = await notionClient.pages.retrieve({ page_id: pageId });
    if (field === 'icon' && 'icon' in page && page.icon?.type === 'file') {
      return page.icon.file.url;
    }
    if (field === 'cover' && 'cover' in page && page.cover?.type === 'file') {
      return page.cover.file.url;
    }
    return null;
  } catch {
    return null;
  }
}

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
        'Cache-Control': 'public, max-age=3000, s-maxage=3000',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
