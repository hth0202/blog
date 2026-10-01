import { NextRequest, NextResponse } from 'next/server';

import { DATABASE_ID } from '@/services/database';

import { createNotionClient } from '@/lib/notion-client';

const notion = createNotionClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const { imageId } = await params;
  if (!/^[a-f\d]{32}$/i.test(imageId)) {
    return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const page = await notion.pages.retrieve({ page_id: imageId });
    if (
      !('properties' in page) ||
      page.parent.type !== 'database_id' ||
      page.parent.database_id.replace(/-/g, '') !== DATABASE_ID.PLAYGROUND
    ) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const prompt = page.properties['프롬프트'] ?? page.properties['설명'];
    if (
      page.properties['상태']?.type !== 'status' ||
      page.properties['상태'].status?.name !== '발행' ||
      page.properties['카테고리']?.type !== 'select' ||
      page.properties['카테고리'].select?.name !== '이미지' ||
      prompt?.type !== 'rich_text' ||
      !prompt.rich_text.length
    ) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const count = page.properties['복사수'];
    if (count?.type !== 'number') {
      return NextResponse.json(
        { error: 'Copy count is not configured' },
        { status: 500 },
      );
    }

    const copies = (count.number ?? 0) + 1;
    // ponytail: Notion has no atomic increment; use an atomic store if concurrent copies become frequent.
    await notion.pages.update({
      page_id: page.id,
      properties: { 복사수: { number: copies } },
    });
    return NextResponse.json({ copies });
  } catch (error) {
    console.error('프롬프트 복사수 업데이트 실패:', error);
    return NextResponse.json(
      { error: 'Copy count update failed' },
      { status: 500 },
    );
  }
}
