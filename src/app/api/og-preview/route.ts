import dns from 'node:dns/promises';
import net from 'node:net';

import { NextRequest, NextResponse } from 'next/server';

import { fetchOgMeta } from '@/lib/og';

// ─── SSRF 방지 ──────────────────────────────────────────────────────────────
// 이 라우트는 서버에서만 실행되므로 node:dns/net을 안전하게 쓸 수 있음
// (og.ts는 클라이언트 컴포넌트 트리에서도 import되므로 Node 전용 API를 두면 안 됨)

function isDisallowedIp(ip: string): boolean {
  const type = net.isIP(ip);
  if (type === 4) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local (incl. cloud metadata)
    if (a === 0) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    if (a >= 224) return true; // multicast/reserved
    return false;
  }
  if (type === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true; // loopback
    if (/^f[cd]/.test(lower)) return true; // unique local fc00::/7
    if (/^fe[89ab]/.test(lower)) return true; // link-local fe80::/10
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isDisallowedIp(mapped[1]);
    return false;
  }
  return true; // unresolvable IP type — block to be safe
}

async function assertPublicHttpUrl(urlStr: string): Promise<void> {
  const url = new URL(urlStr);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('protocol not allowed');
  }
  const hostname = url.hostname;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('host not allowed');
  }
  if (net.isIP(hostname)) {
    if (isDisallowedIp(hostname)) throw new Error('host not allowed');
    return;
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0 || records.some((r) => isDisallowedIp(r.address))) {
    throw new Error('host not allowed');
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ label: null });

  try {
    new URL(url); // validate
    await assertPublicHttpUrl(url);
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
