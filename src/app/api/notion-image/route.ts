import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTNAMES = [
  's3.us-west-2.amazonaws.com',
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3-us-west-2.amazonaws.com',
  'www.notion.so',
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(url);
    const hostname = new URL(decodedUrl).hostname;
    if (
      !ALLOWED_HOSTNAMES.some(
        (h) => hostname === h || hostname.endsWith(`.${h}`),
      )
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  try {
    const res = await fetch(decodedUrl);
    if (!res.ok) {
      return new NextResponse('Upstream error', { status: 502 });
    }

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        // S3 pre-signed URL 만료(1h) 전에 캐시를 비움 — 50분
        'Cache-Control': 'public, max-age=3000, s-maxage=3000',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
