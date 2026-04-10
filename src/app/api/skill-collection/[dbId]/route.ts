import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dbId: string }> },
) {
  const { dbId } = await params;

  try {
    const response = await notionClient.databases.query({
      database_id: dbId,
      page_size: 100,
    });

    const items = response.results
      .filter(
        (page): page is typeof page & { properties: Record<string, unknown> } =>
          'properties' in page,
      )
      .map((page) => {
        const props = page.properties as Record<string, any>;

        // 제목 프로퍼티 (type === 'title')
        const titleProp = Object.values(props).find((p: any) => p.type === 'title');
        const title: string =
          titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '';

        // 카테고리 프로퍼티 (type === 'select')
        const selectProp = Object.values(props).find((p: any) => p.type === 'select');
        const category: string = selectProp?.select?.name ?? '';

        // 아이콘
        const pageObj = page as any;
        let iconUrl: string | null = null;
        let iconEmoji: string | null = null;

        if (pageObj.icon) {
          if (pageObj.icon.type === 'emoji') {
            iconEmoji = pageObj.icon.emoji;
          } else if (pageObj.icon.type === 'external') {
            iconUrl = pageObj.icon.external.url;
          } else if (pageObj.icon.type === 'file') {
            iconUrl = pageObj.icon.file.url;
          }
        }

        return { id: page.id, title, category, iconUrl, iconEmoji };
      });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('스킬 DB 조회 실패:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
