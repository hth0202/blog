import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// IP+postId 조합 기준, 1시간에 1번만 실제 카운트
const WINDOW_MS = 60 * 60 * 1000; // 1시간
const viewStore = new Map<string, number>(); // key: ip:postId → resetAt

function isViewRateLimited(ip: string, postId: string): boolean {
  const key = `${ip}:${postId}`;
  const now = Date.now();
  const resetAt = viewStore.get(key);
  if (resetAt && now < resetAt) return true;
  viewStore.set(key, now + WINDOW_MS);
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const ip = getClientIp(request);

    const rawId = postId.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      '$1-$2-$3-$4-$5',
    );

    const page = await notionClient.pages.retrieve({ page_id: rawId });
    if (!('properties' in page)) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const props = page.properties as Record<
      string,
      { type: string; number?: number | null }
    >;
    const currentViews =
      props['조회수']?.type === 'number' ? (props['조회수'].number ?? 0) : 0;

    // rate limit 초과 시 카운트 없이 현재 값 반환 (UX 영향 없음)
    if (isViewRateLimited(ip, postId)) {
      return NextResponse.json({ views: currentViews });
    }

    await notionClient.pages.update({
      page_id: rawId,
      properties: {
        조회수: { number: currentViews + 1 },
      },
    });

    return NextResponse.json({ views: currentViews + 1 });
  } catch (error) {
    console.error('조회수 업데이트 실패:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
