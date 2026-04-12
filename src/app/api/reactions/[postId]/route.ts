import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const action = body?.action;
    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // postId(32자리 hex) → UUID 복원
    const rawId = postId.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      '$1-$2-$3-$4-$5',
    );

    // 현재 좋아요 수 조회
    const page = await notionClient.pages.retrieve({ page_id: rawId });
    if (!('properties' in page)) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const props = page.properties as Record<
      string,
      { type: string; number?: number | null }
    >;
    const currentLikes =
      props['좋아요']?.type === 'number' ? (props['좋아요'].number ?? 0) : 0;
    const newLikes =
      action === 'add' ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    await notionClient.pages.update({
      page_id: rawId,
      properties: {
        좋아요: { number: newLikes },
      },
    });

    return NextResponse.json({ likes: newLikes });
  } catch (error) {
    console.error('반응 업데이트 실패 (상세):', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
