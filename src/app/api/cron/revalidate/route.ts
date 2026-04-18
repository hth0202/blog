import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  revalidateTag('notion-posts');
  revalidateTag('notion-projects');
  revalidateTag('notion-blocks');
  revalidateTag('notion-post-meta');
  revalidateTag('notion-project-meta');
  revalidateTag('notion-markdown');
  revalidatePath('/', 'layout');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
