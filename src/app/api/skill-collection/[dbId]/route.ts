import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dbId: string }> },
) {
  const { dbId } = await params;

  if (!UUID_RE.test(dbId)) {
    return NextResponse.json({ error: 'Invalid database ID' }, { status: 400 });
  }

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
        const titleProp = Object.values(props).find(
          (p: any) => p.type === 'title',
        );
        const title: string =
          titleProp?.title?.map((t: any) => t.plain_text).join('') ?? '';

        // 카테고리 프로퍼티 (type === 'select')
        const selectProp = Object.values(props).find(
          (p: any) => p.type === 'select',
        );
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
          } else if (pageObj.icon.type === 'icon') {
            const { name, color } = pageObj.icon.icon ?? {};
            if (name) {
              iconUrl = color
                ? `https://www.notion.so/icons/${name}_${color}.svg`
                : `https://www.notion.so/icons/${name}.svg`;
            }
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
