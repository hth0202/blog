import { Client } from '@notionhq/client';
import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });

const getSkillTextBlocks = unstable_cache(
  async (pageId: string): Promise<string[]> => {
    const response = await notionClient.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    return response.results
      .filter(
        (block): block is typeof block & { type: string } => 'type' in block,
      )
      .flatMap((block: any) => {
        const type: string = block.type;
        if (
          !['bulleted_list_item', 'numbered_list_item', 'paragraph'].includes(
            type,
          )
        )
          return [];
        const richText = block[type]?.rich_text ?? [];
        const text: string = richText.map((t: any) => t.plain_text).join('');
        return text ? [text] : [];
      });
  },
  ['notion-skill-text'],
  { revalidate: 600 },
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;

  try {
    const textBlocks = await getSkillTextBlocks(pageId);
    return NextResponse.json({ textBlocks });
  } catch (error) {
    console.error('페이지 블록 조회 실패:', error);
    return NextResponse.json({ textBlocks: [] }, { status: 500 });
  }
}
