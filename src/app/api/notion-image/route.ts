import { NextRequest, NextResponse } from 'next/server';

import {
  fetchAndCacheSkillIcon,
  getCachedSkillIconUrl,
  resolveBlockFileUrl,
  resolvePageAssetUrl,
} from '@/lib/notion-image-cache';

const ALLOWED_HOSTNAMES = [
  's3.us-west-2.amazonaws.com',
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3-us-west-2.amazonaws.com',
  'www.notion.so',
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const blockId = searchParams.get('blockId');
  const pageId = searchParams.get('pageId');
  const field = searchParams.get('field'); // 'icon' | 'cover'
  const url = searchParams.get('url');

  if (pageId && field === 'icon') {
    // 역량 아이콘: Vercel Blob에 영구 캐시된 사본이 있으면 그쪽으로 리다이렉트
    // (Notion에 전혀 의존하지 않음 — 자세한 배경은 notion-image-cache.ts 참고)
    const cachedUrl = await getCachedSkillIconUrl(pageId);
    if (cachedUrl) {
      return NextResponse.redirect(cachedUrl, {
        status: 307,
        headers: { 'Cache-Control': 'public, max-age=86400' },
      });
    }

    const fresh = await fetchAndCacheSkillIcon(pageId);
    if (!fresh) {
      return new NextResponse('Page icon not found or not a file', {
        status: 404,
      });
    }

    return new NextResponse(new Uint8Array(fresh.buffer), {
      headers: {
        'Content-Type': fresh.contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  let imageUrl: string | null = null;

  if (blockId) {
    // blockId 방식: 블로그 본문 이미지·PDF — 요청 시점에 신선한 URL 조회
    imageUrl = await resolveBlockFileUrl(blockId);
    if (!imageUrl) {
      return new NextResponse('Block not found or not a file asset', {
        status: 404,
      });
    }
  } else if (pageId && field) {
    // pageId + field 방식 (cover 등): 요청 시점에 신선한 URL 조회
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

    const contentType = res.headers.get('Content-Type') || 'image/jpeg';
    const isPdf = contentType.includes('pdf');

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': contentType,
        // iframe 안에서 렌더링되도록 인라인 표시 강제
        'Content-Disposition': 'inline',
        // S3의 X-Frame-Options: DENY 를 SAMEORIGIN으로 덮어 iframe 허용
        'X-Frame-Options': isPdf ? 'SAMEORIGIN' : 'DENY',
        // S3 pre-signed URL 만료(1h) 전에 CDN/브라우저 캐시를 비움 — 50분
        'Cache-Control': 'public, max-age=3000, s-maxage=3000',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
