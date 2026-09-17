import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

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

  revalidatePath('/', 'layout');

  return NextResponse.json({
    revalidated: true,
    at: new Date().toISOString(),
    ...(clearedIcons !== undefined && { clearedIcons }),
  });
}
