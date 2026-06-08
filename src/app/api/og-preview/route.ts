import { NextRequest, NextResponse } from 'next/server';

import { fetchOgMeta } from '@/lib/og';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ label: null });

  try {
    new URL(url); // validate
    const meta = await fetchOgMeta(url);
    if (!meta.title) return NextResponse.json({ label: null });

    const siteName =
      meta.siteName || new URL(url).hostname.replace(/^www\./, '');
    const raw = `${siteName} | ${meta.title}`;
    const label = raw.length > 60 ? raw.slice(0, 60) + '…' : raw;
    return NextResponse.json({ label });
  } catch {
    return NextResponse.json({ label: null });
  }
}
