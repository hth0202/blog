import { NextRequest, NextResponse } from 'next/server';

import {
  createPageComment,
  getPageComments,
} from '@/services/notion-api';

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// IP당 WINDOW_MS 내 MAX_REQUESTS회 초과 시 차단
const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS = 5;

const ipStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now > entry.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;

  entry.count += 1;
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveRawId(postId: string): string {
  return postId.replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    '$1-$2-$3-$4-$5',
  );
}

// ─── GET /api/comments/[postId] ───────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const rawId = resolveRawId(postId);
  const comments = await getPageComments(rawId);
  return NextResponse.json(comments);
}

// ─── POST /api/comments/[postId] ──────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  // Rate Limiting
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '잠시 후 다시 시도해주세요. (10분에 최대 5개)' },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);

  // Honeypot: 봇이 채우는 숨겨진 필드가 비어 있어야 정상
  if (body?.website) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const author = typeof body?.author === 'string' ? body.author.trim() : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!author || !content) {
    return NextResponse.json(
      { error: '이름과 댓글 내용을 모두 입력해주세요.' },
      { status: 400 },
    );
  }
  if (author.length > 50) {
    return NextResponse.json({ error: '이름은 50자 이하로 입력해주세요.' }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: '댓글은 1000자 이하로 입력해주세요.' }, { status: 400 });
  }

  const { postId } = await params;
  const rawId = resolveRawId(postId);

  await createPageComment(rawId, author, content);
  return NextResponse.json({ success: true }, { status: 201 });
}
