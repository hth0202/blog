import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const notionClient = new Client({ auth: process.env.NOTION_AUTH_TOKEN });
  const dbId = process.env.NOTION_PROJECTS_DATABASE_ID || '';

  try {
    const response = await notionClient.databases.query({
      database_id: dbId,
    });
    return NextResponse.json({
      dbId,
      count: response.results.length,
      results: response.results.map((p: any) => ({
        id: p.id,
        status: p.properties?.['상태'],
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        dbId,
        error: error?.message,
        code: error?.code,
      },
      { status: 500 },
    );
  }
}
