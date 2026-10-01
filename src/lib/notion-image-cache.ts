import { del, list, put } from '@vercel/blob';

import { createNotionClient } from './notion-client';
import { getNotionFileId } from './notion-file-id';

const notionClient = createNotionClient();

// blockId로 Notion에서 현재 유효한 파일(이미지·PDF 등) S3 URL을 실시간 조회
export async function resolveBlockFileUrl(
  blockId: string,
): Promise<string | null> {
  try {
    const block = await notionClient.blocks.retrieve({ block_id: blockId });
    if (!('type' in block)) return null;
    if (block.type === 'image' && block.image.type === 'file') {
      return block.image.file.url;
    }
    if (block.type === 'pdf' && block.pdf.type === 'file') {
      return block.pdf.file.url;
    }
    return null;
  } catch {
    return null;
  }
}

// pageId + field('icon'|'cover')로 Notion 페이지 자산 URL을 실시간 조회
export async function resolvePageAssetUrl(
  pageId: string,
  field: string,
): Promise<string | null> {
  try {
    const page = await notionClient.pages.retrieve({ page_id: pageId });
    if (field === 'icon' && 'icon' in page) {
      const icon = page.icon as any;
      if (icon?.type === 'file') return icon.file.url;
      if (icon?.type === 'external') return icon.external.url;
      // Notion 내장 아이콘 (type: 'icon') — 안정적 CDN URL 반환
      if (icon?.type === 'icon') {
        const { name, color } = icon.icon ?? {};
        if (name) {
          return color
            ? `https://www.notion.so/icons/${name}_${color}.svg`
            : `https://www.notion.so/icons/${name}.svg`;
        }
      }
    }
    if (field === 'cover' && 'cover' in page) {
      if (page.cover?.type === 'file') return page.cover.file.url;
      if (page.cover?.type === 'external') return page.cover.external.url;
    }
    console.warn(
      `[notion-image] unhandled asset: pageId=${pageId} field=${field}`,
      JSON.stringify((page as any)[field]),
    );
    return null;
  } catch (e) {
    console.error(
      `[notion-image] resolvePageAssetUrl failed: pageId=${pageId} field=${field}`,
      e,
    );
    return null;
  }
}

// ─── 역량(스킬) 아이콘 전용: Vercel Blob 영구 캐시 ──────────────────────────
//
// 스킬 아이콘은 Notion 쪽에서 거의 바뀌지 않는 고정 자산인데, Notion이 내려주는
// URL은 두 종류 다 런타임에 죽는 문제가 있었다:
//   - 업로드 파일 아이콘의 S3 presigned URL: 발급 후 약 1시간 뒤 만료
//   - Notion 내장 아이콘(www.notion.so/icons/...): 서버(Vercel 함수)발 요청이
//     Cloudflare 봇 방어에 막혀 502가 남 (브라우저 직접 요청은 정상)
// about 페이지는 ISR(revalidate=300)로 정적 캐싱되므로, 트래픽이 뜸하면
// 재생성이 늦어져 만료된 URL이 그대로 방치되는 일이 반복됐다.
//
// 근본 해결: 아이콘을 한 번 Notion에서 받아와 Vercel Blob에 영구 저장해두고,
// 그 뒤로는 Notion에 전혀 의존하지 않고 Blob에서만 서빙한다. Blob URL은
// 만료도 없고 봇 방어도 없으므로 이 클래스의 버그가 구조적으로 재발할 수 없다.
// Notion에서 아이콘 자체를 교체한 경우에만 /api/revalidate?icons=1 로 캐시를
// 수동 비우면 된다.
const SKILL_ICON_BLOB_PREFIX = 'skill-icons/';

export async function getCachedSkillIconUrl(
  pageId: string,
): Promise<string | null> {
  try {
    const { blobs } = await list({
      prefix: `${SKILL_ICON_BLOB_PREFIX}${pageId}`,
      limit: 1,
    });
    return blobs[0]?.url ?? null;
  } catch (e) {
    console.error(`[notion-image] blob lookup failed: pageId=${pageId}`, e);
    return null;
  }
}

export async function fetchAndCacheSkillIcon(
  pageId: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const freshUrl = await resolvePageAssetUrl(pageId, 'icon');
  if (!freshUrl) return null;

  const res = await fetch(freshUrl);
  if (!res.ok) return null;

  const contentType = res.headers.get('Content-Type') || 'image/png';
  const buffer = Buffer.from(await res.arrayBuffer());

  try {
    await put(`${SKILL_ICON_BLOB_PREFIX}${pageId}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });
  } catch (e) {
    // 캐시 저장에 실패해도 이번 요청은 정상 응답한다 — 다음 요청에서 다시 시도됨
    console.error(
      `[notion-image] blob cache write failed: pageId=${pageId}`,
      e,
    );
  }

  return { buffer, contentType };
}

// Notion에서 아이콘을 실제로 교체했을 때 수동으로 캐시를 비우기 위한 함수
export async function clearSkillIconCache(): Promise<number> {
  const { blobs } = await list({ prefix: SKILL_ICON_BLOB_PREFIX });
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url));
  }
  return blobs.length;
}

// ─── Notion 파일 이미지(커버·본문): Vercel Blob 영구 캐시 ───────────────────
//
// Notion이 주는 파일 URL은 약 1시간 뒤 만료되고, 요청 시점에 새 URL을 받으려면
// 매번 Notion을 불러야 한다. 그래서 캐시된 옛 페이지에서는 이미지가 깨지고,
// 요청이 몰리면 Notion 요청 제한으로 썸네일이 깨졌다. 처음 한 번만 원본을 받아
// Blob에 저장하고, 그 뒤로는 Notion 없이 Blob에서만 서빙한다.
//
// 사진은 긴 변 2048px WebP로 줄여 저장한다 (놀이터 원본 7MB → 약 500KB).
// 움직이는 GIF와 SVG는 변환하면 망가지므로 원본 그대로 저장한다.
//
// 저장 키는 Notion 파일 ID(S3 경로의 두 번째 부분)라 이미지를 바꾸면 새 키로
// 자동 저장된다. Blob 주소는 토큰의 스토어 ID로 바로 만들 수 있어서 조회에
// list() 같은 연산을 쓰지 않는다 (Hobby 한도 절약).
const FILE_BLOB_PREFIX = 'notion-files/';
const IMAGE_MAX_SIZE = 2048;
const KEEP_ORIGINAL_TYPES = ['image/gif', 'image/svg+xml'];

export type CachedFile = { body: ArrayBuffer | Buffer; contentType: string };

const getFileBlobUrl = (fileId: string) => {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split('_')[3];
  return storeId
    ? `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/${FILE_BLOB_PREFIX}${fileId}`
    : null;
};

export async function getCachedFile(
  fileId: string,
): Promise<CachedFile | null> {
  const url = getFileBlobUrl(fileId);
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return {
      body: await res.arrayBuffer(),
      contentType: res.headers.get('Content-Type') || 'image/webp',
    };
  } catch {
    return null;
  }
}

// freshUrl: 요청 시점에 Notion에서 받은 파일 URL. 파일 ID가 다르면(이미지가
// 바뀌었거나 잘못된 요청) 저장하지 않는다
export async function fetchAndCacheFile(
  fileId: string,
  freshUrl: string | null,
): Promise<CachedFile | null> {
  if (!freshUrl || getNotionFileId(freshUrl) !== fileId) return null;

  const res = await fetch(freshUrl);
  if (!res.ok) return null;

  const original = Buffer.from(await res.arrayBuffer());
  const originalType = (res.headers.get('Content-Type') || '').split(';')[0];
  // 이미지가 아닌 파일(PDF 등)은 이 캐시 대상이 아니다
  if (!originalType.startsWith('image/')) return null;
  let file: { body: Buffer; contentType: string };
  if (KEEP_ORIGINAL_TYPES.includes(originalType)) {
    file = { body: original, contentType: originalType };
  } else {
    const { default: sharp } = await import('sharp');
    file = {
      body: await sharp(original)
        .rotate()
        .resize(IMAGE_MAX_SIZE, IMAGE_MAX_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer(),
      contentType: 'image/webp',
    };
  }

  try {
    await put(`${FILE_BLOB_PREFIX}${fileId}`, file.body, {
      access: 'public',
      contentType: file.contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (e) {
    // 캐시 저장에 실패해도 이번 요청은 정상 응답한다 — 다음 요청에서 다시 시도됨
    console.error(
      `[notion-image] file cache write failed: fileId=${fileId}`,
      e,
    );
  }

  return file;
}
