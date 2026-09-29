import {
  getPostsFromNotion,
  getProjectsFromNotion,
} from '@/services/notion-api';

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taffy-story.com';

export const revalidate = 300;

// AI 학습·검색용 크롤러 user-agent 목록
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'Amazonbot',
  'cohere-ai',
];

const DEFAULT_DISALLOW = ['/api/', '/post/draft', '/projects/draft'];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [posts, projects] = await Promise.all([
    getPostsFromNotion(),
    getProjectsFromNotion(),
  ]);
  const aiBlockedPaths = [
    ...posts.filter((p) => p.blockAI).map((p) => `/post/${p.id}`),
    ...projects.filter((p) => p.blockAI).map((p) => `/projects/${p.id}`),
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DEFAULT_DISALLOW,
      },
      // 크롤러는 자신과 일치하는 그룹만 따르므로 기본 disallow도 함께 넣는다.
      {
        userAgent: AI_BOTS,
        allow: '/',
        disallow: [...DEFAULT_DISALLOW, ...aiBlockedPaths],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
