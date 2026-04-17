import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/post/draft', '/projects/draft'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
