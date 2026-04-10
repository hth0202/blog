import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // unstable_cache 태그 초기화
  revalidateTag('notion-posts');
  revalidateTag('notion-projects');
  revalidateTag('notion-blocks');
  revalidateTag('notion-post-meta');
  revalidateTag('notion-project-meta');
  revalidateTag('notion-markdown');

  // 페이지 ISR 초기화
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
