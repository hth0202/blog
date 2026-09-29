import {
  getPostsFromNotion,
  getPlaygroundImagesFromNotion,
  getProjectsFromNotion,
} from '@/services/notion-api';

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects, images] = await Promise.all([
    getPostsFromNotion(),
    getProjectsFromNotion(),
    getPlaygroundImagesFromNotion(),
  ]);

  const postEntries = posts
    .filter((p) => p.status === '발행')
    .map((p) => ({
      url: `${BASE_URL}/post/${p.id}`,
      lastModified: p.isoDate ? new Date(p.isoDate) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const projectEntries = projects
    .filter((p) => p.status === '발행')
    .map((p) => ({
      url: `${BASE_URL}/projects/${p.id}`,
      lastModified: p.date ? new Date(p.date.replace(/\./g, '-')) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/post`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/playground`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...postEntries,
    ...projectEntries,
    ...images.map((image) => ({
      url: `${BASE_URL}/playground/${image.id}`,
      lastModified: new Date(image.isoDate),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
