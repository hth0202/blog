/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pdfjs-dist가 Node.js 네이티브 canvas 모듈을 참조하는 문제 방지
    config.resolve.alias.canvas = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h — 블로그 이미지는 거의 변경되지 않음
    remotePatterns: [
      { hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com' },
      { hostname: 's3.us-west-2.amazonaws.com' },
      { hostname: 's3-us-west-2.amazonaws.com' },
      { hostname: 'www.notion.so' },
      { hostname: 'picsum.photos' },
      { hostname: 'placehold.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              // Notion external 아이콘/커버는 임의 도메인일 수 있으므로 https: 전체 허용
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https://vitals.vercel-insights.com",
              // YouTube embed + 같은 출처 PDF 프록시 iframe
              "frame-src 'self' https://www.youtube.com",
              // audio 블록 (Notion file/external URL)
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
