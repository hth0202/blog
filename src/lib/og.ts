type OgMeta = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
};

function extractMeta(html: string, url: string): OgMeta {
  const get = (pattern: RegExp) => pattern.exec(html)?.[1]?.trim();

  const title =
    get(/property="og:title"\s+content="([^"]*)"/) ||
    get(/content="([^"]*)"\s+property="og:title"/) ||
    get(/<title[^>]*>([^<]+)<\/title>/i);

  const description =
    get(/property="og:description"\s+content="([^"]*)"/) ||
    get(/content="([^"]*)"\s+property="og:description"/) ||
    get(/name="description"\s+content="([^"]*)"/) ||
    get(/content="([^"]*)"\s+name="description"/);

  const image =
    get(/property="og:image"\s+content="([^"]*)"/) ||
    get(/content="([^"]*)"\s+property="og:image"/);

  const siteName =
    get(/property="og:site_name"\s+content="([^"]*)"/) ||
    get(/content="([^"]*)"\s+property="og:site_name"/);

  const origin = new URL(url).origin;
  const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;

  const resolveImage = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith('http')) return src;
    if (src.startsWith('//')) return `https:${src}`;
    if (src.startsWith('/')) return `${origin}${src}`;
    return src;
  };

  return {
    title: title ? decodeHtmlEntities(title) : undefined,
    description: description ? decodeHtmlEntities(description) : undefined,
    image: resolveImage(image),
    siteName: siteName ? decodeHtmlEntities(siteName) : undefined,
    favicon,
  };
}

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export async function fetchOgMeta(url: string): Promise<OgMeta> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://hth.dev)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'manual',
      next: { revalidate: 86400 },
    });
    if (!res.ok) return {};
    const html = await res.text();
    return extractMeta(html, url);
  } catch {
    return {};
  }
}
