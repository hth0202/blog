import type { MetadataRoute } from 'next';

const BASE_URL = 'https://hth-blog.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/post/draft'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
