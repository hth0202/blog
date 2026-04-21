/** @type {import('next').NextConfig} */
const nextConfig = {
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
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
