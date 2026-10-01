import { NextRequest, NextResponse } from 'next/server';

import { revalidateAllIfNotionHealthy } from '@/services/revalidate';

import { clearSkillIconCache } from '@/lib/notion-image-cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Notion에서 역량 아이콘 자체를 교체했을 때만 필요 — Vercel Blob에 영구
  // 캐시된 사본을 비워 다음 요청에서 새로 받아오도록 한다.
  let clearedIcons: number | undefined;
  if (request.nextUrl.searchParams.get('icons') === '1') {
    clearedIcons = await clearSkillIconCache();
  }

  // 5분 캐시된 글·프로젝트·놀이터 목록까지 비워 새 글을 바로 반영한다.
  // Notion이 응답하지 않으면 비우지 않는다 — 기존 페이지를 계속 보여준다
  if (!(await revalidateAllIfNotionHealthy())) {
    return NextResponse.json(
      { revalidated: false, reason: 'Notion 응답 실패 — 기존 캐시 유지' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    revalidated: true,
    at: new Date().toISOString(),
    ...(clearedIcons !== undefined && { clearedIcons }),
  });
}
