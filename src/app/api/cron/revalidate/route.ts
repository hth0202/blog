import { NextResponse } from 'next/server';

import { revalidateAllIfNotionHealthy } from '@/services/revalidate';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Notion이 응답하지 않으면 비우지 않는다 — 기존 페이지를 계속 보여준다
  const revalidated = await revalidateAllIfNotionHealthy();

  return NextResponse.json({ revalidated, at: new Date().toISOString() });
}
