import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    const rawId = postId.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      '$1-$2-$3-$4-$5',
    );

    const page = await notionClient.pages.retrieve({ page_id: rawId });
    if (!('properties' in page)) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const props = page.properties as Record<string, { type: string; number?: number | null }>;
    const currentViews = props['조회수']?.type === 'number' ? (props['조회수'].number ?? 0) : 0;

    await notionClient.pages.update({
      page_id: rawId,
      properties: {
        '조회수': { number: currentViews + 1 },
      },
    });

    return NextResponse.json({ views: currentViews + 1 });
  } catch (error) {
    console.error('조회수 업데이트 실패:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
